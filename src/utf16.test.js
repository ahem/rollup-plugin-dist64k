/* eslint-env node */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const iconv = require('iconv-lite');
const tempy = require('tempy');
const test = require('tape');

const { encodeUTF16 } = require('./encode');
const { decodeUTF16Buffer, simpleDecodeUTF16, simpleDecodeUTF16Buffer } = require('./decode');

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
    // console.log(url);
    driver.get(url);
    const result = driver.executeScript(validateScript);
    return driver.quit()
        .then(() => { fs.unlinkSync(fn); })
        .then(() => result);
}


test('simple encode/decode', t => {
    // generate a large buffer filled with valid ascii chars. No forbidden char codes
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-=+/!@#$%^&~*()_[]{}:.,;<>\'"`';
    const arr = new Uint8Array(100000);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = chars.charCodeAt(Math.floor(Math.random() * chars.length));
    }
    const buffer = Buffer.from(arr.buffer);
    const origMD5 = crypto.createHash('md5').update(buffer).digest('hex');

    const validateScript = 'return (new SparkMD5.ArrayBuffer()).append(RESULT.buffer).end()';
    getDecodedMD5(encodeUTF16(buffer), simpleDecodeUTF16Buffer, validateScript).then(decodedMD5 => {
        t.equals(decodedMD5, origMD5, 'decoded md5 should match original');
        t.end();
    });
});

test('simple encode/decode string', t => {
    // generate a large buffer filled with valid ascii chars. No forbidden char codes
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-=+/!@#$%^&~*()_[]{}:.,;<>\'"`';
    let s = '';
    for (let i = 0; i < 100000; i++) {
        s += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const buffer = Buffer.from(s, 'utf8');
    const origMD5 = crypto.createHash('md5').update(buffer).digest('hex');

    const validateScript = 'return (new SparkMD5()).append(RESULT).end()';
    getDecodedMD5(encodeUTF16(buffer), simpleDecodeUTF16, validateScript).then(decodedMD5 => {
        t.equals(decodedMD5, origMD5, 'decoded md5 should match original');
        t.end();
    });
});


test('encode/decode string', t => {
    const arr = new Uint8Array(100000);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 255);
    }
    const buffer = Buffer.from(arr.buffer);
    const origMD5 = crypto.createHash('md5').update(buffer).digest('hex');

    const validateScript = 'return (new SparkMD5.ArrayBuffer()).append(RESULT.buffer).end()';
    getDecodedMD5(encodeUTF16(buffer, { applyOffset: true }), decodeUTF16Buffer, validateScript).then(decodedMD5 => {
        t.equals(decodedMD5, origMD5, 'decoded md5 should match original');
        t.end();
    });
});



