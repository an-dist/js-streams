import { ArrayAccumulator } from "./ArrayAccumulator.js";
const source = (data) => new ReadableStream({
  start(controller) {
    controller.enqueue(data);
    controller.close();
  }
});
const logging = () => new TransformStream({
  transform(chunk, controller) {
    console.log(chunk);
    controller.enqueue(chunk);
  }
});
const terminate = () => new WritableStream();
const testPush = async (size, data) => {
  const accumulator = new ArrayAccumulator(size);
  await accumulator.push(data);
  for await (const value of accumulator.flush()) {
    console.log(value);
  }
};
const testFlush = async (size, data) => {
  const accumulator = new ArrayAccumulator(size);
  for await (const value of accumulator.flush(data)) {
    console.log(value);
  }
};
const testAsyncIterator = async (size, data) => {
  const accumulator = new ArrayAccumulator(size);
  await accumulator.push(data);
  for await (const value of accumulator) {
    console.log(value);
  }
};
const testReadable = async (size, data) => {
  const accumulator = new ArrayAccumulator(size);
  await accumulator.readable(data).pipeThrough(logging()).pipeTo(terminate());
};
const testTransform = async (size, data) => {
  const accumulator = new ArrayAccumulator(size);
  await source(data).pipeThrough(accumulator.transformable()).pipeThrough(logging()).pipeTo(terminate());
};
const testWritable = async (size, data) => {
  const accumulator = new ArrayAccumulator(size);
  await source(data).pipeTo(accumulator.writable());
  for await (const value of accumulator) {
    console.log(value);
  }
};
const testPerformance = async (size, total) => {
  console.groupCollapsed(`size=${size}, total=${total}`);
  performance.clearMeasures("perf");
  performance.clearMarks("start");
  performance.clearMarks("end");
  performance.mark("start");
  const accumulator = new ArrayAccumulator(size);
  for (let i = 0; i < total; ++i) {
    for await (const value of accumulator.pull(i)) {
      console.assert(value.length === size, "flush= false", "value=", value, "length=", value.length, "size=", size);
    }
  }
  for await (const value of accumulator.flush()) {
    console.assert(value.length === total % size, "flush= true", "value=", value, "length=", value.length, "size=", total % size);
  }
  performance.mark("end");
  performance.measure("perf", "start", "end");
  const perf = performance.getEntriesByName("perf")[0];
  console.log(`duration: ${perf.duration}`);
  console.groupEnd();
};
const testList = [
  { name: "Push", func: testPush },
  { name: "Flush", func: testFlush },
  { name: "AsyncIterator", func: testAsyncIterator },
  { name: "Readable", func: testReadable },
  { name: "Transform", func: testTransform },
  { name: "Writable", func: testWritable }
];
const sizeList = [
  4,
  5,
  6
];
const dataList = [
  void 0,
  null,
  "abc",
  123,
  1.23,
  [1, 2, 3, 4, 5],
  ["aaa", "bbb", "ccc", "ddd", "eee"],
  [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }],
  function* () {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
  },
  async function* () {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
  }
];
for (const test of testList) {
  console.groupCollapsed(test.name);
  for (const data of dataList) {
    for (const size of sizeList) {
      console.groupCollapsed(`size=${size}, data=${JSON.stringify(data)}`);
      await test.func(size, data);
      console.groupEnd();
    }
  }
  console.groupEnd();
}
console.groupCollapsed("Performance");
await testPerformance(8, 1e5);
await testPerformance(32, 1e5);
await testPerformance(1e3, 1e5);
console.groupEnd();
console.log("Test completed.");
//# sourceMappingURL=test.js.map
