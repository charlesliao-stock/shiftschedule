//cellSync.js

window.CellSync = {
  focusAndSelect(cell) {
    cell.focus();
    setTimeout(() => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }, 0);
  },

  syncAndRecheckCell(td, dates, resultKeys, mode, columnOffset) {
    const rowIndex = parseInt(td.getAttribute("data-row-index"), 10);
    const editedText = td.textContent.trim();
    const targetDateStr = td.getAttribute("data-date");

    if (!targetDateStr) return;

    // 🧠 找出 globalIndex 對應的資料欄位
    const startDate = new Date(window.scheduleState.startDate);
    const totalDays = window.scheduleState.selectedRows[0].length - 3;
    const fullDates = DateUtils.getDatesRange(startDate, totalDays);
    const globalIndex = fullDates.findIndex(d => DateUtils.formatDate(d) === targetDateStr);
    if (globalIndex === -1) return;

    const dataIndex = globalIndex + 3;
    window.scheduleState.selectedRows[rowIndex][dataIndex] = editedText;

    // 🔁 同步所有 cell（以日期為主）
    document.querySelectorAll(
      `td[data-date="${targetDateStr}"][data-row-index="${rowIndex}"]`
    ).forEach(cell => {
      if (cell !== td) cell.textContent = editedText;
    });

    // 🔍 重新檢查該 row 的結果
    const updatedCheck = checkSchedule(
      [window.scheduleState.selectedRows[rowIndex]],
      fullDates
    )[0];

    const tr = td.parentElement;

    resultKeys.forEach(k => {
      const resCell = tr.querySelector(`.checkResultCol[data-key="${k}"]`);
      if (resCell) {
        const fullKey = mode === "flexible"
          ? `週期${Math.floor(columnOffset / 28) + 1}_${k}`
          : k;
        const val = updatedCheck[fullKey] ?? "-";
        resCell.textContent = val;
        resCell.title = updatedCheck[fullKey + "_hover"] ?? "";
        StyleUtils.applyAlertStyle(resCell, k, val, {
          isMonthly: mode === "monthly",
          monthDates: dates
        });
      }
    });
  }
};