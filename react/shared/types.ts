type Amount = {
  amount: string
  currency: string
}

type Item = {
  name: string
  category: string
  subcategory: string[]
  brand: string
  gtin: string
  sku: string
  quantity: number
  price: Amount
}

export interface OrderBody {
  merchantReference: string
  orderExpiryMilliseconds: number
  merchant: {
    redirectConfirmUrl: string
    redirectCancelUrl: string
  }
  totalAmount: Amount
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
  items: Item[]
}
