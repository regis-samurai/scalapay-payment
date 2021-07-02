import React, { Component } from 'react'
import { intlShape, injectIntl } from 'react-intl'
import { bodyScalapay } from './bodyScalapay'
import { config } from './config/configScalapay'
import {
  cancel,
  checksucess,
  creditcard,
  creditcarderror,
  hourglass,
  info,
  interfaceblock,
  interfaceerror,
  interfacevtex,
  number2,
  number3,
  numberblock,
  numberoneanimated,
  numberthreeanimated,
  numbertwoanimated,
  retry,
} from './config/importsAssets'
import styles from './index.css'
import { captureOrder, createOrder } from './services/connector'

/*const messages = defineMessages({
  step2: {
    id: 'scalapay.step.step2',
    defaultMessage: '',
  }
})*/

class ModalScalapay extends Component {
  state = {
    changeImgOne: numberoneanimated,
    changeImgTwo: number2,
    changeImgThree: number3,
    changeImgInterface: interfacevtex,
    creditImg: creditcard,
    messageStep2: 'scalapay.step.step2',
    messageStep3: 'scalapay.step.step3',
    colorFont: 'black',
    colorBlock: 'black',
    statusFailed: null, // null | true | false
    statusFailed2: null, // null | true | false
    statusFailed3: null, // null | true | false,
    showReload: false,
    childWindowClosedUnexpectedly: false,
  }
  childWindow = null
  intervalId = null
  checkoutUrl = {
    value: null,
    expires: null,
  }

  componentDidMount() {
    const orderForm = vtexjs.checkout.orderForm
    console.log("")
    $(window).trigger('removePaymentLoading.vtex')
    window.addEventListener('message', this.handleMessages, false)

    bodyScalapay.merchant.redirectConfirmUrl = config.redirectUrl()
    bodyScalapay.merchant.redirectCancelUrl = config.redirectUrl()

    // this.fillBody(urlRedirect, orderForm)
    this.backdrop()
    this.getCheckoutUrl()
  }

  componentWillUnmount() {
    target.removeEventListener('message', this.handleMessages, false)
  }

  getCheckoutUrl = () => {
    createOrder(bodyScalapay).then((response) => {
      const { token, checkoutUrl, expires } = response

      if (token) {
        this.setState({
          changeImgOne: checksucess,
          changeImgTwo: numbertwoanimated,
        })
        this.checkoutUrl = {
          value: checkoutUrl,
          expires,
        }
        this.createChildWindow()
      }
    })
  }

  createChildWindow = () => {
    console.log('checkoutUrl: ', this.checkoutUrl)

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.childWindow = window.open(this.checkoutUrl.value, '_blank')
    this.intervalId = setInterval(childWindowIsClosed.bind(this), 1000)

    function childWindowIsClosed() {
      if (this.childWindow?.closed) {
        clearInterval(this.intervalId)
        this.handleCloseChildWindow()
      }
    }
  }

