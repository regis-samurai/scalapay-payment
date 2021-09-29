export const config = {
  getUrl: (path?: string) =>
    `https://${window.location.host}/_v/scalapay/${path ?? ''}`,
  redirectUrl: () => `https://${window.location.host}/_v/scalapay-script`,
}
