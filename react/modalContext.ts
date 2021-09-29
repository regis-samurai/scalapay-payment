import { createContext, useContext } from 'react'

import { dataBody, DataForm } from './shared/const'
import { ModalContext } from './shared/types'

const typeModal = {
  headModal: [],
  bodyModal: dataBody,
  updateSteps: () => {},
  orderForm: DataForm,
  appPayload: '',
  closedUnexpected: false,
}

const ModalContext = createContext<ModalContext>(typeModal)

export const ModalProvider = ModalContext.Provider

export const ModalConsumer = ModalContext.Consumer

export const useModal = () => useContext(ModalContext)

export default ModalContext
