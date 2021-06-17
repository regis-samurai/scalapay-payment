import React, { Component, Fragment } from 'react'
import styles from './index.css'

class ExampleTransactionAuthApp extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount = () => {}

  componentDidMount() {
    // In case you want to remove payment loading in order to show an UI.
    $(window).trigger('removePaymentLoading.vtex')
  }

  respondTransaction = (status) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  render() {
    return (
      <div className={styles.wrapper}>
        {/* <iframe
          title="scalapay"
          src="https://portal.staging.scalapay.com/checkout/11KQ166W4N"
        /> */}

        <object
          type="text/html"
          data="https://portal.staging.scalapay.com/checkout/A1KQ177TUR"
          width="800px"
          height="600px"
        />

        {/* <embed
          src="https://portal.staging.scalapay.com/checkout/11KQ166W4N"
          width="200"
          height="200"
        /> */}
      </div>
    )
  }
}

export default ExampleTransactionAuthApp
