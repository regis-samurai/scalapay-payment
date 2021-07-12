import React, { Component } from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'

import {
  Cancel,
  CheckSuccess,
  CreditCard,
  CreditCardError,
  Hourglass,
  InterfaceBlock,
  InterfaceError,
  InterfaceVtex,
  NumberTwo,
  NumberThree,
  NumberBlock,
  NumberOneAnimated,
  NumberThreeAnimated,
  NumberTwoAnimated,
  Retry,
  hourglass_error,
  number2block,
  CreditCardBlock,
} from './config'
import styles from './index.css'
import {
  cancelOrder,
  captureOrder,
  createOrder,
  simulatePayments,
} from './services/connector'
import { backdrop, getOrderData } from './shared'
import { StepNumber } from './components'

type CheckoutUrl = {
  value: string | null
  expires: string | null
}

type StepState = {
  imgNumber: any
  imgBlock: any
  message?: string
  blockColor?: string
  statusFailed: boolean | null
}

export interface ModalState {
  stepOne: StepState
  stepTwo: StepState
  stepThree: StepState
  showReload: boolean
  childWindowClosedUnexpectedly: boolean
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
      blockColor: BASE_COLOR,
    },
    stepTwo: {
      imgNumber: NumberTwo,
      imgBlock: CreditCard,
      statusFailed: null,
      message: 'scalapay.step.step2',
      blockColor: BASE_COLOR,
    },
    stepThree: {
      imgNumber: NumberThree,
      imgBlock: InterfaceVtex,
      statusFailed: null,
      message: 'scalapay.step.step3',
      blockColor: BASE_COLOR,
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
              stepOne: {
                ...this.state.stepOne,
                imgNumber: CheckSuccess,
              },
              stepTwo: {
                ...this.state.stepTwo,
                imgNumber: NumberTwoAnimated,
              },
            })
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
    if (!this.checkoutUrl.value)
      throw new Error('Scalapay checkout url required')

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.childWindow = window.open(this.checkoutUrl.value, '_blank')
    this.intervalId = window.setInterval(childWindowIsClosed.bind(this), 1000)

    function childWindowIsClosed(this: Modal) {
      if (this.childWindow?.closed) {
        this.intervalId != null && clearInterval(this.intervalId)
        this.handleCloseChildWindow()
      }
    }
  }

  handleMessages = (e: MessageEvent) => {
    if (
      e.data?.source === 'scalapay-checkout' &&
      e.data?.event === 'payment-result'
    ) {
      const { payload } = e.data

      this.childWindow?.close()

      if (payload.status === 'SUCCESS') {
        if (!this.paymentId) throw new Error('PaymentId required')

        this.setState({
          stepTwo: {
            ...this.state.stepTwo,
            imgNumber: CheckSuccess,
            statusFailed: false,
          },
          stepThree: {
            ...this.state.stepThree,
            imgNumber: NumberThreeAnimated,
          },
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
                stepThree: {
                  ...this.state.stepThree,
                  imgNumber: CheckSuccess,
                },
              })
              // Go to orderPlace
              this.respondTransaction(true)
            } else {
              // Failed message for step 3
              this.setState({
                stepThree: {
                  ...this.state.stepThree,
                  imgNumber: Cancel,
                  imgBlock: InterfaceError,
                  message: 'scalapay.process.failedPayment',
                  blockColor: ERROR_COLOR,
                  statusFailed: true,
                },
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
          stepTwo: {
            ...this.state.stepTwo,
            imgNumber: Cancel,
            imgBlock: CreditCardError,
            message: 'scalapay.process.failedPayment',
            blockColor: ERROR_COLOR,
            statusFailed: true,
          },
          stepThree: {
            ...this.state.stepThree,
            imgNumber: NumberBlock,
            imgBlock: InterfaceBlock,
            message: 'scalapay.process.failedPayment',
            blockColor: DISABLE_COLOR,
            statusFailed: true,
          },
          showReload: true,
        })
      }
    }
  }

  // TODO: Usar esto para redirigir a orderPlaced o informar error
  respondTransaction = (status: boolean) => {
    backdrop(false)
    $(window).trigger('transactionValidation.vtex', [status])
  }

  retryPayment = () => {
    if (!this.checkoutUrl.expires)
      throw new Error(
        'The expiration date of the url is required of the Scalapay checkout'
      )

    const checkoutUrlExpiresDate = new Date(this.checkoutUrl.expires).getTime()
    const currentDate = new Date().getTime()

    this.setState({
      stepTwo: {
        ...this.state.stepTwo,
        imgNumber: NumberTwoAnimated,
        imgBlock: CreditCard,
        message: 'scalapay.step.step2',
        blockColor: BASE_COLOR,
        statusFailed: null,
      },
      stepThree: {
        ...this.state.stepThree,
        imgNumber: NumberThree,
        imgBlock: InterfaceVtex,
        message: 'scalapay.process.failedPayment',
        blockColor: BASE_COLOR,
        statusFailed: null,
      },
      childWindowClosedUnexpectedly: false,
    })

    if (currentDate <= checkoutUrlExpiresDate) {
      this.createChildWindow()
    } else {
      this.getCheckoutUrl()
    }
  }

  errorStepOne = () => {
    this.setState({
      stepOne: {
        ...this.state.stepOne,
        imgNumber: Cancel,
        blockColor: ERROR_COLOR,
        imgBlock: hourglass_error,
        message: 'scalapay.process.cancelProcess'
      },
      stepTwo: {
        ...this.state.stepTwo,
        imgNumber: number2block,
        blockColor: DISABLE_COLOR,
        imgBlock: CreditCardBlock
      },
      stepThree: {
        ...this.state.stepThree,
        imgNumber: NumberBlock,
        blockColor: DISABLE_COLOR,
        imgBlock: InterfaceBlock
      },
      showReload: true
    })
  }

  cancelPayment = () => {
    if (!this.paymentId) throw new Error('PaymentId required')

    cancelOrder(this.paymentId)
      .then((res) => {
        if (res.responseData?.statusCode === 200) {
          this.errorStepOne()
        } else {
          this.errorStepOne()
        }
      })
      .catch((err) => {
        // TODO: Informar error al usuario y pedirle que se comunique con soporte
        console.log('Error al cancelar el pago: ', err)
      })
      .finally(() => {
        this.setState({showReload: true})
      })
  }

  handleCloseChildWindow = () => {
    // If statusFailed2 is null step two is not finished
    if (this.state.stepTwo.statusFailed === null) {
      this.setState({
        stepTwo: {
          ...this.state.stepTwo,
          imgNumber: Cancel,
          imgBlock: CreditCardError,
          message: 'scalapay.process.closeWindow',
          blockColor: ERROR_COLOR,
          statusFailed: true,
        },
        stepThree: {
          ...this.state.stepThree,
          imgNumber: NumberBlock,
          imgBlock: InterfaceBlock,
          message: 'scalapay.process.failedPayment',
          blockColor: DISABLE_COLOR,
          statusFailed: true,
        },
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
            <StepNumber
              iconImg={this.state.stepOne.imgNumber}
              style={{
                borderColor: this.state.stepTwo.statusFailed
                  ? ERROR_COLOR
                  : PINK_COLOR,
              }}
            />

            {/* Step 2 */}
            <StepNumber
              iconImg={this.state.stepTwo.imgNumber}
              style={{
                borderColor: this.state.stepThree.statusFailed
                  ? DISABLE_COLOR
                  : PINK_COLOR,
              }}
            />

            {/* Step 3 */}
            <StepNumber
              iconImg={this.state.stepThree.imgNumber}
              hideVerticalLine
            />
          </div>

          <div className={styles.column} id={styles.column2}>
            {/* Step 1 */}
            <div className={styles.containerInfo}>
              <img src={this.state.stepOne.imgBlock} className={styles.imgInfo} alt="loading" />
              <p className={styles.textInfo} style={{ color: this.state.stepOne.blockColor }}>
                {intl.formatMessage({
                  id: this.state.stepOne.message,
                })}
              </p>
            </div>

            {/* Step 2 */}
            <div className={styles.containerInfo}>
              <img
                src={this.state.stepTwo.imgBlock}
                className={styles.imgInfo}
                alt="loading"
              />
              <p
                className={styles.textInfo}
                style={{ color: this.state.stepTwo.blockColor }}
              >
                {intl.formatMessage({
                  id: this.state.stepTwo.message,
                })}
                {this.state.childWindowClosedUnexpectedly && (
                  <div
                    onClick={() => this.retryPayment()}
                    className={styles.retry}
                  >
                    <img src={Retry} alt="retry" />
                    <p>
                      {intl.formatMessage({
                        id: 'scalapay.process.retry',
                      })}
                    </p>
                  </div>
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className={styles.containerInfo}>
              <img
                src={this.state.stepThree.imgBlock}
                className={styles.imgInfo}
                alt="loading"
              />
              <p
                className={styles.textInfo}
                style={{ color: this.state.stepThree.blockColor }}
              >
                {intl.formatMessage({
                  id: this.state.stepThree.message,
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
        {this.state.showReload && (
          <div className={styles.closeWindow} onClick={() => location.reload()}>
            <p>
              <b>X</b> Close this window to do the pay with another payment method
            </p>
          </div>
        )}
      </div>
    )
  }
}

export default injectIntl(Modal)
