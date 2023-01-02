'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const razorpayCall = ({
  orderAmount,
  name,
  description,
  preFillName,
  preFillEmail,
  preFillContactNumber,
  notesAddress,
  theme,
  setLoading,
  baseURL
}) => {
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';

  script.onerror = () => {
    alert('Razorpay SDK failed to load. please check your internet!');
  };

  script.onload = async () => {
    try {
      setLoading(true);
      const result = await fetch(baseURL + '/api/v1/payment/create-order', {
        Method: 'POST',
        Headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        Body: {
          amount: orderAmount
        },
        Cache: 'default'
      });
      const {
        amount,
        id,
        currency
      } = result.data.data;
      const {
        data
      } = await axios.get(process.env.BASE_URL + '/api/v1/payment/get-razorpay-key');
      const options = {
        key: data.data,
        amount: amount.toString(),
        currency: currency,
        name: name,
        description: description,
        order_id: id,
        handler: async function (response) {
          const result = await axios.post(process.env.BASE_URL + '/api/v1/payment/pay-order', {
            amount: amount,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            paymentType: 1
          });
          alert(result.data.message);
        },
        prefill: {
          name: preFillName,
          email: preFillEmail,
          contact: preFillContactNumber
        },
        notes: {
          address: notesAddress
        },
        theme: {
          color: theme ? theme : '#80c0f0'
        }
      };
      setLoading(false);
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert(error);
      setLoading(false);
    }
  };

  document.body.appendChild(script);
};

exports.razorpayCall = razorpayCall;
