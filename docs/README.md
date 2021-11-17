




![Screenshot_55](https://user-images.githubusercontent.com/8409481/136115707-4cc1432c-f91a-40db-983a-92fefd8739d8.png)

# Scalapay Connector - Install and configuration

**Note**: For more information go to the GitHub repository **[scalapay-connector](https://github.com/vtex-apps/scalapay-connector)**.

1. Install `vtex.integration-scalapay` in your account.

```powershell
vtex install vtex.integration-scalapay 0.1.x
```

2. Then go to admin account in module  `Transactions/Payments/Settings` , in tab `Gateway affiliations`  search Scalapay and click in Scalapay.

    ![firefox_V3BrAtA606](https://user-images.githubusercontent.com/14004558/136470692-4d1ec4c5-fab5-4476-9a87-969a93414256.png)
    
3. Field fileds:
    - Fill in the `Application Key` field with the vtex account name.
    - Fill in the `Application Token` field with the token assigned for the Scalapay account.
    - `Workspace` with the name of the default development environment for testing is master.
    
    ![firefox_ZIkZaRQY3T](https://user-images.githubusercontent.com/14004558/136470862-88ffd401-f981-42f4-a6d0-8ba69d70a580.png)

    **Note**: If the Scalapay `Application Token` field is not filled, the connector will not work.


# Scalapay

This project has the objective to allow it to integrate VTEX with the payment method Scalapay.
To understand better the functionality between the VTEX interface and VTEX backend or VTEX IO and Scalapay, see the architecture define below.

![Untitled (18)](https://user-images.githubusercontent.com/8409481/136115659-f0203a0e-6302-418b-9165-2e828bd20adb.png)


The built of this project has the following parts:

- Frontend development, where was defined the payments steps to know as should use the base project "payment standard modal" to create external integration payments.
- Develop the integration with the connector to communicate the frontend with the backend VTEX.

# Frontend Scalapay

The Scalapay integration allows making payments from VTEX checkout opening a window with Scalapay's external link. When the payment is done, the service is communicating with the VTEX backend to provide the response.

Depending on the type of response (SUCCESS or ERROR), the data will be present in the interface. If the pay response is successful, the user could see the payment information in the Order Place, but if the service response has an error, the user should choose another payment method.

To use the Scalapay method payment in the checkout choose the option as is shown in the image below

![Untitled (19)](https://user-images.githubusercontent.com/8409481/136115790-7d559dcd-b7fd-49ac-b3b1-b1259e7c435d.png)


The Scalapay payment method only works correctly with currency EUR. If the user tries to make the payment with another option, it will show an error in the interface.

**\*The Scalapay payment method only works correctly with currency EUR. If the user tries to make the payment with another option, the modal will show an error. If the store not has currency EUR to pay for the products, contact the VTEX team through Slack**.\*

<img src="https://user-images.githubusercontent.com/8409481/136115819-48c0e4c1-9909-48f5-862b-c08f30560e9e.png" width="700" height="400" />


When the pay flow is correct, the flow looks as below images.

<img src="https://user-images.githubusercontent.com/8409481/136115852-d9828689-7c73-49a8-97b6-ba5d124e555a.png" width="700" height="400" />

<img src="https://user-images.githubusercontent.com/8409481/136115857-8a28b777-4c97-44a5-8137-7feefb4bc326.png" width="700" height="400" />

<img src="https://user-images.githubusercontent.com/8409481/136115858-3c40ab37-43d4-4ae7-bd04-5aa6312bfb0d.png" width="700" height="400" />

<img src="https://user-images.githubusercontent.com/8409481/136115861-a0871a93-fd20-468c-8837-ece96c887d64.png" width="700" height="400" />


When you close the Scalapay window, the VTEX checkout modal shows a message to indicate the error. Also, a button appears to open the Scalapay window again and finish the payment.

<img src="https://user-images.githubusercontent.com/8409481/136115980-860819d9-53d2-4a08-bd94-e5ad49aa46e0.png" width="700" height="400" />


But if the payment process failed in the Scalapay, the error will be shown in the modal and then the window will be reloaded to choose another payment method.

<img src="https://user-images.githubusercontent.com/8409481/136116017-5807957e-2586-4756-9a8d-41a15f9962a9.png" width="700" height="400" />


The development of the Scalapay interface is responsive allows adjustment in many devices.

![Untitled (27)](https://user-images.githubusercontent.com/8409481/136116040-b1b696a4-e6a0-4868-b891-fa6d99f3695c.png)

The payment process has an inactivity time of 30 minutes. If completed or surpass the time, the payment will be canceled and you should start the payment process again.

<img src="https://user-images.githubusercontent.com/8409481/136116073-34fc683b-bee6-452c-826e-38a2cf60a683.png" width="700" height="400" />

# Connector integration

To connect the front with the backend was created a folder with scripts in charge of consumption of REST service orderdetail (create order), capture (capture the order when the payment is successful), cancelation (it is used the payment failed or the modal is closed without finish the payment)

![Untitled (29)](https://user-images.githubusercontent.com/8409481/136116104-046b728c-4dec-4d2b-bdfb-9004b6c2b950.png)

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
