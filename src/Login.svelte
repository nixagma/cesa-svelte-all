<script>
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let err = '';
  let busy = false;
  let emailErr = false;
  let pwErr = false;

  const DASHBOARD_PAGES = { Device: '/devicebundling', Budget: '/budget', BBB: '/bbb' };

  onMount(() => {
    if (window.top !== window.self) return;
    const ck = document.cookie.split('; ').find((c) => c.startsWith('auth_flag='));
    if (ck && localStorage.getItem('user')) location.href = '/home';
  });

  function reset() {
    emailErr = false;
    pwErr = false;
    err = '';
  }

  async function submit(e) {
    e.preventDefault();
    reset();
    if (!email.trim()) { emailErr = true; err = 'Email or username is required'; return; }
    if (!password) { pwErr = true; err = 'Password is required'; return; }
    busy = true;
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!r.ok) {
        emailErr = true; pwErr = true;
        err = 'Incorrect email/username or password';
        busy = false;
        return;
      }
      const user = await r.json();
      const u = user.user || user;
      const menus = u.allowedMenus || [];
      localStorage.setItem('user', JSON.stringify({ email: u.email, role: u.role, name: u.name || u.displayName, allowedMenus: menus }));
      let target = '/home';
      if (u.role !== 'admin' && menus.length === 1 && DASHBOARD_PAGES[menus[0]]) target = DASHBOARD_PAGES[menus[0]];
      const redirect = new URLSearchParams(location.search).get('redirect') || target;
      if (window.top !== window.self) {
        window.top.postMessage({ type: 'cesa-nav', to: redirect }, '*');
      } else {
        location.href = redirect;
      }
    } catch (_) {
      err = 'Connection error';
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>CESA Dashboard — Login</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
  :global(:root){--ink:#171717;--gray:#666666;--line:#D1D5DB;--red:#E60028;--deep:#C00000;--bg:#FAFAFC;--surf:#ffffff;--grad-start:#FF8A00;--grad-end:#FF3D00}
  :global(*){box-sizing:border-box;margin:0;padding:0}
  :global(body){font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(135deg,var(--grad-start) 0%,var(--grad-end) 100%);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'%3E%3Cpath fill='none' stroke='rgba(255,255,255,0.25)' stroke-width='1' d='M10 100 C 20 10, 40 90, 50 100 C 60 90, 80 10, 90 100'/%3E%3Cpath fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='1' d='M20 90 C 30 20, 50 70, 60 90 C 70 80, 90 20, 100 80'/%3E%3Cpath fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='1' d='M15 85 C 25 25, 45 65, 55 85 C 65 75, 85 25, 95 75'/%3E%3C/svg%3A");background-attachment:fixed}
  .wrap{display:grid;grid-template-columns:400px 400px;gap:80px;max-width:1000px;width:100%;align-items:center}
  .info h1{font-size:36px;font-weight:700;line-height:1.15;margin-bottom:16px;letter-spacing:-0.5px}
  .info h1 span{color:var(--red)}
  .info p{font-size:15px;color:var(--gray);line-height:1.7;max-width:420px}
  .card{background:var(--surf);padding:44px;border-radius:14px;border:1px solid var(--line);box-shadow:0 1px 3px rgba(0,0,0,0.04)}
  .card h2{font-size:20px;font-weight:700;margin-bottom:6px}
  .card .sub{font-size:13px;color:var(--gray);margin-bottom:28px}
  .fg{margin-bottom:18px}
  .fg label{display:block;font-size:12px;font-weight:600;margin-bottom:6px;letter-spacing:0.2px}
  .fg input{width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:8px;font:inherit;font-size:14px;color:var(--ink);background:var(--surf);outline:none;transition:.2s}
  .fg input:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(230,0,40,0.08)}
  .fg input.err{border-color:var(--red);background:#FFF0F2}
  .ferr{color:var(--red);font-size:12px;margin-top:5px;min-height:18px}
  .btn{width:100%;padding:14px;border:none;border-radius:8px;font:inherit;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--red),var(--deep));cursor:pointer;transition:.15s;box-shadow:0 2px 8px rgba(230,0,40,0.25);margin-top:8px;display:flex;align-items:center;justify-content:center;gap:7px}
  .btn:hover:not(:disabled){opacity:.92;transform:translateY(-1px);box-shadow:0 4px 14px rgba(230,0,40,0.35)}
  .btn:active:not(:disabled){transform:translateY(0)}
  .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .footer{text-align:center;margin-top:24px;font-size:11.5px;color:var(--gray)}
  @media(max-width:860px){.wrap{grid-template-columns:1fr;gap:32px;max-width:440px}.info{text-align:center}.info p{margin:0 auto}}
</style>

<div class="wrap">
  <div class="info">
    <h1><span>CESA</span> Performance Dashboard</h1>
    <p>Enterprise initiative tracking and performance analytics for Consumer Engagement Service</p>
  </div>
  <div class="card">
    <h2>Sign in</h2>
    <p class="sub">Enter your credentials to continue</p>
    <form novalidate onsubmit={submit}>
      <div class="fg">
        <label for="email">Email or Username</label>
        <input id="email" bind:value={email} class:err={emailErr} placeholder="Enter your email or username" autocomplete="username" required>
      </div>
      <div class="fg">
        <label for="password">Password</label>
        <input id="password" type="password" bind:value={password} class:err={pwErr} placeholder="Enter your password" autocomplete="current-password" required>
      </div>
      <div class="ferr">{err}</div>
      <button class="btn" type="submit" disabled={busy}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        {busy ? 'Signing in…' : 'Login'}
      </button>
    </form>
    <div class="footer">© 2026 CESA · Business Planning & Analysis</div>
  </div>
</div>
