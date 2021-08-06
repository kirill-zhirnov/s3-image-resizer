import {S3, PutObjectCommandInput} from '@aws-sdk/client-s3';
import {ReadStream, WriteStream} from 'fs';

export default class S3Storage {
	protected client?: S3;
	protected bucket: string;

	constructor() {
		this.bucket = process.env.S3_BUCKET!;
	}

	async downloadFile(writeStream: WriteStream, key: string) {
		const data = await this.getClient().getObject({
			Bucket: this.bucket,
			Key: key
		});

		const outPromise = new Promise<void>((resolve) => {
			writeStream.on('finish', () => resolve());
		});

		if (data?.Body) {
			//@ts-ignore
			data.Body.pipe(writeStream);

			return outPromise;
		} else {
			throw new Error('DownloadFile: body is empty.');
		}
	}

	async uploadFile(stream: ReadStream, Key: string, props: IS3UploadProps = {}) {
		const input: PutObjectCommandInput = {
			Body: stream,
			Bucket: this.bucket,
			Key
		};

		if (props.contentType)
			input.ContentType = props.contentType;

		await this.getClient().putObject(input);
	}

	async listObjects(prefix: string) {
		return await this.getClient().listObjectsV2({
			Bucket: this.bucket,
			Prefix: prefix
		});
	}

	getClient(): S3 {
		if (!this.client) {
			this.client = new S3({
				endpoint: process.env.S3_ENDPOINT,
				region: process.env.S3_REGION,
				credentials: {
					accessKeyId: process.env.S3_KEY!,
					secretAccessKey: process.env.S3_SECRET!
				}
			});
		}

		return this.client;
	}
}

export interface IS3UploadProps {
	contentType?: string;
}