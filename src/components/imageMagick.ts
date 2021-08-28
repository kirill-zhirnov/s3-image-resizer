import {spawn} from 'child_process';

const encoding = 'utf8';

export async function identifyIm(args: string[]) {
	return spawnProcess('identify', args);
}

export async function convertIm(args: string[]) {
	return spawnProcess('convert', args);
}

function spawnProcess(process: string, args: string[]) {
	return new Promise((resolve, reject) => {
		const result = spawn(process, args, {});
		let errorAcc: string | null = null;
		let dataAcc = '';

		result.stdout.setEncoding(encoding);
		result.stderr.setEncoding(encoding);

		result.stdout.on('data', (data) => {
			dataAcc += data.toString();
		});

		result.stderr.on('data', (data) => {
			errorAcc = (errorAcc || '') + data + '\n';
		});

		result.on('close', (exit_code) => {
			if (exit_code || errorAcc) {
				reject({
					exit_code,
					process,
					message: errorAcc || 'Unknown error'
				});
			} else {
				resolve(dataAcc);
			}
		});
	});
}

