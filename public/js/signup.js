/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert.js';

const signup = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      url: '/api/auth/register',
      method: 'POST',
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });
    console.log(res);
    showAlert('success', 'Signup successful');
    setTimeout(() => {
      location.assign('/');
    }, 500);
  } catch (err) {
    // showAlert('error', err.message); //fetch
    showAlert('error', err.response.data.message);
  }
};

export default signup;
