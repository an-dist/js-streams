/// <reference lib="es2021" />
import esbuild from "esbuild"
import fs from "node:fs"
import FastGlob from "fast-glob"
import asc from "assemblyscript/dist/asc.js"

// Cleanup
console.group("Cleanup")
{
  const files = new Set(
    (await FastGlob("dist/{**,.**}/*.min.*"))
      .concat(await FastGlob("dist/{**,.**}/*.map"))
  )
  console.log(files)

  for (const file of files) {
    fs.rmSync(file)
  }
}
console.groupEnd()

// Transpiling. (build.ts -> build.js)
console.group("Transpiling. (build.ts -> build.js)")
{
  let file = "build.ts"
  console.log([file])

  const options: esbuild.BuildOptions = {
    platform: "browser",
    format: "esm",
    entryPoints: [file],
    outdir: ".",
    allowOverwrite: true,
  }
  const context = await esbuild.context(options)
  try {
    await context.rebuild()
  }
  finally {
    await context.dispose()
  }
}
console.groupEnd()

// Transpiling. (build_sitemap.ts -> build_sitemap.js)
console.group("Transpiling. (build_sitemap.ts -> build_sitemap.js)")
{
  let file = "build_sitemap.ts"
  console.log([file])

  const options: esbuild.BuildOptions = {
    platform: "browser",
    format: "esm",
    entryPoints: [file],
    outdir: ".",
    allowOverwrite: true,
  }
  const context = await esbuild.context(options)
  try {
    await context.rebuild()
  }
  finally {
    await context.dispose()
  }
}
console.groupEnd()

// Transpiling. (test_runner.ts -> test_runner.js)
console.group("Transpiling. (test_runner.ts -> test_runner.js)")
{
  let file = "test_runner.ts"
  console.log([file])

  const options: esbuild.BuildOptions = {
    platform: "browser",
    format: "esm",
    entryPoints: [file],
    outdir: ".",
    allowOverwrite: true,
  }
  const context = await esbuild.context(options)
  try {
    await context.rebuild()
  }
  finally {
    await context.dispose()
  }

  file = file.replace(".ts", ".js")

  let text = fs.readFileSync(file, "utf-8")
  text = text.replaceAll(".ts", ".js")
  fs.writeFileSync(file, text)
}
console.groupEnd()

// Transpiling. (.wasm.ts -> .wasm -> .wasm.loader.ts)
console.group("Transpiling. (.wasm.ts -> .wasm -> .wasm.loader.ts)")
{
  const files = (await FastGlob("dist/{**,.**}/*.wasm.ts"))
    .filter(x => !x.includes("/functions/"))
    .filter(x => !x.includes(".min."))

  const license = `/*!\n${fs.readFileSync("LICENSE", "utf-8")}\n*/`

  for (const file of files) {
    const wasm = file.replaceAll(".wasm.ts", ".wasm")
    const loader = wasm.replaceAll(".wasm", ".wasm.loader.ts")

    const args = [file, "-o", wasm, "-Ospeed"]
    console.log(file, args)

    const { error } = await asc.main(args)
    if (error) {
      console.error(error)
      throw error
    }

    const binary = Array.from(new Uint8Array(fs.readFileSync(wasm).buffer))

    fs.writeFileSync(loader, [license, `
export class Loader {
  private static binary = [${binary.join(", ")}]

  static instance() {
    return new WebAssembly.Instance(
      new WebAssembly.Module(new Uint8Array(Loader.binary)),
      {
        env: {
          abort: () => { throw new Error() }
        }
      }).exports
  }
}`].join("\n"), "utf-8")
  }
}
console.groupEnd()

// Transpiling. (.ts -> .js)
console.group("Transpiling. (.ts -> .js)")
{
  const files = (await FastGlob("dist/{**,.**}/*.ts"))
    .filter(x => !x.includes("/functions/"))
    .filter(x => !x.includes(".min."))
    .filter(x => !x.includes(".wasm.") || x.includes(".wasm.loader."))
  console.log(files)

  const options: esbuild.BuildOptions = {
    platform: "browser",
    format: "esm",
    entryPoints: files,
    outdir: "dist",
    allowOverwrite: true,
    sourcemap: "linked",
  }
  const context = await esbuild.context(options)
  try {
    await context.rebuild()
  }
  finally {
    await context.dispose()
  }

  for (const file of files.map(x => x.replace(".ts", ".js"))) {
    let text = fs.readFileSync(file, "utf-8")
    text = text.replaceAll(".ts", ".js")
    fs.writeFileSync(file, text)
  }
}
console.groupEnd()

// Transpiling. (.js -> .min.js)
console.group("Transpiling. (.js -> .min.js)")
{
  const files = (await FastGlob("dist/{**,.**}/*.js"))
    .filter(x => !x.includes("/functions/"))
    .filter(x => !x.includes(".min."))
  console.log(files)

  for (let file of files) {
    const options: esbuild.BuildOptions = {
      platform: "browser",
      format: "esm",
      entryPoints: [file],
      outdir: file.split("/").slice(0, -1).join("/"),
      allowOverwrite: true,
      minify: true,
      sourcemap: "linked",
      loader: {
        ".js": "js",
      },
      outExtension: {
        ".js": ".min.js",
      }
    }
    const context = await esbuild.context(options)
    try {
      await context.rebuild()
    }
    finally {
      await context.dispose()
    }

    file = file.replace(".js", ".min.js")
    let text = fs.readFileSync(file, "utf-8")
    text = text.replaceAll(".min.js", ".min.xx")
    text = text.replaceAll(".js", ".min.js")
    text = text.replaceAll(".min.xx", ".min.js")
    fs.writeFileSync(file, text)
  }
}
console.groupEnd()

// Transpiling. (.css -> .min.css)
console.group("Transpiling. (.css -> .min.css)")
{
  const files = (await FastGlob("dist/{**,.**}/*.css"))
    .filter(x => !x.includes("/functions/"))
    .filter(x => !x.includes(".min."))
  console.log(files)

  for (let file of files) {
    const options: esbuild.BuildOptions = {
      platform: "browser",
      format: "esm",
      entryPoints: [file],
      outdir: file.split("/").slice(0, -1).join("/"),
      allowOverwrite: true,
      minify: true,
      sourcemap: "linked",
      loader: {
        ".css": "css",
      },
      outExtension: {
        ".css": ".min.css",
      }
    }
    const context = await esbuild.context(options)
    try {
      await context.rebuild()
    }
    finally {
      await context.dispose()
    }

    file = file.replace(".css", ".min.css")
    let text = fs.readFileSync(file, "utf-8")
    text = text.replaceAll(".min.css", ".min.xx")
    text = text.replaceAll(".css", ".min.css")
    text = text.replaceAll(".min.xx", ".min.css")
    fs.writeFileSync(file, text)
  }
}
console.groupEnd()