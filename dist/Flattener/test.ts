import { Flattener } from "./Flattener.ts"

const readable = (data: any) => new ReadableStream({
  start(controller) {
    controller.enqueue(data)
    controller.close()
  }
})

const logging = () => new TransformStream({
  transform(chunk, controller) {
    console.log(chunk)
    controller.enqueue(chunk)
  }
})

const writable = () => new WritableStream()

const test = async (data: any, limit?: number) => {
  console.groupCollapsed(`=== data: ${JSON.stringify(data)}, limit: ${limit} ===`)
  await readable(data)
    .pipeThrough(new Flattener(limit).transformable())
    .pipeThrough(logging())
    .pipeTo(writable())
  console.groupEnd()
}

await test(undefined)
await test(null)
await test("abc")
await test(123)

await test([1, 2, 3, 4, 5])
await test([{ a: 1 }, { a: 2 }, [{ a: 3 }, [{ a: 4 }]], { a: 5 }])

await test([0, [1, [2, [3]]]])
await test([0, [1, [2, [3]]]], 0)
await test([0, [1, [2, [3]]]], 1)
await test([0, [1, [2, [3]]]], 2)
await test([0, [1, [2, [3]]]], 3)

console.log("Test completed.")