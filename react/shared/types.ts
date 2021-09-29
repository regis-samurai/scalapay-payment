/* eslint-disable @typescript-eslint/no-explicit-any */
export type FunctionStep = () => Promise<void>
export type EndpointConnector = ((...args: any[]) => Promise<any>) | null

export interface DataContext {
  step: number
  head: {
    iconNumber: string
    iconNumberLoading: string
    title: string
    description: string
    iconSuccess: string
    iconError: string
    iconBlock: string
  }
  body: {
    msgLoading: string
    msgSuccess: string
    msgError: string
    msgCloseWindow?: string
    msgSessionExpired: string
    imgLoadStep: string
    imgSuccessStep: string
    imgErrorStep: string
  }
  colorFontError: string
  colorFontSuccess: string
  endpointConnector: EndpointConnector
  status: string
  retries: boolean
  retriesData: {
    img: string
    description: string
    retryFunction: (() => void) | (() => Promise<void>)
  }
  close: boolean
  closeModal: {
    img: string
    description: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    closedFunction: () => any
  }
  alert: boolean
  alertData: {
    img: string
    description: string
    type: string
    url: string
  }
}

export interface HeadModal {
  step: number
  head: {
    title: string
    img: string
    description: string
    colorFont: string
  }
  status?: string
  functionStep: EndpointConnector
}

export interface BodyModal {
  img: string
  description: string
  colorFont: string
  showSupport: boolean
  dataSupport: {
    img: string
    description: string
    supportFunction: () => any
  }
  alert: boolean
  alertData: {
    img: string
    description: string
    type: string
    url: string
  }
}

export interface Response {
  code: number
  message: string
  status: string
}

export interface ModalContext {
  headModal: HeadModal[]
  bodyModal: BodyModal
  updateSteps: (step: number) => void
  orderForm: OrderBody
  appPayload: string
}

export type OrderAmount = {
  amount: string
  currency: string
}

export type OrderItem = {
  name: string
  category: string
  subcategory: string[]
  brand: string
  gtin: string
  sku: string
  quantity: number
  price: OrderAmount
}

export interface OrderBody {
  merchantReference: string
  orderExpiryMilliseconds: number
  merchant: {
    redirectConfirmUrl: string
    redirectCancelUrl: string
  }
  totalAmount: OrderAmount
  consumer: {
    phoneNumber: string
    givenNames: string
    surname: string
    email: string
  }
  shipping: {
    name: string
    line1: string
    suburb: string
    postcode: string
    countryCode: string
    phoneNumber: string
  }
  items: OrderItem[]
}

export interface InboundResponse {
  inboundRequestsUrl: string
  messageError: string | null
}

export interface ResponseConnector {
  checkoutUrl: string
  expiresDate: string
  token: string
}
