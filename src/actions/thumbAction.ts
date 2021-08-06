import BasicAction from './basicAction';
import Joi from 'joi';
import HttpError from '../errors/httpError';
import Thumbnail, {TThumbMode} from '../components/thumbnail';

export default class ThumbAction extends BasicAction{
	async process() {
		const params = this.validateParams();
		const query = this.validateQuery();

		const thumbnail = new Thumbnail(params.imgPath, query.mode, query['max-size']);
		const thumb = await thumbnail.getThumb();

		// this.response.removeHeader('Cache-Control');
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
			'max-size': Joi.number().integer().required().min(1).max(2000)
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
}

interface IThumbParams {
	imgPath: string;
}