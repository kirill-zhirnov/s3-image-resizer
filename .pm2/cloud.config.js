const path = require('path');
const rootPath = path.dirname(path.dirname(__filename));

module.exports = {
	apps: [
		{
			name: 'node-prod',
			cwd: rootPath,
			script: './dist/server.js',
			instances: 'max',
			exec_mode: 'cluster'
		}
	]
};