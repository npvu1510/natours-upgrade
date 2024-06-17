import axios from 'axios';
import { showAlert } from './alert';

const review = async (tourId, content, rating) => {
  try {
    const res = await axios({
      url: `/api/tours/${tourId}/reviews`,
      method: 'POST',
      data: { review: content, rating },
    });

    showAlert('success', 'Review successfully. Thank you !');

    // update UI
    const reviewData = res.data.data.doc;

    const reviewHTML = `
      <div class="review">
        <p class="reviews__text"> ${reviewData.review}</p>
        <div class="rating">
          ${[...Array(5)]
            .map(
              (_, i) => `
            <svg class="reviews__star ${i < reviewData.rating ? 'reviews__star--active' : 'reviews__star--inactive'}">
              <use xlink:href="/img/icons.svg#icon-star"></use>
            </svg>
          `,
            )
            .join('')}
        </div>
      </div>
    `;

    document.querySelector('.review-form').outerHTML = reviewHTML;
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export default review;
