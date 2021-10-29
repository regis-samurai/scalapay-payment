/* eslint-disable @typescript-eslint/no-useless-constructor */
import React from 'react'

import styles from './index.css'
import { config } from './config'
import Head from './components/Head'
import Body from './components/Body'
import type {
  DataContext,
  HeadModal,
  BodyModal,
  ResponseConnector,
  OrderBody,
} from './shared/types'
import { ModalProvider } from './modalContext'
import { States, DataForm } from './shared/const'
import { getOrderData, backdrop } from './shared/utils'
import { captureOrder, cancelOrder } from './services/connector'
import { importAssets } from './config/imports'

interface ModalState {
  headModal: HeadModal[]
  bodyModal: BodyModal
  appPayload: string
  orderForm: OrderBody
  closedUnexpected: boolean
  paySuccess: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ModalProps {
  appPayload: string
}

type CheckoutUrl = {
  value: string | null
  expires: string | null
}

class Modal extends React.Component<ModalProps, ModalState> {
  private childWindow: Window | null = null
  private intervalId: number | null = null
  private checkoutUrl: CheckoutUrl = {
    value: null,
    expires: null,
  }

  public state: {
    headModal: HeadModal[]
    bodyModal: BodyModal
    appPayload: string
    orderForm: OrderBody
    closedUnexpected: boolean
    paySuccess: string
  } = {
    headModal: [],
    bodyModal: {
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
    },
    appPayload: '',
    orderForm: DataForm,
    closedUnexpected: false,
    paySuccess: States.NoPayment,
  }

  constructor(props: never) {
    super(props)
  }

  public componentDidMount() {
    const { appPayload } = this.props

    if (!appPayload) {
      this.childWindow?.close()
      this.cancelPayment()
    }

    const body = getOrderData()
    const dataBody = config.find((item) => item.status === States.Loading)
    const responsePayload = JSON.parse(appPayload)

    if (responsePayload.inboundRequestsUrl) {
      this.setState((state) => ({
        bodyModal: {
          ...state.bodyModal,
          description: dataBody?.body.msgSuccess ?? '',
          colorFont: dataBody?.colorFontSuccess ?? '',
          img: dataBody?.body.imgLoadStep ?? '',
          alert: dataBody?.alert ?? false,
          alertData: {
            img: dataBody?.alertData.img ?? '',
            description: dataBody?.alertData.description ?? '',
            type: dataBody?.alertData.type ?? '',
            url: dataBody?.alertData.url
              ? this.validateNavigator(dataBody.alertData.url)
              : '',
          },
        },
        headModal: this.fillModal(),
        appPayload,
        orderForm: body,
        paySuccess: States.NoPayment,
      }))

      this.openModal()
      this.blockReload()
    } else {
      this.setState((state) => ({
        bodyModal: {
          ...state.bodyModal,
          description: `${responsePayload.messageError}.`,
          colorFont: dataBody?.colorFontError ?? '',
          img: dataBody?.body.imgErrorStep ?? '',
        },
        headModal: this.fillModal(true),
        paySuccess: States.Error,
      }))

      this.openModal()

      setTimeout(() => {
        window.location.reload()
      }, 3000)
    }
  }

