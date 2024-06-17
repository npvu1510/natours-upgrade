/* eslint-disable */
import displayMap from './map.js';
import login from './login.js';
import logout from './logout.js';
import updateUser from './updateProfile.js';
import checkout from './stripe.js';
import googleSignin from './google.js';
import forgotPassword from './forgotPassword.js';
import resetPassword from './resetPassword.js';
import signup from './signup.js';
import review from './review.js';
import axios from 'axios';

// ELEMENTS
const mapElement = document.getElementById('map');

// authentication
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.register-form');

const googleBtn = document.querySelector('.btn--google');
const logoutBtn = document.querySelector('.nav__el--logout');

const forgotPasswordForm = document.querySelector('.forgot-password-form form');
const resetPasswordForm = document.querySelector('.reset-password-form form');

// profile
const updateProfileInfoForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');

// checkout
const bookTourBtn = document.getElementById('bookTour');

// tour page
const reviewForm = document.querySelector('.review-form');

// my reviews page
const reviewItems = document.querySelectorAll('.section-cta-review');

if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();

    logout();
  });
}

if (updateProfileInfoForm) {
  // change image
  const inputImage = document.querySelector('.form__photo-upload input');

  const displayer = document.querySelector('.form__user-photo');

  inputImage.onchange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const imgFile = e.target.files[0];
    console.log(imgFile);

    const imgReader = new FileReader();
    imgReader.onload = (e) => {
      displayer.src = e.target.result;
    };
    imgReader.readAsDataURL(imgFile);
  };

  // update profle
  updateProfileInfoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];

    const formData = new FormData();

    formData.append('name', name);
    formData.append('email', email);
    formData.append('photo', photo);

    updateUser(formData, 'info');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('password-current');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('password-confirm');

    const submitButton = document.querySelector('.btn-update-password');

    submitButton.disabled = true;
    submitButton.textContent = 'Updating...';

    await updateUser(
      {
        currentPassword: currentPassword.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
      'password',
    );

    currentPassword.value = '';
    password.value = '';
    confirmPassword.value = '';

    submitButton.disabled = false;
    submitButton.textContent = 'Confirm';
  });
}

if (bookTourBtn) {
  const { tourId } = bookTourBtn.dataset;
  bookTourBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const startDate = document.querySelector('.start-dates-selection').value;
    console.log(startDate);
    if (!tourId) return;

    checkout(tourId, startDate);
  });
}

if (googleBtn) {
  googleBtn.addEventListener('click', (e) => {
    e.preventDefault();

    googleSignin();
  });
}

if (forgotPasswordForm) {
  const forgotPasswordBtn = document.querySelector('.btn--forgot-password');

  forgotPasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = document.querySelector(
      '.forgot-password-form input[name="email"]',
    ).value;

    forgotPasswordBtn.disabled = true;
    forgotPasswordBtn.textContent = 'Sending...';

    await forgotPassword(email);

    forgotPasswordBtn.disabled = false;
    forgotPasswordBtn.textContent = 'Send reset mail';
  });
}

if (resetPasswordForm) {
  console.log(resetPasswordForm);

  const resetPasswordBtn = document.querySelector('.btn--reset-password');

  resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.querySelector(
      '.reset-password-form input[name="password"]',
    ).value;

    const confirmPassword = document.querySelector(
      '.reset-password-form input[name="confirmPassword"]',
    ).value;

    const resetToken = resetPasswordForm.dataset.resetToken;
    console.log(resetToken);

    resetPasswordBtn.disabled = true;
    resetPasswordBtn.textContent = 'Resetting...';

    await resetPassword(newPassword, confirmPassword, resetToken);

    resetPasswordBtn.disabled = false;
    resetPasswordBtn.textContent = 'Reset password';
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    console.log(name, email, password, confirmPassword);

    await signup(name, email, password, confirmPassword);
  });
}

