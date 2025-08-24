//scheduleRenderer.js

window.renderScheduleTable = function () {
  // 🔧 私有函式：根據 mode 回傳檢查欄位標題
  function getCheckFieldTitles(mode) {
    if (mode === "flexible") return ["前2週FF", "後2週FF", "四週WW"];
    if (mode === "monthly") return ["OFF", "FF", "WW", "六", "日", "小", "大"];
    return [];
  }

  const state = window.scheduleState;
  const rawRows = state.rawRows;

  document.getElementById("weeklyTableContainer").innerHTML = "";
  document.getElementById("monthlyTableContainer").innerHTML = "";

  if (!rawRows || rawRows.length === 0) {
    document.getElementById("weeklyTableContainer").innerHTML = "<p>尚未匯入班表資料</p>";
    document.getElementById("monthlyTableContainer").innerHTML = "<p>尚未匯入班表資料</p>";
    return;
  }

  const isFlexible = document.getElementById("checkboxWeekly")?.checked;
  const isMonthly = document.getElementById("checkboxMonthly")?.checked;
  const startDate = new Date(state.startDate);
  const totalDays = rawRows[0].length - 3;
  const fullDates = DateUtils.getDatesRange(startDate, totalDays);
  const checkResults = checkSchedule(rawRows, fullDates);
  state.checkResults = checkResults;

  if (isFlexible) {
    const daysPerCycle = 28;
    const totalCycles = Math.ceil(totalDays / daysPerCycle);
    const cycleLimit = state.periodCount || totalCycles;

    for (let i = 0; i < Math.min(totalCycles, cycleLimit); i++) {
      const segmentDates = DateUtils.getDatesRange(DateUtils.addDays(startDate, i * daysPerCycle), daysPerCycle);
      const resultKeys = getCheckFieldTitles("flexible").concat("FF-FF<12");
      const columnOffset = 3 + i * daysPerCycle;

      const periodRows = rawRows.map(row => {
        const base = row.slice(0, 3);
        const schedule = row.slice(columnOffset, columnOffset + daysPerCycle);
        while (schedule.length < daysPerCycle) schedule.push("");
        return base.concat(schedule);
      });

      const checks = rawRows.map((_, idx) => {
        const result = {};
        getCheckFieldTitles("flexible").forEach(k => {
          const key = `週期${i + 1}_${k}`;
          result[k] = checkResults[idx]?.[key] ?? "-";
          result[k + "_hover"] = checkResults[idx]?.[key + "_hover"] ?? "";
        });
        const ffKey = `週期${i + 1}_FF-FF<12`;
        result["FF-FF<12"] = checkResults[idx]?.[ffKey] ?? "-";
        result["FF-FF<12_hover"] = checkResults[idx]?.[ffKey + "_hover"] ?? "";
        return result;
      });

      TableBuilder.renderTableBlock(
        `第${i + 1}週期：${DateUtils.formatDate(segmentDates[0])} ~ ${DateUtils.formatDate(segmentDates.at(-1))}`,
        periodRows,
        segmentDates,
        resultKeys,
        checks,
        columnOffset,
        "flexible"
      );
    }
  }

  if (isMonthly && state.monthStr) {
    const [y, m] = state.monthStr.split("-").map(Number);
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0);
    const monthDates = DateUtils.getDatesRange(monthStart, monthEnd.getDate());
    const resultKeys = getCheckFieldTitles("monthly");

    const offsetFromStart = DateUtils.getColumnOffsetByDate(startDate, monthStart);
    const columnOffset = 3 + Math.max(0, offsetFromStart); // 避免負值導致 slice 錯誤

    const periodRows = rawRows.map(row => {
      const base = row.slice(0, 3);
      const schedule = [];

      for (let i = 0; i < monthDates.length; i++) {
        const globalIndex = offsetFromStart + i;
        const cellIndex = 3 + globalIndex;
        schedule.push(globalIndex >= 0 ? row[cellIndex] ?? "" : ""); // 前段補空白
      }

      return base.concat(schedule);
    });

    const checks = checkResults.map((result = {}) => {
      const filtered = {};
      resultKeys.forEach(k => {
        filtered[k] = result[k] ?? "-";
        filtered[k + "_hover"] = result[k + "_hover"] ?? "";
      });
      return filtered;
    });

    if (offsetFromStart < 0) {
      const notice = document.createElement("div");
      notice.className = "notice";
      notice.textContent = `📌 班表起始日為 ${DateUtils.formatDate(startDate)}，本月前段將顯示為空白`;
      document.getElementById("monthlyTableContainer").prepend(notice);
    }

    TableBuilder.renderTableBlock(
      `月排班：${DateUtils.formatDate(monthStart)} ~ ${DateUtils.formatDate(monthEnd)}`,
      periodRows,
      monthDates,
      resultKeys,
      checks,
      columnOffset,
      "monthly"
    );
  }
};