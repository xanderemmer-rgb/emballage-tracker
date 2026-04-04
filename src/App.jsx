import { useState, useRef, useEffect } from "react";
import {
  Store, Crown, Settings, BarChart3, ClipboardList, PenSquare, CreditCard, Package,
  Truck, Download, ScanLine, ArrowDownCircle, ArrowUpCircle, Plus, PlusCircle, Pencil,
  Trash2, Paperclip, Key, FileText, TrendingUp, CheckCircle, Check, X, RotateCcw, Eye,
  EyeOff, Sparkles, Inbox, Lock, PackageOpen, AlertCircle, ChevronRight, Search, Filter,
  Calendar, LogOut, User, Users, Building2, Shield
} from "lucide-react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const DEMO_MODE = true; // Set to false for production

// ─── BARCODE LOGO ────────────────────────────────────────────────────────────
function BarcodeLogo({ size = "md" }) {
  const sizes = {
    sm: { bars: "h-6", gap: "gap-[2px]", barW: "w-[3px]", text: "text-lg", wrap: "gap-2" },
    md: { bars: "h-8", gap: "gap-[2.5px]", barW: "w-[3.5px]", text: "text-2xl", wrap: "gap-3" },
    lg: { bars: "h-10", gap: "gap-[3px]", barW: "w-1", text: "text-3xl", wrap: "gap-3" },
  };
  const s = sizes[size] || sizes.md;
  const barHeights = ["100%", "65%", "85%", "50%", "95%", "40%", "75%"];
  const barColors = ["#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa"];

  return (
    <div className={`flex items-center ${s.wrap}`}>
      <div className={`flex items-end ${s.gap} ${s.bars}`}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className={`${s.barW} rounded-sm`}
            style={{
              height: h,
              backgroundColor: barColors[i],
              animation: `barPulse 3s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <span className={`${s.text} font-bold text-gray-900`} style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.04em" }}>
        Reggy
      </span>
    </div>
  );
}

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
const STORAGE_KEY = "reggy_data";
const API_KEY_STORAGE = "reggy_api_key";

// ─── TOAST COMPONENT ──────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  const icon = type === "success" ? <CheckCircle size={20} /> : type === "error" ? <AlertCircle size={20} /> : <Inbox size={20} />;

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}

// ─── PRICING CARD ─────────────────────────────────────────────────────────────
function PricingCalc({ outlets, onChange }) {
  const p = calcPrice(outlets);
  return (
    <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
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
      <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
        <span className="font-bold text-gray-800">Totaal per maand</span>
        <span className="text-xl font-bold text-blue-700">€ {p.total.toFixed(2)}</span>
      </div>
      {outlets >= MASTER_REQUIRED_FROM && <p className="text-xs text-blue-600 flex items-center gap-1"><CheckCircle size={14} /> Master admin inbegrepen, overzicht van alle filialen</p>}
    </div>
  );
}

// ─── REGISTRATION FLOW ────────────────────────────────────────────────────────
function RegisterFlow({ accounts, setAccounts, onDone }) {
  const [step, setStep] = useState(1); // 1: plan, 2: bedrijf, 3: outlets, 4: betaling, 5: bevestiging
  const [outlets, setOutlets] = useState(1);
  const [company, setCompany] = useState({ name: "", email: "", phone: "" });
  const [masterUser, setMasterUser] = useState({ name: "", password: "" });
  const [toast, setToast] = useState(null);

  const handleCreateAccount = () => {
    if (!company.name || !company.email || !masterUser.name || !masterUser.password) {
      setToast({ type: "error", message: "Alle velden zijn verplicht" });
      return;
    }
    const newAcc = {
      id: "acc_" + uid(),
      companyName: company.name,
      email: company.email,
      phone: company.phone,
      plan: { outlets, startDate: new Date().toISOString().split("T")[0], status: "active", nextBilling: "2026-05-02" },
      users: [{ id: "m_" + uid(), name: masterUser.name, role: "master", password: masterUser.password, branch: null }],
      emballageTypes: INIT_EMBALLAGE,
      suppliers: INIT_SUPPLIERS,
      transactions: [],
    };
    setAccounts([...accounts, newAcc]);
    setToast({ type: "success", message: "Account aangemaakt!" });
    setTimeout(() => onDone(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md lg:max-w-2xl xl:max-w-4xl w-full p-8 animate-slide-up">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nieuw account</h2>
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-gray-600">Stap 1: Kies uw abonnement</p>
            <PricingCalc outlets={outlets} onChange={setOutlets} />
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200">Volgende</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-gray-600">Stap 2: Bedrijfsgegevens</p>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bedrijfsnaam</label><input type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Naam" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Email" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Telefoon (optioneel)</label><input type="tel" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Telefoon" /></div>
            <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Terug</button><button onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200">Volgende</button></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-gray-600">Stap 3: Master admin</p>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Naam</label><input type="text" value={masterUser.name} onChange={(e) => setMasterUser({ ...masterUser, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Naam" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Wachtwoord</label><input type="password" value={masterUser.password} onChange={(e) => setMasterUser({ ...masterUser, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Wachtwoord" /></div>
            <div className="flex gap-3"><button onClick={() => setStep(2)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Terug</button><button onClick={handleCreateAccount} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"><Sparkles size={20} /> Account aanmaken</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUPER ADMIN PANEL ────────────────────────────────────────────────────────
function SuperAdminPanel({ accounts, setAccounts, onLogout }) {
  const [newForm, setNewForm] = useState(false);
  const [newAccount, setNewAccount] = useState(null);

  const handleDeleteAccount = (id) => {
    if (confirm("Weet je zeker dat je dit account wilt verwijderen?")) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      {newForm && newAccount && <RegisterFlow accounts={accounts} setAccounts={setAccounts} onDone={() => setNewForm(false)} />}
      <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BarcodeLogo size="sm" />
            <h1 className="text-3xl font-bold text-gray-900">Super Admin</h1>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"><LogOut size={20} /> Afmelden</button>
        </div>

        <div className="grid gap-4 mb-8">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{acc.companyName}</h3>
                  <p className="text-sm text-gray-600">{acc.email} • {acc.users.length} gebruikers</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${acc.plan.status === "active" ? "text-green-600" : "text-red-600"}`}>{acc.plan.status.toUpperCase()}</p>
                  <p className="text-xs text-gray-600">{acc.plan.outlets} outlet{acc.plan.outlets > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleDeleteAccount(acc.id)} className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold"><Trash2 size={16} /> Verwijderen</button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { setNewAccount(true); setNewForm(true); }} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"><Plus size={20} /> Nieuw account</button>
      </div>
    </div>
  );
}

// ─── NEW ACCOUNT FORM ─────────────────────────────────────────────────────────
function NewAccountForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", outlets: 1 });

  return (
    <div className="space-y-4">
      <input type="text" placeholder="Bedrijfsnaam" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      <input type="tel" placeholder="Telefoon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Annuleren</button>
        <button onClick={() => onSave(formData)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200">Opslaan</button>
      </div>
    </div>
  );
}

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────
function buildSaldoData(transactions, emballageTypes, suppliers) {
  const saldo = {};
  transactions.forEach(t => {
    if (!saldo[t.supplier]) saldo[t.supplier] = { in: 0, out: 0, items: {} };
    const s = saldo[t.supplier];
    if (t.type === "IN") s.in += t.qty; else s.out += t.qty;
    if (!s.items[t.emballage]) s.items[t.emballage] = { in: 0, out: 0 };
    if (t.type === "IN") s.items[t.emballage].in += t.qty; else s.items[t.emballage].out += t.qty;
  });
  // Add value calculations
  Object.entries(saldo).forEach(([sup, data]) => {
    data.value = Object.entries(data.items).reduce((sum, [name, qty]) => {
      const emb = emballageTypes.find(e => e.name === name);
      return sum + ((qty.in - qty.out) * (emb?.value || 0));
    }, 0);
  });
  return saldo;
}

// ─── CSV EXPORT ──────────────────────────────────────────────────────────────
function exportToCSV(transactions, emballageTypes, suppliers, companyName) {
  const date = new Date().toLocaleDateString("nl-BE");
  const lines = [];

  // Header info
  lines.push(["REGGY RAPPORT", companyName, "", "", "", "", ""]);
  lines.push(["Datum:", date, "", "", "", "", ""]);
  lines.push([]);

  // Saldo per leverancier
  lines.push(["SALDO PER LEVERANCIER", "", "", "", "", "", ""]);
  lines.push(["Leverancier", "Inkomend", "Uitgaand", "Saldo", "Waarde", "", ""]);
  const saldo = buildSaldoData(transactions, emballageTypes, suppliers);
  let totalValue = 0;
  Object.entries(saldo).forEach(([sup, data]) => {
    const s = data.in - data.out;
    totalValue += data.value;
    lines.push([sup, data.in, data.out, s, `€ ${data.value.toFixed(2)}`, "", ""]);
  });
  lines.push(["TOTAAL", "", "", "", `€ ${totalValue.toFixed(2)}`, "", ""]);
  lines.push([]);

  // Detail per leverancier per emballage
  lines.push(["DETAIL PER LEVERANCIER", "", "", "", "", "", ""]);
  lines.push(["Leverancier", "Emballage", "Inkomend", "Uitgaand", "Saldo", "Stukprijs", "Waarde"]);
  Object.entries(saldo).forEach(([sup, data]) => {
    Object.entries(data.items).forEach(([item, qty]) => {
      const emb = emballageTypes.find(e => e.name === item);
      const itemSaldo = qty.in - qty.out;
      const val = itemSaldo * (emb?.value || 0);
      lines.push([sup, item, qty.in, qty.out, itemSaldo, `€ ${(emb?.value || 0).toFixed(2)}`, `€ ${val.toFixed(2)}`]);
    });
  });
  lines.push([]);

  // All transactions
  lines.push(["TRANSACTIES", "", "", "", "", "", ""]);
  lines.push(["Datum", "Type", "Leverancier", "Emballage", "Aantal", "Filiaal", "Opmerking"]);
  [...transactions].sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
    lines.push([t.date, t.type === "IN" ? "Inkomend" : "Uitgaand", t.supplier, t.emballage, t.qty, t.branch, t.note || ""]);
  });

  const csv = lines.map(row => row.map(cell => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM for Excel
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `reggy_export_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ─── PDF EXPORT (HTML → print) ───────────────────────────────────────────────
function exportToPDF(transactions, emballageTypes, users, suppliers, companyName) {
  const date = new Date().toLocaleDateString("nl-BE");
  const saldo = buildSaldoData(transactions, emballageTypes, suppliers);
  const totalIn = transactions.filter(t => t.type === "IN").reduce((s, t) => s + t.qty, 0);
  const totalOut = transactions.filter(t => t.type === "OUT").reduce((s, t) => s + t.qty, 0);
  let totalValue = 0;
  Object.values(saldo).forEach(d => { totalValue += d.value; });

  // Build saldo rows
  const saldoRows = Object.entries(saldo).map(([sup, data]) => {
    const s = data.in - data.out;
    return `<tr><td style="font-weight:600">${sup}</td><td style="color:#059669">+${data.in}</td><td style="color:#e11d48">−${data.out}</td><td style="font-weight:700;color:${s >= 0 ? "#059669" : "#e11d48"}">${s >= 0 ? "+" : ""}${s}</td><td style="text-align:right">€ ${data.value.toFixed(2)}</td></tr>`;
  }).join("");

  // Build detail rows
  const detailRows = Object.entries(saldo).map(([sup, data]) =>
    Object.entries(data.items).map(([item, qty]) => {
      const emb = emballageTypes.find(e => e.name === item);
      const itemSaldo = qty.in - qty.out;
      const val = itemSaldo * (emb?.value || 0);
      return `<tr><td>${sup}</td><td>${item}</td><td style="color:#059669">+${qty.in}</td><td style="color:#e11d48">−${qty.out}</td><td style="font-weight:600;color:${itemSaldo >= 0 ? "#059669" : "#e11d48"}">${itemSaldo >= 0 ? "+" : ""}${itemSaldo}</td><td style="text-align:right">€ ${(emb?.value || 0).toFixed(2)}</td><td style="text-align:right">€ ${val.toFixed(2)}</td></tr>`;
    }).join("")
  ).join("");

  // Build transaction rows (latest 100)
  const transRows = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 100).map(t => {
    const color = t.type === "IN" ? "#059669" : "#e11d48";
    const label = t.type === "IN" ? "↓ IN" : "↑ UIT";
    return `<tr><td>${t.date}</td><td style="color:${color};font-weight:600">${label}</td><td>${t.supplier}</td><td>${t.emballage}</td><td style="text-align:center">${t.qty}</td><td>${t.branch}</td><td style="color:#71717a;font-size:11px">${t.note || "-"}</td></tr>`;
  }).join("");

  const branches = [...new Set(users.filter(u => u.role === "branch").map(u => u.branch))];

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reggy Rapport | ${companyName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #18181b; font-size: 13px; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #ede9fe; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-bars { display: flex; align-items: flex-end; gap: 2.5px; height: 28px; }
  .logo-bars div { width: 4px; border-radius: 2px; }
  .logo-text { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: #18181b; }
  .header-right { text-align: right; }
  .header-right h2 { font-size: 18px; font-weight: 700; color: #18181b; }
  .header-right p { font-size: 12px; color: #71717a; margin-top: 2px; }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
  .stat { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; }
  .stat .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 4px; }
  .stat .val { font-size: 24px; font-weight: 800; }

  /* Section */
  .section { margin-bottom: 28px; }
  .section h3 { font-size: 15px; font-weight: 700; color: #18181b; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f4f4f5; display: flex; align-items: center; gap: 8px; }
  .section h3 .badge { font-size: 11px; font-weight: 600; background: #ede9fe; color: #7c3aed; padding: 2px 8px; border-radius: 6px; }

  /* Table */
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #71717a; padding: 8px 10px; background: #fafafa; border-bottom: 1px solid #e4e4e7; }
  td { padding: 8px 10px; border-bottom: 1px solid #f4f4f5; }
  tr:hover { background: #fafafa; }
  .total-row td { font-weight: 700; border-top: 2px solid #e4e4e7; background: #f5f3ff; }

  /* Footer */
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7; text-align: center; font-size: 11px; color: #a1a1aa; }

  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .page { padding: 20px; }
    .no-print { display: none !important; }
  }
</style></head><body>
<div class="page">
  <div class="no-print" style="text-align:center;margin-bottom:20px">
    <button onclick="window.print()" style="background:#7c3aed;color:#fff;border:none;padding:12px 32px;border-radius:10px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer">Opslaan als PDF</button>
    <p style="font-size:12px;color:#a1a1aa;margin-top:8px">Kies "Opslaan als PDF" in het printvenster</p>
  </div>

  <div class="header">
    <div class="logo">
      <div class="logo-bars">
        <div style="height:100%;background:#a78bfa"></div>
        <div style="height:65%;background:#8b5cf6"></div>
        <div style="height:85%;background:#7c3aed"></div>
        <div style="height:50%;background:#6d28d9"></div>
        <div style="height:95%;background:#7c3aed"></div>
        <div style="height:40%;background:#8b5cf6"></div>
        <div style="height:75%;background:#a78bfa"></div>
      </div>
      <span class="logo-text">Reggy</span>
    </div>
    <div class="header-right">
      <h2>${companyName}</h2>
      <p>Rapport gegenereerd op ${date}</p>
      <p>${branches.length} locatie${branches.length !== 1 ? "s" : ""} • ${transactions.length} transacties</p>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="label">Transacties</div><div class="val" style="color:#18181b">${transactions.length}</div></div>
    <div class="stat"><div class="label">Inkomend</div><div class="val" style="color:#059669">${totalIn}</div></div>
    <div class="stat"><div class="label">Uitgaand</div><div class="val" style="color:#e11d48">${totalOut}</div></div>
    <div class="stat"><div class="label">Inventariswaarde</div><div class="val" style="color:#7c3aed">€${totalValue.toFixed(0)}</div></div>
  </div>

  <div class="section">
    <h3>Saldo per leverancier <span class="badge">${Object.keys(saldo).length} leveranciers</span></h3>
    <table>
      <thead><tr><th>Leverancier</th><th>Inkomend</th><th>Uitgaand</th><th>Saldo</th><th style="text-align:right">Waarde</th></tr></thead>
      <tbody>${saldoRows}
      <tr class="total-row"><td>Totaal</td><td style="color:#059669">+${totalIn}</td><td style="color:#e11d48">−${totalOut}</td><td style="font-weight:700">${totalIn - totalOut >= 0 ? "+" : ""}${totalIn - totalOut}</td><td style="text-align:right">€ ${totalValue.toFixed(2)}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h3>Detail per emballage type</h3>
    <table>
      <thead><tr><th>Leverancier</th><th>Emballage</th><th>In</th><th>Uit</th><th>Saldo</th><th style="text-align:right">Stukprijs</th><th style="text-align:right">Waarde</th></tr></thead>
      <tbody>${detailRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h3>Transactiehistorie <span class="badge">${transactions.length > 100 ? "Laatste 100" : `${transactions.length} stuks`}</span></h3>
    <table>
      <thead><tr><th>Datum</th><th>Type</th><th>Leverancier</th><th>Emballage</th><th style="text-align:center">Aantal</th><th>Filiaal</th><th>Opmerking</th></tr></thead>
      <tbody>${transRows}</tbody>
    </table>
  </div>

  <div class="footer">
    <p>Gegenereerd door Reggy | Smart Packaging Tracker • reggy.com</p>
  </div>
</div>
</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

// ─── EXPORT MODAL ─────────────────────────────────────────────────────────────
function ExportModal({ account, onClose }) {
  const [format, setFormat] = useState("csv");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md lg:max-w-2xl xl:max-w-4xl w-full p-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Download size={24} /> Exporteren</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
            <input type="radio" name="format" value="csv" checked={format === "csv"} onChange={(e) => setFormat(e.target.value)} className="accent-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">CSV / Excel</p>
              <p className="text-sm text-gray-500">Saldo-overzicht, detail per leverancier, alle transacties. Direct te openen in Excel.</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200">
            <input type="radio" name="format" value="pdf" checked={format === "pdf"} onChange={(e) => setFormat(e.target.value)} className="accent-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">PDF Rapport</p>
              <p className="text-sm text-gray-500">Professioneel rapport met Reggy branding, statistieken, saldo en transactiehistorie.</p>
            </div>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200">Annuleren</button>
          <button onClick={() => { format === "csv" ? exportToCSV(account.transactions, account.emballageTypes, account.suppliers, account.companyName) : exportToPDF(account.transactions, account.emballageTypes, account.users, account.suppliers, account.companyName); onClose(); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"><Download size={20} /> Exporteren</button>
        </div>
      </div>
    </div>
  );
}

// ─── BON SCAN MODAL ───────────────────────────────────────────────────────────
function BonScanModal({ emballageTypes, suppliers, branch, onClose, onImport, isEdit = false, initialData = null }) {
  // Edit mode: single item
  const [type, setType] = useState(initialData?.type || "IN");
  const [supplier, setSupplier] = useState(initialData?.supplier || "");
  const [note, setNote] = useState(initialData?.note || "");

  // Multi-line mode (new registrations): array of {emballage, qty} rows
  const [lines, setLines] = useState(
    isEdit
      ? [{ emballage: initialData?.emballage || "", qty: initialData?.qty || 1 }]
      : [{ emballage: "", qty: 1 }]
  );

  const updateLine = (idx, field, value) => {
    setLines(lines.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const addLine = () => {
    setLines([...lines, { emballage: "", qty: 1 }]);
  };

  const removeLine = (idx) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const validLines = lines.filter(l => l.emballage && parseInt(l.qty) > 0);

  const handleImport = () => {
    if (!supplier || validLines.length === 0) return;
    if (isEdit) {
      const l = lines[0];
      onImport({ ...initialData, type, supplier, emballage: l.emballage, qty: parseInt(l.qty), note });
    } else {
      // Send array of transactions
      const items = validLines.map(l => ({
        type, supplier, emballage: l.emballage, qty: parseInt(l.qty), note, branch, date: new Date().toISOString().split("T")[0]
      }));
      onImport(items);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md lg:max-w-2xl xl:max-w-4xl p-6 animate-slide-up shadow-2xl" style={{ maxHeight: "90vh" }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">{isEdit ? <Pencil size={24} /> : <ScanLine size={24} />} {isEdit ? "Transactie bewerken" : "Registratie"}</h2>
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {/* Shared fields: type + supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="IN">↓ Inkomend</option>
                <option value="OUT">↑ Uitgaand</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Leverancier</label>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Selecteer...</option>
                {suppliers.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500">Artikelen</label>
              {!isEdit && <span className="text-xs text-gray-400">{validLines.length} regel{validLines.length !== 1 ? "s" : ""}</span>}
            </div>
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <select value={line.emballage} onChange={(e) => updateLine(idx, "emballage", e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none min-w-0">
                    <option value="">Emballage...</option>
                    {emballageTypes.map((e, i) => <option key={i} value={e.name}>{e.name} (€{e.value})</option>)}
                  </select>
                  <input type="number" value={line.qty} onChange={(e) => updateLine(idx, "qty", e.target.value)} className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center bg-white focus:ring-2 focus:ring-blue-500 outline-none" min="1" placeholder="#" />
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(idx)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"><X size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            {!isEdit && (
              <button onClick={addLine} className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 font-semibold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-1.5">
                <PlusCircle size={16} /> Regel toevoegen
              </button>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Opmerking</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Optioneel" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200">Annuleren</button>
          <button onClick={handleImport} disabled={!supplier || validLines.length === 0} className={`flex-1 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
            {isEdit ? <><Check size={20} /> Opslaan</> : <><Check size={20} /> {validLines.length > 1 ? `${validLines.length} regels registreren` : "Registreren"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ATTACHMENT VIEWER ────────────────────────────────────────────────────────
function AttViewer({ att, onClose }) {
  return att ? <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}><img src={att} alt="attachment" className="max-h-96 rounded-lg" /></div> : null;
}

// ─── MASTER DASHBOARD ─────────────────────────────────────────────────────────
function MasterDashboard({ account }) {
  const branches = [...new Set(account.users.filter(u => u.role === "branch").map(u => u.branch))];
  const totalTrans = account.transactions.length;
  const inCount = account.transactions.filter(t => t.type === "IN").length;
  const outCount = account.transactions.filter(t => t.type === "OUT").length;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 size={28} /> Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-semibold">Totaal transacties</p>
          <p className="text-3xl font-bold text-blue-900">{totalTrans}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <p className="text-sm text-green-600 font-semibold flex items-center gap-1"><ArrowDownCircle size={16} /> Inkomend</p>
          <p className="text-3xl font-bold text-green-900">{inCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
          <p className="text-sm text-red-600 font-semibold flex items-center gap-1"><ArrowUpCircle size={16} /> Uitgaand</p>
          <p className="text-3xl font-bold text-red-900">{outCount}</p>
        </div>
      </div>
      {branches.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Building2 size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Geen filialen ingesteld</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-semibold text-gray-700">Filialen ({branches.length})</p>
          {branches.map((b, i) => <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between shadow-sm"><p className="font-semibold text-gray-900">{b}</p></div>)}
        </div>
      )}
    </div>
  );
}

// ─── MASTER BEHEER (USER MANAGEMENT) ───────────────────────────────────────────
function MasterBeheer({ account, setAccount }) {
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", password: "", branch: null });
  const [toast, setToast] = useState(null);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.password) return;
    const user = { id: "u_" + uid(), name: newUser.name, role: "branch", password: newUser.password, branch: newUser.branch };
    setAccount({ ...account, users: [...account.users, user] });
    setNewUser({ name: "", password: "", branch: null });
    setShowForm(false);
    setToast({ type: "success", message: "Gebruiker toegevoegd!" });
  };

  const handleDeleteUser = (id) => {
    if (id === "master") return;
    setAccount({ ...account, users: account.users.filter(u => u.id !== id) });
    setToast({ type: "success", message: "Gebruiker verwijderd!" });
  };

  const branches = [...new Set(account.users.filter(u => u.role === "branch").map(u => u.branch))];

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Users size={28} /> Gebruikers</h2>
      <div className="space-y-3">
        {account.users.map(u => (
          <div key={u.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">{u.name[0]}</div>
              <div>
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-600">{u.role === "master" ? "Master Admin" : u.branch}</p>
              </div>
            </div>
            {u.role !== "master" && <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-200"><Trash2 size={18} /></button>}
          </div>
        ))}
      </div>
      {showForm && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
          <input type="text" placeholder="Naam" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <input type="password" placeholder="Wachtwoord" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <select value={newUser.branch || ""} onChange={(e) => setNewUser({ ...newUser, branch: e.target.value || null })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Kies filiaal...</option>
            {branches.map((b, i) => <option key={i} value={b}>{b}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-400 transition-all duration-200">Annuleren</button>
            <button onClick={handleAddUser} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"><Plus size={18} /> Toevoegen</button>
          </div>
        </div>
      )}
      {!showForm && <button onClick={() => setShowForm(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"><PlusCircle size={20} /> Gebruiker toevoegen</button>}
    </div>
  );
}

// ─── MASTER LOGBOEK ───────────────────────────────────────────────────────────
function MasterLogboek({ account, setAccount }) {
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const filtered = account.transactions.filter(t => filter === "all" || t.type === filter);

  const handleDeleteTransaction = (id) => {
    setAccount({ ...account, transactions: account.transactions.filter(t => t.id !== id) });
    setToast({ type: "success", message: "Transactie verwijderd!" });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><ClipboardList size={28} /> Logboek</h2>
      <div className="flex gap-2">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>Alles</button>
        <button onClick={() => setFilter("IN")} className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filter === "IN" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>Inkomend</button>
        <button onClick={() => setFilter("OUT")} className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${filter === "OUT" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>Uitgaand</button>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Inbox size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Geen transacties</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 flex-1">
                {t.type === "IN" ? <ArrowDownCircle size={20} className="text-green-600" /> : <ArrowUpCircle size={20} className="text-red-600" />}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{t.emballage} ({t.qty}x)</p>
                  <p className="text-xs text-gray-600">{t.date} • {t.supplier} • {t.branch}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-200"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ABONNEMENT TAB ───────────────────────────────────────────────────────────
function AbonnementTab({ account }) {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><CreditCard size={28} /> Abonnement</h2>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-700">Status</p>
          <p className={`font-bold ${account.plan.status === "active" ? "text-green-600" : "text-red-600"}`}>{account.plan.status.toUpperCase()}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-700">Outlets</p>
          <p className="font-bold text-gray-900">{account.plan.outlets}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-700">Maandelijks bedrag</p>
          <p className="text-xl font-bold text-blue-900">{fmt(calcPrice(account.plan.outlets).total)}</p>
        </div>
        <div className="border-t border-blue-200 pt-4 flex items-center justify-between">
          <p className="text-gray-700">Volgende facturering</p>
          <p className="font-semibold text-gray-900">{account.plan.nextBilling}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">Het abonnement kan alleen gewijzigd worden via de administrateur van uw bedrijf.</p>
    </div>
  );
}

// ─── MASTER APP ──────────────────────────────────────────────────────────────
function MasterApp({ account, user, onLogout, setAccount }) {
  const [masterScreen, setMasterScreen] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BarcodeLogo size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{account.companyName}</h1>
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"><LogOut size={20} /> Afmelden</button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button onClick={() => setMasterScreen("dashboard")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Dashboard</button>
          <button onClick={() => setMasterScreen("logboek")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "logboek" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Logboek</button>
          <button onClick={() => setMasterScreen("beheer")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "beheer" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Beheer</button>
          <button onClick={() => setMasterScreen("abonnement")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "abonnement" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Abonnement</button>
        </div>

        {masterScreen === "dashboard" && <MasterDashboard account={account} />}
        {masterScreen === "logboek" && <MasterLogboek account={account} setAccount={setAccount} />}
        {masterScreen === "beheer" && <MasterBeheer account={account} setAccount={setAccount} />}
        {masterScreen === "abonnement" && <AbonnementTab account={account} />}
      </div>
    </div>
  );
}

// ─── SUPPLIER COLORS ─────────────────────────────────────────────────────────
const SUPPLIER_COLORS = [
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", bar: "#10b981", dot: "bg-emerald-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", bar: "#f59e0b", dot: "bg-amber-500" },
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", bar: "#0ea5e9", dot: "bg-sky-500" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", bar: "#f43f5e", dot: "bg-rose-500" },
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", bar: "#8b5cf6", dot: "bg-violet-500" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", bar: "#f97316", dot: "bg-orange-500" },
];

function getSupplierColor(supplier, allSuppliers) {
  const idx = allSuppliers.indexOf(supplier);
  return SUPPLIER_COLORS[idx % SUPPLIER_COLORS.length];
}

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
function MiniBarChart({ data, maxVal }) {
  if (!maxVal) maxVal = Math.max(...data.map(d => Math.max(d.in, d.out)), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex gap-0.5 items-end" style={{ height: "80px" }}>
            <div className="flex-1 bg-emerald-400 rounded-t-sm transition-all duration-500" style={{ height: `${(d.in / maxVal) * 100}%`, minHeight: d.in ? "4px" : "0" }} />
            <div className="flex-1 bg-rose-400 rounded-t-sm transition-all duration-500" style={{ height: `${(d.out / maxVal) * 100}%`, minHeight: d.out ? "4px" : "0" }} />
          </div>
          <span className="text-[10px] text-gray-400 leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── BRANCH APP ───────────────────────────────────────────────────────────────
function BranchApp({ user, account, setAccount, onLogout, language, setLanguage }) {
  const [screen, setScreen] = useState("overzicht");
  const [scanModal, setScanModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [attViewer, setAttViewer] = useState(null);
  const [toast, setToast] = useState(null);
  const [logFilter, setLogFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const branchTransactions = account.transactions.filter(t => t.branch === user.branch);

  const handleImportTransaction = (transOrArray) => {
    const items = Array.isArray(transOrArray) ? transOrArray : [transOrArray];
    let maxId = Math.max(...account.transactions.map(x => x.id), 0);
    const newTrans = items.map(trans => ({ ...trans, id: ++maxId }));
    setAccount({ ...account, transactions: [...account.transactions, ...newTrans] });
    setScanModal(false);
    setToast({ type: "success", message: items.length > 1 ? `${items.length} transacties geregistreerd!` : "Transactie geregistreerd!" });
  };

  const handleDeleteTransaction = (id) => {
    setAccount({ ...account, transactions: account.transactions.filter(t => t.id !== id) });
    setDeleteConfirm(null);
    setToast({ type: "success", message: "Transactie verwijderd!" });
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveTransaction = (updatedTrans) => {
    const updatedTransactions = account.transactions.map(t => t.id === updatedTrans.id ? updatedTrans : t);
    setAccount({ ...account, transactions: updatedTransactions });
    setEditingTransaction(null);
    setToast({ type: "success", message: "Transactie bijgewerkt!" });
  };

  // Stats
  const inCount = branchTransactions.filter(t => t.type === "IN").length;
  const outCount = branchTransactions.filter(t => t.type === "OUT").length;
  const value = branchTransactions.reduce((sum, t) => {
    const emb = account.emballageTypes.find(e => e.name === t.emballage);
    return sum + (t.type === "IN" ? (emb?.value || 0) * t.qty : -((emb?.value || 0) * t.qty));
  }, 0);

  // Saldo per leverancier
  const supplierSaldo = {};
  branchTransactions.forEach(t => {
    if (!supplierSaldo[t.supplier]) supplierSaldo[t.supplier] = { in: 0, out: 0, items: {} };
    const s = supplierSaldo[t.supplier];
    if (t.type === "IN") s.in += t.qty; else s.out += t.qty;
    if (!s.items[t.emballage]) s.items[t.emballage] = { in: 0, out: 0 };
    if (t.type === "IN") s.items[t.emballage].in += t.qty; else s.items[t.emballage].out += t.qty;
  });

  // Weekly chart data (last 4 weeks)
  const weekData = [];
  const now = new Date();
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (w * 7 + now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekTrans = branchTransactions.filter(t => {
      const d = new Date(t.date);
      return d >= weekStart && d <= weekEnd;
    });
    weekData.push({
      label: `W${Math.ceil((weekStart.getDate()) / 7)}`,
      in: weekTrans.filter(t => t.type === "IN").reduce((s, t) => s + t.qty, 0),
      out: weekTrans.filter(t => t.type === "OUT").reduce((s, t) => s + t.qty, 0),
    });
  }

  // Filtered logboek
  const filteredLog = branchTransactions
    .filter(t => logFilter === "all" || t.type === logFilter)
    .filter(t => !logSearch || t.emballage.toLowerCase().includes(logSearch.toLowerCase()) || t.supplier.toLowerCase().includes(logSearch.toLowerCase()))
    .filter(t => {
      if (!logDateFrom && !logDateTo) return true;
      const tDate = new Date(t.date);
      if (logDateFrom && tDate < new Date(logDateFrom)) return false;
      if (logDateTo && tDate > new Date(logDateTo)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const tabs = [
    { id: "overzicht", label: "Overzicht", icon: <BarChart3 size={18} /> },
    { id: "saldo", label: "Saldo", icon: <TrendingUp size={18} /> },
    { id: "logboek", label: "Logboek", icon: <ClipboardList size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {scanModal && <BonScanModal emballageTypes={account.emballageTypes} suppliers={account.suppliers} branch={user.branch} onClose={() => setScanModal(false)} onImport={handleImportTransaction} />}
      {exportModal && <ExportModal account={account} onClose={() => setExportModal(false)} />}
      {attViewer && <AttViewer att={attViewer} onClose={() => setAttViewer(null)} />}
      {editingTransaction && <BonScanModal emballageTypes={account.emballageTypes} suppliers={account.suppliers} branch={user.branch} onClose={() => setEditingTransaction(null)} onImport={handleSaveTransaction} isEdit={true} initialData={editingTransaction} />}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
            <p className="text-gray-900 font-semibold mb-6">Weet je zeker dat je deze transactie wilt verwijderen?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200">Annuleren</button>
              <button onClick={() => handleDeleteTransaction(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200">Verwijderen</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarcodeLogo size="sm" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{user.branch}</h1>
              <p className="text-xs text-gray-500">{account.companyName}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white hover:bg-gray-50 transition-all duration-200">
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
            <button onClick={() => setExportModal(true)} className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200"><Download size={18} className="text-gray-500" /></button>
            <button onClick={onLogout} className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200"><LogOut size={18} className="text-gray-500" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto px-4 pt-4">

        {screen === "overzicht" && (
          <div className="space-y-4 animate-fade-in">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Totaal</p>
                <p className="text-2xl font-bold text-gray-900">{branchTransactions.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-xs text-gray-500 font-medium">In</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{inCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <p className="text-xs text-gray-500 font-medium">Uit</p>
                </div>
                <p className="text-2xl font-bold text-rose-600">{outCount}</p>
              </div>
            </div>

            {/* Inventory value */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Geschatte waarde inventaris</p>
                  <p className="text-3xl font-bold text-gray-900">{fmt(value)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Package size={24} className="text-purple-500" />
                </div>
              </div>
            </div>

            {/* Weekly activity chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Activiteit laatste 4 weken</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> In</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Uit</span>
                </div>
              </div>
              <MiniBarChart data={weekData} />
            </div>

            {/* Top leveranciers quick view */}
            {Object.keys(supplierSaldo).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Saldo per leverancier</p>
                  <button onClick={() => setScreen("saldo")} className="text-xs text-blue-600 font-semibold hover:text-blue-700">Bekijk alles →</button>
                </div>
                <div className="space-y-2">
                  {Object.entries(supplierSaldo).slice(0, 3).map(([supplier, data]) => {
                    const saldo = data.in - data.out;
                    const color = getSupplierColor(supplier, account.suppliers);
                    return (
                      <div key={supplier} className={`flex items-center justify-between p-3 rounded-xl ${color.bg} border ${color.border}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                          <span className={`text-sm font-semibold ${color.text}`}>{supplier}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-emerald-600 font-medium">+{data.in}</span>
                          <span className="text-rose-600 font-medium">−{data.out}</span>
                          <span className={`font-bold ${saldo >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{saldo >= 0 ? "+" : ""}{saldo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent activity */}
            {branchTransactions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-3">Laatste registraties</p>
                <div className="space-y-2">
                  {branchTransactions.slice(-3).reverse().map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "IN" ? "bg-emerald-50" : "bg-rose-50"}`}>
                        {t.type === "IN" ? <ArrowDownCircle size={16} className="text-emerald-600" /> : <ArrowUpCircle size={16} className="text-rose-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.emballage} ({t.qty}x)</p>
                        <p className="text-xs text-gray-500">{t.supplier} • {t.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {screen === "saldo" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900">Saldo per leverancier</h2>

            {Object.keys(supplierSaldo).length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                <Truck size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Nog geen transacties geregistreerd</p>
              </div>
            ) : (
              Object.entries(supplierSaldo).map(([supplier, data]) => {
                const saldo = data.in - data.out;
                const color = getSupplierColor(supplier, account.suppliers);
                const emb = account.emballageTypes.find(e => e.name === Object.keys(data.items)[0]);
                const totalValue = Object.entries(data.items).reduce((sum, [name, qty]) => {
                  const e = account.emballageTypes.find(x => x.name === name);
                  return sum + ((qty.in - qty.out) * (e?.value || 0));
                }, 0);

                return (
                  <div key={supplier} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Supplier header */}
                    <div className={`px-5 py-4 ${color.bg} border-b ${color.border}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                          <span className={`font-bold ${color.text}`}>{supplier}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">Saldo</span>
                          <span className={`text-lg font-bold ${saldo >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{saldo >= 0 ? "+" : ""}{saldo}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-emerald-600 font-medium">↓ {data.in} in</span>
                        <span className="text-rose-600 font-medium">↑ {data.out} uit</span>
                        <span className="text-gray-600 font-medium">≈ {fmt(totalValue)}</span>
                      </div>
                    </div>

                    {/* Item breakdown */}
                    <div className="px-5 py-3">
                      {Object.entries(data.items).map(([item, qty]) => {
                        const itemSaldo = qty.in - qty.out;
                        return (
                          <div key={item} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-700">{item}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-emerald-600">+{qty.in}</span>
                              <span className="text-rose-600">−{qty.out}</span>
                              <span className={`font-bold min-w-[32px] text-right ${itemSaldo >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{itemSaldo >= 0 ? "+" : ""}{itemSaldo}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {screen === "logboek" && (
          <div className="space-y-3 animate-fade-in">
            {/* Search & filter bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="Zoek emballage of leverancier..." className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Date filters */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="date" value={logDateFrom} onChange={(e) => setLogDateFrom(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex-1 relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="date" value={logDateTo} onChange={(e) => setLogDateTo(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="flex gap-1.5">
              {[["all", "Alles"], ["IN", "Inkomend"], ["OUT", "Uitgaand"]].map(([val, label]) => (
                <button key={val} onClick={() => setLogFilter(val)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${logFilter === val ? (val === "IN" ? "bg-emerald-100 text-emerald-700" : val === "OUT" ? "bg-rose-100 text-rose-700" : "bg-gray-900 text-white") : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{label}</button>
              ))}
            </div>

            {filteredLog.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                <ClipboardList size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">{logSearch ? "Geen resultaten" : "Geen transacties"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLog.map(t => {
                  const color = getSupplierColor(t.supplier, account.suppliers);
                  return (
                    <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "IN" ? "bg-emerald-50" : "bg-rose-50"}`}>
                        {t.type === "IN" ? <ArrowDownCircle size={20} className="text-emerald-600" /> : <ArrowUpCircle size={20} className="text-rose-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{t.emballage}</p>
                          <span className={`text-sm font-bold ${t.type === "IN" ? "text-emerald-600" : "text-rose-600"}`}>{t.type === "IN" ? "+" : "−"}{t.qty}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${color.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />{t.supplier}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{t.date}</span>
                        </div>
                        {t.note && <p className="text-xs text-gray-500 mt-1">{t.note}</p>}
                      </div>
                      <button onClick={() => handleEditTransaction(t)} className="p-2 hover:bg-blue-50 text-gray-300 hover:text-blue-500 rounded-lg transition-all duration-200 flex-shrink-0"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteConfirm(t.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all duration-200 flex-shrink-0"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto px-4 flex items-center justify-around">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setScreen(tab.id)} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all duration-200 ${screen === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
              {tab.icon}
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          ))}
          {/* FAB-style register button */}
          <button onClick={() => setScanModal(true)} className="flex flex-col items-center gap-1 py-2 px-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 -mt-5 hover:bg-blue-700 transition-all duration-200">
              <Plus size={24} className="text-white" />
            </div>
            <span className="text-[10px] font-semibold text-blue-600">Nieuw</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STORAGE & API KEY ────────────────────────────────────────────────────────
function getApiKey() {
  try { return localStorage.getItem(API_KEY_STORAGE) || ""; } catch { return ""; }
}

function setApiKey(key) {
  try { localStorage.setItem(API_KEY_STORAGE, key); } catch {}
}

function loadAccounts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INIT_ACCOUNTS;
  } catch {
    return INIT_ACCOUNTS;
  }
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onRegister, onReset }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState(loadAccounts());

  const handleLogin = () => {
    setError("");

    if (username === SUPER_ADMIN.name && password === SUPER_ADMIN.password) {
      onLogin({ ...SUPER_ADMIN, accountId: null });
      return;
    }

    for (const account of accounts) {
      const user = account.users.find(u => (u.name === username || u.id === username) && u.password === password);
      if (user) {
        onLogin({ ...user, accountId: account.id });
        return;
      }
    }

    setError("Ongeldige gebruikersnaam of wachtwoord");
  };

  const demoAccounts = [
    { label: "Master Admin", user: "Master Admin", pass: "master123" },
    { label: "De Gouden Tap", user: "De Gouden Tap", pass: "tap123" },
    { label: "Café 't Hoekje", user: "Café 't Hoekje", pass: "hoekje123" },
    { label: "Super Admin", user: "Super Admin", pass: "super123" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md lg:max-w-2xl xl:max-w-4xl w-full p-8">
        <div className="flex items-center justify-center mb-8">
          <BarcodeLogo size="lg" />
        </div>

        <div className="space-y-4 mb-6">
          <input type="text" placeholder="Gebruikersnaam" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 mb-4">Inloggen</button>

        {DEMO_MODE && (
          <div className="border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-600 mb-3">Demo accounts:</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((demo, i) => (
                <button key={i} onClick={() => { setUsername(demo.user); setPassword(demo.pass); }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-all duration-200">
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3 text-sm">
          <button onClick={onRegister} className="flex-1 text-blue-600 hover:text-blue-700 font-semibold">Registreren</button>
          {DEMO_MODE && <button onClick={onReset} className="flex-1 text-gray-600 hover:text-gray-700 font-semibold">Reset</button>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const translations = {
  nl: {
    login: "Inloggen",
    register: "Registreren",
    username: "Gebruikersnaam",
    password: "Wachtwoord",
    language: "Taal",
    logout: "Uitloggen",
    settings: "Instellingen",
    overview: "Overzicht",
    balance: "Saldo",
    logbook: "Logboek",
    new: "Nieuw",
  },
  en: {
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    language: "Language",
    logout: "Logout",
    settings: "Settings",
    overview: "Overview",
    balance: "Balance",
    logbook: "Logbook",
    new: "New",
  },
};

function App() {
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [accounts, setAccounts] = useState(loadAccounts());
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [language, setLanguage] = useState("nl");

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  const currentAccount = accounts.find(a => a.id === currentAccountId);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentAccountId(user.accountId);
    if (user.role === "superadmin") {
      setScreen("superadmin");
    } else if (user.role === "master") {
      setScreen("app");
    } else if (user.role === "branch") {
      setScreen("app");
    }
  };

  const handleLogout = () => {
    setScreen("login");
    setCurrentUser(null);
    setCurrentAccountId(null);
  };

  const handleReset = () => {
    if (confirm("Dit zal alle gegevens herstellen naar de standaardwaarden. Doorgaan?")) {
      setAccounts(INIT_ACCOUNTS);
      saveAccounts(INIT_ACCOUNTS);
      handleLogout();
    }
  };

  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} onRegister={() => setScreen("register")} onReset={handleReset} />;
  }

  if (screen === "register") {
    return <RegisterFlow accounts={accounts} setAccounts={setAccounts} onDone={() => setScreen("login")} />;
  }

  if (screen === "superadmin") {
    return <SuperAdminPanel accounts={accounts} setAccounts={setAccounts} onLogout={handleLogout} />;
  }

  if (!currentAccount || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center"><p>Laden...</p></div>;
  }

  if (currentUser.role === "master") {
    return <MasterApp account={currentAccount} user={currentUser} onLogout={handleLogout} setAccount={(acc) => setAccounts(accounts.map(a => a.id === acc.id ? acc : a))} />;
  }

  return <BranchApp user={currentUser} account={currentAccount} setAccount={(acc) => setAccounts(accounts.map(a => a.id === acc.id ? acc : a))} onLogout={handleLogout} language={language} setLanguage={setLanguage} />;
}

export default App;
