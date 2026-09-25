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
  <meta name="theme-color" content="#1B1712" />

  <!-- Fonts & Design Tokens -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="/tfc-theme.css" />

  <!-- Analytics -->
  <script src="/mixpanel.min.js"></script>
  <script src="/tfc-analytics.js"></script>

  <style>
    .ch-hero {
      padding-block: clamp(48px, 8vw, 96px) clamp(36px, 6vw, 64px);
      background: var(--ink);
      color: var(--warm);
      border-bottom: 1px solid #332B24;
    }
    .ch-layout {
      padding-block: clamp(48px, 8vw, 96px);
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: clamp(32px, 5vw, 64px);
    }
    @media (max-width: 860px) {
      .ch-layout { grid-template-columns: 1fr; }
    }
    .lead-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 20px;
      padding: 28px;
      display: flex;
      gap: 18px;
      align-items: center;
      margin-top: 24px;
    }
    .lead-card-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--warm-2);
      border: 2px dashed #E3B79C;
      overflow: hidden;
      flex-shrink: 0;
    }
    .lead-card-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .event-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      margin-top: 14px;
    }
  </style>
</head>
<body>

  <!-- NAVIGATION -->
  <nav class="nav night-mode" id="nav">
    <div class="wrap">
      <a class="brand" href="/" aria-label="The Future Council Homepage" style="color:var(--warm);">
        <img src="/TFC.png" alt="The Future Council Logo" class="brand-logo" />
        <span>The Future Council</span>
      </a>
      <ul class="nav-links">
        <li><a href="/chapters" class="active">Chapters</a></li>
        <li><a href="/school">Startup School</a></li>
        <li><a href="/launchpad">Launchpad</a></li>
        <li><a href="/why">Why Build</a></li>
        <li><a href="/stories">Stories</a></li>
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
    <a href="/school">Startup School <span>→</span></a>
    <a href="/launchpad">Launchpad <span>→</span></a>
    <a href="/why">Why Build <span>→</span></a>
    <a href="/stories">Stories <span>→</span></a>
    <div style="margin-top: 20px;">
      <a class="btn solid lg" href="/join?chapter=${ch.id}" style="width: 100%; text-align: center;">Join ${ch.name}</a>
    </div>
  </div>

  <main>
    <header class="ch-hero">
      <div class="wrap">
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 14px;">
          <span class="mono" style="color: #F5A07F;">${ch.location}</span>
          <span style="color: #6A5C4F;">•</span>
          <span style="font-family: var(--mono); font-size: 11px; background: #2E7D32; color: #fff; padding: 2px 8px; border-radius: 999px;">${ch.status}</span>
        </div>
        <h1 style="font-size: clamp(34px, 5.5vw, 68px);">${ch.name}</h1>
        <p class="lede" style="font-size: clamp(17px, 1.5vw, 20px); color: #CDBFB2; max-width: 52ch; margin-top: 14px; line-height: 1.5;">
          ${ch.desc}
        </p>

        <div style="margin-top: 28px; display: flex; gap: 14px; flex-wrap: wrap;">
          <a class="btn solid lg" href="/join?chapter=${ch.id}">Join this chapter, free →</a>
          <a class="btn lg" href="/chapters" style="color: var(--warm);">← Back to all chapters</a>
        </div>
      </div>
    </header>

    <div class="wrap ch-layout">
      <!-- MAIN INFO -->
      <div>
        <span class="mono kick">On-Campus Activities</span>
        <h2 style="font-size: clamp(26px, 3.5vw, 40px); margin-top: 8px;">What happens at ${ch.name}.</h2>
        
        <div style="display: grid; gap: 16px; margin-top: 24px;">
          <div style="background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px;">
            <strong style="font-size: 17px; display: block;">Monthly Campus Build Night</strong>
            <p style="color: var(--ink-soft); font-size: 14.5px; margin-top: 4px;">
              Regular evening sprints on campus where students bring projects, code together, and exchange direct user feedback.
            </p>
          </div>
          <div style="background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px;">
            <strong style="font-size: 17px; display: block;">Co-Founder &amp; Skill Matching</strong>
            <p style="color: var(--ink-soft); font-size: 14.5px; margin-top: 4px;">
              Looking for a technical co-founder or someone to handle business development? The chapter connects students across departments.
            </p>
          </div>
          <div style="background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 20px;">
            <strong style="font-size: 17px; display: block;">Startup School Study Circles</strong>
            <p style="color: var(--ink-soft); font-size: 14.5px; margin-top: 4px;">
              Work through the 9 practical modules together, practice mock pitches, and review each other's deliverables.
            </p>
          </div>
        </div>

        <h3 style="font-size: 22px; margin-top: 40px;">Recent &amp; Upcoming Events</h3>
        <div class="event-card">
          <div>
            <strong style="display: block; font-size: 16px;">${ch.lastEvent || 'Campus Build Night'}</strong>
            <span style="font-size: 13px; color: var(--ink-soft);">In-Person Meetup · Campus Common Area</span>
          </div>
          <span style="font-family: var(--mono); font-size: 12px; color: var(--forest); font-weight: 600;">Completed</span>
        </div>
        <div class="event-card">
          <div>
            <strong style="display: block; font-size: 16px;">Semester Prototype Showcase</strong>
            <span style="font-size: 13px; color: var(--ink-soft);">Demo day with peers and visiting operators</span>
          </div>
          <span style="font-family: var(--mono); font-size: 12px; color: var(--orange-deep); font-weight: 600;">Upcoming</span>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div>
        <span class="mono kick">Chapter Leadership</span>
        <div class="lead-card">
          <div class="lead-card-avatar">
            <img src="/${ch.photo || 'TFC.png'}" alt="${ch.leadName}" onerror="this.src='/TFC.png'" />
          </div>
          <div>
            <strong style="display: block; font-size: 17px;">${ch.leadName}</strong>
            <span style="color: var(--ink-soft); font-size: 13px;">${ch.leadRole}</span>
            <div style="font-size: 12px; color: var(--forest); margin-top: 6px; font-weight: 600;">● Active on Campus</div>
          </div>
        </div>

        <div class="receipt" style="margin-top: 24px;">
          <h3>Chapter Membership Perks</h3>
          <ul>
            <li><span>Access to campus build nights</span><span>✓ Free</span></li>
            <li><span>7 Days Startup School access</span><span>✓ Free</span></li>
            <li><span>Co-founder matchmaking</span><span>✓ Included</span></li>
            <li><span>Priority Launchpad referral</span><span>✓ Included</span></li>
          </ul>
          <div class="tot">
            <span>Membership Cost</span>
            <span>₹0 Free</span>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <a class="btn solid lg" href="/join?chapter=${ch.id}" style="width: 100%; text-align: center;">Join ${ch.name} →</a>
        </div>
      </div>
    </div>
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
            A student startup ecosystem in India giving every builder the community, skills, and capital access to build while in college.
          </p>
        </div>
        <div class="footer-col">
          <h4>Ecosystem</h4>
          <ul>
            <li><a href="/chapters">Campus Chapters</a></li>
            <li><a href="/school">Startup School</a></li>
            <li><a href="/launchpad">Launchpad Fellowship</a></li>
            <li><a href="/why">Why Build</a></li>
            <li><a href="/stories">Stories</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="/chapters/start">Become a Chapter Lead</a></li>
            <li><a href="/school/library">Resource Library</a></li>
            <li><a href="/about/partners">Partners</a></li>
            <li><a href="/about#hire">Hire Builders</a></li>
            <li><a href="/join">Join Free</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Council &amp; Legal</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/terms.html">Terms of Service</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/refund.html">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-line">
        <strong>Where student builders stop waiting for permission.</strong>
        <span>© 2026 The Future Council · thefuturecouncil.in</span>
      </div>
    </div>
  </footer>

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
  fs.writeFileSync(path.join(__dirname, `branch-${ch.id}.html`), redirectStub, 'utf8');
});

console.log(`Successfully generated ${chapters.length} chapter pages in both branch-*.html and chapters/*.html`);
