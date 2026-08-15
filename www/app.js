/**
 * ==========================================================================
 * THE FUTURE COUNCIL (TFC) - APP CORE ENGINE
 * Neo-Brutalist Student Founder Ecosystem Platform (Mobile & PWA Ready)
 * Real-time Notifications, Activity Signal Engine & Database Sync
 * ==========================================================================
 */

// Initialize Supabase Client
const supabaseUrl = 'https://fwwbybbjvchrhozzzigp.supabase.co';
const supabaseKey = 'sb_publishable_f5qK_eS6qXGm5I7Em59aPQ_HvEH45h5';
let supabaseClient = null;

try {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
  }
} catch (err) {
  console.warn('Supabase client fallback to local database:', err);
}

// Global App State & Database
const TFC_APP = {
  activeView: 'auth',
  soundEnabled: true,
  currentPersona: {
    name: 'Dhruv Madan',
    email: 'dhruv@thefuturecouncil.in',
    college: 'Faculty of Technology, DU',
    tier: 'Founder & Council Core',
    id: 'TFC-2026-0001',
    role: 'Founder / Tech Lead',
    avatar: 'dhruv.jpeg',
    skills: ['Fullstack', 'System Architecture', 'Product', 'AI Agents'],
    bio: 'Building the biggest student-run startup ecosystem at Delhi University.',
    lookingFor: 'Ambitious student founders, corporate partners & tech leads',
    linkedIn: 'https://linkedin.com/in/dhruv-madan-tfc',
    phone: '+91 93150 95214'
  },
  
  // Audio Synth Engine
  audioCtx: null,

  // Real-time Notification Engine State
  notifications: [
    {
      id: 'notif-1',
      type: 'vault',
      title: '⚡ AWS Cloud Credits Live',
      body: 'Claim up to $5,000 USD in AWS cloud credits inside Founder Vault.',
      time: 'Just now',
      unread: true,
      targetView: 'vault',
      timestamp: Date.now() - 60000
    },
    {
      id: 'notif-2',
      type: 'mixer',
      title: '🎟️ North Campus Mixer Confirmed',
      body: 'Aug 22 @ Hudson Lane • 14 spots left. Reserve admission pass.',
      time: '12m ago',
      unread: true,
      targetView: 'events',
      timestamp: Date.now() - 720000
    },
    {
      id: 'notif-3',
      type: 'radar',
      title: '🤝 Co-Founder Match Signal',
      body: 'Aarav Sharma (Hansraj • AI Engineer) listed new project for tech co-founders.',
      time: '45m ago',
      unread: true,
      targetView: 'radar',
      timestamp: Date.now() - 2700000
    }
  ],

  // Background Periodic Campus Signals Queue (Every now & then)
  periodicSignalsQueue: [
    {
      type: 'radar',
      title: '🚀 New Co-Founder Active',
      body: 'Priya Verma (SSCBS • FinTech) is looking for a Next.js / Flutter engineer.',
      targetView: 'radar'
    },
    {
      type: 'mixer',
      title: '🎟️ Mixer RSVP Surge',
      body: 'Only 4 spots remaining for the North Campus Founder Coffee!',
      targetView: 'events'
    },
    {
      type: 'vault',
      title: '💰 New Vault Micro-Grant',
      body: 'DST NIDHI-EIR fellowship applications are now open for student prototypes.',
      targetView: 'vault'
    },
    {
      type: 'signal',
      title: '📢 Campus Dispatch',
      body: 'Faculty of Tech team won 1st place in Inter-University Hackathon!',
      targetView: 'feed'
    },
    {
      type: 'vault',
      title: '⚡ OpenAI API Credits',
      body: 'New batch of $2,500 OpenAI API credits unlocked in Founder Vault.',
      targetView: 'vault'
    },
    {
      type: 'radar',
      title: '🤝 Founder Match Alert',
      body: '3 student builders from SRCC & Hindu are seeking technical CTOs.',
      targetView: 'radar'
    }
  ],

  // Initial Seed Data for Talent Radar
  talents: [
    {
      id: 'tal-1',
      name: 'Aryaveer Chauhan',
      avatar: 'aryaveer.jpeg',
      college: 'SGTB Khalsa College • Delhi University',
      role: 'Growth / Venture Lead',
      roleCategory: 'growth',
      tier: 'Co-Founder',
      skills: ['Operations', 'Growth Strategy', 'Fundraising', 'Ecosystem'],
      bio: 'Leading strategic partnerships and cross-campus venture acceleration at Delhi University.',
      lookingFor: 'Technical co-founders for AI & campus FinTech venture',
      contact: 'aryaveer@thefuturecouncil.in',
      phone: '+91 93102 59143'
    },
    {
      id: 'tal-2',
      name: 'Kartik Goel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      college: 'SSCBS • Delhi University',
      role: 'Product & Financial Analyst',
      roleCategory: 'product',
      tier: 'Student Founder',
      skills: ['Financial Modeling', 'Market Sizing', 'Pitch Decks', 'FinTech'],
      bio: '3rd-year BBS student building a neo-banking layer for Indian college student clubs and societies.',
      lookingFor: 'Full-stack Next.js / Flutter engineer to ship MVP in 4 weeks',
      contact: 'student@thefuturecouncil.in',
      phone: '+91 98765 43210'
    },
    {
      id: 'tal-3',
      name: 'Brahmleen Kaur',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      college: 'TFC Core Team • Delhi University',
      role: 'Marketing Head',
      roleCategory: 'growth',
      tier: 'Marketing Head',
      skills: ['Viral Marketing', 'Campus Distribution', 'Copywriting', 'Brand Design'],
      bio: 'Scaling TFC brand reach across 90+ DU colleges. Passionate about community-led growth and D2C.',
      lookingFor: 'Video editors, motion designers & student campus leads',
      contact: 'brahmleen1314@gmail.com',
      phone: '+91 99887 76655'
    },
    {
      id: 'tal-4',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      college: 'Hansraj College • Delhi University',
      role: 'Full-Stack AI Engineer',
      roleCategory: 'tech',
      tier: 'Active Builder',
      skills: ['PyTorch', 'FastAPI', 'React', 'LangChain', 'Vector DBs'],
      bio: 'CS student working on autonomous research agents for students. 2x Hackathon Winner.',
      lookingFor: 'Co-founder with business / sales chops to handle B2B outreach',
      contact: 'aarav.hansraj@gmail.com',
      phone: '+91 98111 22334'
    },
    {
      id: 'tal-5',
      name: 'Rhea Sen',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      college: 'Lady Shri Ram College (LSR) • DU',
      role: 'Product Designer (UI/UX)',
      roleCategory: 'design',
      tier: 'Design Fellow',
      skills: ['Figma', 'Design Systems', 'Micro-interactions', 'User Research'],
      bio: 'Creating delightful, conversion-obsessed consumer interfaces. Ex-intern at a YC-backed startup.',
      lookingFor: 'Ambitious SaaS or Consumer App teams preparing for Seed round',
      contact: 'rhea.lsr@gmail.com',
      phone: '+91 97123 45678'
    },
    {
      id: 'tal-6',
      name: 'Rohan Mehra',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      college: 'SRCC • Delhi University',
      role: 'B2B GTM & Sales Lead',
      roleCategory: 'growth',
      tier: 'Student Founder',
      skills: ['Cold Outreach', 'B2B SaaS', 'Sponsorship Deals', 'Pitching'],
      bio: 'Scaled student-run merchandise company to ₹8L GMV in 6 months. Currently looking for next venture.',
      lookingFor: 'Tech co-founder building workflow automation tools',
      contact: 'rohan.srcc@gmail.com',
      phone: '+91 99999 11223'
    }
  ],

  // Events & Mixers Data
  events: [
    {
      id: 'ev-1',
      title: 'North Campus Founder & Builder Mixer',
      category: 'IRL MIXER',
      date: 'Aug 22, 2026 • 5:00 PM IST',
      location: 'Hudson Lane, GTB Nagar (North Campus)',
      spotsTotal: 40,
      spotsClaimed: 26,
      badge: '🔥 ALMOST FULL',
      badgeColor: 'orange',
      desc: 'Exclusive offline coffee mixer for active student founders, CTOs, and creators across North Campus colleges. Pass includes filter coffee + founder intro circle.',
      agenda: ['5:00 PM: Check-in & Lightning Demos', '5:45 PM: Co-founder Speed Dating', '6:30 PM: Open Networking & Q&A']
    },
    {
      id: 'ev-2',
      title: 'SSCBS Pitch & VC Roast Clinic',
      category: 'PITCH CLINIC',
      date: 'Aug 29, 2026 • 4:00 PM IST',
      location: 'SSCBS Auditorium, Rohini Sector 16',
      spotsTotal: 60,
      spotsClaimed: 38,
      badge: '⚡ VC ATTENDING',
      badgeColor: 'green',
      desc: 'Live 3-minute deck roasts in front of early-stage angels and top DU alumni operators. Top 3 pitches receive ₹50k prototype grants.',
      agenda: ['4:00 PM: Keynote on Student Fundraising', '4:30 PM: 10 Selected Live Pitches', '6:00 PM: Angel Feedback & Awards']
    },
    {
      id: 'ev-3',
      title: 'South Campus Tech Sprint & Hack Day',
      category: 'HACKATHON',
      date: 'Sep 05, 2026 • 10:00 AM IST',
      location: 'Faculty of Technology / Benito Juarez Marg',
      spotsTotal: 80,
      spotsClaimed: 45,
      badge: '🏆 ₹1L BOUNTIES',
      badgeColor: 'yellow',
      desc: '12-hour build sprint. Build an AI agent, DeFi tool, or campus utility. Mentored by engineers from top tier-1 startups.',
      agenda: ['10:00 AM: Problem Statements Released', '10:30 AM: Hacking Commences', '8:00 PM: Demos & Winner Ceremony']
    }
  ],

  // Founder Vault Perks
  vaultPerks: [
    {
      id: 'v-1',
      category: 'cloud',
      title: 'AWS Activate Cloud Credits',
      badge: '☁️ Cloud Infra',
      valueTag: '₹4,15,000 ($5,000 USD)',
      desc: 'Full access to AWS cloud credits, premium business support, and 1-on-1 architecture consultations for TFC cohort founders.',
      actionUrl: 'https://aws.amazon.com/activate/',
      actionLabel: 'Claim AWS Credits'
    },
    {
      id: 'v-2',
      category: 'legal',
      title: 'Vakilsearch Private Limited Incorporation',
      badge: '⚖️ Legal & Tax',
      valueTag: '60% Off Pvt Ltd Setup',
      desc: 'Fast-track company incorporation, MCA filing, GST registration, and founder shareholding agreements made simple for students.',
      actionUrl: 'https://vakilsearch.com',
      actionLabel: 'Redeem Legal Perk'
    },
    {
      id: 'v-3',
      category: 'ai',
      title: 'OpenAI API Builder Credits',
      badge: '🤖 AI Model Credits',
      valueTag: '₹2,00,000 ($2,500 USD)',
      desc: 'Direct developer platform credits for GPT-4o, Whisper, and Embeddings models for student builders creating AI applications.',
      actionUrl: 'https://openai.com/api/',
      actionLabel: 'Unlock OpenAI Perk'
    },
    {
      id: 'v-4',
      category: 'productivity',
      title: 'Notion for Startups Plus Plan',
      badge: '📋 Team Workspace',
      valueTag: '6 Months Unlimited Free',
      desc: 'Unlimited team workspace, Notion AI integrations, and investor data room templates designed specifically for founding teams.',
      actionUrl: 'https://notion.so/startups',
      actionLabel: 'Activate Notion Pro'
    },
    {
      id: 'v-5',
      category: 'grant',
      title: 'NIDHI-EIR Student Entrepreneurship Grant',
      badge: '💰 Micro-Grant',
      valueTag: '₹30,000 / mo Fellowship',
      desc: 'Government of India DST fellowship for college students working on novel tech prototypes and hardware/software startups.',
      actionUrl: 'https://www.nidhi-eir.in/',
      actionLabel: 'View Grant Application'
    },
    {
      id: 'v-6',
      category: 'cloud',
      title: 'Supabase Pro for Student Builders',
      badge: '⚡ Backend',
      valueTag: '1 Year Free Pro',
      desc: 'Dedicated Postgres database, instant Auth, Realtime listeners, and Storage buckets to ship your MVP in days.',
      actionUrl: 'https://supabase.com',
      actionLabel: 'Claim Database Perk'
    }
  ],

  // Community Feed Posts
  posts: [
    {
      id: 'p-1',
      author: 'Dhruv Madan',
      avatar: 'dhruv.jpeg',
      college: 'Faculty of Technology • DU',
      timeAgo: '15m ago',
      category: 'ANNOUNCEMENT',
      content: '🚀 The Future Council Member App is officially LIVE across Delhi University!\n\nUse this portal to find co-founders across 90+ colleges, roast your pitch decks, and claim exclusive founder perks. Let us build the future together.',
      boosts: 34,
      isBoosted: false
    },
    {
      id: 'p-2',
      author: 'Kartik Goel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      college: 'SSCBS • DU',
      timeAgo: '1h ago',
      category: 'HIRING',
      content: 'Looking for a React Native / Flutter developer from North/South campus to build our campus payment splitter app. We already have 600+ student signups on waitlist! DM or reach out via Co-founder Radar.',
      boosts: 19,
      isBoosted: false
    },
    {
      id: 'p-3',
      author: 'Aryaveer Chauhan',
      avatar: 'aryaveer.jpeg',
      college: 'SGTB Khalsa College • DU',
      timeAgo: '3h ago',
      category: 'WIN',
      content: 'Huge milestone: TFC has partnered with top incubation hubs and tech credits providers to give ₹15L+ in value directly to DU student builders. Check the Founder Vault tab!',
      boosts: 48,
      isBoosted: true
    }
  ]
};

