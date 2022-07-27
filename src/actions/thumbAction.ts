import BasicAction from './basicAction';
import Joi from 'joi';
import HttpError from '../errors/httpError';
import Thumbnail, {TThumbMode, TThumbQuality, TThumbRatio} from '../components/thumbnail';

export default class ThumbAction extends BasicAction{
	async process() {
		const params = this.validateParams();
		const query = this.validateQuery();

		const thumbnail = new Thumbnail(params.imgPath, query.mode, query['max-size']);
		if (query.q)
			thumbnail.setQuality(query.q);

		if (query.grayscale)
			thumbnail.setGrayscale(true);

		if (query.blur)
			thumbnail.setBlur(query.blur);

		if (query.ratio)
			thumbnail.setRatio(query.ratio);

		if (query.pad)
			thumbnail.setPad(true);

		if (query.bg)
			thumbnail.setBackground(query.bg);

		const thumb = await thumbnail.getThumb();

		this.response.setHeader('Cache-Control', 'public, max-age=86400');
		this.response.sendFile(thumb.absolutePath);

		await Promise.all(thumbnail.getBackgroundPromises());
	}

	protected validateParams(): IThumbParams {
		const schema = Joi.object({
			imgPath: Joi.string().required().replace(/\.\./g, '')
		});

		const {value, error} = schema.validate(this.request.params, {allowUnknown: true});

		if (error) {
			console.error(`validateParams: ${error!.details[0].message}`, this.request.params);
			throw new HttpError('Incorrect input params', 400);
		} else {
			const imgPath = value.imgPath;

			return {
				imgPath
			};
		}
	}

	protected validateQuery(): IThumbQuery {
		const schema = Joi.object({
			mode: Joi.string().valid('scale').required(),
			'max-size': Joi.number().integer().required().min(1).max(2000),
			q: Joi.string().valid('low', 'normal', 'high'),
			grayscale: Joi.number().integer(),
			blur: Joi.number().integer().min(0).max(15),
			ratio: Joi.string().valid(...Object.keys(TThumbRatio)),
			pad: Joi.number().integer(),
			bg: Joi.string().pattern(/^[a-z0-9]{6}$/i)
		});

		const {value, error} = schema.validate(this.request.query);
		if (error) {
			console.error(`validateParams: ${error!.details[0].message}`);
			throw new HttpError('Incorrect query params', 400);
		} else {
			return value as unknown as IThumbQuery;
		}
	}
}

interface IThumbQuery {
	mode: TThumbMode;
	'max-size': number;
	q?: TThumbQuality;
	grayscale?: number;
	pad?: number;
	blur?: number;
	ratio?: TThumbRatio;
	bg?: string;
}

interface IThumbParams {
	imgPath: string;
}