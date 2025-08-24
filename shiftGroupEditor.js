//shiftGroupEditor.js

(function () {
  const fixedShiftFields = ["OFF", "WW", "小夜", "大夜"];
  const defaultShiftGroups = {
    OFF: ["FF", "WW", "VV", "SS"],
    WW: ["WW", "4W", "8W", "12W", "DLW", "5GW"],
    小夜: ["4", "4N", "4N1"],
    大夜: ["12", "12W"]
  };

  function loadShiftGroups() {
    try {
      const raw = localStorage.getItem("shiftGroups");
      const parsed = raw ? JSON.parse(raw) : structuredClone(defaultShiftGroups);
      fixedShiftFields.forEach(field => {
        if (!parsed[field]) parsed[field] = structuredClone(defaultShiftGroups[field]);
      });
      return parsed;
    } catch {
      return structuredClone(defaultShiftGroups);
    }
  }

  function saveShiftGroupsToLocal(groups) {
    localStorage.setItem("shiftGroups", JSON.stringify(groups));
  }

  function renderShiftGroupEditor() {
    const groups = loadShiftGroups();
    const container = document.getElementById("shiftGroupEditor");
    if (!container) {
      console.warn("⚠️ shiftGroupEditor 容器不存在");
      return;
    }
    container.innerHTML = "";

    fixedShiftFields.forEach(field => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "group-block";

      const label = document.createElement("div");
      label.textContent = `欄位名稱：${field}`;
      label.style.fontWeight = "bold";
      label.style.marginBottom = "6px";

      const codeList = document.createElement("ul");
      codeList.className = "code-list";

      groups[field].forEach(code => {
        const li = document.createElement("li");
        li.innerHTML = `
          <input type="text" value="${code}" class="code-input" />
          <button onclick="ShiftGroupEditor.removeCode(this)">🗑️</button>
        `;
        codeList.appendChild(li);
      });

      const addCodeBtn = document.createElement("button");
      addCodeBtn.textContent = "➕ 新增代號";
      addCodeBtn.onclick = () => {
        const li = document.createElement("li");
        li.innerHTML = `
          <input type="text" value="" class="code-input" />
          <button onclick="ShiftGroupEditor.removeCode(this)">🗑️</button>
        `;
        codeList.appendChild(li);
      };

      groupDiv.appendChild(label);
      groupDiv.appendChild(codeList);
      groupDiv.appendChild(addCodeBtn);
      container.appendChild(groupDiv);
    });
  }

  function removeCode(btn) {
    const li = btn.parentElement;
    const ul = li.parentElement;
    if (ul.querySelectorAll("li").length > 1) {
      ul.removeChild(li);
    } else {
      alert("每項至少保留一個代號！");
    }
  }

  function saveShiftGroups() {
    const groupBlocks = document.querySelectorAll(".group-block");
    const newGroups = {};
    let hasDuplicate = false;
    let duplicateMessages = [];

    groupBlocks.forEach((block, index) => {
      const field = fixedShiftFields[index];
      const codes = Array.from(block.querySelectorAll(".code-input"))
        .map(input => input.value.trim())
        .filter(Boolean);

      if (codes.length === 0) {
        alert(`欄位「${field}」至少要有一個代號！`);
        return;
      }

      const duplicates = codes.filter((code, i, arr) => arr.indexOf(code) !== i);
      if (duplicates.length > 0) {
        hasDuplicate = true;
        duplicateMessages.push(`欄位「${field}」有重複代號：${[...new Set(duplicates)].join(", ")}`);
      }

      newGroups[field] = codes;
    });

    if (hasDuplicate) {
      alert(`❗ 發現重複代號，請修正後再儲存：\n\n${duplicateMessages.join("\n")}`);
      return;
    }

    saveShiftGroupsToLocal(newGroups);
    alert("✅ 班別設定已儲存！");
    const panel = document.getElementById("customShiftSetting");
    if (panel) panel.style.display = "none";
  }

  function toggleSettingPanel() {
    const panel = document.getElementById("customShiftSetting");
    if (!panel) {
      console.warn("⚠️ customShiftSetting 元件不存在");
      return;
    }
    panel.style.display = panel.style.display === "none" ? "block" : "none";
    renderShiftGroupEditor();
  }

  // ✅ 掛到全域，供其他模組使用
  window.loadShiftGroups = loadShiftGroups;

  window.ShiftGroupEditor = {
    loadShiftGroups,
    saveShiftGroupsToLocal,
    renderShiftGroupEditor,
    removeCode,
    saveShiftGroups,
    toggleSettingPanel
  };
})();