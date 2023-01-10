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
  baseURL,
  paymentType,
  callBackResponse = () => false
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
        method: 'POST',
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: orderAmount
        }),
        cache: 'default'
      }).then(res => res.json());
      const {
        amount,
        id,
        currency
      } = result.data;
      const {
        data
      } = await fetch(baseURL + '/api/v1/payment/get-razorpay-key', {
        method: 'GET',
        headers: {
          Accept: 'application.json',
          'Content-Type': 'application/json'
        },
        cache: 'default'
      }).then(res => res.json());
      const options = {
        key: data.data,
        amount: amount.toString(),
        currency: currency,
        name: name,
        description: description,
        order_id: id,
        handler: async function (response) {
          const result = await fetch(baseURL + '/api/v1/payment/pay-order', {
            method: 'POST',
            headers: {
              Accept: 'application.json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount: amount,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              paymentType: paymentType
            }),
            cache: 'default'
          }).then(res => res.json());
          callBackResponse(result);
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

export { razorpayCall };
