import fs from 'fs';
import registry from 'simple-registry';
import imageMagick from 'node-imagemagick';

export class Bootstrap {
	constructor(public rootPath: string) {}

	async run(): Promise<void> {
		if (fs.existsSync(`${this.rootPath}/.env`)) {
			require('dotenv').config();
		}

		registry.set('rootPath', this.rootPath);

		if (process.env.IM_CONVERT) {
			//@ts-ignore
			imageMagick.convert.path = process.env.IM_CONVERT;
		}

		if (process.env.IM_IDENTIFY) {
			//@ts-ignore
			imageMagick.identify.path = process.env.IM_IDENTIFY;
		}

		const runtimePath = process.env.RUNTIME_PATH ? process.env.RUNTIME_PATH : `${this.rootPath}/runtime`;
		registry.set('runtimePath', runtimePath);
	}
}

export async function run(rootPath: string): Promise<void> {
	const bootstrap = new Bootstrap(rootPath);

	return await bootstrap.run();
}