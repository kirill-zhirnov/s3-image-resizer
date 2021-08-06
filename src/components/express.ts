import registry from 'simple-registry';
import express, {Application, NextFunction, Request, Response} from 'express';
import ThumbAction from "../actions/thumbAction";


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