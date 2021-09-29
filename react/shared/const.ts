/* eslint-disable no-restricted-syntax */

export const responseService = {
  success: { code: 200, message: 'Ok', status: 'success' },
  notFound: { code: 404, message: 'Data Not Found', status: 'not_found' },
  internalServerError: {
    code: 500,
    message: 'Internal Server Error',
    status: 'internal_server_error',
  },
  forbidden: { code: 403, message: 'Invalid data', status: 'forbidden' },
  unauthorized: {
    code: 401,
    message: 'Authentication is required',
    status: 'unauthorized',
  },
  badRequest: { code: 400, message: 'Invalid request', status: 'bad_request' },
} as const

export const dataBody = {
  img: '',
  description: '',
  colorFont: '',
  showSupport: false,
  dataSupport: {
    img: '',
    description: '',
    supportFunction: () => {},
  },
  alert: false,
  alertData: {
    img: '',
    description: '',
    type: '',
    url: '',
  },
} as const

export enum States {
  Loading = 'loading',
  Waiting = 'waiting',
  Success = 'success',
  Error = 'error',
  Active = 'active',
  NoPayment = 'nopayment',
  Approved = 'approved',
}

export enum Codes {
  Success = 200,
  Error = 400,
}

export const DataForm = {
  merchantReference: '',
  orderExpiryMilliseconds: 0,
  merchant: {
    redirectConfirmUrl: '',
    redirectCancelUrl: '',
  },
  totalAmount: {
    amount: '',
    currency: '',
  },
  consumer: {
    phoneNumber: '',
    givenNames: '',
    surname: '',
    email: '',
  },
  shipping: {
    name: '',
    line1: '',
    suburb: '',
    postcode: '',
    countryCode: '',
    phoneNumber: '',
  },
  items: [
    {
      name: '',
      category: '',
      subcategory: [],
      brand: '',
      gtin: '',
      sku: '',
      quantity: 0,
      price: {
        amount: '',
        currency: '',
      },
    },
  ],
}
