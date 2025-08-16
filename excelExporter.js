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

function exportScheduleToExcel(containerSelector = "#tableContainer", fileName = "班表檢查結果.xlsx") {
  const tables = document.querySelectorAll(`${containerSelector} table`);
  if (tables.length === 0) {
    alert("目前沒有可匯出的班表！");
    return;
  }

  const wb = XLSX.utils.book_new();
  const usedNames = new Set();

  tables.forEach((table, index) => {
    const rawName = table.caption?.textContent || `Sheet${index + 1}`;
    let sheetName = sanitizeSheetName(rawName, `Sheet${index + 1}`);

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
    XLSX.utils.book_append_sheet(wb, ws, finalName);
  });

  XLSX.writeFile(wb, fileName);
}

// 掛到全域，讓 HTML 可以呼叫
window.exportScheduleToExcel = exportScheduleToExcel;