// js/product.js
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.getElementById('productDetail');
    
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
        
        if (product.error) {
            container.innerHTML = `<p class="error">${product.error}</p>`;
            return;
        }
        
        document.title = `${product.name} – Кондитерская фабрика`;
        
        // Определяем следующую сладость (для навигации)
        const nextId = parseInt(productId) + 1;
        const totalProducts = 4;
        let nextLink = '';
        if (nextId <= totalProducts) {
            let nextName = '';
            if (nextId === 2) nextName = 'Медовый луг';
            if (nextId === 3) nextName = 'Морской бриз';
            if (nextId === 4) nextName = 'Бабушкины сказки';
            nextLink = `<hr><a class="next-a" href="/product.html?id=${nextId}">следующая сладость →</a>`;
        } else {
            nextLink = `<hr><a class="next-a" href="/product.html?id=1">в начало →</a>`;
        }
        
        // Генерируем HTML в старой структуре
        const html = `
            <section class="candy-section">
                <div class="candy-container">
                    <div class="candy-left">
                        <img src="${product.image || '/img/products/default.jpg'}" alt="${product.name}" onerror="this.src='/img/products/default.jpg'">
                    </div>
                    <div class="candy-right">
                        <div class="candy-section-title">«${product.name}»</div>
                        <div class="candy-description">
                            <h3>Цена: ${product.price} ₽</h3>
                            ${product.wholesale_min_qty > 0 ? `<p><strong>Оптовая скидка ${product.wholesale_discount}%</strong> — при заказе от ${product.wholesale_min_qty} шт</p>` : ''}
                            
                            <div class="product-buy-block">
                                <div class="quantity-selector">
                                    <label for="productQuantity">Количество:</label>
                                    <input type="number" id="productQuantity" min="1" value="1">
                                </div>
                                <button id="addToCartBtn" class="add-to-cart-btn">Добавить в корзину</button>
                            </div>
                            
                            <h3>Полное описание</h3>
                            ${product.full_description || '<p>Описание отсутствует</p>'}
                        </div>
                    </div>
                </div>
                ${nextLink}
            </section>
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