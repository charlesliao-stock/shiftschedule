//periodCountSelector.js

function renderPeriodCountSelector() {
  const select = document.getElementById("periodCountSelector");
  select.innerHTML = ""; // 清空舊項目

  const counts = [1, 2, 3, 4];
  counts.forEach(count => {
    const option = document.createElement("option");
    option.value = count;
    option.textContent = `${count} 週期`;
    select.appendChild(option);
  });

}
