function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("product");
  var data = sheet.getDataRange().getValues();
  var products = [];
  
  for (var i = 1; i < data.length; i++) {
    products.push({
      id: data[i][0].toString(),
      name: data[i][1],
      price: Number(data[i][2]),
      description: data[i][3],
      image: data[i][4] || ""
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("orders");
  
  try {
    var params = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      params.orderId,
      params.date,
      params.productName,
      params.productPrice,
      params.wilaya,
      params.deliveryType,
      params.deliveryPrice,
      params.totalGrand,
      params.custName,
      params.custPhone
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
