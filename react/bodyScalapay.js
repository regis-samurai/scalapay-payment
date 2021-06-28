export const bodyScalapay = {  
    "totalAmount": {  
        "amount": "100.00",
        "currency": "EUR"
    },
    "consumer": {  
        "phoneNumber": "0400000001",
        "givenNames": "Johnny",
        "surname": "Mitrevski",
        "email": "test@scalapay.com"
    },
    "billing": {  
        "name": "Joe Consumer",
        "line1": "Via della Rosa, 58",
        "suburb": "Montelupo Fiorentino",
        "postcode": "50056",
        "countryCode": "IT",
        "phoneNumber": "0400000000"
    },
    "shipping": {  
        "name": "Joe Consumer",
        "line1": "Via della Rosa, 58",
        "suburb": "Montelupo Fiorentino",
        "postcode": "50056",
        "countryCode": "IT",
        "phoneNumber": "0400000000"
    },
    "items":[  
         {
             "name": "32",
             "category": "clothes",
             "subcategory": ["shirt", "long-sleeve"],
             "brand": "TopChoice",
             "gtin": "123458791330",
             "sku": "12341234",
             "quantity": 1,
             "price": {
                 "amount": "10.00",
                 "currency": "EUR"
             }
         },
         {
             "name": "Jeans",
             "category": "clothes",
             "subcategory": ["pants", "jeans"],
             "brand": "TopChoice",
             "gtin": "123458722222",
             "sku": "12341235",
             "quantity": 1,
             "price": {
                 "amount": "20.00",
                 "currency": "EUR"
             }
         }
    ],
    "discounts": [
        {
            "displayName": "10% Off",
            "amount": {
                "amount": "103.00",
                "currency": "EUR"
            }
        }
    ],
    "merchant": {
        "redirectConfirmUrl": "https://scalapay.com",
        "redirectCancelUrl": "https://scalapay.com"
    },
    "merchantReference": "merchantOrder-1234",
     "taxAmount": {  
        "amount": "3.70",
        "currency": "EUR"
     },
     "shippingAmount": {  
         "amount": "10.00",
         "currency": "EUR"
    },
    "orderExpiryMilliseconds": 6000000
  }