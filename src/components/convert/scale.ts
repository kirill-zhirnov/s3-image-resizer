import BasicConvert from './basicConvert';
import {promisify} from 'util';
import imageMagick from 'node-imagemagick';

const convertIM = promisify(imageMagick.convert);

export default class ScaleConvert extends BasicConvert {
	async make() {
		if (!this.maxSize)
			throw new Error('MaxSize is required in scale mode');

		await this.calcScaleThumpSize();
		this.cmdArgs = [this.originalPath, '-auto-orient', '-strip'];

		if (this.ratio && this.pad) {
			const background = this.background || 'ffffff';
			//eslint-disable-next-line
			this.addCmdArgs(['-resize', `${this.thumbSize!.width}x${this.thumbSize!.height}\>`]);
			this.addCmdArgs(['-size', `${this.thumbSize!.width}x${this.thumbSize!.height}`, `xc:#${background}`, '+swap', '-gravity', 'center']);
			this.addCmdArgs(['-composite']);
		} else if (this.ratio) {
			//eslint-disable-next-line
			this.addCmdArgs(['-resize', `${this.thumbSize!.width}x${this.thumbSize!.height}^\>`]);
			this.addCmdArgs(['-gravity', 'center', '-extent', `${this.thumbSize!.width}x${this.thumbSize!.height}`]);
		} else {
			//eslint-disable-next-line
			this.addCmdArgs(['-thumbnail', `${this.thumbSize!.width}x${this.thumbSize!.height}\>`]);
		}

		if (this.isThumbJpeg()) {
			this.addCmdArgs(this.getJpgArgs());
		}

		if (this.quality)
			this.appendQualityArgs();

		if (this.grayscale)
			this.appendGrayscaleArgs();

		if (this.blur)
			this.appendBlur();

		if(this.extension)
			this.appendExtensionArgs();

		this.addCmdArgs(this.thumbPath);
		// console.log('--- this.cmdArgs ---', this.cmdArgs);
		await convertIM(this.cmdArgs);
		// console.log('originalSize:', this.originalSize);
		// console.log('thumbSize:', this.thumbSize);
		// console.log('thumbSize:', this.cmdArgs);
	}

	protected async calcScaleThumpSize()
	{
		await this.identifyOriginalSize();

		// && this.pad
		if (this.ratio) {
			this.thumbSize = this.calcThumbSizeByProportion(this.maxSize!, this.ratio!);
		// } else if (this.ratio) {
		} else {
			let requestedWidth = this.maxSize!;
			let requestedHeight = this.maxSize!;
			let thumbWidth, thumbHeight;

			if (requestedWidth > this.originalSize!.width) {
				requestedWidth = this.originalSize!.width;
			}

			if (requestedHeight > this.originalSize!.height) {
				requestedHeight = this.originalSize!.height;
			}

			if (this.originalSize!.width > this.originalSize!.height) {
				thumbWidth = requestedWidth;
				thumbHeight = this.calcProportion(this.originalSize!.height, requestedWidth, this.originalSize!.width);
			} else {
				thumbWidth = this.calcProportion(this.originalSize!.width, requestedHeight, this.originalSize!.height);
				thumbHeight = requestedHeight;
			}

			this.thumbSize = {
				width: thumbWidth,
				height: thumbHeight
			};
		}
	}
}

