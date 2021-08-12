import {promisify} from 'util';
import fs from 'fs';
import path from 'path';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

const excludeFiles = [
	'.gitignore'
];

export async function deleteOldFiles(folder: string, delay: number) {
	const files = await readdir(folder, {withFileTypes: true});
	let count = 0;

	if (files) {
		for (const file of files) {
			const fullPath = path.join(folder, file.name as string);
			if (file.isDirectory()) {
				count += await deleteOldFiles(fullPath, delay);
			} else {
				const {atimeMs} = await stat(fullPath);
				if (!atimeMs || atimeMs >= Date.now() - delay || excludeFiles.includes(file.name)) continue;

				await unlink(fullPath);
				count++;
			}
		}
	}

	const leftFiles = await readdir(folder);
	if (!leftFiles || !leftFiles.length) {
		await rmdir(folder);
	}

	return count;
}