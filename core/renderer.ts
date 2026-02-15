export function renderHTML(title: string, body: string) {
  return `
  <!DOCTYPE html>
  <html lang="tr">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
      <main style="max-width:800px;margin:40px auto;font-family:sans-serif">
        <h1>${title}</h1>
        <article>${body}</article>
      </main>
    </body>
  </html>
  `;
}
