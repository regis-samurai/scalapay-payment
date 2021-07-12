import React, { Component } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import { StepNumber, StepBlock } from './components'
import {
  Cancel,
  CheckSuccess,
  CreditCard,
  CreditCardError,
  Hourglass,
  InterfaceBlock,
  InterfaceError,
  InterfaceVtex,
  NumberBlock,
  NumberOneAnimated,
  NumberThree,
  NumberThreeAnimated,
  NumberTwo,
  NumberTwoAnimated,
  Retry,
} from './config'
import styles from './index.css'
import {
  cancelOrder,
  captureOrder,
  createOrder,
  simulatePayment,
} from './services/connector'
import type { ModalState } from './shared'
import { backdrop, getOrderData } from './shared'
type CheckoutUrl = {
  value: string | null
  expires: string | null
}
const BASE_COLOR = 'black' as const
const PINK_COLOR = '#f9aac8' as const
const ERROR_COLOR = '#dd4b39' as const
const DISABLE_COLOR = '#c6c6c6' as const
class Modal extends Component<InjectedIntlProps, ModalState> {
  state = {
    stepOne: {
      imgNumber: NumberOneAnimated,
      imgBlock: Hourglass,
      statusFailed: null,
      message: 'scalapay.step.step1',
      blockStyles: {
        color: BASE_COLOR,
      },
    },
    stepTwo: {
      imgNumber: NumberTwo,
      imgBlock: CreditCard,
      statusFailed: null,
      message: 'scalapay.step.step2',
      blockStyles: {
        color: BASE_COLOR,
      },
    },
    stepThree: {
      imgNumber: NumberThree,
      imgBlock: InterfaceVtex,
      statusFailed: null,
      message: 'scalapay.step.step3',
      blockStyles: {
        color: BASE_COLOR,
      },
    },
    showReload: false,
    childWindowClosedUnexpectedly: false,
  }
  private childWindow: Window | null = null
  private intervalId: number | null = null
  private paymentId: string | null = null
  private checkoutUrl: CheckoutUrl = {
    value: null,
    expires: null,
  }
  componentDidMount() {
    $(window).trigger('removePaymentLoading.vtex')
    window.addEventListener('message', this.handleMessages, false)
    backdrop()
    this.getCheckoutUrl()
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessages, false)
  }
  getCheckoutUrl = () => {
    simulatePayment().then((simulatePaymentRes) => {
      const body = getOrderData()
      this.paymentId = simulatePaymentRes.paymentId
      createOrder(body, simulatePaymentRes.paymentId)
        .then((res) => {
          if (res.responseData?.statusCode === 200) {
            const { checkoutUrl, expiresDate } = JSON.parse(
              res.responseData.content
            )
            this.setState((state) => ({
              stepOne: {
                ...state.stepOne,
                imgNumber: CheckSuccess,
              },
              stepTwo: {
                ...state.stepTwo,
                imgNumber: NumberTwoAnimated,
              },
            }))
            this.checkoutUrl = {
              value: checkoutUrl,
              expires: expiresDate,
            }
            this.createChildWindow()
          } else {
            console.log('Error al crear la orden THEN')
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
    if (!this.checkoutUrl.value) {
      throw new Error('Scalapay checkout url required')
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    const childWindowIsClosed = () => {
      if (this.childWindow?.closed) {
        this.intervalId != null && clearInterval(this.intervalId)
        this.handleCloseChildWindow()
      }
    }
    this.childWindow = window.open(this.checkoutUrl.value, '_blank')
    this.intervalId = window.setInterval(childWindowIsClosed, 1000)
  }
  handleMessages = ({ data }: MessageEvent) => {
    if (
      data?.source !== 'scalapay-checkout' &&
      data?.event !== 'payment-result'
    ) {
      return
    }
    const { payload } = data
    this.childWindow?.close()
    if (payload.status === 'SUCCESS') {
      if (!this.paymentId) throw new Error('PaymentId required')
      this.setState((state) => ({
        stepTwo: {
          ...state.stepTwo,
          imgNumber: CheckSuccess,
          statusFailed: false,
        },
        stepThree: {
          ...state.stepThree,
          imgNumber: NumberThreeAnimated,
        },
      }))
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
            this.setState((state) => ({
              stepThree: {
                ...state.stepThree,
                imgNumber: CheckSuccess,
              },
            }))
            // Go to orderPlace
            this.respondTransaction()
          } else {
            // Failed message for step 3
            this.setState((state) => ({
              stepThree: {
                ...state.stepThree,
                imgNumber: Cancel,
                imgBlock: InterfaceError,
                message: 'scalapay.process.failedPayment',
                statusFailed: true,
                blockStyles: {
                  ...state.stepThree.blockStyles,
                  color: ERROR_COLOR,
                },
              },
              showReload: true,
            }))
            this.cancelPayment()
          }
        })
        .catch((err) => {
          // TODO: Informar al usuario y  cancelar pago
          console.log('captureOrder err: ', err)
          this.cancelPayment()
        })
    } else {
      this.setState((state) => ({
        stepTwo: {
          ...state.stepTwo,
          imgNumber: Cancel,
          imgBlock: CreditCardError,
          message: 'scalapay.process.failedPayment',
          statusFailed: true,
          blockStyles: {
            ...state.stepTwo.blockStyles,
            color: ERROR_COLOR,
          },
        },
        stepThree: {
          ...state.stepThree,
          imgNumber: NumberBlock,
          imgBlock: InterfaceBlock,
          message: 'scalapay.process.failedPayment',
          statusFailed: true,
          blockStyles: {
            ...state.stepThree.blockStyles,
            color: DISABLE_COLOR,
          },
        },
        showReload: true,
      }))
    }
  }
  // TODO: Usar esto para redirigir a orderPlaced o informar error
  respondTransaction = (status = true) => {
    backdrop(false)
    $(window).trigger('transactionValidation.vtex', [status])
  }
  retryPayment = () => {
    if (!this.checkoutUrl.expires) {
      throw new Error(
        'The expiration date of the url is required of the Scalapay checkout'
      )
    }
    const checkoutUrlExpiresDate = new Date(this.checkoutUrl.expires).getTime()
    const currentDate = new Date().getTime()
    this.setState((state) => ({
      stepTwo: {
        ...state.stepTwo,
        imgNumber: NumberTwoAnimated,
        imgBlock: CreditCard,
        message: 'scalapay.step.step2',
        statusFailed: null,
        blockStyles: {
          ...state.stepThree.blockStyles,
          color: DISABLE_COLOR,
        },
      },
      stepThree: {
        ...state.stepThree,
        imgNumber: NumberThree,
        imgBlock: InterfaceVtex,
        message: 'scalapay.process.failedPayment',
        statusFailed: null,
        blockStyles: {
          ...state.stepThree.blockStyles,
          color: DISABLE_COLOR,
        },
      },
      childWindowClosedUnexpectedly: false,
    }))
    if (currentDate <= checkoutUrlExpiresDate) {
      this.createChildWindow()
    } else {
      this.getCheckoutUrl()
    }
  }
  cancelPayment = () => {
    if (!this.paymentId) throw new Error('PaymentId required')
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
    if (this.state.stepTwo.statusFailed === null) {
      this.setState((state) => ({
        stepTwo: {
          ...state.stepTwo,
          imgNumber: Cancel,
          imgBlock: CreditCardError,
          message: 'scalapay.process.closeWindow',
          fontColor: ERROR_COLOR,
          statusFailed: true,
        },
        stepThree: {
          ...state.stepThree,
          imgNumber: NumberBlock,
          imgBlock: InterfaceBlock,
          message: 'scalapay.process.failedPayment',
          blockColor: DISABLE_COLOR,
          statusFailed: true,
        },
        childWindowClosedUnexpectedly: true,
      }))
    }
  }
  render() {
    const { intl } = this.props
    const { stepOne, stepTwo, stepThree } = this.state
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
            <StepNumber
              iconImg={stepOne.imgNumber}
              style={{
                borderColor: stepTwo.statusFailed ? ERROR_COLOR : PINK_COLOR,
              }}
            />
            {/* Step 2 */}
            <StepNumber
              iconImg={stepTwo.imgNumber}
              style={{
                borderColor: stepThree.statusFailed
                  ? DISABLE_COLOR
                  : PINK_COLOR,
              }}
            />
            {/* Step 3 */}
            <StepNumber iconImg={stepThree.imgNumber} hideVerticalLine />
          </div>
          <div className={styles.column} id={styles.column2}>
            {/* Step 1 */}
            <StepBlock {...stepOne} />
            {/* Step 2 */}
            <StepBlock {...stepTwo}>
              {this.state.childWindowClosedUnexpectedly && (
                <button
                  onClick={() => this.retryPayment()}
                  className={styles.retry}
                >
                  <img src={Retry} alt="retry" />
                  <p>
                    {intl.formatMessage({
                      id: 'scalapay.process.retry',
                    })}
                  </p>
                </button>
              )}
              {this.state.showReload && (
                <div className={styles.retry}>
                  <p>
                    Close this window{' '}
                    <button
                      className={styles.hiperlink}
                      onClick={() => window.location.reload()}
                    >
                      here
                    </button>
                  </p>
                </div>
              )}
            </StepBlock>
            {/* Step 3 */}
            <StepBlock {...stepThree} />
          </div>
        </div>
      </div>
    )
  }
}
export default injectIntl(Modal)
