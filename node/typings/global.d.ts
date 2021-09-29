import type { ServiceContext, RecorderState } from '@vtex/api'
import type { Clients } from '../clients'

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    action: string
  }
}

export {}
