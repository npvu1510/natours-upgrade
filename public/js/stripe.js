import axios from 'axios';

import { showAlert } from './alert.js';

const checkout = async (tourId, startDate) => {
  try {
    const res = await axios({
      url: `/stripe/get-checkout-session/${tourId}?startDate=${startDate}`,
    });

    setTimeout(() => {
      const session = res.data.session;
      location.assign(session.url);
    }, 500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default checkout;
