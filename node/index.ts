import type { ClientsConfig } from '@vtex/api'
import { method, Service, LRUCache } from '@vtex/api'

import { getScript } from './middlewares'
import { Clients } from './clients'
import { inboundRequest } from './middlewares/inboundRequest'
import { validate } from './middlewares/validate'

const TIMEOUT_MS = 10000

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('inboundRequest', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    inboundRequest: {
      memoryCache,
    },
  },
}

// Export a service that defines resolvers and clients' options
export default new Service({
  clients,
  routes: {
    getScalapayScript: method({
      GET: [getScript],
    }),
    inboundRequestsUrl: method({
      POST: [validate, inboundRequest],
    }),
  },
})
