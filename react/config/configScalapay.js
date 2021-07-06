const TEMP_URL_PROXY = 'https://cors-anywhere.herokuapp.com'
export const config = {
  getUrl: (path) =>
    `${TEMP_URL_PROXY}/https://staging.api.scalapay.com/v2${path}`,
  redirectUrl: () => {
    const host = window.location.host; 
    return `https://${host}/_v/scalapay-script`
  },
  token: 'sp_25pejliikq2i7m4t',
}