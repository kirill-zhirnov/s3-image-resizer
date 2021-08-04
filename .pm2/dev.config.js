const path = require('path');
const rootPath = path.dirname(path.dirname(__filename));

module.exports = {
	apps: [
		{
			name: 'node-dev',
			cwd: rootPath,
			script: './src/server.ts',
			instances: 2,
			exec_mode: 'cluster',
			// exec_mode: 'fork',
			merge_logs: true,
			watch: [
				'./src/server.ts',
				'./src/server/**/*.ts',
				'./src/server/**/*.tsx',
				// './src/client/**/*.ts',
				// './src/client/**/*.tsx',
				'./src/@types/**/*.ts',
				'./src/i18n/en.json'
			],
			ignore_watch: [
				'node_modules',
			],
		}
	]
};