module.exports = {
	'env': {
		'browser': true,
		'es6': true,
		'es2017': true,
		'node': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended'
	],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 2019,
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'semi': ['error', 'always'],
		'quotes': ['error', 'single'],
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'object-curly-spacing': ['error', 'never'],
		'array-bracket-spacing': ['error', 'never'],
		'@typescript-eslint/explicit-function-return-type': 'off',
		// '@typescript-eslint/no-explicit-any': 1,
		'@typescript-eslint/no-unused-vars': 'warn'
	}
};