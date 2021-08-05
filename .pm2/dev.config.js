const path = require('path');
const rootPath = path.dirname(path.dirname(__filename));

module.exports = {
	apps: [
		{
			name: 'media-server-dev',
			cwd: rootPath,
			script: './src/index.ts',
			instances: 2,
			exec_mode: 'cluster',
			// exec_mode: 'fork',
			merge_logs: true,
			watch: [
				'./src/**/*.ts',
			],
			ignore_watch: [
				'node_modules',
			],
		}
	]
};