/* eslint-disable */
import axios from 'axios';

const logout = async () => {
  try {
    // const res = await fetch('/api/auth/logout');

    // const data = await res.json();
    // if (data.message) throw new Error(data.message);

    const res = await axios({
      url: '/api/auth/logout',
      method: 'GET',
    });

    setTimeout(() => {
      location.reload();
    }, 500);
  } catch (err) {
    alert(err.message);
  }
};

export default logout;
