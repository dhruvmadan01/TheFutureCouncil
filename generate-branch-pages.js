const fs = require('fs');
const path = require('path');

const chapters = JSON.parse(fs.readFileSync(path.join(__dirname, 'chapters-data.json'), 'utf8'));

function generateChapterHtml(ch) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ch.name} · Campus Chapter | The Future Council</title>
  <meta name="description" content="Official student startup chapter at ${ch.name} (${ch.location}) by The Future Council. Join build nights, co-founder matching, and Demo Days." />
  <link rel="canonical" href="https://thefuturecouncil.in/chapters/${ch.id}" />
  <link rel="icon" href="/TFC.png" type="image/png" />
  <link rel="apple-touch-icon" href="/TFC.png" />
  <meta name="theme-color" content="#0B0B0B" />

  <!-- Fonts & Design Tokens -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&family=DM+Sans:opsz,wght@9..40,500;9..40,700&family=Instrument+Serif:ital@1&display=swap">
  <link rel="stylesheet" href="/tfc-theme.css" />
  <link rel="stylesheet" href="/tfc-premium.css" />

  <!-- Analytics -->
  <script src="/mixpanel.min.js"></script>
  <script src="/tfc-analytics.js"></script>

</head>
<body>

  <!-- NAVIGATION -->
  <nav class="nav office-mode" id="nav">
    <div class="wrap">
      <a class="brand" href="/" aria-label="The Future Council Homepage">
        <img src="/TFC.png" alt="The Future Council Logo" class="brand-logo" />
        <span>The Future Council</span>
      </a>
      <ul class="nav-links">
        <li><a href="/chapters" class="active">Chapters</a></li>
        <li><a href="/launchpad">Launchpad</a></li>
        <li class="nav-extra"><a href="/investors">Investors</a></li>
        <li class="nav-extra"><a href="/mentors">Mentors</a></li>
        <li><a href="/why">Why Build</a></li>
        <li><a href="/about">About TFC</a></li>
      </ul>
      <div class="nav-actions">
        <a class="btn solid sm" href="/join?chapter=${ch.id}">Join Chapter</a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle Navigation Menu">☰</button>
      </div>
    </div>
  </nav>

  <!-- MOBILE MENU -->
  <div class="mobile-menu" id="mobileMenu">
    <a href="/chapters" class="active">All Chapters <span>→</span></a>
    <a href="/launchpad">Launchpad <span>→</span></a>
    <a href="/why">Why Build <span>→</span></a>
    <a href="/about">About TFC <span>→</span></a>
    <div style="margin-top: 20px;">
      <a class="btn solid lg" href="/join?chapter=${ch.id}" style="width: 100%; text-align: center;">Join ${ch.name}</a>
    </div>
  </div>

  <main>
    <section class="pv-page-hero">
      <div class="pv-wrap">
        <p class="pv-label pv-muted" style="margin-bottom: 28px">${ch.region} &middot; ${ch.city} &middot; TFC Chapter</p>
        <h1 class="pv-display">${ch.name}</h1>
        <p class="pv-lede">Join the TFC Chapter at ${ch.name}. Find co-founders on your campus, build real products and get a direct path to the Launchpad Fellowship. Free to join.</p>
        <div class="pv-actions"><a class="pv-btn" href="/join?chapter=${ch.id}">Join this Chapter, free</a><a class="pv-btn pv-btn-ghost" href="/chapters">All Chapters</a></div>
      </div>
    </section>
    <section class="pv-section pv-ink-band">
      <div class="pv-wrap">
        <div class="pv-section-head"><h2 class="pv-display">What a Chapter does</h2><p>Monthly build nights, co-founder matching and build sprints, run by students on your campus.</p></div>
        <div class="pv-rows">
          <div class="pv-row"><h3>Monthly build night</h3><p>Evening sprints where students bring projects, build together and trade direct user feedback.</p></div>
          <div class="pv-row"><h3>Co-founder matching</h3><p>Looking for a technical co-founder or someone for business? The Chapter connects students across departments.</p></div>
          <div class="pv-row"><h3>Build and pitch sprints</h3><p>Co-working sprints to iterate on your MVP, practise pitches and get candid feedback before demo day.</p></div>
        </div>
      </div>
    </section>
    <section class="pv-section pv-sun-band">
      <div class="pv-wrap pv-lp-grid">
        <div>
          <p class="pv-label" style="margin-bottom: 24px">Membership</p>
          <h2 class="pv-display">Free to <span class="pv-accent">join.</span></h2>
          ${ch.leadName ? '<p style="max-width:48ch;margin:24px 0 0">Chapter lead: <b>' + ch.leadName + '</b>' + (ch.leadRole ? ', ' + ch.leadRole : '') + '.</p>' : ''}
          <div class="pv-actions"><a class="pv-btn" href="/join?chapter=${ch.id}">Join ${ch.name}</a></div>
        </div>
        <ul class="pv-table">
          <li><span>Membership cost</span><b>&#8377;0</b></li>
          <li><span>Campus build nights</span><b>Included</b></li>
          <li><span>Co-founder matching</span><b>Included</b></li>
          <li><span>Launchpad Fellowship</span><b>Open to anyone</b></li>
        </ul>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="tfc-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-col">
          <a class="brand" href="/" style="color:var(--warm); margin-bottom:14px; display:inline-flex;">
            <img src="/TFC.png" alt="The Future Council Logo" class="brand-logo" />
            <span>The Future Council</span>
          </a>
          <p style="font-size:14px; line-height:1.6; color:#9A8B7C; max-width:32ch; margin-bottom:18px;">
            India's student startup accelerator backing collegiate founders with campus chapters, operator mentorship, and Demo Day investment access.
          </p>
          <div style="font-size:13px; color:#CDBFB2;">
            Admissions &amp; questions:<br>
            <a href="mailto:support@thefuturecouncil.in" style="color:var(--warm); font-weight:600;">support@thefuturecouncil.in</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Accelerator</h4>
          <ul>
            <li><a href="/launchpad">Launchpad</a></li>
            <li><a href="/chapters">Campus Chapters</a></li>
            <li><a href="/why">Why Build</a></li>
            <li><a href="/about">About TFC</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="/chapters/start">Become a Chapter Lead</a></li>
            <li><a href="/resources">Resource Library</a></li>
            <li><a href="/about/partners">Partners</a></li>
            <li><a href="/about#hire">Hire Builders</a></li>
            <li><a href="/join">Join Free</a></li>
            <li><a href="https://www.ftbhustle.com/" target="_blank" rel="noopener">Career partner: FTB ↗</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Council &amp; Legal</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/refund">Refund Policy</a></li>
            <li><a href="https://www.instagram.com/thefuturecouncil.in/" target="_blank" rel="noopener">Instagram ↗</a></li>
            <li><a href="https://www.linkedin.com/company/thefuturecouncil/" target="_blank" rel="noopener">LinkedIn ↗</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-line">
        <strong>TFC Innovations Pvt. Ltd. (CIN U62011DC2026PTC475213), 205 GF, Indra Vihar, Near Mukherjee Nagar, G.T.B. Nagar, North West Delhi, Delhi – 110009</strong>
        <span>© 2026 TFC Innovations Pvt. Ltd. · The Future Council</span>
      </div>
    </div>
  </footer>

  <script src="/tfc-config.js"></script>
  <script src="/tfc-shared.js"></script>
