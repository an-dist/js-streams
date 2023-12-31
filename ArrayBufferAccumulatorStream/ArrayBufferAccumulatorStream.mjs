/*!
MIT No Attribution

Copyright 2024 an(https://github.com/an-dist)

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
export class ArrayBufferAccumulatorStream extends TransformStream {
    constructor(size, options) {
        let forceEmit;
        let fixed;
        let buffer;
        let bufferView;
        let pos;
        super({
            start() {
                var _a;
                if (options === null || options === void 0 ? void 0 : options.forceEmit) {
                    if (Array.isArray(options.forceEmit)) {
                        forceEmit = (bytes) => {
                            const clonedBytes = [];
                            for (const byte of bytes) {
                                clonedBytes.push(byte);
                            }
                            const patterns = options.forceEmit;
                            for (let patternIndex = 0; patternIndex < patterns.length; ++patternIndex) {
                                const pattern = patterns[patternIndex];
                                let byteIndex = 0;
                                let patternByteIndex = 0;
                                for (const byte of clonedBytes.values()) {
                                    if (byte !== pattern[patternByteIndex]) {
                                        ++byteIndex;
                                        patternByteIndex = 0;
                                        continue;
                                    }
                                    if (pattern.length === patternByteIndex + 1) {
                                        return byteIndex + pattern.length;
                                    }
                                    ++byteIndex;
                                    ++patternByteIndex;
                                }
                            }
                            return -1;
                        };
                    }
                    else {
                        forceEmit = options.forceEmit;
                    }
                }
                fixed = (options === null || options === void 0 ? void 0 : options.forceEmit) ? false : (_a = options === null || options === void 0 ? void 0 : options.fixed) !== null && _a !== void 0 ? _a : false;
                buffer = new ArrayBuffer(size);
                bufferView = new Uint8Array(buffer);
                pos = 0;
            },
            transform(chunk, controller) {
                let chunkView;
                let chunkSize;
                if (Array.isArray(chunk)) {
                    chunkView = new Uint8Array(chunk);
                    chunkSize = chunk.length;
                }
                else {
                    const buffer = chunk;
                    chunkView = new Uint8Array(buffer);
                    chunkSize = buffer.byteLength;
                }
                let chunkPos = 0;
                let copySize;
                while (chunkSize > 0) {
                    if (pos === size) {
                        controller.enqueue(bufferView.slice());
                        pos = 0;
                    }
                    copySize = Math.min(size - pos, chunkSize);
                    bufferView.set(chunkView.slice(chunkPos, chunkPos + copySize), pos);
                    pos += copySize;
                    chunkPos += copySize;
                    chunkSize -= copySize;
                    if (forceEmit && pos > 0) {
                        let forceEmitPos = forceEmit(bufferView.slice(0, pos).values());
                        while (forceEmitPos > 0) {
                            controller.enqueue(bufferView.slice(0, forceEmitPos));
                            bufferView.copyWithin(0, forceEmitPos, size);
                            pos -= forceEmitPos;
                            forceEmitPos = forceEmit(bufferView.slice(0, pos).values());
                        }
                    }
                }
            },
            flush(controller) {
                if (pos > 0) {
                    if (forceEmit) {
                        let forceEmitPos = forceEmit(bufferView.slice(0, pos).values());
                        while (forceEmitPos > 0) {
                            controller.enqueue(bufferView.slice(0, forceEmitPos));
                            bufferView.copyWithin(0, forceEmitPos, size);
                            pos -= forceEmitPos;
                            forceEmitPos = forceEmit(bufferView.slice(0, pos).values());
                        }
                    }
                    if (fixed) {
                        bufferView.fill(0, pos);
                        pos = size;
                    }
                    if (pos > 0) {
                        controller.enqueue(bufferView.slice(0, pos));
                    }
                }
                buffer = null;
            }
        });
    }
}
//# sourceMappingURL=ArrayBufferAccumulatorStream.mjs.map