/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {

  const stripe = Stripe(
    'pk_test_51JEdzsSJ7TjrX4UfeUrlWDw6lLucKnDEDGQfx1YOcpV3TJCzd8TDZvXabOkxx0HmA43qdrFIjoV7pcczs3hFqZx600DqAYvRy5'
  );
    // 1) Get the session from the server
  const session = await axios(
    `/api/v1/bookings/checkout-session/${tourId}`
  );
  // 2)  create checkout form + charge the card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
  

  } catch(err) {
    console.log(err)
    showAlert('error', err)
  }
};
