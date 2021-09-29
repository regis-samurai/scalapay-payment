import { ResolverError } from '@vtex/api'
import { json } from 'co-body'

export async function inboundRequest(ctx: Context, next: () => Promise<any>) {
  const {
    state: { action },
    clients: { vtexPayment },
  } = ctx

  const body = await json(ctx.req)

  try {
    const response = await vtexPayment.postInbound(action, body)

    ctx.status = 200
    ctx.body = response
  } catch (error) {
    throw new ResolverError(error, 400)
  }

  await next()
}
