import * as streams from "../mod.mjs";
import { DownloadStream } from "../DownloadStream/DownloadStream.mjs";
const chkDirect = document.getElementById("chkDirect");
const txtUrl = document.getElementById("txtUrl");
const btnConvertUrl = document.getElementById("btnConvertUrl");
const linkHolder = txtUrl.parentElement.querySelector("div");
btnConvertUrl.onclick = async () => {
    linkHolder.innerHTML = "";
    fetch(txtUrl.value, { credentials: "include" }).then(response => {
        var _a;
        if (!response.body) {
            return;
        }
        let options;
        if (!chkDirect.checked) {
            options = {
                linkHolder
            };
        }
        response.body
            .pipeThrough(new TextDecoderStream)
            .pipeThrough(new streams.JsonDeserializerStream({ lineSeparated: (_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("jsonl") }))
            .pipeThrough(new streams.CsvLineEncoder({ withNewLine: true }).transform())
            .pipeTo(new DownloadStream("download.csv", options));
    });
};
//# sourceMappingURL=JsonToCsv.download.mjs.map