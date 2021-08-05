import {Request, Response, NextFunction} from 'express';
import HttpError from '../errors/httpError';

export default abstract class BasicAction {
	constructor(
		protected request: Request,
		protected response: Response,
		protected next: NextFunction
	) {}

	async run() {
		try {
			await this.process();
		} catch (e) {
			if (e instanceof HttpError) {
				this.response.status(e.status).send(e.message);
			} else {
				console.error(e);
				this.response.status(500).send('Error');
			}
		}
	}

	abstract process(): Promise<void>|void;
}