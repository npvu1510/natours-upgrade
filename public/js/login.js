/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert.js';

const login = async (email, password) => {
  try {
    const res = await axios({
      url: '/api/auth/login',
      method: 'POST',
      data: {
        email,
        password,
      },
    });

    showAlert('success', 'Login successful');
    setTimeout(() => {
      location.assign('/');
    }, 500);
  } catch (err) {
    // showAlert('error', err.message); //fetch
    showAlert('error', err.response.data.message);
  }
};

export default login;
