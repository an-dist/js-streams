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

import { CombinedTransformStream } from "../../CombinedTransformStream/CombinedTransformStream.ts"

export interface PerformanceStreamResult {
  processing: number
  total: number
  min: number
  max: number
  average: number
  median: number
}

export class PerformanceStream<I = any, O = any> {
  private transforms: TransformStream[] = []
  private measureName: string
  private startMark: string
  private endMark: string

  constructor(measureName: string, startMark: string, endMark: string) {
    this.measureName = measureName
    this.startMark = startMark
    this.endMark = endMark
  }

  pipe(transform: TransformStream) {
    this.transforms.push(transform)
    return this
  }

  build(options?: StreamPipeOptions) {
    const This = this
    return new CombinedTransformStream<I, O>(this.transforms, options, {
      start() {
        performance.clearMeasures(This.measureName)
        performance.clearMarks(`${This.measureName}.${This.startMark}`)
        performance.clearMarks(`${This.measureName}.${This.endMark}`)
      },
      transform(chunk, controller) {
        performance.mark(`${This.measureName}.${This.startMark}`)
        controller.enqueue(chunk as unknown as O)
        performance.mark(`${This.measureName}.${This.endMark}`)
        performance.measure(This.measureName, `${This.measureName}.${This.startMark}`, `${This.measureName}.${This.endMark}`)
      }
    })
  }

  result(): PerformanceStreamResult | undefined {
    const entries = performance.getEntriesByName(this.measureName)
    if (entries.length === 0) return undefined

    const durations = entries.map(e => e.duration)
    if (durations.length === 0) {
      return {
        processing: 0,
        total: 0,
        min: 0,
        max: 0,
        average: 0,
        median: 0,
      }
    }

    const totalDuration = durations.reduce((s, d) => s += d, 0.0)
    const minDuration = durations.reduce((l, r) => Math.min(l, r))
    const maxDuration = durations.reduce((l, r) => Math.max(l, r))
    const sortedDurations = [...new Set(durations.sort((l, r) => l - r))]
    const medianDurationIndex = sortedDurations.length / 2 | 0
    const medianDuration = sortedDurations.length === 0
      ? 0
      : sortedDurations.length % 2
        ? sortedDurations[medianDurationIndex]
        : sortedDurations[medianDurationIndex - 1] + sortedDurations[medianDurationIndex]

    return {
      processing: durations.length,
      total: totalDuration,
      min: minDuration,
      max: maxDuration,
      average: totalDuration / durations.length,
      median: medianDuration,
    }
  }
}