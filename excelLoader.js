// excelLoader.js

(function () {
  window.handleExcelImport = function (fileInputId = "excelFile") {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput || !fileInput.files.length) {
      alert("請選擇一個 Excel 檔案！");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: true // 關鍵設定，避免自動日期解析
        });

        if (!Array.isArray(data) || data.length < 3) {
          alert("匯入失敗或資料不足！");
          return;
        }

        // 儲存到記憶體
        window.scheduleState = window.scheduleState || {};
        window.scheduleState.rawRows = data;

        // 如果你有彈窗選擇功能
        if (typeof window.showRowSelector === "function") {
          window.showRowSelector(data);
        }
      } catch (error) {
        console.error("Excel 解析錯誤：", error);
        alert("無法解析 Excel！");
      }
    };

    reader.onerror = function () {
      alert("讀取 Excel 檔案失敗！");
    };

    reader.readAsBinaryString(file);
  };
})();
