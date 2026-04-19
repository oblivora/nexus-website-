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
        ${p.description ? `<p class="card-desc">${p.description}</p>` : ''}
        ${ratingStr ? `<div class="card-rating"><span class="stars">${ratingStr}</span></div>` : ''}
        ${(pros || cons) ? `
        <div class="pros-cons-box">
          ${pros ? `<div class="pc-column pros"><h4>Pros</h4><ul>${pros}</ul></div>` : ''}
          ${cons ? `<div class="pc-column cons"><h4>Cons</h4><ul>${cons}</ul></div>` : ''}
        </div>` : ''}
        <div class="card-bottom">
          <span class="price">${p.price || ''}</span>
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
