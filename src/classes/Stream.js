/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

class Stream {
    constructor(bytes) {
        this.buffer = Buffer.from(bytes);
        this.pos = 0;
    }

    readInt() {
        let v = this.buffer.readInt16LE(this.pos);
        this.pos += 2;
        return v;
    }

    readBigUInt() {
        let v = this.buffer.readUInt32LE(this.pos);
        this.pos += 4;

        return v;
    }

    readBigInt() {
        let v = this.buffer.readInt32LE(this.pos);
        this.pos += 4;

        return v;
    }

    writeInt(val) {
        this.buffer.writeInt16LE(val, this.pos);
        this.pos += 2;
    }

    writeBigInt(val) {
        this.buffer.writeUInt32LE(val, this.pos);
        this.pos += 4;
    }

    read(start, end, rmb) {
        let result = '';
        let i = start;

        for (; i < end; i++) {
            let v = this.readInt();

            result += String.fromCharCode(v);
        }

        if (rmb) this.pos = i;

        return result;
    }

    write(str) {
        for (let i = 0; i < str.length; i++) {
            this.writeInt(str.charCodeAt(i));
        }
    }

    readWide(length) {
        let result = '';
        let i = 0;

        for (; i < length; i++) {
            let v = this.readInt();

            result += String.fromCharCode(v);
        }

        return result;
    }

    next() {
        try {
            let length = this.buffer.readUInt32LE(this.pos);
            this.pos += 4;

            if (length > 0) {
                return this.readWide(length);
            }

        } catch (e) {
            return null;
        }

        return null;
    }

    bytes() {
        let b = this.buffer.buffer.slice(0, this.pos);
        return b;
    }

    alloc(size) {
        this.buffer = Buffer.alloc(size);
        this.pos = 0;
    }
}

export default Stream;