// Sound Synthesizer via Web Audio API
function playSound(type) {
  if (!TFC_APP.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!TFC_APP.audioCtx) {
      TFC_APP.audioCtx = new AudioContext();
    }
    if (TFC_APP.audioCtx.state === 'suspended') {
      TFC_APP.audioCtx.resume();
    }

    const ctx = TFC_APP.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'tab') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'success' || type === 'notif') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      osc.frequency.setValueAtTime(1160, now + 0.16);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    // Graceful fallback
  }
}

// Show Mobile Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `mobile-toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '⚡' : '⚠️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// ==========================================================================
// REAL-TIME NOTIFICATION & ACTIVITY SIGNAL SYSTEM
// ==========================================================================

function sendAppNotification({ type = 'signal', title, body, targetView = 'feed' }) {
  const notif = {
    id: 'notif-' + Date.now(),
    type: type,
    title: title,
    body: body,
    time: 'Just now',
    unread: true,
    targetView: targetView,
    timestamp: Date.now()
  };

  TFC_APP.notifications.unshift(notif);
  if (TFC_APP.notifications.length > 30) {
    TFC_APP.notifications.pop();
  }

  // Play tactile notification chime
  playSound('notif');

  // Update Top Bar & Drawer Badge Counters
  updateNotificationBadge();

  // Trigger Toast Notification on screen
  showToast(`🔔 ${title}`);

  // Re-render Notification Drawer
  renderNotifications();

  // Web / Native Device Push Notification API
  triggerDeviceSystemNotification(title, body);
}

