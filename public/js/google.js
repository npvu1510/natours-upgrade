import axios from 'axios';

const googleSignin = async () => {
  try {
    const res = await axios({
      url: '/api/auth/google',
      method: 'GET',
    });

    location.assign(res.data.url);
  } catch (err) {
    console.log(err);
  }
};

export default googleSignin;
