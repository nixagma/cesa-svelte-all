<script>
  import { onMount } from 'svelte';

  let trendBadge;
  let bars;
  let tooltip;

  const trendText = '▲ Trend: Improving';

  const d = [
    ['12 Oct', 56.788, 42.634, 8.652, 5.502, '–'],
    ['13 Oct', 83.938, 48.681, 21.727, 13.53, '+47.8%'],
    ['14 Oct', 84.043, 43.37, 30.767, 9.906, '+0.1%'],
    ['15 Oct', 87.154, 32.262, 47.361, 7.531, '+3.7%'],
    ['16 Oct', 98.193, 31.883, 59.549, 6.761, '+12.7%'],
    ['17 Oct', 88.755, 31.216, 50.537, 7.002, '−9.6%'],
    ['18 Oct', 73.87, 29.518, 25.177, 19.175, '−16.8%'],
    ['19 Oct', 62.808, 34.03, 19.81, 8.968, '−15.0%'],
    ['20 Oct', 62.542, 27.629, 18.097, 16.816, '−0.4%'],
    ['21 Oct', 63.715, 28.473, 17.798, 17.444, '+1.9%'],
    ['22 Oct', 67.13, 34.876, 18.257, 13.997, '+5.4%'],
    ['23 Oct', 85.026, 34.26, 27.602, 23.164, '+26.7%'],
    ['24 Oct', 65.022, 24.834, 18.805, 21.383, '−23.5%'],
    ['25 Oct', 55.549, 25.337, 16.066, 14.146, '−14.6%'],
    ['26 Oct', 63.742, 23.173, 29.706, 10.863, '+14.7%'],
    ['27 Oct', 88.755, 24.168, 51.141, 13.446, '+39.2%'],
    ['28 Oct', 93.377, 22.083, 57.883, 13.411, '+5.2%'],
    ['29 Oct', 134.457, 31.259, 89.004, 14.194, '+44.0%'],
    ['30 Oct', 185.447, 22.721, 149.765, 12.961, '+37.9%'],
    ['31 Oct', 199.758, 20.329, 170.388, 9.041, '+7.7%'],
    ['1 Nov', 1383.738, 20.03, 1342.101, 21.607, '+592.7%'],
    ['2 Nov', 1456.582, 16.227, 1430.133, 10.222, '+5.3%'],
    ['3 Nov', 267.132, 15.517, 243.026, 8.589, '−81.7%'],
    ['4 Nov', 65.996, 14.287, 43.45, 8.259, '−75.3%']
  ];

  function fmt(v) { return (v * 1000).toLocaleString('en-US'); }
  function ma(i) { if (i < 2) return null; return (d[i][1] + d[i - 1][1] + d[i - 2][1]) / 3; }

  onMount(() => {
    const tb = trendBadge;
    if (tb) {
      const t = (tb.textContent || '').trim();
      if (t.startsWith('▲')) tb.classList.add('trend-up');
      else if (t.startsWith('▼')) tb.classList.add('trend-down');
    }
    const B = bars;
    const maxTotal = Math.max(...d.map((x) => x[1]));
    const scaleValue = (v) => (145 * Math.sqrt(v / maxTotal)) || 0;
    d.forEach((x) => {
      const b = document.createElement('div');
      b.className = 'bar';
      const h = scaleValue(x[1]);
      const segTotal = x[2] + x[3] + x[4];
      b.style.height = h + 'px';
      b.innerHTML =
        `<div class="app" style="height:${(h * x[2] / segTotal).toFixed(1)}px"></div>` +
        `<div class="sms" style="height:${(h * x[3] / segTotal).toFixed(1)}px"></div>` +
        `<div class="ussd" style="height:${(h * x[4] / segTotal).toFixed(1)}px"></div>` +
        `<span class="tot">${x[1] >= 1000 ? (x[1] / 1000).toFixed(2) + 'M' : x[1].toFixed(1) + 'K'}</span>` +
        `<span class="dod ${x[5][0] === '−' ? 'red' : 'green'}">${x[5]}</span>` +
        `<span class="date">${x[0]}</span>`;
      B.appendChild(b);
    });

    const tip = tooltip;
    const barsEls = bars ? Array.from(bars.querySelectorAll('.bar')) : [];
    barsEls.forEach((bar, i) => {
      const x = d[i];
      bar.addEventListener('mouseenter', () => {
        if (!tip) return;
        tip.innerHTML =
          `<div class="tt-date">${x[0]} 2026</div>` +
          `<div class="tt-row"><span><i class="sw" style="background:#e6002d"></i>MyTSEL</span><b>${fmt(x[2])}</b></div>` +
          `<div class="tt-row"><span><i class="sw" style="background:#41444c"></i>SMS 777</span><b>${fmt(x[3])}</b></div>` +
          `<div class="tt-row"><span><i class="sw" style="background:#c7c9ce"></i>USSD *700*136#</span><b>${fmt(x[4])}</b></div>` +
          `<div class="tt-row"><span><i class="sw" style="background:#f4b4c1"></i>Outlet SMS 777_kode outlet</span><b>–</b></div>` +
          `<div class="tt-row tt-total"><span>Total opt-in</span><b>${fmt(x[1])}</b></div>` +
          `<div class="tt-row"><span>DoD</span><b>${x[5]}</b></div>` +
          `<div class="tt-row"><span>3-day moving avg</span><b>${ma(i) === null ? '–' : fmt(ma(i))}</b></div>`;
        tip.style.display = 'block';
      });
      bar.addEventListener('mouseleave', () => { if (tip) tip.style.display = 'none'; });
    });
  });
