//excelExporter.js

function sanitizeCell(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function sanitizeSheetName(name, fallback = "Sheet") {
  return String(name ?? fallback)
    .replace(/[\[\]\*\/\\\?\:]/g, "")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 31)
    .trim() || fallback;
}

function exportScheduleToExcel(fileName = `班表檢查結果_${new Date().toISOString().slice(0, 10)}.xlsx`) {
  const selectors = [];
  if (document.getElementById("checkboxWeekly")?.checked) selectors.push("#weeklyTableContainer");
  if (document.getElementById("checkboxMonthly")?.checked) selectors.push("#monthlyTableContainer");

  if (selectors.length === 0) {
    alert("請先勾選欲匯出的模式（週期或月排班）！");
    return;
  }

  const wb = XLSX.utils.book_new();
  const usedNames = new Set();
  let tableFound = false;

  selectors.forEach(selector => {
    const container = document.querySelector(selector);
    if (!container) return;

    const tables = container.querySelectorAll("table");
    tables.forEach((table, index) => {
      tableFound = true;

      const rawName = table.caption?.textContent || `Sheet_${selector}_${index + 1}`;
      let sheetName = sanitizeSheetName(rawName);
      let finalName = sheetName;
      let suffix = 1;
      while (usedNames.has(finalName)) {
        finalName = `${sheetName}_${suffix++}`;
      }
      usedNames.add(finalName);

      const rows = [];
      const trs = table.querySelectorAll("tr");
      let maxCols = 0;
      trs.forEach(tr => {
        const cells = tr.querySelectorAll("th, td");
        if (cells.length > maxCols) maxCols = cells.length;
      });

      trs.forEach(tr => {
        const row = [];
        tr.querySelectorAll("th, td").forEach(cell => {
          row.push(sanitizeCell(cell.textContent));
        });
        while (row.length < maxCols) row.push("");
        rows.push(row.slice(0, maxCols));
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!freeze'] = { xSplit: 3, ySplit: 2 }; // ✅ 凍結前3欄與前2列
      XLSX.utils.book_append_sheet(wb, ws, finalName);
    });
  });

  if (!tableFound) {
    alert("目前沒有可匯出的班表！");
    return;
  }

  XLSX.writeFile(wb, fileName);
}

// 掛到全域，讓 HTML 可以呼叫
window.exportScheduleToExcel = exportScheduleToExcel;