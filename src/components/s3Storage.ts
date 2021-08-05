import {S3} from '@aws-sdk/client-s3';

export default class S3Storage {
	protected client?: S3;
	protected bucket: string;
	protected folderPrefix?: string;

	constructor(
		protected instanceId: number
	) {
		this.bucket = process.env.S3_BUCKET!;

		if (process.env.S3_FOLDER_PREFIX) {
			this.folderPrefix = process.env.S3_FOLDER_PREFIX;

			if (!this.folderPrefix.endsWith('/'))
				this.folderPrefix += '/';
		}
	}

	async listObjects(prefix: string) {
		return await this.getClient().listObjectsV2({
			Bucket: this.bucket,
			Prefix: this.makeObjectKeyByPath(prefix)
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

	makeObjectKeyByPath(localPath: string): string {
		let key = `i${this.instanceId}/${localPath}`;

		if (this.folderPrefix) {
			key = `${this.folderPrefix}${key}`;
		}

		return key;
	}
}