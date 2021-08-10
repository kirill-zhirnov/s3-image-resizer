const path = require('path');
const rootPath = path.dirname(path.dirname(__filename));

module.exports = {
	apps: [
		{
			name: 'media-server-prod',
			cwd: rootPath,
			script: './dist/index.js',
			instances: 'max',
			exec_mode: 'cluster'
		}
	]
};