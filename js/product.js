// js/product.js
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.getElementById('productDetail');
    
    console.log('product.js запущен, ID товара:', productId);
    
    if (!productId) {
        container.innerHTML = '<p class="error">Товар не указан</p>';
        return;
    }
    
    // Функция добавления в корзину
    async function addToCart(quantity = 1) {
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
                    product_id: parseInt(productId),
                    quantity: quantity
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Товар добавлен в корзину!');
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
    
    try {
        const response = await fetch(`/api/product.php?id=${productId}`);
        const product = await response.json();
        
        console.log('Получен товар:', product);
        
        if (product.error) {
            container.innerHTML = `<p class="error">${product.error}</p>`;
            return;
        }
        
        // Обновляем заголовок страницы
        document.title = `${product.name} – Кондитерская фабрика`;
        
        let wholesaleHtml = '';
        if (product.wholesale_min_qty > 0 && product.wholesale_discount > 0) {
            const wholesalePrice = Math.round(product.price * (100 - product.wholesale_discount) / 100);
            wholesaleHtml = `
                <div class="product-wholesale-info">
                    <span class="wholesale-badge">Оптовая скидка ${product.wholesale_discount}%</span>
                    <p class="wholesale-condition">При заказе от ${product.wholesale_min_qty} шт — цена ${wholesalePrice} ₽ за штуку</p>
                </div>
            `;
        }
        
        // Экранируем описание
        const description = (product.description || 'Описание отсутствует').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        const html = `
            <div class="candy-container">
                <div class="candy-left">
                    <img src="${product.image || '/img/products/default.jpg'}" alt="${product.name}" onerror="this.src='/img/products/default.jpg'">
                </div>
                <div class="candy-right">
                    <div class="candy-section-title">${product.name}</div>
                    <div class="candy-description">
                        <h3>Цена: ${product.price} ₽</h3>
                        ${product.wholesale_min_qty > 0 ? `<p>Опт: от ${product.wholesale_min_qty} шт — скидка ${product.wholesale_discount}%</p>` : ''}
                        <h3>Описание</h3>
                        <p>${description}</p>
                    </div>
                    <div class="product-detail-actions">
                        <div class="quantity-selector">
                            <label for="productQuantity">Количество:</label>
                            <input type="number" id="productQuantity" min="1" value="1">
                        </div>
                        <button id="addToCartBtn" class="add-to-cart-btn">Добавить в корзину</button>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Навешиваем обработчики
        const addBtn = document.getElementById('addToCartBtn');
        const quantityInput = document.getElementById('productQuantity');
        
        if (addBtn) {
            addBtn.addEventListener('click', async () => {
                let quantity = parseInt(quantityInput.value);
                if (isNaN(quantity) || quantity < 1) {
                    quantity = 1;
                }
                await addToCart(quantity);
            });
        }
        
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        container.innerHTML = '<p class="error">Не удалось загрузить товар. Попробуйте позже.</p>';
    }
});