import axios from 'axios';
import { showAlert } from './alert';

const forgotPassword = async (email) => {
  try {
    await axios({
      url: '/api/auth/forgot-password',
      method: 'POST',
      data: { email },
    });
    showAlert('success', 'Sent successfully ! Please check your email');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default forgotPassword;
