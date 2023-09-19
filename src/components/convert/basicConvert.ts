import {TThumbQuality, TThumbRatio} from '../thumbnail';
import {getImgSize} from '../imageUtils';
import path from 'path';

export default abstract class BasicConvert {
	protected thumbExt: string;
	protected cmdArgs: string[] = [];
	protected maxSize?: number;
	protected quality?: TThumbQuality;
	protected ratio?: TThumbRatio;
	protected background?: string;
	protected pad: boolean = false;
	protected grayscale: boolean = false;
	protected blur?: number;
	protected extension?: string;

	protected originalSize?: IImgSize;
	protected thumbSize?: IImgSize;

	constructor(
		protected originalPath: string,
		protected thumbPath: string
	) {
		this.thumbExt = path.extname(this.thumbPath).toLowerCase();
	}

	abstract make(): Promise<void>;

	protected async identifyOriginalSize(): Promise<IImgSize>
	{
		const imgSize = await getImgSize(this.originalPath);
		if (!imgSize.width || !imgSize.height)
			throw new Error(`Cannot detect original img size ${this.originalPath}, res: ${JSON.stringify(imgSize)}`);

		this.originalSize = imgSize as unknown as IImgSize;

		return this.originalSize;
	}

	protected	addCmdArgs(args: string[]|string) {
		this.cmdArgs = this.cmdArgs.concat(args);
	}

	setRatio(value: TThumbRatio|undefined) {
		this.ratio = value;
		return this;
	}

	setMaxSize(value: number) {
		this.maxSize = value;
		return this;
	}

	setQuality(value: TThumbQuality|undefined) {
		this.quality = value;
		return this;
	}

	setBackground(value: string|undefined) {
		this.background = value;
		return this;
	}

	setPad(value: boolean) {
		this.pad = value;
		return this;
	}

	setGrayscale(value: boolean) {
		this.grayscale = value;
		return this;
	}

	setBlur(value: number|undefined) {
		this.blur = value;
		return this;
	}

	setExtension(value?: string) {
		this.extension = value;
		return this;
	}

	protected calcProportion(mul1: number, mul2: number, divider: number): number {
		return Math.round((mul1 * mul2) / divider);
	}

	protected calcThumbSizeByProportion(maxSize: number, imgRatio: TThumbRatio): IImgSize {
		let thumbHeight, thumbWidth;
		const parts = imgRatio.split('-');

		const width = parseInt(parts[0]);
		const height = parseInt(parts[1]);

		if (width === Math.max(width, height)) {
			thumbWidth = maxSize;
			thumbHeight = this.calcProportion(maxSize, height, width);
		} else {
			thumbWidth = this.calcProportion(maxSize, width, height);
			thumbHeight = maxSize;
		}

		return {
			width: thumbWidth,
			height: thumbHeight
		};
	}

	protected appendQualityArgs() {
		if (!this.quality)
			return;

		const qualityMap = {
			'low': {
				'png': ['-colors', '255'],
				'jpg': ['-quality', '20']
			},
			'normal': {
			},
			'high': {
				'jpg': ['-quality', '100'],
				'png': ['-quality', '100']
			}
		};

		let extKey;
		if (this.isThumbPng()) {
			extKey = 'png';
		} else if (this.isThumbJpeg()) {
			extKey = 'jpg';
		}

		if (this.quality in qualityMap && extKey && extKey in qualityMap[this.quality]) {
			//@ts-ignore
			this.addCmdArgs(qualityMap[this.quality][extKey]);
		}
	}

	protected appendGrayscaleArgs() {
		this.addCmdArgs(['-colorspace', 'Gray']);
	}

	protected appendBlur() {
		this.addCmdArgs(['-blur', `0x${this.blur}`]);
	}

	protected isThumbJpeg(): boolean {
		return ['.jpg', '.jpeg'].includes(this.thumbExt);
	}

	protected isThumbPng(): boolean {
		return ['.png'].includes(this.thumbExt);
	}

	protected	getJpgArgs() {
		return [
			'-interlace',
			'JPEG',
			'-sampling-factor',
			'4:2:0'
		];
	}

	protected appendExtensionArgs() {
		if(this.extension === '.webp') {
			return this.addCmdArgs(['-define', 'webp:lossless=true']);
		}
	}
}

export interface IImgSize {
	width: number;
	height: number;
}