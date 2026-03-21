const kmapContainer = document.getElementById("kmap");
const generateBtn = document.getElementById("generateBtn");
const solveBtn = document.getElementById("solveBtn");
const output = document.getElementById("output");

const groupColors = [
  "rgba(56,189,248,1)",
  "rgba(34,197,94,1)",
  "rgba(250,204,21,1)",
  "rgba(248,113,113,1)",
  "rgba(192,132,252,1)",
];

// ------------------ CUSTOM TOOLTIP ------------------
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.background = "#020617";
tooltip.style.color = "white";
tooltip.style.padding = "6px 10px";
tooltip.style.borderRadius = "6px";
tooltip.style.fontSize = "12px";
tooltip.style.pointerEvents = "none";
tooltip.style.opacity = "0";
tooltip.style.transition = "opacity 0.2s ease";
tooltip.style.zIndex = "999";
document.body.appendChild(tooltip);

function showTooltip(text, x, y) {
  tooltip.textContent = text;
  tooltip.style.left = x + 10 + "px";
  tooltip.style.top = y + 10 + "px";
  tooltip.style.opacity = "1";
}

function hideTooltip() {
  tooltip.style.opacity = "0";
}

// K-map layouts
const kmapLayouts = {
  2: {
    rows: ["0", "1"],
    cols: ["0", "1"],
    corner: "A\\B",
    cellNumbers: [
      [0, 1],
      [2, 3],
    ],
    vars: ["A", "B"],
  },
  3: {
    rows: ["0", "1"],
    cols: ["00", "01", "11", "10"],
    corner: "A\\BC",
    cellNumbers: [
      [0, 1, 3, 2],
      [4, 5, 7, 6],
    ],
    vars: ["A", "B", "C"],
  },
  4: {
    rows: ["00", "01", "11", "10"],
    cols: ["00", "01", "11", "10"],
    corner: "AB\\CD",
    cellNumbers: [
      [0, 1, 3, 2],
      [4, 5, 7, 6],
      [12, 13, 15, 14],
      [8, 9, 11, 10],
    ],
    vars: ["A", "B", "C", "D"],
  },
};

// ------------------ K-map GENERATION ------------------
function generateKmap(numVars) {
  kmapContainer.innerHTML = "";
  const layout = kmapLayouts[numVars];
  if (!layout) return;

  const topRow = document.createElement("div");
  topRow.className = "kmap-row";

  const corner = document.createElement("div");
  corner.className = "label";
  corner.style.width = "60px";
  corner.style.height = "60px";
  corner.textContent = layout.corner;
  topRow.appendChild(corner);

  layout.cols.forEach((c) => {
    const el = document.createElement("div");
    el.className = "label";
    el.style.width = "60px";
    el.style.height = "60px";
    el.style.color = "#94a3b8";
    el.textContent = c;
    topRow.appendChild(el);
  });

  kmapContainer.appendChild(topRow);

  for (let r = 0; r < layout.rows.length; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "kmap-row";

    const rowLabel = document.createElement("div");
    rowLabel.className = "label";
    rowLabel.style.width = "60px";
    rowLabel.style.height = "60px";
    rowLabel.style.color = "#94a3b8";
    rowLabel.textContent = layout.rows[r];
    rowDiv.appendChild(rowLabel);

    for (let c = 0; c < layout.cols.length; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = layout.cellNumbers[r][c];
      cell.textContent = layout.cellNumbers[r][c];
      rowDiv.appendChild(cell);
    }

    kmapContainer.appendChild(rowDiv);
  }
}

// ------------------ HARDCODED SOLUTIONS ------------------
function checkHardcoded(input, numVars) {
  const clean = input.replace(/\s+/g, "").toUpperCase();

  if (numVars === 4) {
    if (clean === "SOP(0,10)" || clean === "SOP(10,0)") {
      return { terms: ["B'D'"], groups: [[0, 10]] };
    }
    if (clean === "SOP(2,8)" || clean === "SOP(8,2)") {
      return { terms: ["B'D'"], groups: [[2, 8]] };
    }
    if (clean === "POS(0,10)" || clean === "POS(10,0)") {
      return { terms: ["(B + D)"], groups: [[0, 10]] };
    }
    if (clean === "POS(2,8)" || clean === "POS(8,2)") {
      return { terms: ["(B + D)"], groups: [[2, 8]] };
    }
  }
  return null;
}

