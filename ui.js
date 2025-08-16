//ui.js

(function () {
  window.showRowSelector = function (data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("⚠️ 無效或空的資料陣列");
      alert("匯入資料無效，請重新確認！");
      return;
    }

    const modal = document.createElement("div");
    modal.className = "modal";

    const table = document.createElement("table");
    table.className = "previewTable";

    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // 顯示前兩列作為預覽
    data.slice(0, 2).forEach((row, i) => {
      const tr = document.createElement("tr");
      const tdLabel = document.createElement("td");
      tdLabel.textContent = `第 ${i + 1} 列`;
      tr.appendChild(tdLabel);

      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });

      thead.appendChild(tr);
    });

    // 後續列加入勾選框
    data.slice(2).forEach((row, i) => {
      const tr = document.createElement("tr");
      const tdCheckbox = document.createElement("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.dataset.index = i + 2;
      tdCheckbox.appendChild(checkbox);
      tr.appendChild(tdCheckbox);

      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    modal.appendChild(table);

    // ✅ 確認按鈕
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "確認匯入";
    confirmBtn.onclick = () => {
      const selectedRows = Array.from(
        modal.querySelectorAll("input[type=checkbox]:checked")
      ).map(cb => data[parseInt(cb.dataset.index)]);

      if (selectedRows.length === 0) {
        alert("請至少勾選一列！");
        return;
      }

      // 從 index.html 讀取起始日與週期數
      const startDateInput = document.getElementById("periodStartSelector");
      const periodCountInput = document.getElementById("periodCountSelector");
      const monthSelector = document.getElementById("monthSelector");

      const startDateStr = startDateInput?.value;
      const periodCount = parseInt(periodCountInput?.value || "1", 10);
      const monthStr = monthSelector?.value || "";

      if (!startDateStr || isNaN(Date.parse(startDateStr))) {
        alert("請先在頁面上選擇有效的檢查起始日！");
        return;
      }

      const startDate = new Date(startDateStr);

      window.scheduleState = {
        rawRows: selectedRows,
        startDate,
        periodCount,
        monthStr,
        selectedRows
      };

      if (typeof window.renderScheduleTable === "function") {
        try {
          window.renderScheduleTable();
        } catch (err) {
          console.error("⚠️ renderScheduleTable 執行錯誤：", err);
          alert("匯入失敗，請檢查 renderScheduleTable 是否正確載入！");
        }
      } else {
        alert("⚠️ renderScheduleTable 尚未正確載入！");
      }

      document.body.removeChild(modal);
    };

    // ❌ 取消按鈕
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消";
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
    };

    modal.appendChild(confirmBtn);
    modal.appendChild(cancelBtn);

    document.body.appendChild(modal);
  };
})();
