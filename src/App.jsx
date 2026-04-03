import { useState, useRef, useEffect } from "react";
import {
  Store, Crown, Settings, BarChart3, ClipboardList, PenSquare, CreditCard, Package,
  Truck, Download, ScanLine, ArrowDownCircle, ArrowUpCircle, Plus, PlusCircle, Pencil,
  Trash2, Paperclip, Key, FileText, TrendingUp, CheckCircle, Check, X, RotateCcw, Eye,
  EyeOff, Sparkles, Inbox, Lock, PackageOpen, AlertCircle, ChevronRight, Search, Filter,
  Calendar, LogOut, User, Building2, Shield
} from "lucide-react";

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
const API_KEY_STORAGE = "emballage_api_key";

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
      {outlets >= MASTER_REQUIRED_FROM && <p className="text-xs text-blue-600 flex items-center gap-1"><CheckCircle size={14} /> Master admin inbegrepen — overzicht van alle filialen</p>}
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">ET</div>
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

// ─── EXPORT FUNCTIONS ────────────────────────────────────────────────────────────
function exportToCSV(transactions, emballageTypes) {
  const header = ["Datum", "Type", "Supplier", "Emballage", "Hoeveelheid", "Filiaal", "Opmerking"];
  const rows = transactions.map(t => [t.date, t.type, t.supplier, t.emballage, t.qty, t.branch, t.note]);
  const csv = [header, ...rows].map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "emballage_export.csv";
  link.click();
}

function exportToPDF(transactions, emballageTypes, users, suppliers, companyName) {
  const content = [
    `REGGY RAPPORT - ${companyName}`,
    `Datum: ${new Date().toLocaleDateString("nl-BE")}`,
    "",
    "TRANSACTIES:",
    ...transactions.slice(0, 50).map(t => `${t.date} | ${t.type} | ${t.supplier} | ${t.emballage} (${t.qty}x) | ${t.branch}`),
    "",
    "EMBALLAGE TYPES:",
    ...emballageTypes.map(e => `${e.name}: €${e.value}`),
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reggy_rapport.txt";
  link.click();
}

// ─── EXPORT MODAL ─────────────────────────────────────────────────────────────
function ExportModal({ account, onClose }) {
  const [format, setFormat] = useState("csv");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md lg:max-w-2xl xl:max-w-4xl w-full p-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Download size={24} /> Exporteren</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="format" value="csv" checked={format === "csv"} onChange={(e) => setFormat(e.target.value)} />
            <div><p className="font-semibold text-gray-900">CSV</p><p className="text-sm text-gray-600">Excel-compatibel formaat</p></div>
          </label>
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="format" value="pdf" checked={format === "pdf"} onChange={(e) => setFormat(e.target.value)} />
            <div><p className="font-semibold text-gray-900">PDF</p><p className="text-sm text-gray-600">Rapport formaat</p></div>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Annuleren</button>
          <button onClick={() => { format === "csv" ? exportToCSV(account.transactions, account.emballageTypes) : exportToPDF(account.transactions, account.emballageTypes, account.users, account.suppliers, account.companyName); onClose(); }} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"><Download size={20} /> Exporteren</button>
        </div>
      </div>
    </div>
  );
}

