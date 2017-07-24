module.exports = {
    'root': true,
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true
    },
    'extends': [
        'eslint:recommended',
    ],
    'plugins': [
    ],
    'parserOptions': {
        'sourceType': 'module'
    },
    'rules': {
        'indent': ['error', 4, {'SwitchCase': 1}],
        'linebreak-style': [ 'error', 'unix' ],
        'quotes': [ 'error', 'single' ],
        'semi': [ 'error', 'always' ],
        'max-len': ['error', 200, 4, {'ignoreComments': true, 'ignoreUrls': true}],
        'comma-dangle': ['error', 'always-multiline'],
        'no-shadow': ['error', { 'builtinGlobals': false, 'hoist': 'functions', 'allow': [] }],
        'no-unused-vars': 'error',
    }
};
