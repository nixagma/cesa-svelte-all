<script>
  import { onMount } from 'svelte';

  let users = [];
  let stats = { all: 0, admin: 0, editor: 0, viewer: 0 };
  let q = '';
  let fr = '';
  let me = '';
  
  let showAdd = false;
  let addErr = '';
  let addForm = { name: '', email: '', password: '', role: 'viewer', menus: ['Device', 'Roaming', 'Loyalty', 'Program', 'Development', 'Budget', 'BBB', 'MAP', 'Goals'] };

  let showPw = false;
  let pwWho = '';
  let pwId = null;
  let newPassword = '';
  let pwErr = '';

  let showDel = false;
  let delWho = '';
  let delId = null;
  let delErr = '';

  let showPerm = false;
  let permWho = '';
  let editId = null;
  let pName = '';
  let pUsername = '';
  let pEmail = '';
  let pRole = 'viewer';
  let pMenus = [];
  let pAreas = [];
  let permErr = '';

  let toastMsg = '';
  let toastOn = false;
  let toastTimer = null;

  const COL = ['#E60028', '#4F46E5', '#1B8C5A', '#B8860B', '#7C3AED', '#0E7490', '#BE185D'];
  const col = s => COL[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COL.length];
  const ini = n => (n || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  function toast(m) {
    toastMsg = m;
    toastOn = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastOn = false; }, 2200);
  }

  const call = async (m, b) => {
    const r = await fetch('/api/users', {
      method: m,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: b && JSON.stringify(b)
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Failed');
    return d;
  };

  async function load() {
    try {
      users = await call('GET');
      updateStats();
    } catch (x) {
      toast(x.message);
    }
  }

  function updateStats() {
    stats.all = users.length;
    stats.admin = users.filter(u => u.role === 'admin').length;
    stats.editor = users.filter(u => u.role === 'editor').length;
    stats.viewer = users.filter(u => u.role === 'viewer').length;
  }

  $: filteredUsers = users.filter(u => {
    const matchRole = !fr || u.role === fr;
    const matchQuery = (u.name + ' ' + (u.email || '')).toLowerCase().includes(q.toLowerCase());
    return matchRole && matchQuery;
  });

  onMount(() => {
    try {
      me = (JSON.parse(localStorage.getItem('user') || '{}').email || '').toLowerCase();
    } catch (e) {}
    load();
  });

  async function handleAdd(e) {
    e.preventDefault();
    addErr = '';
    try {
      await call('POST', {
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role,
        allowedMenus: addForm.menus
      });
      showAdd = false;
      toast('User added');
      load();
    } catch (x) {
      addErr = x.message;
    }
  }

  async function handlePw(e) {
    e.preventDefault();
    pwErr = '';
    try {
      await call('PATCH', { id: pwId, password: newPassword });
      showPw = false;
      toast('Password changed');
    } catch (x) {
      pwErr = x.message;
    }
  }

  async function handleDelete() {
    delErr = '';
    try {
      await call('DELETE', { id: delId });
      showDel = false;
      toast('User deleted');
      load();
    } catch (x) {
      delErr = x.message;
    }
  }

  function editUser(u) {
    editId = u.id;
    permWho = u.name + ' · ' + u.email;
    pName = u.name;
    pUsername = u.username || '';
    pEmail = u.email;
    pRole = u.role;
    pMenus = u.allowed_menus || [];
    pAreas = u.areas || [];
    showPerm = true;
  }

  async function saveUser() {
    permErr = '';
    try {
      await call('PATCH', {
        id: editId,
        name: pName,
        username: pUsername,
        role: pRole,
        allowedMenus: pMenus,
        assignedAreas: pAreas
      });
      showPerm = false;
      toast('User updated');
      load();
    } catch (x) {
      permErr = x.message;
    }
  }

  function toggleMenu(m) {
    if (pMenus.includes(m)) {
      pMenus = pMenus.filter(x => x !== m);
    } else {
      pMenus = [...pMenus, m];
    }
  }

  function toggleArea(a) {
    if (pAreas.includes(a)) {
      pAreas = pAreas.filter(x => x !== a);
    } else {
      pAreas = [...pAreas, a];
    }
  }

  function logout() {
    fetch('/api/logout', { method: 'POST', keepalive: true });
    document.cookie = 'auth_flag=; path=/; max-age=0';
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    if (window.top !== window.self) {
      window.top.postMessage({ type: 'cesa-nav', to: '/login' }, '*');
    } else {
      location.href = '/login';
    }
  }
</script>

<div class="hero">
  <div class="wrap">
    <div class="hl">
      <a href="/home" class="tb" on:click|preventDefault={() => {
        if (window.top !== window.self) window.top.postMessage({ type: 'cesa-nav', to: '/home' }, '*');
        else location.href = '/home';
      }}>← Back</a>
      <div>
        <h1>Manage Users</h1>
        <p>Manage accounts and access for the CESA Dashboard</p>
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <button class="tb" on:click={logout} style="background:#B00020;border-color:rgba(255,255,255,.35)">Log out</button>
    </div>
  </div>
</div>

<main>
  <div class="wrap">
    <div class="stats" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat"><b>{stats.all}</b><span>Total users</span></div>
      <div class="stat"><b>{stats.admin}</b><span>Admin</span></div>
      <div class="stat"><b>{stats.editor}</b><span>Editor</span></div>
      <div class="stat"><b>{stats.viewer}</b><span>Viewer</span></div>
    </div>
    <div class="panel">
      <div class="bar">
        <input type="search" bind:value={q} placeholder="Search name or email…">
        <select bind:value={fr}>
          <option value="">All roles</option>
          <option value="admin">admin</option>
          <option value="editor">editor</option>
          <option value="viewer">viewer</option>
        </select>
        <button class="btn" on:click={() => {
          addForm = { name: '', email: '', password: '', role: 'viewer', menus: ['Device', 'Roaming', 'Loyalty', 'Program', 'Development', 'Budget', 'BBB', 'MAP', 'Goals'] };
          addErr = '';
          showAdd = true;
        }}>+ Add User</button>
      </div>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th class="hide-sm">Created</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredUsers as u}
              {@const self = (u.email || '').toLowerCase() === me}
              <tr>
                <td>
                  <div class="who">
                    <div class="av" style="background:{col(u.email || u.name)}">{ini(u.name)}</div>
                    <div>
                      <b>{u.name}</b>
                      {#if self}<span class="you">You</span>{/if}
                      <small>{u.email || ''}</small>
                    </div>
                  </div>
                </td>
                <td><span class="badge {u.role}">{u.role}</span></td>
                <td class="hide-sm">{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td class="act">
                  <button on:click={() => editUser(u)}>Edit</button>
                  <button on:click={() => { pwWho = u.name + ' · ' + u.email; pwId = u.id; newPassword = ''; pwErr = ''; showPw = true; }}>Change password</button>
                  {#if !self}
                    <button class="d" on:click={() => { delWho = u.name + ' (' + u.email + ') will be permanently deleted.'; delId = u.id; delErr = ''; showDel = true; }}>Delete</button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if filteredUsers.length === 0}
        <div class="empty">No users found.</div>
      {/if}
    </div>
  </div>
</main>

{#if showAdd}
  <div class="ov on" on:mousedown={e => { if (e.target === e.currentTarget) showAdd = false; }}>
    <form class="dlg" on:submit={handleAdd} autocomplete="off">
      <h2>Add User</h2><p>Create a new dashboard account.</p>
      <div class="fld"><label>Name</label><input bind:value={addForm.name} required></div>
      <div class="fld"><label>Email</label><input type="email" bind:value={addForm.email} required></div>
      <div class="fld"><label>Password (min 8 characters)</label><input type="password" minlength="8" bind:value={addForm.password} required></div>
      <div class="fld"><label>Role</label><select bind:value={addForm.role}><option value="viewer">viewer</option><option value="admin">admin</option></select></div>
      <div class="ferr">{addErr}</div>
      <div class="foot"><button type="button" class="btn ghost" on:click={() => showAdd = false}>Cancel</button><button class="btn">Save</button></div>
    </form>
  </div>
{/if}

{#if showPw}
  <div class="ov on" on:mousedown={e => { if (e.target === e.currentTarget) showPw = false; }}>
    <form class="dlg" on:submit={handlePw} autocomplete="off">
      <h2>Change Password</h2><p>{pwWho}</p>
      <div class="fld"><label>New password (min 8 characters)</label><input type="password" minlength="8" bind:value={newPassword} required></div>
      <div class="ferr">{pwErr}</div>
      <div class="foot"><button type="button" class="btn ghost" on:click={() => showPw = false}>Cancel</button><button class="btn">Change</button></div>
    </form>
  </div>
{/if}

{#if showDel}
  <div class="ov on" on:mousedown={e => { if (e.target === e.currentTarget) showDel = false; }}>
    <div class="dlg">
      <h2>Delete user?</h2><p>{delWho}</p>
      <div class="ferr">{delErr}</div>
      <div class="foot"><button class="btn ghost" on:click={() => showDel = false}>Cancel</button><button class="btn" on:click={handleDelete}>Delete</button></div>
    </div>
  </div>
{/if}

{#if showPerm}
  <div class="ov on" on:mousedown={e => { if (e.target === e.currentTarget) showPerm = false; }}>
    <div class="dlg" style="max-height:90vh;overflow-y:auto">
      <h2>Edit User</h2><p>{permWho}</p>
      <div class="fld"><label>Name</label><input bind:value={pName} required></div>
      <div class="fld"><label>Username</label><input bind:value={pUsername}></div>
      <div class="fld"><label>Email</label><input bind:value={pEmail} disabled></div>
      <div class="fld"><label>Role</label><select bind:value={pRole}>
        <option value="viewer">viewer</option>
        <option value="editor">editor</option>
        <option value="admin">admin</option>
      </select></div>
      <div style="margin-top:12px;font-weight:600;font-size:13px;margin-bottom:6px">Permissions (Allowed Menus)</div>
      <div class="tree">
        <details open><summary>Dashboard</summary>
          {#each ['Device', 'Roaming', 'Loyalty'] as m}
            <label><input type="checkbox" checked={pMenus.includes(m)} on:change={() => toggleMenu(m)}><span>{m}</span></label>
          {/each}
        </details>
        <details open><summary>Tracking</summary>
          {#each ['Program', 'Development', 'Budget'] as m}
            <label><input type="checkbox" checked={pMenus.includes(m)} on:change={() => toggleMenu(m)}><span>{m}</span></label>
          {/each}
        </details>
        <details open><summary>Project</summary>
          {#each ['BBB', 'MAP'] as m}
            <label><input type="checkbox" checked={pMenus.includes(m)} on:change={() => toggleMenu(m)}><span>{m}</span></label>
          {/each}
        </details>
        <details open><summary>Goals</summary>
          <label><input type="checkbox" checked={pMenus.includes('Goals')} on:change={() => toggleMenu('Goals')}><span>Goals</span></label>
        </details>
      </div>
      <div style="margin-top:14px;font-weight:600;font-size:13px;margin-bottom:6px">Assigned Areas</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        {#each ['Device', 'Roaming', 'Loyalty', 'Ces A&E'] as a}
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer"><input type="checkbox" checked={pAreas.includes(a)} on:change={() => toggleArea(a)}> {a}</label>
        {/each}
      </div>
      <div class="ferr">{permErr}</div>
      <div class="foot"><button class="btn ghost" on:click={() => showPerm = false}>Cancel</button><button class="btn" on:click={saveUser}>Save</button></div>
    </div>
  </div>
{/if}

<div class="ov" id="ovPermBak" style="display:none"></div>
<div id="toast" class:on={toastOn}>{toastMsg}</div>

<style>
  :root{--red:#E60028;--deep:#C00000;--ink:#23232B;--gray:#6E6E78;--line:#E6E6EC;--card:#F6F6F8;--tint:#FDECEF;--green:#1B8C5A;--blue:#1E40AF;--bg:#FAFAFC;--surf:#fff;--hover:#FCFCFD;--shadow:rgba(35,35,43,.05);--bEd:#E8EEFF;--bVw:#EEF0F3;--bYou:#E6F5EE;--admt:#E60028}
  *{box-sizing:border-box}
  body{font-family:Poppins,Arial,sans-serif;color:var(--ink);margin:0;background:var(--bg);-webkit-font-smoothing:antialiased}
  .hero{background:linear-gradient(135deg,var(--red),var(--deep));color:#fff;padding:22px 24px 64px}
  .wrap{max-width:1000px;margin:0 auto}
  .hero .wrap{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
  .hero h1{font-size:22px;margin:0;font-weight:700}.hero p{margin:2px 0 0;font-size:12.5px;opacity:.85}
  main{margin-top:-44px;padding:0 24px 40px}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
  .stat{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:14px 16px;box-shadow:0 2px 8px var(--shadow)}
  .stat b{display:block;font-size:24px;font-weight:700;line-height:1.1}.stat span{font-size:11.5px;color:var(--gray);font-weight:500}
  .panel{background:var(--surf);border:1px solid var(--line);border-radius:14px;box-shadow:0 2px 8px var(--shadow);overflow:hidden}
  .bar{display:flex;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line);align-items:center;flex-wrap:wrap}
  .bar input[type=search]{flex:1;min-width:160px}
  input,select{padding:10px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:13px;width:100%;background:var(--surf);color:var(--ink);outline:none}
  input:focus,select:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(230,0,40,.12)}
  .bar select{width:auto;padding-right:30px;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236E6E78'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}
  .btn{padding:10px 16px;border:0;border-radius:10px;background:var(--red);color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s}
  .btn:hover{background:var(--deep)}.btn.ghost{background:var(--surf);color:var(--ink);border:1px solid var(--line)}.btn.ghost:hover{background:var(--card)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:10px 16px;color:var(--gray);font-weight:500;font-size:11.5px;text-transform:uppercase;letter-spacing:.4px;background:var(--card)}
  td{padding:12px 16px;border-top:1px solid var(--line);vertical-align:middle}
  tbody tr:hover{background:var(--hover)}
  .who{display:flex;align-items:center;gap:10px}
  .av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:700;font-size:13px;flex:none}
  .who small{display:block;color:var(--gray);font-size:11.5px}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600}
  .admin{background:var(--tint);color:var(--admt)}.viewer{background:var(--bVw);color:var(--gray)}
  .editor{background:var(--bEd);color:var(--blue)}
  .you{font-size:10.5px;background:var(--bYou);color:var(--green);border-radius:20px;padding:1px 8px;margin-left:6px;font-weight:600}
  .act{text-align:right;white-space:nowrap}
  .act button{border:1px solid var(--line);color:var(--ink);background:var(--surf);border-radius:8px;padding:6px 11px;font:inherit;font-size:12px;font-weight:600;cursor:pointer;margin-left:4px}
  .act button:hover{background:var(--card)}.act .d{color:var(--red)}.act .d:hover{background:var(--tint);border-color:var(--red)}
  .empty{padding:36px;text-align:center;color:var(--gray);font-size:13px}
  .ov{position:fixed;inset:0;background:rgba(20,20,28,.5);display:flex;align-items:center;justify-content:center;padding:16px;z-index:50}
  .dlg{background:var(--surf);border-radius:16px;width:100%;max-width:600px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}
  .dlg h2{margin:0 0 4px;font-size:17px}.dlg p{margin:0 0 14px;color:var(--gray);font-size:13px}
  .fld{margin-bottom:12px}.fld label{display:block;font-size:12px;font-weight:600;margin-bottom:5px}
  .ferr{color:var(--red);font-size:12.5px;min-height:18px;margin-bottom:6px}
  .foot{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}
  .tb{display:inline-flex;align-items:center;gap:5px;cursor:pointer;text-decoration:none;font:inherit;font-size:12.5px;font-weight:600;line-height:1.2;border-radius:20px;padding:7px 14px;white-space:nowrap;transition:background .15s,border-color .15s,color .15s;color:#fff;border:1px solid transparent;background:rgba(0,0,0,.2)}
  .tb:hover{background:rgba(0,0,0,.32)}
  .hl{display:flex;gap:8px;align-items:center}
  #toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#fff;padding:10px 18px;border-radius:24px;font-size:13px;opacity:0;pointer-events:none;transition:.25s;z-index:60}
  #toast.on{opacity:1;transform:translateX(-50%)}
  .tree details{margin-bottom:8px;border:1px solid var(--line);border-radius:8px;padding:8px}
  .tree summary{cursor:pointer;font-weight:600;font-size:13px;list-style:none}
  .tree summary::-webkit-details-marker{display:none}
  .tree summary::before{content:'▶';display:inline-block;margin-right:8px;font-size:10px;transition:.2s}
  .tree details[open]>summary::before{transform:rotate(90deg)}
  .tree label{display:grid;grid-template-columns:20px 1fr;align-items:center;padding:5px 0;margin-left:20px;font-size:12.5px;cursor:pointer;column-gap:8px}
  .tree input{margin:0;width:16px;height:16px;outline:none;box-shadow:none}
  @media(max-width:700px){.stats{grid-template-columns:repeat(2,1fr)}.hide-sm{display:none}td,th{padding:10px}}
</style>
