import React, { Component } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import {
  cancel,
  checksucess,
  creditcard,
  creditcarderror,
  hourglass,
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
import {
  cancelOrder,
  captureOrder,
  createOrder,
  simulatePayments,
} from './services/connector'
import { backdrop, getOrderData } from './shared'

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
  paymentId = null

  componentDidMount() {
    $(window).trigger('removePaymentLoading.vtex')
    window.addEventListener('message', this.handleMessages, false)

    backdrop()
    this.getCheckoutUrl()
  }

  componentWillUnmount() {
    target.removeEventListener('message', this.handleMessages, false)
  }

  getCheckoutUrl = () => {
    simulatePayments().then((res) => {
      const body = getOrderData()
      this.paymentId = res.paymentId

      createOrder(body, res.paymentId)
        .then((res) => {
          if (res.responseData?.statusCode === 200) {
            const { checkoutUrl, expiresDate } = JSON.parse(
              res.responseData.content
            )
            this.setState({
              changeImgOne: checksucess,
              changeImgTwo: numbertwoanimated,
            })
            this.checkoutUrl = {
              value: checkoutUrl,
              expires: expiresDate,
            }
            this.createChildWindow()
          } else {
            this.cancelPayment()
          }
        })
        .catch((err) => {
          console.log('Error al crear la orden: ', err)
          this.cancelPayment()
        })
    })
  }

  createChildWindow = () => {
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
      e.data?.source === 'scalapay-checkout' &&
      e.data?.event === 'payment-result'
    ) {
      const payload = e.data.payload
      this.childWindow.close()

      if (payload.status === 'SUCCESS') {
        this.setState({
          changeImgTwo: checksucess,
          changeImgThree: numberthreeanimated,
          statusFailed2: false,
        })

        captureOrder({
          token: payload.orderToken,
          merchantReference: vtexjs.checkout.orderForm.orderGroup,
          paymentId: this.paymentId,
        })
          .then((res) => {
            const content = JSON.parse(res.responseData.content)

            if (
              res.responseData?.statusCode === 200 &&
              content.status === 'approved'
            ) {
              this.setState({
                changeImgThree: checksucess,
              })
              // Go to orderPlace
              this.respondTransaction(true)
            } else {
              // Failed message for step 3
              this.setState({
                messageStep3: 'scalapay.process.failedPayment',
                changeImgThree: cancel,
                colorBlock: '#DD4B39',
                changeImgInterface: interfaceerror,
                statusFailed3: true,
                showReload: true,
              })
              this.cancelPayment()
            }
          })
          .catch((err) => {
            // TODO: Informar al usuario y  cancelar pago
            console.log('captureOrder err: ', err)
            this.cancelPayment()
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

  cancelPayment = () => {
    cancelOrder(this.paymentId)
      .then((res) => {
        if (res.responseData?.statusCode === 200) {
          // TODO: Informar al usuario que no se pudo realizar el paso 1
          console.log('Pago cancelado exitosamente')
        } else {
          // TODO: Hacer lo mismo del catch, usar una función para no repetir código
          console.log('No se pudo cancelar el pago')
        }
      })
      .catch((err) => {
        // TODO: Informar error al usuario y pedirle que se comunique con soporte
        console.log('Error al cancelar el pago: ', err)
      })
      .finally(() => {
        // TODO: Mostrar botón para cerrar la modal
      })
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

  render() {
    const { intl } = this.props
    return (
      <div className={styles.wrapper}>
        <div className={styles.headerModal}>
          <h2 className={styles.titleHeader}>
            {intl.formatMessage({
              id: 'scalapay.title.head',
            })}
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
                {intl.formatMessage({
                  id: 'scalapay.step.step1',
                })}
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
                {intl.formatMessage({
                  id: this.state.messageStep2,
                })}
                {this.state.childWindowClosedUnexpectedly && (
                  <div
                    onClick={() => this.retryPayment()}
                    className={styles.retry}>
                    <img src={retry} alt="retry" />
                    <p>
                      {intl.formatMessage({
                        id: 'scalapay.process.retry',
                      })}
                    </p>
                  </div>
                )}
                {this.state.showReload && (
                  <div className={styles.retry}>
                    <p>
                      Close this window{' '}
                      <a
                        href="#"
                        className={styles.hiperlink}
                        onClick={() => document.location.reload(true)}>
                        here
                      </a>
                    </p>
                  </div>
                )}
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
                {intl.formatMessage({
                  id: this.state.messageStep3,
                })}
              </p>
            </div>
          </div>
        </div>
        {/* <div className={styles.containerFooter}>
          <img src={info} alt="info" />
          <p>
            {intl.formatMessage({
              id: 'scalapay.info.popup',
            })}{' '}
            <a
              href="https://support.google.com/chrome/answer/95472?co=GENIE.Platform%3DDesktop&hl=en"
              target="_blank">
              {intl.formatMessage({
                id: 'scalapay.info.clic',
              })}
            </a>
          </p>
        </div> */}
      </div>
    )
  }
}

ModalScalapay.propTypes = {
  intl: intlShape.isRequired,
}

export default injectIntl(ModalScalapay)
