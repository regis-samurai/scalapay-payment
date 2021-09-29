import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import fetch from 'node-fetch'

interface BodyInbound {
  body: {
    merchantReference: string
    orderExpiryMilliseconds: number
    merchant: {
      redirectConfirmUrl: string
      redirectCancelUrl: string
    }
    totalAmount: {
      amount: string
      currency: string
    }
    consumer: {
      phoneNumber: string
      givenNames: string
      surname: string
      email: string
    }
    shipping: {
      name: string
      line1: string
      suburb: string
      postcode: string
      countryCode: string
      phoneNumber: string
    }
    items: ItemData[]
  }
  inboundRequestsUrl?: string
}

interface ItemData {
  name: string
  category: string
  subcategory: []
  brand: string
  gtin: string
  sku: string
  quantity: string
  price: {
    amount: string
    currency: string
  }
}

export default class VtexPaymentClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, {
      ...options,
      timeout: 10000,
    })
  }

  public async postInbound(action: string, body: BodyInbound): Promise<any> {
    if (!body.inboundRequestsUrl) return

    const url = body.inboundRequestsUrl
      .replace(':action', action)
      .replace('https', 'http')

    delete body.inboundRequestsUrl

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Vtex-Use-Https': 'true',
        'Content-Type': 'application/json',
        vtexIdClientAutCookie: this.context.authToken,
      },
      body: JSON.stringify(body.body),
    })
      .then((res) => {
        return res.json()
      })

      .catch((e) => e)

    return response
  }
}
