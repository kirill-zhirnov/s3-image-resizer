import {identifyIm} from './imageCmds';

const dimensionRegExp = /(\d+)x(\d+)-([a-zA-z]+)/;
const rotatedStates = ['RightTop', 'LeftBottom'];

export async function getImgSize(imgPath: string): Promise<IImgSize> {
	const out: IImgSize = {
		width: null,
		height: null
	};

	const {data, stderr, exit_code} = await identifyIm(['-format', '%G-%[orientation]', imgPath]);
	if (data) {
		Object.assign(out, extractDimension(data));
	}
	if (stderr) {
		console.error('Identify image error:', {
			message: stderr,
			exit_code
		});
	}

	return out;
}

export async function getImgType(imgPath: string): Promise<string | null> {
	const {data, stderr, exit_code} = await identifyIm(['-verbose', imgPath]);
	const matchRes = data ? data.match(/Mime type: (.+)/) : null;

	if (matchRes) {
		return matchRes[1];
	}
	if (stderr) {
		console.error('Get image type error:', {
			message: stderr,
			exit_code
		});
	}


	return null;
}

function extractDimension(result: string | undefined | null): Partial<IImgSize> {
	const out: Partial<IImgSize> = {};

	if (!result) {
		return out;
	}

	const matchRes = String(result).match(dimensionRegExp);
	if (matchRes) {
		const isRotated = rotatedStates.includes(matchRes[3]);
		const width = parseInt(matchRes[1]);
		const height = parseInt(matchRes[2]);

		out.width = isRotated ? height : width;
		out.height = isRotated ? width : height;
	}

	return out;
}

export interface IImgSize {
	width: number | null;
	height: number | null;
}