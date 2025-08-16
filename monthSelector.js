//monthSelector.js
//monthSelector.js

function renderMonthSelector() {
  const select = document.getElementById("monthSelector");
  select.innerHTML = "";

  const noOption = document.createElement("option");
  noOption.value = "";
  noOption.textContent = "不指定";
  select.appendChild(noOption);

  const today = new Date();
  for (let i = -1; i <= 2; i++) {
    const future = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const value = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${future.getFullYear()} 年 ${future.getMonth() + 1} 月`;
    select.appendChild(option);
  }

  select.value = "";

  select.addEventListener("change", () => {
    document.getElementById("checkboxMonthly").checked = true;
  });
}