  public blockReload = () => {
    window.onbeforeunload = () => {
      this.childWindow?.close()
      this.cancelPayment()

      return ''
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('message', this.handleMessages, false)
  }

  public validateNavigator = (urlJson: string) => {
    const nameNavigator = window.navigator.userAgent

    if (!urlJson) return ''
    const parseUrl = JSON.parse(urlJson)
    let urlNavigator = ''

    if (
      nameNavigator.indexOf('Chrome') > -1 &&
      nameNavigator.indexOf('Edg') <= -1
    ) {
      urlNavigator = parseUrl.google
    } else if (
      nameNavigator.indexOf('Safari') > -1 &&
      nameNavigator.indexOf('Edg') <= -1
    ) {
      urlNavigator = parseUrl.safari
    } else if (
      nameNavigator.indexOf('Opera') > -1 &&
      nameNavigator.indexOf('Edg') <= -1
    ) {
      urlNavigator = parseUrl.opera
    } else if (
      nameNavigator.indexOf('Firefox') > -1 &&
      nameNavigator.indexOf('Edg') <= -1
    ) {
      urlNavigator = parseUrl.mozilla
    } else if (nameNavigator.indexOf('Edg') > -1) {
      urlNavigator = parseUrl.edge
    }

    return urlNavigator
  }

  public openModal = () => {
    backdrop()

    $(window).trigger('removePaymentLoading.vtex')
    window.addEventListener('message', this.handleMessages, false)
  }

  public fillModal = (error = false) => {
    const headDataModal: HeadModal[] = []

    config.forEach((item) => {
      const obj = {
        step: item.step,
        head: {
          title: item.head.title,
          img: error
            ? item.head.iconError
            : item.status === States.Active || item.status === States.Loading
            ? item.head.iconNumberLoading
            : item.head.iconBlock,
          description: item.head.description,
          colorFont: error ? item.colorFontError : item.colorFontSuccess,
        },
        status: item.status,
        functionStep: item.endpointConnector,
      }

      headDataModal.push(obj)
    })

    return headDataModal
  }

  public respondTransaction = (status = true) => {
    backdrop(false)
    $(window).trigger('transactionValidation.vtex', [status])
  }

  public handleCloseChildWindow = () => {
    const getObjLoading = this.state.headModal.find(
      (obj) => obj.status === States.Loading
    )

    if (!getObjLoading) return

    const dataBody = config.find((data) => data.step === getObjLoading.step)

    getObjLoading.status = States.Error

    getObjLoading.head.img = dataBody?.head.iconError ?? ''
    getObjLoading.status = States.Error

    this.setState((state) => ({
      bodyModal: {
        ...state.bodyModal,
        img: dataBody?.body.imgErrorStep ?? '',
        description: dataBody?.body.msgLoading ?? '',
        colorFont: dataBody?.colorFontError ?? '',
        showSupport: true,
        dataSupport: {
          img: dataBody?.retriesData.img ?? '',
          description: dataBody?.retriesData.description ?? '',
          supportFunction: () => {
            this.createChildWindow()
          },
        },
      },
      closedUnexpected: true,
    }))
  }

  public handleMessages = ({ data }: MessageEvent) => {
    if (
      data?.source !== 'scalapay-checkout' &&
      data?.event !== 'payment-result'
    ) {
      return
    }

    const { payload } = data

    if (payload.status === 'SUCCESS') {
      this.setState({ paySuccess: States.Success, closedUnexpected: false })
      captureOrder(
        {
          token: payload.orderToken,
          merchantReference: vtexjs.checkout.orderForm.orderGroup,
        },
        JSON.parse(this.state.appPayload)
      ).then((res) => {
        const getObjLoading = this.state.headModal.find(
          (obj) => obj.status === States.Loading
        )

        if (!getObjLoading) return
        if (res.status === States.Approved) this.updateSteps(getObjLoading.step)
      })
      this.childWindow?.close()
    } else {
      this.childWindow?.close()
      this.setState({ paySuccess: States.Error, closedUnexpected: false })
      this.cancelPayment()
    }
  }

  public cancelPayment = () => {
    cancelOrder(JSON.parse(this.state.appPayload)).then((res) => {
      if (!res) return

      const getObjLoading = this.state.headModal.find(
        (obj) => obj.status === States.Loading
      )

      const dataBody = config.find((data) => data.step === getObjLoading?.step)

      if (!getObjLoading || !dataBody) return

      getObjLoading.head.img = dataBody.head.iconError
      getObjLoading.status = States.Error

      this.setState((state) => ({
        bodyModal: {
          ...state.bodyModal,
          img: dataBody.body.imgErrorStep,
          description: dataBody.body.msgError,
          colorFont: dataBody.colorFontError,
          showSupport: false,
        },
      }))

      window.onbeforeunload = null

      setTimeout(() => window.location.reload(), 2000)
    })
  }

  public updateSteps = (step: number) => {
    const { orderForm, appPayload } = this.state
    const nextStep = step + 1
    const arrayCurrent: DataContext | undefined = config.find(
      (item: DataContext) => item.step === step
    )

    const arrayNext: DataContext | undefined = config.find(
      (item: DataContext) => item.step === nextStep
    )

    if (step === 1) {
      if (!arrayNext?.endpointConnector) return
      arrayNext
        ?.endpointConnector(orderForm, JSON.parse(appPayload))
        .then((res: ResponseConnector) => {
          if (!res.checkoutUrl) {
            window.onbeforeunload = null
            this.expirePayment()

            return
          }

          this.checkoutUrl.value = res.checkoutUrl
          this.checkoutUrl.expires = res.expiresDate

          if (res.expiresDate) {
            this.validationExpirationDate(res.expiresDate)
          }

          this.showUpdateModal(arrayNext)

          this.createChildWindow()

          if (!this.childWindow) {
            this.setState((state) => ({
              bodyModal: {
                ...state.bodyModal,
                showSupport: true,
                alert: true,
                dataSupport: {
                  img: importAssets.open,
                  description: 'store/standard-modal.openWindow',
                  supportFunction: () => this.createChildWindow(),
                },
              },
            }))
          }

          if (arrayCurrent)
            this.modifyHead(step, arrayCurrent, nextStep, arrayNext)
        })
    } else if (step === 2) {
      if (!arrayNext) return
      this.showUpdateModal(arrayNext)
      if (arrayCurrent) this.modifyHead(step, arrayCurrent, nextStep, arrayNext)
      if (this.state.paySuccess === States.Success) {
        window.onbeforeunload = null
        setTimeout(() => {
          this.respondTransaction()
        }, 1000)
      }
    }
  }

  /* eslint max-params: ["error", 4] */
  /* eslint-env es6 */

  public modifyHead = (
    step: number,
    dataHead: DataContext,
    nextStep: number,
    dataNext: DataContext
  ) => {
    const { headModal } = this.state
    const cloneHead: HeadModal[] = headModal.slice()

    cloneHead.forEach((item) => {
      if (item.step === step) {
        item.head.img = dataHead?.head.iconSuccess ?? ''
        item.status = States.Success
      } else if (item.step === nextStep) {
        item.head.img = dataNext?.head.iconNumberLoading ?? ''
        item.status = States.Loading
      }
    })

    this.setState({ headModal: cloneHead })
  }

  public showUpdateModal = (dataStep: DataContext) => {
    this.setState((state) => ({
      bodyModal: {
        ...state.bodyModal,
        img: dataStep.body.imgLoadStep,
        description: dataStep.body.msgSuccess,
        colorFont: dataStep.colorFontSuccess,
        alert: dataStep.alert,
        alertData: {
          img: dataStep.alertData.img,
          description: dataStep.alertData.description,
          type: dataStep.alertData.type,
          url: this.validateNavigator(dataStep.alertData.url),
        },
        showSupport: dataStep.retries,
        dataSupport: {
          img: dataStep.retriesData.img ?? '',
          description: dataStep.retriesData.description ?? '',
          supportFunction: dataStep.retriesData.retryFunction,
        },
      },
      closedUnexpected: false,
    }))
  }

  public createChildWindow = () => {
    if (!this.checkoutUrl.value) {
      throw new Error('Scalapay checkout url required')
    }

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    const childWindowIsClosed = () => {
      if (this.childWindow?.closed) {
        this.intervalId != null && clearInterval(this.intervalId)
        if (this.state.paySuccess === States.NoPayment)
          this.handleCloseChildWindow()
      }
    }

    this.setState((state) => ({
      bodyModal: {
        ...state.bodyModal,
        showSupport: false,
        alert: false,
      },
    }))

    this.childWindow = window.open(this.checkoutUrl.value ?? '', '_blank')
    this.intervalId = window.setInterval(childWindowIsClosed, 1000)

    if (!this.state.closedUnexpected) return

    const getObjLoading = this.state.headModal.find(
      (obj) => obj.status === States.Error
    )

    if (!getObjLoading) return

    const dataBody = config.find((data) => data.step === getObjLoading?.step)

    getObjLoading.head.img = dataBody?.head.iconNumberLoading ?? ''
    getObjLoading.status = States.Loading

    this.setState((state) => ({
      bodyModal: {
        ...state.bodyModal,
        img: dataBody?.body.imgLoadStep ?? '',
        description: dataBody?.body.msgSuccess ?? '',
        colorFont: dataBody?.colorFontSuccess ?? '',
        dataSupport: {
          img: importAssets.open,
          description: 'store/standard-modal.openWindow',
          supportFunction: () => this.createChildWindow(),
        },
      },
      closedUnexpected: false,
    }))
  }

  public expirePayment = () => {
    cancelOrder(JSON.parse(this.state.appPayload)).then((res) => {
      if (!res) return
      const getObjLoading = this.state.headModal.find(
        (obj) => obj.status === States.Loading
      )

      const dataBody = config.find((data) => data.step === getObjLoading?.step)

      if (!getObjLoading) return

      getObjLoading.head.img = dataBody?.head.iconError ?? ''
      getObjLoading.status = States.Error

      this.childWindow?.close()

      this.setState((state) => ({
        bodyModal: {
          ...state.bodyModal,
          img: dataBody?.body.imgErrorStep ?? '',
          description: dataBody?.body.msgSessionExpired ?? '',
          colorFont: dataBody?.colorFontError ?? '',
          showSupport: false,
        },
      }))

      setTimeout(() => {
        window.location.reload()
      }, 3000)
    })
  }

  public validationExpirationDate = (expiresDate: string) => {
    const setIntervalvalId = setInterval(() => {
      const dateNow = new Date().toISOString()

      if (dateNow >= expiresDate) {
        clearInterval(setIntervalvalId)

        this.expirePayment()
      }
    }, 300000)
  }

  public render() {
    return (
      <div className={styles.wrapper}>
        <ModalProvider
          value={{
            headModal: this.state.headModal,
            bodyModal: this.state.bodyModal,
            updateSteps: this.updateSteps,
            orderForm: this.state.orderForm,
            appPayload: this.state.appPayload,
          }}
        >
          <Head />
          <Body />
        </ModalProvider>
      </div>
    )
  }
}

export default Modal
