import {spawn} from 'child_process';

const encoding = 'utf8';

export async function identifyIm(args: string[]) {
	const identifyPath = process.env.IM_IDENTIFY || 'identify';

	return spawnProcess(identifyPath, args);
}

export async function convertIm(args: string[]) {
	const convertPath = process.env.IM_CONVERT || 'convert';

	return spawnProcess(convertPath, args);
}

function spawnProcess(process: string, args: string[]): Promise<IResponse> {
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
			if (exit_code !== 0) {
				reject({
					exit_code,
					cmd: `${process} ${args.join(' ')}`,
					stderr: errorAcc || 'Unknown error'
				});
			} else {
				if (errorAcc) {
					console.error('Identify image error on success:', {
						errorAcc,
						exit_code
					});
				}

				resolve({
					stderr: errorAcc,
					exit_code,
					process,
					data: dataAcc
				});
			}
		});
	});
}

interface IResponse {
	exit_code: number;
	process: string;
	stderr?: string | null;
	data?: string;
}