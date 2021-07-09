export const config = {
  getUrl: (path?: string) =>
    `https://${window.location.host}/_v/api/integration-scalapay/payments/${
      path ?? ''
    }`,
  redirectUrl: () => `https://${window.location.host}/_v/scalapay-script`,
}
