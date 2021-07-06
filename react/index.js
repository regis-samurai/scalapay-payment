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

    this.backdrop()
    this.getCheckoutUrl()
  }

  componentWillUnmount() {
    target.removeEventListener('message', this.handleMessages, false)
  }

  getCheckoutUrl = () => {
    const body = this.getBody()

    console.log('Body: ', body)

    createOrder(body).then((response) => {
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
                showReload: true,
              })
            }
          })
          .catch((err) => {
            // TODO: Informar al usuario, intentar 3 veces y sino funciona cancelar pago 
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
          showReload: true,
        })
      }
    }
  }

  // TODO: Usar esto para redirigir a orderPlaced o informar error
  respondTransaction = (status) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  backdrop = (active = true) => {
    const $div = $('#scalapay-background')

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
      childWindowClosedUnexpectedly: false,
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

  getBody = () => {
    const body = {}
    const orderForm = vtexjs.checkout.orderForm
    const countryCode = orderForm.shippingData.address.country.slice(0, 2)
    // FIXME: const currency = orderForm.storePreferencesData.currencyCode
    const currency = 'EUR'

    const getCategories = (item) => {
      const productCategoryIds = item.productCategoryIds
        .split('/')
        .filter((x) => x)
      const subcategories = item.productCategories

      delete subcategories[productCategoryIds[0]]

      return {
        main: item.productCategories[productCategoryIds[0]],
        others: Object.values(subcategories),
      }
    }

    body.merchantReference = orderForm.orderGroup
    body.orderExpiryMilliseconds = 3600000 // 1 hour

    body.merchant = {
      redirectConfirmUrl: config.redirectUrl(),
      redirectCancelUrl: config.redirectUrl(),
    }

    body.totalAmount = {
      amount: String(orderForm.value / 100),
      currency,
    }

    body.consumer = {
      phoneNumber: orderForm.clientProfileData.phone,
      givenNames: orderForm.clientProfileData.firstName,
      surname: orderForm.clientProfileData.lastName,
      email: orderForm.clientProfileData.email,
    }

    body.shipping = {
      name: orderForm.shippingData.address.receiverName,
      line1: orderForm.shippingData.address.street,
      suburb: orderForm.shippingData.address.city,
      postcode: orderForm.shippingData.address.postalCode,
      countryCode,
      phoneNumber: orderForm.clientProfileData.phone,
    }

    body.items = orderForm.items.map((item) => {
      const productCategoryIds = item.productCategoryIds
        .split('/')
        .filter((x) => x)
      const subcategories = item.productCategories

      delete subcategories[productCategoryIds[0]]

      const category =
        item.productCategories[productCategoryIds[0]] || 'MainCategory'
      const subcategory = Object.values(subcategories)

      return {
        name: item.name,
        category,
        subcategory: subcategory.length ? subcategory : ['MainCategory'],
        brand: item.additionalInfo.brandName,
        gtin: String(item.ean | item.refId | item.id),
        sku: item.id,
        quantity: item.quantity,
        price: {
          amount: String(item.price / 100),
          currency,
        },
      }
    })

    return body
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
