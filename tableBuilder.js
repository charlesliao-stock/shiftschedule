//tableBuilder.js

window.TableBuilder = {
  renderTableBlock(title, periodRows, dates, resultKeys, checkData, columnOffset, mode) {
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.textContent = title;
    table.appendChild(caption);

    const headRow = document.createElement("tr");
    headRow.innerHTML = "<th>職編</th><th>姓名</th><th>備註</th>";
    dates.forEach(d => {
      const th = document.createElement("th");
      th.textContent = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
      headRow.appendChild(th);
    });
    resultKeys.forEach(k => {
      const th = document.createElement("th");
      th.textContent = k;
      th.className = "checkResultCol";
      headRow.appendChild(th);
    });
    table.appendChild(headRow);

    const dateRow = document.createElement("tr");
    dateRow.innerHTML = "<td></td><td></td><td></td>";
    dates.forEach(d => {
      const td = document.createElement("td");
      td.textContent = `${d.getMonth() + 1}/${d.getDate()}`;
      dateRow.appendChild(td);
    });
    resultKeys.forEach(() => {
      const td = document.createElement("td");
      td.className = "checkResultCol";
      td.textContent = "";
      dateRow.appendChild(td);
    });
    table.appendChild(dateRow);

    periodRows.forEach((data, idx) => {
      const tr = document.createElement("tr");

      for (let i = 0; i < 3; i++) {
        const td = document.createElement("td");
        td.textContent = data[i] ?? "";
        tr.appendChild(td);
      }

      for (let i = 0; i < dates.length; i++) {
        const td = document.createElement("td");
        td.textContent = data[3 + i] ?? "";
        td.setAttribute("contenteditable", "true");
        td.setAttribute("data-index", columnOffset + i);
        td.setAttribute("data-row-index", idx);
        td.setAttribute("data-date", DateUtils.formatDate(dates[i])); // ✅ 新增

        if (!td.textContent.trim()) {
          td.classList.add("emptyCell");
          td.title = "尚無資料";
        }

        if (dates[i].getDay() === 0 || dates[i].getDay() === 6) {
          td.classList.add("weekend");
        }

        td.addEventListener("input", () => {
          CellSync.syncAndRecheckCell(td, dates, resultKeys, mode, columnOffset);
          td.classList.add("updatedCell");
          td.title = "已更新 ✅";
          clearTimeout(td._updateTimer);
          td._updateTimer = setTimeout(() => {
            td.classList.remove("updatedCell");
            td.title = td.textContent.trim() ? "" : "尚無資料";
          }, 1500);
        });

        td.addEventListener("keydown", (e) => {
          const allCells = Array.from(table.querySelectorAll("td[contenteditable='true']"));
          const currentIndex = allCells.indexOf(td);

          if (e.key === "Tab") {
            e.preventDefault();
            const next = e.shiftKey ? allCells[currentIndex - 1] : allCells[currentIndex + 1];
            if (next) CellSync.focusAndSelect(next);
          }

          if (e.key === "Enter") {
            e.preventDefault();
            const colIndex = td.cellIndex;
            const row = td.parentElement.rowIndex;
            const nextRow = table.rows[row + 1];
            if (nextRow) {
              const target = nextRow.cells[colIndex];
              if (target?.isContentEditable) CellSync.focusAndSelect(target);
            }
          }
        });

        tr.appendChild(td);
      }

      const result = checkData[idx] || {};
      resultKeys.forEach(k => {
        const td = document.createElement("td");
        const value = result[k] ?? "-";
        td.textContent = value;
        td.className = "checkResultCol";
        td.title = result[k + "_hover"] ?? "";
        td.setAttribute("data-key", k);
        StyleUtils.applyAlertStyle(td, k, value, {
          isMonthly: mode === "monthly",
          monthDates: dates
        });
        tr.appendChild(td);
      });

      table.appendChild(tr);
    });

    const targetContainer = mode === "flexible"
      ? document.getElementById("weeklyTableContainer")
      : document.getElementById("monthlyTableContainer");

    targetContainer.appendChild(table);
  }
};