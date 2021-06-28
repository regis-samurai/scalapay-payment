import React, { Component, Fragment } from 'react'
import styles from './index.css'
import { bodyScalapay } from './bodyScalapay'
import { config } from './config/configScalapay'
import {
  hourglass,
  creditcard,
  creditcarderror,
  interfacevtex,
  numberoneanimated,
  numbertwoanimated,
  numberthreeanimated,
  number2,
  number3,
  check,
  info,
  cancel
} from './config/importsAssets'
import { createOrder, captureOrder } from './services/connector'

class ModalScalapay extends React.Component {
  scalapayCheckout = null

  constructor(props) {
    super(props)
    this.state = {
      changeImgOne: numberoneanimated,
      changeImgTwo: number2,
      creditImg: creditcard,
      messageStep2: 'Make the payment in the new Scalapay window'
    }
  }

  componentDidMount() {
    $(window).trigger('removePaymentLoading.vtex')
    window.addEventListener('message', this.handleMessages, false)

    const orderForm = vtexjs.checkout.orderForm
    console.log('----> ', orderForm)
    // const urlRedirect = configScalapay.redirectConfirmUrl + orderForm.orderGroup

    bodyScalapay.merchant.redirectConfirmUrl = config.redirectUrl
    bodyScalapay.merchant.redirectCancelUrl = config.redirectUrl

    //this.fillBody(urlRedirect, orderForm)
    createOrder(bodyScalapay).then((response) => {
      if (response.token) {
        this.setState({ changeImgOne: check, changeImgTwo: numbertwoanimated })
        document.body.innerHTML += '<div className="backgroundModal"></div>'
        this.scalapayCheckout = window.open(
          response.checkoutUrl,
          '',
          'toolbar=no,menubar=no,width=600,height=700'
        )
        console.log('DESPUÉS de addEventListener ', modalCheckout)
      }
    })
  }

  componentWillUnmount() {
    target.removeEventListener('click', this.handleMessages, false)
  }

  handleMessages = (e) => {
    console.log('handleMessages: ', e)

    if (
      e.data &&
      e.data.source === 'scalapay-checkout' &&
      e.data.event === 'payment-result'
    ) {
      this.scalapayCheckout.close()

      // TODO: Iniciar loader
      captureOrder(e.data.orderToken)
        .then((res) => {
          if (res.status === 'APPROVED') {
            console.log("no fallo")
          } else {
            console.log("falloo")
            this.setState({creditImg: creditcarderror, messageStep2: 'The payment process has been failed. Please, try another payment method', changeImgTwo: cancel})
          }
        })
        .catch((err) => {
          // TODO: Informar al usuario
          console.log('captureOrder err: ', err)
        })
        .finally(() => {
          // TODO: Parar loader
        })
    }
  }

  // TODO: Usar esto para redirigir a orderPlaced o informar error
  respondTransaction = (status) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  fillBody = (url, order) => {
    bodyScalapay.merchant.redirectConfirmUrl = url
    bodyScalapay.merchant.redirectCancelUrl = config.redirectCancelUrl

    bodyScalapay.consumer.email = order.clientProfileData.email
    bodyScalapay.consumer.givenNames = order.clientProfileData.firstName
    bodyScalapay.consumer.surname = order.clientProfileData.lastName
    bodyScalapay.consumer.phoneNumber = order.clientProfileData.phone
    bodyScalapay.shipping.name = order.shippingData.address.receiverName
    bodyScalapay.shipping.line1 = order.shippingData.address.street
    bodyScalapay.shipping.suburb = order.shippingData.address.city
    bodyScalapay.shipping.postcode = order.shippingData.address.postalCode
    bodyScalapay.shipping.countryCode = order.shippingData.address.country

    let amount = 0
    order.totalizers.forEach((total) => {
      amount += total.value
    })

    bodyScalapay.totalAmount.amount = amount.toString().slice(1, -1)
    bodyScalapay.totalAmount.currency = order.storePreferencesData.currencyCode
    bodyScalapay.merchantReference = order.orderGroup

    order.items.forEach((items) => {
      bodyScalapay.items.push({
        name: items.name,
        category: '',
        subcategory: [''],
        brand: 'TopChoice',
        gtin: '123458791330',
        sku: '12341234',
        quantity: items.quantity,
        price: {
          amount: items.price.toString().slice(1, -1),
          currency: order.storePreferencesData.currencyCode,
        },
      })
    })
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <div id="newWindow" className=""></div>
        <div className={styles.headerModal}>
          <p className={styles.titleHeader}>Starting process payment</p>
        </div>
        <div className={styles.row}>
          <div className={styles.column} id={styles.column1}>
            <div>
              <img
                src={this.state.changeImgOne}
                className={styles.imgLoading}
                alt="one"
              />
              <div className={styles.verticalLine}></div>
            </div>
            <div>
              <img
                src={this.state.changeImgTwo}
                className={styles.imgLoading}
                alt="two"
              />
              <div className={styles.verticalLine}></div>
            </div>
            <div>
              <img src={number3} className={styles.imgLoading} alt="three" />
            </div>
          </div>

          <div className={styles.column} id={styles.column2}>
            <div className={styles.containerInfo}>
              <img src={hourglass} className={styles.imgInfo} alt="loading" />
              <p className={styles.textInfo}>
                Wait while your payment is processing
              </p>
            </div>
            {console.log("------- ",  this.state.creditImg, ' messsa ', this.state.messageStep2)}
            <div className={styles.containerInfo}>
              <img src={this.state.creditImg} className={styles.imgInfo} alt="loading" />
              <p className={styles.textInfo}>
                {this.state.messageStep2}
              </p>
            </div>
            <div className={styles.containerInfo}>
              <img
                src={interfacevtex}
                className={styles.imgInfo}
                alt="loading"
              />
              <p className={styles.textInfo}>
                You will be returning to the store. Verify the payment
              </p>
            </div>
          </div>
        </div>
        <div className={styles.containerFooter}>
          <img src={info} alt="info" />
          <p>
            Enable the pop-up to done the payment, for more information clic{' '}
            <a href="https://support.google.com/chrome/answer/95472?co=GENIE.Platform%3DDesktop&hl=en">
              here
            </a>
          </p>
        </div>
      </div>
    )
  }
}

export default ModalScalapay
