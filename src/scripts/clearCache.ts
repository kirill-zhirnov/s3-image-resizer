import path from 'path';
import commandLineArgs from 'command-line-args';
import {deleteOldFiles} from '../components/clearCache/deleteOldFiles';
import {run as bootstrapApp} from '../components/bootstrap';
import registry from 'simple-registry';

const options = commandLineArgs([
	{
		name: 'delay',
		type: Number,
		defaultValue: 10
	},
]);

(async () => {
	const rootPath = path.resolve(__dirname, '../../');
	await bootstrapApp(rootPath);

	const {delay} = options;
	const delayMs = delay * 1000 * 60;

	const count = await deleteOldFiles(registry.get('runtimePath'), delayMs);

	console.log(`Purge finished. ${count} files sucessfully deleted.`);
})();




