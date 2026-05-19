// js/cart.js – исправленная версия для вашего API
document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.getElementById('cartItems');
    const subtotalSpan = document.getElementById('subtotal');
    const discountSpan = document.getElementById('discount');
    const totalSpan = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let cartData = { items: [], summary: { subtotal: 0, discount: 0, total: 0 } };

    async function loadCart() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            cartContainer.innerHTML = '<p>Войдите в аккаунт, чтобы увидеть корзину.</p>';
            return;
        }
        
        try {
            const response = await fetch(`/api/cart.php?user_id=${userId}`);
            const data = await response.json();
            
            console.log('Корзина получена:', data);
            
            // Ваш API возвращает { items: [], summary: {} }
            if (data.items && Array.isArray(data.items)) {
                cartData = data;
            } else {
                cartData = { items: [], summary: { subtotal: 0, discount: 0, total: 0 } };
            }
            
            renderCart();
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
            cartContainer.innerHTML = '<p>Ошибка загрузки корзины. Попробуйте позже.</p>';
        }
    }

    function renderCart() {
        const items = cartData.items || [];
        
        if (!items.length) {
            cartContainer.innerHTML = '<p>Корзина пуста. Добавьте товары через каталог.</p>';
            subtotalSpan.textContent = '0 ₽';
            discountSpan.textContent = '0 ₽';
            totalSpan.textContent = '0 ₽';
            return;
        }

        let html = '<table class="cart-table"><thead><tr><th>Товар</th><th>Цена</th><th>Количество</th><th>Скидка</th><th>Сумма</th><th></th></tr></thead><tbody>';
        
        for (const item of items) {
            const itemTotal = (item.final_price || item.price) * item.quantity;
            const discountAmount = (item.price * item.quantity) - itemTotal;
            
            html += `
                <tr data-product-id="${item.product_id}">
                    <td>${item.name}</td>
                    <td>${item.price} ₽</td>
                    <td>
                        <input type="number" min="1" value="${item.quantity}" class="cart-qty" data-id="${item.product_id}">
                    </td>
                    <td>${discountAmount > 0 ? `-${discountAmount.toFixed(2)} ₽ (опт ${item.discount_percent}%)` : '—'}</td>
                    <td class="item-total">${itemTotal.toFixed(2)} ₽</td>
                    <td><button class="remove-item" data-id="${item.product_id}">Удалить</button></td>
                </tr>
            `;
        }
        html += '</tbody></table>';
        cartContainer.innerHTML = html;

        // Обновляем итоги из summary
        subtotalSpan.textContent = (cartData.summary.subtotal || 0).toFixed(2) + ' ₽';
        discountSpan.textContent = (cartData.summary.discount || 0).toFixed(2) + ' ₽';
        totalSpan.textContent = (cartData.summary.total || 0).toFixed(2) + ' ₽';

        // Обработчики изменения количества
        document.querySelectorAll('.cart-qty').forEach(input => {
            input.addEventListener('change', async (e) => {
                const productId = parseInt(e.target.dataset.id);
                let newQty = parseInt(e.target.value);
                if (isNaN(newQty) || newQty < 1) newQty = 1;
                await updateCartItem(productId, newQty);
                await loadCart();
            });
        });

        // Обработчики удаления
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = parseInt(e.target.dataset.id);
                await updateCartItem(productId, 0);
                await loadCart();
            });
        });
    }

    async function updateCartItem(productId, quantity) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const method = quantity === 0 ? 'DELETE' : 'PUT';
        const body = { user_id: userId, product_id: productId };
        if (quantity > 0) body.quantity = quantity;
        
        await fetch('/api/cart.php', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        // Обновляем счётчик в хедере
        if (window.updateCartCounter) window.updateCartCounter();
    }

    // Оформление заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('Пожалуйста, войдите в аккаунт для оформления заказа.');
                window.location.href = '/account.html';
                return;
            }
            
            try {
                const response = await fetch('/api/orders.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });
                const result = await response.json();
                if (result.success) {
                    alert(`Заказ №${result.order_id} успешно оформлен!`);
                    if (window.updateCartCounter) window.updateCartCounter();
                    await loadCart();
                } else {
                    alert('Ошибка: ' + (result.error || 'Не удалось оформить заказ'));
                }
            } catch (err) {
                console.error('Ошибка оформления:', err);
                alert('Сетевая ошибка. Попробуйте позже.');
            }
        });
    }

    // Загружаем корзину
    await loadCart();
});