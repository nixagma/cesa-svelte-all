<script>
  import { onMount } from 'svelte';

  const R = document.documentElement;
  let theme = localStorage.getItem('cesa_theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  let authed = false;
  let user = null;
  let displayName = 'User';
  let trkOpen = false, prjOpen = false;
  let deviceRev = '–', deviceAchv = '–';

  $: themeIcon = theme === 'dark' ? '\u2600' : '\u263E';
  $: themeTitle = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  $: allowedMenus = user?.allowedMenus || [];
  $: isAdmin = user?.role === 'admin';
  $: showTrk = isAdmin || allowedMenus.some(m => ['Program','Budget'].includes(m));
  $: showPrj = isAdmin || allowedMenus.includes('BBB');
  $: showUsers = isAdmin;

  const cards = [
    { id: 'Device', title: 'Device Performance', variant: 'device',
      desc: 'Device sales performance by partner, revenue MTD/YTD, achievement vs target, daily pacing, and promotor productivity.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5z"></path><path d="M12 18a4 4 0 0 0 0-8"></path></svg>`,
      stats: [{label:'Revenue MTD',value:''},{label:'Achievement',value:''}],
      btnLabel: 'Open Dashboard', href: '/devicebundling' },
    { id: 'Roaming', title: 'Roaming Performance', variant: 'roaming',
      desc: 'International roaming performance: revenue, volume, usage by country, partner performance, and MoM/YoY trends.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>`,
      stats: [{label:'Revenue MTD',value:'2.45B'},{label:'Volume',value:'1.2M'}],
      btnLabel: 'Coming Soon', href: null },
    { id: 'Loyalty', title: 'Loyalty Performance', variant: 'loyalty',
      desc: 'Loyalty program monitoring: enrollment rate, redemption rate, points liability, tier distribution, and campaign effectiveness.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
      stats: [{label:'Enrollment',value:'68.5%'},{label:'Redemption',value:'42.3%'}],
      btnLabel: 'Coming Soon', href: null }
  ];

  $: visibleCards = cards.filter(c => isAdmin || allowedMenus.includes(c.id));
  $: single = visibleCards.length === 1;
  $: if (deviceRev !== '–') {
    cards[0].stats[0].value = deviceRev;
    cards[0].stats[1].value = deviceAchv;
  }

  const ICONS = {
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  };

  function set(t) {
    theme = t;
    R.dataset.theme = t;
    try { localStorage.setItem('cesa_theme', t); } catch (e) {}
  }

  function toggleMenu(name) {
    if (name === 'trk') trkOpen = !trkOpen;
    else prjOpen = !prjOpen;
  }

  function closeAll() { trkOpen = false; prjOpen = false; }

  function logout() {
    fetch('/api/logout', { method: 'POST', keepalive: true });
    document.cookie = 'auth_flag=; path=/; max-age=0';
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    if (window.top !== window.self) {
      window.top.postMessage({type:'cesa-nav',to:'/login'},'*');
    } else {
      window.location.href = '/login';
    }
  }

  async function loadStats() {
    try {
      const idx = await (await fetch('/data/index.json')).json();
      const data = await (await fetch('/data/' + idx[idx.length-1] + '.json')).json();
      const k = data.kpi && data.kpi.ALL;
      if (k) { deviceRev = k.rev.toFixed(1) + 'B'; deviceAchv = k.achv.toFixed(1) + '%'; }
    } catch (e) { console.error('device stats', e); }
  }

  onMount(() => {
    R.dataset.theme = theme;
    const token = document.cookie.split('; ').find(c => c.trim().startsWith('auth_flag='));
    const userStr = localStorage.getItem('user');
    if (window.top === window.self && (!token || !userStr)) {
      window.location.href = '/login';
      return;
    }
    try {
      user = JSON.parse(userStr);
      displayName = user.name || user.displayName || user.email || 'User';
      authed = true;
      loadStats();
    } catch {
      if (window.top === window.self) window.location.href = '/login';
    }
    document.addEventListener('click', closeAll);
    return () => document.removeEventListener('click', closeAll);
  });
</script>

<div class="topbar">
  <div class="topbar-inner">
    <div class="brand">
      <span class="logo">CESA</span>
      <span class="sub">Business Planning &amp; Analysis</span>
    </div>
    <div class="user-menu">
      {#if showTrk}
      <div class="trk">
        <button class="tb" aria-haspopup="true" aria-expanded={trkOpen} on:click|stopPropagation={() => toggleMenu('trk')}>
          Tracking &#9662;
        </button>
        <div class="trkm" class:open={trkOpen}>
          {#if isAdmin || allowedMenus.includes('Program')}<a href="/tracker/" data-menu-id="Program">Program</a>{/if}
          {#if isAdmin || allowedMenus.includes('Development')}<a href="#" class="dis" data-menu-id="Development">Development</a>{/if}
          {#if isAdmin || allowedMenus.includes('Budget')}<a href="/budget" data-menu-id="Budget">Budget</a>{/if}
        </div>
      </div>
      {/if}
      {#if showPrj}
      <div class="trk">
        <button class="tb" aria-haspopup="true" aria-expanded={prjOpen} on:click|stopPropagation={() => toggleMenu('prj')}>
          Project &#9662;
        </button>
        <div class="trkm" class:open={prjOpen}>
          {#if isAdmin || allowedMenus.includes('MAP')}<a href="#" class="dis" data-menu-id="MAP">MAP</a>{/if}
          {#if isAdmin || allowedMenus.includes('BBB')}<a href="/bbb" data-menu-id="BBB">BBB</a>{/if}
        </div>
      </div>
      {/if}
      {#if showUsers}<a href="/users" class="tb">Users</a>{/if}
      <button class="tb ic" aria-label="Toggle theme" on:click={() => set(theme === 'dark' ? 'light' : 'dark')} title={themeTitle}>
        {@html themeIcon}
      </button>
      <div class="user-info">
        <div class="user-name">{displayName}</div>
      </div>
      <button class="tb danger" on:click={logout}>Log out</button>
    </div>
  </div>
</div>

{#if authed}
<main class="main wrap">
  <header class="page-header">
    <div class="page-badge">Choose an Analytics Dashboard</div>
    <h1>Welcome back, <span>{displayName}</span></h1>
    <p>Select the performance analytics module you want to access</p>
  </header>

  <div class="carousel-container">
    <div class="carousel-track" class:single={single}>
      {#each visibleCards as card (card.id)}
      <article class="carousel-card" class:card-device={card.variant==='device'} class:card-roaming={card.variant==='roaming'} class:card-loyalty={card.variant==='loyalty'}>
        <div class="card-icon">{@html card.icon}</div>
        <h2 class="card-title">{card.title}</h2>
        <p class="card-desc">{card.desc}</p>
        <div class="card-stats">
          {#each card.stats as stat}
          <div class="stat">
            <div class="stat-value">{stat.value}</div>
            <div class="stat-label">{stat.label}</div>
          </div>
          {/each}
        </div>
        {#if card.href}
          <a href={card.href} class="card-btn"><span>{card.btnLabel}</span>{@html ICONS.arrow}</a>
        {:else}
          <button class="card-btn" disabled><span>{card.btnLabel}</span>{@html ICONS.clock}</button>
        {/if}
      </article>
      {/each}
    </div>
  </div>
</main>

<footer class="footer">
  <p>© 2026 CESA &middot; Business Planning &amp; Analysis &middot; Telkomsel</p>
</footer>
{/if}

<style>
  :root {
    --deep-red:#C00000; --tsel-red:#E60028; --coral:#FF7C80; --pink:#FF99CC;
    --lpink:#FFCCCC; --mauve:#9D90A0; --ink:#23232B; --gray:#6E6E78;
    --card:#F6F6F8; --tint:#FDECEF; --line:#E6E6EC; --amber:#B8860B; --amber-bg:#FDF6E3;
    --green:#1B8C5A; --blue:#1E40AF; --indigo:#4F46E5; --purple:#7C3AED;
    --bgrad:linear-gradient(135deg,#fff 0%,#FDECEF 20%,#E0E7FF 50%,#F3E8FF 80%,#ECFDF5 100%);
    --glass:rgba(255,255,255,0.9); --glow:rgba(0,0,0,0.05);
  }
  :root[data-theme=dark] {
    --ink:#ECECF1; --gray:#9A9AA8; --card:#22222C; --tint:#3A1A22; --line:#2C2C38;
    --amber:#E0A82E; --bgrad:linear-gradient(135deg,#12121A 0%,#1E1220 25%,#141A33 55%,#1B1430 80%,#102019 100%);
    --glass:rgba(26,26,36,0.88); --glow:rgba(0,0,0,0.4); color-scheme:dark;
  }
  * { box-sizing:border-box; margin:0; padding:0 }
  body {
    font-family:'Poppins',Arial,sans-serif; color:var(--ink); background:#fff;
    line-height:1.4; -webkit-font-smoothing:antialiased; min-height:100vh;
    background:var(--bgrad); padding-bottom:80px
  }
  .wrap { max-width:1200px; margin:0 auto; padding:0 24px }
  .topbar { background:var(--glass); backdrop-filter:blur(20px); border-bottom:1px solid var(--line); position:sticky; top:0; z-index:50 }
  .topbar-inner { max-width:1200px; margin:0 auto; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px }
  .brand { display:flex; align-items:center; gap:14px }
  .brand .logo { font-weight:800; font-size:22px; letter-spacing:-0.5px; background:linear-gradient(135deg,var(--tsel-red),var(--deep-red)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent }
  .brand .sub { font-size:11px; color:var(--gray); font-weight:500 }
  .user-menu { display:flex; align-items:center; gap:16px }
  .user-info { text-align:right }
  .user-name { font-size:13px; font-weight:600; color:var(--ink) }
  .tb { display:inline-flex; align-items:center; gap:5px; cursor:pointer; text-decoration:none; font:inherit; font-size:12.5px; font-weight:600; line-height:1.2; border-radius:20px; padding:7px 14px; white-space:nowrap; transition:background .15s,border-color .15s,color .15s; color:var(--ink); background:var(--card); border:1px solid var(--line) }
  .tb:hover { border-color:var(--tsel-red); color:var(--tsel-red) }
  .tb.danger { color:var(--tsel-red); background:var(--tint); border-color:var(--tint) }
  .tb.danger:hover { background:var(--tsel-red); color:#fff; border-color:var(--tsel-red) }
  .tb.ic { padding:0; width:31px; height:31px; justify-content:center; font-size:15px }
  .trk { position:relative }
  .trkm { display:none; position:absolute; right:0; top:calc(100% + 6px); min-width:160px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:6px; box-shadow:0 8px 24px rgba(0,0,0,.25); z-index:50 }
  .trkm.open { display:block }
  .trkm a, .trkm .dis { display:block; padding:8px 12px; border-radius:8px; font-size:12.5px; font-weight:600; color:var(--ink); text-decoration:none }
  .trkm a:hover { background:var(--tint); color:var(--tsel-red) }
  .trkm .dis { opacity:.45; cursor:not-allowed }
  .main { padding:48px 24px 80px }
  .page-header { text-align:center; margin-bottom:56px }
  .page-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 20px; border-radius:100px; font-size:11px; font-weight:700; background:linear-gradient(135deg,var(--tsel-red),var(--deep-red)); color:#fff; margin-bottom:20px; box-shadow:0 4px 16px rgba(230,0,40,0.3) }
  .page-header h1 { font-size:40px; font-weight:800; color:var(--ink); letter-spacing:-1.5px; line-height:1.1; margin-bottom:12px; background:linear-gradient(135deg,var(--ink),var(--deep-red)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent }
  .page-header p { font-size:18px; color:var(--gray); max-width:600px; margin:0 auto; font-weight:400 }
  .carousel-container { position:relative; max-width:1100px; margin:0 auto }
  .carousel-track { display:flex; gap:24px; overflow-x:auto; scroll-snap-type:x mandatory; padding:16px 8px 32px; scrollbar-width:thin; scrollbar-color:var(--mauve) transparent }
  .carousel-track.single { justify-content:center; overflow-x:visible }
  .carousel-track::-webkit-scrollbar { height:8px }
  .carousel-track::-webkit-scrollbar-track { background:transparent }
  .carousel-track::-webkit-scrollbar-thumb { background:var(--line); border-radius:20px }
  .carousel-track::-webkit-scrollbar-thumb:hover { background:var(--mauve) }
  .carousel-card { flex:0 0 340px; scroll-snap-align:start; background:var(--glass); backdrop-filter:blur(20px); border:1px solid var(--line); border-radius:24px; padding:32px; display:flex; flex-direction:column; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow:0 4px 24px var(--glow) }
  .carousel-card:hover { transform:translateY(-8px); box-shadow:0 20px 40px -12px rgba(0,0,0,0.15); border-color:transparent }
  .card-icon { width:64px; height:64px; border-radius:18px; display:flex; align-items:center; justify-content:center; margin-bottom:24px; box-shadow:0 8px 24px rgba(0,0,0,0.15) }
  .card-icon svg { width:30px; height:30px; color:#fff }
  .card-title { font-size:22px; font-weight:700; color:var(--ink); margin-bottom:10px; letter-spacing:-0.5px }
  .card-desc { font-size:14px; color:var(--gray); line-height:1.6; margin-bottom:28px; flex:1 }
  .card-stats { display:flex; gap:16px; margin-bottom:28px; padding-top:20px; border-top:1px solid var(--line) }
  .stat { flex:1; text-align:center }
  .stat-value { font-size:20px; font-weight:800; color:var(--ink); letter-spacing:-0.5px }
  .stat-label { font-size:11px; color:var(--gray); text-transform:uppercase; letter-spacing:0.5px; margin-top:4px }
  .card-btn { width:100%; padding:14px 24px; border-radius:12px; font-family:inherit; font-size:14px; font-weight:700; color:#fff; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:10px; border:none }
  .card-btn svg { width:20px; height:20px }
  .card-btn:disabled { opacity:0.5; cursor:not-allowed }
  .card-device .card-icon { background:linear-gradient(135deg,var(--tsel-red),var(--deep-red)) }
  .card-device .card-btn { background:linear-gradient(135deg,var(--tsel-red),var(--deep-red)) }
  .card-device .card-btn:hover { background:linear-gradient(135deg,var(--deep-red),#A00018); box-shadow:0 8px 24px rgba(230,0,40,0.4) }
  .card-roaming .card-icon { background:linear-gradient(135deg,var(--blue),var(--indigo)) }
  .card-roaming .card-btn { background:linear-gradient(135deg,var(--blue),var(--indigo)) }
  .card-roaming .card-btn:hover { background:linear-gradient(135deg,var(--indigo),var(--purple)); box-shadow:0 8px 24px rgba(30,64,175,0.4) }
  .card-loyalty .card-icon { background:linear-gradient(135deg,var(--amber),#D4A017) }
  .card-loyalty .card-btn { background:linear-gradient(135deg,var(--amber),#D4A017) }
  .card-loyalty .card-btn:hover { background:linear-gradient(135deg,#D4A017,var(--amber)); box-shadow:0 8px 24px rgba(184,134,11,0.4) }
  .footer { text-align:center; padding:32px 24px; border-top:1px solid var(--line); margin-top:64px }
  .footer p { font-size:13px; color:var(--gray) }
  .footer strong { color:var(--ink) }
  @media (max-width:768px) { .carousel-card { flex:0 0 280px } .page-header h1 { font-size:30px } }
  @media (max-width:480px) { .carousel-track { padding:16px 4px 32px } .carousel-card { flex:0 0 100%; min-width:280px } .topbar-inner { flex-direction:column; text-align:center } .user-menu { width:100%; justify-content:space-between } }
</style>
