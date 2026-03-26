import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --card:      #f2efe9;
    --text-1:    #18170f;
    --text-2:    #6b6760;
    --text-3:    #b2ada6;
    --green:     #3d6128;
    --green-dim: #4e7a33;
    --green-l:   rgba(61,97,40,0.08);
    --brown:     #7a5c2e;
    --teal:      #2a6e6e;
    --bar-track: #d6d2ca;
    --f-serif:   'Cormorant Garamond', serif;
    --f-body:    'DM Sans', sans-serif;
    --f-mono:    'DM Mono', monospace;
  }

  /* ══ COMPONENT ROOT ══ */
  .fc-shell {
    display: grid;
    grid-template-columns: 42% 58%;
    width: 100%;
    height: calc(100vh - 72px);
    overflow: hidden;
  }

  /* ══════════════════
     LEFT COLUMN
  ══════════════════ */
  .fc-left {
    display: flex;
    flex-direction: column;
    padding: 40px 48px;
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    background: inherit;
    border: none;
    outline: none;
  }

  .fc-brand, .fc-page-title, .fc-page-desc { flex-shrink: 0; }

  .fc-brand {
    display: flex; align-items: center; gap: 9px;
    margin-bottom: 26px;
  }
  .fc-brand-name {
    font-family: var(--f-mono);
    font-size: 10.5px; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--text-2);
  }

  .fc-page-title {
    font-family: var(--f-serif);
    font-size: clamp(26px, 2.8vw, 42px);
    font-weight: 600; line-height: 1.05;
    letter-spacing: -0.01em; color: var(--text-1);
    margin-bottom: 8px;
  }
  .fc-page-title em { font-style: italic; color: var(--green); }

  .fc-page-desc {
    font-size: 13px; font-weight: 300;
    line-height: 1.65; color: var(--text-2);
    margin-bottom: 24px;
    font-family: var(--f-body);
  }

  /* form card */
  .fc-form-card {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    align-self: stretch;
    overflow: hidden;
  }

  /* card header */
  .fc-card-header {
    padding: 16px 22px;
    border-bottom: 1px solid rgba(0,0,0,0.07);
    display: flex; align-items: center;
    justify-content: space-between; gap: 12px;
    flex-shrink: 0;
  }
  .fc-card-header-label {
    font-family: var(--f-mono);
    font-size: 10px; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--text-3);
  }
  .fc-badges-row { display: flex; gap: 7px; flex-shrink: 0; }
  .fc-n-badge {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 99px;
    font-family: var(--f-mono); font-size: 10.5px;
    font-weight: 400; letter-spacing: 0.03em;
    white-space: nowrap;
  }
  .fc-n-badge.n { background: rgba(61,97,40,0.10);  color: var(--green); }
  .fc-n-badge.p { background: rgba(122,92,46,0.10); color: var(--brown); }
  .fc-n-badge.k { background: rgba(42,110,110,0.10);color: var(--teal);  }
  .fc-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  /* fields grid */
  .fc-fields-stack {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    min-height: 0;
  }

  .fc-field {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 14px 18px;
    min-height: 0;
    overflow: hidden;
    position: relative;
    transition: background .15s;
  }
  .fc-field:hover { background: rgba(0,0,0,0.012); }
  .fc-field:focus-within { background: rgba(61,97,40,0.04); }

  .fc-field label {
    font-size: 10.5px; font-weight: 500;
    color: var(--text-2); letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: color .15s;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
    font-family: var(--f-body);
  }
  .fc-field:focus-within label { color: var(--green); }
  .fc-field-unit {
    font-family: var(--f-mono);
    text-transform: none;
    font-weight: 300;
    letter-spacing: 0.06em;
    color: var(--text-2);
  }

  .fc-field input, .fc-field select {
    background: transparent;
    border: none; outline: none;
    font-family: var(--f-serif);
    font-size: clamp(20px, 1.8vw, 28px);
    font-weight: 600; color: var(--text-1);
    letter-spacing: -0.02em;
    width: 100%; line-height: 1.1;
    transition: color .15s;
    appearance: none; -webkit-appearance: none;
  }
  .fc-field input::placeholder { color: var(--bar-track); }
  .fc-field:focus-within input  { color: var(--green-dim); }
  .fc-field:focus-within select { color: var(--green-dim); }

  .fc-field select { cursor: pointer; font-size: clamp(18px, 1.6vw, 24px); }

  .fc-select-wrap { position: relative; }
  .fc-select-wrap::after {
    content: '';
    position: absolute; right: 2px; top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid var(--text-3);
    pointer-events: none;
  }

  .fc-field-accent {
    width: 6px; height: 6px; border-radius: 50%;
    position: absolute; right: 18px; bottom: 16px;
    opacity: 0; transition: opacity .2s;
  }
  .fc-field:focus-within .fc-field-accent { opacity: 1; }
  .fc-field-accent.n { background: var(--green); }
  .fc-field-accent.p { background: var(--brown); }
  .fc-field-accent.k { background: var(--teal);  }
  .fc-field-accent.c { background: var(--text-3); }

  /* card footer */
  .fc-card-footer {
    padding: 16px 22px 20px;
    display: flex; flex-direction: column; gap: 10px;
    flex-shrink: 0;
    border-top: 1px solid rgba(0,0,0,0.07);
  }

  .fc-crop-summary {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: var(--green-l);
    border-radius: 12px;
  }
  .fc-crop-summary-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(61,97,40,0.13);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fc-crop-summary-icon svg { width: 13px; height: 13px; stroke: var(--green); }
  .fc-crop-summary-text {
    font-size: 12.5px; font-weight: 300; color: var(--green); line-height: 1.4;
    font-family: var(--f-body);
  }
  .fc-crop-summary-text strong { font-weight: 500; }

  .fc-btn-calc {
    width: 100%; padding: 13px 20px;
    background: var(--text-1); color: #f3f0ea;
    border: none; border-radius: 12px;
    font-family: var(--f-body); font-size: 14px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px;
    transition: background .2s, transform .15s, box-shadow .2s;
    letter-spacing: 0.025em;
  }
  .fc-btn-calc:not(:disabled):hover {
    background: #252420;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.16);
  }
  .fc-btn-calc:disabled { background: var(--bar-track); color: var(--text-3); cursor: not-allowed; }
  .fc-btn-calc.secondary {
    background: rgba(0,0,0,0.05); color: var(--text-2); box-shadow: none;
  }
  .fc-btn-calc.secondary:hover { background: rgba(0,0,0,0.09); transform: none; box-shadow: none; }

  .fc-spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(243,240,234,.28);
    border-top-color: #f3f0ea;
    border-radius: 50%;
    animation: spin .65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ══════════════════
     RIGHT COLUMN
  ══════════════════ */
  .fc-right {
    display: flex;
    flex-direction: column;
    padding: 40px 48px;
    gap: 14px;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: inherit;
    border: none;
    outline: none;
  }
  .fc-right::-webkit-scrollbar { width: 3px; }
  .fc-right::-webkit-scrollbar-thumb { background: var(--bar-track); border-radius: 4px; }

  .fc-results-label {
    font-family: var(--f-mono);
    font-size: 10px; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--text-3);
    flex-shrink: 0;
  }

  .fc-r-card {
    width: 100%;
    background: var(--card); /* dynamically inherits if dashboard overrides */
    border-radius: 18px;
    padding: 22px 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    flex-shrink: 0;
    margin: 0;
    border: none;
    outline: none;
  }
  .fc-r-card.light { background: #f2efe9 !important; }

  /* hero */
  .fc-hero-eyebrow {
    font-family: var(--f-mono);
    font-size: 10px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-3);
    margin-bottom: 6px;
  }
  .fc-hero-title {
    font-family: var(--f-serif);
    font-size: clamp(20px, 2.2vw, 28px);
    font-weight: 600; color: var(--text-1); line-height: 1.1;
  }
  .fc-hero-title.empty { color: var(--bar-track); }
  .fc-hero-title em { font-style: italic; color: var(--green); }
  .fc-hero-sub { font-size: 13px; font-weight: 300; color: var(--text-2); margin-top: 6px; font-family: var(--f-body); }
  .fc-hero-sub.empty { color: var(--bar-track); }

  .fc-card-title {
    font-family: var(--f-serif);
    font-size: 18px; font-weight: 600; color: var(--text-1); margin-bottom: 18px;
  }

  /* nutrients */
  .fc-nutrient-list { display: flex; flex-direction: column; gap: 15px; }
  .fc-nutrient-item { display: flex; flex-direction: column; gap: 6px; }
  .fc-nutrient-row  { display: flex; align-items: center; justify-content: space-between; }
  .fc-nutrient-name { font-size: 13px; font-weight: 500; color: var(--text-1); font-family: var(--f-body); }
  .fc-nutrient-val  { font-family: var(--f-mono); font-size: 11.5px; font-weight: 300; color: var(--text-3); }
  .fc-nutrient-val.filled { color: var(--text-2); }

  .fc-status-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 99px;
    font-family: var(--f-mono); font-size: 9px; letter-spacing: 0.07em;
  }
  .fc-status-pill.ok  { background: rgba(61,97,40,0.1);  color: var(--green); }
  .fc-status-pill.low { background: rgba(180,70,50,0.1); color: #a03428; }
  .fc-status-pill.ph  { width: 52px; height: 16px; background: var(--bar-track); opacity: 0.3; }

  .fc-bar-track { height: 5px; background: var(--bar-track); border-radius: 99px; overflow: hidden; }
  .fc-bar-fill  { height: 100%; border-radius: 99px; transition: width 1.1s cubic-bezier(.4,0,.2,1); }
  .fc-bar-fill.n { background: var(--green); }
  .fc-bar-fill.p { background: var(--brown); }
  .fc-bar-fill.k { background: var(--teal);  }

  /* recs */
  .fc-rec-list { display: flex; flex-direction: column; }
  .fc-rec-item {
    display: flex; align-items: flex-start; gap: 13px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(0,0,0,0.07);
  }
  .fc-rec-item:first-child { padding-top: 0; }
  .fc-rec-item:last-child  { border-bottom: none; padding-bottom: 0; }

  .fc-rec-num {
    width: 24px; height: 24px; flex-shrink: 0;
    background: inherit; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--f-mono); font-size: 10.5px; color: var(--text-2);
  }
  .fc-rec-num.ph  { background: var(--bar-track); opacity: 0.3; }
  .fc-rec-text    { font-size: 13px; font-weight: 300; color: var(--text-2); line-height: 1.6; padding-top: 3px; font-family: var(--f-body); }
  .fc-rec-text.ph { color: var(--bar-track); }

  @keyframes up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .a0 { animation: up .35s 0s    ease both; }
  .a1 { animation: up .35s .07s  ease both; }
  .a2 { animation: up .35s .14s  ease both; }

  /* ═══════════════════════════════════════════
     DARK THEME
  ═══════════════════════════════════════════ */
  .dark-theme .fc-shell {
    --card:      #212529;
    --text-1:    #f0f6fc;
    --text-2:    #8b949e;
    --text-3:    #6b7075;
    --green:     #3fb950;
    --green-dim: #56d364;
    --green-l:   rgba(63,185,80,0.10);
    --brown:     #d29922;
    --teal:      #39c5cf;
    --bar-track: #30363d;
    --f-serif:   'Cormorant Garamond', serif;
    --f-body:    'DM Sans', sans-serif;
    --f-mono:    'DM Mono', monospace;
  }

  .dark-theme .fc-left { color: var(--text-1); }

  .dark-theme .fc-page-title { color: var(--text-1); }
  .dark-theme .fc-page-title em { color: var(--green); }
  .dark-theme .fc-page-desc { color: var(--text-2); }
  .dark-theme .fc-brand-name { color: var(--text-2); }

  .dark-theme .fc-form-card {
    background: var(--card);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.3);
  }

  .dark-theme .fc-card-header { border-color: #30363d; }
  .dark-theme .fc-card-header-label { color: var(--text-3); }

  .dark-theme .fc-n-badge.n { background: rgba(63,185,80,0.12); color: var(--green); }
  .dark-theme .fc-n-badge.p { background: rgba(210,153,34,0.12); color: var(--brown); }
  .dark-theme .fc-n-badge.k { background: rgba(57,197,207,0.12); color: var(--teal); }
  .dark-theme .fc-badge-dot { background: currentColor; }

  .dark-theme .fc-field { border-color: #30363d !important; }
  .dark-theme .fc-field:hover { background: rgba(255,255,255,0.03); }
  .dark-theme .fc-field:focus-within { background: rgba(63,185,80,0.06); }
  .dark-theme .fc-field label { color: var(--text-2); }
  .dark-theme .fc-field:focus-within label { color: var(--green); }
  .dark-theme .fc-field-unit { color: var(--text-3); }

  .dark-theme .fc-field input,
  .dark-theme .fc-field select { color: var(--text-1); }
  .dark-theme .fc-field input::placeholder { color: #30363d; }
  .dark-theme .fc-field:focus-within input { color: var(--green-dim); }
  .dark-theme .fc-field:focus-within select { color: var(--green-dim); }

  .dark-theme .fc-field-accent.n { background: var(--green); }
  .dark-theme .fc-field-accent.p { background: var(--brown); }
  .dark-theme .fc-field-accent.k { background: var(--teal); }
  .dark-theme .fc-field-accent.c { background: var(--text-3); }

  .dark-theme .fc-card-footer { border-color: #30363d; }
  .dark-theme .fc-crop-summary { background: var(--green-l); }
  .dark-theme .fc-crop-summary-icon { background: rgba(63,185,80,0.15); }
  .dark-theme .fc-crop-summary-icon svg { stroke: var(--green); }
  .dark-theme .fc-crop-summary-text { color: var(--green); }

  .dark-theme .fc-btn-calc { background: var(--text-1); color: #0d1117; }
  .dark-theme .fc-btn-calc:not(:disabled):hover { background: #c9d1d9; }
  .dark-theme .fc-btn-calc:disabled { background: #30363d; color: var(--text-3); }
  .dark-theme .fc-btn-calc.secondary { background: rgba(255,255,255,0.06); color: var(--text-2); }
  .dark-theme .fc-btn-calc.secondary:hover { background: rgba(255,255,255,0.10); }

  .dark-theme .fc-spinner { border-color: rgba(13,17,23,0.28); border-top-color: #0d1117; }

  .dark-theme .fc-right { color: var(--text-1); }
  .dark-theme .fc-results-label { color: var(--text-3); }

  .dark-theme .fc-r-card,
  .dark-theme .fc-r-card.light {
    background: var(--card) !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  }

  .dark-theme .fc-hero-eyebrow { color: var(--text-3); }
  .dark-theme .fc-hero-title { color: var(--text-1); }
  .dark-theme .fc-hero-title.empty { color: #30363d; }
  .dark-theme .fc-hero-title em { color: var(--green); }
  .dark-theme .fc-hero-sub { color: var(--text-2); }
  .dark-theme .fc-hero-sub.empty { color: #30363d; }

  .dark-theme .fc-card-title { color: var(--text-1); }

  .dark-theme .fc-nutrient-name { color: var(--text-1); }
  .dark-theme .fc-nutrient-val { color: var(--text-3); }
  .dark-theme .fc-nutrient-val.filled { color: var(--text-2); }

  .dark-theme .fc-status-pill.ok  { background: rgba(63,185,80,0.12); color: var(--green); }
  .dark-theme .fc-status-pill.low { background: rgba(248,81,73,0.12); color: #f85149; }
  .dark-theme .fc-status-pill.ph  { background: #30363d; }

  .dark-theme .fc-bar-track { background: #30363d; }
  .dark-theme .fc-bar-fill.n { background: var(--green); }
  .dark-theme .fc-bar-fill.p { background: var(--brown); }
  .dark-theme .fc-bar-fill.k { background: var(--teal); }

  .dark-theme .fc-rec-item { border-color: #30363d; }
  .dark-theme .fc-rec-num { color: var(--text-2); }
  .dark-theme .fc-rec-num.ph { background: #30363d; }
  .dark-theme .fc-rec-text { color: var(--text-2); }
  .dark-theme .fc-rec-text.ph { color: #30363d; }
`;

const CROPS = {
  Rice: { N: 120, P: 60, K: 80 },
  Maize: { N: 125, P: 58, K: 95 },
  Chickpea: { N: 40, P: 60, K: 40 },
  Kidneybeans: { N: 40, P: 60, K: 40 },
  Pigeonpeas: { N: 30, P: 50, K: 30 },
  Mothbeans: { N: 30, P: 50, K: 30 },
  Mungbean: { N: 30, P: 50, K: 30 },
  Blackgram: { N: 30, P: 50, K: 30 },
  Lentil: { N: 30, P: 50, K: 30 },
  Pomegranate: { N: 150, P: 50, K: 150 },
  Banana: { N: 200, P: 100, K: 300 },
  Mango: { N: 100, P: 50, K: 100 },
  Grapes: { N: 150, P: 80, K: 150 },
  Watermelon: { N: 100, P: 50, K: 100 },
  Muskmelon: { N: 100, P: 50, K: 100 },
  Apple: { N: 120, P: 40, K: 120 },
  Orange: { N: 150, P: 50, K: 150 },
  Papaya: { N: 150, P: 100, K: 150 },
  Coconut: { N: 100, P: 50, K: 100 },
  Cotton: { N: 130, P: 65, K: 110 },
  Jute: { N: 80, P: 40, K: 40 },
  Coffee: { N: 150, P: 50, K: 150 },
  Wheat: { N: 110, P: 55, K: 90 },
  Tomato: { N: 150, P: 80, K: 130 },
  Potato: { N: 140, P: 70, K: 120 }
};

const EMPTY_RECS = [
  "Recommendations will appear here",
  "after you calculate the fertilizer plan",
];

function getStatus(soil, req) {
  if (soil >= req) return { label: "Sufficient", cls: "ok" };
  return { label: "Deficient", cls: "low" };
}

export default function FertilizerCalculator() {
  const [form, setForm] = useState({ N: "90", P: "50", K: "40", crop: "Mango" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setResult(null); };

  const calculate = async () => {
    if (!form.N || !form.P || !form.K || !form.crop) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    const req = CROPS[form.crop];
    const soil = { N: parseFloat(form.N) || 0, P: parseFloat(form.P) || 0, K: parseFloat(form.K) || 0 };
    const recs = [];
    if (soil.N < req.N) recs.push(`Apply ${((req.N - soil.N) / 0.46).toFixed(2)} kg/acre of Urea to increase Nitrogen`);
    if (soil.P < req.P) recs.push(`Apply ${((req.P - soil.P) / 0.46).toFixed(2)} kg/acre of DAP to increase Phosphorus`);
    if (soil.K < req.K) recs.push(`Apply ${((req.K - soil.K) / 0.60).toFixed(1)} kg/acre of MOP to increase Potassium`);
    if (!recs.length) recs.push("All nutrients are sufficient — no fertilizer needed.");
    setResult({ crop: form.crop, soil, req, recs });
    setLoading(false);
  };

  const reset = () => setResult(null);
  const has = !!result && !loading;

  const nutrients = has
    ? [
      { key: "n", label: "Nitrogen", cls: "n", soil: result.soil.N, req: result.req.N },
      { key: "p", label: "Phosphorus", cls: "p", soil: result.soil.P, req: result.req.P },
      { key: "k", label: "Potassium", cls: "k", soil: result.soil.K, req: result.req.K },
    ]
    : [
      { key: "n", label: "Nitrogen", cls: "n", soil: 0, req: 0 },
      { key: "p", label: "Phosphorus", cls: "p", soil: 0, req: 0 },
      { key: "k", label: "Potassium", cls: "k", soil: 0, req: 0 },
    ];

  return (
    <>
      <style>{css}</style>
      <div className="fc-shell">
        {/* ══ LEFT ══ */}
        <div className="fc-left">

          <div className="fc-brand">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M14 4C8 4 4 10 4 16c0 4 3 7 7 8" stroke="#3d6128" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M14 4c6 0 10 6 10 12 0 4-3 7-7 8" stroke="#3d6128" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="14" cy="16" r="2.2" fill="#3d6128" />
              <path d="M14 18.2V25" stroke="#3d6128" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="fc-brand-name">AgroVision</span>
          </div>

          <h1 className="fc-page-title">Precision<br /><em>Nutrient</em><br />Planning</h1>
          <p className="fc-page-desc">Compare soil nutrients against crop requirements and get exact fertilizer recommendations.</p>

          {/* FORM CARD */}
          <div className="fc-form-card">

            <div className="fc-card-header">
              <span className="fc-card-header-label">Soil Values</span>
              <div className="fc-badges-row">
                <div className="fc-n-badge n"><span className="fc-badge-dot" />N · {form.N || "—"}</div>
                <div className="fc-n-badge p"><span className="fc-badge-dot" />P · {form.P || "—"}</div>
                <div className="fc-n-badge k"><span className="fc-badge-dot" />K · {form.K || "—"}</div>
              </div>
            </div>

            <div className="fc-fields-stack">
              <div className="fc-field" style={{ borderRight: "1px solid rgba(0,0,0,0.07)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                <label>Soil Nitrogen (N) <span className="fc-field-unit">kg/ha</span></label>
                <input type="number" placeholder="0" value={form.N} onChange={e => set("N", e.target.value)} />
                <span className="fc-field-accent n" />
              </div>
              <div className="fc-field" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                <label>Soil Phosphorus (P) <span className="fc-field-unit">kg/ha</span></label>
                <input type="number" placeholder="0" value={form.P} onChange={e => set("P", e.target.value)} />
                <span className="fc-field-accent p" />
              </div>
              <div className="fc-field" style={{ borderRight: "1px solid rgba(0,0,0,0.07)" }}>
                <label>Soil Potassium (K) <span className="fc-field-unit">kg/ha</span></label>
                <input type="number" placeholder="0" value={form.K} onChange={e => set("K", e.target.value)} />
                <span className="fc-field-accent k" />
              </div>
              <div className="fc-field">
                <label>Target Crop</label>
                <div className="fc-select-wrap">
                  <select value={form.crop} onChange={e => set("crop", e.target.value)}>
                    {Object.keys(CROPS).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <span className="fc-field-accent c" />
              </div>
            </div>

            <div className="fc-card-footer">
              <div className="fc-crop-summary">
                <div className="fc-crop-summary-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 0 1 0 20" /><path d="M12 2C6.5 2 2 6.5 2 12" />
                    <path d="M12 12c0-3 1.5-5 4-6" />
                  </svg>
                </div>
                <div className="fc-crop-summary-text">
                  Target: <strong>{form.crop}</strong> — requires N:{CROPS[form.crop]?.N} · P:{CROPS[form.crop]?.P} · K:{CROPS[form.crop]?.K} kg/ha
                </div>
              </div>

              {has
                ? <button className="fc-btn-calc secondary" onClick={reset}>Calculate Another</button>
                : <button className="fc-btn-calc" onClick={calculate} disabled={loading || !form.N || !form.P || !form.K || !form.crop}>
                  {loading
                    ? <><span className="fc-spinner" />Calculating…</>
                    : <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      Calculate Fertilizer Plan
                    </>
                  }
                </button>
              }
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="fc-right">

          <div className="fc-results-label">Fertilizer Plan</div>

          {/* HERO */}
          <div className={`fc-r-card light${has ? " a0" : ""}`}>
            <div className="fc-hero-eyebrow">{has ? "Analysis Complete" : "Awaiting Input"}</div>
            <div className={`fc-hero-title${has ? "" : " empty"}`}>
              {has ? <>Fertilizer Plan for <em>{result.crop}</em></> : "Fertilizer Plan"}
            </div>
            <div className={`fc-hero-sub${has ? "" : " empty"}`}>
              {has
                ? `${result.recs.length} recommendation${result.recs.length !== 1 ? "s" : ""} generated from your soil data.`
                : "Enter your soil values and target crop to begin."
              }
            </div>
          </div>

          {/* NUTRIENT COMPARISON */}
          <div className={`fc-r-card light${has ? " a1" : ""}`}>
            <div className="fc-card-title">Nutrient Comparison</div>
            <div className="fc-nutrient-list">
              {nutrients.map(n => {
                const pct = has ? Math.min((n.soil / n.req) * 100, 100) : 0;
                const st = has ? getStatus(n.soil, n.req) : null;
                return (
                  <div key={n.key} className="fc-nutrient-item">
                    <div className="fc-nutrient-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="fc-nutrient-name">{n.label}</span>
                        {has
                          ? <span className={`fc-status-pill ${st.cls}`}>{st.label}</span>
                          : <span className="fc-status-pill ph" />
                        }
                      </div>
                      <span className={`fc-nutrient-val${has ? " filled" : ""}`}>
                        {has ? `${n.soil} / ${n.req} kg/ha` : "— / — kg/ha"}
                      </span>
                    </div>
                    <div className="fc-bar-track">
                      <div className={`fc-bar-fill ${n.cls}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className={`fc-r-card light${has ? " a2" : ""}`}>
            <div className="fc-card-title">Recommendations</div>
            <div className="fc-rec-list">
              {has
                ? result.recs.map((r, i) => (
                  <div key={i} className="fc-rec-item">
                    <div className="fc-rec-num">{i + 1}</div>
                    <div className="fc-rec-text">{r}</div>
                  </div>
                ))
                : EMPTY_RECS.map((r, i) => (
                  <div key={i} className="fc-rec-item">
                    <div className="fc-rec-num ph">{i + 1}</div>
                    <div className="fc-rec-text ph">{r}</div>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </>
  );
}