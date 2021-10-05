import type { FC } from 'react'
import React, { useContext } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'

import styles from '../index.css'
import ModalContext from '../modalContext'

const Body: FC<InjectedIntlProps> = (props) => {
  const { intl } = props
  const data = useContext(ModalContext)
  const retryExecute = data.bodyModal.dataSupport.supportFunction

  const msgDescription = data.bodyModal.alertData.description.includes(
    'store/standard-modal'
  )

  return (
    <div className={styles.globalContainer}>
      {data.bodyModal.alert ? (
        <div className={styles.mainContainerInfo}>
          <div
            className={
              data.bodyModal.alertData.type === 'info'
                ? styles.infoContainer
                : styles.warningContainer
            }
          >
            <img
              src={data.bodyModal.alertData.img}
              alt={data.bodyModal.alertData.description}
            />
            <p>
              {intl.formatMessage({
                id: data.bodyModal.alertData.description,
              })}
              {data.bodyModal.alertData.url && (
                <a
                  href={data.bodyModal.alertData.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.mainContainerInfo} />
      )}

      <div className={styles.bodyContainer}>
        <div className={styles.bodyCell}>
          <img src={data.bodyModal.img} alt={data.bodyModal.description} />
          <div>
            {data.bodyModal.description ? (
              <p style={{ color: data.bodyModal.colorFont }}>
                {msgDescription
                  ? intl.formatMessage({
                      id: data.bodyModal.description,
                    })
                  : data.bodyModal.description +
                    intl.formatMessage({
                      id: 'store/standard-modal.process.closeWindowMsg',
                    })}
              </p>
            ) : (
              <p />
            )}
          </div>
        </div>
      </div>
      {data.bodyModal.showSupport ? (
        <div className={styles.containerButton}>
          <button
            onClick={retryExecute ? () => retryExecute() : () => {}}
            className={styles.buttonRetry}
          >
            <img
              src={data.bodyModal.dataSupport.img}
              alt={data.bodyModal.dataSupport.description}
            />
            <span>
              {intl.formatMessage({
                id: data.bodyModal.dataSupport.description,
              })}
            </span>
          </button>
        </div>
      ) : (
        <div className={styles.mainContainerInfo} />
      )}
    </div>
  )
}

export default injectIntl(Body)
