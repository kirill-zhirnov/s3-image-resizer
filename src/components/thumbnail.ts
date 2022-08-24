import path from 'path';
import {createHash} from 'crypto';
import registry from 'simple-registry';
import fs from 'fs';
import os from 'os';
import S3Storage, {IS3UploadProps} from './s3Storage';
// import HttpError from '../errors/httpError';
import {promisify} from 'util';
import ScaleConvert from './convert/scale';
import {getImgType} from './imageUtils';
import child_process from 'child_process';

const mkdir = promisify(fs.mkdir);
// const stat = promisify(fs.stat);
// const utimes = promisify(fs.utimes);
const mkdtemp = promisify(fs.mkdtemp);
// const copyFile = promisify(fs.copyFile);
const unlink = promisify(fs.unlink);
const exec = promisify(child_process.exec);
const rmdir = promisify(fs.rmdir);

export default class Thumbnail {
	protected thumb?: IThumb;
	protected original?: IOriginalImg;
	protected runtimePath: string;
	protected s3Storage?: S3Storage;
	protected useCache: boolean;
	protected backgroundPromises: Promise<any>[] = [];
	protected quality?: TThumbQuality;
	protected grayscale: boolean = false;
	protected pad: boolean = false;
	protected blur?: number;
	protected ratio?: TThumbRatio;
	protected background?: string;

	constructor(
		protected imgPath: string,
		protected mode: TThumbMode,
		protected maxSize: number
	) {
		this.useCache = String(process.env.USE_CACHE) === 'true';
		this.runtimePath = registry.get('runtimePath');
	}

	async getThumb(): Promise<IThumb> {
		this.createThumbPath();

		if (this.useCache && fs.existsSync(this.thumb!.absolutePath)) {
			// await this.changeAtime(this.thumb!.absolutePath);
			return this.thumb!;
		}

		//don't use S3 cache, since there is a rates limit from S3:
		//
		// const listObjects = await this.getS3Storage().listObjects(this.original!.basePath);
		//
		// if (!listObjects.Contents || !listObjects.Contents.find(({Key}) => Key === this.original!.localPath))
		// 	throw new HttpError('Image not found', 404);
		//
		// const thumbOnS3 = listObjects.Contents.find(({Key}) => Key === this.thumb!.localPath);
		// if (this.useCache && thumbOnS3) {
		// 	await this.downloadThumb();
		// 	return this.thumb!;
		// }

		await this.downloadOriginalImg();
		await this.copyOriginalToTmp();
		await this.makeThumb();

		if (this.original!.tempPath) {
			this.backgroundPromises.push(unlink(this.original!.tempPath));
			this.backgroundPromises.push(rmdir(path.dirname(this.original!.tempPath)));
		}

		// this.backgroundPromises.push(this.changeAtime(this.original!.absolutePath));

		return this.thumb!;
	}

	async changeAtime(path: string) {
		await exec(`touch ${path}`);
		// const {mtime} = await stat(path);
		// await utimes(path, new Date(), mtime);
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

		if (this.quality)
			suffix.push(`q${this.quality}`);

		if (this.grayscale)
			suffix.push('grayscale');

		if (this.blur)
			suffix.push(`blur${this.blur}`);

		if (this.ratio)
			suffix.push(`ratio${this.ratio}`);

		if (this.background)
			suffix.push(`bg${this.background}`);

		// suffix.push(String(Math.random()));
		// console.log('suffix:', suffix);
		return suffix;
	}

	protected async makeThumb() {
		switch (this.mode) {
			case TThumbMode.scale: {
				const scale = new ScaleConvert(this.original!.tempPath!, this.thumb!.absolutePath);
				scale
					.setMaxSize(this.maxSize)
					.setQuality(this.quality)
					.setGrayscale(this.grayscale)
					.setBlur(this.blur)
					.setRatio(this.ratio)
					.setPad(this.pad)
					.setBackground(this.background)
				;
				await scale.make();
			}
		}
	}

	protected async uploadThumb() {
		const props: IS3UploadProps = {};
		const mimeType = await getImgType(this.thumb!.absolutePath);
		if (mimeType) {
			props.contentType = mimeType;
		}

		await this.getS3Storage().uploadFile(
			fs.createReadStream(this.thumb!.absolutePath),
			this.thumb!.localPath,
			props
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
		if (fs.existsSync(this.original!.absolutePath)) {
			// await this.changeAtime(this.original!.absolutePath);
			return;
		}

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

	protected async copyOriginalToTmp() {
		const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'thumb-'));

		this.original!.tempPath = `${tmpDir}/${path.basename(this.original!.absolutePath)}`;
		//there might be a problem - on a big amount of parallels request node can copy only part of the file, don't know why.
		// await copyFile(this.original!.absolutePath, this.original!.tempPath);
		await exec(`cp ${this.original!.absolutePath} ${this.original!.tempPath}`);
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

	setQuality(value: TThumbQuality) {
		this.quality = value;
		return this;
	}

	setGrayscale(value: boolean) {
		this.grayscale = value;
		return this;
	}

	setPad(value: boolean) {
		this.pad = value;
		return this;
	}

	setBlur(value: number) {
		this.blur = value;
		return this;
	}

	setRatio(value: TThumbRatio) {
		this.ratio = value;
		return this;
	}

	setBackground(value: string) {
		this.background = value;
		return this;
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

export enum TThumbQuality {
	low = 'low',
	normal = 'normal',
	high = 'high'
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
	tempPath?: string;
}