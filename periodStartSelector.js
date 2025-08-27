//periodStartSelector.js

function getCycleStartDates(checkDate) {
  const firstCycleStart = new Date("2025-01-06"); // 第一個週期起始日（週一）
  const cycleLength = 28; // 每週期 28 天

  // ⏱ 計算 N：檢查日所在週期編號
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((checkDate - firstCycleStart) / msPerDay);
  const cycleIndex = Math.floor(diffDays / cycleLength);

  const dates = [];
  for (let offset of [-1, 0, 1]) {
    const cycleStart = new Date(firstCycleStart);
    cycleStart.setDate(firstCycleStart.getDate() + (cycleIndex + offset) * cycleLength);
    dates.push(formatDate(cycleStart));
  }

  return dates;
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function renderPeriodStartSelector(checkDate) {
  const select = document.getElementById("periodStartSelector");
  select.innerHTML = "";

  const startDates = getCycleStartDates(checkDate);
  startDates.forEach(date => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    select.appendChild(option);
  });
}