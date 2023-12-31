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

export class DomConsole implements Console {
  owner: Node
  redirect?: Console
  parent: DomConsole | undefined
  child: DomConsole | undefined
  holder: HTMLUListElement

  constructor(owner: Node | string, redirect?: Console, parent?: DomConsole) {
    if (typeof owner === "string") {
      this.owner = document.getElementById(owner) as Node
      const scopedStyle = document.createElement("style")
      scopedStyle.setAttribute("scoped", "")
      scopedStyle.textContent = `
        .console-list>.console-list-item>input[type="checkbox"]:not(:checked)~.console-list {
          display: none;
        }
        .console-list>.console-list-item>input[type="checkbox"]:checked~.console-list {
          display: block;
        }`
      this.owner.appendChild(scopedStyle)
    }
    else {
      this.owner = owner
    }
    this.redirect = redirect
    this.parent = parent
    this.holder = document.createElement("ul")
    this.holder.classList.add("console-list")
    this.owner.appendChild(this.holder)
  }

  private dataToString(...data: any[]): string {
    let lst: string[] = []
    for (let i = 0; i < arguments.length; ++i) {
      switch (typeof data[i]) {
        case "string":
          lst.push(data[i])
          break
        case "number":
        case "bigint":
        case "boolean":
          lst.push(data[i].toString())
          break
        case "undefined":
          lst.push("undefined")
          break
        default:
          if (Array.isArray(data[i])) {
            const arr = data[i] as Array<any>
            lst.push(`(${arr.length}) [${arr.map(v => this.dataToString(v)).join(", ")}]`)
          }
          else {
            lst.push(JSON.stringify(data[i]))
          }
          break
      }
    }
    return lst.join(" ")
  }

  private appendItem(classSuffix?: string, ...data: any[]): HTMLLIElement {
    const li = document.createElement("li")
    li.classList.add("console-list-item")
    if (classSuffix) {
      li.classList.add(`console-list-item-${classSuffix}`)
    }
    li.textContent = this.dataToString(...data)
    this.holder.append(li)
    return li
  }

  private toNextHolder(collapsed: boolean, ...data: any[]) {
    const current = this.appendItem("log", ...data)
    const chk = document.createElement("input")
    chk.name = "table-visibility"
    chk.type = "checkbox"
    chk.checked = !collapsed
    current.prepend(chk)
    this.child = new DomConsole(current, this.redirect, this)
  }

  group(...data: any[]): void {
    if (this.child) {
      this.child.group(...data)
      return
    }
    this.toNextHolder(false, ...data)
    this.redirect?.group(...data)
  }

  groupCollapsed(...data: any[]): void {
    if (this.child) {
      this.child.groupCollapsed(...data)
      return
    }
    this.toNextHolder(true, ...data)
    this.redirect?.groupCollapsed(...data)
  }

  groupEnd(): void {
    if (this.child) {
      this.child.groupEnd()
      return
    }
    if (this.parent) {
      this.parent.child = undefined
    }
    this.redirect?.groupEnd()
  }

  clear(): void {
    if (this.parent) {
      this.parent.clear()
      return
    }
    const oldHolder = this.holder
    const newHolder = oldHolder.cloneNode(false)
    this.owner.replaceChild(newHolder, oldHolder)
    this.holder = newHolder as HTMLUListElement
    this.child = undefined
    this.redirect?.clear()
  }

  assert(condition?: boolean | undefined, ...data: any[]): void {
    if (this.child) {
      this.child.assert(condition, ...data)
      return
    }
    if (condition !== undefined && !condition) {
      this.appendItem("assert", "Assertion failed:", ...data)
    }
    this.redirect?.assert(...data)
  }

  log(...data: any[]): void {
    if (this.child) {
      this.child.log(...data)
      return
    }
    this.appendItem("log", ...data)
    this.redirect?.log(...data)
  }

