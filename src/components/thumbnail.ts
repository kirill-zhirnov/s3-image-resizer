import path from 'path';
import {createHash} from 'crypto';
import registry from 'simple-registry';
import fs from 'fs';
import S3Storage from './s3Storage';
import HttpError from '../errors/httpError';

export default class Thumbnail {
	protected thumb?: IThumb;
	protected runtimePath: string;
	protected s3Storage?: S3Storage;

	constructor(
		protected instanceId: number,
		protected imgPath: string,
		protected mode: TThumbMode,
		protected maxSize: number
	) {
		this.runtimePath = `${registry.get('rootPath')}/runtime`;
	}

	async makeThumb(): Promise<IThumb|void> {
		this.createThumbPath();

		if (fs.existsSync(this.thumb!.absolutePath)) {
			return this.thumb!;
		}

		const listObjects = await this.getS3Storage().listObjects(this.thumb!.baseImgPath);
		if (!listObjects.Contents)
			throw new HttpError('Image not found', 404);
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
			absolutePath: `${this.runtimePath}/i${this.instanceId}/${localPath}`,
			ext,
			baseImgPath: `${dirName}/${baseName}`
		};

		console.log(this.thumb, this.imgPath);
	}

	createThumbNameSuffix(): string[] {
		const suffix: string[] = [this.mode, String(this.maxSize)];

		return suffix;
	}

	setRuntimePath(value: string) {
		this.runtimePath = value;
		return this;
	}

	getS3Storage(): S3Storage {
		if (!this.s3Storage) {
			this.s3Storage = new S3Storage(this.instanceId);
		}

		return this.s3Storage;
	}
}

export enum TThumbMode {
	scale = 'scale'
}

export interface IThumb {
	localPath: string;
	absolutePath: string;
	ext: string;
	baseImgPath: string;
}