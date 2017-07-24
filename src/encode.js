/* eslint-env node */

function hex(n) {
    const s = '0000' + n.toString(16);
    return '0x' + s.substr(s.length - 4);
}

module.exports = {
    encodeUTF16(srcBuffer, { applyOffset } = {}) {
        const srcSize = srcBuffer.length;
        const buffer = Buffer.alloc(srcSize * 2);
        let x, y, z, originalX;
        let cnt = 0;

        for (let i = 0; i < srcSize; i += 2) {

            x = originalX = srcBuffer.readUInt8(i);
            y = 0;
            if (i < srcSize - 1) {
                y = srcBuffer.readUInt8(i + 1);
            }

            // Apply an offset to the first byte in a byte pair in order to
            // minimize the use of the zero page
            if (applyOffset) {
                x = (x + 1) % 256;
            }

            // Is this a "forbidden" character code?
            z = (x << 8) + y;
            if ((z < 32) || (z >= 127 && z < 160) || (z === 39) || (z === 92) ||
                (z === 173) || (z >= 0xd800 && z <= 0xdfff) || (z === 0xfffe) ||
                (z === 0xffff) || (z >= 0xfdd0 && z <= 0xfdef) || (z === 0x2028) ||
                (z === 0x2029) || ((z & 0xff00) === 0xd600))
            {
                if (!applyOffset) {
                    throw new Error(`Forbidden char 0x${hex(z)} encountered - please encode with { applyOffset: true }`);
                }
                buffer.writeUInt8(0xd6, cnt++);            // Hi byte A
                buffer.writeUInt8(originalX, cnt++);       // Lo byte A (un-shifted!)
                buffer.writeUInt8(0xd6, cnt++);            // Hi byte B
                buffer.writeUInt8(y, cnt++);               // Lo byte B
            } else {
                if (i < srcSize - 1) {
                    buffer.writeUInt8(x, cnt++);
                    buffer.writeUInt8(y, cnt++);
                } else {
                    if (!applyOffset) {
                        throw new Error(`Forbidden char 0x${hex(z)} encountered - please encode with { applyOffset: true  (or maybe append space to string??)}`);
                    }
                    buffer.writeUInt8(0xd6, cnt++);            // Hi byte A
                    buffer.writeUInt8(originalX, cnt++);       // Lo byte A (un-shifted!)
                }
            }
        }

        return buffer.slice(0, cnt);
    },
};