  trace(...data: any[]): void {
    if (this.child) {
      this.child.trace(...data)
      return
    }
    this.appendItem("trace", ...data)
    this.redirect?.trace(...data)
  }

  debug(...data: any[]): void {
    if (this.child) {
      this.child.debug(...data)
      return
    }
    this.appendItem("debug", ...data)
    this.redirect?.debug(...data)
  }

  info(...data: any[]): void {
    if (this.child) {
      this.child.info(...data)
      return
    }
    this.appendItem("info", ...data)
    this.redirect?.info(...data)
  }

  warn(...data: any[]): void {
    if (this.child) {
      this.child.warn(...data)
      return
    }
    this.appendItem("warn", ...data)
    this.redirect?.warn(...data)
  }

  error(...data: any[]): void {
    if (this.child) {
      this.child.error(...data)
      return
    }
    this.appendItem("error", ...data)
    this.redirect?.error(...data)
  }

  private createHeaderCell(textContent: string) {
    const headerCell = document.createElement("th")
    headerCell.textContent = textContent
    return headerCell
  }

  table(tabularData?: any, properties?: string[] | undefined): void {
    if (this.child) {
      this.child.table(tabularData, properties)
      return
    }
    const table = document.createElement("table")
    table.classList.add("console-list-item-table")
    const header = table.createTHead()
    const headerRow = header.insertRow(-1)
    headerRow.append(this.createHeaderCell("(index)"))
    if (Array.isArray(tabularData)) {
      for (const key in tabularData[0]) {
        if (properties) {
          if (properties.indexOf(key) === -1) {
            continue
          }
        }
        headerRow.append(this.createHeaderCell(key))
      }
    }
    else {
      headerRow.append(this.createHeaderCell("Value"))
    }
    const body = table.createTBody()
    if (tabularData) {
      if (Array.isArray(tabularData)) {
        let dataIndex = 0
        for (const data of tabularData) {
          const bodyRow = body.insertRow(-1)
          bodyRow.insertCell(-1).textContent = dataIndex.toString()
          for (const key in data) {
            if (properties) {
              if (properties.indexOf(key) === -1) {
                continue
              }
            }
            bodyRow.insertCell(-1).textContent = data[key]
          }
          ++dataIndex
        }
      }
      else {
        for (const key in tabularData) {
          const bodyRow = body.insertRow(-1)
          bodyRow.insertCell(-1).textContent = key
          bodyRow.insertCell(-1).textContent = tabularData[key]
        }
      }
    }
    const li = this.appendItem()
    li.append(table)
    this.holder.append(li)
    this.redirect?.table(tabularData, properties)
  }

  /*! Not implemented. **/

  count(label?: string | undefined): void {
    if (this.child) {
      this.child.count(label)
      return
    }
    this.redirect?.count(label)
  }

  countReset(label?: string | undefined): void {
    if (this.child) {
      this.child.countReset(label)
      return
    }
    this.redirect?.countReset(label)
  }

  dir(item?: any, options?: any): void {
    if (this.child) {
      this.child.dir(item, options)
      return
    }
    this.redirect?.dir(item, options)
  }

  dirxml(...data: any[]): void {
    if (this.child) {
      this.child.dirxml(...data)
      return
    }
    this.redirect?.dirxml(...data)
  }

  time(label?: string | undefined): void {
    if (this.child) {
      this.child.time(label)
      return
    }
    this.redirect?.time(label)
  }

  timeEnd(label?: string | undefined): void {
    if (this.child) {
      this.child.timeEnd(label)
      return
    }
    this.redirect?.timeEnd(label)
  }

  timeLog(label?: string | undefined, ...data: any[]): void {
    if (this.child) {
      this.child.timeLog(label, ...data)
      return
    }
    this.redirect?.timeLog(label, ...data)
  }

  timeStamp(label?: string | undefined): void {
    if (this.child) {
      this.child.timeStamp(label)
      return
    }
    this.redirect?.timeStamp(label)
  }
}