  handleMessages = (e) => {
    if (
      e.data &&
      e.data.source === 'scalapay-checkout' &&
      e.data.event === 'payment-result'
    ) {
      const payload = e.data.payload
      this.childWindow.close()

      if (payload.status === 'SUCCESS') {
        this.setState({
          changeImgTwo: checksucess,
          changeImgThree: numberthreeanimated,
          statusFailed2: false,
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
                messageStep3: 'scalapay.process.failedPayment',
                changeImgThree: cancel,
                colorBlock: '#DD4B39',
                changeImgInterface: interfaceerror,
                statusFailed3: true,
                showReload: true
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
      } else {
        this.setState({
          creditImg: creditcarderror,
          messageStep2: 'scalapay.process.failedPayment',
          changeImgTwo: cancel,
          colorFont: '#DD4B39',
          colorBlock: '#c6c6c6',
          changeImgInterface: interfaceblock,
          changeImgThree: numberblock,
          statusFailed2: true,
          statusFailed3: true,
          showReload: true
        })
      }
    }
  }

  // TODO: Usar esto para redirigir a orderPlaced o informar error
  respondTransaction = (status) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  backdrop = (active = true) => {
    const $div = $('#scalapay-background');
    
    if (active && !$div.length) {
      const el = document.createElement('div')

      $(el)
        .attr('id', 'scalapay-background')
        .css({
          'background-color': 'rgba(0,0,0,0.8)',
          position: 'fixed',
          width: '100%',
          height: '100vh',
          top: 0,
          'z-index': '100',
        })
        .appendTo($('body'))
    }

    if (!active && $div.length) {
      $div.remove()
    }
  }

  retryPayment = () => {
    const checkoutUrlExpiresDate = new Date(this.checkoutUrl.expires).getTime()
    const currentDate = new Date().getTime()

    this.setState({
      creditImg: creditcard,
      messageStep2: 'scalapay.step.step2',
      changeImgTwo: numbertwoanimated,
      colorFont: 'black',
      colorBlock: 'black',
      changeImgInterface: interfacevtex,
      changeImgThree: number3,
      statusFailed2: null,
      statusFailed3: null,
      childWindowClosedUnexpectedly: false
    })

    if (currentDate <= checkoutUrlExpiresDate) {
      this.createChildWindow()
    } else {
      this.getCheckoutUrl()
    }
  }

  handleCloseChildWindow = () => {
    // If statusFailed2 is null step two is not finished
    if (this.state.statusFailed2 === null) {

      this.setState({
        creditImg: creditcarderror,
        messageStep2: 'scalapay.process.closeWindow',
        changeImgTwo: cancel,
        colorFont: '#DD4B39',
        colorBlock: '#c6c6c6',
        changeImgInterface: interfaceblock,
        changeImgThree: numberblock,
        statusFailed2: true,
        statusFailed3: true,
        childWindowClosedUnexpectedly: true,
      })
    }
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
    console.log(this.props)
    const { intl } = this.props
    return (
      <div className={styles.wrapper}>
        <div className={styles.headerModal}>
          <h2 className={styles.titleHeader}>
            {
              intl.formatMessage({
                id: 'scalapay.title.head',
              })
            }
          </h2>
        </div>
        <div className={styles.row}>
          <div className={styles.column} id={styles.column1}>
            {/* Step 1 */}
            <div>
              <img
                src={this.state.changeImgOne}
                className={styles.imgLoading}
                alt="one"
              />
              <div
                className={styles.verticalLine}
                style={{
                  borderColor: this.state.statusFailed2 ? '#DD4B39' : '#f9aac8',
                }}></div>
            </div>

            {/* Step 2 */}
            <div>
              <img
                src={this.state.changeImgTwo}
                className={styles.imgLoading}
                alt="two"
              />
              <div
                className={styles.verticalLine}
                style={{
                  borderColor: this.state.statusFailed3 ? '#c6c6c6' : '#f9aac8',
                }}></div>
            </div>

            {/* Step 3 */}
            <div>
              <img
                src={this.state.changeImgThree}
                className={styles.imgLoading}
                alt="three"
              />
            </div>
          </div>

          <div className={styles.column} id={styles.column2}>
            {/* Step 1 */}
            <div className={styles.containerInfo}>
              <img src={hourglass} className={styles.imgInfo} alt="loading" />
              <p className={styles.textInfo}>
                {
                  intl.formatMessage({
                    id: 'scalapay.step.step1',
                  })
                }
              </p>
            </div>

            {/* Step 2 */}
            <div className={styles.containerInfo}>
              <img
                src={this.state.creditImg}
                className={styles.imgInfo}
                alt="loading"
              />
              <p
                className={styles.textInfo}
                style={{ color: this.state.colorFont }}>
                {
                  intl.formatMessage({
                    id: this.state.messageStep2,
                  })
                }
                {this.state.childWindowClosedUnexpectedly && (
                <div onClick={() => this.retryPayment()} className={styles.retry}>
                  <img src={retry} alt="retry" />
                  <p>
                    {
                      intl.formatMessage({
                        id: 'scalapay.process.retry',
                      })
                    }
                  </p>
                </div>
              )}
              {this.state.showReload && ( <div className={styles.retry}>
                <p>Close this window <a href="#" className={styles.hiperlink} onClick={() => document.location.reload(true)}>here</a></p>
              </div>)
              }
              </p>
            </div>

            {/* Step 3 */}
            <div className={styles.containerInfo}>
              <img
                src={this.state.changeImgInterface}
                className={styles.imgInfo}
                alt="loading"
              />
              <p
                className={styles.textInfo}
                style={{ color: this.state.colorBlock }}>
                {
                  intl.formatMessage({
                    id: this.state.messageStep3,
                  })
                }
              </p>
            </div>
          </div>
        </div>
        <div className={styles.containerFooter}>
          <img src={info} alt="info" />
          <p>
            {
              intl.formatMessage({
                id: 'scalapay.info.popup',
              })
            }
            {' '}
            <a href="https://support.google.com/chrome/answer/95472?co=GENIE.Platform%3DDesktop&hl=en" target="_blank">
              {
                intl.formatMessage({
                  id: 'scalapay.info.clic',
                })
              }
            </a>
          </p>
        </div>
      </div>
    )
  }
}

ModalScalapay.propTypes = {
  intl: intlShape.isRequired
}

export default injectIntl(ModalScalapay)
