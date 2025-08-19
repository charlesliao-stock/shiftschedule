//tableRenderer.js


(function () {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const daysPerCycle = 28;

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  function getDatesRange(start, count) {
    return Array.from({ length: count }, (_, i) => addDays(start, i));
  }

  function getColumnOffsetByDate(startDate, targetDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((targetDate - startDate) / msPerDay);
  }

  function getCheckFieldTitles(mode) {
    if (mode === "flexible") return ["前2週FF", "後2週FF", "四週WW"];
    if (mode === "monthly") return ["OFF", "FF", "WW", "六", "日", "小", "大"];
    return [];
  }

  function applyAlertStyle(td, key, value, context = {}) {
    const num = Number(value);
    td.classList.remove("alertCell");

    if (key === "前2週FF" && num < 2) td.classList.add("alertCell");
    if (key === "後2週FF" && num < 2) td.classList.add("alertCell");
    if (key === "四週WW" && num < 4) td.classList.add("alertCell");

    if (key === "FF-FF<12" && value.includes("❗")) td.classList.add("alertCell");

    if (context.isMonthly && context.monthDates) {
      const sundays = context.monthDates.filter(d => d.getDay() === 0).length;
      const saturdays = context.monthDates.filter(d => d.getDay() === 6).length;

      if (key === "FF" && num < sundays) td.classList.add("alertCell");
      if (key === "WW" && num < saturdays) td.classList.add("alertCell");
    }
  }

  function syncAndRecheckCell(td, dates, resultKeys, mode, columnOffset) {
    const globalIndex = parseInt(td.getAttribute("data-index"), 10);
    const rowIndex = parseInt(td.getAttribute("data-row-index"), 10);
    const editedText = td.textContent.trim();

    window.scheduleState.selectedRows[rowIndex][globalIndex] = editedText;

    document.querySelectorAll(
      `td[data-index="${globalIndex}"][data-row-index="${rowIndex}"]`
    ).forEach(cell => {
      if (cell !== td) cell.textContent = editedText;
    });

    const startDate = new Date(window.scheduleState.startDate);
    const selectedCols = window.scheduleState.selectedCols ?? [];
    const totalDays = selectedCols.length;
    const fullDates = getDatesRange(startDate, totalDays);
    const updatedCheck = checkSchedule([window.scheduleState.selectedRows[rowIndex]], fullDates)[0];

    const tr = td.parentElement;

    resultKeys.forEach(k => {
      const resCell = tr.querySelector(`.checkResultCol[data-key="${k}"]`);
      if (resCell) {
        const fullKey = mode === "flexible" ? `週期${Math.floor(columnOffset / 28) + 1}_${k}` : k;
        const val = updatedCheck[fullKey] ?? "-";
        resCell.textContent = val;
        resCell.title = updatedCheck[fullKey + "_hover"] ?? "";
        applyAlertStyle(resCell, k, val, {
          isMonthly: mode === "monthly",
          monthDates: dates
        });
      }
    });
  }

  function renderTableBlock(title, periodRows, dates, resultKeys, checkData, columnOffset, mode) {
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.textContent = title;
    table.appendChild(caption);

    const headRow = document.createElement("tr");
    headRow.innerHTML = "<th>職編</th><th>姓名</th><th>備註</th>";
    dates.forEach(d => {
      const th = document.createElement("th");
      th.textContent = weekdays[d.getDay()];
      headRow.appendChild(th);
    });
    resultKeys.forEach(k => {
      const th = document.createElement("th");
      th.textContent = k;
      th.className = "checkResultCol";
      headRow.appendChild(th);
    });
    table.appendChild(headRow);

    const dateRow = document.createElement("tr");
    dateRow.innerHTML = "<td></td><td></td><td></td>";
    dates.forEach(d => {
      const td = document.createElement("td");
      td.textContent = `${d.getMonth() + 1}/${d.getDate()}`;
      dateRow.appendChild(td);
    });
    resultKeys.forEach(() => {
      const td = document.createElement("td");
      td.className = "checkResultCol";
      td.textContent = "";
      dateRow.appendChild(td);
    });
    table.appendChild(dateRow);

    periodRows.forEach((data, idx) => {
      const tr = document.createElement("tr");

      for (let i = 0; i < 3; i++) {
        const td = document.createElement("td");
        td.textContent = data[i] ?? "";
        tr.appendChild(td);
      }

      for (let i = 0; i < dates.length; i++) {
        const td = document.createElement("td");
        td.textContent = data[3 + i] ?? "";
        td.setAttribute("contenteditable", "true");
const colIndex = window.scheduleState.selectedCols?.[i];
td.setAttribute("data-index", colIndex);

        td.setAttribute("data-row-index", idx);

        if (!td.textContent.trim()) {
          td.classList.add("emptyCell");
          td.title = "尚無資料";
        }

        if (dates[i].getDay() === 0 || dates[i].getDay() === 6) {
          td.classList.add("weekend");
        }

        td.addEventListener("input", () => {
          syncAndRecheckCell(td, dates, resultKeys, mode, columnOffset);
        });

        tr.appendChild(td);
      }

      const result = checkData[idx] || {};
      resultKeys.forEach(k => {
        const td = document.createElement("td");
        const value = result[k] ?? "-";
        td.textContent = value;
        td.className = "checkResultCol";
        td.title = result[k + "_hover"] ?? "";
        td.setAttribute("data-key", k);
        applyAlertStyle(td, k, value, {
          isMonthly: mode === "monthly",
          monthDates: dates
        });
        tr.appendChild(td);
      });

      table.appendChild(tr);
    });

    const targetContainer = mode === "flexible"
      ? document.getElementById("weeklyTableContainer")
      : document.getElementById("monthlyTableContainer");

    targetContainer.appendChild(table);
  }

  window.renderScheduleTable = function () {
    const state = window.scheduleState;
    const rawRows = state.rawRows;
    const selectedCols = state.selectedCols ?? [];

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
    const totalDays = selectedCols.length;
    const fullDates = getDatesRange(startDate, totalDays);
    const checkResults = checkSchedule(rawRows, fullDates);
    state.checkResults = checkResults;

    if (isFlexible) {
      const totalCycles = Math.ceil(totalDays / daysPerCycle);
      const cycleLimit = state.periodCount || totalCycles;

      for (let i = 0; i < Math.min(totalCycles, cycleLimit); i++) {
        const segmentDates = fullDates.slice(i * daysPerCycle, (i + 1) * daysPerCycle);
        const resultKeys = getCheckFieldTitles("flexible").concat("FF-FF<12");
        const columnOffset = 3 + i * daysPerCycle;

        const periodRows = rawRows.map(row => {
          const base = row.slice(0, 3);
          const schedule = [];

          for (let j = i * daysPerCycle; j < (i + 1) * daysPerCycle; j++) {
            const colIndex = selectedCols[j];
            schedule.push(row[colIndex] ?? "");
          }

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

        renderTableBlock(
          `第${i + 1}週期：${formatDate(segmentDates[0])} ~ ${formatDate(segmentDates.at(-1))}`,
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
      const monthDates = getDatesRange(monthStart, monthEnd.getDate());
      const resultKeys = getCheckFieldTitles("monthly");

      const columnOffset = 3 + getColumnOffsetByDate(startDate, monthStart);

      const periodRows = rawRows.map(row => {
        const base = row.slice(0, 3);
        const schedule = [];

        for (let i = 0; i < monthDates.length; i++) {
          const colIndex = selectedCols[columnOffset - 3 + i];
          schedule.push(row[colIndex] ?? "");
        }

        while (schedule.length < monthDates.length) schedule.push("");
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

      renderTableBlock(
        `月排班：${formatDate(monthStart)} ~ ${formatDate(monthEnd)}`,
        periodRows,
        monthDates,
        resultKeys,
        checks,
        columnOffset,
        "monthly"
      );
    }
  };
})();