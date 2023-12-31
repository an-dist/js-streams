# DownloadStream

## Description
Download the stream.

## Stream type
* [WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream)

## Input/output definition
|Direction|Type|
|-|-|
|Input|any|
|Output|Download by browser|

## Compatibility
* \>= ES6(ECMAScript 2015)
* Engines(Web browser only)
  * V8(Chromium)
  * JavaScriptCore(Safari, Browser on iOS/iPadOS)
  * SpiderMonkey(FireFox)

## Usage
```ts
import { DownloadStream } from "https://an-js-streams.pages.dev/mod.mjs"

const download = new DownloaderStream(
  // Specify save name.
  name: "download.txt",
  // Options
  {
    // Specify buffering mode.
    mode: "blob" | "filesystem",
    // If you specify a node, add a link to download it.
    linkHolder: node,
  }
)

await readable
  .pipeThrough(download)
  .pipeTo(writable)
```