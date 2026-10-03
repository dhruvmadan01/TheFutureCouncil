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
    { name: 'Google', logo: '/public/logos/google.svg' },
    { name: 'Microsoft', logo: '/public/logos/microsoft.svg' },
    { name: 'Amazon', logo: '/public/logos/amazon.svg' },
    { name: 'Flipkart', logo: '/public/logos/flipkart.svg' },
    { name: 'IBM', logo: '/public/logos/ibm.svg' },
    { name: 'Uber', logo: '/public/logos/uber.svg' },
    { name: 'Zomato', logo: '/public/logos/zomato.svg' },
    { name: 'Swiggy', logo: '/public/logos/swiggy.svg' },
    { name: 'Razorpay', logo: '/public/logos/razorpay.svg' }
  ];

  function createItemHTML(company) {
    return `
      <div class="marquee-item">
        <img src="${company.logo}" alt="${company.name} logo" class="marquee-logo" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried='true';if(this.src.indexOf('/public/logos/')!==-1){this.src=this.src.replace('/public/logos/','/logos/');}else if(this.src.indexOf('/logos/')!==-1){this.src=this.src.replace('/logos/','/public/logos/');}}" />
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
