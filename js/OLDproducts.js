// js/products.js
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.querySelector('.products-container');
    if (!productsContainer) {
        console.error('Контейнер .products-container не найден');
        return;
    }

    // Функция добавления в корзину
    async function addToCart(productId, quantity = 1) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Для покупки необходимо войти в аккаунт');
            window.location.href = '/account.html';
            return false;
        }
        
        try {
            const response = await fetch('/api/cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Товар добавлен в корзину!');
                // Обновляем счётчик в хедере
                if (window.updateCartCounter) window.updateCartCounter();
                return true;
            } else {
                alert('Ошибка: ' + (data.error || 'Не удалось добавить товар'));
                return false;
            }
        } catch (err) {
            console.error('Ошибка добавления:', err);
            alert('Сетевая ошибка. Попробуйте позже.');
            return false;
        }
    }

    // Загрузка товаров из БД
    async function loadProducts() {
        try {
            const response = await fetch('/api/products.php');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const products = await response.json();
            
            if (!products.length) {
                productsContainer.innerHTML = '<p class="no-products">Товары временно отсутствуют.</p>';
                return;
            }
            
            // Генерируем HTML, чередуя класс reverse
            let html = '';
            products.forEach((product, index) => {
                const reverseClass = index % 2 === 1 ? 'reverse' : '';
                
                // Экранируем описание для безопасности
                const description = (product.description || 'Описание отсутствует').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                html += `
                    <div class="product-item ${reverseClass}">
                        <div class="product-image">
                            <img src="${product.image || '/img/products/default.jpg'}" alt="${product.name}" onerror="this.src='/img/products/default.jpg'">
                        </div>
                        <div class="product-content">
                            <h3><a href="/product.html?id=${product.id}">${product.name} →</a></h3>
                            <p>${description}</p>
                            <div class="product-price-row">
                                <span class="product-price">${product.price} ₽</span>
                                ${product.wholesale_min_qty > 0 ? `<span class="wholesale-tag">от ${product.wholesale_min_qty} шт — скидка ${product.wholesale_discount}%</span>` : ''}
                            </div>
                            <div class="product-buy">
                                <input type="number" min="1" value="1" class="buy-quantity" data-id="${product.id}">
                                <button class="buy-button" data-id="${product.id}">Купить</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            productsContainer.innerHTML = html;
            
            // Навешиваем обработчики на кнопки "Купить"
            const buyButtons = document.querySelectorAll('.buy-button');
            buyButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const productId = parseInt(btn.dataset.id);
                    const qtyInput = document.querySelector(`.buy-quantity[data-id="${productId}"]`);
                    const quantity = parseInt(qtyInput?.value || 1);
                    if (quantity < 1) {
                        alert('Количество должно быть не менее 1');
                        return;
                    }
                    await addToCart(productId, quantity);
                });
            });
            
            // Навешиваем обработчики на поля ввода количества (Enter)
            const quantityInputs = document.querySelectorAll('.buy-quantity');
            quantityInputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const productId = parseInt(input.dataset.id);
                        const buyBtn = document.querySelector(`.buy-button[data-id="${productId}"]`);
                        if (buyBtn) buyBtn.click();
                    }
                });
            });
            
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            productsContainer.innerHTML = '<p class="error">Не удалось загрузить товары. Попробуйте позже.</p>';
        }
    }
    
    // Запускаем загрузку товаров
    await loadProducts();
});