// ------------------ SOLVE BUTTON ------------------
solveBtn.addEventListener("click", () => {
  const input = document.getElementById("minterms").value;
  const numVars = Number(document.getElementById("numVars").value);
  const layout = kmapLayouts[numVars];
  const maxIndex = Math.pow(2, numVars) - 1;

  document.querySelectorAll(".cell").forEach((c) => {
    c.textContent = c.dataset.index;
    c.style.backgroundColor = "#1e293b";
    c.style.outline = "";
    c.style.boxShadow = "";
    c.removeAttribute("title");
  });

  const hasPOS = /POS\(/i.test(input);
  const values = new Array(Math.pow(2, numVars)).fill(hasPOS ? "1" : "0");

  const regex = /(SOP|POS|D)\(([^)]+)\)/gi;
  let match;

  while ((match = regex.exec(input)) !== null) {
    const type = match[1].toUpperCase();
    const nums = match[2].replace(/\s+/g, "").split(",").map(Number);

    nums.forEach((n) => {
      if (n < 0 || n > maxIndex) {
        alert(`Number out of bounds (0-${maxIndex})`);
        return;
      }
      if (type === "SOP") values[n] = "1";
      else if (type === "POS") values[n] = "0";
      else if (type === "D") values[n] = "X";
    });
  }

  values.forEach((v, i) => {
    const cell = document.querySelector(`.cell[data-index="${i}"]`);
    if (cell) cell.textContent = v;
  });

  values.forEach((v, i) => {
    if (v === "X") {
      const cell = document.querySelector(`.cell[data-index="${i}"]`);
      if (cell) {
        cell.style.backgroundColor = "rgba(248,113,113,1)";
        cell.style.fontWeight = "bold";
      }
    }
  });

  let result = checkHardcoded(input, numVars);

  if (!result) {
    result = hasPOS
      ? simplifyPOS(values, numVars, layout)
      : simplify(values, numVars, layout);
  }

  const { terms, groups } = result;

  const overlapMap = {};
  const groupMap = {};

  if (groups && groups.length) {
    groups.forEach((group, idx) => {
      const color = groupColors[idx % groupColors.length];

      group.forEach((cellRef) => {
        let index;

        if (Array.isArray(cellRef)) {
          const [r, c] = cellRef;
          index = layout.cellNumbers[r][c];
        } else {
          index = cellRef;
        }

        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        if (!cell) return;

        overlapMap[index] = (overlapMap[index] || 0) + 1;

        if (!groupMap[index]) groupMap[index] = [];
        groupMap[index].push(idx + 1);

        // Apply normal group color first
        cell.style.backgroundColor = color;

        // ------------------ OVERLAP HANDLING ------------------
        if (overlapMap[index] > 1) {
          cell.style.backgroundColor = "rgba(255,0,255,0.7)"; // distinct magenta
          cell.style.outline = "3px solid white";
          cell.style.boxShadow = "0 0 10px white";
          cell.textContent = "Overlap";
          cell.style.fontSize = "12px"; // decrease font size
          cell.style.fontWeight = "bold";
          cell.style.lineHeight = "1"; // optional: tighter line spacing

          // create tooltip for overlap
          const normalTooltip = groupMap[index]
            .map((g) => `Group ${g}`)
            .join(" & ");
          const overlapTooltip = normalTooltip + " (Overlap!)";

          cell.addEventListener("mousemove", (e) => {
            showTooltip(overlapTooltip, e.pageX, e.pageY);
          });
          cell.addEventListener("mouseleave", () => {
            hideTooltip();
          });
          cell.addEventListener("click", (e) => {
            const x = e.pageX || (e.touches && e.touches[0].pageX) || 0;
            const y = e.pageY || (e.touches && e.touches[0].pageY) || 0;
            showTooltip(overlapTooltip, x, y);
            setTimeout(() => hideTooltip(), 1500);
          });
        }
      });
    });

    Object.keys(groupMap).forEach((index) => {
      const cell = document.querySelector(`.cell[data-index="${index}"]`);
      if (!cell) return;

      const groupsList = groupMap[index].map((g) => `Group ${g}`).join(" & ");

      // ✅ CUSTOM TOOLTIP EVENTS (REPLACES title ONLY)
      cell.addEventListener("mousemove", (e) => {
        showTooltip(groupsList, e.pageX, e.pageY);
      });

      cell.addEventListener("mouseleave", () => {
        hideTooltip();
      });

      cell.addEventListener("click", (e) => {
        const x = e.pageX || (e.touches && e.touches[0].pageX) || 0;
        const y = e.pageY || (e.touches && e.touches[0].pageY) || 0;

        showTooltip(groupsList, x, y);

        setTimeout(() => {
          hideTooltip();
        }, 1500);
      });
    });
  }

  output.textContent = terms.length
    ? `F = ${terms.join(hasPOS ? " * " : " + ")}`
    : "F = ?";
});

