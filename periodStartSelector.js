//periodStartSelector.js

// periodStartSelector.js

const BASE_CYCLE_START = new Date("2025-01-06"); // 第一週期起始日（週一）
const CYCLE_LENGTH_DAYS = 28; // 每週期 28 天
const DEFAULT_CYCLE_COUNT = 16; // 預設顯示 50 個週期

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getCycleStartDates(count = DEFAULT_CYCLE_COUNT) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const cycleStart = new Date(BASE_CYCLE_START);
    cycleStart.setDate(BASE_CYCLE_START.getDate() + i * CYCLE_LENGTH_DAYS);
    dates.push(formatDate(cycleStart));
  }
  return dates;
}

function findClosestCycleStart(targetDateStr, cycleDates) {
  const targetDate = new Date(targetDateStr);
  let closest = cycleDates[0];
  let minDiff = Math.abs(new Date(closest) - targetDate);

  for (let dateStr of cycleDates) {
    const diff = Math.abs(new Date(dateStr) - targetDate);
    if (diff < minDiff) {
      closest = dateStr;
      minDiff = diff;
    }
  }

  return closest;
}

function renderPeriodStartSelector(referenceDate = new Date()) {
  const select = document.getElementById("periodStartSelector");
  if (!select) return;

  select.innerHTML = "";

  const cycleDates = getCycleStartDates();
  cycleDates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    select.appendChild(option);
  });

  // 預設選擇最接近 referenceDate 的週期
  const closest = findClosestCycleStart(referenceDate, cycleDates);
  select.value = closest;

  // 同步狀態（若有使用全域狀態）
  if (window.scheduleState) {
    window.scheduleState.startDate = closest;
  }
}
