// Initial quote array
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" },
];

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

// Populate initial categories in the dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Show a random quote, filtered by category
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes available in this category.';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
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

// Event Listeners
newQuoteBtn.addEventListener('click', showRandomQuote);

// Initial Setup
populateCategories();