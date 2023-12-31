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
export class DomConsole {
    constructor(owner, parent) {
        if (typeof owner === "string") {
            this.owner = document.getElementById(owner);
        }
        else {
            this.owner = owner;
        }
        this.parent = parent;
        this.holder = document.createElement("ul");
        this.holder.classList.add("console-list");
        this.owner.appendChild(this.holder);
    }
    dataToString(...data) {
        let lst = [];
        for (let i = 0; i < arguments.length; ++i) {
            switch (typeof data[i]) {
                case "string":
                    lst.push(data[i]);
                    break;
                case "number":
                case "bigint":
                case "boolean":
                    lst.push(data[i].toString());
                    break;
                case "undefined":
                    lst.push("undefined");
                    break;
                default:
                    if (Array.isArray(data[i])) {
                        const arr = data[i];
                        lst.push(`(${arr.length}) [${arr.map(v => this.dataToString(v)).join(", ")}]`);
                    }
                    else {
                        lst.push(JSON.stringify(data[i]));
                    }
                    break;
            }
        }
        return lst.join(" ");
    }
    appendItem(classSuffix, ...data) {
        const li = document.createElement("li");
        li.classList.add("console-list-item");
        if (classSuffix) {
            li.classList.add(`console-list-item-${classSuffix}`);
        }
        li.textContent = this.dataToString(...data);
        this.holder.append(li);
        return li;
    }
    group(...data) {
        if (this.child) {
            this.child.group(...data);
            return;
        }
        this.log(...data);
        this.child = new DomConsole(this.holder, this);
    }
    groupCollapsed(...data) {
        if (this.child) {
            this.child.group(...data);
            return;
        }
        this.log(...data);
        this.child = new DomConsole(this.holder, this);
    }
    groupEnd() {
        if (this.child) {
            this.child.groupEnd();
            return;
        }
        if (this.parent) {
            this.parent.child = undefined;
        }
    }
    clear() {
        if (this.parent) {
            this.parent.clear();
            return;
        }
        const oldHolder = this.holder;
        const newHolder = oldHolder.cloneNode(false);
        this.owner.replaceChild(newHolder, oldHolder);
        this.holder = newHolder;
        this.child = undefined;
    }
    assert(condition, ...data) {
        if (this.child) {
            this.child.assert(condition, ...data);
            return;
        }
        if (condition !== undefined && !condition) {
            this.appendItem("assert", "Assertion failed:", ...data);
        }
    }
    log(...data) {
        if (this.child) {
            this.child.log(...data);
            return;
        }
        this.appendItem("log", ...data);
    }
    trace(...data) {
        if (this.child) {
            this.child.trace(...data);
            return;
        }
        this.appendItem("trace", ...data);
    }
    debug(...data) {
        if (this.child) {
            this.child.debug(...data);
            return;
        }
        this.appendItem("debug", ...data);
    }
    info(...data) {
        if (this.child) {
            this.child.info(...data);
            return;
        }
        this.appendItem("info", ...data);
    }
    warn(...data) {
        if (this.child) {
            this.child.warn(...data);
            return;
        }
        this.appendItem("warn", ...data);
    }
    error(...data) {
        if (this.child) {
            this.child.error(...data);
            return;
        }
        this.appendItem("error", ...data);
    }
    createHeaderCell(textContent) {
        const headerCell = document.createElement("th");
        headerCell.textContent = textContent;
        return headerCell;
    }
    table(tabularData, properties) {
        if (this.child) {
            this.child.table(tabularData, properties);
            return;
        }
        const table = document.createElement("table");
        table.classList.add("console-list-item-table");
        const header = table.createTHead();
        const headerRow = header.insertRow(-1);
        headerRow.append(this.createHeaderCell("(index)"));
        if (Array.isArray(tabularData)) {
            for (const key in tabularData[0]) {
                if (properties) {
                    if (properties.indexOf(key) === -1) {
                        continue;
                    }
                }
                headerRow.append(this.createHeaderCell(key));
            }
        }
        else {
            headerRow.append(this.createHeaderCell("Value"));
        }
        const body = table.createTBody();
        if (tabularData) {
            if (Array.isArray(tabularData)) {
                let dataIndex = 0;
                for (const data of tabularData) {
                    const bodyRow = body.insertRow(-1);
                    bodyRow.insertCell(-1).textContent = dataIndex.toString();
                    for (const key in data) {
                        if (properties) {
                            if (properties.indexOf(key) === -1) {
                                continue;
                            }
                        }
                        bodyRow.insertCell(-1).textContent = data[key];
                    }
                    ++dataIndex;
                }
            }
            else {
                for (const key in tabularData) {
                    const bodyRow = body.insertRow(-1);
                    bodyRow.insertCell(-1).textContent = key;
                    bodyRow.insertCell(-1).textContent = tabularData[key];
                }
            }
        }
        const li = this.appendItem();
        li.append(table);
        this.holder.append(li);
    }
    count(label) {
        throw new Error("Method not implemented.");
    }
    countReset(label) {
        throw new Error("Method not implemented.");
    }
    dir(item, options) {
        throw new Error("Method not implemented.");
    }
    dirxml(...data) {
        throw new Error("Method not implemented.");
    }
    time(label) {
        throw new Error("Method not implemented.");
    }
    timeEnd(label) {
        throw new Error("Method not implemented.");
    }
    timeLog(label, ...data) {
        throw new Error("Method not implemented.");
    }
    timeStamp(label) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=DomConsole.mjs.map