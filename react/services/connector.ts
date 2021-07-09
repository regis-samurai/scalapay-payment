import { bodyScalapay } from '../bodyScalapay'
import { config } from '../config/configScalapay'
import type { OrderBody } from '../shared'
import { uuid } from '../shared'

type CaptureParams = {
  paymentId: string
  token: string
  merchantReference: string
}

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  // TODO: Eliminar, se usaba cuando consumíamos la API de Scalapay directamente
  // Authorization: `Bearer ${config.token}`,
}

export async function createOrder(body: OrderBody, paymentId: string) {
  try {
    const response = await fetch(
      config.getUrl(`${paymentId}/inbound/order-detail`),
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requestId: 'LA4E20D3B4E07B7E871F5B5BC9F91',
          transactionId: '7EA2B84046B24D3F9D80DEFDD2E82935',
          paymentId,
          authorizationId: null,
          tid: null,
          requestData: {
            body: JSON.stringify(body),
          },
        }),
      }
    )

    if (response.status !== 200) throw Error(response.statusText)

    const data = await response.json()
    return data
  } catch (e) {
    throw e
  }
}

export async function captureOrder(params: CaptureParams) {
  try {
    const response = await fetch(
      config.getUrl(`${params.paymentId}/inbound/capture`),
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requestId: 'LA4E20D3B4E07B7E871F5B5BC9F91',
          transactionId: '7EA2B84046B24D3F9D80DEFDD2E82935',
          paymentId: params.paymentId,
          authorizationId: null,
          tid: null,
          requestData: {
            body: JSON.stringify({
              token: params.token,
              merchantReference: params.merchantReference,
            }),
          },
        }),
      }
    )

    if (response.status !== 200) throw Error(response.statusText)

    const data = await response.json()
    return data
  } catch (e) {
    // TODO: Validar correctamente los errores
    throw e
  }
}

export async function cancelOrder(paymentId: string) {
  try {
    const response = await fetch(config.getUrl(`${paymentId}/inbound/cancel`), {
      method: 'POST',
      headers,
    })

    if (response.status !== 200) throw Error(response.statusText)

    const data = await response.json()
    return data
  } catch (e) {
    // TODO: Validar correctamente los errores
    throw e
  }
}

export async function simulatePayments() {
  try {
    bodyScalapay.paymentId = uuid()
    const response = await fetch(config.getUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyScalapay),
    })

    if (response.status !== 200) throw Error(response.statusText)

    const data = await response.json()
    return data
  } catch (e) {
    // TODO: Validar correctamente los errores
    throw e
  }
}
