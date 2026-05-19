// js/header.js
const template = document.createElement('template');
template.innerHTML = `
    <header class="header">
        <div class="logo-container">
            <a class="header-logo" href="/">
                <img src="/img/logo.png">
            </a>
        </div>

        <div class="hd-right">
            <div class="hd-icons">
                <a href="/cart.html" class="hd-icon cart-icon">🛒<span class="cart-count" id="cartCount">0</span></a>
                <a href="/account.html" class="hd-icon account-icon">👤</a>
            </div>
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
                    <li><a href="brandHistory.html">История бренда</a></li>
                    <li><a href="products.html">Наша продукция</a></li>
                    <li><a href="qualityAndIngredients.html">Качество и ингредиенты</a></li>
                    <li><a href="FAQ.html">Часто задаваемые вопросы</a></li>
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

// Функция обновления счётчика корзины (считает КОЛИЧЕСТВО ПОЗИЦИЙ, а не единиц)
window.updateCartCounter = async function() {
    const userId = localStorage.getItem('userId');
    const counterSpan = document.getElementById('cartCount');
    
    console.log('🔄 updateCartCounter вызван, userId:', userId);
    
    if (!userId) {
        if (counterSpan) counterSpan.textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`/api/cart.php?user_id=${userId}`);
        const data = await response.json();
        
        console.log('📦 Данные из API:', data);
        
        // Считаем КОЛИЧЕСТВО ПОЗИЦИЙ (разных товаров в корзине)
        let positionCount = 0;
        
        if (Array.isArray(data)) {
            positionCount = data.length;
        } else if (data.items && Array.isArray(data.items)) {
            positionCount = data.items.length;
        }
        
        if (counterSpan) {
            counterSpan.textContent = positionCount;
            console.log('✅ Счётчик обновлён (позиций):', positionCount);
        }
    } catch (err) {
        console.error('❌ Ошибка обновления счётчика:', err);
        if (counterSpan) counterSpan.textContent = '0';
    }
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 header.js: DOM загружен');
    
    // Проверяем, есть ли уже header с нужной структурой
    const existingHeader = document.querySelector('header.header');
    
    if (!existingHeader) {
        const oldHeader = document.querySelector('header');
        if (oldHeader) {
            const content = template.content.cloneNode(true);
            oldHeader.parentNode.replaceChild(content, oldHeader);
        } else {
            document.body.insertAdjacentHTML('afterbegin', template.innerHTML);
        }
        initBurgerMenu();
    } else {
        initBurgerMenu();
    }
    
    // ОБНОВЛЯЕМ СЧЁТЧИК СРАЗУ ПОСЛЕ ЗАГРУЗКИ
    setTimeout(() => {
        if (window.updateCartCounter) {
            window.updateCartCounter();
        }
    }, 100);
});

export {};