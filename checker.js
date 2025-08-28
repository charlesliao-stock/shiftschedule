//checker.js

function checkSchedule(rows, fullDates) {
  const results = [];
  const daysPerCycle = 28;
  const shiftStartIndex = 3;

  const checkMonthStr = document.getElementById("monthSelector")?.value || "";
  const [checkYear, checkMonthNum] = checkMonthStr.split("-").map(Number);
  const isMonthlyMode = document.getElementById("checkboxMonthly")?.checked;

  const shiftGroups = loadShiftGroups();

  rows.forEach(row => {
    const result = {};
    const totalDays = fullDates.length;
    const totalCycles = Math.ceil(totalDays / daysPerCycle);

    // ✅ 月統計
    if (isMonthlyMode && checkMonthStr) {
      const monthDateSlice = fullDates.filter(date => {
        if (!(date instanceof Date)) return false;
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return monthStr === checkMonthStr;
      });

      let countFF = 0, countWW = 0;
      let countSAT = 0, countSUN = 0;
      let totalSAT = 0, totalSUN = 0;
      let countSmall = 0, countLarge = 0;
      let countOFF = 0;

      monthDateSlice.forEach(date => {
        const shift = getShiftByDate(row, date, fullDates, shiftStartIndex);
        const weekday = date.getDay();

        if (weekday === 6) totalSAT++;
        if (weekday === 0) totalSUN++;

        if (shift === "FF") countFF++;
        if (shiftGroups["WW"].includes(shift)) countWW++;
        if (shiftGroups["小夜"].includes(shift)) countSmall++;
        if (shiftGroups["大夜"].includes(shift)) countLarge++;

        if (shiftGroups["OFF"].includes(shift)) {
          countOFF++;
          if (weekday === 6) countSAT++;
          if (weekday === 0) countSUN++;
        }
      });

      result["OFF"] = countOFF;
      result["FF"] = `${countFF}`;
      result["FF_warn"] = countFF < totalSUN;
      result["WW"] = `${countWW}`;
      result["WW_warn"] = countWW < totalSAT;
      result["六"] = countSAT;
      result["日"] = countSUN;
      result["小"] = countSmall;
      result["大"] = countLarge;
    }

    // ✅ FF 間隔與續航性檢查
    const ffIndices = [];
    const ffViolationsByCycle = {};

    for (let i = 0; i < fullDates.length; i++) {
      const shift = row[shiftStartIndex + i] ?? "";
      if (shift === "FF") ffIndices.push(i);
    }

    // FF 間隔檢查
    for (let i = 1; i < ffIndices.length; i++) {
      const prevIdx = ffIndices[i - 1];
      const currIdx = ffIndices[i];
      const prevDate = fullDates[prevIdx];
      const currDate = fullDates[currIdx];
      const gap = getExclusiveDayDifference(prevDate, currDate);

      if (gap > 12) {
        const cycleIndex = Math.floor(currIdx / daysPerCycle) + 1;
        const msg = `${formatDate(prevDate)} 與 ${formatDate(currDate)} 間隔 ${gap} 天`;
        if (!ffViolationsByCycle[cycleIndex]) ffViolationsByCycle[cycleIndex] = [];
        ffViolationsByCycle[cycleIndex].push(msg);
      }
    }

    // FF 續航性檢查
    for (let i = 0; i < ffIndices.length; i++) {
      const currentIdx = ffIndices[i];
      const currentDate = fullDates[currentIdx];
      const cycleIndex = Math.floor(currentIdx / daysPerCycle) + 1;

      let nextFFIdx = -1;
      for (let j = i + 1; j < ffIndices.length; j++) {
        if (ffIndices[j] > currentIdx) {
          nextFFIdx = ffIndices[j];
          break;
        }
      }

      if (nextFFIdx !== -1) {
        const nextDate = fullDates[nextFFIdx];
        const gap = getExclusiveDayDifference(currentDate, nextDate);
        if (gap > 12) {
          const msg = `${formatDate(currentDate)} 後 ${gap} 天才出現下一個 FF`;
          if (!ffViolationsByCycle[cycleIndex]) ffViolationsByCycle[cycleIndex] = [];
          ffViolationsByCycle[cycleIndex].push(msg);
        }
      } else {
        const remainingDays = fullDates.length - currentIdx - 1;
        if (remainingDays >= 12) {
          const msg = `${formatDate(currentDate)} 後 12 天內未再出現 FF（已無後續 FF）`;
          if (!ffViolationsByCycle[cycleIndex]) ffViolationsByCycle[cycleIndex] = [];
          ffViolationsByCycle[cycleIndex].push(msg);
        }
      }
    }

    // ✅ 每週期統計
    for (let c = 0; c < totalCycles; c++) {
      const startIdx = c * daysPerCycle;
      const endIdx = Math.min(startIdx + daysPerCycle, totalDays);
      const cycleDates = fullDates.slice(startIdx, endIdx);
      const cycleShifts = row.slice(shiftStartIndex + startIdx, shiftStartIndex + endIdx);

      const cycleFF = cycleShifts.filter(s => s === "FF").length;
      const cycleWW = cycleShifts.filter(s => shiftGroups["WW"].includes(s)).length;
      const cycleSmall = cycleShifts.filter(s => shiftGroups["小夜"].includes(s)).length;
      const cycleLarge = cycleShifts.filter(s => shiftGroups["大夜"].includes(s)).length;

      result[`週期${c + 1}_前2週FF`] = cycleShifts.slice(0, 14).filter(s => s === "FF").length;
      result[`週期${c + 1}_後2週FF`] = cycleShifts.slice(14).filter(s => s === "FF").length;
      result[`週期${c + 1}_四週WW`] = cycleWW;

      result[`週期${c + 1}_統計`] = { FF: cycleFF, WW: cycleWW, 小: cycleSmall, 大: cycleLarge };
      result[`週期${c + 1}_範圍`] = `${formatDate(cycleDates[0])} ~ ${formatDate(cycleDates.at(-1))}`;
      result[`週期${c + 1}_班表`] = cycleDates.map((date, i) => ({
        date: formatDate(date),
        shift: cycleShifts[i] ?? ""
      }));

      const violations = ffViolationsByCycle[c + 1];
      if (violations?.length) {
        result[`週期${c + 1}_FF-FF<12`] = `❗(${violations.length}筆)`;
        result[`週期${c + 1}_FF-FF<12_hover`] = violations.join("\n");
      } else {
        result[`週期${c + 1}_FF-FF<12`] = "✅";
        result[`週期${c + 1}_FF-FF<12_hover`] = "所有 FF 間隔與續航均符合規則";
      }
    }

    results.push(result);
  });

  return results;
}

// ✅ 工具函式：定位班別欄位
function getShiftByDate(row, date, fullDates, shiftStartIndex = 3) {
  const index = fullDates.findIndex(d =>
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );

  if (index === -1 || row[shiftStartIndex + index] === undefined) {
    console.warn(`⚠️ 找不到 ${formatDate(date)} 的班別資料`);
    return "__";
  }

  return String(row[shiftStartIndex + index] ?? "").trim();
}

// ✅ 工具函式：格式化日期
function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// ✅ 工具函式：清除時間資訊
function normalizeDate(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    console.warn(`⚠️ 日期格式錯誤：${date}`);
    return new Date("1970-01-01"); // fallback 日期
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
//✅ 工具函式：exclusive 日期間隔（不含首尾日）
function getExclusiveDayDifference(date1, date2) {
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor((d2 - d1) / msPerDay);
  return Math.max(diff - 1, 0);
}