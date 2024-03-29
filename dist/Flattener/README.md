# Flattener

## Description
Flatten the array.

## Example
https://an-js-streams.pages.dev/mod#Flattener

## Usage
```ts
import { Flattener } from "https://an-js-streams.pages.dev/mod.js" // or .ts

const array = [
  1,
  [2, 3],
  [4, [5, 6]]
]

// Flatten array.
const flattener = new Flattener({
  //
  limit: 1
})

await flattener.push(array)

// Retrieve the data.
for await (const obj of flattener) {
  // 1
  // 2
  // 3
  // 4
  // [5, 6]
}

// It can also be processed as a stream.
const readable = flattener.readable()
const transformable = flattener.transformable()
const writable = flattener.writable()
```