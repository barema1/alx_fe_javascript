
let quotes = [];

const els = {
  quoteText: document.getElementById("quoteText"),
  quoteCategory: document.getElementById("quoteCategory"),
  lastViewed: document.getElementById("lastViewed"),
  controls: document.getElementById("controls"),
  newQuoteBtn: document.getElementById("newQuote"),
  formMount: document.getElementById("formMount"),
  exportBtn: document.getElementById("exportBtn"),
  importFile: document.getElementById("importFile"),
};

let categorySelect = null; 

const LS_QUOTES_KEY = "quotes";
const SS_LAST_VIEWED_KEY = "lastViewedQuote"; 

function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (q) => q && typeof q.text === "string" && typeof q.category === "string"
      );
    }
  } catch {
  }
  return null;
}

function saveLastViewed(quoteObj) {
  sessionStorage.setItem(SS_LAST_VIEWED_KEY, JSON.stringify(quoteObj));
  renderLastViewed();
}

function loadLastViewed() {
  const raw = sessionStorage.getItem(SS_LAST_VIEWED_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getUniqueCategories(list) {
  const set = new Set(list.map((q) => q.category.trim()).filter(Boolean));
  return ["All", ...Array.from(set).sort()];
}

function getFilteredQuotes(category) {
  if (!category || category === "All") return quotes;
  return quotes.filter(
    (q) => q.category.toLowerCase() === category.toLowerCase()
  );
}

function getRandomItem(arr) {
  if (arr.length === 0) return null;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function createCategoryFilter() {
  if (categorySelect && categorySelect.parentElement) {
    categorySelect.parentElement.removeChild(categorySelect);
  }
  categorySelect = document.createElement("select");
  categorySelect.id = "categoryFilter";
  categorySelect.setAttribute("aria-label", "Filter by category");

  const cats = getUniqueCategories(quotes);
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  });

  els.controls.insertBefore(categorySelect, els.newQuoteBtn);
  categorySelect.addEventListener("change", () => showRandomQuote());
}

function createAddQuoteForm() {
  els.formMount.innerHTML = "";

  const formCard = document.createElement("div");
  formCard.className = "card";

  const title = document.createElement("h2");
  title.textContent = "Add a New Quote";
  formCard.appendChild(title);

  const row1 = document.createElement("div");
  row1.className = "row";
  const labelQuote = document.createElement("label");
  labelQuote.setAttribute("for", "newQuoteText");
  labelQuote.textContent = "Quote:";
  const inputQuote = document.createElement("input");
  inputQuote.id = "newQuoteText";
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";
  inputQuote.style.flex = "1";
  row1.appendChild(labelQuote);
  row1.appendChild(inputQuote);

  const row2 = document.createElement("div");
  row2.className = "row";
  const labelCat = document.createElement("label");
  labelCat.setAttribute("for", "newQuoteCategory");
  labelCat.textContent = "Category:";
  const inputCat = document.createElement("input");
  inputCat.id = "newQuoteCategory";
  inputCat.type = "text";
  inputCat.placeholder = "Enter quote category (e.g., mindset)";
  inputCat.style.flex = "1";
  row2.appendChild(labelCat);
  row2.appendChild(inputCat);

  const row3 = document.createElement("div");
  row3.className = "row";
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  row3.appendChild(addBtn);

  formCard.appendChild(row1);
  formCard.appendChild(row2);
  formCard.appendChild(row3);
  els.formMount.appendChild(formCard);

  addBtn.addEventListener("click", function () {
    const text = inputQuote.value.trim();
    const category = inputCat.value.trim();

    if (!text || !category) {
      alert("Please fill both Quote and Category.");
      return;
    }

    quotes.push({ text, category });
    saveQuotes();           
    createCategoryFilter(); 
    inputQuote.value = "";
    inputCat.value = "";
    showRandomQuote();
  });
}

function renderLastViewed() {
  const last = loadLastViewed();
  if (last && last.text && last.category) {
    els.lastViewed.textContent = `Last viewed (this tab): “${last.text}” — ${last.category}`;
  } else {
    els.lastViewed.textContent = "";
  }
}

function showRandomQuote() {
  const chosenCat = categorySelect ? categorySelect.value : "All";
  const pool = getFilteredQuotes(chosenCat);
  const pick = getRandomItem(pool);

  if (!pick) {
    els.quoteText.textContent = "No quotes found for this category yet.";
    els.quoteCategory.textContent = "";
    return;
  }

  els.quoteText.textContent = `“${pick.text}”`;
  els.quoteCategory.textContent = `Category: ${pick.category}`;

  saveLastViewed(pick);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json"; 
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid file: JSON must be an array of {text, category}.");
        return;
      }

      const valid = imported.filter(
        (q) => q && typeof q.text === "string" && typeof q.category === "string"
      );

      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...valid);

      saveQuotes();
      createCategoryFilter();
      showRandomQuote();

      alert(`Quotes imported successfully! (${valid.length} added)`);
      els.importFile.value = "";
    } catch (err) {
      alert("Failed to read JSON. Please check the file.");
    }
  };

  reader.readAsText(file);
}

function seedDefaultsIfNeeded() {
  if (quotes.length > 0) return;
  quotes = [
    { text: "The only way to learn a new programming language is by writing programs in it.", category: "programming" },
    { text: "Simplicity is the soul of efficiency.", category: "productivity" },
    { text: "First, solve the problem. Then, write the code.", category: "programming" },
    { text: "Whether you think you can, or you think you can’t—you’re right.", category: "mindset" },
    { text: "It always seems impossible until it’s done.", category: "mindset" },
  ];
  saveQuotes();
}

function init() {
  const stored = loadQuotes();
  quotes = stored && stored.length ? stored : [];
  seedDefaultsIfNeeded();

  createCategoryFilter();
  createAddQuoteForm();

  els.newQuoteBtn.addEventListener("click", showRandomQuote);
  els.exportBtn.addEventListener("click", exportToJsonFile);
  els.importFile.addEventListener("change", importFromJsonFile);

  showRandomQuote();
  renderLastViewed();
}

document.addEventListener("DOMContentLoaded", init);
