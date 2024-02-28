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

import { PullPush, PullPushNonQueue, PullPushTypes } from "../PullPush/PullPush.ts"

const BASE64_BIT_TO_CHAR = new Map<string, string>([
  ["000000", "A"], ["000001", "B"], ["000010", "C"], ["000011", "D"], ["000100", "E"],
  ["000101", "F"], ["000110", "G"], ["000111", "H"], ["001000", "I"], ["001001", "J"],
  ["001010", "K"], ["001011", "L"], ["001100", "M"], ["001101", "N"], ["001110", "O"],
  ["001111", "P"], ["010000", "Q"], ["010001", "R"], ["010010", "S"], ["010011", "T"],
  ["010100", "U"], ["010101", "V"], ["010110", "W"], ["010111", "X"], ["011000", "Y"],
  ["011001", "Z"],
  ["011010", "a"], ["011011", "b"], ["011100", "c"], ["011101", "d"], ["011110", "e"],
  ["011111", "f"], ["100000", "g"], ["100001", "h"], ["100010", "i"], ["100011", "j"],
  ["100100", "k"], ["100101", "l"], ["100110", "m"], ["100111", "n"], ["101000", "o"],
  ["101001", "p"], ["101010", "q"], ["101011", "r"], ["101100", "s"], ["101101", "t"],
  ["101110", "u"], ["101111", "v"], ["110000", "w"], ["110001", "x"], ["110010", "y"],
  ["110011", "z"],
  ["110100", "0"], ["110101", "1"], ["110110", "2"], ["110111", "3"], ["111000", "4"],
  ["111001", "5"], ["111010", "6"], ["111011", "7"], ["111100", "8"], ["111101", "9"],
  ["111110", "+"], ["111111", "/"],
])

const BASE64_CHAR_TO_BIT = new Map<string, string>((function* () {
  for (const entry of BASE64_BIT_TO_CHAR.entries()) {
    yield [entry[1], entry[0]]
  }
})())

export class Base64Encoder extends PullPush<ArrayBufferLike | ArrayLike<number>, string, PullPushNonQueue<ArrayBufferLike | ArrayLike<number>, string>> {
  private inputBuffer: number[] = []
  private outputBuffer: string[] = []

  constructor() {
    super(new PullPushNonQueue)
  }

  override async push(data?: PullPushTypes<ArrayBufferLike | ArrayLike<number>>) {
    if (!data) {
      return
    }
    for (const n of (data as any as Iterable<number>)) {
      for (const c of n.toString(2).padStart(8, "0")) {
        if (c === "0") this.inputBuffer.push(0)
        else if (c === "1") this.inputBuffer.push(1)
      }
    }
  }

  async *pullpush(data?: PullPushTypes<ArrayBufferLike | ArrayLike<number>>, flush?: boolean) {
    await this.push(data)

    do {
      while (this.inputBuffer.length >= 6) {
        const bits = this.inputBuffer.splice(0, 6).join("")
        this.outputBuffer.push(BASE64_BIT_TO_CHAR.get(bits)!)
      }

      while (this.outputBuffer.length >= 4) {
        const next: PullPushTypes<ArrayBufferLike | ArrayLike<number>>
          = yield this.outputBuffer.splice(0, 4).join("")
        await this.push(next)
      }

      if (flush) {
        if (this.inputBuffer.length > 0) {
          const bits = this.inputBuffer.splice(0, 6).join("").padEnd(6, "0")
          this.outputBuffer.push(BASE64_BIT_TO_CHAR.get(bits)!)
          const next: PullPushTypes<ArrayBufferLike | ArrayLike<number>>
            = yield this.outputBuffer.splice(0, 4).join("").padEnd(4, "=")
          await this.push(next)
        }
      }
      else {
        break
      }
    } while (this.inputBuffer.length > 0)
  }
}

export class Base64Decoder extends PullPush<string, Uint8Array, PullPushNonQueue<string, Uint8Array>> {
  private inputBuffer: number[] = []
  private outputBuffer: number[] = []

  constructor() {
    super(new PullPushNonQueue)
  }

  override async push(data?: PullPushTypes<string>) {
    if (!data) {
      return
    }
    for (const s of (data as any as Iterable<string>)) {
      for (const n of BASE64_CHAR_TO_BIT.get(s) ?? "") {
        if (n === "0") this.inputBuffer.push(0)
        else if (n === "1") this.inputBuffer.push(1)
      }
    }
  }

  async *pullpush(data?: PullPushTypes<string>, flush?: boolean) {
    await this.push(data)

    do {
      while (this.inputBuffer.length >= 8) {
        const byte = this.inputBuffer.splice(0, 8).join("")
        this.outputBuffer.push(parseInt(byte, 2))
      }

      if (this.outputBuffer.length > 0) {
        const next: PullPushTypes<string> = yield new Uint8Array(this.outputBuffer)
        this.outputBuffer.length = 0
        await this.push(next)
      }

      if (flush) {
        this.inputBuffer.length = 0
        this.outputBuffer.length = 0
      }
      else {
        break
      }
    } while (this.inputBuffer.length > 0)
  }
}