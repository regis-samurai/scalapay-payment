import React, { Component, Fragment } from 'react'
import styles from './index.css'
import { bodyScalapay } from './bodyScalapay'
import { config } from './config/configScalapay'
import {
  hourglass,
  creditcard,
  interfacevtex,
  interfaceblock,
  numberoneanimated,
  numbertwoanimated,
  numberthreeanimated,
  number2,
  number3,
  checksucess,
  info,
  cancel,
  numberblock,
  retry,
  creditcarderror,
  interfaceerror
} from './config/importsAssets'
import { createOrder, captureOrder } from './services/connector'

class ModalScalapay extends Component {
  state = {
    changeImgOne: numberoneanimated,
    changeImgTwo: number2,
    changeImgThree: number3,
    creditImg: creditcard,
    messageStep2: 'Make the payment in the new Scalapay window',
    messageStep3: 'You will be returning to the store. Verify the payment',
    statusfailed: false,
    colorFont: "black",
    colorBlock: "black",
    changeImgInterface: interfacevtex,
    statusFailed2: false,
    statusFailed3: false
  }
  childWindow = null
  intervalId = null

  componentDidMount() {
    $(window).trigger('removePaymentLoading.vtex')
    window.addEventListener('message', this.handleMessages, false)

    const orderForm = vtexjs.checkout.orderForm
    // const urlRedirect = configScalapay.redirectConfirmUrl + orderForm.orderGroup

    bodyScalapay.merchant.redirectConfirmUrl = config.redirectUrl()
    bodyScalapay.merchant.redirectCancelUrl = config.redirectUrl()

    //this.fillBody(urlRedirect, orderForm)
    createOrder(bodyScalapay).then((response) => {
      if (response.token) {
        this.setState({ changeImgOne: checksucess, changeImgTwo: numbertwoanimated })

        this.childWindow = window.open(
          response.checkoutUrl,
          '_blank'
        )

        this.intervalId = setInterval(childWindowIsClosed.bind(this), 1000)

        function childWindowIsClosed() {
          if (this.childWindow?.closed) {
            clearInterval(this.intervalId)
            this.handleCloseChildWindow()
          }
        }
      }
    })
  }

  componentWillUnmount() {
    target.removeEventListener('message', this.handleMessages, false)
  }

  handleMessages = (e) => {
    if (
      e.data &&
      e.data.source === 'scalapay-checkout' &&
      e.data.event === 'payment-result'
    ) {
      const payload = e.data.payload
      this.childWindow.close()
      console.log("----------->>> ", e)
      if (payload.status === 'SUCCESS'){
        this.setState({
          changeImgTwo: checksucess,
          changeImgThree: numberthreeanimated,
        })
        captureOrder(payload.orderToken)
        .then((res) => {
          if (res.status === 'APPROVED') {
            this.setState({
              changeImgThree: checksucess,
            })
            //go to orderplace
            this.respondTransaction(true)
          } else {
            //failed del paso 3
            this.setState({
              messageStep3:
                'The payment process has been failed. Please, try another payment method',
              changeImgThree: cancel,
              colorBlock: "#DD4B39",
              changeImgInterface: interfaceerror,
              statusFailed3: true
            })
          }
        })
        .catch((err) => {
          // TODO: Informar al usuario
          console.log('captureOrder err: ', err)
        })
        .finally(() => {
          // TODO: Parar loader
        })
      }else{
        this.setState({
          creditImg: creditcarderror,
          messageStep2:
            'The payment process has been failed. Please, try another payment method',
          changeImgTwo: cancel,
          colorFont: "#DD4B39",
          colorBlock: "#c6c6c6",
          changeImgInterface: interfaceblock,
          changeImgThree: numberblock,
          statusFailed2: true,
          statusFailed3: true
        })
      }
    }
  }

  // TODO: Usar esto para redirigir a orderPlaced o informar error
  respondTransaction = (status) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  handleCloseChildWindow = () => {
    //this.setState({statusfailed: true})
    console.log('Se cierra el checkout ', this.state.statusfailed)
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
              <div className={styles.verticalLine} style={{borderColor: this.state.statusFailed2 ? "#DD4B39" : "#f9aac8"}}></div>
            </div>
            <div>
              <img
                src={this.state.changeImgTwo}
                className={styles.imgLoading}
                alt="two"
              />
              <div className={styles.verticalLine} style={{borderColor: this.state.statusFailed3 ? "#c6c6c6" : "#f9aac8"}}></div>
            </div>
            <div>
              <img src={this.state.changeImgThree} className={styles.imgLoading} alt="three" />
            </div>
          </div>

          <div className={styles.column} id={styles.column2}>
            <div className={styles.containerInfo}>
              <img src={hourglass} className={styles.imgInfo} alt="loading" />
              <p className={styles.textInfo}>
                Wait while your payment is processing
              </p>
            </div>
            <div className={styles.containerInfo}>
              <img
                src={this.state.creditImg}
                className={styles.imgInfo}
                alt="loading"
              />
              <p className={styles.textInfo} style={{color:this.state.colorFont}}>{this.state.messageStep2}</p>
              {this.state.statusfailed ? <div>
                <img src={retry} alt="retry"/>
                <p>Try the payment process again</p>
              </div> : <div />}
            </div>
            <div className={styles.containerInfo}>
              <img
                src={this.state.changeImgInterface}
                className={styles.imgInfo}
                alt="loading"
              />
              <p className={styles.textInfo} style={{color:this.state.colorBlock}}>
                {this.state.messageStep3}
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
