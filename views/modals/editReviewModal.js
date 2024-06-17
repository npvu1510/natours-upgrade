function generateEditReviewModalContent(review) {
  return `
    <div class="review-section edit-review-modal">
      <h2 class="heading-secondary">How do you feel about this experience?</h2>
      <form class="review-form" data-tour-id="${review.tour}">
        <div class="form-group">
          <p class="cta__text">Your Review</p>
          <textarea id="reviewInput" name="review" rows="4" required class="form-control">${review.review}</textarea>
        </div>
        <div class="form-group">
          <div class="rating-section">
            <p class="cta__text">Rating</p>
            <div class="rating">
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) => `
                <svg class="reviews__star ${star <= review.rating ? 'reviews__star--active' : 'reviews__star--inactive'}">
                  <use xlink:href="/img/icons.svg#icon-star"></use>
                </svg>
              `,
                )
                .join('')}
            </div>
          </div>
        </div>
        <div class="submit-section">
          <button id="edit-review-btn" class="btn btn--green span-all-rows" data-tour-id="${review.tour}">Confirm</button>
        </div>
      </form>
    </div>
  `;
}

export default generateEditReviewModalContent;
