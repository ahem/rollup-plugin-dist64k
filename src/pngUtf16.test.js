/* eslint-env node */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const iconv = require('iconv-lite');
const tempy = require('tempy');
const test = require('tape');

const { encodeUTF16 } = require('./encode');
const { bufferToPng } = require('./png');
const { pngDecodeUTF16Buffer } = require('./decode');

const webdriver = require('selenium-webdriver');

function getDecodedMD5(encodedBuffer, decodeFunc, validateScript) {
    const BOM = Buffer.from([0xfe, 0xff]);
    const fn = tempy.file({extension: 'html'});
    fs.writeFileSync(fn, Buffer.concat([
        BOM,
        iconv.encode(`<script>RESULT=(${decodeFunc.toString()})("`, 'utf16be'),
        encodedBuffer,
        iconv.encode('")</script>', 'utf16be'),
        iconv.encode(`<script>${fs.readFileSync(path.join(__dirname, '../vendor/spark-md5.min.js'), 'utf-8')}</script>`, 'utf16be'),
    ]));

    const driver = new webdriver.Builder().forBrowser('chrome').build();
    const url = `file://${fn}`;

    driver.get(url);
    driver.manage().timeouts().setScriptTimeout(5000);
    return driver.executeAsyncScript(validateScript).then(result => driver.quit()
        .then(() => { fs.unlinkSync(fn); })
        .then(() => result)
    );
}

test('png encode/decode string', t => {
    const arr = new Uint8Array(100000);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 255);
    }
    const buffer = Buffer.from(arr.buffer);
    const origMD5 = crypto.createHash('md5').update(buffer).digest('hex');
    const origSize = buffer.length;

    const validateScript = `
        var cb = arguments[arguments.length - 1];
        RESULT.then(r => {
            cb((new SparkMD5.ArrayBuffer()).append(r.buffer.slice(0, ${origSize})).end());
        });
    `;
    bufferToPng(buffer)
        .then(b => encodeUTF16(b, { applyOffset: true }))
        .then(encodedBuffer => getDecodedMD5(encodedBuffer, pngDecodeUTF16Buffer, validateScript))
        .then(decodedMD5 => {
            t.equals(decodedMD5, origMD5, 'decoded md5 should match original');
            t.end();
        });
});


