import path from 'path';
import {createHash} from 'crypto';
import registry from 'simple-registry';
import fs from 'fs';
import S3Storage from './s3Storage';
import HttpError from '../errors/httpError';
import {promisify} from 'util';
import ScaleConvert from './convert/scale';

const mkdir = promisify(fs.mkdir);

export default class Thumbnail {
	protected thumb?: IThumb;
	protected original?: IOriginalImg;
	protected runtimePath: string;
	protected s3Storage?: S3Storage;
	protected useCache: boolean = true;
	protected backgroundPromises: Promise<any>[] = [];

	constructor(
		protected imgPath: string,
		protected mode: TThumbMode,
		protected maxSize: number
	) {
		this.runtimePath = `${registry.get('rootPath')}/runtime`;
	}

	async getThumb(): Promise<IThumb> {
		this.createThumbPath();
		if (this.useCache && fs.existsSync(this.thumb!.absolutePath)) {
			return this.thumb!;
		}

		const listObjects = await this.getS3Storage().listObjects(this.original!.basePath);

		if (!listObjects.Contents || !listObjects.Contents.find(({Key}) => Key === this.original!.localPath))
			throw new HttpError('Image not found', 404);

		const thumbOnS3 = listObjects.Contents.find(({Key}) => Key === this.thumb!.localPath);
		if (thumbOnS3) {
			await this.downloadThumb();
			return this.thumb!;
		}

		await this.downloadOriginalImg();
		await this.makeThumb();

		this.backgroundPromises.push(this.uploadThumb());

		return this.thumb!;
	}

	createThumbPath() {
		const ext = path.extname(this.imgPath);
		const baseName = path.basename(this.imgPath, ext);
		const dirName = path.dirname(this.imgPath);

		const suffix = this.createThumbNameSuffix().join('-');
		const suffixHash = createHash('md5').update(suffix).digest('hex');

		const thumbName = `${baseName}_${suffixHash}${ext}`;
		const localPath = `${dirName}/${thumbName}`;

		this.thumb = {
			localPath,
			absolutePath: `${this.runtimePath}/${localPath}`,
		};

		this.original = {
			localPath: this.imgPath,
			ext,
			basePath: `${dirName}/${baseName}`,
			absolutePath: `${this.runtimePath}/${this.imgPath}`
		};
	}

	createThumbNameSuffix(): string[] {
		const suffix: string[] = [this.mode, String(this.maxSize)];

		return suffix;
	}

	protected async makeThumb() {
		console.log('making thumb');
		switch (this.mode) {
			case TThumbMode.scale: {
				const scale = new ScaleConvert(this.original!.absolutePath, this.thumb!.absolutePath);
				scale
					.setMaxSize(this.maxSize)
				;
				await scale.make();
			}
		}
	}

	protected async uploadThumb() {
		await this.getS3Storage().uploadFile(
			fs.createReadStream(this.thumb!.absolutePath),
			this.thumb!.localPath
		);
	}

	protected async downloadThumb() {
		const dir = path.dirname(this.thumb!.absolutePath);
		if (!fs.existsSync(dir)) {
			await mkdir(dir, {recursive: true});
		}

		await this.getS3Storage().downloadFile(
			fs.createWriteStream(this.thumb!.absolutePath, {flags: 'w'}),
			this.thumb!.localPath
		);
	}

	protected async downloadOriginalImg() {
		if (this.useCache && fs.existsSync(this.original!.absolutePath))
			return;

		const dir = path.dirname(this.original!.absolutePath);
		if (!fs.existsSync(dir)) {
			await mkdir(dir, {recursive: true});
		}

		const writeStream = fs.createWriteStream(this.original!.absolutePath, {flags: 'w'});
		// const finishPromise = new Promise<void>((resolve) => {
		// 	writeStream.on('finish', () => resolve());
		// });
		await this.getS3Storage().downloadFile(writeStream, this.original!.localPath);

		// return finishPromise;
	}

	setRuntimePath(value: string) {
		this.runtimePath = value;
		return this;
	}

	getS3Storage(): S3Storage {
		if (!this.s3Storage) {
			this.s3Storage = new S3Storage();
		}

		return this.s3Storage;
	}

	getBackgroundPromises() {
		return this.backgroundPromises;
	}
}

export enum TThumbMode {
	scale = 'scale'
}

export enum TThumbRatio {
	'1-1' = '1-1',
	'2-3' = '2-3',
	'3-2' = '3-2',
	'4-5' = '4-5',
	'5-4' = '5-4',
	'3-4' = '3-4',
	'4-3' = '4-3',
	'16-9' = '16-9',
	'9-16' = '9-16',
}

export interface IThumb {
	localPath: string;
	absolutePath: string;
}

export interface IOriginalImg {
	localPath: string;
	ext: string;
	basePath: string;
	absolutePath: string;
}