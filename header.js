const template = document.createElement('template');
template.innerHTML = `
    <header class="header">
        <div class="logo-container">
            <a class="header-logo" href="/">
                <img src="/img/logo.png">
            </a>
        </div>

        <div class="hd-right">
            <div class="hd-burger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <div class="burger-menu">
        <div class="burger-container">
            <div class="burger-column">
                <ul>
                    <li><a href="#">История бренда</a></li>
                    <li><a href="#">Наша продукция</a></li>
                    <li><a href="#">Качество и ингредиенты</a></li>
                    <li><a href="#">Часто задаваемые вопросы</a></li>
                </ul>
                <div class="divic">Продукты, любимые с детства</div>
            </div>
        </div>
    </div>
`;

function initBurgerMenu() {
    setTimeout(() => {
        const burgerBtn = document.querySelector('.hd-burger');
        const burgerMenu = document.querySelector('.burger-menu');
        
        if (burgerBtn && burgerMenu) {
            // Убираем cloneNode, чтобы сохранить позиционирование
            burgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                burgerBtn.classList.toggle('active');
                burgerMenu.classList.toggle('active');
                
                if (burgerMenu.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
        }
    }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, есть ли уже header с нужной структурой
    const existingHeader = document.querySelector('header.header');
    const existingBurger = document.querySelector('.burger-menu');
    
    if (!existingHeader) {
        // Если нет header с классом header, заменяем всё
        const oldHeader = document.querySelector('header');
        if (oldHeader) {
            const content = template.content.cloneNode(true);
            oldHeader.parentNode.replaceChild(content, oldHeader);
        } else {
            document.body.insertAdjacentHTML('afterbegin', template.innerHTML);
        }
        initBurgerMenu();
    } else {
        // Если header уже есть, просто инициализируем бургер
        initBurgerMenu();
    }
});

export {};