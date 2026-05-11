const template = document.createElement('template');
template.innerHTML = `
  <footer class="footer">
        <section class="footer-section">
            <div class="footer-container">
                <div class="left-column">
                    <div class="footer-info">
                        <img src="/img/logo.png">
                        Фабрика Сладость веков
                    </div>
                </div>
                <div class="right-column">
                    <div class="links">
                        <a href="#">История бренда</a>
                        <a href="#">Наша продукция</a>
                        <a href="#">Качество и ингредиенты</a>
                        <a href="#">Часто задаваемые вопросы</a>
                    </div>
                </div>
            </div>
        </section>
    </footer>
`;

// Находим первый <footer> на странице и заменяем его содержимое
const footerElement = document.querySelector('footer');
if (footerElement) {
  footerElement.innerHTML = '';
  footerElement.appendChild(template.content);
}