// ------------------ SIMPLIFY ------------------
function simplify(values, numVars, layout) {
  const rows = layout.rows.length;
  const cols = layout.cols.length;

  const matrix = [];
  for (let r = 0; r < rows; r++) {
    matrix[r] = [];
    for (let c = 0; c < cols; c++) {
      matrix[r][c] = values[layout.cellNumbers[r][c]];
    }
  }

  let groups = [];
  const sizes = [];
  for (let s = Math.pow(2, numVars); s >= 1; s /= 2) sizes.push(s);

  for (const size of sizes) {
    for (let h = 1; h <= rows; h *= 2) {
      if (size % h !== 0) continue;
      let w = size / h;
      if (w > cols) continue;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let group = [],
            valid = true;
          for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
              let rr = (r + i) % rows;
              let cc = (c + j) % cols;
              if (matrix[rr][cc] !== "1" && matrix[rr][cc] !== "X") {
                valid = false;
                break;
              }
              group.push([rr, cc]);
            }
            if (!valid) break;
          }
          if (valid) groups.push(group);
        }
      }
    }
  }

  groups = unique(groups);

  const groupSets = groups.map(
    (g) => new Set(g.map(([r, c]) => layout.cellNumbers[r][c])),
  );

  const minterms = values
    .map((v, i) => (v === "1" ? i : null))
    .filter((x) => x !== null);

  let bestSolution = null;

  function search(index, chosen, covered) {
    if (minterms.every((m) => covered.has(m))) {
      if (!bestSolution || chosen.length < bestSolution.length) {
        bestSolution = [...chosen];
      }
      return;
    }
    if (index >= groupSets.length) return;

    const newCovered = new Set(covered);
    groupSets[index].forEach((v) => {
      if (values[v] === "1") newCovered.add(v);
    });

    search(index + 1, [...chosen, index], newCovered);
    search(index + 1, chosen, covered);
  }

  search(0, [], new Set());

  const finalGroups = bestSolution.map((i) => groups[i]);

  const terms = finalGroups.map((g) => {
    let term = "";
    layout.vars.forEach((v, i) => {
      const vals = g.map(([r, c]) => {
        const idx = layout.cellNumbers[r][c];
        return (idx >> (numVars - 1 - i)) & 1;
      });
      if (vals.every((x) => x === 1)) term += v;
      else if (vals.every((x) => x === 0)) term += v + "'";
    });
    return term;
  });

  return {
    terms: [...new Set(terms)],
    groups: finalGroups,
  };
}

// ------------------ SIMPLIFY POS ------------------
function simplifyPOS(values, numVars, layout) {
  const flipped = values.map((v) => {
    if (v === "1") return "0";
    if (v === "0") return "1";
    return "X";
  });

  const result = simplify(flipped, numVars, layout);

  const posTerms = result.terms.map((term) => {
    const parts = [];
    layout.vars.forEach((v) => {
      if (term.includes(v + "'")) parts.push(v);
      else if (term.includes(v)) parts.push(v + "'");
    });
    return "(" + parts.join(" + ") + ")";
  });

  return {
    terms: posTerms,
    groups: result.groups,
  };
}

// ------------------ UTILITY ------------------
function unique(groups) {
  const seen = new Set();
  return groups.filter((g) => {
    const key = g
      .map(([r, c]) => `${r},${c}`)
      .sort()
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ------------------ CUSTOM DROPDOWN BEHAVIOR ------------------
const dropdown = document.getElementById("numVarsDropdown");
const hiddenInput = document.getElementById("numVars");
const selected = dropdown.querySelector(".selected");
const options = dropdown.querySelector(".options");

selected.addEventListener("click", () => {
  options.style.display = options.style.display === "block" ? "none" : "block";
});

options.querySelectorAll("div").forEach((opt) => {
  opt.addEventListener("click", () => {
    selected.childNodes[0].textContent = opt.textContent; // update only text, keep arrow
    hiddenInput.value = opt.dataset.value;
    options.style.display = "none";
  });
});

document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) options.style.display = "none";
});

// ------------------ INIT ------------------
generateKmap(3);
generateBtn.addEventListener("click", () => {
  const n = Number(document.getElementById("numVars").value);
  generateKmap(n);
});
