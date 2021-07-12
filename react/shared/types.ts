import type { CSSProperties } from 'react'

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

export interface StepState {
  imgNumber: string
  imgBlock: string
  message?: string
  statusFailed: boolean | null
  blockStyles?: CSSProperties
}

export interface ModalState {
  stepOne: StepState
  stepTwo: StepState
  stepThree: StepState
  showReload: boolean
  childWindowClosedUnexpectedly: boolean
  paymentCancel: boolean
}
