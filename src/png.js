/* eslint-env node */

const PNG = require('pngjs').PNG;
const PngCrush = require('pngcrush');

module.exports = {
    bufferToPng(srcBuffer) {
        // TODO: play around with width/height to get better compression
        const png = new PNG({
            width: Math.ceil(Math.sqrt(srcBuffer.length / 3)),
            height: Math.ceil(Math.sqrt(srcBuffer.length / 3)),
            filterType: 0,
            inputHasAlpha: false,
            colorType: 2,
        });

        // console.log('png size: ', png.width, png.height);

        for (let i = 0; i < srcBuffer.length + srcBuffer.length % 3; i++) {
            png.data[i] = i < srcBuffer.length ? srcBuffer[i] : 0;
        }

        const chunks = []; 
        return new Promise(resolve => {
            png.pack()
                .pipe(new PngCrush(['-brute']))
                .on('data', (chunk) => { chunks.push(chunk); })
                .on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
        });
    },

    pngToBuffer(srcBuffer) {
        const data = PNG.sync.read(srcBuffer).data;
        const output = new Uint8Array(data.length);
        for (let i = 0, cnt = 0; i < data.length; i++) {
            if (i % 4 === 3) { continue; }
            output[cnt++] = data[i];
        }
        return Buffer.from(output);
    },
};

