export const config = {
  getUrl: (path) =>
    `https://${window.location.host}/_v/api/integration-scalapay/payments/${path}`,
  redirectUrl: () => {
    const host = window.location.host; 
    return `https://${host}/_v/scalapay-script`
  }
}