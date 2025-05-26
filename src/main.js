import "./style.css";

const container = document.getElementById("listings-container");
const shortlistedIds = new Set(JSON.parse(localStorage.getItem('shortlisted') || '[]'));
let allListings = [];
let filterShortlisted = JSON.parse(localStorage.getItem('filterShortlisted') || 'false');

// Dynamic API endpoint configuration
const API_BASE = 'https://emptycup-backend-mt0w.onrender.com';
const API_URL = `${API_BASE}/api/listings`;

// Fetch listings with error handling
async function fetchListings() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    container.innerHTML = `
      <div class="p-6 text-center text-red-500">
        Failed to load listings. Please refresh or try again later.
        ${error.message}
      </div>
    `;
    return [];
  }
}

// Initialize the app
async function init() {
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.4s ease';
  
  allListings = await fetchListings();
  
  if (allListings.length > 0) {
    renderAllListings();
    if (filterShortlisted) {
      applyShortlistedFilter();
      updateTabAppearance();
    }
    
    setTimeout(() => {
      container.style.opacity = '1';
    }, 50);
  }
}

// Render all listings
function renderAllListings() {
  container.innerHTML = "";
  allListings.forEach((listing, index) => renderListing(listing, index));
}

// Render individual listing
function renderListing(listing, index) {
  const isShortlisted = shortlistedIds.has(listing.id);
  const bgColor = index % 2 === 0 ? "#FFFCF2" : "#FFFFFF";

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(`<img src="/icons/fullstar1.png" class="w-5 h-5 inline-block" />`);
    }
    
    if (hasHalfStar) {
      stars.push(`<img src="/icons/Halfstar.png" class="w-5 h-5 inline-block" />`);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(`<img src="/icons/emptystar.png" class="w-5 h-5 inline-block" />`);
    }
    
    return stars.join('');
  };

  const card = document.createElement("div");
  card.className = "flex items-start w-full py-6 listing-card";
  card.style.backgroundColor = bgColor;
  card.dataset.id = listing.id;

  card.innerHTML = `
    <!-- Left Section -->
    <div class="flex-1 px-6 space-y-3">
      <h2 class="text-2xl font-bold text-[#1C1C1C]">${listing.name}</h2>
      <div class="flex items-center space-x-1">
        ${renderStars(listing.rating)}
      </div>
      <p class="text-sm text-[#000000]">
        ${listing.description}
      </p>

      <!-- Increased spacing here -->
      <div class="flex gap-10 pt-6 font-semibold text-xs text-[#1C1C1C] mb-2">
        <div class="text-center">
          <div class="text-3xl">${listing.projects}</div>
          <div class="text-[#000000]">Projects</div>
        </div>
        <div class="text-center">
          <div class="text-3xl">${listing.years}</div>
          <div class="text-[#000000] ">Years</div>
        </div>
        <div class="text-center">
          <div class="text-3xl">${listing.price}</div>
          <div class="text-[#000000]">Price</div>
        </div>
      </div>

      <!-- Increased spacing here -->
      <div class="pt-4 text-[18px] font-medium text-[#1C1C1C] space-y-1">
        ${listing.phones.map((p) => `<div>${p}</div>`).join("")}
      </div>
    </div>

    <!-- Divider -->
    <div class="w-[1px] h-64 bg-[#D0D0D0] mx-6 my-3"></div>

    <!-- Right Action Section -->
    <div class="flex items-center pr-6 mt-4">
      <div class="flex flex-col items-center justify-center text-[#8D4F2F] text-xs space-y-8">
        <button class="flex flex-col items-center hover:text-black transition-colors">
          <img src="/icons/details.svg" class="w-5 h-5" />
          <span>Details</span>
        </button>
        <button class="flex flex-col items-center hover:text-black transition-colors">
          <img src="/icons/hide.svg" class="w-5 h-5" />
          <span>Hide</span>
        </button>
        <button class="shortlist-btn flex flex-col items-center hover:text-orange-600 transition-colors" data-id="${listing.id}">
          <img src="/icons/${isShortlisted ? "shortlistedList" : "shortlistedbutton"}.svg" class="w-5 h-5" />
          <span class="${isShortlisted ? 'text-orange-600 font-semibold' : ''}">Shortlist</span>
        </button>
        <button class="flex flex-col items-center hover:text-black transition-colors">
          <img src="/icons/report.svg" class="w-5 h-5" />
          <span>Report</span>
        </button>
      </div>
    </div>
  `;

  const shortlistBtn = card.querySelector(".shortlist-btn");
  shortlistBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = listing.id;
    if (shortlistedIds.has(id)) {
      shortlistedIds.delete(id);
    } else {
      shortlistedIds.add(id);
    }
    localStorage.setItem('shortlisted', JSON.stringify([...shortlistedIds]));
    renderAllListings();
    if (filterShortlisted) applyShortlistedFilter();
  });

  container.appendChild(card);
}

// Update tab appearance
function updateTabAppearance() {
  const tab = document.getElementById("tab-shortlisted");
  const icon = tab.querySelector("img");
  
  tab.classList.toggle("text-orange-600", filterShortlisted);
  tab.classList.toggle("font-semibold", filterShortlisted);
  icon.src = filterShortlisted 
    ? "/icons/shortlisted-active.svg" 
    : "/icons/shortlisted.svg";
}

// Tab click handler
document.getElementById("tab-shortlisted").addEventListener("click", () => {
  filterShortlisted = !filterShortlisted;
  localStorage.setItem('filterShortlisted', JSON.stringify(filterShortlisted));
  
  container.style.opacity = '0.9';
  container.style.transition = 'opacity 0.3s ease';
  
  setTimeout(() => {
    applyShortlistedFilter();
    updateTabAppearance();
    container.style.opacity = '1';
  }, 150);
});

// Apply filter to listings
function applyShortlistedFilter() {
  const cards = document.querySelectorAll(".listing-card");
  cards.forEach((card) => {
    const id = parseInt(card.dataset.id);
    card.style.display = filterShortlisted && !shortlistedIds.has(id) ? "none" : "flex";
  });
}

init();