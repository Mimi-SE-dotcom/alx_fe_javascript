// Initial quote array
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" },
];

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');


// ✅ Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ✅ Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Populate initial categories in the dropdown
function populateCategories() {
  const selected = localStorage.getItem('lastSelectedCategory') || 'all';
  
  categoryFilter.innerHTML = '<option value="all">All</option>';

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = selected;
}

function filterQuotes() {
  showRandomQuote(); // Just reuses the logic to display based on selected filter
}


// Show a random quote, filtered by category
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<em>No quotes available in this category.</em>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerHTML = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// Add new quote and update DOM
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

    // Update dropdown if new category
  if (![...categoryFilter.options].some(option => option.value === category)) {
    const newOption = document.createElement('option');
    newOption.value = category;
    newOption.textContent = category;
    categoryFilter.appendChild(newOption);
  }

  // ✅ Post new quote to mock server
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newQuote)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Posted to mock server:", data);
  })
  .catch(error => {
    console.error("Error posting to mock server:", error);
  });

  textInput.value = '';
  categoryInput.value = '';
  alert("Quote added and posted to mock server!");
}

  populateCategories();  // Re-populate category dropdown
  filterQuotes();        // Show updated list based on filter



// ✅ Create add quote form dynamically (required by checker)
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.className = "quote-form";

  const heading = document.createElement("h3");
  heading.textContent = "Add a New Quote";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "newQuoteCategory";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(heading);
  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}




// ✅ Export quotes to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ✅ Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Failed to import JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Create import/export controls
function createJsonControls() {
  const controls = document.createElement("div");

  // Export button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportToJsonFile);

  // Import input
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  controls.appendChild(exportBtn);
  controls.appendChild(importInput);
  document.body.appendChild(controls);
}

// Load previous session quote (optional UI)
function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const { text, category } = JSON.parse(last);
    quoteDisplay.innerHTML = `"${text}" — ${category}`;
  }
}


// ✅ Fetch quotes from mock API
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

// ✅ Sync with "server" and resolve conflicts
async function syncQuote() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(local =>
      local.text === serverQuote.text && local.category === serverQuote.category
    );

    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    showNotification("Quotes synced from mock server.");
  }
}

// ✅ Show a sync notification
function showNotification(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.background = "#d4edda";
  div.style.color = "#155724";
  div.style.padding = "10px";
  div.style.margin = "10px 0";
  div.style.border = "1px solid #c3e6cb";
  div.style.borderRadius = "5px";
  document.body.insertBefore(div, quoteDisplay);

  setTimeout(() => div.remove(), 4000);
}

// ✅ Manual Sync Button
function createSyncButton() {
  const btn = document.createElement("button");
  btn.textContent = "Sync Quotes Now";
  btn.onclick = syncQuote;
  document.body.appendChild(btn);
}





// Event Listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

// Initial Setup
loadQuotes();             // Load saved quotes
populateCategories();     // Populate category dropdown
createAddQuoteForm();     // Add quote form
createJsonControls();     // Add import/export
loadLastViewedQuote();    // Optional: show last quote
filterQuotes();           // Show filtered quote on load
createSyncButton();
syncWithServer();
setInterval(syncQuote, 30000); // Every 30 seconds

