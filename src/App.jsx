import { useState, useRef, useEffect } from "react";
import { Store, Crown, Settings, BarChart3, ClipboardList, PenSquare, CreditCard, Package, Truck, Download, ScanLine, ArrowDownCircle, ArrowUpCircle, Plus, PlusCircle, Pencil, Trash2, Paperclip, Key, FileText, TrendingUp, CheckCircle, Check, X, RotateCcw, Eye, EyeOff, Sparkles, Inbox, Lock, PackageOpen, AlertCircle, ChevronRight } from "lucide-react";

// ─── PRICING ──────────────────────────────────────────────────────────────────
const PRICE_OUTLET = 10;
const PRICE_MASTER = 15;
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

const SUPER_ADMIN = { id: "superadmin", name: "Super Admin", role: "superadmin", password: "super123" };

const fmt = (v) => `€ ${parseFloat(v || 0).toFixed(2)}`;
const uid = () => Math.random().toString(36).slice(2, 10);
const getApiKey = () => localStorage.getItem("anthropic_key") || "";
const setApiKey = (k) => localStorage.setItem("anthropic_key", k);

// ─── TOAST COMPONENT ──────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : type === "info" ? "bg-blue-500" : "bg-amber-500";
  const Icon = type === "success" ? Check : type === "info" ? AlertCircle : AlertCircle;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className={`${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3`}>
        <Icon size={20} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

