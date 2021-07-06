import { config } from '../config/configScalapay'
import { bodyScalapay } from '../bodyScalapay'

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.token}`,
}

const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g, (c) => {
      let r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .replace(/-/g, "")
    .toUpperCase();
}

export async function createOrder(body, paymentId) {
  try {
    console.log({
      requestId: "LA4E20D3B4E07B7E871F5B5BC9F91",
      transactionId: "7EA2B84046B24D3F9D80DEFDD2E82935",
      paymentId: paymentId,
      authorizationId: null,
      tid: null,
      requestData: {
        body: JSON.stringify(body)
      }
    })
    const response = await fetch(config.getUrl(paymentId+'/inbound/order-detail'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId: "LA4E20D3B4E07B7E871F5B5BC9F91",
        transactionId: "7EA2B84046B24D3F9D80DEFDD2E82935",
        paymentId: paymentId,
        authorizationId: null,
        tid: null,
        requestData: {
          body: JSON.stringify(body)
        }
      }),
    })

    const data = await response.json()
    return data
  } catch (e) {
    return e
  }
}

export async function captureOrder(token) {
  try {
    const response = await fetch(config.getUrl('/payments/capture'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token,
      }),
    })

    const data = await response.json()
    return data
  } catch (e) {
    // TODO: Validar correctamente los errores
    return e
  }
}

export async function cancelOrder(token) {
  try {
    // const response = await fetch(config.getUrl('/payments/capture'), {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify({
    //     token,
    //   }),
    // })

    // const data = await response.json()
    // return data

    await new Promise((resolve) => setTimeout(resolve, 500))
    return true
  } catch (e) {
    // TODO: Validar correctamente los errores
    return e
  }
}



export async function simulatePayments (){
  try {
    bodyScalapay.paymentId = uuid()
    const response = await fetch(config.getUrl(''), {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyScalapay)
    })
    const data = await response.json()
    return data
  }catch (e) {
    // TODO: Validar correctamente los errores
    return e
  }
}
