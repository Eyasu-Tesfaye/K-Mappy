# K-Map Solver

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **dynamic Karnaugh Map (K-map) solver** built with **HTML, CSS, and JavaScript**. This tool allows users to input SOP (Sum of Products), POS (Product of Sums), and Don't Care terms, automatically generates the K-map, visually groups adjacent 1s or 0s, and computes the simplified Boolean expressions. The UI is responsive and works on desktop, tablet, and mobile screens.

---

## Features

- **Dynamic K-map generation** for 2, 3, and 4 variables
- Input terms using **SOP(), POS(), D()** notation
- **Automatic highlighting**:
  - SOP → blue
  - POS → red
  - Don't Care → yellow (or purple for lone X)
- **Textbook-style labels** on rows and columns for all variable counts
- **Visual grouping** of adjacent cells (horizontal, vertical, and edge wrapping)
- **Simplified Boolean expression output**
- **Responsive design** for mobile and tablet devices
- **Hardcoded common K-map solutions** for edge cases

---

## Demo

![K-map Screenshot](screenshot.png)

_Screenshot of the solver in action showing SOP and POS highlighting and simplified output._

---

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- No additional installations required

### Usage

2. Open `index.html` in your browser.

3. Select the number of variables (2–4).

4. Enter your terms in the input field using the following format:

   **SOP Example:**

   ```text
   SOP(1,3,4) D(6,7)
   ```

   **POS Example:**

   ```text
   POS(0,4,3,7)
   ```

   **Don't Care Example:**

   ```text
   D(2,5)
   ```

5. Click Solve to visualize the K-map and see the simplified Boolean expression.

6. Click Generate to reset or change the number of variables.

# Folder Structure

```text
kmap-solver/
├── index.html       # Main HTML file
├── style.css        # CSS styling
├── script.js        # K-map logic and interactions
├── README.md        # This README file
└── screenshot.png   # Optional screenshot of the app
```

# Built With

- **HTML5** – Semantic markup for structure
- **CSS3** – Responsive and modern styling
- **JavaScript (ES6)** – Interactive K-map logic
