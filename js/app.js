document.addEventListener('DOMContentLoaded', async () => {
  // 1) جلب المنتجات من الـ Sheet عبر الدالة المعرفة في products.js
  if (typeof loadProductsFromSheet === 'function') {
    products = await loadProductsFromSheet();
  }

  const grid = document.getElementById('productGrid');
  if (!grid) return;

  // إذا كانت قائمة المنتجات فارغة
  if (!products || products.length === 0) {
    grid.innerHTML = '<p class="no-products" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">حاليًا، لا توجد منتجات متوفرة. يرجى العودة لاحقًا.</p>';
    return;
  }

  grid.innerHTML = '';

  // 2) عرض المنتجات في الصفحة الرئيسية
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // التحقق إذا كانت هناك صورة أو نضع أيقونة تلقائية
    let imgHtml = p.image 
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
      : `<div class="p-placeholder">${getIconHtml('package')}</div>`;

    card.innerHTML = `
      <div class="p-img-box">${imgHtml}</div>
      <div class="p-body">
        <h3 class="p-title">${p.name}</h3>
        <p class="p-desc">${p.description}</p>
        <div class="p-footer">
          <span class="p-price">${p.price} دج</span>
          <a href="order.html?id=${p.id}" class="btn btn-gold">اطلب الآن</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
});
