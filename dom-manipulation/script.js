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

  populateCategories();  // Re-populate category dropdown
  filterQuotes();        // Show updated list based on filter

  textInput.value = '';
  categoryInput.value = '';
  alert("Quote added successfully!");
}

  // Add new category to dropdown if it doesn't exist
  if (![...categoryFilter.options].some(option => option.value === category)) {
    const newOption = document.createElement('option');
    newOption.value = category;
    newOption.textContent = category;
    categoryFilter.appendChild(newOption);
  }

  textInput.value = '';
  categoryInput.value = '';
  alert("Quote added successfully!");
}
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

//add new function
function filterQuotes() {
  const selectedCategory = categoryFilter.value;

  // Save selected category in local storage
  localStorage.setItem('lastSelectedCategory', selectedCategory);

  // Filter quotes
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<em>No quotes available in this category.</em>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `"${selectedQuote.text}" — ${selectedQuote.category}`;
}

async function fetchQuotesFromServer() {
  // Simulate a server response
  return new Promise((resolve) => {
    setTimeout(() => {
      const serverQuotes = [
        { text: "Success is not in what you have, but who you are.", category: "Motivation" },
        { text: "Happiness depends upon ourselves.", category: "Happiness" },
      ];
      resolve(serverQuotes);
    }, 1000); // Simulate 1s server delay
  });
}

async function postQuotesToServer(quotes) {
  console.log("Syncing quotes to server:", quotes);
  // Simulate a server sync with delay
  return new Promise(resolve => setTimeout(resolve, 1000));
}

async function syncWithServer() {
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
    showNotification("Quotes synced from server.");
  }
}


setInterval(syncWithServer, 30000); // Sync every 30 seconds

function showNotification(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.style.display = "block";

  setTimeout(() => {
    note.style.display = "none";
  }, 4000);
}




syncWithServer();              // Sync on first load
setInterval(syncWithServer, 30000); // Then every 30 secs


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
