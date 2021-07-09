import { readFile as fsReadFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

const readFile = promisify(fsReadFile)

export async function getScript(ctx: Context, next: () => Promise<void>) {
  ctx.status = 200
  ctx.type = 'text/html'

  const fileContent = await readFile(
    resolve(__dirname, '..', 'public/scalapay.html')
  )

  ctx.body = fileContent.toString()

  await next()
}