// Native Device System Notification Trigger (Android Notification Bar + Web Fallback)
async function triggerDeviceSystemNotification(title, body) {
  // 1. Android Capacitor LocalNotifications Native Plugin
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      const notifId = Math.floor(Math.random() * 900000) + 10000;
      await window.Capacitor.Plugins.LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: title,
            body: body,
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'default',
            smallIcon: 'ic_launcher',
            iconColor: '#FF5E1E',
            actionTypeId: '',
            extra: null
          }
        ]
      });
      return;
    }
  } catch (err) {
    console.warn('Native local notification dispatch error:', err);
  }

  // 2. Web Browser Notification API Fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: 'TFC.png'
      });
    } catch (e) {
      // Ignored in restricted contexts
    }
  }
}

// Initialize Native Device Notification Permissions
async function initNativeNotifications() {
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      const perm = await window.Capacitor.Plugins.LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
      }
    }
  } catch (e) {
    console.warn('Native permission check error:', e);
  }
}

// ==========================================================================
// AUTOMATIC OVER-THE-AIR (OTA) LIVE UPDATE ENGINE
// ==========================================================================
const CURRENT_APP_VERSION = '1.1.0';

async function checkForLiveAutoUpdates() {
  try {
    const timestamp = Date.now();
    const res = await fetch(`version.json?_t=${timestamp}`, { cache: 'no-store' });
    if (!res.ok) return;

    const remoteManifest = await res.json();
    const lastSeenVersion = localStorage.getItem('tfc_app_version') || '1.0.0';

    if (remoteManifest && remoteManifest.version && remoteManifest.version !== lastSeenVersion) {
      console.log(`[Auto-Update] Synchronized new build: ${remoteManifest.version}`);
      localStorage.setItem('tfc_app_version', remoteManifest.version);

      // Trigger notification of silent auto-update
      sendAppNotification({
        type: 'system',
        title: `⚡ Updated to ${remoteManifest.title || 'Council OS v' + remoteManifest.version}`,
        body: 'Fresh features and live ecosystem improvements synchronized automatically.',
        targetView: 'radar'
      });

      showToast(`⚡ Auto-synced to ${remoteManifest.title || 'v' + remoteManifest.version}!`);
    }
  } catch (err) {
    // Offline or network error - continue from local offline cache silently
    console.debug('[Auto-Update] Network check skipped (offline cache active)');
  }
}

