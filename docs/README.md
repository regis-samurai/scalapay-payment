# Scalapay

This project has the objective to allow it to integrate VTEX with the payment method Scalapay.
To understand better the functionality between the VTEX interface and VTEX backend or VTEX IO and Scalapay, see the architecture define below.

# [Infrastructure](https://drive.google.com/file/d/1tUmfQisKNm9cizfguKowkDU-X-bxpg7P/view?usp=sharing)

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d457c9b7-73df-4e6f-b6ab-8c62232cda9c/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d457c9b7-73df-4e6f-b6ab-8c62232cda9c/Untitled.png)

The built of this project has the following parts:

- Frontend development, where was defined the payments steps to know as should use the base project "payment standard modal" to create external integration payments.
- Develop the integration with the connector to communicate the frontend with the backend VTEX.

# Frontend Scalapay

The Scalapay integration allows making payments from VTEX checkout opening a window with Scalapay's external link. When the payment is done, the service is communicating with the VTEX backend to provide the response.

Depending on the type of response (SUCCESS or ERROR), the data will be present in the interface. If the pay response is successful, the user could see the payment information in the Order Place, but if the service response has an error, the user should choose another payment method.

To use the Scalapay method payment in the checkout choose the option as is shown in the image below

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/53c435bc-306a-4837-9a64-65b3095c8abf/Untitled.png)

The Scalapay payment method only works correctly with currency EUR. If the user tries to make the payment with another option, it will show an error in the interface.

**\*The Scalapay payment method only works correctly with currency EUR. If the user tries to make the payment with another option, the modal will show an error. If the store not has currency EUR to pay for the products, contact the VTEX team through Slack**.\*

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3a5f4cc2-78cf-4b17-a447-5dbf631b1d7a/Untitled.png)

When the pay flow is correct, the flow looks as below images.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a389a28f-1e0b-4549-8e71-f09450f2630d/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/0aaaad98-884c-4f5b-bb2e-5b2064bb1597/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5f2cc24b-9b7d-4627-96f4-80b64718048a/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8aca1fd9-04f9-41f2-b893-6658feccee6d/Untitled.png)

When you close the Scalapay window, the VTEX checkout modal shows a message to indicate the error. Also, a button appears to open the Scalapay window again and finish the payment.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ec898333-75c9-4208-8e28-4956dda59d50/Untitled.png)

But if the payment process failed in the Scalapay, the error will be shown in the modal and then the window will be reloaded to choose another payment method.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/de960304-6dbb-4013-bec7-877a281eca8e/Untitled.png)

The development of the Scalapay interface is responsive allows adjustment in many devices.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/46324cb1-a4be-432a-860f-8e91add5fbb3/Untitled.png)

The payment process has an inactivity time of 30 minutes. If completed or surpass the time, the payment will be canceled and you should start the payment process again.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5dddf496-4cdc-47e2-95cb-06d9e5958a9d/Untitled.png)

# Connector integration

To connect the front with the backend was created a folder with scripts in charge of consumption of REST service orderdetail (create order), capture (capture the order when the payment is successful), cancelation (it is used the payment failed or the modal is closed without finish the payment)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3f2f27b1-8946-49bd-94aa-d4473713536d/Untitled.png)

When the modal is open this gets the information of the payload (the payload is the VTEX backend response). If the field inboundRequestsUrl in the object has information, the request to the endpoint 'orderdetail' is started. The connector scripts contain the 'fetch' in charge of doing the request. This script uses the vtexPayment and inboundRequest. You could consider the node folder and files inside of this as the communication bridge

The inbound is the URL that VTEX assigns to you to make the backend consumption. This allows validating the payment to confirm or refuse it.

To see the source code, go to the following link:

[](https://github.com/vtex-apps/scalapay-payment)

This project uses the standard modal to create the frontend:

[](https://github.com/vtex-apps/payment-standard-modal)

The project has like base to changes the status, this was used to change the payments steps according to the service response.

```jsx
export enum States {
  Loading = 'loading', // Starting the loading, here it shows the animation
  Waiting = 'waiting', // The other steps pending
  Success = 'success', // When the connector services response is successful
  Error = 'error', // When the connector services respond with an error or request is failed.
  Active = 'active', // To show animation
  NoPayment = 'nopayment', // The payment has not yet been done in the payment Scalapay window.
  Approved = 'approved', // The payment was successful. The Scalapay window will be closed.
}
```

The response code to default is 200 (Success) and 400 (Error). However, the backend can give other codes like 500, 403, 404, depends on the error type. In the source code are captured and controlled other error codes. Depending on the error code, the interface will indicate the internal problem to the user.

```jsx
export enum Codes {
  Success = 200,
  Error = 400,
}
```

Response services default, used and taken of Standard Modal Payment

```jsx
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
```

[TEAM](https://www.notion.so/f108651bfc0c44b2898bb3a5ce1cd491)
