import axios from 'axios';
import { showAlert } from './alert';

const resetPassword = async (password, confirmPassword, resetToken) => {
  // console.log(password, confirmPassword);
  try {
    const res = await axios({
      url: '/api/auth/reset-password',
      method: 'POST',
      params: {
        resetToken,
      },
      data: {
        password,
        confirmPassword,
      },
    });

    showAlert('success', 'Reset successfully');
    setTimeout(() => {
      window.location.assign('/login');
    }, 500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default resetPassword;