</body>
</html>
`;
}

// Generate files for each chapter
if (!fs.existsSync(path.join(__dirname, 'chapters'))) {
  fs.mkdirSync(path.join(__dirname, 'chapters'), { recursive: true });
}

chapters.forEach(ch => {
  const fullHtml = generateChapterHtml(ch);
  // Write full page to chapters/<id>.html (canonical new route)
  fs.writeFileSync(path.join(__dirname, 'chapters', `${ch.id}.html`), fullHtml, 'utf8');

  // Write 301 redirect stub to branch-<id>.html (old URL compatibility)
  const redirectStub = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${ch.name} · Campus Chapter | The Future Council</title>
  <meta http-equiv="refresh" content="0; url=/chapters/${ch.id}">
  <link rel="canonical" href="https://thefuturecouncil.in/chapters/${ch.id}">
  <script>window.location.replace('/chapters/${ch.id}' + window.location.search + window.location.hash);</script>
</head>
<body style="font-family: system-ui, sans-serif; padding: 40px; text-align: center;">
  <p>Redirecting to <a href="/chapters/${ch.id}" style="color: #E2542A; font-weight: 600;">${ch.name} Chapter</a>...</p>
</body>
</html>
`;
  if (fs.existsSync(path.join(__dirname, `branch-${ch.id}.html`))) fs.writeFileSync(path.join(__dirname, `branch-${ch.id}.html`), redirectStub, 'utf8');
});

console.log(`Successfully generated ${chapters.length} chapter pages in both branch-*.html and chapters/*.html`);
