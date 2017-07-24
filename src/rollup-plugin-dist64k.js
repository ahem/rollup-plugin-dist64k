/* eslint-env node */

const fs = require('fs');
const promisify = require('es6-promisify');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const compress = require('./compress').compress;

function plugin({ assets = [], globalAssetsName, output } = {}) {
    return {
        name: 'dist',

        onwrite(buildOpts, bundle) {
            Promise.all(assets.map(o => readFile(o))).then(assetBuffers => {
                return compress(bundle.code, assetBuffers, { globalAssetsName }).then(htmlBuffer => {
                    process.stdout.write(`minified JS size: ${bundle.code.length} bytes\n`);
                    // process.stdout.write(`compressed size:  ${result.length} bytes\n`);
                    process.stdout.write(`final HTML size:  ${htmlBuffer.length} bytes\n`);
                    // return writeFile(buildOpts.dest + '.html', htmlBuffer);
                    return writeFile(output, htmlBuffer);
                });
            });
        },
    };
}

module.exports = plugin;


