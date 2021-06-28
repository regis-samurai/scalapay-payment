import { config } from '../config/configScalapay'

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: 'Bearer qhtfs87hjnc12kkos',
}

export async function createOrder(body) {
  try {
    const response = await fetch(config.getUrl('/orders'), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
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
