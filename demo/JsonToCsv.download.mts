import * as streams from "../mod.mjs"
import { DownloadStream, DownloadStreamOptions } from "../DownloadStream/DownloadStream.mjs"

const chkDirect = document.getElementById("chkDirect") as HTMLInputElement
const txtUrl = document.getElementById("txtUrl") as HTMLInputElement
const btnConvertUrl = document.getElementById("btnConvertUrl") as HTMLButtonElement
const linkHolder = txtUrl.parentElement!.querySelector("div") as HTMLDivElement

btnConvertUrl.onclick = async () => {
  linkHolder.innerHTML = ""
  fetch(txtUrl.value, { credentials: "include" }).then(response => {
    if (!response.body) {
      return
    }

    let options: DownloadStreamOptions | undefined
    if (!chkDirect.checked) {
      options = {
        linkHolder
      }
    }

    response.body
      .pipeThrough(new TextDecoderStream)
      .pipeThrough(new streams.JsonDeserializerStream({ lineSeparated: response.headers.get("content-type")?.includes("jsonl") }))
      .pipeThrough(new streams.CsvLineEncoder({ withNewLine: true }).transform())
      .pipeTo(new DownloadStream("download.csv", options))
  })
}