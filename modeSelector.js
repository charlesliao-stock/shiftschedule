//modeSelector.js
function initModeSelector() {
  const checkboxWeekly = document.getElementById("checkboxWeekly");
  const checkboxMonthly = document.getElementById("checkboxMonthly");

  // 將 label/select 配對封裝成陣列
  const weeklyFields = ["periodStartSelector", "periodCountSelector"];
  const monthlyFields = ["monthSelector"];

  // 顯示/隱藏一組 label + select
  function toggleFields(fields, show) {
    fields.forEach(id => {
      const label = document.querySelector(`label[for='${id}']`);
      const select = document.getElementById(id);

      // fallback 機制：若找不到元素則跳過
      if (!label || !select) {
        console.warn(`[modeSelector] 無法找到元素: ${id}`);
        return;
      }

      label.style.display = show ? "inline-block" : "none";
      select.style.display = show ? "inline-block" : "none";
    });
  }

  function updateVisibility() {
    const weekly = checkboxWeekly?.checked ?? false;
    const monthly = checkboxMonthly?.checked ?? false;

    toggleFields(weeklyFields, weekly);
    toggleFields(monthlyFields, monthly);
  }

  // 綁定事件並初始化
  checkboxWeekly?.addEventListener("change", updateVisibility);
  checkboxMonthly?.addEventListener("change", updateVisibility);
  updateVisibility();
}
