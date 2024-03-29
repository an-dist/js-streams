import { PeekStream } from "./PeekStream.ts"

const source = (data: any[]) => new ReadableStream({
  start(controller) {
    for (const chunk of data) {
      controller.enqueue(chunk)
    }
    controller.close()
  }
})

const logging = () => new PeekStream((chunk, index) => {
  console.log(index, chunk)
})

const terminate = () => new WritableStream

const data = [
  [1, 2, 3],
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
]

await source(data)
  .pipeThrough(logging())
  .pipeTo(terminate())

console.log("Test completed.")