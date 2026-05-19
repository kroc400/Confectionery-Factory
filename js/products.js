// js/products.js
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.querySelector('.products-container');
    if (!productsContainer) return;

    // Функция добавления в корзину
    async function addToCart(productId, quantity = 1) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Для покупки войдите в аккаунт');
            window.location.href = '/account.html';
            return false;
        }
        try {
            const res = await fetch('/api/cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, product_id: productId, quantity })
            });
            const data = await res.json();
            if (data.success) {
                alert('Товар добавлен в корзину');
                if (window.updateCartCounter) window.updateCartCounter();
                return true;
            } else {
                alert('Ошибка: ' + (data.error || 'Не удалось добавить'));
                return false;
            }
        } catch (err) {
            console.error(err);
            alert('Сетевая ошибка');
            return false;
        }
    }

    // Загрузка товаров
    try {
        const response = await fetch('/api/products.php');
        const products = await response.json();

        if (!products.length) {
            productsContainer.innerHTML = '<p>Товары временно отсутствуют.</p>';
            return;
        }

        // Генерируем HTML, чередуя класс reverse
        let html = '';
        products.forEach((product, index) => {
            const reverseClass = index % 2 === 1 ? 'reverse' : '';
            html += `
                <div class="product-item ${reverseClass}">
                    <div class="product-image">
                        <img src="${product.image || '/img/products/default.jpg'}" alt="${product.name}">
                    </div>
                    <div class="product-content">
                        <h3><a href="/product.html?id=${product.id}">${product.name} →</a></h3>
                        <p>${product.description || 'Описание отсутствует'}</p>
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

        // Навешиваем обработчики на кнопки
        document.querySelectorAll('.buy-button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = parseInt(btn.dataset.id);
                const qtyInput = document.querySelector(`.buy-quantity[data-id="${productId}"]`);
                const quantity = parseInt(qtyInput?.value || 1);
                if (quantity < 1) return;
                await addToCart(productId, quantity);
            });
        });

    } catch (error) {
        console.error(error);
        productsContainer.innerHTML = '<p>Ошибка загрузки товаров. Попробуйте позже.</p>';
    }
});