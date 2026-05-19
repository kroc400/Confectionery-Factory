// js/loadProducts.js
export async function loadProducts(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error('Контейнер не найден:', containerSelector);
        return;
    }
    
    try {
        const response = await fetch('/api/products.php');
        const products = await response.json();
        
        if (!products.length) {
            container.innerHTML = '<p class="no-products">Товары временно отсутствуют.</p>';
            return;
        }
        
        let html = '';
        products.forEach((product, index) => {
            const reverseClass = index % 2 === 1 ? 'reverse' : '';
            const description = (product.description || 'Описание отсутствует').substring(0, 200);
            
            html += `
                <div class="product-item ${reverseClass}">
                    <div class="product-image">
                        <img src="${product.image || '/img/products/default.jpg'}" alt="${product.name}" onerror="this.src='/img/products/default.jpg'">
                    </div>
                    <div class="product-content">
                        <h3><a href="/product.html?id=${product.id}">${product.name} →</a></h3>
                        <p>${description}</p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        container.innerHTML = '<p class="error">Не удалось загрузить товары. Попробуйте позже.</p>';
    }
}