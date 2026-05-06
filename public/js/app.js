// Stripe (global from CDN)

const STRIPE_PUBLIC_KEY =
  'pk_test_51Qj1n6C6g6sK3D5gLFdvdSA9HyeZhuCZ4yiJ3SSNg9AgLuo1qVQB7OITNf3mTkRQFQbtoSFbxXaIFHLqQEzZ4hLn00Szl8Y8Qa';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

const confirmPayment = () => {
  const el = document.getElementById('payment');
  const btn = document.getElementById('submit');

  let elements;

  async function load() {
    if (!el) return;

    // 1. Create order + PaymentIntent from backend
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer 1`,
      },

      // this body is coming from place order form
      body: JSON.stringify({
        addressId: 1,
        paymentTypeId: 4,
        preferredDate: '2026-05-07',
      }),
    });

    const data = await res.json();
    console.log(data)
    if (!data.data) {
      console.error('Missing clientSecret from backend');
      return;
    }

    // 2. Create Stripe Elements
    elements = stripe.elements({
      clientSecret: data.data,
      appearance: {
        theme: 'stripe',
      },
    });

    // 3. Create payment element
    const paymentElement = elements.create('payment');
    paymentElement.mount(el);
  }

  // 4. Handle payment submit
  btn?.addEventListener('click', async () => {
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: 'http://localhost:5000',
      },
    });

    if (result.error) {
      alert(result.error.message);
      return;
    }

    // 5. Success UI
    if (result.paymentIntent?.status === 'succeeded') {
      const container = document.querySelector('.container');
      const success = document.querySelector('.success');

      if (container) container.classList.add('hide');

      if (success) {
        success.textContent = `Payment Success: ${result.paymentIntent.id}`;
        success.classList.remove('hide');
      }
    }
  });

  load();
};

confirmPayment();
