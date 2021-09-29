import { IOClients } from '@vtex/api'

import VtexPayment from './vtexPayment'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get vtexPayment() {
    return this.getOrSet('vtexPayment', VtexPayment)
  }
}