</script>

<div class="stage">
  <div class="slide">
    <div class="head">
      <h1>Bagi-Bagi Bahagia · Performance through 4 Nov</h1>
      <p>Opt-in 12 Oct–4 Nov 2026 · PN 13–28 Oct · SMS 12–28 Oct · MyTSEL · SMS 777 · USSD *700*136# · Outlet SMS 777_kode outlet · Eligible base 112.9M</p>
      <div class="badge" id="trendBadge" bind:this={trendBadge}>{trendText}</div>
    </div>
    <div class="content">
      <div class="kpis">
        <div class="card kpi"><div class="lbl">Total opt-ins</div><div class="val">4.97M</div><small>12 Oct–4 Nov · 24 days</small></div>
        <div class="card kpi"><div class="lbl">vs target</div><div class="val">14.8%</div><small>of 33.6M</small></div>
        <div class="card kpi"><div class="lbl">vs BAU benchmark</div><div class="val green">+637.5%</div><small>vs BAU Program avg 28.1K/day</small></div>
        <div class="card kpi"><div class="lbl">Opt-in trend</div><div class="val green">▲ 1.2%</div><small>3-day avg vs prior</small></div>
        <div class="card kpi"><div class="lbl">Participation</div><div class="val">4.4%</div><small>of 112.9M base</small></div>
        <div class="card kpi"><div class="lbl">Channel mix</div><div class="val">MyTSEL 14%</div><small>SMS 80% · USSD 6%</small></div>
        <div class="card kpi"><div class="lbl">Revenue uplift</div><div class="val">–</div><small>vs baseline</small></div>
      </div>
      <div class="r2">
        <div class="panel">
          <div class="title">Daily opt-in trend <span class="legend"><i class="sq" style="background:#e6002d"></i>MyTSEL <i class="sq" style="background:#41444c"></i>SMS 777 <i class="sq" style="background:#c7c9ce"></i>USSD *700*136# <i class="sq" style="background:#f4b4c1"></i>Outlet SMS 777_kode outlet <i class="dot"></i>3-day</span></div>
          <div class="chart"><div class="bars" id="bars" bind:this={bars}></div><svg class="line" id="line" preserveaspectratio="none" viewBox="0 0 600 190"></svg></div>
        </div>
        <div class="panel">
          <div class="title">Channel funnel · Actual</div>
          <table class="funnel">
            <thead>
              <tr><th>Stage</th><th colspan="2">PN (app)</th><th colspan="2">SMS trigger</th><th colspan="2">SMS whitelist</th></tr>
              <tr><th></th><th>Count</th><th>Conv.</th><th>Count</th><th>Conv.</th><th>Count</th><th>Conv.</th></tr>
            </thead>
            <tbody>
              <tr><td>Targeted</td><td>115.43M</td><td>–</td><td>99.75M</td><td>–</td><td>220.25M</td><td>–</td></tr>
              <tr><td>Sent</td><td>15.38M</td><td>13.3%</td><td>98.31M</td><td>98.6%</td><td>210.93M</td><td>95.8%</td></tr>
              <tr><td>Delivered</td><td>15.37M</td><td>99.9%</td><td>96.20M</td><td>97.9%</td><td>126.69M</td><td>60.1%</td></tr>
              <tr><td>Clicked/Open</td><td>293.3K</td><td>1.9%</td><td>–</td><td>–</td><td>–</td><td>–</td></tr>
              <tr><td><b>Opt-ins</b></td><td>632.8K</td><td>–</td><td>2.27M</td><td>–</td><td>280.8K</td><td>–</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="r3">
        <div class="panel">
          <div class="title">Program tracker · 17 weeks <span class="meta">Cumulative 4.97M · *W4 = 2–4 Nov</span></div>
          <div class="tracker">
            <div class="week live" style="height:38px"><b>572.7K</b><span>W1<br/>Oct</span></div>
            <div class="week w2" style="height:31px"><b>461.8K</b><span>W2<br/>Oct</span></div>
            <div class="week live" style="height:142px"><b>2.15M</b><span>W3<br/>Oct</span></div>
            <div class="week w2" style="height:118px"><b>1.79M</b><span>W4*<br/>Nov</span></div>
            <div class="week" style="height:5px"><span>W5<br/>Nov</span></div>
            <div class="week" style="height:5px"><span>W6<br/>Nov</span></div>
            <div class="week" style="height:5px"><span>W7<br/>Nov</span></div>
            <div class="week" style="height:5px"><span>W8<br/>Nov</span></div>
            <div class="week" style="height:5px"><span>W9<br/>Dec</span></div>
            <div class="week" style="height:5px"><span>W10<br/>Dec</span></div>
            <div class="week" style="height:5px"><span>W11<br/>Dec</span></div>
            <div class="week" style="height:5px"><span>W12<br/>Dec</span></div>
            <div class="week" style="height:5px"><span>W13<br/>Jan</span></div>
            <div class="week" style="height:5px"><span>W14<br/>Jan</span></div>
            <div class="week" style="height:5px"><span>W15<br/>Jan</span></div>
            <div class="week" style="height:5px"><span>W16<br/>Jan</span></div>
            <div class="week" style="height:5px"><span>W17<br/>Feb</span></div>
          </div>
        </div>
        <div class="panel profile">
          <div class="title">Participant profile</div>
          <div class="sub">ARPU tier · % of unique participants</div>
          <div class="row"><span>01. &lt;25K</span><div class="track"><div class="fill r" style="width:16.5%"></div></div><b>16.5%</b></div>
          <div class="row"><span>02. 25-50K</span><div class="track"><div class="fill" style="width:14.1%"></div></div><b>14.1%</b></div>
          <div class="row"><span>03. 50-100K</span><div class="track"><div class="fill" style="width:28.5%"></div></div><b>28.5%</b></div>
          <div class="row"><span>04. 100-200K</span><div class="track"><div class="fill" style="width:30.8%"></div></div><b>30.8%</b></div>
          <div class="row"><span>05. &gt;200K</span><div class="track"><div class="fill" style="width:10.1%"></div></div><b>10.1%</b></div>
          <div class="sep"></div>
          <div class="sub">Lifecycle · % of unique participants</div>
          <div class="row"><span>Increase or Stable</span><div class="track"><div class="fill r" style="width:48.4%"></div></div><b>48.4%</b></div>
          <div class="row"><span>Low Usage / Decline</span><div class="track"><div class="fill" style="width:22.2%"></div></div><b>22.2%</b></div>
          <div class="row"><span>Dormant Reactivated</span><div class="track"><div class="fill" style="width:26.9%"></div></div><b>26.9%</b></div>
          <div class="row"><span>New (&lt;3 mo)</span><div class="track"><div class="fill" style="width:2.5%"></div></div><b>2.5%</b></div>
        </div>
        <div class="panel area">
          <div class="title">Opt-in by area</div>
          <div class="row"><span class="areaLabel"><b>Area 1</b><small>Sumatera</small></span><div class="track"><div class="fill r" style="width:100.0%"></div></div><b>2.21M</b></div>
          <div class="row"><span class="areaLabel"><b>Area 2</b><small>Jabotabek Jabar</small></span><div class="track"><div class="fill" style="width:45.3%"></div></div><b>1.00M</b></div>
          <div class="row"><span class="areaLabel"><b>Area 3</b><small>Jawa Bali Nusra</small></span><div class="track"><div class="fill" style="width:38.1%"></div></div><b>842.5K</b></div>
        </div>
      </div>
    </div>
  </div>
