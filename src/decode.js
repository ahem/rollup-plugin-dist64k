module.exports = {
    decodeUTF16: function decodeUTF16(data) {
        var s = '';
        for (var i = 0; i < data.length; i++) {
            var w = data.charCodeAt(i);
            var a = w & 255;
            var b = ((w >> 8) + 255) % 256;
            if (b !== 0xd5) {
                s += String.fromCharCode(b);
            }
            s += String.fromCharCode(a);
        }
        return s;
    }, 
    decodeUTF16Buffer: function decodeUTF16(data) {
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            var w = data.charCodeAt(i);
            var a = w & 255;
            var b = ((w >> 8) + 255) % 256;
            if (b !== 0xd5) {
                arr.push(b);
            }
            arr.push(a);
        }
        return new Uint8Array(arr);
    }, 
    simpleDecodeUTF16: function simpleDecodeUTF16(data) {
        var s = '';
        for (var i = 0; i < data.length; i++) {
            var w = data.charCodeAt(i);
            s += String.fromCharCode(w >> 8, w & 255);
        }
        return s;
    },
    simpleDecodeUTF16Buffer: function (data) {
        var buf = new Uint8Array(data.length * 2);
        for (var i = 0; i < data.length; i++) {
            var w = data.charCodeAt(i);
            buf[i * 2] = w >> 8;
            buf[i * 2 + 1] = w & 255;
        }
        return buf;
    },
    pngDecodeUTF16Buffer: function pngDecodeUTF16Buffer(data) {
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            var w = data.charCodeAt(i);
            var a = w & 255;
            var b = ((w >> 8) + 255) % 256;
            if (b !== 0xd5) {
                arr.push(b);
            }
            arr.push(a);
        }
        return createImageBitmap(new Blob([new Uint8Array(arr)], {
            type: 'image/png',
        })).then(bitmap => {
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0);
            var pixels = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
            arr = [];
            for (var j = 0; j < pixels.length; j++) {
                j % 4 !== 3 && arr.push(pixels[j]);
            }
            return new Uint8Array(arr);
        });
    },
};