// ─── BON SCAN MODAL ───────────────────────────────────────────────────────────
function BonScanModal({ emballageTypes, suppliers, branch, onClose, onImport }) {
  const [type, setType] = useState("IN");
  const [supplier, setSupplier] = useState("");
  const [emballage, setEmballage] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const handleImport = () => {
    if (!supplier || !emballage) return;
    onImport({ type, supplier, emballage, qty: parseInt(qty), note, branch, date: new Date().toISOString().split("T")[0] });
    setType("IN"); setSupplier(""); setEmballage(""); setQty(1); setNote("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md lg:max-w-2xl xl:max-w-4xl p-6 animate-slide-up shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><ScanLine size={24} /> Bon scannen</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Type</label><select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="IN">Inkomend</option><option value="OUT">Uitgaand</option></select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Leverancier</label><select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Selecteer...</option>{suppliers.map((s, i) => <option key={i} value={s}>{s}</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Emballage</label><select value={emballage} onChange={(e) => setEmballage(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"><option value="">Selecteer...</option>{emballageTypes.map((e, i) => <option key={i} value={e.name}>{e.name} (€{e.value})</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Hoeveelheid</label><input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="1" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Opmerking</label><input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Optioneel" /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Annuleren</button>
          <button onClick={handleImport} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2"><Plus size={20} /> Toevoegen</button>
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

// ─── BRANCH APP ───────────────────────────────────────────────────────────────
function BranchApp({ user, account, setAccount }) {
  const [screen, setScreen] = useState("overzicht");
  const [scanModal, setScanModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [attViewer, setAttViewer] = useState(null);
  const [toast, setToast] = useState(null);

  const branchTransactions = account.transactions.filter(t => t.branch === user.branch);

  const handleImportTransaction = (trans) => {
    const t = { ...trans, id: Math.max(...account.transactions.map(x => x.id), 0) + 1 };
    setAccount({ ...account, transactions: [...account.transactions, t] });
    setScanModal(false);
    setToast({ type: "success", message: "Transactie geïmporteerd!" });
  };

  const handleDeleteTransaction = (id) => {
    setAccount({ ...account, transactions: account.transactions.filter(t => t.id !== id) });
    setToast({ type: "success", message: "Transactie verwijderd!" });
  };

  const inCount = branchTransactions.filter(t => t.type === "IN").length;
  const outCount = branchTransactions.filter(t => t.type === "OUT").length;
  const value = branchTransactions.reduce((sum, t) => {
    const emb = account.emballageTypes.find(e => e.name === t.emballage);
    return sum + (t.type === "IN" ? (emb?.value || 0) * t.qty : -((emb?.value || 0) * t.qty));
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {scanModal && <BonScanModal emballageTypes={account.emballageTypes} suppliers={account.suppliers} branch={user.branch} onClose={() => setScanModal(false)} onImport={handleImportTransaction} />}
      {exportModal && <ExportModal account={account} onClose={() => setExportModal(false)} />}
      {attViewer && <AttViewer att={attViewer} onClose={() => setAttViewer(null)} />}

      <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">ET</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.branch}</h1>
              <p className="text-sm text-gray-600">{account.companyName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setExportModal(true)} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"><Download size={20} className="text-blue-600" /></button>
            <button onClick={() => setScanModal(true)} className="p-3 bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-700"><ScanLine size={20} /></button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button onClick={() => setScreen("overzicht")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${screen === "overzicht" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Overzicht</button>
          <button onClick={() => setScreen("registreren")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${screen === "registreren" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Registreren</button>
          <button onClick={() => setScreen("logboek")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${screen === "logboek" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Logboek</button>
        </div>

        {screen === "overzicht" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4"><p className="text-sm text-blue-600 font-semibold">Totaal</p><p className="text-3xl font-bold text-blue-900">{branchTransactions.length}</p></div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4"><p className="text-sm text-green-600 font-semibold flex items-center gap-1"><ArrowDownCircle size={16} /> In</p><p className="text-3xl font-bold text-green-900">{inCount}</p></div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4"><p className="text-sm text-red-600 font-semibold flex items-center gap-1"><ArrowUpCircle size={16} /> Uit</p><p className="text-3xl font-bold text-red-900">{outCount}</p></div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <p className="text-sm text-purple-600 font-semibold">Geschatte waarde inventaris</p>
              <p className="text-3xl font-bold text-purple-900">{fmt(value)}</p>
            </div>
          </div>
        )}

        {screen === "registreren" && (
          <div className="animate-fade-in space-y-4">
            {branchTransactions.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Package size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Nog geen transacties</p>
              </div>
            ) : (
              branchTransactions.map(t => (
                <div key={t.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 flex-1">
                    {t.type === "IN" ? <ArrowDownCircle size={20} className="text-green-600" /> : <ArrowUpCircle size={20} className="text-red-600" />}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{t.emballage} ({t.qty}x)</p>
                      <p className="text-xs text-gray-600">{t.date} • {t.supplier} {t.note && `• ${t.note}`}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-200"><Trash2 size={18} /></button>
                </div>
              ))
            )}
          </div>
        )}

        {screen === "logboek" && (
          <div className="animate-fade-in space-y-4">
            {branchTransactions.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <ClipboardList size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Geen transacties</p>
              </div>
            ) : (
              branchTransactions.map(t => (
                <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{t.emballage}</p>
                    <p className={`text-sm font-bold ${t.type === "IN" ? "text-green-600" : "text-red-600"}`}>{t.type === "IN" ? "+" : "−"}{t.qty}x</p>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{t.date} • {t.supplier}</p>
                  {t.note && <p className="text-xs text-gray-700 mb-2">{t.note}</p>}
                </div>
              ))
            )}
          </div>
        )}
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
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">R</div>
          <h1 className="text-3xl font-bold text-gray-900">Reggy</h1>
        </div>

        <div className="space-y-4 mb-6">
          <input type="text" placeholder="Gebruikersnaam" value={username} onChange={(e) => setUsername(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 mb-4">Inloggen</button>

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

        <div className="mt-6 flex gap-3 text-sm">
          <button onClick={onRegister} className="flex-1 text-blue-600 hover:text-blue-700 font-semibold">Registreren</button>
          <button onClick={onReset} className="flex-1 text-gray-600 hover:text-gray-700 font-semibold">Reset</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [accounts, setAccounts] = useState(loadAccounts());
  const [apiKey, setApiKeyState] = useState(getApiKey());

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
    const [masterScreen, setMasterScreen] = useState("dashboard");
    const setCurrentAccount = (acc) => {
      setAccounts(accounts.map(a => a.id === acc.id ? acc : a));
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md lg:max-w-2xl xl:max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">ET</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentAccount.companyName}</h1>
                <p className="text-sm text-gray-600">{currentUser.name}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"><LogOut size={20} /> Afmelden</button>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button onClick={() => setMasterScreen("dashboard")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Dashboard</button>
            <button onClick={() => setMasterScreen("logboek")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "logboek" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Logboek</button>
            <button onClick={() => setMasterScreen("beheer")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "beheer" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Beheer</button>
            <button onClick={() => setMasterScreen("abonnement")} className={`px-4 py-3 font-semibold transition-all duration-200 border-b-2 ${masterScreen === "abonnement" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}>Abonnement</button>
          </div>

          {masterScreen === "dashboard" && <MasterDashboard account={currentAccount} />}
          {masterScreen === "logboek" && <MasterLogboek account={currentAccount} setAccount={setCurrentAccount} />}
          {masterScreen === "beheer" && <MasterBeheer account={currentAccount} setAccount={setCurrentAccount} />}
          {masterScreen === "abonnement" && <AbonnementTab account={currentAccount} />}
        </div>
      </div>
    );
  }

  return <BranchApp user={currentUser} account={currentAccount} setAccount={(acc) => setAccounts(accounts.map(a => a.id === acc.id ? acc : a))} />;
}

export default App;
