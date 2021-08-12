import fs from 'fs';
import path from 'path';

const parseOptions = function (args: string[]) {
	const options: {[key: string]: string | null} = {};

	for (const arg of args) {
		const res = /^--([^=]+)=?([^\s]+)?$/.exec(arg);

		if (res) {
			options[res[1]] = res[2] ? res[2] : null;
		}
	}

	return options;
};

(() => {
	const options = parseOptions(process.argv);
	const {node, folder, delay} = options;
	if (!node || !folder) {
		console.log('Purge error. "folder" and "node" options are required');
		return;
	}

	const delayMins = Number(delay) || 10;
	const delayMs = delayMins * 1000 * 60;

	const folderPath = path.join(__dirname, `../../runtime/${folder}/${node}/images`);
	const files = fs.readdirSync(folderPath, {});
	let count = 0;

	if (files) {
		for (const file of files) {
			const fullPath = path.join(folderPath, file as string);
			const {atimeMs} = fs.statSync(fullPath);
			if (!atimeMs || atimeMs >= Date.now() - delayMs) continue;

			fs.unlinkSync(fullPath);
			count++;
		}
	}

	console.log(`Purge finished. ${count} files sucessfully deleted.`);
})();




