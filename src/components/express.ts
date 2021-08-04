import registry from 'simple-registry';
import express, {Application, Request, Response} from 'express';


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
		// /thumb/i15/images/asdadad.png?q=quality&width=100&height=100&ration=2/3
		//save thumbs as: /i-n/runtime/localPath.png
		this.app.get('/thumb', (req: Request, res: Response) => {
			res.send('thumb is coming soon :)');
		});

		this.app.use((req: Request, res: Response) => {
			res.status(404).send('Not found' );
		});
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