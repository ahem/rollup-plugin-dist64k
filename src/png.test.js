/* eslint-env node */

const crypto = require('crypto');
const test = require('tape');

const { bufferToPng, pngToBuffer } = require('./png');

test('PNG compress / decompress buffer', t => {
    const arr = new Uint8Array(100000);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 255);
    }
    const buffer = Buffer.from(arr.buffer);
    const origMD5 = crypto.createHash('md5').update(buffer).digest('hex');
    const origSize = buffer.length;

    bufferToPng(buffer).then(encodedBuffer => {
        const decodedBuffer = pngToBuffer(encodedBuffer).slice(0, origSize);
        const decodedMD5 = crypto.createHash('md5').update(decodedBuffer).digest('hex');
        t.equals(decodedMD5, origMD5, 'decoded md5 should match original');
        t.end();
    });

});
