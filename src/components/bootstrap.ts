import fs from 'fs';
import registry from 'simple-registry';

export class Bootstrap {
	constructor(public rootPath: string) {}

	async run(): Promise<void> {
		if (fs.existsSync(`${this.rootPath}/.env`)) {
			require('dotenv').config();
		}

		registry.set('rootPath', this.rootPath);
	}
}

export async function run(rootPath: string): Promise<void> {
	const bootstrap = new Bootstrap(rootPath);

	return await bootstrap.run();
}