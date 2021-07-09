import { method, Service } from '@vtex/api'

import { getScript } from './middlewares'

// Export a service that defines resolvers and clients' options
export default new Service({
  routes: {
    getScalapayScript: method({
      GET: [getScript],
    }),
  },
})
