import {promisify} from 'util';
import imageMagick from 'node-imagemagick';

const identifyIM = promisify(imageMagick.identify);
const convertIM = promisify(imageMagick.convert);

const dimensionRegExp = /(\d+)x(\d+)/;

export async function getImgSize(imgPath: string): Promise<IImgSize> {
	const out: IImgSize = {
		width: null,
		height: null
	};

	const identifyRes = await identifyIM(['-format', '%wx%h', imgPath]) as unknown as string;
	Object.assign(out, extractDimension(identifyRes));

	const autoOrientRes = await convertIM(['-auto-orient', imgPath, '-format', '%wx%h', 'info:']) as unknown as string;
	Object.assign(out, extractDimension(autoOrientRes));

	if (out.width === null || out.height === null) {
		console.error('identify res:', identifyRes);
		console.error('convert res:', identifyRes);
	}

	return out;
}

export async function getImgType(imgPath: string): Promise<string|null> {
	const identifyRes = await identifyIM(['-verbose', imgPath]) as unknown as string;
	const matchRes = identifyRes.match(/Mime type: (.+)/);

	if (matchRes) {
		return matchRes[1];
	}

	return null;
}

function extractDimension(result: string|undefined|null): Partial<IImgSize> {
	const out: Partial<IImgSize> = {};

	if (!result) {
		return out;
	}

	const matchRes = String(result).match(dimensionRegExp);
	if (matchRes) {
		out.width = parseInt(matchRes[1]);
		out.height = parseInt(matchRes[2]);
	}

	return out;
}

export interface IImgSize {
	width: number|null;
	height: number|null;
}