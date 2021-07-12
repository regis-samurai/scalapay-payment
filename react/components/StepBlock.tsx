import type { CSSProperties } from 'react'
import React from 'react'
import { injectIntl } from 'react-intl'

import styles from '../index.css'
import type { StepState } from '../shared'

export type StepBlockProps = StepState & {
  blockStyles?: CSSProperties
}

export const StepBlock = injectIntl<StepBlockProps>((props) => {
  const { intl, imgBlock, blockStyles, message = '', children } = props

  return (
    <div className={styles.containerInfo}>
      <img src={imgBlock} className={styles.imgInfo} alt="step" />
      <p className={styles.textInfo} style={blockStyles}>
        {intl.formatMessage({
          id: message,
        })}
        {children}
      </p>
    </div>
  )
})
