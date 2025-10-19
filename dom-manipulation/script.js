let quotes = [];

const els = {
  quoteText: document.getElementById("quoteText"),
  quoteCategory: document.getElementById("quoteCategory"),
  lastViewed: document.getElementById("lastViewed"),
  newQuoteBtn: document.getElementById("newQuote"),
  formMount: document.getElementById("formMount"),
  exportBtn: document.getElementById("exportBtn"),
  importFile: document.getElementById("importFile"),
  categoryFilter: document.getElementById("categoryFilter"),
  quotesList: document.getElementById("quotesList"),
};

const LS_QUOTES_KEY = "quotes";
const SS_LAST_VIEWED_KEY = "lastViewedQuote";
const LS_SELECTED_CATEGORY_KEY = "selectedCategory";

function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    }
  } catch {}
  return null;
}
function saveLastViewed(q) {
  sessionStorage.setItem(SS_LAST_VIEWED_KEY, JSON.stringify(q));
  renderLastViewed();
}
function loadLastViewed() {
  try {
    const raw = sessionStorage.getItem(SS_LAST_VIEWED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveSelectedCategory(cat) {
  localStorage.setItem(LS_SELECTED_CATEGORY_KEY, cat || "All");
}
function loadSelectedCategory() {
  return localStorage.getItem(LS_SELECTED_CATEGORY_KEY) || "All";
}

function getUniqueCategories(list) {
  const set = new Set(list.map(q => q.category.trim()).filter(Boolean));
  return ["All", ...Array.from(set).sort()];
}
function getFilteredQuotes(category) {
  if (!category || category === "All") return quotes;
  return quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
}
function getRandomItem(arr) {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function populateCategories() {
  const cats = getUniqueCategories(quotes);
  const currentSaved = loadSelectedCategory();
  els.categoryFilter.innerHTML = "";
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.categoryFilter.appendChild(opt);
  });
  els.categoryFilter.value = cats.includes(currentSaved) ? currentSaved : "All";
}

function createAddQuoteForm() {
  els.formMount.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";
  const title = document.createElement("h2");
  title.textContent = "Add a New Quote";
  const row1 = document.createElement("div");
  row1.className = "row";
  const lq = document.createElement("label");
  lq.setAttribute("for", "newQuoteText"); lq.textContent = "Quote:";
  const iq = document.createElement("input");
  iq.id = "newQuoteText"; iq.type = "text"; iq.placeholder = "Enter a new quote"; iq.style.flex = "1";
  row1.appendChild(lq); row1.appendChild(iq);
  const row2 = document.createElement("div");
  row2.className = "row";
  const lc = document.createElement("label");
  lc.setAttribute("for", "newQuoteCategory"); lc.textContent = "Category:";
  const ic = document.createElement("input");
  ic.id = "newQuoteCategory"; ic.type = "text"; ic.placeholder = "Enter quote category (e.g., mindset)"; ic.style.flex = "1";
  row2.appendChild(lc); row2.appendChild(ic);
  const row3 = document.createElement("div");
  row3.className = "row";
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  row3.appendChild(addBtn);
  card.appendChild(title); card.appendChild(row1); card.appendChild(row2); card.appendChild(row3);
  els.formMount.appendChild(card);

  addBtn.addEventListener("click", function () {
    const text = iq.value.trim();
    const category = ic.value.trim();
    if (!text || !category) { alert("Please fill both Quote and Category."); return; }
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    iq.value = ""; ic.value = "";
    filterQuote();
  });
}

function renderLastViewed() {
  const last = loadLastViewed();
  els.lastViewed.textContent = last && last.text && last.category ? `Last viewed (this tab): “${last.text}” — ${last.category}` : "";
}
function renderQuotesList(category) {
  const list = getFilteredQuotes(category);
  els.quotesList.innerHTML = "";
  if (!list.length) { els.quotesList.textContent = "No quotes in this category yet."; return; }
  list.forEach(q => {
    const item = document.createElement("div");
    item.style.marginBottom = ".5rem";
    item.innerHTML = `“${q.text}” — <em>${q.category}</em>`;
    els.quotesList.appendChild(item);
  });
}
function showRandomQuoteFromCategory(category) {
  const pool = getFilteredQuotes(category);
  const pick = getRandomItem(pool);
  if (!pick) { els.quoteText.textContent = "No quotes found for this category yet."; els.quoteCategory.textContent = ""; return; }
  els.quoteText.textContent = `“${pick.text}”`;
  els.quoteCategory.textContent = `Category: ${pick.category}`;
  saveLastViewed(pick);
}

function filterQuote() {
  const currentCat = els.categoryFilter.value || "All";
  saveSelectedCategory(currentCat);
  renderQuotesList(currentCat);
  showRandomQuoteFromCategory(currentCat);
}
window.filterQuote = filterQuote;

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "quotes.json";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) { alert("Invalid file: JSON must be an array of {text, category}."); return; }
      const valid = imported.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (!valid.length) { alert("No valid quotes found in file."); return; }
      quotes.push(...valid);
      saveQuotes();
      populateCategories();
      filterQuote();
      alert(`Quotes imported successfully! (${valid.length} added)`);
      els.importFile.value = "";
    } catch { alert("Failed to read JSON. Please check the file."); }
  };
  reader.readAsText(file);
}
window.importFromJsonFile = importFromJsonFile;

function seedDefaultsIfNeeded() {
  if (quotes.length) return;
  quotes = [
    { text: "The only way to learn a new programming language is by writing programs in it.", category: "programming" },
    { text: "Simplicity is the soul of efficiency.", category: "productivity" },
    { text: "First, solve the problem. Then, write the code.", category: "programming" },
    { text: "Whether you think you can, or you think you can’t—you’re right.", category: "mindset" },
    { text: "It always seems impossible until it’s done.", category: "mindset" }
  ];
  saveQuotes();
}

function init() {
  const stored = loadQuotes();
  quotes = stored && stored.length ? stored : [];
  seedDefaultsIfNeeded();
  createAddQuoteForm();
  populateCategories();
  els.newQuoteBtn.addEventListener("click", () => {
    const cat = els.categoryFilter.value || "All";
    showRandomQuoteFromCategory(cat);
  });
  els.exportBtn.addEventListener("click", exportToJsonFile);
  els.importFile.addEventListener("change", importFromJsonFile);
  els.categoryFilter.value = loadSelectedCategory();
  filterQuote();
  renderLastViewed();
}

document.addEventListener("DOMContentLoaded", init);
