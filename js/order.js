document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const custWilaya = document.getElementById('custWilaya');
  const deliveryArea = document.getElementById('deliveryArea');
  const totalBox = document.getElementById('totalBox');
  const totalProduct = document.getElementById('totalProduct');
  const totalDelivery = document.getElementById('totalDelivery');
  const totalGrand = document.getElementById('totalGrand');
  const submitBtn = document.getElementById('submitBtn');
  const submitLabel = document.getElementById('submitLabel');
  const submitError = document.getElementById('submitError');
  const orderView = document.getElementById('orderView');
  const successView = document.getElementById('successView');
  const orderIdDisplay = document.getElementById('orderIdDisplay');
  const productSummary = document.getElementById('productSummary');

  // 1) جلب المنتج المختار من الرابط (URL)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // إذا لم يتم تحديد منتج، الرجوع للرئيسية
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  let selectedProduct = null;

  // دالة لعرض تفاصيل المنتج في بطاقة الملخص
  function displayProductSummary() {
    if (!selectedProduct) return;
    
    let imgHtml = selectedProduct.image 
      ? `<img src="${selectedProduct.image}" alt="${selectedProduct.name}">` 
      : `<div class="p-icon-placeholder">${getIconHtml('package')}</div>`;

    productSummary.innerHTML = `
      <div class="summary-product">
        <div class="summary-img">${imgHtml}</div>
        <div class="summary-info">
          <h3>${selectedProduct.name}</h3>
          <p class="summary-price">${selectedProduct.price} دج</p>
        </div>
      </div>
    `;
    totalProduct.textContent = `${selectedProduct.price} دج`;
    updateTotals();
  }

  // انتظام تحميل المنتجات (تأكد من قراءتها من الـ Sheet أولاً)
  async function initOrderPage() {
    if (typeof loadProductsFromSheet === 'function') {
      products = await loadProductsFromSheet();
    }
    
    selectedProduct = products.find(p => p.id === productId);
    
    if (!selectedProduct) {
      alert('المنتج غير موجود!');
      window.location.href = 'index.html';
      return;
    }
    
    displayProductSummary();
    initWilayas();
  }

  // 2) تعبئة قائمة الولايات
  function initWilayas() {
    if (typeof wilayas === 'undefined') return;
    
    wilayas.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = `${w.id} - ${w.name}`;
      custWilaya.appendChild(opt);
    });
  }

  // 3) عند تغيير الولاية تظهر خيارات التوصيل وأسعارها
  custWilaya.addEventListener('change', () => {
    const wilayaId = custWilaya.value;
    deliveryArea.innerHTML = '';
    
    if (!wilayaId || typeof wilayas === 'undefined') {
      deliveryArea.innerHTML = '<span class="hint">اختر الولاية أولاً ليظهر لك سعر التوصيل</span>';
      totalBox.style.display = 'none';
      return;
    }

    const selectedWilaya = wilayas.find(w => w.id == wilayaId);
    if (!selectedWilaya) return;

    // إنشاء خيارات التوصيل (منزل / مكتب)
    let homeChecked = 'checked';
    let deskChecked = '';
    
    // إذا كان التوصيل للمكتب فقط متوفر
    if (selectedWilaya.home === false) {
      homeChecked = '';
      deskChecked = 'checked';
    }

    let html = '';
    
    if (selectedWilaya.home !== false) {
      html += `
        <label class="delivery-option">
          <input type="radio" name="deliveryType" value="home" data-price="${selectedWilaya.home}" ${homeChecked}>
          <div class="d-text">
            <span class="d-title">توصيل للمنزل (${selectedWilaya.home} دج)</span>
            <span class="d-desc">الدفع عند الاستلام في باب دارك</span>
          </div>
        </label>
      `;
    }

    if (selectedWilaya.desk !== false) {
      html += `
        <label class="delivery-option">
          <input type="radio" name="deliveryType" value="desk" data-price="${selectedWilaya.desk}" ${deskChecked}>
          <div class="d-text">
            <span class="d-title">استلام من مكتب شركة التوصيل (${selectedWilaya.desk} دج)</span>
            <span class="d-desc">تذهب أنت للمكتب وتستلم سلعتك</span>
          </div>
        </label>
      `;
    }

    deliveryArea.innerHTML = html;
    totalBox.style.display = 'block';
    updateTotals();

    // إضافة مستمع حدث عند تغيير خيار التوصيل
    const radios = deliveryArea.querySelectorAll('input[name="deliveryType"]');
    radios.forEach(r => r.addEventListener('change', updateTotals));
  });

  // 4) تحديث المجموع الإجمالي وسعر التوصيل
  function updateTotals() {
    if (!selectedProduct || !custWilaya.value) return;

    const checkedRadio = deliveryArea.querySelector('input[name="deliveryType"]:checked');
    if (!checkedRadio) return;

    const delPrice = Number(checkedRadio.dataset.price);
    const prodPrice = Number(selectedProduct.price);
    const grandTotal = prodPrice + delPrice;

    totalDelivery.textContent = `${delPrice} دج`;
    totalGrand.textContent = `${grandTotal} دج`;
  }

  // 5) توليد رقم طلب عشوائي ومميز للجزائر
  function generateOrderId() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DZ-${day}${month}${year}-${rand}`;
  }

  // 6) إرسال الفورم وتأكيد الطلب
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitError.classList.add('hidden');

    // التحقق من المدخلات (Validation)
    let isValid = true;

    const custName = document.getElementById('custName');
    const custPhone = document.getElementById('custPhone');

    // اسم الزبون
    if (!custName.value.trim()) {
      custName.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      custName.parentElement.classList.remove('has-error');
    }

    // رقم الهاتف الجزائري (9 أو 10 أرقام)
    const phoneVal = custPhone.value.trim();
    const phoneRegex = /^(05|06|07|02|03|04)\d{8}$|^[567]\d{8}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      custPhone.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      custPhone.parentElement.classList.remove('has-error');
    }

    // الولاية
    if (!custWilaya.value) {
      custWilaya.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      custWilaya.parentElement.classList.remove('has-error');
    }

    if (!isValid) return;

    // تعطيل الزر أثناء الإرسال لمنع التكرار
    submitBtn.disabled = true;
    submitLabel.style.display = 'none';
    
    // إنشاء كائن بيانات الطلب
    const checkedRadio = deliveryArea.querySelector('input[name="deliveryType"]:checked');
    const deliveryTypeLabel = checkedRadio.value === 'home' ? 'توصيل للمنزل' : 'مكتب شركة التوصيل';
    
    const orderData = {
      orderId: generateOrderId(),
      date: new Date().toLocaleString('ar-DZ'),
      productName: selectedProduct.name,
      productPrice: selectedProduct.price,
      wilaya: custWilaya.options[custWilaya.selectedIndex].text,
      deliveryType: deliveryTypeLabel,
      deliveryPrice: Number(checkedRadio.dataset.price),
      totalGrand: Number(selectedProduct.price) + Number(checkedRadio.dataset.price),
      custName: custName.value.trim(),
      custPhone: phoneVal
    };

    // إرسال الطلبية إلى SheetDB في ورقة orders
    try {
      const response = await fetch(APPS_SCRIPT_URL + "?sheet=orders", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [
            {
              "رقم الطلب": orderData.orderId,
              "التاريخ": orderData.date,
              "المنتج": orderData.productName,
              "سعر المنتج": orderData.productPrice,
              "الولاية": orderData.wilaya,
              "نوع التوصيل": orderData.deliveryType,
              "سعر التوصيل": orderData.deliveryPrice,
              "المبلغ الإجمالي": orderData.totalGrand,
              "اسم الزبون": orderData.custName,
              "رقم الهاتف": orderData.custPhone
            }
          ]
        })
      });

      const result = await response.json();
      
      // الشيك على نجاح العملية مع SheetDB
      if (response.ok && (result.created || result.status === "success")) {
        showSuccess(orderData.orderId);
      } else {
        throw new Error("فشل تسجيل الطلب في SheetDB");
      }

    } catch (error) {
      console.error("Error submitting order:", error);
      submitError.classList.remove('hidden');
      submitBtn.disabled = false;
      submitLabel.style.display = 'inline';
    }
  });

  // دالة لعرض صفحة النجاح بعد الطلب
  function showSuccess(id) {
    orderView.classList.add('hidden');
    success
