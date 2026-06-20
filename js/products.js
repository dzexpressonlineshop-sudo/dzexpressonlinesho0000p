// هاد الدالة تجيب المنتجات مباشرة من الـ Google Sheet عبر رابط الـ Apps Script
async function loadProductsFromSheet() {
  try {
    // قراءة الرابط من ملف الـ config
    const response = await fetch(APPS_SCRIPT_URL);
    const productsData = await response.json();
    return productsData;
  } catch (error) {
    console.error("خطأ في جلب المنتجات من الـ Sheet:", error);
    return []; // قائمة فارغة في حال حدوث خطأ
  }
}

// تعديل بسيط ليتم التوافق مع ملف app.js القديم
let products = [];
];
