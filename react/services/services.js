export function sendPayment(urlProxy, urlBase, body) {
    return fetch(urlProxy + urlBase,  {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer qhtfs87hjnc12kkos'
      },
      body: JSON.stringify(body)}
      )
    .then(response => response.json())
    .then(data => data)
    .catch(e => e)
}