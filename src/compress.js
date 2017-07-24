/* eslint-env node */
const iconv = require('iconv-lite');
const babel = require('babel-core');
const babiliPreset = require('babel-preset-babili');

const { encodeUTF16 } = require('./encode');
const { bufferToPng } = require('./png');
const { pngDecodeUTF16Buffer, simpleDecodeUTF16 } = require('./decode');

function minify(func) {
    const s = babel.transform(func, {
        minified: true,
        presets: [[babiliPreset, {
            mangle: { eval: true },
        }]],
    }).code.replace(/function [^(]+\(([^)]+)\)/, (m,a) => `${a}=>`);
    return s;
}

function align(str, n) {
    const pad = (new Array(str.length % n)).fill(' ');
    return str + pad.join('');
}

/**
 * @param {string} js - javascript code to execute
 * @param {Buffer[]} assets - assets to encode
 * @param {Object} [options] - options
 * @param {Object} [options.globalAssetsName="ASSETS"] - name of the global variable the assets will be stored in
 */
function compress(js, assets = [], { globalAssetsName = 'ASSETS' } = {}) {
    const content = [Buffer.from(js, 'utf8'), ...assets];

    const offsets = [];
    content.forEach((b, i) => {
        const start = i > 0 ? offsets[i - 1][1] : 0;
        offsets[i] = [start, start + b.length];
    });

    const decompress = pngDecodeUTF16Buffer.toString().replace('});', `
        }).then(b => {
            var scr = document.createElement('script');
            scr.textContent = String.fromCharCode(...(window.${globalAssetsName} = ${JSON.stringify(offsets)}.map(o => b.slice(...o))).shift());
            document.body.appendChild(scr);
        });`);
    const decompressStringified = align(minify(decompress.toString()), 2);
    const decompressEncoded = encodeUTF16(
        Buffer.from(decompressStringified.replace(/String\.fromCharCode/g, 'C'), { applyOffset: false}, 'uft8')
    );
    const decoder = minify(simpleDecodeUTF16).replace(/String\.fromCharCode/g, 'C');

    return bufferToPng(Buffer.concat(content))
        .then(b => encodeUTF16(b, { applyOffset: true }))
        .then(encodedBuffer => {
            const BOM = Buffer.from([0xfe, 0xff]);
            const output = Buffer.concat([
                BOM,
                iconv.encode(`<body><script>C=String.fromCharCode;eval((${decoder})("`, 'utf16be'),
                decompressEncoded,
                iconv.encode('"))("', 'utf16be'),
                encodedBuffer,
                iconv.encode('")</script>', 'utf16be'),
            ]);
            return output;
        });
}

module.exports = { compress };

