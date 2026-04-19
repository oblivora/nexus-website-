// Agorynx Website — Supabase Products Client
// Uses the public anon key (read-only). Never put the secret key here.

const SUPABASE_URL = 'https://fwrkehjdrjzstpsexque.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OhzgV_lHITousKI3R7yn6Q_qM81TxW_';

// ── Stars helper ───────────────────────────────────────────
function renderStars(rating) {
  if (!rating) return '';
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// ── Build one product card ─────────────────────────────────
function buildProductCard(p) {
  const ratingStr = p.rating ? `${renderStars(p.rating)} (${p.review_count ? p.review_count.toLocaleString() : '—'} reviews)` : '';
  const btnLabel = p.affiliate_platform ? `Buy on ${p.affiliate_platform}` : 'Check Price';
  const btnHref = p.affiliate_url || '#';
  
  // Format price to always include Rupee symbol if it doesn't have one
  let priceStr = '';
  if (p.price) {
    priceStr = String(p.price);
    if (!priceStr.includes('₹')) {
      priceStr = '₹' + priceStr.trim();
    }
  }

  return `
    <article class="product-card">
      <div class="card-image-wrap">
        <span class="category-badge">${p.badge || p.category || ''}</span>
        ${p.image_url
          ? `<img src="${p.image_url}" alt="${p.title}" loading="lazy">`
          : `<div class="card-img-placeholder">🛋️</div>`}
      </div>
      <div class="card-content">
        <h3 class="card-title">${p.title}</h3>
        ${p.description ? `<p class="card-desc" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.description}</p>` : ''}
        ${ratingStr ? `<div class="card-rating"><span class="stars">${ratingStr}</span></div>` : ''}
        
        <a href="product-review.html?id=${p.id}" class="view-review-link" style="font-size:0.9rem; color:#666; text-decoration:underline; margin-bottom:1rem; display:inline-block;">View review &rsaquo;</a>
        
        <div class="card-bottom">
          <span class="price">${priceStr}</span>
          <a href="${btnHref}" target="_blank" rel="noopener noreferrer" class="btn-cta">${btnLabel}</a>
        </div>
      </div>
    </article>`;
}

let currentProducts = [];
let currentGridId = '';

function renderProducts(products, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (!products || !products.length) {
    grid.innerHTML = '<p style="text-align:center;color:#999;padding:3rem;">No products found.</p>';
    return;
  }

  grid.innerHTML = products.map(buildProductCard).join('');
}

// ── Main loader — call this from each review page ──────────
// gridId   : id of the <main> or grid element to fill
// category : string or null/'' to load all
async function loadProductsIntoGrid(gridId, category) {
  currentGridId = gridId;
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = '<p style="text-align:center;color:#999;padding:3rem;">Loading products…</p>';

  try {
    // Use fetch directly against Supabase REST API (no SDK needed on website)
    let url = `${SUPABASE_URL}/rest/v1/products?select=*&order=is_featured.desc,created_at.desc`;
    if (category) {
      url += `&category=eq.${encodeURIComponent(category)}`;
    }

    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    currentProducts = await res.json();

    renderProducts(currentProducts, gridId);
  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = '<p style="text-align:center;color:#c00;padding:3rem;">Could not load products. Please try again later.</p>';
  }
}

// ── Search functionality ───────────────────────────────────
function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  if (!query) {
    renderProducts(currentProducts, currentGridId);
    return;
  }

  const filtered = currentProducts.filter(p => {
    const titleMatch = p.title && p.title.toLowerCase().includes(query);
    const descMatch = p.description && p.description.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  renderProducts(filtered, currentGridId);
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('productSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
});

// ── Single Product Loader ──────────────────────────────────
async function loadSingleProduct(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    container.innerHTML = '<p style="text-align:center;padding:5rem;color:#c00;">Product not found.</p>';
    return;
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<p style="text-align:center;padding:5rem;color:#c00;">Product not found.</p>';
      return;
    }

    const p = data[0];
    const pros = (p.pros || []).map(x => `<li>✓ ${x}</li>`).join('');
    const cons = (p.cons || []).map(x => `<li>✗ ${x}</li>`).join('');
    const ratingStr = p.rating ? `${renderStars(p.rating)} (${p.review_count ? p.review_count.toLocaleString() : '—'} reviews)` : '';
    const btnLabel = p.affiliate_platform ? `Buy on ${p.affiliate_platform}` : 'Check Price';
    const btnHref = p.affiliate_url || '#';
    
    let priceStr = '';
    if (p.price) {
      priceStr = String(p.price);
      if (!priceStr.includes('₹')) priceStr = '₹' + priceStr.trim();
    }

    container.innerHTML = `
      <div class="single-product-container">
        <div>
          <a href="javascript:history.back()" class="back-btn">&larr; Back to reviews</a>
          <div class="single-image-wrap">
            ${p.image_url ? `<img src="${p.image_url}" alt="${p.title}">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:4rem;background:#eee;">🛋️</div>`}
          </div>
        </div>
        <div class="single-details">
          <span class="category-badge" style="position:static;display:inline-block;margin-bottom:1rem;">${p.badge || p.category || ''}</span>
          <h1>${p.title}</h1>
          ${ratingStr ? `<div class="single-rating"><span class="stars" style="color:#fbbf24;letter-spacing:2px;">${ratingStr}</span></div>` : ''}
          <div class="single-price">${priceStr}</div>
          <div class="single-desc">${p.description || ''}</div>
          
          ${(pros || cons) ? `
          <div class="pros-cons-box" style="margin-bottom:2rem;background:#f9f9f9;padding:1.5rem;border-radius:12px;border:1px solid #eee;display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
            ${pros ? `<div class="pros"><h4 style="color:#2e7d32;margin-top:0;">Pros</h4><ul style="list-style:none;padding:0;">${pros}</ul></div>` : ''}
            ${cons ? `<div class="cons"><h4 style="color:#c62828;margin-top:0;">Cons</h4><ul style="list-style:none;padding:0;">${cons}</ul></div>` : ''}
          </div>` : ''}
          
          <a href="${btnHref}" target="_blank" rel="noopener noreferrer" class="single-btn-cta">${btnLabel}</a>
        </div>
      </div>
    `;
    
    // Update document title dynamically
    document.title = `${p.title} Review | Agorynx`;

  } catch (err) {
    console.error('Failed to load product:', err);
    container.innerHTML = '<p style="text-align:center;padding:5rem;color:#c00;">Could not load the review. Please try again later.</p>';
  }
}
