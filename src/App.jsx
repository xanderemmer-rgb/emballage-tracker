import { useState, useRef, useEffect } from "react";

// ─── PRICING ──────────────────────────────────────────────────────────────────
const PRICE_OUTLET = 10;      // € per outlet per maand
const PRICE_MASTER = 15;      // € master admin per maand (verplicht vanaf 2 outlets)
const MASTER_REQUIRED_FROM = 2;

function calcPrice(outlets) {
  const master = outlets >= MASTER_REQUIRED_FROM ? PRICE_MASTER : 0;
  return { outlets: outlets * PRICE_OUTLET, master, total: outlets * PRICE_OUTLET + master };
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const INIT_EMBALLAGE = [
  { name: "Biervat 50L", value: 30 }, { name: "Biervat 30L", value: 20 },
  { name: "Biervat 20L", value: 15 }, { name: "Biervat 10L", value: 10 },
  { name: "Kratje bier 24x", value: 4.5 }, { name: "Kratje bier 12x", value: 2.5 },
  { name: "Flessenrek wijn", value: 8 }, { name: "Postmix bag", value: 5 },
  { name: "CO2 fles", value: 50 }, { name: "Plastic krat", value: 3 },
];
const INIT_SUPPLIERS = ["Heineken", "AB InBev", "Duvel Moortgat", "Coca-Cola", "Karmeliet"];

const INIT_ACCOUNTS = [
  {
    id: "acc_demo1", companyName: "Horeca Groep Demo", email: "demo@horeca.be",
    plan: { outlets: 3, startDate: "2026-01-01", status: "active", nextBilling: "2026-04-01" },
    users: [
      { id: "master", name: "Master Admin", role: "master", password: "master123", branch: null },
      { id: "b1", name: "De Gouden Tap", role: "branch", password: "tap123", branch: "De Gouden Tap" },
      { id: "b2", name: "Café 't Hoekje", role: "branch", password: "hoekje123", branch: "Café 't Hoekje" },
      { id: "b3", name: "Brasserie Zonne", role: "branch", password: "zonne123", branch: "Brasserie Zonne" },
    ],
    emballageTypes: INIT_EMBALLAGE, suppliers: INIT_SUPPLIERS,
    transactions: [
      { id: 1, date: "2026-03-01", type: "IN", supplier: "Heineken", emballage: "Biervat 50L", qty: 5, note: "", attachment: null, branch: "De Gouden Tap" },
      { id: 2, date: "2026-03-02", type: "IN", supplier: "Heineken", emballage: "Kratje bier 24x", qty: 20, note: "", attachment: null, branch: "De Gouden Tap" },
      { id: 3, date: "2026-03-03", type: "OUT", supplier: "Heineken", emballage: "Biervat 50L", qty: 3, note: "", attachment: null, branch: "De Gouden Tap" },
      { id: 4, date: "2026-03-04", type: "IN", supplier: "AB InBev", emballage: "Biervat 50L", qty: 4, note: "", attachment: null, branch: "Café 't Hoekje" },
      { id: 5, date: "2026-03-05", type: "OUT", supplier: "AB InBev", emballage: "Biervat 50L", qty: 1, note: "", attachment: null, branch: "Café 't Hoekje" },
      { id: 6, date: "2026-03-06", type: "IN", supplier: "Coca-Cola", emballage: "Postmix bag", qty: 10, note: "", attachment: null, branch: "Brasserie Zonne" },
      { id: 7, date: "2026-03-07", type: "OUT", supplier: "Heineken", emballage: "Kratje bier 24x", qty: 8, note: "", attachment: null, branch: "Brasserie Zonne" },
    ]
  },
  {
    id: "acc_demo2", companyName: "Café Solo", email: "solo@cafe.be",
    plan: { outlets: 1, startDate: "2026-02-01", status: "active", nextBilling: "2026-04-01" },
    users: [
      { id: "solo1", name: "Café Solo", role: "branch", password: "solo123", branch: "Café Solo" },
    ],
    emballageTypes: INIT_EMBALLAGE, suppliers: INIT_SUPPLIERS, transactions: []
  },
  {
    id: "acc_demo3", companyName: "Bar Expired", email: "expired@bar.be",
    plan: { outlets: 2, startDate: "2026-01-01", status: "expired", nextBilling: "2026-03-01" },
    users: [
      { id: "exp_m", name: "Bar Manager", role: "master", password: "exp123", branch: null },
      { id: "exp_b1", name: "Bar Noord", role: "branch", password: "noord123", branch: "Bar Noord" },
      { id: "exp_b2", name: "Bar Zuid", role: "branch", password: "zuid123", branch: "Bar Zuid" },
    ],
    emballageTypes: INIT_EMBALLAGE, suppliers: INIT_SUPPLIERS, transactions: []
  }
];

// Super admin (platform beheerder)
const SUPER_ADMIN = { id: "superadmin", name: "Super Admin", role: "superadmin", password: "super123" };

const fmt = (v) => `€ ${parseFloat(v || 0).toFixed(2)}`;
const uid = () => Math.random().toString(36).slice(2, 10);

// ─── PRICING CARD ─────────────────────────────────────────────────────────────
function PricingCalc({ outlets, onChange }) {
  const p = calcPrice(outlets);
  return (
    <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Aantal outlets</span>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange(Math.max(1, outlets - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-600 hover:bg-blue-100">−</button>
          <span className="w-6 text-center font-bold text-lg text-blue-700">{outlets}</span>
          <button onClick={() => onChange(outlets + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-600 hover:bg-blue-100">+</button>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600"><span>{outlets}× outlet{outlets > 1 ? "s" : ""} à € {PRICE_OUTLET}/mnd</span><span>€ {p.outlets.toFixed(2)}</span></div>
        {outlets >= MASTER_REQUIRED_FROM && <div className="flex justify-between text-gray-600"><span>Master admin (verplicht)</span><span>€ {PRICE_MASTER.toFixed(2)}</span></div>}
      </div>
      <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
        <span className="font-bold text-gray-800">Totaal per maand</span>
        <span className="text-xl font-bold text-blue-700">€ {p.total.toFixed(2)}</span>
      </div>
      {outlets >= MASTER_REQUIRED_FROM && <p className="text-xs text-blue-600">✓ Master admin inbegrepen — overzicht van alle filialen</p>}
    </div>
  );
}

// ─── REGISTRATION FLOW ────────────────────────────────────────────────────────
function RegisterFlow({ accounts, setAccounts, onDone }) {
  const [step, setStep] = useState(1); // 1: plan, 2: bedrijf, 3: outlets, 4: betaling, 5: bevestiging
  const [outlets, setOutlets] = useState(1);
  const [company, setCompany] = useState({ name: "", email: "", phone: "" });
  const [outletNames, setOutletNames] = useState([""]);
  const [masterPw, setMasterPw] = useState("");
  const [outletPasswords, setOutletPasswords] = useState([""]);
  const [payMethod, setPayMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [newAccId, setNewAccId] = useState(null);
  const p = calcPrice(outlets);

  const updateOutlets = (n) => {
    setOutlets(n);
    setOutletNames(arr => { const a = [...arr]; while (a.length < n) a.push(""); return a.slice(0, n); });
    setOutletPasswords(arr => { const a = [...arr]; while (a.length < n) a.push(""); return a.slice(0, n); });
  };

  const handleRegister = () => {
    setProcessing(true);
    setTimeout(() => {
      const accId = "acc_" + uid();
      const hasMaster = outlets >= MASTER_REQUIRED_FROM;
      const users = [];
      if (hasMaster) users.push({ id: "m_" + uid(), name: company.name + " Admin", role: "master", password: masterPw || "admin123", branch: null });
      outletNames.forEach((name, i) => {
        users.push({ id: "b_" + uid(), name: name || `Outlet ${i + 1}`, role: "branch", password: outletPasswords[i] || "pass123", branch: name || `Outlet ${i + 1}` });
      });
      const newAcc = {
        id: accId, companyName: company.name, email: company.email,
        plan: { outlets, startDate: new Date().toISOString().split("T")[0], status: "active", nextBilling: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] },
        users, emballageTypes: INIT_EMBALLAGE, suppliers: INIT_SUPPLIERS, transactions: []
      };
      setAccounts(a => [...a, newAcc]);
      setNewAccId(accId);
      setProcessing(false);
      setStep(5);
    }, 1800);
  };

  const STEPS = ["Plan", "Bedrijf", "Inloggegevens", "Betaling", "Klaar"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🍺</div>
          <h1 className="text-2xl font-bold text-white">Emballage Tracker</h1>
          <p className="text-blue-200 text-sm">Nieuw abonnement starten</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 < step ? "bg-green-400 text-white" : i + 1 === step ? "bg-white text-blue-600" : "bg-white/20 text-white/60"}`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i + 1 < step ? "bg-green-400" : "bg-white/20"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-2xl space-y-4">
          {/* Step 1: Plan */}
          {step === 1 && (
            <>
              <h2 className="font-bold text-gray-800 text-lg">Kies je plan</h2>
              <PricingCalc outlets={outlets} onChange={updateOutlets} />
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs text-gray-600">
                <p>✓ Onbeperkte transacties</p>
                <p>✓ Bon-scanning met AI</p>
                <p>✓ Excel & PDF export</p>
                <p>✓ Leveranciersbeheer</p>
                {outlets >= MASTER_REQUIRED_FROM && <p>✓ Master admin dashboard</p>}
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600">Verder →</button>
              <button onClick={onDone} className="w-full text-center text-xs text-gray-400 hover:text-gray-600">← Terug naar inloggen</button>
            </>
          )}

          {/* Step 2: Bedrijfsgegevens */}
          {step === 2 && (
            <>
              <h2 className="font-bold text-gray-800 text-lg">Bedrijfsgegevens</h2>
              {[["Bedrijfsnaam", "name", "bijv. Horeca Groep De Smit"], ["E-mailadres", "email", "info@bedrijf.be"], ["Telefoonnummer", "phone", "+32 ..."]].map(([lbl, key, ph]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">{lbl}</label>
                  <input value={company[key]} onChange={e => setCompany(c => ({ ...c, [key]: e.target.value }))} placeholder={ph}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">← Terug</button>
                <button onClick={() => setStep(3)} disabled={!company.name || !company.email}
                  className="flex-[2] py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-40">Verder →</button>
              </div>
            </>
          )}

          {/* Step 3: Inloggegevens */}
          {step === 3 && (
            <>
              <h2 className="font-bold text-gray-800 text-lg">Inloggegevens</h2>
              {outlets >= MASTER_REQUIRED_FROM && (
                <div className="bg-yellow-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-yellow-800">👑 Master admin</p>
                  <input value={masterPw} onChange={e => setMasterPw(e.target.value)} placeholder="Wachtwoord master admin"
                    className="w-full border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              )}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {outletNames.map((name, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-bold text-gray-600">🏪 Outlet {i + 1}</p>
                    <input value={name} onChange={e => setOutletNames(a => { const n = [...a]; n[i] = e.target.value; return n; })} placeholder={`Naam outlet ${i + 1}`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <input value={outletPasswords[i]} onChange={e => setOutletPasswords(a => { const n = [...a]; n[i] = e.target.value; return n; })} placeholder="Wachtwoord"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">← Terug</button>
                <button onClick={() => setStep(4)} className="flex-[2] py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600">Verder →</button>
              </div>
            </>
          )}

          {/* Step 4: Betaling */}
          {step === 4 && (
            <>
              <h2 className="font-bold text-gray-800 text-lg">Betaling</h2>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{outlets}× outlet{outlets > 1 ? "s" : ""}</span><span>€ {(outlets * PRICE_OUTLET).toFixed(2)}/mnd</span></div>
                {outlets >= MASTER_REQUIRED_FROM && <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Master admin</span><span>€ {PRICE_MASTER.toFixed(2)}/mnd</span></div>}
                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold"><span>Totaal</span><span className="text-blue-700">€ {p.total.toFixed(2)}/mnd</span></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">Betaalmethode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["card", "💳", "Kaart"], ["bancontact", "🏦", "Bancontact"], ["sepa", "🔄", "SEPA"]].map(([id, ico, lbl]) => (
                    <button key={id} onClick={() => setPayMethod(id)}
                      className={`py-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium transition-all ${payMethod === id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
                      <span className="text-xl">{ico}</span>{lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex gap-2">
                  <input placeholder="Kaartnummer" className="flex-[3] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <input placeholder="MM/JJ" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                  <input placeholder="CVV" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <input placeholder="Naam kaarthouder" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <p className="text-xs text-gray-400 text-center">🔒 Demo — geen echte betaling</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">← Terug</button>
                <button onClick={handleRegister} disabled={processing}
                  className="flex-[2] py-3.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-60 flex items-center justify-center gap-2">
                  {processing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verwerken...</> : `✓ Betaal € ${p.total.toFixed(2)}/mnd`}
                </button>
              </div>
            </>
          )}

          {/* Step 5: Bevestiging */}
          {step === 5 && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Welkom, {company.name}!</h2>
                <p className="text-sm text-gray-500 mt-1">Je abonnement is actief. Je kan nu inloggen.</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-left space-y-1">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Abonnement</p>
                <p className="text-sm text-gray-700">{outlets} outlet{outlets > 1 ? "s" : ""}{outlets >= MASTER_REQUIRED_FROM ? " + master admin" : ""}</p>
                <p className="text-sm font-bold text-green-600">€ {p.total.toFixed(2)} / maand</p>
              </div>
              <button onClick={onDone} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600">Naar inloggen →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUPER ADMIN PANEL ────────────────────────────────────────────────────────
function SuperAdminPanel({ accounts, setAccounts, onLogout }) {
  const [tab, setTab] = useState("accounts");
  const [editAcc, setEditAcc] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showNewAcc, setShowNewAcc] = useState(false);

  const totalMRR = accounts.filter(a => a.plan.status === "active").reduce((sum, a) => sum + calcPrice(a.plan.outlets).total, 0);
  const activeCount = accounts.filter(a => a.plan.status === "active").length;

  const toggleStatus = (id) => setAccounts(a => a.map(x => x.id === id ? { ...x, plan: { ...x.plan, status: x.plan.status === "active" ? "suspended" : "active" } } : x));
  const deleteAcc = (id) => { setAccounts(a => a.filter(x => x.id !== id)); setConfirm(null); };
  const changeOutlets = (id, n) => {
    if (n < 1) return;
    setAccounts(a => a.map(x => {
      if (x.id !== id) return x;
      const hasMaster = n >= MASTER_REQUIRED_FROM;
      let users = x.users.filter(u => u.role === "branch").slice(0, n);
      while (users.length < n) users.push({ id: "b_" + uid(), name: `Outlet ${users.length + 1}`, role: "branch", password: "pass123", branch: `Outlet ${users.length + 1}` });
      if (hasMaster && !x.users.find(u => u.role === "master")) users = [{ id: "m_" + uid(), name: x.companyName + " Admin", role: "master", password: "admin123", branch: null }, ...users];
      if (!hasMaster) users = users.filter(u => u.role !== "master");
      return { ...x, plan: { ...x.plan, outlets: n }, users };
    }));
  };

  const STATUS_COLOR = { active: "bg-green-100 text-green-700", expired: "bg-red-100 text-red-700", suspended: "bg-orange-100 text-orange-700" };
  const STATUS_LABEL = { active: "Actief", expired: "Verlopen", suspended: "Geblokkeerd" };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md mx-auto">
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl space-y-4">
            <p className="font-bold text-gray-800">Account verwijderen?</p>
            <p className="text-sm text-gray-600">Verwijder <span className="font-semibold">"{confirm.name}"</span> inclusief alle data. Onomkeerbaar.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">Annuleren</button>
              <button onClick={() => deleteAcc(confirm.id)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm">Verwijderen</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 pt-7 pb-5">
        <div className="flex items-center justify-between">
          <div><p className="text-xs text-gray-400 uppercase tracking-wide">Platform beheer</p><h1 className="text-xl font-bold">⚙️ Super Admin</h1></div>
          <button onClick={onLogout} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">Uitloggen</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{accounts.length}</p><p className="text-xs text-gray-300">Accounts</p></div>
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-gray-300">Actief</p></div>
          <div className="bg-green-500/30 rounded-xl p-3 text-center"><p className="text-xl font-bold">€{totalMRR.toFixed(0)}</p><p className="text-xs text-gray-300">MRR</p></div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-2 flex">
        {[["accounts", "📋", "Accounts"], ["stats", "📊", "Statistieken"]].map(([id, ico, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-0.5 ${tab === id ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-400"}`}>
            <span>{ico}</span><span>{lbl}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {tab === "accounts" && (
          <>
            <button onClick={() => setShowNewAcc(true)} className="w-full py-3 rounded-2xl bg-gray-800 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-700">
              ➕ Nieuw account aanmaken
            </button>
            {showNewAcc && <NewAccountForm onSave={(acc) => { setAccounts(a => [...a, acc]); setShowNewAcc(false); }} onCancel={() => setShowNewAcc(false)} />}
            {accounts.map(acc => {
              const p = calcPrice(acc.plan.outlets);
              const isEditing = editAcc === acc.id;
              return (
                <div key={acc.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800">{acc.companyName}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[acc.plan.status]}`}>{STATUS_LABEL[acc.plan.status]}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{acc.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{acc.plan.outlets} outlet{acc.plan.outlets > 1 ? "s" : ""} · {acc.transactions.length} transacties</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-green-600">€ {p.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">/maand</p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Aantal outlets</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => changeOutlets(acc.id, acc.plan.outlets - 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-sm">−</button>
                            <span className="w-5 text-center font-bold">{acc.plan.outlets}</span>
                            <button onClick={() => changeOutlets(acc.id, acc.plan.outlets + 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-sm">+</button>
                          </div>
                        </div>
                        <PricingCalc outlets={acc.plan.outlets} onChange={(n) => changeOutlets(acc.id, n)} />
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Gebruikers</p>
                          {acc.users.map(u => (
                            <div key={u.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 text-xs">
                              <span>{u.role === "master" ? "👑" : "🏪"}</span>
                              <span className="flex-1 font-medium text-gray-700">{u.name}</span>
                              <span className="font-mono text-gray-400">{u.password}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setEditAcc(isEditing ? null : acc.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold ${isEditing ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {isEditing ? "✓ Sluiten" : "✏️ Beheren"}
                      </button>
                      <button onClick={() => toggleStatus(acc.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold ${acc.plan.status === "active" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}>
                        {acc.plan.status === "active" ? "⏸ Blokkeren" : "▶ Activeren"}
                      </button>
                      <button onClick={() => setConfirm({ id: acc.id, name: acc.companyName })}
                        className="px-3 py-2 rounded-xl bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200">🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === "stats" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3">💰 Omzet overzicht</h3>
              {accounts.map(acc => {
                const p = calcPrice(acc.plan.outlets);
                return (
                  <div key={acc.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div><p className="text-sm font-medium text-gray-700">{acc.companyName}</p>
                      <p className="text-xs text-gray-400">{acc.plan.outlets} outlet{acc.plan.outlets > 1 ? "s" : ""} · {STATUS_LABEL[acc.plan.status]}</p></div>
                    <p className={`font-bold text-sm ${acc.plan.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                      {acc.plan.status === "active" ? `€ ${p.total.toFixed(2)}` : "—"}</p>
                  </div>
                );
              })}
              <div className="border-t-2 border-gray-200 pt-3 mt-1 flex justify-between items-center">
                <span className="font-bold text-gray-800">Totaal MRR</span>
                <span className="text-xl font-bold text-green-600">€ {totalMRR.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Jaarlijks: € {(totalMRR * 12).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3">📊 Accounts per type</h3>
              {[["Actief", "active", "bg-green-100 text-green-700"], ["Verlopen", "expired", "bg-red-100 text-red-700"], ["Geblokkeerd", "suspended", "bg-orange-100 text-orange-700"]].map(([lbl, status, cls]) => (
                <div key={status} className="flex items-center justify-between py-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${cls}`}>{lbl}</span>
                  <span className="font-bold text-gray-700">{accounts.filter(a => a.plan.status === status).length}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3">🏪 Outlets verdeling</h3>
              {[1, 2, 3, 5].map(n => {
                const cnt = accounts.filter(a => a.plan.outlets === n).length;
                const cntPlus = n === 5 ? accounts.filter(a => a.plan.outlets >= 5).length : cnt;
                if (n === 5 && cntPlus === 0) return null;
                return (
                  <div key={n} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs text-gray-500 w-20">{n === 5 ? "5+" : n} outlet{n > 1 ? "s" : ""}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(cntPlus / Math.max(accounts.length, 1)) * 100}%` }} /></div>
                    <span className="text-xs font-bold text-gray-600 w-4">{cntPlus}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewAccountForm({ onSave, onCancel }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [outlets, setOutlets] = useState(1); const [pw, setPw] = useState("");
  const save = () => {
    if (!name || !email) return;
    const hasMaster = outlets >= MASTER_REQUIRED_FROM;
    const users = [];
    if (hasMaster) users.push({ id: "m_" + uid(), name: name + " Admin", role: "master", password: pw || "admin123", branch: null });
    for (let i = 0; i < outlets; i++) users.push({ id: "b_" + uid(), name: `Outlet ${i + 1}`, role: "branch", password: "pass123", branch: `Outlet ${i + 1}` });
    onSave({ id: "acc_" + uid(), companyName: name, email, plan: { outlets, startDate: new Date().toISOString().split("T")[0], status: "active", nextBilling: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] }, users, emballageTypes: INIT_EMBALLAGE, suppliers: INIT_SUPPLIERS, transactions: [] });
  };
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3">
      <p className="font-bold text-gray-700 text-sm">Nieuw account</p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Bedrijfsnaam" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
      <input value={pw} onChange={e => setPw(e.target.value)} placeholder="Master wachtwoord (bij 2+ outlets)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
      <PricingCalc outlets={outlets} onChange={setOutlets} />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm">Annuleren</button>
        <button onClick={save} disabled={!name || !email} className="flex-[2] py-2.5 rounded-xl bg-gray-800 text-white font-bold text-sm disabled:opacity-40">Aanmaken</button>
      </div>
    </div>
  );
}

// ─── EXPORT UTILS ────────────────────────────────────────────────────────────
function exportToCSV(transactions, emballageTypes) {
  const getVal = (n) => emballageTypes.find(e => e.name === n)?.value || 0;
  const headers = ["Datum", "Filiaal", "Type", "Leverancier", "Emballage", "Aantal", "Stukwaarde (€)", "Totaalwaarde (€)", "Opmerking"];
  const rows = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => {
    const v = getVal(t.emballage), tot = (t.type === "IN" ? 1 : -1) * t.qty * v;
    return [t.date, t.branch, t.type === "IN" ? "Inkomend" : "Uitgaand", t.supplier, t.emballage, t.qty, v.toFixed(2), tot.toFixed(2), t.note || ""];
  });
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })); a.download = "emballage_export.csv"; a.click();
}

function exportToPDF(transactions, emballageTypes, users, suppliers, companyName) {
  const getVal = (n) => emballageTypes.find(e => e.name === n)?.value || 0;
  const branches = users.filter(u => u.role === "branch").map(u => u.branch);
  const now = new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" });
  const branchSummary = branches.map(b => {
    const tx = transactions.filter(t => t.branch === b);
    const balances = {};
    tx.forEach(t => { balances[t.emballage] = (balances[t.emballage] || 0) + (t.type === "IN" ? t.qty : -t.qty); });
    return { b, balances, totalVal: Object.entries(balances).reduce((a, [emb, qty]) => a + qty * getVal(emb), 0), totalQty: Object.values(balances).reduce((a, v) => a + v, 0), txCount: tx.length };
  });
  const grandTotal = branchSummary.reduce((a, s) => a + s.totalVal, 0);
  const embTotals = {};
  transactions.forEach(t => { embTotals[t.emballage] = (embTotals[t.emballage] || 0) + (t.type === "IN" ? t.qty : -t.qty); });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Emballage Export</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#222;padding:20px}h1{font-size:20px;color:#1d4ed8;margin-bottom:4px}.sub{color:#6b7280;font-size:11px;margin-bottom:20px}h2{font-size:14px;color:#1e40af;margin:18px 0 8px;border-bottom:2px solid #dbeafe;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#1d4ed8;color:white;padding:6px 8px;text-align:left;font-size:10px}td{padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#f9fafb}.gi{color:#15803d;font-weight:bold}.go{color:#c2410c;font-weight:bold}.grand{background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:white;border-radius:8px;padding:12px 16px;margin-bottom:16px}.grand .val{font-size:26px;font-weight:bold}.grand .lbl{font-size:10px;opacity:.8}.bh{background:#f0f9ff;border-left:4px solid #1d4ed8;padding:8px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}.bh .nm{font-weight:bold;font-size:13px}.bh .tt{text-align:right;font-size:11px}</style></head><body>
  <h1>🍺 ${companyName} — Emballage Export</h1>
  <div class="sub">Gegenereerd op ${now} · ${transactions.length} transacties · ${branches.length} filialen</div>
  <div class="grand"><div class="lbl">TOTAAL SALDO</div><div class="val">€ ${grandTotal.toFixed(2)}</div><div class="lbl">${branchSummary.reduce((a, s) => a + s.totalQty, 0)} stuks</div></div>
  <h2>📦 Per emballagetype</h2>
  <table><thead><tr><th>Type</th><th>Stukwaarde</th><th>Saldo stuks</th><th>Saldo waarde</th></tr></thead><tbody>
  ${Object.entries(embTotals).map(([emb, qty]) => { const v = qty * getVal(emb); return `<tr><td>${emb}</td><td>€ ${getVal(emb).toFixed(2)}</td><td class="${qty >= 0 ? "gi" : "go"}">${qty >= 0 ? "+" : ""}${qty}</td><td class="${v >= 0 ? "gi" : "go"}">${v >= 0 ? "+" : ""}€ ${v.toFixed(2)}</td></tr>`; }).join("")}
  </tbody></table>
  <h2>🏪 Per filiaal</h2>
  ${branchSummary.map(s => `<div class="bh"><div class="nm">🏪 ${s.b}</div><div class="tt"><strong class="${s.totalVal >= 0 ? "gi" : "go"}">€ ${s.totalVal.toFixed(2)}</strong><br><span style="color:#6b7280">${s.totalQty} st · ${s.txCount} tx</span></div></div>
  <table><thead><tr><th>Type</th><th>Saldo</th><th>Waarde</th></tr></thead><tbody>${Object.entries(s.balances).map(([emb, qty]) => { const v = qty * getVal(emb); return `<tr><td>${emb}</td><td class="${qty >= 0 ? "gi" : "go"}">${qty >= 0 ? "+" : ""}${qty} st</td><td class="${v >= 0 ? "gi" : "go"}">${v >= 0 ? "+" : ""}€ ${v.toFixed(2)}</td></tr>`; }).join("")}</tbody></table>`).join("")}
  <h2>📋 Transacties</h2>
  <table><thead><tr><th>Datum</th><th>Filiaal</th><th>Type</th><th>Leverancier</th><th>Emballage</th><th>Aantal</th><th>Waarde</th><th>Opmerking</th></tr></thead><tbody>
  ${[...transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => { const v = (t.type === "IN" ? 1 : -1) * t.qty * getVal(t.emballage); return `<tr><td>${t.date}</td><td>${t.branch}</td><td class="${t.type === "IN" ? "gi" : "go"}">${t.type === "IN" ? "IN" : "UIT"}</td><td>${t.supplier}</td><td>${t.emballage}</td><td style="text-align:center">${t.qty}</td><td class="${v >= 0 ? "gi" : "go"}">${v >= 0 ? "+" : ""}€ ${v.toFixed(2)}</td><td style="color:#6b7280">${t.note || ""}</td></tr>`; }).join("")}
  </tbody></table></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `emballage_export_${companyName.replace(/\s+/g, "_")}.html`; a.click(); URL.revokeObjectURL(a.href);
}

function ExportModal({ account, onClose }) {
  const [fb, setFb] = useState("Alle"); const [df, setDf] = useState(""); const [dt, setDt] = useState(""); const [exp, setExp] = useState(null);
  const branches = account.users.filter(u => u.role === "branch").map(u => u.branch);
  const filtered = account.transactions.filter(t => (fb === "Alle" || t.branch === fb) && (!df || t.date >= df) && (!dt || t.date <= dt));
  const getVal = (n) => account.emballageTypes.find(e => e.name === n)?.value || 0;
  const totalVal = filtered.reduce((a, t) => a + (t.type === "IN" ? 1 : -1) * t.qty * getVal(t.emballage), 0);
  const doExport = (type) => {
    setExp(type);
    setTimeout(() => {
      if (type === "csv") exportToCSV(filtered, account.emballageTypes);
      else exportToPDF(filtered, account.emballageTypes, account.users, account.suppliers, account.companyName);
      setExp(null);
    }, 300);
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-bold">📤 Exporteren</h2><p className="text-xs text-gray-400">Filters instellen en formaat kiezen</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">×</button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Filiaal</label>
            <select value={fb} onChange={e => setFb(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Alle</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Datum van</label>
              <input type="date" value={df} onChange={e => setDf(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
            <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Datum tot</label>
              <input type="date" value={dt} onChange={e => setDt(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          </div>
        </div>
        <div className={`rounded-2xl px-4 py-3 flex justify-between ${totalVal >= 0 ? "bg-green-50" : "bg-red-50"}`}>
          <div><p className="text-xs text-gray-500">Geselecteerd</p><p className="font-bold text-gray-800">{filtered.length} transacties</p></div>
          <div className="text-right"><p className="text-xs text-gray-500">Saldo</p><p className={`font-bold text-lg ${totalVal >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(totalVal)}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => doExport("csv")} disabled={!!exp || filtered.length === 0}
            className="py-4 rounded-2xl bg-green-500 text-white font-bold flex flex-col items-center gap-1 hover:bg-green-600 disabled:opacity-40">
            {exp === "csv" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-2xl">📊</span>}
            <span className="text-sm">Excel / CSV</span>
          </button>
          <button onClick={() => doExport("pdf")} disabled={!!exp || filtered.length === 0}
            className="py-4 rounded-2xl bg-red-500 text-white font-bold flex flex-col items-center gap-1 hover:bg-red-600 disabled:opacity-40">
            {exp === "pdf" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-2xl">📄</span>}
            <span className="text-sm">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BON SCAN MODAL ───────────────────────────────────────────────────────────
function BonScanModal({ emballageTypes, suppliers, branch, onClose, onImport }) {
  const [step, setStep] = useState("upload"); const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); const [previewType, setPreviewType] = useState("image");
  const [rawFile, setRawFile] = useState(null); const [parsed, setParsed] = useState(null); const [editLines, setEditLines] = useState([]);
  const fileRef = useRef();
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [needsKey, setNeedsKey] = useState(false);

  const scanBon = async (base64, mediaType) => {
    const key = getApiKey();
    if (!key) { setNeedsKey(true); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: [mediaType === "application/pdf" ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } } : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }, { type: "text", text: `Analyseer deze emballagebon. Types: ${emballageTypes.map(e => e.name).join(", ")}. Leveranciers: ${suppliers.join(", ")}. Geef ALLEEN JSON: {"supplier":null,"date":null,"type":"IN","bonNummer":null,"lines":[{"description":"","qty":1,"matchedType":null,"unitValue":null}]}` }] }] })
      });
      if (!res.ok) { const err = await res.text(); throw new Error(err); }
      const d = await res.json(); const txt = d.content?.find(b => b.type === "text")?.text || "{}";
      const result = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setParsed(result);
      setEditLines((result.lines || []).map((l, i) => ({ ...l, id: i, emballage: l.matchedType || l.description || "", qty: l.qty || 1, unitValue: l.unitValue || emballageTypes.find(e => e.name === l.matchedType)?.value || 0, include: true })));
      setStep("reviewing");
    } catch (e) { alert("Verwerking mislukt: " + (e.message || "onbekende fout")); } setLoading(false);
  };
  const handleFile = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const dataUrl = ev.target.result, base64 = dataUrl.split(",")[1]; setRawFile({ base64, mediaType: file.type, name: file.name, dataUrl }); setPreview(file.type === "application/pdf" ? null : dataUrl); setPreviewType(file.type === "application/pdf" ? "pdf" : "image"); scanBon(base64, file.type); }; reader.readAsDataURL(file); };
  const upd = (id, f, v) => setEditLines(ls => ls.map(l => l.id === id ? { ...l, [f]: v } : l));
  const totalVal = editLines.filter(l => l.include).reduce((a, l) => a + (l.qty || 0) * (l.unitValue || 0), 0);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b flex-shrink-0"><div><h2 className="text-lg font-bold">🧾 Bon inscannen</h2><p className="text-xs text-gray-400">{branch}</p></div><button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">×</button></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {needsKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-yellow-800">🔑 API Key vereist</p>
              <p className="text-xs text-yellow-700">Voor AI bonscan heb je een Anthropic API key nodig. Deze wordt lokaal opgeslagen in je browser.</p>
              <input value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} placeholder="sk-ant-..." className="w-full border border-yellow-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <button onClick={() => { if (apiKeyInput.trim()) { setApiKey(apiKeyInput.trim()); setNeedsKey(false); } }} disabled={!apiKeyInput.trim()} className="w-full py-2.5 bg-yellow-500 text-white rounded-xl font-bold text-sm disabled:opacity-40">Opslaan & doorgaan</button>
            </div>
          )}
          {step === "upload" && !loading && !needsKey && (<button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-blue-300 rounded-2xl p-8 flex flex-col items-center gap-3 hover:bg-blue-50"><span className="text-5xl">📄</span><p className="font-semibold text-blue-600">Klik om bon te uploaden</p><p className="text-xs text-gray-400">Foto of PDF</p></button>)}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
          {loading && (<div className="flex flex-col items-center py-10 gap-3">{previewType === "image" && preview && <img src={preview} alt="" className="w-40 h-48 object-cover rounded-xl shadow" />}{previewType === "pdf" && <div className="w-40 h-48 bg-red-50 rounded-xl flex items-center justify-center text-5xl">📑</div>}<div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><p className="font-medium text-gray-600">AI leest bon uit...</p></div></div>)}
          {step === "reviewing" && parsed && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl p-4"><p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Gedetecteerd</p><div className="grid grid-cols-2 gap-2 text-sm"><div><p className="text-xs text-gray-500">Leverancier</p><p className="font-semibold">{parsed.supplier || "Onbekend"}</p></div><div><p className="text-xs text-gray-500">Datum</p><p className="font-semibold">{parsed.date || "Vandaag"}</p></div></div></div>
              {previewType === "image" && preview && <div className="relative"><img src={preview} alt="" className="w-full max-h-36 object-cover rounded-xl" /><p className="absolute bottom-2 left-3 text-white text-xs bg-black/40 px-2 py-0.5 rounded-full">📎 Bijlage meegestuurd</p></div>}
              <div className="space-y-3">{editLines.map(l => (<div key={l.id} className={`rounded-2xl border p-3 ${l.include ? "border-blue-200" : "border-gray-100 opacity-50"}`}><div className="flex items-start gap-2 mb-2"><button onClick={() => upd(l.id, "include", !l.include)} className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold border-2 ${l.include ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300"}`}>{l.include ? "✓" : ""}</button><p className="text-xs text-gray-400 truncate">"{l.description}"</p></div>{l.include && (<div className="grid grid-cols-2 gap-2 ml-7"><div><p className="text-xs text-gray-500 mb-1">Type</p><select value={l.emballage} onChange={e => upd(l.id, "emballage", e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"><option value="">-- kies --</option>{emballageTypes.map(e => <option key={e.name}>{e.name}</option>)}</select></div><div><p className="text-xs text-gray-500 mb-1">Aantal</p><input type="number" value={l.qty} onChange={e => upd(l.id, "qty", parseInt(e.target.value) || 1)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center font-bold" /></div><div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Stukwaarde (€)</p><input type="number" step="0.01" value={l.unitValue} onChange={e => upd(l.id, "unitValue", parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" /></div></div>)}</div>))}</div>
              {totalVal > 0 && <div className="bg-green-50 rounded-xl px-4 py-3 flex justify-between"><span className="text-sm font-medium text-gray-700">Totale waarde</span><span className="font-bold text-green-600">{fmt(totalVal)}</span></div>}
            </div>
          )}
        </div>
        {step === "reviewing" && !loading && (<div className="p-4 border-t flex gap-3 flex-shrink-0"><button onClick={() => { setStep("upload"); setParsed(null); setEditLines([]); setPreview(null); setRawFile(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">Opnieuw</button><button onClick={() => { const att = rawFile ? { name: rawFile.name, dataUrl: rawFile.dataUrl, mediaType: rawFile.mediaType } : null; onImport(editLines.filter(l => l.include && l.emballage && l.qty > 0).map(l => ({ id: Date.now() + l.id, date: parsed?.date || new Date().toISOString().split("T")[0], type: parsed?.type || "IN", supplier: parsed?.supplier || suppliers[0], emballage: l.emballage, qty: parseInt(l.qty), note: parsed?.bonNummer ? `Bon #${parsed.bonNummer}` : "", attachment: att, branch }))); onClose(); }} disabled={editLines.filter(l => l.include).length === 0} className="flex-[2] py-3 rounded-xl bg-blue-500 text-white font-bold text-sm disabled:opacity-40">✅ Importeer {editLines.filter(l => l.include).length} regel(s)</button></div>)}
      </div>
    </div>
  );
}

function AttViewer({ att, onClose }) {
  return (<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"><div className="flex justify-between items-center px-4 py-3 border-b"><p className="font-semibold text-sm truncate">📎 {att.name}</p><button onClick={onClose} className="text-gray-400 text-xl">×</button></div>{att.mediaType === "application/pdf" ? <div className="p-6 text-center"><span className="text-6xl">📑</span><br /><a href={att.dataUrl} download={att.name} className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">⬇️ Download</a></div> : <img src={att.dataUrl} alt="" className="w-full max-h-96 object-contain" />}</div></div>);
}

// ─── MASTER DASHBOARD ─────────────────────────────────────────────────────────
function MasterDashboard({ account }) {
  const { transactions, emballageTypes, users } = account;
  const [sel, setSel] = useState("Alle filialen");
  const branches = users.filter(u => u.role === "branch").map(u => u.branch);
  const getVal = (n) => emballageTypes.find(e => e.name === n)?.value || 0;
  const branchStats = branches.map(b => { const tx = transactions.filter(t => t.branch === b); const bv = tx.reduce((a, t) => a + (t.type === "IN" ? 1 : -1) * t.qty * getVal(t.emballage), 0); const bq = tx.reduce((a, t) => a + (t.type === "IN" ? 1 : -1) * t.qty, 0); return { b, balVal: bv, balQty: bq, txCount: tx.length, last: [...tx].sort((a, x) => x.date.localeCompare(a.date))[0]?.date || "-" }; });
  const txF = sel === "Alle filialen" ? transactions : transactions.filter(t => t.branch === sel);
  const totals = {}; txF.forEach(t => { totals[t.emballage] = (totals[t.emballage] || 0) + (t.type === "IN" ? t.qty : -t.qty); });
  const grandVal = txF.reduce((a, t) => a + (t.type === "IN" ? 1 : -1) * t.qty * getVal(t.emballage), 0);
  const grandQty = txF.reduce((a, t) => a + (t.type === "IN" ? 1 : -1) * t.qty, 0);
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-80 uppercase tracking-wide">Totaal alle filialen</p>
        <p className="text-4xl font-bold mt-1">{fmt(branchStats.reduce((a, s) => a + s.balVal, 0))}</p>
        <p className="text-sm opacity-80">{branchStats.reduce((a, s) => a + s.balQty, 0)} stuks · {transactions.length} tx · {branches.length} filialen</p>
      </div>
      <div className="space-y-3">
        {branchStats.map(s => (
          <button key={s.b} onClick={() => setSel(x => x === s.b ? "Alle filialen" : s.b)}
            className={`w-full rounded-2xl p-4 text-left border-2 transition-all ${sel === s.b ? "border-orange-400 bg-orange-50" : "border-transparent bg-white shadow-sm"}`}>
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🏪</div><div><p className="font-bold text-gray-800 text-sm">{s.b}</p><p className="text-xs text-gray-400">{s.txCount} transacties · {s.last}</p></div></div><div className="text-right"><p className={`font-bold text-sm ${s.balVal >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(s.balVal)}</p><p className={`text-xs ${s.balQty >= 0 ? "text-green-400" : "text-red-400"}`}>{s.balQty >= 0 ? "+" : ""}{s.balQty} st</p></div></div>
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3"><p className="font-bold text-gray-800 text-sm">📦 {sel}</p><div className="text-right"><p className={`font-bold text-sm ${grandVal >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(grandVal)}</p><p className="text-xs text-gray-400">{grandQty} st</p></div></div>
        {Object.entries(totals).map(([emb, qty]) => { const val = qty * getVal(emb), pct = grandQty > 0 ? Math.abs(qty / grandQty) * 100 : 0; return (<div key={emb} className="mb-2"><div className="flex justify-between mb-1"><span className="text-xs text-gray-700">{emb}</span><div><span className={`text-xs font-bold ${qty > 0 ? "text-green-600" : "text-red-600"}`}>{qty > 0 ? "+" : ""}{qty} st</span><span className={`text-xs ml-2 ${val > 0 ? "text-green-400" : "text-red-400"}`}>{fmt(val)}</span></div></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${qty > 0 ? "bg-green-400" : "bg-red-400"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div></div>); })}
      </div>
    </div>
  );
}

// ─── MASTER BEHEER ────────────────────────────────────────────────────────────
function MasterBeheer({ account, setAccount }) {
  const { users, emballageTypes, suppliers, transactions } = account;
  const [section, setSection] = useState("filialen");
  const [newBranch, setNewBranch] = useState({ name: "", password: "" });
  const [newEmb, setNewEmb] = useState({ name: "", value: "" });
  const [newSup, setNewSup] = useState("");
  const [editEmb, setEditEmb] = useState(null); const [editEmbVal, setEditEmbVal] = useState("");
  const [editUser, setEditUser] = useState(null); const [editUserPw, setEditUserPw] = useState("");
  const [confirm, setConfirm] = useState(null);

  const upd = (key, val) => setAccount(a => ({ ...a, [key]: val }));
  const branches = users.filter(u => u.role === "branch");

  const addBranch = () => {
    if (!newBranch.name.trim() || users.find(u => u.name === newBranch.name.trim())) return;
    upd("users", [...users, { id: "b_" + uid(), name: newBranch.name.trim(), role: "branch", password: newBranch.password.trim() || "pass123", branch: newBranch.name.trim() }]);
    setNewBranch({ name: "", password: "" });
  };
  const deleteBranch = (id) => {
    const branch = users.find(u => u.id === id)?.branch;
    upd("users", users.filter(u => u.id !== id));
    if (branch) upd("transactions", transactions.filter(t => t.branch !== branch));
    setConfirm(null);
  };
  const addEmb = () => { if (!newEmb.name.trim() || emballageTypes.find(e => e.name === newEmb.name.trim())) return; upd("emballageTypes", [...emballageTypes, { name: newEmb.name.trim(), value: parseFloat(newEmb.value) || 0 }]); setNewEmb({ name: "", value: "" }); };
  const addSup = () => { if (!newSup.trim() || suppliers.includes(newSup.trim())) return; upd("suppliers", [...suppliers, newSup.trim()]); setNewSup(""); };

  const SECTIONS = [{ id: "filialen", l: "Filialen", i: "🏪" }, { id: "emballage", l: "Emballage", i: "📦" }, { id: "leveranciers", l: "Leveranciers", i: "🚚" }];
  return (
    <div className="space-y-4">
      {confirm && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6"><div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl space-y-4"><p className="font-bold">Verwijderen?</p><p className="text-sm text-gray-600">Weet je zeker dat je <strong>"{confirm.label}"</strong> wilt verwijderen?</p><div className="flex gap-3"><button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm">Annuleren</button><button onClick={() => confirm.fn()} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm">Verwijderen</button></div></div></div>)}
      <div className="grid grid-cols-3 gap-2">
        {SECTIONS.map(s => (<button key={s.id} onClick={() => setSection(s.id)} className={`py-3 rounded-2xl font-semibold text-xs flex flex-col items-center gap-1 ${section === s.id ? "bg-orange-500 text-white shadow" : "bg-white text-gray-600 border border-gray-100"}`}><span className="text-xl">{s.i}</span>{s.l}</button>))}
      </div>
      {section === "filialen" && (<div className="space-y-3">
        {branches.map(u => (<div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">🏪</div><div className="flex-1 min-w-0"><p className="font-bold text-gray-800 text-sm">{u.name}</p><p className="text-xs text-gray-400">{transactions.filter(t => t.branch === u.branch).length} transacties</p>{editUser === u.id ? (<div className="flex gap-2 mt-2"><input value={editUserPw} onChange={e => setEditUserPw(e.target.value)} placeholder="Nieuw wachtwoord..." className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /><button onClick={() => { upd("users", users.map(x => x.id === u.id ? { ...x, password: editUserPw } : x)); setEditUser(null); }} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs">OK</button><button onClick={() => setEditUser(null)} className="px-2 py-1 bg-gray-100 rounded-lg text-xs">✕</button></div>) : (<p className="text-xs text-gray-400 mt-0.5 font-mono">{u.password}</p>)}</div><div className="flex gap-1"><button onClick={() => { setEditUser(u.id); setEditUserPw(u.password); }} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-blue-100">✏️</button><button onClick={() => setConfirm({ label: u.name, fn: () => deleteBranch(u.id) })} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm hover:bg-red-100">🗑️</button></div></div></div>))}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"><p className="text-sm font-bold text-gray-700">➕ Nieuw filiaal</p><input value={newBranch.name} onChange={e => setNewBranch(b => ({ ...b, name: e.target.value }))} placeholder="Naam filiaal" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /><input value={newBranch.password} onChange={e => setNewBranch(b => ({ ...b, password: e.target.value }))} placeholder="Wachtwoord" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /><button onClick={addBranch} disabled={!newBranch.name.trim()} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm disabled:opacity-40">Filiaal aanmaken</button></div>
      </div>)}
      {section === "emballage" && (<div className="space-y-3"><div className="bg-white rounded-2xl border border-gray-100 p-4"><p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Emballagetypes</p><div className="space-y-2">{emballageTypes.map(e => (<div key={e.name} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0"><span className="flex-1 text-sm text-gray-700">{e.name}</span>{editEmb === e.name ? (<div className="flex items-center gap-1"><span className="text-xs text-gray-400">€</span><input autoFocus type="number" value={editEmbVal} onChange={ev => setEditEmbVal(ev.target.value)} onBlur={() => { upd("emballageTypes", emballageTypes.map(x => x.name === e.name ? { ...x, value: parseFloat(editEmbVal) || 0 } : x)); setEditEmb(null); }} onKeyDown={ev => { if (ev.key === "Enter") { upd("emballageTypes", emballageTypes.map(x => x.name === e.name ? { ...x, value: parseFloat(editEmbVal) || 0 } : x)); setEditEmb(null); } }} className="w-20 text-right border border-blue-300 rounded-lg px-2 py-1 text-xs" /></div>) : (<button onClick={() => { setEditEmb(e.name); setEditEmbVal(e.value.toString()); }} className="text-xs font-medium text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50">{fmt(e.value)} ✏️</button>)}<button onClick={() => setConfirm({ label: e.name, fn: () => { upd("emballageTypes", emballageTypes.filter(x => x.name !== e.name)); setConfirm(null); } })} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs hover:bg-red-100">🗑️</button></div>))}</div></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"><p className="text-sm font-bold text-gray-700">➕ Nieuw type</p><input value={newEmb.name} onChange={e => setNewEmb(n => ({ ...n, name: e.target.value }))} placeholder="Naam" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /><div className="flex items-center gap-2"><span className="text-sm text-gray-400">€</span><input type="number" value={newEmb.value} onChange={e => setNewEmb(n => ({ ...n, value: e.target.value }))} placeholder="Waarde" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div><button onClick={addEmb} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm">Toevoegen</button></div>
      </div>)}
      {section === "leveranciers" && (<div className="space-y-3"><div className="bg-white rounded-2xl border border-gray-100 p-4"><p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Leveranciers</p>{suppliers.map(s => (<div key={s} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"><span className="text-xl">🚚</span><span className="flex-1 text-sm font-medium text-gray-700">{s}</span><span className="text-xs text-gray-400">{transactions.filter(t => t.supplier === s).length} tx</span><button onClick={() => setConfirm({ label: s, fn: () => { upd("suppliers", suppliers.filter(x => x !== s)); setConfirm(null); } })} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs hover:bg-red-100">🗑️</button></div>))}</div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"><p className="text-sm font-bold text-gray-700">➕ Nieuwe leverancier</p><div className="flex gap-2"><input value={newSup} onChange={e => setNewSup(e.target.value)} placeholder="Naam" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /><button onClick={addSup} className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm">+</button></div></div>
      </div>)}
    </div>
  );
}

// ─── MASTER LOGBOEK ──────────────────────────────────────────────────────────
function MasterLogboek({ account, setAccount }) {
  const { transactions, emballageTypes, users } = account;
  const [fb, setFb] = useState("Alle"); const [ft, setFt] = useState("Alle"); const [fe, setFe] = useState("");
  const [viewAtt, setViewAtt] = useState(null);
  const getVal = (n) => emballageTypes.find(e => e.name === n)?.value || 0;
  const branches = users.filter(u => u.role === "branch").map(u => u.branch);
  const filtered = transactions.filter(t => (fb === "Alle" || t.branch === fb) && (ft === "Alle" || t.type === ft) && (!fe || t.emballage.toLowerCase().includes(fe.toLowerCase())));
  return (
    <div className="space-y-4">
      {viewAtt && <AttViewer att={viewAtt} onClose={() => setViewAtt(null)} />}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2"><div className="grid grid-cols-3 gap-2"><select value={fb} onChange={e => setFb(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-white"><option>Alle</option>{branches.map(b => <option key={b}>{b}</option>)}</select><select value={ft} onChange={e => setFt(e.target.value)} className="border border-gray-200 rounded-xl px-2 py-2 text-xs bg-white"><option>Alle</option><option value="IN">In</option><option value="OUT">Uit</option></select><input value={fe} onChange={e => setFe(e.target.value)} placeholder="Emballage..." className="border border-gray-200 rounded-xl px-2 py-2 text-xs" /></div></div>
      <div className="space-y-2">{filtered.length === 0 && <div className="text-center py-10 text-gray-400"><p className="text-4xl mb-2">📭</p><p className="text-sm">Geen resultaten</p></div>}{filtered.map(t => { const lv = getVal(t.emballage) * t.qty; return (<div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "IN" ? "bg-green-100" : "bg-orange-100"}`}>{t.type === "IN" ? "⬇️" : "⬆️"}</div><div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm truncate">{t.emballage}</p><p className="text-xs text-gray-500">{t.supplier} · {t.date}</p><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t.branch}</span></div><div className="text-right"><p className={`font-bold text-sm ${t.type === "IN" ? "text-green-600" : "text-orange-600"}`}>{t.type === "IN" ? "+" : "-"}{t.qty} st</p>{lv > 0 && <p className={`text-xs ${t.type === "IN" ? "text-green-400" : "text-orange-400"}`}>{t.type === "IN" ? "+" : "-"}{fmt(lv)}</p>}</div><button onClick={() => setAccount(a => ({ ...a, transactions: a.transactions.filter(x => x.id !== t.id) }))} className="text-gray-300 hover:text-red-400 text-lg ml-1">×</button></div>{t.attachment && <button onClick={() => setViewAtt(t.attachment)} className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">📎 {t.attachment.name}</button>}</div>); })}</div>
    </div>
  );
}

// ─── ABONNEMENT TAB ───────────────────────────────────────────────────────────
function AbonnementTab({ account }) {
  const p = calcPrice(account.plan.outlets);
  const STATUS_COLOR = { active: "bg-green-100 text-green-700", expired: "bg-red-100 text-red-700", suspended: "bg-orange-100 text-orange-700" };
  const STATUS_LABEL = { active: "✓ Actief", expired: "✗ Verlopen", suspended: "⏸ Geblokkeerd" };
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div><p className="font-bold text-gray-800 text-lg">{account.companyName}</p><p className="text-xs text-gray-400">{account.email}</p></div>
          <span className={`text-sm px-3 py-1 rounded-full font-bold ${STATUS_COLOR[account.plan.status]}`}>{STATUS_LABEL[account.plan.status]}</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-600">Outlets</span><span className="font-semibold">{account.plan.outlets}×</span></div>
          <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-600">Outlet kosten</span><span>€ {(account.plan.outlets * PRICE_OUTLET).toFixed(2)}/mnd</span></div>
          {account.plan.outlets >= MASTER_REQUIRED_FROM && <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-600">Master admin</span><span>€ {PRICE_MASTER.toFixed(2)}/mnd</span></div>}
          <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-600">Startdatum</span><span>{account.plan.startDate}</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-600">Volgende factuur</span><span>{account.plan.nextBilling}</span></div>
        </div>
        <div className="bg-blue-50 rounded-xl px-4 py-3 mt-3 flex justify-between items-center">
          <span className="font-bold text-gray-700">Maandelijks totaal</span>
          <span className="text-2xl font-bold text-blue-700">€ {p.total.toFixed(2)}</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="font-bold text-gray-800 mb-3 text-sm">📋 Wat is inbegrepen</p>
        <div className="space-y-2 text-sm">
          {["Onbeperkte transacties", "AI bon-scanning", "Excel & PDF export", "Leveranciersbeheer", account.plan.outlets >= MASTER_REQUIRED_FROM && "Master admin dashboard"].filter(Boolean).map(f => (
            <div key={f} className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span><span className="text-gray-700">{f}</span></div>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
        <p className="text-xs text-gray-500">Wijzigingen in je abonnement?</p>
        <p className="text-xs text-gray-400 mt-1">Neem contact op via support@emballagetracker.be</p>
      </div>
    </div>
  );
}

// ─── BRANCH APP ───────────────────────────────────────────────────────────────
function BranchApp({ user, account, setAccount }) {
  const { transactions, emballageTypes, suppliers } = account;
  const [tab, setTab] = useState(0); const [showBon, setShowBon] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], type: "IN", supplier: suppliers[0] || "", emballage: "", qty: 1, note: "" });
  const [saved, setSaved] = useState(false); const [importCount, setImportCount] = useState(null);
  const [ft, setFt] = useState("Alle"); const [fe, setFe] = useState("");
  const [viewAtt, setViewAtt] = useState(null);

  const setTx = (fn) => setAccount(a => ({ ...a, transactions: typeof fn === "function" ? fn(a.transactions) : fn }));
  const myTx = transactions.filter(t => t.branch === user.branch);
  const getVal = (n) => emballageTypes.find(e => e.name === n)?.value || 0;
  const balances = {}; myTx.forEach(t => { balances[t.emballage] = (balances[t.emballage] || 0) + (t.type === "IN" ? t.qty : -t.qty); });
  const totalVal = Object.entries(balances).reduce((a, [emb, qty]) => a + qty * getVal(emb), 0);
  const totalQty = Object.values(balances).reduce((a, b) => a + b, 0);
  const lineVal = getVal(form.emballage) * form.qty;
  const filteredTx = myTx.filter(t => (ft === "Alle" || t.type === ft) && (!fe || t.emballage.toLowerCase().includes(fe.toLowerCase())));
  const handleImport = (rows) => { setTx(tx => [...rows, ...tx]); setImportCount(rows.length); setTimeout(() => setImportCount(null), 3000); };
  const handleSubmit = () => { if (!form.emballage || !form.qty) return; setTx(tx => [{ ...form, id: Date.now(), qty: parseInt(form.qty), attachment: null, branch: user.branch }, ...tx]); setSaved(true); setTimeout(() => setSaved(false), 2000); setForm(f => ({ ...f, emballage: "", qty: 1, note: "" })); };
  const TABS = [{ l: "Overzicht", i: "📊" }, { l: "Registreren", i: "📝" }, { l: "Logboek", i: "📋" }];
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {showBon && <BonScanModal emballageTypes={emballageTypes} suppliers={suppliers} branch={user.branch} onClose={() => setShowBon(false)} onImport={handleImport} />}
      {viewAtt && <AttViewer att={viewAtt} onClose={() => setViewAtt(null)} />}
      <div className="bg-white border-b border-gray-100 px-2 flex flex-shrink-0">
        {TABS.map((t, i) => (<button key={t.l} onClick={() => setTab(i)} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-0.5 ${tab === i ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"}`}><span>{t.i}</span><span>{t.l}</span></button>))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {tab === 0 && (<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white col-span-2"><p className="text-xs opacity-80">Huidig saldo</p><p className="text-3xl font-bold">{fmt(totalVal)}</p><p className="text-sm opacity-80">{totalQty} stuks · {myTx.length} transacties</p></div><div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white"><p className="text-xs opacity-80">Inkomend</p><p className="text-2xl font-bold">{myTx.filter(t => t.type === "IN").reduce((a, t) => a + t.qty, 0)}</p><p className="text-sm opacity-90">{fmt(myTx.filter(t => t.type === "IN").reduce((a, t) => a + t.qty * getVal(t.emballage), 0))}</p></div><div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white"><p className="text-xs opacity-80">Uitgaand</p><p className="text-2xl font-bold">{myTx.filter(t => t.type === "OUT").reduce((a, t) => a + t.qty, 0)}</p><p className="text-sm opacity-90">{fmt(myTx.filter(t => t.type === "OUT").reduce((a, t) => a + t.qty * getVal(t.emballage), 0))}</p></div></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"><h3 className="font-bold text-gray-800 mb-3 text-sm">📦 Saldo per type</h3>{Object.entries(balances).length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nog geen transacties</p>}{Object.entries(balances).map(([emb, qty]) => { const val = qty * getVal(emb); return (<div key={emb} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-2"><div className="flex-1 min-w-0"><p className="text-sm text-gray-700 truncate">{emb}</p><p className="text-xs text-gray-400">{fmt(getVal(emb))} / stuk</p></div><div className="text-right"><p className={`font-bold text-sm ${qty > 0 ? "text-green-600" : qty < 0 ? "text-red-600" : "text-gray-400"}`}>{qty > 0 ? "+" : ""}{qty} st</p><p className={`text-xs ${val > 0 ? "text-green-400" : val < 0 ? "text-red-400" : "text-gray-400"}`}>{val > 0 ? "+" : ""}{fmt(val)}</p></div></div>); })}</div>
        </div>)}
        {tab === 1 && (<div className="space-y-4">
          {importCount !== null && <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700">✅ {importCount} regel(s) geïmporteerd!</div>}
          <button onClick={() => setShowBon(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow">🧾 Leveringsbon inscannen <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">AI</span></button>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-bold text-gray-800">Handmatig registreren</h3>
            <div className="grid grid-cols-2 gap-2"><button onClick={() => setForm(f => ({ ...f, type: "IN" }))} className={`py-3 rounded-xl font-semibold text-sm ${form.type === "IN" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}>⬇️ Inkomend</button><button onClick={() => setForm(f => ({ ...f, type: "OUT" }))} className={`py-3 rounded-xl font-semibold text-sm ${form.type === "OUT" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>⬆️ Uitgaand</button></div>
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Datum</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Leverancier</label><select value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">{suppliers.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Emballage</label><input value={form.emballage} onChange={e => setForm(f => ({ ...f, emballage: e.target.value }))} placeholder="Type of kies..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />{form.emballage === "" && <div className="mt-2 flex flex-wrap gap-1">{emballageTypes.slice(0, 4).map(t => <button key={t.name} onClick={() => setForm(f => ({ ...f, emballage: t.name }))} className="text-xs px-2 py-1 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-100">{t.name}</button>)}</div>}{form.emballage && getVal(form.emballage) > 0 && <p className="text-xs text-gray-400 mt-1">Stukwaarde: <span className="font-medium text-gray-600">{fmt(getVal(form.emballage))}</span></p>}</div>
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Aantal</label><div className="flex items-center gap-3"><button onClick={() => setForm(f => ({ ...f, qty: Math.max(1, f.qty - 1) }))} className="w-10 h-10 rounded-xl bg-gray-100 font-bold">−</button><input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))} className="flex-1 text-center border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400" /><button onClick={() => setForm(f => ({ ...f, qty: f.qty + 1 }))} className="w-10 h-10 rounded-xl bg-gray-100 font-bold">+</button></div></div>
            {lineVal > 0 && <div className={`rounded-xl px-4 py-3 flex justify-between ${form.type === "IN" ? "bg-green-50" : "bg-orange-50"}`}><span className="text-xs font-medium text-gray-600">Totale waarde</span><span className={`font-bold ${form.type === "IN" ? "text-green-600" : "text-orange-600"}`}>{form.type === "IN" ? "+" : "-"}{fmt(lineVal)}</span></div>}
            <div><label className="text-xs font-medium text-gray-500 mb-1 block">Opmerking</label><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optioneel..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
            <button onClick={handleSubmit} className={`w-full py-4 rounded-xl font-bold text-white text-sm ${saved ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"}`}>{saved ? "✅ Opgeslagen!" : `Registreer ${form.type === "IN" ? "Inkomend" : "Uitgaand"}`}</button>
          </div>
        </div>)}
        {tab === 2 && (<div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2"><div className="grid grid-cols-2 gap-2"><select value={ft} onChange={e => setFt(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white"><option>Alle</option><option value="IN">Inkomend</option><option value="OUT">Uitgaand</option></select><input value={fe} onChange={e => setFe(e.target.value)} placeholder="Zoek..." className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /></div></div>
          <div className="space-y-2">{filteredTx.length === 0 && <div className="text-center py-10 text-gray-400"><p className="text-4xl mb-2">📭</p><p className="text-sm">Geen resultaten</p></div>}
            {filteredTx.map(t => { const lv = getVal(t.emballage) * t.qty; return (<div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "IN" ? "bg-green-100" : "bg-orange-100"}`}>{t.type === "IN" ? "⬇️" : "⬆️"}</div><div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm truncate">{t.emballage}</p><p className="text-xs text-gray-500">{t.supplier} · {t.date}</p>{t.note && <p className="text-xs text-gray-400 italic">{t.note}</p>}</div><div className="text-right flex-shrink-0"><p className={`font-bold text-sm ${t.type === "IN" ? "text-green-600" : "text-orange-600"}`}>{t.type === "IN" ? "+" : "-"}{t.qty} st</p>{lv > 0 && <p className={`text-xs ${t.type === "IN" ? "text-green-400" : "text-orange-400"}`}>{t.type === "IN" ? "+" : "-"}{fmt(lv)}</p>}</div><button onClick={() => setTx(tx => tx.filter(x => x.id !== t.id))} className="text-gray-300 hover:text-red-400 text-lg ml-1">×</button></div>{t.attachment && <button onClick={() => setViewAtt(t.attachment)} className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">📎 {t.attachment.name} · <span className="text-purple-400">bekijk bon</span></button>}</div>); })}
          </div>
        </div>)}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── API KEY HELPERS ─────────────────────────────────────────────────────────
const API_KEY_STORAGE = "emballage_api_key";
function getApiKey() { try { return localStorage.getItem(API_KEY_STORAGE) || ""; } catch { return ""; } }
function setApiKey(key) { try { localStorage.setItem(API_KEY_STORAGE, key); } catch {} }

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────
const STORAGE_KEY = "emballage_tracker_data";
function loadAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length > 0) return parsed; }
  } catch (e) { console.warn("LocalStorage load failed:", e); }
  return INIT_ACCOUNTS;
}
function saveAccounts(accounts) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts)); } catch (e) { console.warn("LocalStorage save failed:", e); }
}

export default function App() {
  const [screen, setScreen] = useState("login"); // login | register | app | superadmin
  const [accounts, setAccounts] = useState(loadAccounts);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [masterTab, setMasterTab] = useState(0);
  const [showExport, setShowExport] = useState(false);

  // Persist accounts to localStorage on every change
  useEffect(() => { saveAccounts(accounts); }, [accounts]);

  const currentAccount = accounts.find(a => a.id === currentAccountId);
  const setCurrentAccount = (fn) => setAccounts(accs => accs.map(a => a.id === currentAccountId ? (typeof fn === "function" ? fn(a) : fn) : a));

  const handleLogin = (username, password) => {
    // Super admin
    if (username === SUPER_ADMIN.name || username === SUPER_ADMIN.id) {
      if (password === SUPER_ADMIN.password) { setCurrentUser(SUPER_ADMIN); setScreen("superadmin"); return true; }
      return false;
    }
    // Search all accounts
    for (const acc of accounts) {
      if (acc.plan.status === "suspended") continue;
      const user = acc.users.find(u => (u.name === username || u.id === username) && u.password === password);
      if (user) {
        if (acc.plan.status === "expired") return "expired";
        setCurrentUser(user); setCurrentAccountId(acc.id); setScreen("app"); return true;
      }
    }
    return false;
  };

  const handleLogout = () => { setCurrentUser(null); setCurrentAccountId(null); setScreen("login"); setMasterTab(0); };

  if (screen === "register") return <RegisterFlow accounts={accounts} setAccounts={setAccounts} onDone={() => setScreen("login")} />;
  if (screen === "superadmin") return <SuperAdminPanel accounts={accounts} setAccounts={setAccounts} onLogout={handleLogout} />;

  const handleReset = () => { if (confirm("Alle data resetten naar demo-data? Dit is onomkeerbaar.")) { localStorage.removeItem(STORAGE_KEY); setAccounts(INIT_ACCOUNTS); } };

  if (screen === "login") return <LoginPage onLogin={handleLogin} onRegister={() => setScreen("register")} onReset={handleReset} />;

  if (!currentAccount || !currentUser) return null;

  const isMaster = currentUser.role === "master";
  const MASTER_TABS = [{ l: "Dashboard", i: "📊" }, { l: "Logboek", i: "📋" }, { l: "Beheer", i: "⚙️" }, { l: "Abonnement", i: "💳" }];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <div className={`text-white px-5 pt-7 pb-5 flex-shrink-0 ${isMaster ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-blue-600 to-blue-700"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><span className="text-lg">{isMaster ? "👑" : "🏪"}</span><p className="font-bold text-lg">{currentUser.name}</p></div>
            <p className="text-xs opacity-75 mt-0.5">{currentAccount.companyName} · {isMaster ? `${currentAccount.users.filter(u => u.role === "branch").length} filialen` : `${currentAccount.transactions.filter(t => t.branch === currentUser.branch).length} transacties`}</p>
          </div>
          <div className="flex gap-2">
            {isMaster && <button onClick={() => setShowExport(true)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-medium">📤 Export</button>}
            <button onClick={handleLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-medium">Uitloggen</button>
          </div>
        </div>
      </div>
      {showExport && <ExportModal account={currentAccount} onClose={() => setShowExport(false)} />}
      {isMaster && (
        <div className="bg-white border-b border-gray-100 px-2 flex flex-shrink-0">
          {MASTER_TABS.map((t, i) => (<button key={t.l} onClick={() => setMasterTab(i)} className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-0.5 ${masterTab === i ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400"}`}><span>{t.i}</span><span>{t.l}</span></button>))}
        </div>
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        {isMaster ? (
          <div className="flex-1 overflow-y-auto p-4 pb-8">
            {masterTab === 0 && <MasterDashboard account={currentAccount} />}
            {masterTab === 1 && <MasterLogboek account={currentAccount} setAccount={setCurrentAccount} />}
            {masterTab === 2 && <MasterBeheer account={currentAccount} setAccount={setCurrentAccount} />}
            {masterTab === 3 && <AbonnementTab account={currentAccount} />}
          </div>
        ) : (
          <BranchApp user={currentUser} account={currentAccount} setAccount={setCurrentAccount} />
        )}
      </div>
    </div>
  );
}

function LoginPage({ onLogin, onRegister, onReset }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [showPw, setShowPw] = useState(false);
  const handle = () => {
    const result = onLogin(username, password);
    if (result === true) { setError(""); }
    else if (result === "expired") setError("Je abonnement is verlopen. Neem contact op met support.");
    else setError("Ongeldige inloggegevens of account geblokkeerd.");
  };
  const DEMO = [
    { label: "👑 Master Admin (demo groep)", u: "Master Admin", p: "master123" },
    { label: "🏪 De Gouden Tap", u: "De Gouden Tap", p: "tap123" },
    { label: "🏪 Café Solo (1 outlet)", u: "Café Solo", p: "solo123" },
    { label: "⚙️ Super Admin (platform)", u: "Super Admin", p: "super123" },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">🍺</div><h1 className="text-3xl font-bold text-white">Emballage Tracker</h1><p className="text-blue-200 mt-1">Horeca beheer</p></div>
        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-4">
          <div><label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Gebruiker</label><input value={username} onChange={e => setUsername(e.target.value)} placeholder="Naam of ID..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Wachtwoord</label><div className="relative"><input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} placeholder="Wachtwoord..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12" /><button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{showPw ? "🙈" : "👁️"}</button></div></div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button onClick={handle} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600">Inloggen →</button>
          <button onClick={onRegister} className="w-full py-3 border-2 border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 text-sm">✨ Nieuw abonnement starten</button>
          <div className="border-t border-gray-100 pt-3"><p className="text-xs text-gray-400 font-medium mb-2">Demo accounts:</p><div className="space-y-1">{DEMO.map(d => (<button key={d.u} onClick={() => { setUsername(d.u); setPassword(d.p); }} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-xs"><span className="font-medium text-gray-700">{d.label}</span><span className="text-gray-400 font-mono">{d.p}</span></button>))}</div></div>
        </div>
        <button onClick={onReset} className="w-full text-center text-xs text-blue-300 hover:text-white mt-4">🔄 Data resetten naar demo</button>
      </div>
    </div>
  );
}
