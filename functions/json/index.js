export function onRequest(context) {
  const url = new URL(context.url)

  const rows = +(url.searchParams.get("rows") ?? "100")
  if (rows < 0 || rows > 1000) {
    return Response.error()
  }

  const data = []
  for (let i = 1; i <= rows; ++i) {
    data.push({
      id: i,
      name: `data ${i}`,
    })
  }
  return Response.json(data)
}