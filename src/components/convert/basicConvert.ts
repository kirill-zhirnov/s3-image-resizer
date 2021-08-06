import {TThumbRatio} from '../thumbnail';
import {getImgSize} from '../imageUtils';

export default abstract class BasicConvert {
	protected cmdArgs: string[] = [];
	protected maxSize?: number;
	protected quality?: number;
	protected ratio?: TThumbRatio;
	protected background?: string;
	protected pad: boolean = false;

	protected originalSize?: IImgSize;
	protected thumbSize?: IImgSize;

	constructor(
		protected originalPath: string,
		protected thumbPath: string
	) {}

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

	setRatio(value: TThumbRatio) {
		this.ratio = value;
		return this;
	}

	setMaxSize(value: number) {
		this.maxSize = value;
		return this;
	}

	setQuality(value: number) {
		this.quality = value;
		return this;
	}

	setBackground(value: string) {
		this.background = value;
		return this;
	}

	setPad(value: boolean) {
		this.pad = value;
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
}

export interface IImgSize {
	width: number;
	height: number;
}