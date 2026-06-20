document.addEventListener('DOMContentLoaded', async () => {
  // جلب المنتجات من الـ Sheet أولاً
  if (typeof loadProductsFromSheet === 'function') {
    products = await loadProductsFromSheet();
  }
  
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<p class="no-products" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">جاري تحميل المنتجات أو لا توجد منتجات حالياً...</p>';
    return;
  }

  grid.innerHTML = '';
  products.forEach(p => {
    let imgHtml = p.image ? `<img src="${p.image}" alt="${p.name}">` : `<div class="p-icon-placeholder">${getIconHtml('package')}</div>`;
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="p-img">${imgHtml}</div>
      <div class="p-info">
        <h3>${p.name}</h3>
        <p class="p-desc">${p.description}</p>
        <div class="p-bottom">
          <span class="p-price">${p.price} دج</span>
          <a href="order.html?id=${p.id}" class="btn btn-gold btn-sm">اطلب الآن</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
});
