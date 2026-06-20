// جلب المنتجات من SheetDB من ورقة product
async function loadProductsFromSheet() {
  try {
    const response = await fetch(APPS_SCRIPT_URL + "?sheet=product");
    const productsData = await response.json();
    
    // إذا كانت البيانات عبارة عن كائن خطأ أو ليست مصفوفة
    if (!Array.isArray(productsData)) {
      console.error("بنية البيانات قادمة بشكل خاطئ من SheetDB", productsData);
      return [];
    }

    // تحويل الأسعار إلى أرقام والتأكد من الحقول
    return productsData.map(p => ({
      id: p.id ? p.id.toString() : "",
      name: p.name || "",
      price: Number(p.price) || 0,
      description: p.description || "",
      image: p.image || ""
    }));
  } catch (error) {
    console.error("خطأ في جلب المنتجات عبر SheetDB:", error);
    return [];
  }
}

let products = [];
