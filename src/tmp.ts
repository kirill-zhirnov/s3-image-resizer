import {run as bootstrapApp} from './components/bootstrap';
// import {run as runExpress} from './components/express';
import {TThumbMode} from './components/thumbnail';

import path from 'path';
import Thumbnail from './components/thumbnail';

(async () => {
	await bootstrapApp(path.resolve(__dirname, '../'));

	const imgPath = 'i1/images/a1/ae/ace20b14fe947ff13822f97a82ac.jpeg';
	const mode = TThumbMode.scale;
	const maxSize = 400;

	// const thumbnail = new Thumbnail(imgPath, mode, maxSize);
	// console.log(await thumbnail.getThumb());


	for (const i of Array.from(Array(20).keys())) {
			const thumbnail = new Thumbnail(imgPath, mode, maxSize);
			thumbnail.getThumb()
				.then((res) => console.log('res:', res))
				.catch((e) => console.error('caught error:', e))
			;

		console.log('i:', i);
	}

	// const thumbnail = new Thumbnail(params.imgPath, query.mode, query['max-size']);
})();