//styleUtils.js

window.StyleUtils = {
  applyAlertStyle(td, key, value, context = {}) {
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
};