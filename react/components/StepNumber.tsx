import React, { CSSProperties, FC } from 'react'
import styles from '../index.css'

export interface StepNumberProps {
  iconImg: string
  hideVerticalLine?: boolean
  style?: CSSProperties
}

export const StepNumber: FC<StepNumberProps> = (props) => {
  const { iconImg, style, hideVerticalLine = false } = props

  return (
    <div>
      <img src={iconImg} className={styles.imgLoading} />
      {!hideVerticalLine && (
        <div className={styles.verticalLine} style={style} />
      )}
    </div>
  )
}