// ─── PRICING CARD ─────────────────────────────────────────────────────────────
function PricingCalc({ outlets, onChange }) {
  const p = calcPrice(outlets);
  return (
    <div className="bg-blue-50 rounded-2xl p-5 space-y-3 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Aantal outlets</span>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange(Math.max(1, outlets - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-600 hover:bg-blue-100 transition-all duration-200">−</button>
          <span className="w-6 text-center font-bold text-lg text-blue-700">{outlets}</span>
          <button onClick={() => onChange(outlets + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-600 hover:bg-blue-100 transition-all duration-200">+</button>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600"><span>{outlets}× outlet{outlets > 1 ? "s" : ""} à € {PRICE_OUTLET}/mnd</span><span>€ {p.outlets.toFixed(2)}</span></div>
        {outlets >= MASTER_REQUIRED_FROM && <div className="flex justify-between text-gray-600"><span>Master admin (verplicht)</span><span>€ {PRICE_MASTER.toFixed(2)}</span></div>}
      </div>
      <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
        <span className="font-bold text-gray-800">Totaal per maand</span>
        <span className="text-xl font-bold text-blue-700">€ {p.total.toFixed(2)}</span>
      </div>
      {outlets >= MASTER_REQUIRED_FROM && <p className="text-xs text-blue-600 flex items-center gap-1"><Check size={14} /> Master admin inbegrepen — overzicht van alle filialen</p>}
    </div>
  );
}

// ─── REGISTRATION FLOW ────────────────────────────────────────────────────────
function RegisterFlow({ accounts, setAccounts, onDone }) {
  const [step, setStep] = useState(1);
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
      <div className="w-full max-w-md lg:max-w-2xl xl:max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white">ET</div>
          <h1 className="text-3xl font-bold text-white">Emballage Tracker</h1>
          <p className="text-blue-200 text-sm mt-1">Nieuw abonnement starten</p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${i + 1 < step ? "bg-green-400 text-white" : i + 1 === step ? "bg-white text-blue-600" : "bg-white/20 text-white/60"}`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 transition-all duration-200 ${i + 1 < step ? "bg-green-400" : "bg-white/20"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in">
          {step === 1 && (
            <>
              <h2 className="font-bold text-gray-800 text-xl">Kies je plan</h2>
              <PricingCalc outlets={outlets} onChange={updateOutlets} />
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Onbeperkte transacties</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Bon-scanning met AI</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Excel & PDF export</p>
                <p className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Leveranciersbeheer</p>
                {outlets >= MASTER_REQUIRED_FROM && <p className="flex items-center gap-2"><Check size={16} className="text-green-600" /> Master admin dashboard</p>}
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all duration-200">Verder →</button>
              <button onClick={onDone} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-all duration-200">← Terug naar inloggen</button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-bold text-gray-800 text-xl">Bedrijfsgegevens</h2>
              {[["Bedrijfsnaam", "name", "bijv. Horeca Groep De Smit"], ["E-mailadres", "email", "info@bedrijf.be"], ["Telefoonnummer", "phone", "+32 ..."]].map(([lbl, key, ph]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">{lbl}</label>
                  <input value={company[key]} onChange={e => setCompany(c => ({ ...c, [key]: e.target.value }))} placeholder={ph}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all duration-200">← Terug</button>
                <button onClick={() => setStep(3)} disabled={!company.name || !company.email}
                  className="flex-[2] py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-40 transition-all duration-200">Verder →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-bold text-gray-800 text-xl">Inloggegevens</h2>
              {outlets >= MASTER_REQUIRED_FROM && (
                <div className="bg-yellow-50 rounded-xl p-4 space-y-3 border border-yellow-200">
                  <p className="text-sm font-bold text-yellow-800 flex items-center gap-2"><Crown size={16} /> Master admin</p>
                  <input value={masterPw} onChange={e => setMasterPw(e.target.value)} placeholder="Wachtwoord master admin"
                    className="w-full border border-yellow-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200" />
                </div>
              )}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {outletNames.map((name, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Store size={16} /> Outlet {i + 1}</p>
                    <input value={name} onChange={e => setOutletNames(a => { const n = [...a]; n[i] = e.target.value; return n; })} placeholder={`Naam outlet ${i + 1}`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
                    <input value={outletPasswords[i]} onChange={e => setOutletPasswords(a => { const n = [...a]; n[i] = e.target.value; return n; })} placeholder="Wachtwoord"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all duration-200">← Terug</button>
                <button onClick={() => setStep(4)} className="flex-[2] py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all duration-200">Verder →</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-bold text-gray-800 text-xl">Betaling</h2>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-700">{outlets}× outlet{outlets > 1 ? "s" : ""}</span><span className="font-semibold">€ {(outlets * PRICE_OUTLET).toFixed(2)}/mnd</span></div>
                {outlets >= MASTER_REQUIRED_FROM && <div className="flex justify-between text-sm mb-2"><span className="text-gray-700">Master admin</span><span className="font-semibold">€ {PRICE_MASTER.toFixed(2)}/mnd</span></div>}
                <div className="border-t border-blue-200 pt-3 mt-2 flex justify-between font-bold"><span>Totaal</span><span className="text-blue-700 text-lg">€ {p.total.toFixed(2)}/mnd</span></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-3 block uppercase tracking-wide">Betaalmethode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["card", <CreditCard size={24} />, "Kaart"], ["bancontact", "🏦", "Bancontact"], ["sepa", <RotateCcw size={24} />, "SEPA"]].map(([id, ico, lbl]) => (
                    <button key={id} onClick={() => setPayMethod(id)}
                      className={`py-3 rounded-xl border-2 flex flex-col items-center gap-2 text-xs font-medium transition-all duration-200 ${payMethod === id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {typeof ico === "string" ? <span className="text-xl">{ico}</span> : ico}{lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                <div className="flex gap-2">
                  <input placeholder="Kaartnummer" className="flex-[3] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200" />
                  <input placeholder="MM/JJ" className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200" />
                  <input placeholder="CVV" className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200" />
                </div>
                <input placeholder="Naam kaarthouder" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200" />
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1"><Lock size={12} /> Demo — geen echte betaling</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all duration-200">← Terug</button>
                <button onClick={handleRegister} disabled={processing}
                  className="flex-[2] py-3.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-60 flex items-center justify-center gap-2 transition-all duration-200">
                  {processing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verwerken...</> : `€ ${p.total.toFixed(2)}/mnd`}
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="text-center space-y-5 py-3 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto"><CheckCircle size={40} className="text-green-600" /></div>
              <div>
                <h2 className="font-bold text-gray-800 text-xl">Welkom, {company.name}!</h2>
                <p className="text-sm text-gray-500 mt-2">Je abonnement is actief. Je kan nu inloggen.</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-left space-y-2 border border-green-200">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Abonnement</p>
                <p className="text-sm text-gray-700 font-medium">{outlets} outlet{outlets > 1 ? "s" : ""}{outlets >= MASTER_REQUIRED_FROM ? " + master admin" : ""}</p>
                <p className="text-lg font-bold text-green-600">€ {p.total.toFixed(2)} / maand</p>
              </div>
              <button onClick={onDone} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all duration-200">Naar inloggen →</button>
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
  const [showNewAcc, setShowNewAcc] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const activeCount = accounts.filter(a => a.plan.status === "active").length;
  const totalMRR = accounts.filter(a => a.plan.status === "active").reduce((a, x) => a + calcPrice(x.plan.outlets).total, 0);

  const deleteAcc = (id) => {
    setAccounts(a => a.filter(x => x.id !== id));
    setConfirm(null);
  };

  const toggleStatus = (id) => {
    setAccounts(a => a.map(x => x.id !== id ? x : { ...x, plan: { ...x.plan, status: x.plan.status === "active" ? "suspended" : "active" } }));
  };

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
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl space-y-4 animate-slide-up">
            <p className="font-bold text-gray-800">Account verwijderen?</p>
            <p className="text-sm text-gray-600">Verwijder <span className="font-semibold">"{confirm.name}"</span> inclusief alle data. Onomkeerbaar.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all duration-200">Annuleren</button>
              <button onClick={() => deleteAcc(confirm.id)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all duration-200">Verwijderen</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 pt-7 pb-5 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs text-blue-200 uppercase tracking-wide">Platform beheer</p><h1 className="text-2xl font-bold flex items-center gap-2"><Settings size={24} /> Super Admin</h1></div>
          <button onClick={onLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all duration-200">Uitloggen</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{accounts.length}</p><p className="text-xs text-blue-200">Accounts</p></div>
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-blue-200">Actief</p></div>
          <div className="bg-green-500/30 rounded-xl p-3 text-center"><p className="text-xl font-bold">€{totalMRR.toFixed(0)}</p><p className="text-xs text-blue-200">MRR</p></div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-2 flex sticky top-0 z-10">
        {[["accounts", <ClipboardList size={18} />, "Accounts"], ["stats", <BarChart3 size={18} />, "Statistieken"]].map(([id, ico, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-all duration-200 ${tab === id ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-400 hover:text-gray-600"}`}>
            {ico}<span>{lbl}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {tab === "accounts" && (
          <>
            <button onClick={() => setShowNewAcc(true)} className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm">
              <Plus size={18} /> Nieuw account aanmaken
            </button>
            {showNewAcc && <NewAccountForm onSave={(acc) => { setAccounts(a => [...a, acc]); setShowNewAcc(false); }} onCancel={() => setShowNewAcc(false)} />}
            {accounts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto"><Inbox size={24} className="text-gray-400" /></div>
                <p className="text-sm text-gray-600 font-medium">Geen accounts</p>
                <p className="text-xs text-gray-500">Maak een nieuw account aan om te beginnen</p>
              </div>
            ) : (
              accounts.map(acc => {
                const p = calcPrice(acc.plan.outlets);
                const isEditing = editAcc === acc.id;
                return (
                  <div key={acc.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-gray-800 text-lg">{acc.companyName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[acc.plan.status]}`}>{STATUS_LABEL[acc.plan.status]}</span>
                          </div>
                          <p className="text-xs text-gray-500">{acc.email}</p>
                          <p className="text-xs text-gray-600 mt-1 font-medium">{acc.plan.outlets} outlet{acc.plan.outlets > 1 ? "s" : ""} · {acc.transactions.length} transacties</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-green-600 text-lg">€ {p.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">/maand</p>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="pt-4 border-t border-gray-200 space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Aantal outlets</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => changeOutlets(acc.id, acc.plan.outlets - 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-sm hover:bg-gray-200 transition-all duration-200">−</button>
                              <span className="w-5 text-center font-bold">{acc.plan.outlets}</span>
                              <button onClick={() => changeOutlets(acc.id, acc.plan.outlets + 1)} className="w-7 h-7 rounded-lg bg-gray-100 font-bold text-sm hover:bg-gray-200 transition-all duration-200">+</button>
                            </div>
                          </div>
                          <PricingCalc outlets={acc.plan.outlets} onChange={(n) => changeOutlets(acc.id, n)} />
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Gebruikers</p>
                            {acc.users.map(u => (
                              <div key={u.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0 text-sm">
                                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  {u.role === "master" ? <Crown size={14} className="text-amber-600" /> : <Store size={14} className="text-blue-600" />}
                                </div>
                                <span className="flex-1 font-medium text-gray-700">{u.name}</span>
                                <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{u.password}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => setEditAcc(isEditing ? null : acc.id)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${isEditing ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {isEditing ? <><Check size={14} /> Sluiten</> : <><Pencil size={14} /> Beheren</>}
                        </button>
                        <button onClick={() => toggleStatus(acc.id)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${acc.plan.status === "active" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}>
                          {acc.plan.status === "active" ? "Blokkeren" : "Activeren"}
                        </button>
                        <button onClick={() => setConfirm({ id: acc.id, name: acc.companyName })}
                          className="px-3 py-2.5 rounded-xl bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-all duration-200"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {tab === "stats" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-600" /> Omzet overzicht</h3>
              {accounts.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Geen accounts</p>
              ) : (
                <>
                  {accounts.map(acc => {
                    const p = calcPrice(acc.plan.outlets);
                    return (
                      <div key={acc.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div><p className="text-sm font-medium text-gray-800">{acc.companyName}</p>
                          <p className="text-xs text-gray-500">{acc.plan.outlets} outlet{acc.plan.outlets > 1 ? "s" : ""} · {STATUS_LABEL[acc.plan.status]}</p></div>
                        <p className={`font-bold text-sm ${acc.plan.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                          {acc.plan.status === "active" ? `€ ${p.total.toFixed(2)}` : "—"}</p>
                      </div>
                    );
                  })}
                  <div className="border-t-2 border-gray-200 pt-4 mt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-800">Totaal MRR</span>
                    <span className="text-2xl font-bold text-green-600">€ {totalMRR.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Jaarlijks: € {(totalMRR * 12).toFixed(2)}</p>
                </>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Accounts per type</h3>
              {[["Actief", "active", "bg-green-100 text-green-700"], ["Verlopen", "expired", "bg-red-100 text-red-700"], ["Geblokkeerd", "suspended", "bg-orange-100 text-orange-700"]].map(([lbl, status, cls]) => (
                <div key={status} className="flex items-center justify-between py-2.5">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${cls}`}>{lbl}</span>
                  <span className="font-bold text-gray-700">{accounts.filter(a => a.plan.status === status).length}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Store size={18} className="text-amber-600" /> Outlets verdeling</h3>
              {[1, 2, 3, 5].map(n => {
                const cnt = accounts.filter(a => a.plan.outlets === n).length;
                const cntPlus = n === 5 ? accounts.filter(a => a.plan.outlets >= 5).length : cnt;
                if (n === 5 && cntPlus === 0) return null;
                return (
                  <div key={n} className="flex items-center gap-3 py-2">
                    <span className="text-xs text-gray-600 w-20 font-medium">{n === 5 ? "5+" : n} outlet{n > 1 ? "s" : ""}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full transition-all duration-300" style={{ width: `${(cntPlus / Math.max(accounts.length, 1)) * 100}%` }} /></div>
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [outlets, setOutlets] = useState(1);
  const [pw, setPw] = useState("");

  const save = () => {
    if (!name || !email) return;
    const hasMaster = outlets >= MASTER_REQUIRED_FROM;
    const users = [];
    if (hasMaster) users.push({ id: "m_" + uid(), name: name + " Admin", role: "master", password: pw || "admin123", branch: null });
    for (let i = 0; i < outlets; i++) users.push({ id: "b_" + uid(), name: `Outlet ${i + 1}`, role: "branch", password: "pass123", branch: `Outlet ${i + 1}` });
    onSave({ id: "acc_" + uid(), companyName: name, email, plan: { outlets, startDate: new Date().toISOString().split("T")[0], status: "active", nextBilling: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] }, users, emballageTypes: INIT_EMBALLAGE, suppliers: INIT_SUPPLIERS, transactions: [] });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl border border-blue-200 p-5 space-y-3 animate-fade-in">
      <p className="font-bold text-gray-800 text-sm flex items-center gap-2"><Plus size={16} className="text-blue-600" /> Nieuw account</p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Bedrijfsnaam" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
      <input value={pw} onChange={e => setPw(e.target.value)} placeholder="Master wachtwoord (bij 2+ outlets)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
      <PricingCalc outlets={outlets} onChange={setOutlets} />
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all duration-200">Annuleren</button>
        <button onClick={save} disabled={!name || !email} className="flex-[2] py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all duration-200">Aanmaken</button>
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
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  a.download = "emballage_export.csv";
  a.click();
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
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Inter",Arial,sans-serif;font-size:11px;color:#222;padding:20px}h1{font-size:20px;color:#1d4ed8;margin-bottom:4px}.sub{color:#6b7280;font-size:11px;margin-bottom:20px}h2{font-size:14px;color:#1e40af;margin:18px 0 8px;border-bottom:2px solid #dbeafe;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#1d4ed8;color:white;padding:6px 8px;text-align:left;font-size:10px}td{padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#f9fafb}.gi{color:#15803d;font-weight:bold}.go{color:#c2410c;font-weight:bold}.grand{background:linear-gradient(135deg,#1d4ed8,#0ea5e9);color:white;border-radius:8px;padding:12px 16px;margin-bottom:16px}.grand .val{font-size:26px;font-weight:bold}.grand .lbl{font-size:10px;opacity:.8}.bh{background:#f0f9ff;border-left:4px solid #1d4ed8;padding:8px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}.bh .nm{font-weight:bold;font-size:13px}.bh .tt{text-align:right;font-size:11px}</style></head><body>
  <h1>${companyName} — Emballage Export</h1>
  <div class="sub">Gegenereerd op ${now} · ${transactions.length} transacties · ${branches.length} filialen</div>
  <div class="grand"><div class="lbl">TOTAAL SALDO</div><div class="val">€ ${grandTotal.toFixed(2)}</div><div class="lbl">${branchSummary.reduce((a, s) => a + s.totalQty, 0)} stuks</div></div>
  <h2>Per emballagetype</h2>
  <table><thead><tr><th>Type</th><th>Stukwaarde</th><th>Saldo stuks</th><th>Saldo waarde</th></tr></thead><tbody>
  ${Object.entries(embTotals).map(([emb, qty]) => { const v = qty * getVal(emb); return `<tr><td>${emb}</td><td>€ ${getVal(emb).toFixed(2)}</td><td class="${qty >= 0 ? "gi" : "go"}">${qty >= 0 ? "+" : ""}${qty}</td><td class="${v >= 0 ? "gi" : "go"}">${v >= 0 ? "+" : ""}€ ${v.toFixed(2)}</td></tr>`; }).join("")}
  </tbody></table>
  <h2>Per filiaal</h2>
  ${branchSummary.map(s => `<div class="bh"><div class="nm">${s.b}</div><div class="tt"><strong class="${s.totalVal >= 0 ? "gi" : "go"}">€ ${s.totalVal.toFixed(2)}</strong><br><span style="color:#6b7280">${s.totalQty} st · ${s.txCount} tx</span></div></div>
  <table><thead><tr><th>Type</th><th>Saldo</th><th>Waarde</th></tr></thead><tbody>${Object.entries(s.balances).map(([emb, qty]) => { const v = qty * getVal(emb); return `<tr><td>${emb}</td><td class="${qty >= 0 ? "gi" : "go"}">${qty >= 0 ? "+" : ""}${qty} st</td><td class="${v >= 0 ? "gi" : "go"}">${v >= 0 ? "+" : ""}€ ${v.toFixed(2)}</td></tr>`; }).join("")}</tbody></table>`).join("")}
  <h2>Transacties</h2>
  <table><thead><tr><th>Datum</th><th>Filiaal</th><th>Type</th><th>Leverancier</th><th>Emballage</th><th>Aantal</th><th>Waarde</th><th>Opmerking</th></tr></thead><tbody>
  ${[...transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => { const v = (t.type === "IN" ? 1 : -1) * t.qty * getVal(t.emballage); return `<tr><td>${t.date}</td><td>${t.branch}</td><td class="${t.type === "IN" ? "gi" : "go"}">${t.type === "IN" ? "IN" : "UIT"}</td><td>${t.supplier}</td><td>${t.emballage}</td><td style="text-align:center">${t.qty}</td><td class="${v >= 0 ? "gi" : "go"}">${v >= 0 ? "+" : ""}€ ${v.toFixed(2)}</td><td style="color:#6b7280">${t.note || ""}</td></tr>`; }).join("")}
  </tbody></table></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `emballage_export_${companyName.replace(/\s+/g, "_")}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function ExportModal({ account, onClose }) {
  const [fb, setFb] = useState("Alle");
  const [df, setDf] = useState("");
  const [dt, setDt] = useState("");
  const [exp, setExp] = useState(null);
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
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-bold flex items-center gap-2"><Download size={20} className="text-blue-600" /> Exporteren</h2><p className="text-xs text-gray-500">Filters instellen en formaat kiezen</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Filiaal</label>
            <select value={fb} onChange={e => setFb(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
              <option>Alle</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Datum van</label>
              <input type="date" value={df} onChange={e => setDf(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" /></div>
            <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Datum tot</label>
              <input type="date" value={dt} onChange={e => setDt(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" /></div>
          </div>
        </div>
        <div className={`rounded-2xl px-5 py-4 flex justify-between transition-all duration-200 ${totalVal >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div><p className="text-xs text-gray-600">Geselecteerd</p><p className="font-bold text-gray-800 text-lg">{filtered.length}</p></div>
          <div className="text-right"><p className="text-xs text-gray-600">Saldo</p><p className={`font-bold text-xl ${totalVal >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(totalVal)}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={() => doExport("csv")} disabled={!!exp || filtered.length === 0}
            className="py-4 rounded-2xl bg-green-500 text-white font-bold flex flex-col items-center gap-2 hover:bg-green-600 disabled:opacity-40 transition-all duration-200">
            {exp === "csv" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText size={24} />}
            <span className="text-sm">Excel / CSV</span>
          </button>
          <button onClick={() => doExport("pdf")} disabled={!!exp || filtered.length === 0}
            className="py-4 rounded-2xl bg-red-500 text-white font-bold flex flex-col items-center gap-2 hover:bg-red-600 disabled:opacity-40 transition-all duration-200">
            {exp === "pdf" ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download size={24} />}
            <span className="text-sm">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BON SCAN MODAL ───────────────────────────────────────────────────────────
function BonScanModal({ emballageTypes, suppliers, branch, onClose, onImport }) {
  const [step, setStep] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState("image");
  const [rawFile, setRawFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [editLines, setEditLines] = useState([]);
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
      const d = await res.json();
      const txt = d.content?.find(b => b.type === "text")?.text || "{}";
      const result = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setParsed(result);
      setEditLines(result.lines || []);
      setStep("review");
    } catch (e) {
      alert("Fout bij scannen: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setRawFile(f);
    const r = new FileReader();
    r.onload = (ev) => {
      const b64 = ev.target?.result?.split(",")[1];
      const type = f.type;
      setPreview(b64);
      setPreviewType(type.startsWith("image") ? "image" : "pdf");
      if (b64) scanBon(b64, type);
    };
    r.readAsDataURL(f);
  };

  const handleImport = () => {
    if (!parsed) return;
    const tx = {
      id: Date.now(),
      date: parsed.date || new Date().toISOString().split("T")[0],
      type: parsed.type || "IN",
      supplier: parsed.supplier || "Unknown",
      branch,
      attachment: preview ? { name: rawFile?.name || "scan.jpg", base64: preview } : null,
      note: parsed.bonNummer ? `Bon #${parsed.bonNummer}` : ""
    };
    editLines.forEach(line => {
      if (line.matchedType && line.qty > 0) onImport({ ...tx, emballage: line.matchedType, qty: line.qty });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between sticky top-0 bg-white pb-2">
          <div><h2 className="text-lg font-bold flex items-center gap-2"><ScanLine size={20} className="text-blue-600" /> Bon scannen</h2><p className="text-xs text-gray-500">Upload een foto of PDF</p></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"><X size={18} /></button>
        </div>

        {step === "upload" && (
          <div className="space-y-4">
            {needsKey && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 space-y-3">
                <p className="text-sm font-bold text-yellow-800 flex items-center gap-2"><AlertCircle size={16} /> Anthropic API-sleutel nodig</p>
                <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} placeholder="Voer je API-sleutel in"
                  className="w-full border border-yellow-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200" />
                <button onClick={() => { setApiKey(apiKeyInput); setNeedsKey(false); }} className="w-full py-2 bg-yellow-600 text-white rounded-lg font-semibold text-sm hover:bg-yellow-700 transition-all duration-200">Opslaan</button>
              </div>
            )}
            <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center space-y-3 cursor-pointer hover:bg-blue-50 transition-all duration-200" onClick={() => fileRef.current?.click()}>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto"><Package size={24} className="text-blue-600" /></div>
              <p className="text-sm font-bold text-gray-700">Klik om bestand te kiezen</p>
              <p className="text-xs text-gray-500">JPG, PNG of PDF</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
            {loading && <div className="flex items-center justify-center gap-2 py-4"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-600">Scannen...</span></div>}
          </div>
        )}

        {step === "review" && parsed && (
          <div className="space-y-4">
            {preview && (
              <div className="bg-gray-100 rounded-xl overflow-hidden h-48">
                {previewType === "image" ? (
                  <img src={`data:image/jpeg;base64,${preview}`} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText size={48} className="text-gray-400" /></div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Leverancier</label>
              <select value={parsed.supplier || ""} onChange={e => setParsed({ ...parsed, supplier: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                <option>Selecteer...</option>{suppliers.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Datum</label>
                <input type="date" value={parsed.date || ""} onChange={e => setParsed({ ...parsed, date: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" /></div>
              <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Type</label>
                <select value={parsed.type || "IN"} onChange={e => setParsed({ ...parsed, type: e.target.value })} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                  <option value="IN">Inkomend</option><option value="OUT">Uitgaand</option>
                </select></div>
            </div>
            <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Regels</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editLines.map((line, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                    <input type="number" value={line.qty} onChange={e => { const a = [...editLines]; a[i].qty = parseInt(e.target.value) || 0; setEditLines(a); }} placeholder="Aantal" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200" />
                    <select value={line.matchedType || ""} onChange={e => { const a = [...editLines]; a[i].matchedType = e.target.value; setEditLines(a); }} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all duration-200">
                      <option>Selecteer type...</option>{emballageTypes.map(et => <option key={et.name} value={et.name}>{et.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setStep("upload"); setParsed(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-all duration-200">← Terug</button>
              <button onClick={handleImport} disabled={!editLines.some(l => l.matchedType && l.qty > 0)} className="flex-[2] py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all duration-200 flex items-center justify-center gap-2"><Plus size={16} /> Importeren</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ATTACHMENTS VIEWER ───────────────────────────────────────────────────────
function AttViewer({ att, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <p className="font-bold text-gray-800 flex items-center gap-2"><Paperclip size={18} /> {att.name}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"><X size={18} /></button>
        </div>
        <div className="p-4 bg-gray-50 h-96 flex items-center justify-center overflow-auto">
          {att.base64?.startsWith("/") || att.base64?.includes("data:image") ? (
            <img src={att.base64?.includes("data:") ? att.base64 : `data:image/jpeg;base64,${att.base64}`} alt={att.name} className="max-w-full max-h-full" />
          ) : (
            <div className="text-center space-y-2"><FileText size={48} className="text-gray-400 mx-auto" /><p className="text-sm text-gray-600">{att.name}</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MASTER DASHBOARD ─────────────────────────────────────────────────────────
function MasterDashboard({ account, onLogout }) {
  const branches = account.users.filter(u => u.role === "branch");
  const totalValue = account.transactions.reduce((a, t) => {
    const emb = account.emballageTypes.find(e => e.name === t.emballage);
    return a + (t.type === "IN" ? 1 : -1) * t.qty * (emb?.value || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 pt-7 pb-5 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs text-blue-200 uppercase tracking-wide">Master Admin</p><h1 className="text-2xl font-bold flex items-center gap-2"><Crown size={24} /> {account.companyName}</h1></div>
          <button onClick={onLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all duration-200">Uitloggen</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{branches.length}</p><p className="text-xs text-blue-200">Filialen</p></div>
          <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-bold">{account.transactions.length}</p><p className="text-xs text-blue-200">Transacties</p></div>
          <div className="bg-green-500/30 rounded-xl p-3 text-center"><p className="text-xl font-bold">{fmt(totalValue)}</p><p className="text-xs text-blue-200">Totaal</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Store size={18} className="text-blue-600" /> Filialen overzicht</h3>
          {branches.length === 0 ? (
            <div className="text-center py-8 space-y-2"><Inbox size={32} className="text-gray-300 mx-auto" /><p className="text-sm text-gray-600">Geen filialen</p></div>
          ) : (
            <div className="space-y-2">
              {branches.map(b => {
                const bTx = account.transactions.filter(t => t.branch === b.branch);
                const bVal = bTx.reduce((a, t) => {
                  const emb = account.emballageTypes.find(e => e.name === t.emballage);
                  return a + (t.type === "IN" ? 1 : -1) * t.qty * (emb?.value || 0);
                }, 0);
                return (
                  <div key={b.id} className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                    <div><p className="font-medium text-gray-800">{b.branch}</p><p className="text-xs text-gray-500">{bTx.length} transacties</p></div>
                    <p className={`font-bold ${bVal >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(bVal)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-600" /> Top emballages</h3>
          {account.transactions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">Geen transacties</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(account.transactions.reduce((a, t) => ({ ...a, [t.emballage]: (a[t.emballage] || 0) + (t.type === "IN" ? t.qty : -t.qty) }), {})).slice(0, 5).map(([emb, qty]) => (
                <div key={emb} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{emb}</span>
                  <span className={`font-bold ${qty >= 0 ? "text-green-600" : "text-red-600"}`}>{qty >= 0 ? "+" : ""}{qty} st</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BRANCH APP ───────────────────────────────────────────────────────────────
function BranchApp({ account, user, onLogout }) {
  const [txs, setTxs] = useState(account.transactions);
  const [tab, setTab] = useState("logboek");
  const [showScan, setShowScan] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAtt, setShowAtt] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const myTxs = txs.filter(t => t.branch === user.branch);
  const getVal = (n) => account.emballageTypes.find(e => e.name === n)?.value || 0;
  const balance = myTxs.reduce((a, t) => a + (t.type === "IN" ? 1 : -1) * t.qty * getVal(t.emballage), 0);

  const handleAddTx = (base) => {
    if (!base.emballage || !base.qty) { setToast({ msg: "Vul alles in", type: "warning" }); return; }
    const tx = { ...base, id: Date.now(), branch: user.branch };
    setTxs([...txs, tx]);
    setToast({ msg: "Transactie toegevoegd", type: "success" });
  };

  const handleDeleteTx = (id) => {
    setTxs(txs.filter(t => t.id !== id));
    setToast({ msg: "Transactie verwijderd", type: "success" });
  };

  const handleEditTx = (id, updates) => {
    setTxs(txs.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingId(null);
    setEditForm(null);
    setToast({ msg: "Transactie bijgewerkt", type: "success" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showScan && <BonScanModal emballageTypes={account.emballageTypes} suppliers={account.suppliers} branch={user.branch} onClose={() => setShowScan(false)} onImport={handleAddTx} />}
      {showExport && <ExportModal account={{ ...account, transactions: myTxs }} onClose={() => setShowExport(false)} />}
      {showAtt && <AttViewer att={showAtt} onClose={() => setShowAtt(null)} />}

      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 pt-7 pb-5 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-xs text-amber-200 uppercase tracking-wide">Branch</p><h1 className="text-2xl font-bold flex items-center gap-2"><Store size={24} /> {user.branch}</h1></div>
          <button onClick={onLogout} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all duration-200">Uitloggen</button>
        </div>
        <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
          <div><p className="text-xs text-amber-200 uppercase tracking-wide">Saldo</p><p className={`text-2xl font-bold ${balance >= 0 ? "text-green-300" : "text-red-300"}`}>{fmt(balance)}</p></div>
          <div className="text-right"><p className="text-xs text-amber-200">Transacties</p><p className="text-2xl font-bold">{myTxs.length}</p></div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-2 flex sticky top-0 z-10">
        {[["logboek", <ClipboardList size={18} />, "Logboek"], ["emballage", <Package size={18} />, "Emballage"], ["abonnement", <CreditCard size={18} />, "Abonnement"]].map(([id, ico, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-all duration-200 ${tab === id ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-400 hover:text-gray-600"}`}>
            {ico}<span>{lbl}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {tab === "logboek" && (
          <>
            <div className="flex gap-2">
              <button onClick={() => setShowScan(true)} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"><ScanLine size={18} /> Bon scannen</button>
              <button onClick={() => setShowExport(true)} className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-all duration-200 shadow-sm"><Download size={18} /> Exporteren</button>
            </div>

            {myTxs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto"><Inbox size={24} className="text-gray-400" /></div>
                <p className="text-sm text-gray-600 font-medium">Nog geen transacties</p>
                <p className="text-xs text-gray-500">Scan een bon of voeg handmatig toe</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...myTxs].reverse().map(t => {
                  const isEditing = editingId === t.id;
                  const emb = account.emballageTypes.find(e => e.name === t.emballage);
                  const val = (t.type === "IN" ? 1 : -1) * t.qty * (emb?.value || 0);
                  return (
                    <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                      <div className="p-4 space-y-3">
                        {!isEditing ? (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-bold text-gray-800">{t.emballage}</p>
                                <p className="text-xs text-gray-500">{t.date} · {t.supplier}</p>
                                {t.note && <p className="text-xs text-gray-600 mt-1">{t.note}</p>}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`text-lg font-bold ${val >= 0 ? "text-green-600" : "text-red-600"}`}>{val >= 0 ? "+" : ""}{fmt(val)}</p>
                                <p className="text-xs text-gray-500">{t.qty} st</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={() => { setEditingId(t.id); setEditForm({...t}); }} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-1"><Pencil size={14} /> Bewerk</button>
                              {t.attachment && <button onClick={() => setShowAtt(t.attachment)} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-1"><Paperclip size={14} /> Bijlage</button>}
                              <button onClick={() => handleDeleteTx(t.id)} className="px-3 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-all duration-200"><Trash2 size={14} /></button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-3 animate-fade-in">
                              <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Emballage</label>
                                <select value={editForm?.emballage || ""} onChange={e => setEditForm({...editForm, emballage: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                                  <option>Selecteer...</option>{account.emballageTypes.map(et => <option key={et.name}>{et.name}</option>)}
                                </select></div>
                              <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Aantal</label>
                                  <input type="number" value={editForm?.qty || 0} onChange={e => setEditForm({...editForm, qty: parseInt(e.target.value) || 0})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" /></div>
                                <div><label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Type</label>
                                  <select value={editForm?.type || "IN"} onChange={e => setEditForm({...editForm, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
                                    <option value="IN">Inkomend</option><option value="OUT">Uitgaand</option>
                                  </select></div>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button onClick={() => { setEditingId(null); setEditForm(null); }} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all duration-200">Annuleer</button>
                              <button onClick={() => handleEditTx(t.id, editForm)} className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all duration-200">Opslaan</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "emballage" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Emballage types</h3>
              {account.emballageTypes.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Geen types</p>
              ) : (
                <div className="space-y-2">
                  {account.emballageTypes.map(et => {
                    const qty = myTxs.filter(t => t.emballage === et.name).reduce((a, t) => a + (t.type === "IN" ? t.qty : -t.qty), 0);
                    return (
                      <div key={et.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div><p className="font-medium text-gray-800">{et.name}</p><p className="text-xs text-gray-500">€ {et.value.toFixed(2)}</p></div>
                        <p className={`font-bold text-sm ${qty >= 0 ? "text-green-600" : "text-red-600"}`}>{qty >= 0 ? "+" : ""}{qty} st</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "abonnement" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Abonnement details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-700">Bedrijf</span><span className="font-bold">{account.companyName}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-700">Status</span><span className={`font-bold ${account.plan.status === "active" ? "text-green-600" : "text-red-600"}`}>{account.plan.status === "active" ? "Actief" : "Verlopen"}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-700">Outlets</span><span className="font-bold">{account.plan.outlets}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-700">Startdatum</span><span className="font-bold">{account.plan.startDate}</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-700">Volgende facturatie</span><span className="font-bold">{account.plan.nextBilling}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ accounts, onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (email === "superadmin" && pw === "super123") { onLogin(SUPER_ADMIN, null); return; }
    const acc = accounts.find(a => a.email === email);
    if (!acc) { setError("Account niet gevonden"); return; }
    const user = acc.users.find(u => u.password === pw);
    if (!user) { setError("Wachtwoord incorrect"); return; }
    onLogin(user, acc);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">ET</div>
          <h1 className="text-3xl font-bold text-white">Emballage Tracker</h1>
          <p className="text-blue-200 text-sm mt-2">Inloggen</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl space-y-5">
          {error && <div className="bg-red-50 rounded-xl p-3 flex items-start gap-3 border border-red-200"><AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div>}

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Email of bedrijfsnaam</label>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="demo@horeca.be"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Wachtwoord</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200" />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button onClick={handleLogin} className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all duration-200">Inloggen</button>

          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-500">of</span></div></div>

          <button onClick={onRegister} className="w-full py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"><Plus size={18} /> Nieuw account</button>

          <p className="text-xs text-gray-500 text-center">Demo credentials: superadmin / super123 of demo@horeca.be / (user password)</p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [accounts, setAccounts] = useState(() => JSON.parse(localStorage.getItem("accounts") || JSON.stringify(INIT_ACCOUNTS)));
  const [page, setPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  useEffect(() => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, [accounts]);

  const handleLogin = (user, account) => {
    setCurrentUser(user);
    setCurrentAccount(account);
    if (user.role === "superadmin") setPage("superadmin");
    else if (user.role === "master") setPage("master");
    else setPage("branch");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentAccount(null);
    setPage("login");
  };

  return (
    <div>
      {page === "login" && <LoginPage accounts={accounts} onLogin={handleLogin} onRegister={() => setPage("register")} />}
      {page === "register" && <RegisterFlow accounts={accounts} setAccounts={setAccounts} onDone={() => setPage("login")} />}
      {page === "superadmin" && currentUser && <SuperAdminPanel accounts={accounts} setAccounts={setAccounts} onLogout={handleLogout} />}
      {page === "master" && currentUser && currentAccount && <MasterDashboard account={currentAccount} onLogout={handleLogout} />}
      {page === "branch" && currentUser && currentAccount && <BranchApp account={currentAccount} user={currentUser} onLogout={handleLogout} />}
    </div>
  );
}
