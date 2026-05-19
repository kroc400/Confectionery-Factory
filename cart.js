// js/cart.js
document.addEventListener('DOMContentLoaded', async () => {
    const cartContainer = document.getElementById('cartItems');
    const subtotalSpan = document.getElementById('subtotal');
    const discountSpan = document.getElementById('discount');
    const totalSpan = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let cartData = [];

    async function loadCart() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            cartContainer.innerHTML = '<p>Войдите в аккаунт, чтобы увидеть корзину.</p>';
            return;
        }
        const res = await fetch(`/api/cart.php?user_id=${userId}`);
        cartData = await res.json();
        renderCart();
    }

    function renderCart() {
        if (!cartData.length) {
            cartContainer.innerHTML = '<p>Корзина пуста. Добавьте товары через каталог.</p>';
            subtotalSpan.textContent = '0 ₽';
            discountSpan.textContent = '0 ₽';
            totalSpan.textContent = '0 ₽';
            return;
        }

        let html = '<table class="cart-table"><thead><tr><th>Товар</th><th>Цена</th><th>Количество</th><th>Скидка</th><th>Сумма</th><th></th></tr></thead><tbody>';
        let subtotal = 0;
        let discountTotal = 0;

        for (const item of cartData) {
            const itemPrice = parseFloat(item.price);
            const finalPrice = parseFloat(item.final_price);
            const quantity = item.quantity;
            const itemSubtotal = itemPrice * quantity;
            const itemTotal = finalPrice * quantity;
            const discount = itemSubtotal - itemTotal;
            subtotal += itemSubtotal;
            discountTotal += discount;

            html += `
                <tr data-product-id="${item.product_id}">
                    <td>${item.name}</td>
                    <td>${itemPrice} ₽</td>
                    <td>
                        <input type="number" min="1" value="${quantity}" class="cart-qty" data-id="${item.product_id}">
                    </td>
                    <td>${discount > 0 ? `-${discount} ₽ (опт)` : '—'}</td>
                    <td class="item-total">${itemTotal} ₽</td>
                    <td><button class="remove-item" data-id="${item.product_id}">Удалить</button></td>
                </tr>
            `;
        }
        html += '</tbody></table>';
        cartContainer.innerHTML = html;

        subtotalSpan.textContent = subtotal.toFixed(2) + ' ₽';
        discountSpan.textContent = discountTotal.toFixed(2) + ' ₽';
        totalSpan.textContent = (subtotal - discountTotal).toFixed(2) + ' ₽';

        // Обработчики изменения количества
        document.querySelectorAll('.cart-qty').forEach(input => {
            input.addEventListener('change', async (e) => {
                const productId = parseInt(e.target.dataset.id);
                const newQty = parseInt(e.target.value);
                if (isNaN(newQty) || newQty < 1) return;
                await updateCartItem(productId, newQty);
                await loadCart();
            });
        });

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
        await fetch('/api/cart.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: productId, quantity })
        });
    }

    checkoutBtn.addEventListener('click', async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Пожалуйста, войдите в аккаунт для оформления заказа.');
            return;
        }
        const res = await fetch('/api/orders.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });
        const result = await res.json();
        if (result.success) {
            alert(`Заказ №${result.order_id} успешно оформлен!`);
            loadCart();
        } else {
            alert('Ошибка: ' + result.error);
        }
    });

    loadCart();
});