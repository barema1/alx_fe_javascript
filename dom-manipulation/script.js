
const quotes = [
  { text: "The only way to learn a new programming language is by writing programs in it.", category: "programming" },
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "First, solve the problem. Then, write the code.", category: "programming" },
  { text: "Whether you think you can, or you think you can’t—you’re right.", category: "mindset" },
  { text: "It always seems impossible until it’s done.", category: "mindset" },
];


const els = {
  quoteDisplay: document.getElementById("quoteDisplay"),
  quoteText: document.getElementById("quoteText"),
  quoteCategory: document.getElementById("quoteCategory"),
  controls: document.getElementById("controls"),
  newQuoteBtn: document.getElementById("newQuote"),
  formMount: document.getElementById("formMount"),
};

let categorySelect = null; 


function getUniqueCategories(list) {
  const set = new Set(list.map(q => q.category.trim()).filter(Boolean));
  return ["All", ...Array.from(set).sort()];
}

function getFilteredQuotes(category) {
  if (!category || category === "All") return quotes;
  return quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
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
  cats.forEach(c => {
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

 
  addBtn.addEventListener("click", function addQuote() {
    const text = inputQuote.value.trim();
    const category = inputCat.value.trim();

    if (!text || !category) {
      alert("Please fill both Quote and Category.");
      return;
    }

    quotes.push({ text, category });

    inputQuote.value = "";
    inputCat.value = "";

    createCategoryFilter();

   
    showRandomQuote();
  });
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
}


function init() {
  createCategoryFilter();
  createAddQuoteForm();
  els.newQuoteBtn.addEventListener("click", showRandomQuote);
  showRandomQuote(); // show something on load
}

document.addEventListener("DOMContentLoaded", init);