import ratingComponentConfig from './ratingComponent.js';
if (reviewForm) {
  // const stars = document.querySelectorAll('.rating .reviews__star');
  // stars.forEach((star, index) => {
  //   star.addEventListener('mouseover', () => {
  //     for (let i = 0; i < stars.length; i++) {
  //       stars[i].classList.remove('reviews__star--active');
  //       stars[i].classList.add('reviews__star--inactive');
  //     }

  //     for (let i = 0; i <= index; i++) {
  //       stars[i].classList.add('reviews__star--active');
  //       stars[i].classList.remove('reviews__star--inactive');
  //     }
  //   });

  //   // star.addEventListener('mouseleave', () => {

  //   // });
  // });
  ratingComponentConfig('rating');
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating = document.querySelectorAll(
      '.rating .reviews__star--active',
    ).length;

    const content = document.getElementById('reviewInput').value;
    const { tourId } = reviewForm.dataset;

    await review(tourId, content, rating);
  });
}

import generateEditReviewModalContent from '../../views/modals/editReviewModal.js';

// global modal
const globalModal = document.getElementById('global-modal');
const overlay = document.querySelector('.modal__overlay');
const closeModalBtn = globalModal.querySelector('.modal__close');
const modalBody = globalModal.querySelector('.modal__body');
let scrollPosition = 0;

// Hàm mở modal với nội dung tùy chỉnh
function openModal(content) {
  scrollPosition = window.scrollY;

  modalBody.innerHTML = content;
  globalModal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  overlay.style.display = 'block';
  globalModal.style.display = 'block';

  // fix loi cuon trang
  document.body.classList.add('modal-open'); // Ngăn chặn cuộn trang
}
window.openGlobalModal = openModal;

// Hàm đóng modal
function closeModal() {
  globalModal.classList.add('hidden');
  overlay.classList.add('hidden');
  overlay.style.display = 'none';
  globalModal.style.display = 'none';

  document.body.classList.remove('modal-open'); // Khôi phục cuộn trang
  console.log(scrollPosition);

  window.scrollTo(0, scrollPosition); // Khôi phục vị trí cuộn
}

closeModalBtn.addEventListener('click', (e) => {
  closeModal();
});
if (reviewItems && reviewItems.length !== 0) {
  reviewItems.forEach((review, idx) => {
    const editButton = review.querySelector('.edit-review-button');

    editButton.addEventListener('click', async (e) => {
      const reviewId = review.dataset.reviewId;

      if (!reviewId) return;

      const res = await axios({
        url: `/api/reviews/${reviewId}`,
        method: 'GET',
      });

      const reviewData = res.data.data.doc;

      openModal(generateEditReviewModalContent(reviewData));

      // Sau khi mở edit review modal
      const editReviewModal = document.querySelector('.edit-review-modal');
      ratingComponentConfig('edit-review-modal');

      const editReviewForm = editReviewModal.querySelector('.review-form');
      editReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Update database
        const reviewContent =
          editReviewForm.querySelector('#reviewInput').value;

        const rating = editReviewForm.querySelectorAll(
          '.reviews__star--active',
        ).length;

        const res = await axios({
          url: `/api/reviews/${reviewId}`,
          method: 'PATCH',
          data: { review: reviewContent, rating },
        });

        const updatedReview = res.data.data.docs;

        // update UI
        const reviewText = review.querySelector('p.reviews__text');
        console.log(reviewText);
        reviewText.textContent = updatedReview.review;

        const ratingComponent = review.querySelector('.rating');
        ratingComponent.outerHTML = `
          <div class="rating">
            ${[1, 2, 3, 4, 5]
              .map(
                (star) => `
              <svg class="reviews__star ${star <= updatedReview.rating ? 'reviews__star--active' : 'reviews__star--inactive'}">
                <use xlink:href="/img/icons.svg#icon-star"></use>
              </svg>
            `,
              )
              .join('')}
          </div>
        `;

        closeModal();
      });
    });
  });
}
