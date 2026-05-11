(function() {
  // Создаём кнопку
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'backToTop';
  backToTopBtn.title = 'Наверх';
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.style.cssText = `
    display: none;
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 1000;
    width: 50px;
    height: 50px;
    border: none;
    font-size: 20px;
    cursor: pointer;
  `;

  // Добавляем в тело документа
  document.body.appendChild(backToTopBtn);

  // Логика показа/скрытия
  function toggleBackToTop() {
    if (window.pageYOffset > window.innerHeight) {
      backToTopBtn.style.display = 'block';
    } else {
      backToTopBtn.style.display = 'none';
    }
  }

  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop);

  // Плавная прокрутка
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();
