import { ArrayBufferAccumulatorStream } from "../ArrayBufferAccumulatorStream.mjs";
import { CompatiblePerformance } from "../../misc/CompatiblePerformance/CompatiblePerformance.mjs";
import { Utf8DecoderStream, Utf8EncoderStream } from "../../Utf8Streams/Utf8Streams.mjs";
if (!("now" in performance) ||
    !("mark" in performance) ||
    !("measure" in performance) ||
    !("getEntries" in performance) ||
    !("getEntriesByType" in performance) ||
    !("getEntriesByName" in performance) ||
    !("clearMeasures" in performance) ||
    !("clearMarks" in performance)) {
    console.warn("globalThis.performance switch to CompatiblePerformance");
    performance = new CompatiblePerformance;
}
(async () => {
    function readable(totalSize, chunkSize, isArray) {
        return new ReadableStream({
            start(controller) {
                const bytes = new ArrayBuffer(totalSize);
                const count = bytes.byteLength / chunkSize;
                for (let i = 0; i < count; ++i) {
                    const bytesView = new Uint8Array(bytes.slice(i * chunkSize, i * chunkSize + chunkSize));
                    if (isArray) {
                        const array = Array.from(bytesView.values());
                        controller.enqueue(array);
                    }
                    else {
                        controller.enqueue(bytesView);
                    }
                }
                controller.close();
            }
        });
    }
    function writable(result) {
        return new WritableStream({
            write(chunk) {
                if (Array.isArray(chunk)) {
                    result.sizeOfWritten += chunk.length;
                }
                else {
                    result.sizeOfWritten += chunk.byteLength;
                }
            }
        });
    }
    function mark(markName) {
        return new TransformStream({
            transform(chunk, controller) {
                performance.mark(markName);
                controller.enqueue(chunk);
            }
        });
    }
    function measure(measureName, startMark, endMark) {
        return new TransformStream({
            transform(chunk, controller) {
                performance.measure(measureName, startMark, endMark);
                controller.enqueue(chunk);
            }
        });
    }
    function assertChunkSize(totalSize, chunkSize) {
        return new TransformStream({
            transform(chunk, controller) {
                let length;
                if (Array.isArray(chunk)) {
                    length = chunk.length;
                }
                else {
                    length = chunk.byteLength;
                }
                console.assert([
                    totalSize,
                    chunkSize,
                    totalSize - (chunkSize * Math.floor(totalSize / chunkSize)),
                ].indexOf(length) !== -1, {
                    receivedChunkSize: length,
                });
                controller.enqueue(chunk);
            }
        });
    }
    const test = async (totalSize, readableChunkSize, chunkSize, fixed, isArray) => {
        readableChunkSize = readableChunkSize === 0 ? totalSize : readableChunkSize;
        performance.clearMeasures("ArrayBufferAccumulatorStream.transform");
        performance.clearMarks("start");
        performance.clearMarks("end");
        const result = { sizeOfWritten: 0 };
        await readable(totalSize, readableChunkSize, isArray)
            .pipeThrough(mark("start"))
            .pipeThrough(new ArrayBufferAccumulatorStream(chunkSize, { fixed }))
            .pipeThrough(mark("end"))
            .pipeThrough(assertChunkSize(totalSize, chunkSize))
            .pipeThrough(measure("ArrayBufferAccumulatorStream.transform", "start", "end"))
            .pipeThrough(mark("start"))
            .pipeTo(writable(result));
        const entries = performance.getEntriesByName("ArrayBufferAccumulatorStream.transform");
        const durations = entries.map(e => e.duration);
        const totalDuration = durations.reduce((s, d) => s += d, 0.0);
        const minDuration = durations.reduce((l, r) => Math.min(l, r));
        const maxDuration = durations.reduce((l, r) => Math.max(l, r));
        const sortedDurations = [...new Set(durations.sort((l, r) => l - r))];
        const medianDurationIndex = sortedDurations.length / 2 | 0;
        const medianDuration = sortedDurations.length === 0
            ? 0
            : sortedDurations.length % 2
                ? sortedDurations[medianDurationIndex]
                : sortedDurations[medianDurationIndex - 1] + sortedDurations[medianDurationIndex];
        console.groupCollapsed([
            `ReadableStream(${totalSize.toLocaleString()}, { isArray: ${isArray} }) =>`,
            `chunk(${readableChunkSize.toLocaleString()}) =>`,
            `ArrayBufferAccumulatorStream(${chunkSize.toLocaleString()}, { fixed: ${fixed} })`,
            `durationOfOccupancy: ${totalDuration}`,
        ].join(" "));
        console.assert((fixed
            ? chunkSize * Math.ceil(totalSize / chunkSize)
            : totalSize) === result.sizeOfWritten, {
            sizeOfWritten: result.sizeOfWritten,
        });
        console.table({
            totalSize,
            readableChunkSize,
            chunkSize,
            sizeOfWritten: result.sizeOfWritten,
            transforming: entries.length,
            durationOfOccupancy: totalDuration,
            durationMinimum: minDuration,
            durationMaximum: maxDuration,
            durationAverage: totalDuration / entries.length,
            durationMedian: medianDuration,
        });
        console.groupEnd();
    };
    const testNewLine = async (chunkSize) => {
        const text = "aaaaaaaaaa\nbbbbbbbbbb\ncccccccccc\ndddddddddd\neeeeeeeeee\n11111";
        const readable = new ReadableStream({
            start(controller) {
                controller.enqueue(text);
                controller.close();
            }
        });
        const writable = new WritableStream({
            write(chunk) {
                console.log(`[${chunk}]`);
            }
        });
        await readable
            .pipeThrough(new Utf8EncoderStream)
            .pipeThrough(new ArrayBufferAccumulatorStream(chunkSize, { forceEmit: [[10, 13], [13], [10]] }))
            .pipeThrough(new Utf8DecoderStream)
            .pipeTo(writable);
    };
    await readable(1, 1, false)
        .pipeThrough(new ArrayBufferAccumulatorStream(1))
        .pipeTo(new WritableStream);
    const totalSizes = [
        1,
        1000,
        1 * 1024 * 1024,
    ];
    const readableChunkSizes = [
        64,
        1000,
        8192,
        8192 * 10,
        0,
    ];
    const chunkSizes = [
        128,
        256,
        512,
        1000,
        8192,
    ];
    console.groupCollapsed("Testing ArrayBuffer|Array");
    for (const totalSize of totalSizes) {
        console.groupCollapsed(`totalSize: ${totalSize}`);
        for (const readableChunkSize of readableChunkSizes) {
            for (const chunkSize of chunkSizes) {
                for (const fixed of [false, true]) {
                    for (const isArray of [false, true]) {
                        await test(totalSize, readableChunkSize, chunkSize, fixed, isArray);
                    }
                }
            }
        }
        console.groupEnd();
    }
    console.groupEnd();
    console.groupCollapsed("Testing line separate");
    console.groupCollapsed("> size");
    await testNewLine(8);
    console.groupEnd();
    console.groupCollapsed("= size");
    await testNewLine(10);
    console.groupEnd();
    console.groupCollapsed("< size");
    await testNewLine(13);
    console.groupEnd();
    console.groupEnd();
    console.log("Test completed.");
})();
//# sourceMappingURL=test.mjs.map