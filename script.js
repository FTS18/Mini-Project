// NewsAPI.org API Key - supports CORS, direct browser calls allowed
const API_KEY = "ce5d72f4a1cb4d5586f187b651480642"; // Your NewsAPI key
const BASE_URL = "https://newsapi.org/v2/everything";

// DOM Elements
const locationDisplay = document.getElementById('location-display');
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryButtons = document.querySelectorAll('.category-btn');

let userLocationQuery = "world";
let currentCategory = "top";

// 1) Detect Location
async function detectLocation() {
    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        locationDisplay.textContent = `📍 ${data.city}, ${data.country}`;

        // Map any city to a valid topic for news
        const country = data.country.toLowerCase();
        if (country.includes("india")) userLocationQuery = "india";
        else if (country.includes("united states")) userLocationQuery = "us";
        else userLocationQuery = "world";

    } catch {
        locationDisplay.textContent = "📍 Using Global News";
        userLocationQuery = "world";
    }
}

// 2) Fetch News
async function fetchAndRenderNews(query, category) {
    newsContainer.innerHTML = `<p class="loading-text">Fetching news...</p>`;

    let finalQuery = (category === "top") ? query : category;

    const apiUrl = `${BASE_URL}?q=${encodeURIComponent(finalQuery)}&language=en&pageSize=12&sortBy=publishedAt&apiKey=${API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            // Fallback to world news
            if (finalQuery !== "world") return fetchAndRenderNews("world", "top");
            newsContainer.innerHTML = `<p class="loading-text">No news found.</p>`;
            return;
        }

        renderNews(data.articles);

    } catch (error) {
        newsContainer.innerHTML = `<p class="loading-text">⚠️ Failed to fetch news.</p>`;
    }
}

// 3) Render UI Cards
function renderNews(articles) {
    newsContainer.innerHTML = "";

    articles.forEach((article, index) => {
        const card = document.createElement("div");
        card.className = "news-card";
        card.style.transitionDelay = `${index * 0.08}s`;

        card.innerHTML = `
            <img class="news-card-image" src="${article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}"
                 onerror="this.src='https://via.placeholder.com/400x200?text=No+Image';"
                 alt="News image">
            <div class="news-card-content">
                <span class="news-source">${article.source.name}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || "No description available."}</p>
                <a href="${article.url}" target="_blank" class="read-more-btn">Read More</a>
            </div>
        `;
        newsContainer.appendChild(card);

        setTimeout(() => card.classList.add("loaded"), 10);
    });
}

// 4) Search
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        fetchAndRenderNews(query, "search");
    }
});
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchButton.click();
});

// 5) Category Filtering
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        currentCategory = button.dataset.category;
        const query = (currentCategory === "top") ? userLocationQuery : currentCategory;
        searchInput.value = "";
        fetchAndRenderNews(query, currentCategory);
    });
});

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await detectLocation();
    fetchAndRenderNews(userLocationQuery, currentCategory);
});
