import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Expense Tracker and Ledgers.
 */
export function init() {
  const container = document.getElementById("expenseTracker");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">💰 Expense Tracker Ledger</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Financial Metrics counters -->
      <div class="grid-12" style="margin-bottom: 1.5rem; gap: 1rem;">
        <div class="card-glass" style="grid-column: span 4; background: rgba(145, 80%, 40%, 0.08); text-align: center; padding: 1rem;">
          <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total Budget Limit</h4>
          <div id="expense-budget-lbl" style="font-size: 1.6rem; font-weight: 800; color: var(--primary); margin-top: 5px;">$1500.00</div>
        </div>
        <div class="card-glass" style="grid-column: span 4; background: rgba(355, 85%, 55%, 0.08); text-align: center; padding: 1rem;">
          <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Total Spent</h4>
          <div id="expense-spent-lbl" style="font-size: 1.6rem; font-weight: 800; color: var(--danger); margin-top: 5px;">$0.00</div>
        </div>
        <div class="card-glass" style="grid-column: span 4; background: rgba(145, 80%, 40%, 0.08); text-align: center; padding: 1rem;">
          <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Balance Remaining</h4>
          <div id="expense-balance-lbl" style="font-size: 1.6rem; font-weight: 800; color: var(--success); margin-top: 5px;">$1500.00</div>
        </div>
      </div>

      <div class="grid-12">
        <!-- Add transaction form left -->
        <div style="grid-column: span 5; display: flex; flex-direction: column; gap: 0.75rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Record Transaction</h3>
          
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.8rem; color: var(--text-muted);">Amount ($)</label>
            <input type="number" id="expense-input-amount" class="input-glass" placeholder="0.00" step="0.01" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.8rem; color: var(--text-muted);">Description</label>
            <input type="text" id="expense-input-desc" class="input-glass" placeholder="e.g. Grocery list, Workspace server subscription" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <label style="font-size: 0.8rem; color: var(--text-muted);">Category</label>
            <select id="expense-input-cat" class="input-glass">
              <option value="Food & Drinks">Food & Drinks</option>
              <option value="Utilities">Utilities & Servers</option>
              <option value="Transport">Transit & Travel</option>
              <option value="Logistics">Logistics & Tools</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <button id="expense-add-btn" class="btn-primary" style="width: 100%; margin-top: 0.5rem; font-weight: 700;">
            Add Expense Log
          </button>
        </div>

        <!-- Transactions history right -->
        <div style="grid-column: span 7; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Transaction Log History</h3>
          
          <!-- History list -->
          <div id="expense-history-deck" style="background: rgba(0, 0, 0, 0.1); border-radius: var(--border-radius-md); border: 1px solid var(--glass-border); padding: 1rem; min-height: 250px; display: flex; flex-direction: column; gap: 8px; max-height: 270px; overflow-y: auto;">
            <!-- Render lists dynamically here -->
            <p style="color: var(--text-muted); text-align: center; margin-top: 100px;">No expense entries recorded.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const amountIn = document.getElementById("expense-input-amount");
  const descIn = document.getElementById("expense-input-desc");
  const catIn = document.getElementById("expense-input-cat");
  const addBtn = document.getElementById("expense-add-btn");
  const historyContainer = document.getElementById("expense-history-deck");

  const spentLbl = document.getElementById("expense-spent-lbl");
  const balanceLbl = document.getElementById("expense-balance-lbl");
  const budgetLbl = document.getElementById("expense-budget-lbl");

  let localExpenses = [];
  const monthlyBudget = 1500;

  // Retrieve cache
  loadExpenses();

  function loadExpenses() {
    // Initial fetch fallback
    try {
      localExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    } catch(e) {}
    if (localExpenses.length === 0) {
      localExpenses = [
        { id: 1, amount: 24.50, description: "Monthly cloud proxy domain renewal", category: "Utilities", date: new Date().toISOString() },
        { id: 2, amount: 15.00, description: "Coffee meetings with developers", category: "Food & Drinks", date: new Date().toISOString() }
      ];
      localStorage.setItem("expenses", JSON.stringify(localExpenses));
    }
    renderExpenses();
  }

  function renderExpenses() {
    historyContainer.innerHTML = "";
    
    let totalSpent = 0;
    
    if (localExpenses.length === 0) {
      historyContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding-top: 100px;">No transaction entries logged</div>`;
      spentLbl.textContent = "$0.00";
      balanceLbl.textContent = `$${monthlyBudget.toFixed(2)}`;
      return;
    }

    localExpenses.forEach(exp => {
      totalSpent += exp.amount;

      const row = document.createElement("div");
      row.className = "widget-list-item anim-slide-up";
      row.style.background = "var(--glass-bg-accent)";
      row.style.padding = "0.75rem";
      row.style.borderRadius = "8px";
      row.style.border = "1px solid var(--glass-border)";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";

      row.innerHTML = `
        <div>
          <h5 style="font-size: 0.85rem; font-weight:700;">${exp.description}</h5>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${exp.category || "General"} • ${new Date(exp.date).toLocaleDateString()}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <b style="font-size: 0.95rem; color: var(--danger);">$${exp.amount.toFixed(2)}</b>
          <button class="expense-del-btn" data-id="${exp.id}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:0.75rem;">🗑️</button>
        </div>
      `;

      row.querySelector(".expense-del-btn").addEventListener("click", () => deleteExpense(exp.id));

      historyContainer.appendChild(row);
    });

    spentLbl.textContent = `$${totalSpent.toFixed(2)}`;
    balanceLbl.textContent = `$${(monthlyBudget - totalSpent).toFixed(2)}`;

    // Adjust color indicators of remaining balance based on scales
    const balance = monthlyBudget - totalSpent;
    if (balance < 200) {
      balanceLbl.style.color = "var(--danger)";
    } else if (balance < 600) {
      balanceLbl.style.color = "var(--warning)";
    } else {
      balanceLbl.style.color = "var(--success)";
    }
  }

  function deleteExpense(id) {
    if (confirm("Delete this transaction row item?")) {
      localExpenses = localExpenses.filter(e => e.id !== id);
      localStorage.setItem("expenses", JSON.stringify(localExpenses));
      renderExpenses();
      
      apiFetch("deleteExpense", { id })
        .catch(err => console.error("Expense sync error:", err));
    }
  }

  addBtn.addEventListener("click", () => {
    const amountVal = parseFloat(amountIn.value);
    const descVal = descIn.value.trim();
    const catVal = catIn.value;

    if (isNaN(amountVal) || !descVal) return;

    const mockId = Date.now();
    const newEntry = {
      id: mockId,
      amount: amountVal,
      description: descVal,
      category: catVal,
      date: new Date().toISOString(),
    };
    localExpenses.unshift(newEntry);
    localStorage.setItem("expenses", JSON.stringify(localExpenses));
    renderExpenses();

    amountIn.value = "";
    descIn.value = "";

    apiFetch("addExpense", { amount: amountVal, description: descVal, category: catVal })
      .catch(err => console.error("Apps Script expense post synchronization failure:", err));
  });
}
