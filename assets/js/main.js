// Add Pinterest Save Button dynamically to images with a specific class or inside specific wrappers
document.addEventListener('DOMContentLoaded', () => {
  const pinWrappers = document.querySelectorAll('.pin-wrapper');
  
  pinWrappers.forEach(wrapper => {
    // Check if it already has a pin button
    if (!wrapper.querySelector('.btn-pin')) {
      const pinBtn = document.createElement('a');
      pinBtn.href = '#'; // In a real site, this would use the Pinterest bookmarklet URL or share URL
      pinBtn.className = 'btn-pin';
      pinBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.983 7.436 6.953 0 4.156-2.617 7.492-6.257 7.492-1.222 0-2.368-.636-2.766-1.385s-.603 2.296-.751 2.859c-.27 1.036-1.002 2.332-1.493 3.12 1.134.341 2.333.522 3.567.522 6.621 0 11.987-5.367 11.987-11.987C24.004 5.367 18.638 0 12.017 0z"/>
        </svg>
        Save
      `;
      
      pinBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const img = wrapper.querySelector('img');
        const imgUrl = encodeURIComponent(img.src);
        const url = encodeURIComponent(window.location.href);
        const description = encodeURIComponent(img.alt || 'Beautiful home decor inspiration');
        window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${imgUrl}&description=${description}`, 'pinterestShare', 'width=800,height=600');
      });
      
      wrapper.appendChild(pinBtn);
    }
  });
});

// Product Image Hover Full View
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.createElement('div');
  overlay.id = 'full-image-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease'
  });

  const fullImage = document.createElement('img');
  Object.assign(fullImage.style, {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    transition: 'transform 0.3s ease',
    transform: 'scale(0.95)'
  });

  overlay.appendChild(fullImage);
  document.body.appendChild(overlay);

  const productImages = document.querySelectorAll('.card-image-wrap img');
  
  productImages.forEach(img => {
    img.style.cursor = 'zoom-in';
    
    img.addEventListener('mouseenter', () => {
      fullImage.src = img.src;
      overlay.style.opacity = '1';
      fullImage.style.transform = 'scale(1)';
    });
    
    img.addEventListener('mouseleave', () => {
      overlay.style.opacity = '0';
      fullImage.style.transform = 'scale(0.95)';
    });
  });
});

// ── Mobile Navigation Toggle ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.site-header');

  headers.forEach(header => {
    const navContainer = header.querySelector('.nav-container');
    const navLinks = header.querySelector('.nav-links');
    if (!navContainer || !navLinks) return;

    // Create hamburger button
    const toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    navContainer.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });
});

// ── Contact Form Feedback ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Show success message
    contactForm.innerHTML = `
      <div style="text-align:center; padding: var(--spacing-lg) var(--spacing-md);">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8A9A86" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto var(--spacing-sm);">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <h3 style="font-family: var(--font-primary); margin-bottom: var(--spacing-xs);">Message Sent!</h3>
        <p style="color: var(--text-secondary);">Thanks for reaching out. We'll get back to you within 1–2 business days.</p>
      </div>
    `;
  });
});
