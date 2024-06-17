import axios from 'axios';

import { showAlert } from './alert.js';

const updateUser = async (data, type) => {
  const url =
    type === 'password'
      ? '/api/users/update-profile-password'
      : '/api/users/update-profile';

  try {
    const res = await axios({
      url,
      method: 'PATCH',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Update successful');

      const displayer = document.querySelector('.form__user-photo');
      displayer.src = `/img/users/${res.data.user.photo}`;

      const headerDisplayer = document.querySelector('.nav__user-img');
      headerDisplayer.src = `/img/users/${res.data.user.photo}`;

      const navUserName = document.querySelector('.nav--user span');
      navUserName.textContent = res.data.user.name;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default updateUser;
