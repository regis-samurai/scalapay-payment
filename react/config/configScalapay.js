const TEMP_URL_PROXY = 'https://cors-anywhere.herokuapp.com'

export const config = {
  getUrl: (path) =>
    `${TEMP_URL_PROXY}/https://staging.api.scalapay.com/v2${path}`,
  redirectUrl: 'https://scalapay--vtexeurope.myvtex.com/_v/scalapay-script',
  token: 'qhtfs87hjnc12kkos',
}
