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
export class PushPullNonQueue {
    length() {
        return 0;
    }
    more() {
        return true;
    }
    all() {
        throw new Error("Method not implemented.");
    }
    push(_data) {
    }
    pop() {
        return undefined;
    }
    empty() {
    }
    splice(_start, _deleteCount) {
        throw new Error("Method not implemented.");
    }
}
export class PushPullArrayBufferQueue {
    constructor(size) {
        this.size = size;
        this.queue = new ArrayBuffer(this.size);
        this.pos = 0;
    }
    length() {
        return this.pos;
    }
    more() {
        return this.pos > 0;
    }
    all() {
        return this.queue.slice(0, this.pos);
    }
    push(data) {
        const queueView = new Uint8Array(this.queue);
        const dataView = new Uint8Array(data);
        let chunkSize = data.byteLength;
        let chunkPos = 0;
        while (chunkSize > 0) {
            const copySize = Math.min(this.size - this.pos, chunkSize);
            queueView.set(dataView.slice(chunkPos, chunkPos + copySize), this.pos);
            this.pos += copySize;
            chunkPos += copySize;
            chunkSize -= copySize;
        }
    }
    pop() {
        return this.splice(-1);
    }
    empty() {
        this.queue = new ArrayBuffer(this.size);
        this.pos = 0;
    }
    splice(start, deleteCount) {
        const view = new Uint8Array(this.queue);
        const shiftSize = deleteCount === undefined ? this.size : start + deleteCount;
        const data = view.slice(start, shiftSize);
        view.copyWithin(start, shiftSize);
        this.pos -= shiftSize;
        return data;
    }
}
export class PushPullArrayQueue {
    constructor() {
        this.queue = [];
    }
    length() {
        return this.queue.length;
    }
    more() {
        return this.queue.length > 0;
    }
    all() {
        return this.queue;
    }
    push(data) {
        this.queue.push(data);
    }
    pop() {
        return this.queue.pop();
    }
    empty() {
        this.queue.splice(0);
    }
    splice(start, deleteCount) {
        if (deleteCount) {
            return this.queue.splice(start, deleteCount);
        }
        else {
            return this.queue.splice(start);
        }
    }
}
export class PushPullStringQueue {
    constructor() {
        this.queue = "";
    }
    length() {
        return this.queue.length;
    }
    more() {
        return this.queue.length > 0;
    }
    all() {
        return this.queue;
    }
    push(data) {
        this.queue += data;
    }
    pop() {
        return this.splice(-1);
    }
    empty() {
        this.queue = "";
    }
    splice(start, deleteCount) {
        if (deleteCount) {
            const value = this.queue.slice(start, start + deleteCount);
            this.queue = this.queue.slice(0, start) + this.queue.slice(start + deleteCount);
            return value;
        }
        else {
            const value = this.queue.slice(start);
            this.queue = this.queue.slice(0, start);
            return value;
        }
    }
}
export class PushPull {
    constructor(queue) {
        this.queue = queue;
    }
    async push(data) {
        if (data !== undefined) {
            if (typeof data === "function") {
                data = (await data());
            }
            if (data === null) {
                this.queue.push(data);
            }
            else if (typeof data === "string") {
                this.queue.push(data);
            }
            else if (Array.isArray(data)) {
                for (const value of data)
                    this.queue.push(value);
            }
            else if (typeof data[Symbol.iterator] === "function") {
                for (const value of data)
                    this.queue.push(value);
            }
            else if (typeof data[Symbol.asyncIterator] === "function") {
                for await (const value of data)
                    this.queue.push(value);
            }
            else {
                this.queue.push(data);
            }
        }
    }
    pull(data) {
        return this.pushpull(data);
    }
    flush(data) {
        return this.pushpull(data, true);
    }
    [Symbol.asyncIterator]() {
        return this.flush();
    }
    readable(data) {
        const This = this;
        return new ReadableStream({
            async start(controller) {
                for await (const chunk of This.flush(data)) {
                    controller.enqueue(chunk);
                }
                controller.close();
            }
        });
    }
    transform() {
        const This = this;
        return new TransformStream({
            async transform(data, controller) {
                for await (const chunk of This.pull(data)) {
                    controller.enqueue(chunk);
                }
            },
            async flush(controller) {
                for await (const chunk of This.flush()) {
                    controller.enqueue(chunk);
                }
            }
        });
    }
    writable() {
        const This = this;
        return new WritableStream({
            async write(data) {
                await This.push(data);
            }
        });
    }
}
//# sourceMappingURL=PushPull.js.map