import type { FC } from 'react'
import React, { useContext, useState, useEffect } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'

import ModalContext from '../modalContext'
import styles from '../index.css'
import { States } from '../shared/const'
import { importAssets } from '../config/imports'

const Head: FC<InjectedIntlProps> = (props) => {
  const { intl } = props
  const dataModal = useContext(ModalContext)
  const widthDiv = `${100 / dataModal.headModal.length}%`
  const [data, setData] = useState<JSX.Element[]>([])
  const [sentPetition, setSentPetition] = useState(false)

  useEffect(() => {
    if (!dataModal.headModal.length) return

    const tempArray: JSX.Element[] = []

    dataModal.headModal.forEach((item) => {
      tempArray.push(
        <div
          key={item.step}
          className={styles.headTable}
          style={{ width: widthDiv }}
        >
          <p>
            <b>
              {intl.formatMessage({
                id: item.head.title,
              })}
            </b>
          </p>
          <img src={item.head.img} alt={item.head.description} />
          <p>
            {intl.formatMessage({
              id: item.head.description,
            })}
          </p>
        </div>
      )

      if (item.status === States.Loading) {
        if (item.step === 1 && !sentPetition) {
          if (!item.functionStep) return
          item.functionStep().then(() => {
            dataModal.updateSteps(item.step)
            setSentPetition(true)
          })
        }
      }
    })

    setData(tempArray)
  }, [dataModal, widthDiv, intl, sentPetition])

  return (
    <div className={styles.headContainer}>
      {data}
      <div>
        <button
          onClick={() => window.location.reload()}
          className={styles.btnClose}
        >
          <img src={importAssets.closeModal} alt="close" />
        </button>
      </div>
    </div>
  )
}

export default injectIntl(Head)