</div>
<div id="bbbTooltip" bind:this={tooltip}></div>

<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #e6e7e9; font-family: Arial, sans-serif; color: #25262d; }
  .stage { width: 100vw; height: 100vh; position: relative; }
  .slide { width: 1600px; height: 900px; position: absolute; transform-origin: 0 0; background: #f4f4f6; overflow: hidden; }
  .head { height: 103px; background: #e6002d; color: #fff; padding: 18px 46px; }
  .head h1 { font-size: 30px; margin: 0; }
  .head p { font-size: 13px; margin: 9px 0; }
  .badge { position: absolute; right: 48px; top: 26px; background: #fff; color: #e6002d; border-radius: 24px; padding: 10px 40px; font-weight: 700; }
  .content { padding: 14px 46px; }
  .kpis { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
  .card, .panel { background: #fff; border-radius: 12px; }
  .kpi { height: 112px; padding: 13px 12px; border-top: 4px solid #e6002d; }
  .kpi:first-child { background: #e6002d; color: #fff; }
  .lbl { font-size: 12px; color: #6f727b; font-weight: 700; }
  .kpi:first-child .lbl, .kpi:first-child small { color: #fff; }
  .val { font-size: 27px; font-weight: 800; margin: 7px 0; }
  .kpi small { font-size: 10px; color: #6f727b; }
  .green { color: #16824b; }
  .red { color: #e6002d; }
  .r2 { display: grid; grid-template-columns: 1.35fr 0.75fr; gap: 15px; margin-top: 15px; }
  .panel { padding: 15px 18px; }
  .r2 .panel { height: 252px; }
  .title { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
  .meta { float: right; font-size: 11px; color: #6f727b; }
  .tracker { height: 180px; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1px solid #ddd; padding: 32px 2px 35px; }
  .week { width: 24px; background: #e5e6e9; position: relative; border-radius: 3px 3px 0 0; }
  .week.live { background: #e6002d; }
  .week.w2 { background: #f4b4c1; }
  .week b { position: absolute; top: -19px; font-size: 10px; white-space: nowrap; }
  .week span { position: absolute; top: 100%; margin-top: 7px; left: -7px; width: 38px; text-align: center; font-size: 8px; color: #6f727b; line-height: 1.1; }
  .funnel { width: 100%; border-collapse: collapse; font-size: 10px; }
  .funnel th { background: #e6002d; color: #fff; padding: 4px; }
  .funnel td { padding: 5px; border-bottom: 1px solid #e5e5e5; text-align: right; }
  .funnel td:first-child { text-align: left; }
  .r3 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
  .r3 .panel { height: 252px; }
  #bbbTooltip { position: fixed; z-index: 9999; display: none; min-width: 175px; padding: 10px 12px; background: rgba(34,35,41,.96); color: #fff; border-radius: 8px; box-shadow: 0 5px 16px rgba(0,0,0,.22); font: 11px/1.45 Arial, sans-serif; pointer-events: none; }
  #bbbTooltip .tt-date { font-size: 12px; font-weight: 700; margin-bottom: 5px; }
  #bbbTooltip .tt-row { display: flex; justify-content: space-between; gap: 18px; }
  #bbbTooltip .tt-total { border-top: 1px solid rgba(255,255,255,.22); margin-top: 5px; padding-top: 5px; font-weight: 700; }
  #bbbTooltip .sw { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 2px; }
  .bar { position: relative; }
  .badge.trend-up { background: #eaf7ef; color: #16824b; }
  .badge.trend-down { background: #fde8ec; color: #e6002d; }
  .chart { position: relative; }
  .bars { left: 46px; position: relative; height: 145px; }
  .line { left: 46px; position: relative; width: calc(100% - 51px); height: 145px; }
  .tot { position: absolute; bottom: -14px; left: 0; font-size: 9px; font-weight: 800; }
  .dod { position: absolute; top: -14px; right: -6px; font-size: 8.5px; font-weight: 700; }
  .bar .app, .bar .sms, .bar .ussd { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .app .segpct, .sms .segpct { color: #fff; }
  .ussd .segpct { color: #25262d; }
  .row { display: grid; grid-template-columns: 150px 1fr 48px; margin: 7px 0; }
  .row b { font-size: 12.5px; }
  .row .track { height: 8px; background: #e5e6e9; border-radius: 4px; overflow: hidden; }
  .row .fill { height: 100%; background: #e6002d; border-radius: 4px; }
  .row .fill.r { background: #41444c; }
  .row .sep { grid-column: 1 / -1; height: 1px; background: #e5e5e5; margin: 6px 0; }
  .areaLabel { align-items: flex-start; text-align: left; display: flex; flex-direction: column; }
  .areaLabel b, .areaLabel small { text-align: left; display: block; }
  .areaLabel b { font-size: 11px; }
  .areaLabel small { font-size: 10.5px; }
  .profile .row { grid-template-columns: 150px 1fr 48px; }
  .legend { float: right; font-size: 11px; font-weight: 400; color: #6f727b; }
  .legend .sq { display: inline-block; width: 10px; height: 10px; margin-left: 8px; border-radius: 2px; }
  .legend .dot { background: #25262d; border-radius: 50%; width: 5px; height: 5px; display: inline-block; margin-left: 8px; }
  .profile .sub { font-size: 11px; color: #6f727b; margin: -3px 0 8px; }
  .area .sub { font-size: 11px; color: #6f727b; margin: -3px 0 8px; }
</style>
