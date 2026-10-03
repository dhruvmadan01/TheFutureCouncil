/**
 * MentorCompanies Component
 * Renders an infinite auto-scrolling marquee of companies where mentors & operators built.
 * Configured via a simple array { name, logo } so additions can be made without touching markup.
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MentorCompanies = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  const companies = [
    { name: 'Google', logo: '/logos/google.svg' },
    { name: 'Microsoft', logo: '/logos/microsoft.svg' },
    { name: 'Amazon', logo: '/logos/amazon.svg' },
    { name: 'Flipkart', logo: '/logos/flipkart.svg' },
    { name: 'IBM', logo: '/logos/ibm.svg' },
    { name: 'Uber', logo: '/logos/uber.svg' },
    { name: 'Zomato', logo: '/logos/zomato.svg' },
    { name: 'Swiggy', logo: '/logos/swiggy.svg' },
    { name: 'Razorpay', logo: '/logos/razorpay.svg' }
  ];

  function createItemHTML(company) {
    return `
      <div class="marquee-item">
        <img src="${company.logo}" alt="${company.name} logo" class="marquee-logo" loading="lazy" />
        <span class="marquee-name">${company.name}</span>
      </div>
    `.trim();
  }

  function render(target = 'marquee-track', list = companies) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;
    const itemsHTML = list.map(createItemHTML).join('\n        ');
    el.innerHTML = `
      <div class="marquee-group">
        ${itemsHTML}
      </div>
      <div class="marquee-group" aria-hidden="true">
        ${itemsHTML}
      </div>
    `.trim();
  }

  function init(target = 'marquee-track') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        render(target);
      });
    } else {
      render(target);
    }
  }

  return {
    companies,
    render,
    init,
    createItemHTML
  };
});

if (typeof window !== 'undefined' && window.MentorCompanies) {
  window.MentorCompanies.init();
}
