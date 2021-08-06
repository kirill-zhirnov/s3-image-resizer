declare module 'node-imagemagick' {
	export function identify(path: imgPath, callback: callback): void;
	export function convert(path: imgPath, callback: callback): void;
}

type imgPath = string[] | string;
type callback = (error: Error|string|null|undefined, features: {[key: string]: any}|string) => void;