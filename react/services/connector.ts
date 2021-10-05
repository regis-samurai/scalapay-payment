import { responseService } from '../shared/const'
import type { OrderBody, InboundResponse } from '../shared/types'
import { config } from '../config/configScalapay'

type CaptureParams = {
  token: string
  merchantReference: string
}

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

export async function setPayload() {
  const status = new Promise((resolve) => {
    setTimeout(() => {
      resolve(responseService.success)
    }, 3000)
  })

  return status
}

export async function createOrder(
  body: OrderBody,
  inboundRequestsUrl: InboundResponse
) {
  try {
    const data = {
      body,
      inboundRequestsUrl: inboundRequestsUrl.inboundRequestsUrl,
    }

    const response = await fetch(config.getUrl('orderdetail'), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then((res) => {
      return res.json()
    })

    return response
  } catch (e) {
    throw e
  }
}

export async function captureOrder(
  params: CaptureParams,
  inboundRequestsUrl: InboundResponse
) {
  try {
    const data = {
      body: {
        token: params.token,
        merchantReference: params.merchantReference,
      },
      inboundRequestsUrl: inboundRequestsUrl.inboundRequestsUrl,
    }

    const response = await fetch(config.getUrl('capture'), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (response.status !== 200) throw Error(response.statusText)

    const dataRes = await response.json()

    return dataRes
  } catch (e) {
    throw e
  }
}

export async function cancelOrder(inboundRequestsUrl: InboundResponse) {
  try {
    const data = {
      body: '',
      inboundRequestsUrl: inboundRequestsUrl.inboundRequestsUrl,
    }

    const response = await fetch(config.getUrl('cancelation'), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then((res) => {
      return res.json()
    })

    return response
  } catch (e) {
    throw e
  }
}
