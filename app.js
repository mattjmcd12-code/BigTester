(function () {
  "use strict";

  const form = document.getElementById("expense-form");
  const tbody = document.getElementById("expense-tbody");
  const emptyRow = document.getElementById("empty-row");
  const totalAmountEl = document.getElementById("total-amount");
  const dateInput = document.getElementById("date");

  const expenses = [];

  // Default the date field to today for convenience.
  dateInput.value = new Date().toISOString().slice(0, 10);

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  function formatDate(isoDate) {
    // Parse as local date (YYYY-MM-DD) to avoid timezone shifting.
    const [year, month, day] = isoDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function renderExpense(expense) {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = expense.name;

    const categoryTd = document.createElement("td");
    categoryTd.textContent = expense.category;

    const amountTd = document.createElement("td");
    amountTd.className = "align-right";
    amountTd.textContent = currencyFormatter.format(expense.amount);

    const dateTd = document.createElement("td");
    dateTd.textContent = formatDate(expense.date);

    const descTd = document.createElement("td");
    descTd.className = "description-cell";
    if (expense.description) {
      descTd.textContent = expense.description;
    } else {
      descTd.textContent = "—";
      descTd.classList.add("empty");
    }

    const statusTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge badge--pending";
    badge.textContent = "Pending";
    statusTd.appendChild(badge);

    tr.append(nameTd, categoryTd, amountTd, dateTd, descTd, statusTd);
    return tr;
  }

  function updateTotal() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    totalAmountEl.textContent = currencyFormatter.format(total);
  }

  function addExpense(expense) {
    expenses.push(expense);

    if (emptyRow && emptyRow.parentNode) {
      emptyRow.parentNode.removeChild(emptyRow);
    }

    tbody.appendChild(renderExpense(expense));
    updateTotal();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const amount = parseFloat(formData.get("amount"));

    if (!Number.isFinite(amount) || amount < 0) {
      return;
    }

    const expense = {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || ""),
      amount: amount,
      date: String(formData.get("date") || ""),
      description: String(formData.get("description") || "").trim(),
    };

    addExpense(expense);

    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
    document.getElementById("name").focus();
  });
})();
