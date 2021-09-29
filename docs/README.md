![lista-modal (1)](https://user-images.githubusercontent.com/8409481/130956950-866a8d23-ba01-4aa2-9776-a02264b55ca7.png)

# Payment Standard Modal

VTEX Payment Standard Modal is a tool created provides create integrations with payments methods easier and faster.

To start the customize and creation of the payment method, read this document. Here are all steps and explanations of each component.

Download the base project of the following link:

[Repository Payment Standard Modal](https://github.com/vtex-apps/payment-standard-modal)

**_If you don't have permission to see the repository project, request it in the Channel #request-access_**

When de download has been finishing, you could see the project structure:

![Untitled (4)](https://user-images.githubusercontent.com/8409481/130957000-7c476011-01e4-435a-8f9d-2d2b26262848.png)


To understand the usage of each folder, continue reading this document.

### Folder Docs

![Untitled (5)](https://user-images.githubusercontent.com/8409481/130957067-eab6ce05-75d6-42dd-abec-853d4c3bbafa.png)


In this folder, you can find the instructions. The README has this same information. Here you can follow the steps if you have problems with the development.

### Messages Folder

![Untitled (6)](https://user-images.githubusercontent.com/8409481/130957120-bd1f0b10-0896-4010-9f62-ba5ab97ea929.png)


Add the translation of all texts of the modal. Here you can find the standard translations (English, Spanish, Portuguese). It's necessary to follow the standard when you add the new language. See below the example:

```jsx
store / standard - modal.step.title1
```

- Add the prefix in this case **`store`**
- Add the name of the project, for example `**standard-modal**`
- Add a subtype, which allows you more easily understand, where appears the text within the modal **`step`**
- Finally, add to tag for describing or identify uniquely the text **`title1`**

Example of translation, code taken from `en.json`

```jsx
{
    "store/standard-modal.step.title1": "STEP 1",
    "store/standard-modal.step.subtitle1": "Start process",
    "store/standard-modal.step.title2": "STEP 2",
    "store/standard-modal.step.subtitle2": "Make payment",
    "store/standard-modal.step.title3": "STEP 3",
    "store/standard-modal.step.subtitle3": "Finish process",
    "store/standard-modal.step.step1Loading": "Wait while your payment is processing",
    "store/standard-modal.step.step1Success": "Wait while your payment is processing",
    "store/standard-modal.step.step1error": "Failed to trying to process the payment",
    "store/standard-modal.step.step2Loading": "Make the payment in the new Scalapay window",
    "store/standard-modal.step.step2Success": "Make the payment in the new Scalapay window",
    "store/standard-modal.step.step2Error": "The payment process has been failed. Please, try another payment method",
    "store/standard-modal.step.step3Loading": "You will be returning to the store. Verify the payment",
    "store/standard-modal.step.step3Success": "You will be returning to the store. Verify the payment",
    "store/standard-modal.step.step3Error": "Failed to trying to process the payment",
    "store/standard-modal.process.closeWindow": "store/standard-modal payment window closed unexpectedly",
    "store/standard-modal.process.step1Retry": "Retry the payment process",
    "store/standard-modal.process.step2Retry": "Retry the payment process",
    "store/standard-modal.process.step3Retry": "Retry the payment process",
    "store/standard-modal.info.popup1": "Enable the pop-up to done the payment, for more information clic",
    "store/standard-modal.title.head": "Pay with standard-modal",
    "store/standard-modal.info.clic": "here",
    "store/standard-modal.info.step1Alert": "Please, contact with VTEX team or Scalapay for more information about the error",
    "store/standard-modal.info.step2Alert": "Please, contact with VTEX team or Scalapay for more information about the error",
    "store/standard-modal.info.step3Alert": "Please, contact with VTEX team or Scalapay for more information about the error",
    "store/standard-modal.process.step3Close": "Close this modal"
}
```

### **Pages Folder**

![Untitled (7)](https://user-images.githubusercontent.com/8409481/130957179-0ad03a78-8570-456e-960b-619741f16e32.png)


Here, you find the JSON file with the configuration that allows relating the Modal component. This component is enabled when the customizable payment method is selected.

![Untitled (8)](https://user-images.githubusercontent.com/8409481/130957212-2fba8599-3041-40d3-9025-33ba289eb625.png)


In the file:

- Change the `example-payment-auth-app` if the name of the app in the manifest.json is changed
- Change the component `Modal` if the name of the root file is modified

### React Folder

![Untitled (9)](https://user-images.githubusercontent.com/8409481/130957259-a4058a96-ce61-4a85-8bc5-eee7d8a0c53c.png)

In this folder is all the code to add the functionalities of the modal. Add styles, new buttons, text, or images. See the JSON with modal content in the file configuration example. When you link the project in your local environment, you could see something like the below interface. This interface is the proposal of the VTEX team. The project code, styles, and structure can be changing according to your needs.

![Untitled (10)](https://user-images.githubusercontent.com/8409481/130957301-af68d42d-607b-4c54-baca-e9352608cdd3.png)


The modal it's customizable from the config file, this is in the folder config > index.ts. Create a new step in the process of payment, adding to the modal the information, the structure of JSON is:

```jsx
{
    step: number, //It can be 1,2,3. Add the number related to the status of the process payment
    head: { //It's the block in the interface where you see the payment events and the status
      iconNumber: string //Image path, this number it's static
      iconNumberLoading: string, //Image path, this image is animated
      title: string, //Text to indicate the process step
      description: string //A short text to add process details
      iconSuccess: string //Image path
      iconError: string //Image path
      iconBlock: string //Image path
    },
    body: {
      msgLoading: string //Text to show while the process is started or waiting for a response
      msgSuccess: string //Text to show the service response  was successful
      msgError: string //Text to show the service response was failed
      imgLoadStep: string //Image path
      imgSuccessStep: string //Image path
      imgErrorStep: string //Image path
    },
    endpointConnector: function //Add function to execute in the step
    status: string //Define status, to initial: loading, others: waiting
    retries: boolean //Define true if the step should retry when the payment process is failed
    retriesData: { //Content of try button
      img: string //Image path
      description: string //Image path
      retryFunction: function //Add function to execute when the button is clicked
    },
    close: boolean //Add true or false if for the step is enabled the modal close button
		closeModal: { //Content of close modal button
      img: string //Image path
      description: string //Image path
      closedFunction: function //Add function to execute when the modal is closed
    },
    alert: boolean //Use the info to support user or warning to indicate something important
    alertData: { //Content of modal
      img: string //Image path
      description: string //Text to provide the help information
      type: string //Use the info to support user or warning to indicate something important
    },
  },
```

![Screenshot_32 (1)](https://user-images.githubusercontent.com/8409481/130957341-5040931f-4aa3-4c5b-8be6-732f79915a5c.png)


- **Option 1:** Modal head, show the number of enabled steps configure in the file
- **Option 2:** Head Content. Here is show the icons while the process loading or the service's response is successful o failed
- **Option 3:** Help alert. Here the user finds additional information related to the payment. There are two types: `warning`, and `info`
- **Option 4:** Alert content. Customize the image and text
- **Option 5:** Modal body, show the general information of all events while you make the payment
- **Option 6:** Body content, customize the image and text
- **Option 7:** This button provides the functionality to start the new process. Executes the function necessary to retry the payment. We recommended using the button try only when the process failed. In the same position appear the close button. We recommended using the close button when the payment process finished with success or when the user makes many tries

The images and functions should be imported in the config file, to this, add images within the assets folder, We propose the following structure

![Untitled (11)](https://user-images.githubusercontent.com/8409481/130957408-461786af-a3cc-4304-a52b-9dad61888163.png)


- **Body**: add images only related to the body modal content
- **Head**: add images only to related with steps, numbers, or icons when the step finished
- **Help**: add images related to alert, only to support of user

Example import images or functions to customizable modal (config > imports.ts)

```jsx
import number1 from '../assets/img/head/number1.png'
import number2 from '../assets/img/head/number2.png'
import number3 from '../assets/img/head/number3.png'
import number1block from '../assets/img/head/number1block.png'
import number2block from '../assets/img/head/number2block.png'
import number3block from '../assets/img/head/number3block.png'
import number1Loading from '../assets/img/head/number1animated.gif'
import number2Loading from '../assets/img/head/number2animated.gif'
import number3Loading from '../assets/img/head/number3animated.gif'
import iconSuccess from '../assets/img/head/success.png'
import iconError from '../assets/img/head/error.png'
import iconStep1 from '../assets/img/body/icon-step1.png'
import iconStep1Error from '../assets/img/body/icon-step1-error.png'
import iconStep2 from '../assets/img/body/icon-step2.png'
import iconStep2Error from '../assets/img/body/icon-step2-error.png'
import iconStep3 from '../assets/img/body/icon-step3.png'
import iconStep3Error from '../assets/img/body/icon-step3-error.png'
import retry from '../assets/img/help/retry.png'
import close from '../assets/img/help/close.png'
import info from '../assets/img/help/info.png'
import warning from '../assets/img/help/warning.png'
import { step1, step2, step3 } from '../services/connector'

export const importAssets = {
  number1,
  number2,
  number3,
  number1block,
  number2block,
  number3block,
  number1Loading,
  number2Loading,
  number3Loading,
  iconSuccess,
  iconError,
  iconStep1,
  iconStep1Error,
  iconStep2,
  iconStep2Error,
  iconStep3,
  iconStep3Error,
  retry,
  close,
  info,
  warning,
  step1,
  step2,
  step3,
}
```

To import the function to use in the process payment, add your customizable functions in the script connector.ts. This file is in the services folder

![Untitled (12)](https://user-images.githubusercontent.com/8409481/130957473-bc372936-4f5d-44c0-85ef-b3d8c620b3e6.png)


The example file contains three example functions `**step1()**`, `**step2()**`,**`step3()`**

To import the function to use in the process payment, add your customizable functions in the script connector.ts. This file is in the services folder.

Example to import file in the config

```jsx
import { importAssets } from './imports'
```

To add a new type or modify existing ones, got to the folder shared>types.ts

To add or modify the status that does not change in the execution time, or the data is using to validate services responses go to the folder shared>const.ts (Add enum or const objects)

![Untitled (13)](https://user-images.githubusercontent.com/8409481/130957531-63895c04-1336-4055-a84b-bf480032b29d.png)


To see or customize the modal components, go to the component folder, here you can see the structure definition.

![Untitled (14)](https://user-images.githubusercontent.com/8409481/130957586-b2d2f186-7388-4cc1-b214-e9478e6afef7.png)


On the root folder, Modal.tsx is the main component. Import here the body and head to build the payment modal, add the data to context and initialize the payment process.

To pass data between components, We define a context. You should modify the file modalContext.ts if you need a customize adding new data.

![Untitled (15)](https://user-images.githubusercontent.com/8409481/130957695-dca0608f-066c-4b7f-9ca5-72f66527fa95.png)

