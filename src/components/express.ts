import registry from 'simple-registry';
import express, {Application, NextFunction, Request, Response} from 'express';
import ThumbAction from '../actions/thumbAction';

export class ExpressBaker {
	protected app: Application;
	protected rootPath: string;

	constructor() {
		this.app = express();

		this.rootPath = registry.get('rootPath');
	}

	async make(): Promise<Application> {
		this.setupRoutes();

		return this.app;
	}

	async run(): Promise<void> {
		await this.make();

		const PORT: number = process.env.PORT as unknown as number || 3010;
		this.app.listen(PORT, () => console.log(`Worker started at: ${PORT}!`));
	}

	setupRoutes(): void {
		// this.app.get('/', (req: Request, res: Response, next: NextFunction) => {
		// 	res.send(`
		// 		<p>process.env.test: "${process.env.test}".</p>
		// 		<p>process.env.S3_KEY: "${process.env.S3_KEY}".</p>
		// 		<p>process.env.S3_REGION: "${process.env.S3_REGION}".</p>
		// 		<p>process.env.RUNTIME_PATH: "${process.env.RUNTIME_PATH}".</p>
		// 		<p>process.env.IM_CONVERT: "${process.env.IM_CONVERT}".</p>
		// 	`);
		// });
		this.app.get('/is-healthy', async (req: Request, res: Response) => res.send('yes'));

		this.app.options('/thumb/:imgPath(*)', async (req: Request, res: Response, next: NextFunction) => {
			res.setHeader('Allow', 'GET');
			res.setHeader('Access-Control-Allow-Methods', 'GET');
			res.setHeader('Access-Control-Allow-Headers', '*');
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Max-Age', '86400');
			res.send();
		});

		this.app.get('/thumb/:imgPath(*)', async (req: Request, res: Response, next: NextFunction) => {
			const thumbAction = new ThumbAction(req, res, next);
			await thumbAction.run();
		});

		this.app.use((req: Request, res: Response) => res.status(404).send('Not found' ));
	}

	// setupStatic(): void {
	// 	this.app.use(express.static(`${this.rootPath}/public`));
	// }
}

export async function make(): Promise<Application> {
	const baker = new ExpressBaker();
	return baker.make();
}

export async function run(): Promise<void> {
	const baker = new ExpressBaker();
	return baker.run();
}