const ratingComponentConfig = (className) => {
  const stars = document.querySelectorAll(`.${className} .reviews__star`);
  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => {
      for (let i = 0; i < stars.length; i += 1) {
        stars[i].classList.remove('reviews__star--active');
        stars[i].classList.add('reviews__star--inactive');
      }

      for (let i = 0; i <= index; i += 1) {
        stars[i].classList.add('reviews__star--active');
        stars[i].classList.remove('reviews__star--inactive');
      }
    });
  });
};

export default ratingComponentConfig;
