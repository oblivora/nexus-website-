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
  const pros = (p.pros || []).map(x => `<li>✓ ${x}</li>`).join('');
  const cons = (p.cons || []).map(x => `<li>✗ ${x}</li>`).join('');
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

  const isReviewPage = window.location.pathname.includes('/reviews/');
  const displayProsCons = isReviewPage ? 'block' : 'none';
  const displayPreviewDesc = isReviewPage ? 'none' : '-webkit-box';
  const displayFullDesc = isReviewPage ? 'block' : 'none';
  const displayToggleBtn = isReviewPage ? 'none' : 'inline-block';

  return `
    <article class="product-card" id="card-${p.id}">
      <div class="card-image-wrap">
        <span class="category-badge">${p.badge || p.category || ''}</span>
        ${p.image_url
          ? `<img src="${p.image_url}" alt="${p.title}" loading="lazy">`
          : `<div class="card-img-placeholder">🛋️</div>`}
      </div>
      <div class="card-content">
        <h3 class="card-title">${p.title}</h3>
        ${p.description ? `<p class="card-desc preview-desc" style="display:${displayPreviewDesc};-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.description}</p>` : ''}
        ${p.description ? `<p class="card-desc full-desc" style="display:${displayFullDesc};">${p.description}</p>` : ''}
        ${ratingStr ? `<div class="card-rating"><span class="stars">${ratingStr}</span></div>` : ''}
        
        ${(pros || cons) ? `
        <div class="pros-cons-box" style="display:${displayProsCons}; margin-top:1rem; margin-bottom:1rem; background:#f9f9f9; padding:1rem; border-radius:8px;">
          ${pros ? `<div class="pros"><h4 style="color:#2e7d32;margin-top:0;margin-bottom:0.5rem;">Pros</h4><ul style="list-style:none;padding:0;margin:0;font-size:0.9rem;">${pros}</ul></div>` : ''}
          ${cons ? `<div class="cons" style="margin-top:1rem;"><h4 style="color:#c62828;margin-top:0;margin-bottom:0.5rem;">Cons</h4><ul style="list-style:none;padding:0;margin:0;font-size:0.9rem;">${cons}</ul></div>` : ''}
        </div>` : ''}
        
        <button onclick="toggleReview('${p.id}')" class="view-review-toggle" style="background:none; border:none; padding:0; font-size:0.9rem; color:#666; text-decoration:underline; margin-bottom:1rem; display:${displayToggleBtn}; cursor:pointer; text-align:left; font-family:inherit;">View review &rsaquo;</button>
        
        <div class="card-bottom" style="margin-top:auto;">
          <span class="price">${priceStr}</span>
          <a href="${btnHref}" target="_blank" rel="noopener noreferrer" class="btn-cta">${btnLabel}</a>
        </div>
      </div>
    </article>`;
}

// ── Toggle Review ──────────────────────────────────────────
window.toggleReview = function(id) {
  const card = document.getElementById(`card-${id}`);
  if (!card) return;

  const prosCons = card.querySelector('.pros-cons-box');
  const previewDesc = card.querySelector('.preview-desc');
  const fullDesc = card.querySelector('.full-desc');
  const toggleBtn = card.querySelector('.view-review-toggle');

  const isExpanded = prosCons && prosCons.style.display === 'block';

  // Toggle state
  if (isExpanded || (!prosCons && fullDesc && fullDesc.style.display === 'block')) {
    if (prosCons) prosCons.style.display = 'none';
    if (previewDesc) previewDesc.style.display = '-webkit-box';
    if (fullDesc) fullDesc.style.display = 'none';
    toggleBtn.innerHTML = 'View review &rsaquo;';
  } else {
    if (prosCons) prosCons.style.display = 'block';
    if (previewDesc) previewDesc.style.display = 'none';
    if (fullDesc) fullDesc.style.display = 'block';
    toggleBtn.innerHTML = 'Hide review &lsaquo;';
  }
};

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
