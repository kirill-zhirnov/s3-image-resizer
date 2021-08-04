import {run as bootstrapApp} from './components/bootstrap';
import {run as runExpress} from './components/express';

import path from 'path';

(async () => {
	await bootstrapApp(path.resolve(__dirname, '../'));
	await runExpress();
})();