function updateNotificationBadge() {
  const unreadCount = TFC_APP.notifications.filter(n => n.unread).length;
  const badge = document.getElementById('headerNotifCount');
  const headerUnread = document.getElementById('notifUnreadHeaderCount');
  
  if (badge) {
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
  if (headerUnread) {
    headerUnread.textContent = unreadCount;
  }
}

function renderNotifications(filter = 'all') {
  const container = document.getElementById('notificationsDrawerContent');
  if (!container) return;

  const filtered = TFC_APP.notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="builder-card" style="text-align:center; padding:24px 12px;">
        <span style="font-size:1.8rem;">🔔</span>
        <h4 style="font-family:var(--font-heading); margin-top:6px; font-weight:900;">NO SIGNALS IN THIS CATEGORY</h4>
        <p style="font-size:0.75rem; color:#666;">You are all caught up on ecosystem dispatches.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(n => {
    let typeBadgeColor = 'var(--orange)';
    let typeIcon = '⚡';
    if (n.type === 'mixer') { typeBadgeColor = 'var(--terminal-green)'; typeIcon = '🎟️'; }
    else if (n.type === 'radar') { typeBadgeColor = '#6366F1'; typeIcon = '🤝'; }
    else if (n.type === 'vault') { typeBadgeColor = '#F59E0B'; typeIcon = '💰'; }
    else if (n.type === 'signal') { typeBadgeColor = 'var(--bright-cyan)'; typeIcon = '📢'; }
    else if (n.type === 'pitch') { typeBadgeColor = 'var(--orange)'; typeIcon = '🎯'; }

    return `
      <div class="notif-item-card ${n.unread ? 'unread' : ''}" onclick="handleNotificationClick('${n.id}', '${n.targetView}')">
        <div class="notif-item-header">
          <span class="notif-item-type-badge" style="color:${typeBadgeColor};">
            ${typeIcon} ${n.type.toUpperCase()}
          </span>
          <span class="notif-item-time">${n.time}</span>
        </div>
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-body">${n.body}</div>
      </div>
    `;
  }).join('');
}

function handleNotificationClick(notifId, targetView) {
  const notif = TFC_APP.notifications.find(n => n.id === notifId);
  if (notif) {
    notif.unread = false;
    updateNotificationBadge();
  }
  closeModal('notificationsDrawer');
  if (targetView) {
    switchView(targetView);
  }
}

function markAllNotificationsAsRead() {
  playSound('click');
  TFC_APP.notifications.forEach(n => n.unread = false);
  updateNotificationBadge();
  renderNotifications();
  showToast('All signals marked as read');
}

function filterNotifications(filter) {
  playSound('click');
  document.querySelectorAll('.role-pill[data-notif-filter]').forEach(p => {
    if (p.dataset.notifFilter === filter) p.classList.add('active');
    else p.classList.remove('active');
  });
  renderNotifications(filter);
}

// Navigation & Screen Switcher
function switchView(viewName) {
  playSound('tab');
  TFC_APP.activeView = viewName;

  // Toggle quick-nav, bottom dock, top-bar-actions & ticker visibility if in auth mode
  const quickNav = document.querySelector('.quick-nav-container');
  const bottomDock = document.querySelector('.fixed-bottom-dock');
  const topActions = document.querySelector('.top-bar-actions');
  const ticker = document.querySelector('.ticker-strip');

  if (viewName === 'auth') {
    if (quickNav) quickNav.style.display = 'none';
    if (bottomDock) bottomDock.style.display = 'none';
    if (topActions) topActions.style.display = 'none';
    if (ticker) ticker.style.display = 'none';
  } else {
    if (quickNav) quickNav.style.display = '';
    if (bottomDock) bottomDock.style.display = '';
    if (topActions) topActions.style.display = 'flex';
    if (ticker) ticker.style.display = 'flex';
  }

  // Update Top Quick-Nav Chips
  document.querySelectorAll('.nav-chip').forEach(chip => {
    if (chip.dataset.view === viewName) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Update Fixed Bottom Dock
  document.querySelectorAll('.dock-item').forEach(item => {
    if (item.dataset.tab === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update Screen Views
  document.querySelectorAll('.screen-view').forEach(screen => {
    if (screen.id === `view-${viewName}`) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  // Scroll to top of workspace
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'pass') {
    renderPassStudio();
  }
}

// ==========================================================================
// AUTHENTICATION & ONBOARDING SYSTEM
// ==========================================================================

function switchAuthTab(tab) {
  playSound('click');
  const loginTab = document.getElementById('authTabLogin');
  const regTab = document.getElementById('authTabRegister');
  const loginPanel = document.getElementById('authLoginPanel');
  const regPanel = document.getElementById('authRegisterPanel');

  if (tab === 'login') {
    loginTab.classList.add('active');
    regTab.classList.remove('active');
    loginPanel.style.display = 'block';
    regPanel.style.display = 'none';
  } else {
    regTab.classList.add('active');
    loginTab.classList.remove('active');
    regPanel.style.display = 'block';
    loginPanel.style.display = 'none';
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  playSound('click');
}

async function handleUserLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  
  const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
  const passwordInput = document.getElementById('loginPassword').value;
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (!emailInput || !passwordInput) {
    showToast('Please enter both email/ID and passkey', 'error');
    playSound('error');
    return;
  }

  if (submitBtn) {
    submitBtn.innerHTML = '<span>Verifying credentials... ⚡</span>';
    submitBtn.disabled = true;
  }

  try {
    let matchedUser = null;

    // 1. Query Supabase Cloud Database
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('members')
        .select('*')
        .or(`email.ilike.${emailInput},member_id.ilike.${emailInput}`)
        .limit(1);

      if (data && data.length > 0) {
        const cloudUser = data[0];
        if (cloudUser.password === passwordInput || !cloudUser.password) {
          matchedUser = {
            id: cloudUser.member_id || cloudUser.id,
            name: cloudUser.name,
            email: cloudUser.email,
            college: cloudUser.college || 'Delhi University',
            role: cloudUser.role || cloudUser.tier || 'Student Builder',
            tier: cloudUser.tier || 'Verified Member',
            avatar: cloudUser.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(cloudUser.name)}&background=FF5E1E&color=fff&bold=true`,
            skills: ['Builder', 'Ecosystem', 'Delhi University'],
            bio: cloudUser.bio || 'Active member at The Future Council ecosystem.',
            lookingFor: cloudUser.looking_for || 'Co-founders & project collaborations',
            phone: cloudUser.phone || '+91 98765 43210'
          };
        }
      }
    }

    // 2. Check local database for registered users
    if (!matchedUser) {
      const localUsers = JSON.parse(localStorage.getItem('tfc_registered_users') || '[]');
      matchedUser = localUsers.find(u => 
        (u.email.toLowerCase() === emailInput || (u.id && u.id.toLowerCase() === emailInput)) && 
        u.password === passwordInput
      );
    }

    // 3. Fallback check for core demo founder account
    if (!matchedUser && (emailInput === 'dhruv@thefuturecouncil.in' || emailInput === 'dhruvmadan235@gmail.com') && passwordInput === 'founder2026') {
      matchedUser = {
        name: 'Dhruv Madan',
        email: 'dhruv@thefuturecouncil.in',
        college: 'Faculty of Technology, DU',
        tier: 'Founder & Council Core',
        id: 'TFC-2026-0001',
        role: 'Founder / Tech Lead',
        avatar: 'dhruv.jpeg',
        skills: ['Fullstack', 'System Architecture', 'Product', 'AI Agents'],
        bio: 'Building the biggest student-run startup ecosystem at Delhi University.',
        lookingFor: 'Ambitious student founders, corporate partners & tech leads',
        phone: '+91 93150 95214'
      };
    }

    if (matchedUser) {
      playSound('success');
      TFC_APP.currentPersona = matchedUser;
      
      // Save persistent session
      localStorage.setItem('tfc_session_user', JSON.stringify(matchedUser));
      
      // Update UI elements
      document.getElementById('headerPersonaAvatar').src = matchedUser.avatar;
      renderPassStudio();
      
      // Send login activity notification
      sendAppNotification({
        type: 'system',
        title: `Welcome back, ${matchedUser.name.split(' ')[0]}! ⚡`,
        body: 'Active session connected to Pan-DU founder network.',
        targetView: 'radar'
      });

      switchView('radar');
    } else {
      playSound('error');
      showToast('Invalid email/ID or passkey. Please check credentials.', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Sign-in error. Connected to offline session.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.innerHTML = '<span>Sign In to Council OS ⚡</span>';
      submitBtn.disabled = false;
    }
  }
}

async function handleUserRegister(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const college = document.getElementById('regCollege').value.trim();
  const skillsStr = document.getElementById('regSkills').value.trim();
  const lookingFor = document.getElementById('regLookingFor').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const submitBtn = document.getElementById('regSubmitBtn');

  if (!name || !email || !college || !password) {
    showToast('Please fill in all required fields.', 'error');
    playSound('error');
    return;
  }

  if (submitBtn) {
    submitBtn.innerHTML = '<span>Activating Pass in Supabase... 🪪</span>';
    submitBtn.disabled = true;
  }

  const memberId = `TFC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF5E1E&color=fff&bold=true`;
  const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

  // Derive role category from skills
  let derivedRole = 'Student Builder';
  let roleCat = 'tech';
  const lowerSkills = skillsStr.toLowerCase();
  if (lowerSkills.includes('design') || lowerSkills.includes('figma') || lowerSkills.includes('ui') || lowerSkills.includes('ux')) {
    derivedRole = 'UI/UX Designer';
    roleCat = 'design';
  } else if (lowerSkills.includes('growth') || lowerSkills.includes('marketing') || lowerSkills.includes('gtm') || lowerSkills.includes('sales')) {
    derivedRole = 'Growth & Marketing';
    roleCat = 'growth';
  } else if (lowerSkills.includes('product') || lowerSkills.includes('finance') || lowerSkills.includes('fintech') || lowerSkills.includes('analyst')) {
    derivedRole = 'Product & FinTech';
    roleCat = 'product';
  } else if (lowerSkills.includes('next') || lowerSkills.includes('react') || lowerSkills.includes('python') || lowerSkills.includes('pytorch') || lowerSkills.includes('fullstack') || lowerSkills.includes('ai')) {
    derivedRole = 'Full-Stack / AI Builder';
    roleCat = 'tech';
  }

  const newMember = {
    id: memberId,
    member_id: memberId,
    name: name,
    email: email,
    college: college,
    role: derivedRole,
    tier: 'Verified Builder',
    avatar: avatarUrl,
    image: avatarUrl,
    skills: skillsArray.length ? skillsArray : ['Student Founder', 'Delhi University'],
    bio: `Student builder & founder from ${college}.`,
    lookingFor: lookingFor || 'Ambitious co-founders and early builders across Delhi University',
    phone: phone || '+91 98765 43210',
    password: password,
    created_at: new Date().toISOString()
  };

  try {
    // 1. Sync to Supabase Cloud Database
    if (supabaseClient) {
      try {
        await supabaseClient.from('members').insert([{
          name: newMember.name,
          email: newMember.email,
          college: newMember.college,
          tier: newMember.tier,
          member_id: newMember.member_id,
          password: newMember.password,
          image: newMember.image
        }]);
      } catch (cloudErr) {
        console.warn('Cloud sync error, stored locally:', cloudErr);
      }
    }

    // 2. Store in Local Database
    const localUsers = JSON.parse(localStorage.getItem('tfc_registered_users') || '[]');
    localUsers.push(newMember);
    localStorage.setItem('tfc_registered_users', JSON.stringify(localUsers));

    // 3. Add to Live Talent Radar
    TFC_APP.talents.unshift({
      id: memberId,
      name: name,
      avatar: avatarUrl,
      college: `${college} • DU`,
      role: derivedRole,
      roleCategory: roleCat,
      tier: 'Verified Builder',
      skills: newMember.skills,
      bio: newMember.bio,
      lookingFor: newMember.lookingFor,
      contact: email,
      phone: phone
    });

    // 4. Set Active Persona & Session
    TFC_APP.currentPersona = newMember;
    localStorage.setItem('tfc_session_user', JSON.stringify(newMember));

    playSound('success');
    document.getElementById('headerPersonaAvatar').src = avatarUrl;
    renderTalentRadar();
    renderPassStudio();

    // Send Registration Notification
    sendAppNotification({
      type: 'system',
      title: '🪪 Verified Member Pass Activated',
      body: `Welcome to The Future Council, ${name}! Your Pass ID is ${memberId}.`,
      targetView: 'pass'
    });

    switchView('pass');
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Account created! Welcome aboard 🚀');
    switchView('pass');
  } finally {
    if (submitBtn) {
      submitBtn.innerHTML = '<span>Activate Verified Member Pass 🪪</span>';
      submitBtn.disabled = false;
    }
  }
}

function logoutUser() {
  playSound('click');
  localStorage.removeItem('tfc_session_user');
  TFC_APP.currentPersona = {
    name: 'Member',
    email: '',
    college: 'Delhi University',
    tier: 'Member',
    id: 'TFC-MEMBER',
    role: 'Member',
    avatar: 'https://ui-avatars.com/api/?name=Member&background=000&color=fff',
    skills: [],
    bio: '',
    lookingFor: '',
    phone: ''
  };
  const avatar = document.getElementById('headerPersonaAvatar');
  if (avatar) avatar.src = 'https://ui-avatars.com/api/?name=Member&background=000&color=fff';
  showToast('Logged out of Council OS session.');
  switchView('auth');
}

// ==========================================================================
// 1. BUILDER RADAR RENDERER & FILTER
// ==========================================================================
function renderTalentRadar(filterCategory = 'all', searchQuery = '') {
  const container = document.getElementById('radarGrid');
  if (!container) return;

  const filtered = TFC_APP.talents.filter(item => {
    const matchesCat = (filterCategory === 'all') || (item.roleCategory === filterCategory);
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.name.toLowerCase().includes(query) ||
      item.college.toLowerCase().includes(query) ||
      item.role.toLowerCase().includes(query) ||
      item.skills.some(s => s.toLowerCase().includes(query)) ||
      item.lookingFor.toLowerCase().includes(query);

    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="builder-card" style="text-align:center; padding:32px 16px;">
        <span style="font-size:2rem;">🔍</span>
        <h4 style="font-family:var(--font-heading); margin-top:8px; font-weight:900;">NO MATCHING BUILDERS FOUND</h4>
        <p style="font-size:0.8rem; color:#666;">Try searching for another college, role, or specific tech stack.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    let tagClass = 'tag-tech';
    if (item.roleCategory === 'growth') tagClass = 'tag-growth';
    else if (item.roleCategory === 'design') tagClass = 'tag-design';
    else if (item.roleCategory === 'product') tagClass = 'tag-product';

    return `
      <article class="builder-card">
        <div class="builder-card-top">
          <img src="${item.avatar}" alt="${item.name}" class="builder-photo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=FF5E1E&color=fff&bold=true'" />
          <div class="builder-meta">
            <h3>${item.name}</h3>
            <div class="builder-college-badge">
              <span>📍</span>
              <span>${item.college}</span>
            </div>
            <span class="role-tag-pill ${tagClass}">${item.role}</span>
          </div>
        </div>

        <p class="builder-bio">${item.bio}</p>

        <div class="builder-looking-callout">
          <strong>LOOKING FOR:</strong>
          <span>${item.lookingFor}</span>
        </div>

        <div class="builder-skill-tags">
          ${item.skills.map(s => `<span class="b-skill-tag">#${s}</span>`).join('')}
        </div>

        <div class="builder-card-action-row">
          <span style="font-size:0.75rem; font-family:var(--font-mono); font-weight:800; color:var(--orange);">
            ⚡ ${item.tier || 'VERIFIED BUILDER'}
          </span>
          <button class="neo-btn sm" onclick="openConnectModal('${item.id}')">
            <span>Connect →</span>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// Connect Modal Helper
function openConnectModal(talentId) {
  playSound('click');
  const talent = TFC_APP.talents.find(t => t.id === talentId);
  if (!talent) return;

  const content = document.getElementById('connectModalContent');
  if (content) {
    content.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
        <img src="${talent.avatar}" style="width:48px; height:48px; border:2px solid var(--ink); border-radius:6px; object-fit:cover;" />
        <div>
          <h4 style="font-family:var(--font-heading); font-size:1.1rem; font-weight:900;">${talent.name}</h4>
          <p style="font-size:0.75rem; color:#666; font-weight:700;">${talent.college}</p>
        </div>
      </div>
      <p style="font-size:0.8rem; margin-bottom:14px; line-height:1.4;">
        Send a direct 1-click founder pitch or reach out via official Delhi University contact channel.
      </p>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <a href="mailto:${talent.contact}?subject=The%20Future%20Council%20Co-founder%20Connection&body=Hi%20${talent.name},%20saw%20your%20profile%20on%20TFC%20Radar!" class="neo-btn" style="text-decoration:none; justify-content:center;" onclick="recordConnectActivity('${talent.name}', '${talent.college}')">
          <span>✉️ Send Email Reachout</span>
        </a>
        <a href="https://wa.me/${(talent.phone || '').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(talent.name)},%20connecting%20from%20The%20Future%20Council!" target="_blank" class="neo-btn green" style="text-decoration:none; justify-content:center;" onclick="recordConnectActivity('${talent.name}', '${talent.college}')">
          <span>💬 WhatsApp Founder Message</span>
        </a>
      </div>
    `;
  }
  openModal('connectModal');
}

function recordConnectActivity(name, college) {
  sendAppNotification({
    type: 'radar',
    title: '🤝 Reachout Initiated',
    body: `Co-founder connection sent to ${name} (${college}).`,
    targetView: 'radar'
  });
}

// ==========================================================================
// 2. PITCH CLINIC & AI ROAST ENGINE
// ==========================================================================
function evaluatePitch(e) {
  e.preventDefault();
  playSound('success');

  const deckTitle = document.getElementById('pitchTitle').value.trim();
  const oneLiner = document.getElementById('pitchOneLiner').value.trim();
  const problem = document.getElementById('pitchProblem').value.trim();
  const traction = document.getElementById('pitchTraction').value.trim();
  const targetMarket = document.getElementById('pitchMarket').value;

  const resultContainer = document.getElementById('pitchRoastResults');
  resultContainer.style.display = 'block';

  // Calculate rubric score
  let score = 72;
  if (traction.length > 30) score += 12;
  if (oneLiner.length > 20 && oneLiner.length < 80) score += 8;
  if (problem.length > 40) score += 6;
  score = Math.min(score, 98);

  document.getElementById('roastScore').textContent = `${score}/100`;

  let verdict = '⚡ STRONG SEED POTENTIAL';
  let badgeColor = 'var(--terminal-green)';
  if (score < 80) {
    verdict = '🛠️ NEEDS DISTRIBUTION CLARITY';
    badgeColor = 'var(--orange)';
  }

  document.getElementById('roastVerdict').textContent = verdict;
  document.getElementById('roastVerdict').style.color = badgeColor;

  const feedbackList = document.getElementById('roastFeedbackList');
  feedbackList.innerHTML = `
    <li><strong>✨ Value Proposition:</strong> Clear positioning for ${targetMarket}. Strong clarity on the target DU audience.</li>
    <li><strong>⚡ Defensibility:</strong> Ensure your customer acquisition cost is locked down before expanding beyond Delhi University.</li>
    <li><strong>🚀 Traction Milestone:</strong> Highlight early waitlists or revenue metrics within the first 10 seconds of pitching.</li>
  `;

  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Trigger Notification
  sendAppNotification({
    type: 'pitch',
    title: '🎯 AI Pitch Roast Completed',
    body: `Scored ${score}/100 (${verdict}) with 3 actionable investor recommendations.`,
    targetView: 'clinic'
  });
}

// ==========================================================================
// 3. EVENTS & IRL MIXER RSVP ENGINE
// ==========================================================================
function renderEvents() {
  const container = document.getElementById('eventsList');
  if (!container) return;

  container.innerHTML = TFC_APP.events.map(ev => `
    <article class="builder-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="role-tag-pill tag-tech">${ev.category}</span>
        <span style="font-size:0.7rem; font-family:var(--font-mono); font-weight:900; background:var(--ink); color:#fff; padding:2px 6px; border-radius:4px;">
          ${ev.spotsClaimed}/${ev.spotsTotal} CLAIMED
        </span>
      </div>

      <h3 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:900; margin-top:2px;">
        ${ev.title}
      </h3>

      <div style="font-size:0.75rem; font-weight:700; color:#555; display:flex; flex-direction:column; gap:3px;">
        <div>📅 <strong>${ev.date}</strong></div>
        <div>📍 <strong>${ev.location}</strong></div>
      </div>

      <p style="font-size:0.8rem; color:#333; line-height:1.4;">${ev.desc}</p>

      <div style="background:var(--bg-cream); border:1.5px solid var(--ink); border-radius:6px; padding:8px 10px;">
        <strong style="font-size:0.7rem; text-transform:uppercase; font-family:var(--font-heading); color:var(--orange);">Agenda Highlights:</strong>
        <ul style="font-size:0.75rem; padding-left:16px; margin-top:4px; line-height:1.4;">
          ${ev.agenda.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>

      <button class="neo-btn green" onclick="claimEventTicket('${ev.id}')">
        <span>🎟️ Claim Admission Pass</span>
      </button>
    </article>
  `).join('');
}

function claimEventTicket(eventId) {
  playSound('success');
  const ev = TFC_APP.events.find(e => e.id === eventId);
  if (!ev) return;

  const content = document.getElementById('ticketModalContent');
  if (content) {
    const qrData = encodeURIComponent(`TFC-EVENT|${ev.id}|${TFC_APP.currentPersona.name}|${TFC_APP.currentPersona.id}`);
    content.innerHTML = `
      <div style="background:#FFF9E6; border:2.5px solid var(--ink); border-radius:8px; padding:16px; text-align:center; box-shadow:4px 4px 0 var(--ink);">
        <span class="role-tag-pill tag-growth" style="margin-bottom:8px;">CONFIRMED ENTRY PASS</span>
        <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:900; margin-bottom:4px;">${ev.title}</h3>
        <p style="font-size:0.75rem; color:#555; font-weight:700;">${ev.date}</p>
        <p style="font-size:0.75rem; color:#555; font-weight:700; margin-bottom:12px;">📍 ${ev.location}</p>

        <div style="border:2px dashed var(--ink); background:#fff; padding:12px; margin-bottom:12px; border-radius:6px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&color=0-0-0&bgcolor=fff" alt="Entry QR" style="width:130px; height:130px; margin:0 auto; display:block;" />
          <div style="font-family:var(--font-mono); font-size:0.75rem; font-weight:900; margin-top:8px;">
            PASS ID: ${TFC_APP.currentPersona.id}
          </div>
          <div style="font-size:0.75rem; font-weight:800; color:var(--orange);">
            HOLDER: ${TFC_APP.currentPersona.name.toUpperCase()}
          </div>
        </div>

        <button class="neo-btn sm" style="width:100%; justify-content:center;" onclick="showToast('Pass saved to offline wallet!'); closeModal('ticketModal');">
          <span>✓ Save Pass to Device</span>
        </button>
      </div>
    `;
  }

  // Trigger Notification
  sendAppNotification({
    type: 'mixer',
    title: '🎟️ Entry Pass Confirmed',
    body: `Admission pass generated for ${ev.title} on ${ev.date}.`,
    targetView: 'events'
  });

  openModal('ticketModal');
}

// ==========================================================================
// 4. FOUNDER VAULT PERKS & GRANTS
// ==========================================================================
function renderFounderVault(filterCategory = 'all', searchQuery = '') {
  const container = document.getElementById('vaultList');
  if (!container) return;

  const filtered = TFC_APP.vaultPerks.filter(p => {
    const matchesCat = (filterCategory === 'all') || (p.category === filterCategory);
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      p.title.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query) ||
      p.valueTag.toLowerCase().includes(query);

    return matchesCat && matchesSearch;
  });

  container.innerHTML = filtered.map(p => `
    <article class="builder-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="role-tag-pill tag-product">${p.badge}</span>
        <span style="font-size:0.72rem; font-family:var(--font-mono); font-weight:900; color:var(--orange);">
          ${p.valueTag}
        </span>
      </div>

      <h3 style="font-family:var(--font-heading); font-size:1.1rem; font-weight:900; margin-top:2px;">
        ${p.title}
      </h3>

      <p style="font-size:0.8rem; color:#444; line-height:1.4;">${p.desc}</p>

      <div class="builder-card-action-row">
        <span style="font-size:0.7rem; font-family:var(--font-mono); font-weight:800; color:#666;">
          COUNCIL PARTNER PERK
        </span>
        <a href="${p.actionUrl}" target="_blank" rel="noopener" class="neo-btn sm alt" style="text-decoration:none;" onclick="recordPerkActivity('${p.title}', '${p.valueTag}')">
          <span>${p.actionLabel} ↗</span>
        </a>
      </div>
    </article>
  `).join('');
}

function recordPerkActivity(title, valueTag) {
  sendAppNotification({
    type: 'vault',
    title: '💰 Founder Perk Unlocked',
    body: `Activated ${title} (${valueTag}) from Vault.`,
    targetView: 'vault'
  });
}

// ==========================================================================
// 5. SIGNALS COMMUNITY FEED
// ==========================================================================
function renderFeed() {
  const container = document.getElementById('feedList');
  if (!container) return;

  container.innerHTML = TFC_APP.posts.map(post => `
    <article class="builder-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${post.avatar}" style="width:36px; height:36px; border:2px solid var(--ink); border-radius:6px; object-fit:cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=FF5E1E&color=fff&bold=true'" />
          <div>
            <h4 style="font-family:var(--font-heading); font-size:0.95rem; font-weight:900;">${post.author}</h4>
            <p style="font-size:0.68rem; color:#666; font-weight:700;">${post.college} • ${post.timeAgo}</p>
          </div>
        </div>
        <span class="role-tag-pill tag-tech">${post.category}</span>
      </div>

      <p style="font-size:0.82rem; color:#222; line-height:1.45; white-space:pre-line;">
        ${post.content}
      </p>

      <div class="builder-card-action-row">
        <button class="neo-btn sm alt" onclick="boostPost('${post.id}')">
          <span>⚡ Boost (${post.boosts})</span>
        </button>
        <button class="neo-btn sm alt" onclick="showToast('Share link copied to clipboard!')">
          <span>Share ↗</span>
        </button>
      </div>
    </article>
  `).join('');
}

function boostPost(postId) {
  playSound('click');
  const post = TFC_APP.posts.find(p => p.id === postId);
  if (post) {
    if (!post.isBoosted) {
      post.boosts += 1;
      post.isBoosted = true;
      sendAppNotification({
        type: 'signal',
        title: '🔥 Signal Boosted',
        body: `Boosted ${post.author}'s update across 90+ DU colleges.`,
        targetView: 'feed'
      });
    } else {
      post.boosts -= 1;
      post.isBoosted = false;
    }
    renderFeed();
  }
}

function createFeedPost(e) {
  e.preventDefault();
  playSound('success');

  const content = document.getElementById('newPostContent').value.trim();
  const category = document.getElementById('newPostCategory').value;

  if (!content) return;

  const newPost = {
    id: 'p-' + Date.now(),
    author: TFC_APP.currentPersona.name,
    avatar: TFC_APP.currentPersona.avatar,
    college: TFC_APP.currentPersona.college,
    timeAgo: 'Just now',
    category: category,
    content: content,
    boosts: 1,
    isBoosted: true
  };

  TFC_APP.posts.unshift(newPost);
  document.getElementById('newPostContent').value = '';
  renderFeed();

  // Send Notification
  sendAppNotification({
    type: 'signal',
    title: '📢 Signal Broadcasted Live',
    body: `Your ${category} update is now live across Delhi University builders!`,
    targetView: 'feed'
  });
}

// ==========================================================================
// 6. PASS STUDIO
// ==========================================================================
function renderPassStudio() {
  const p = TFC_APP.currentPersona;

  const passName = document.getElementById('passName');
  if (passName) passName.textContent = p.name;
  
  const passCollege = document.getElementById('passCollege');
  if (passCollege) passCollege.textContent = p.college;
  
  const passTier = document.getElementById('passTier');
  if (passTier) passTier.textContent = p.tier || 'Verified Member';
  
  const passId = document.getElementById('passId');
  if (passId) passId.textContent = p.id;
  
  const passPhoto = document.getElementById('passPhoto');
  if (passPhoto) passPhoto.src = p.avatar;
  
  const passRole = document.getElementById('passRole');
  if (passRole) passRole.textContent = p.role;
  
  const passPhone = document.getElementById('passPhone');
  if (passPhone) passPhone.textContent = p.phone || '+91 98765 43210';

  const passBackQr = document.getElementById('passBackQr');
  if (passBackQr) {
    const qrData = encodeURIComponent(`TFC-PASS|${p.id}|${p.name}|${p.tier}|${p.college}`);
    passBackQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}&color=0-0-0&bgcolor=fff`;
  }

  const editName = document.getElementById('editPassName');
  if (editName) editName.value = p.name;
  
  const editCollege = document.getElementById('editPassCollege');
  if (editCollege) editCollege.value = p.college;
  
  const editRole = document.getElementById('editPassRole');
  if (editRole) editRole.value = p.role;
  
  const editBio = document.getElementById('editPassBio');
  if (editBio) editBio.value = p.bio || '';
  
  const editLooking = document.getElementById('editPassLooking');
  if (editLooking) editLooking.value = p.lookingFor || '';
  
  const editPhone = document.getElementById('editPassPhone');
  if (editPhone) editPhone.value = p.phone || '';
}

function flipPassCard() {
  playSound('click');
  const card = document.getElementById('passCardInner');
  if (card) {
    card.classList.toggle('flipped');
  }
}

function savePassProfile(e) {
  e.preventDefault();
  playSound('success');

  TFC_APP.currentPersona.name = document.getElementById('editPassName').value;
  TFC_APP.currentPersona.college = document.getElementById('editPassCollege').value;
  TFC_APP.currentPersona.role = document.getElementById('editPassRole').value;
  TFC_APP.currentPersona.bio = document.getElementById('editPassBio').value;
  TFC_APP.currentPersona.lookingFor = document.getElementById('editPassLooking').value;
  TFC_APP.currentPersona.phone = document.getElementById('editPassPhone').value;

  // Persist updated profile in session
  localStorage.setItem('tfc_session_user', JSON.stringify(TFC_APP.currentPersona));

  renderPassStudio();

  sendAppNotification({
    type: 'system',
    title: '🪪 Digital Pass Credentials Synced',
    body: 'Your profile bio, skills, and QR pass were updated successfully.',
    targetView: 'pass'
  });
}

function handlePhotoUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      TFC_APP.currentPersona.avatar = e.target.result;
      document.getElementById('passPhoto').src = e.target.result;
      document.getElementById('headerPersonaAvatar').src = e.target.result;
      localStorage.setItem('tfc_session_user', JSON.stringify(TFC_APP.currentPersona));
      
      sendAppNotification({
        type: 'system',
        title: '📸 Photo Updated',
        body: 'New profile photo rendered on your 3D digital pass.',
        targetView: 'pass'
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function openProfileDrawer() {
  playSound('click');
  const user = TFC_APP.currentPersona;
  
  const photo = document.getElementById('drawerProfilePhoto');
  if (photo) photo.src = user.avatar || 'dhruv.jpeg';

  const name = document.getElementById('drawerProfileName');
  if (name) name.textContent = user.name || 'Member';

  const college = document.getElementById('drawerProfileCollege');
  if (college) college.textContent = user.college || 'Delhi University';

  const idTag = document.getElementById('drawerProfileId');
  if (idTag) idTag.textContent = user.id || user.member_id || 'TFC-MEMBER';

  openModal('profileDrawer');
}

function openModal(modalId) {
  playSound('click');
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');

  if (modalId === 'notificationsDrawer') {
    renderNotifications();
    // Request native permission if available
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

function closeModal(modalId) {
  playSound('click');
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function toggleSound() {
  TFC_APP.soundEnabled = !TFC_APP.soundEnabled;
  const btn = document.getElementById('soundToggleBtn');
  if (btn) {
    btn.innerHTML = TFC_APP.soundEnabled ? '🔊' : '🔇';
  }
  if (TFC_APP.soundEnabled) playSound('click');
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderTalentRadar();
  renderEvents();
  renderFounderVault();
  renderFeed();
  renderPassStudio();
  renderNotifications();
  updateNotificationBadge();
  initNativeNotifications();
  checkForLiveAutoUpdates();

  // Background network re-connection auto-sync
  window.addEventListener('online', () => {
    checkForLiveAutoUpdates();
  });
  
  // Periodic background check every 5 minutes
  setInterval(checkForLiveAutoUpdates, 300000);

  // Restore Active Session if present
  const savedSession = localStorage.getItem('tfc_session_user');
  if (savedSession) {
    try {
      TFC_APP.currentPersona = JSON.parse(savedSession);
      const avatarEl = document.getElementById('headerPersonaAvatar');
      if (avatarEl && TFC_APP.currentPersona.avatar) {
        avatarEl.src = TFC_APP.currentPersona.avatar;
      }
      renderPassStudio();
      switchView('radar');
    } catch (e) {
      switchView('auth');
    }
  } else {
    // Show Authentication Screen
    switchView('auth');
  }

  // Attach Radar filter pills
  document.querySelectorAll('.role-pill[data-group="radar"]').forEach(pill => {
    pill.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.role-pill[data-group="radar"]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const searchVal = document.getElementById('radarSearchInput') ? document.getElementById('radarSearchInput').value : '';
      renderTalentRadar(pill.dataset.filter, searchVal);
    });
  });

  // Radar search listener
  const radarSearch = document.getElementById('radarSearchInput');
  if (radarSearch) {
    radarSearch.addEventListener('input', (e) => {
      const activePill = document.querySelector('.role-pill[data-group="radar"].active');
      const cat = activePill ? activePill.dataset.filter : 'all';
      renderTalentRadar(cat, e.target.value);
    });
  }

  // Attach Vault filter pills
  document.querySelectorAll('.role-pill[data-group="vault"]').forEach(pill => {
    pill.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.role-pill[data-group="vault"]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const searchVal = document.getElementById('vaultSearchInput') ? document.getElementById('vaultSearchInput').value : '';
      renderFounderVault(pill.dataset.filter, searchVal);
    });
  });

  // Vault search listener
  const vaultSearch = document.getElementById('vaultSearchInput');
  if (vaultSearch) {
    vaultSearch.addEventListener('input', (e) => {
      const activePill = document.querySelector('.role-pill[data-group="vault"].active');
      const cat = activePill ? activePill.dataset.filter : 'all';
      renderFounderVault(cat, e.target.value);
    });
  }

  // Close modals on clicking overlay backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Background Periodic Notification Dispatcher (Fires every 45 seconds for active users)
  setInterval(() => {
    if (TFC_APP.activeView !== 'auth') {
      const randIndex = Math.floor(Math.random() * TFC_APP.periodicSignalsQueue.length);
      const signal = TFC_APP.periodicSignalsQueue[randIndex];
      sendAppNotification(signal);
    }
  }, 45000);
});
