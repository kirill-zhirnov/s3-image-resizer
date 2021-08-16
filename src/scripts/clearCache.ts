import path from 'path';
import commandLineArgs from 'command-line-args';
import {deleteOldFiles} from '../components/clearCache/deleteOldFiles';
const options = commandLineArgs([
	{
		name: 'delay',
		type: Number,
		defaultValue: 10
	},
]);

(async () => {
	const {delay} = options;
	const delayMs = delay * 1000 * 60;
	const folderPath = path.join(__dirname, '../../runtime/');

	const count = await deleteOldFiles(folderPath, delayMs);

	console.log(`Purge finished. ${count} files sucessfully deleted.`);
})();




