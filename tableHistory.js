//tableHistory.js

window.TableHistory = {
  toggleHistoryPanel() {
    const panel = document.getElementById("historyPanel");
    if (!panel) return;

    if (panel.style.display === "none" || panel.style.display === "") {
      this.showHistoryPanel();
      panel.style.display = "block";
    } else {
      panel.style.display = "none";
    }
  },

  showHistoryPanel() {
    const tbody = document.getElementById("historyTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const cells = document.querySelectorAll("td.modifiedCell[contenteditable='true']");
    cells.forEach((td, index) => {
      const name = td.getAttribute("data-name") || td.parentElement.children[1]?.textContent || "未知";
      const date = td.getAttribute("data-date") || "未設定";
      const original = td._originalValue ?? "(空)";
      const current = td.textContent;
      const cellId = `cell-${index}-${date}`;
      td.setAttribute("data-cell-id", cellId);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" data-cell-id="${cellId}" /></td>
        <td>${name}</td>
        <td>${date}</td>
        <td>${original}</td>
        <td>${current}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  restoreSelected() {
    const checkboxes = document.querySelectorAll("#historyTableBody input[type='checkbox']:checked");
    if (!checkboxes.length) {
      alert("⚠️ 尚未勾選任何異動項目");
      return;
    }

    checkboxes.forEach(cb => {
      const cellId = cb.getAttribute("data-cell-id");
      const td = document.querySelector(`td.modifiedCell[contenteditable='true'][data-cell-id="${cellId}"]`);
      if (td) {
        td.textContent = td._originalValue ?? "";
        td.classList.remove("modifiedCell");
        td.classList.add("revertedCell");
        td.title = "已復原 ↩️";
        setTimeout(() => td.classList.remove("revertedCell"), 1500);
      }
    });

    alert("✅ 已復原勾選項目");
    document.getElementById("historyPanel").style.display = "none";
  }
};
