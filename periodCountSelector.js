//periodCountSelector.js

function renderPeriodCountSelector() {
  const select = document.getElementById("periodCountSelector");
  select.innerHTML = ""; // 清空舊項目

  const maxCount = 16;
  for (let count = 1; count <= maxCount; count++) {
    const option = document.createElement("option");
    option.value = count;
    option.textContent = `${count} 週期`;
    select.appendChild(option);
  }
}
