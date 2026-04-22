import { useState, useRef, useEffect, useCallback } from "react";
import {
  Settings, BarChart3, ClipboardList, CreditCard, Package,
  Truck, Download, ScanLine, ArrowDownCircle, ArrowUpCircle, Plus, PlusCircle, Pencil,
  Trash2, Key, TrendingUp, CheckCircle, Check, X,
  Sparkles, Inbox, AlertCircle, Search,
  Calendar, LogOut, User, Users, Building2, Camera, Loader2,
  LayoutDashboard, ChevronRight, Bell, Shield, FileText, MapPin,
  Activity, Eye, AlertTriangle, ChevronDown, ChevronUp, Menu, XCircle,
  DollarSign, Hash, Percent, Clock, TrendingDown, MoreHorizontal,
  Upload, Image, Save
} from "lucide-react";
import { useSupabase, setSkipProfileLoad } from "./lib/useSupabase";
import { supabase } from "./lib/supabase";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const DEMO_MODE = false; // Supabase backend is active

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

// ─── ONBOARDING WALKTHROUGH ──────────────────────────────────────────────
const ONBOARDING_KEY = "reggy_onboarding_done";

function OnboardingOverlay({ onDone }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welkom bij Reggy!",
      desc: "In een paar stappen leer je hoe je emballage registreert en je saldo bijhoudt.",
      icon: <Sparkles size={32} className="text-purple-500" />,
    },
    {
      title: "Registreer emballage",
      desc: "Tik op de + knop onderaan om een levering of retour te registreren. Je kunt meerdere items tegelijk invoeren.",
      icon: <Plus size={32} className="text-blue-500" />,
    },
    {
      title: "Bekijk je saldo",
      desc: "Onder 'Saldo' zie je precies hoeveel emballage je uitstaan hebt per leverancier, inclusief de geschatte waarde.",
      icon: <TrendingUp size={32} className="text-emerald-500" />,
    },
    {
      title: "Logboek & exports",
      desc: "In het logboek vind je alle transacties terug. Je kunt zoeken, filteren en exporteren naar CSV of PDF.",
      icon: <ClipboardList size={32} className="text-amber-500" />,
    },
  ];

  const handleFinish = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch {}
    onDone();
  };

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-slide-up">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          {current.icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{current.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{current.desc}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? "bg-blue-600 w-6" : i < step ? "bg-blue-300" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-200">
              Terug
            </button>
          )}
          {step === 0 && (
            <button onClick={handleFinish} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 font-semibold hover:bg-gray-50 transition-all duration-200 text-sm">
              Overslaan
            </button>
          )}
          <button onClick={isLast ? handleFinish : () => setStep(step + 1)} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200">
            {isLast ? "Aan de slag!" : "Volgende"}
          </button>
        </div>
      </div>
    </div>
  );
}

function shouldShowOnboarding() {
  try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
}

// ─── BARCODE SCANNER ──────────────────────────────────────────────────────
function BarcodeScannerModal({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        if (mounted) setError("Camera niet beschikbaar. Controleer je browserinstellingen.");
      }
    }

    startCamera();
    return () => { mounted = false; stopCamera(); };
  }, [stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleManualInput = () => {
    stopCamera();
    onScan(null); // null means: open registration without barcode
  };

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <h3 className="text-white font-semibold flex items-center gap-2"><Camera size={20} /> Scanner</h3>
        <button onClick={handleClose} className="text-white p-2"><X size={24} /></button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-white mb-2">{error}</p>
              <button onClick={handleManualInput} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">
                Handmatig invoeren
              </button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-40 border-2 border-white/60 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                {scanning && <div className="absolute left-2 right-2 h-0.5 bg-red-500 top-1/2 animate-pulse" />}
              </div>
            </div>

            <p className="absolute bottom-24 left-0 right-0 text-center text-white/70 text-sm">
              Richt de camera op een barcode
            </p>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-black/80 px-4 py-4 safe-area-bottom">
        <button onClick={handleManualInput} className="w-full py-3 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-200">
          Handmatig invoeren
        </button>
      </div>
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
  const [step, setStep] = useState(1); // 1: plan, 2: bedrijf, 3: aanmeldgegevens
  const [outlets, setOutlets] = useState(1);
  const [company, setCompany] = useState({ name: "", phone: "" });
  const [credentials, setCredentials] = useState({ email: "", password: "", passwordConfirm: "" });
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!company.name || !credentials.email || !credentials.password) {
      setToast({ type: "error", message: "Alle velden zijn verplicht" });
      return;
    }
    if (credentials.password !== credentials.passwordConfirm) {
      setToast({ type: "error", message: "Wachtwoorden komen niet overeen" });
      return;
    }
    if (credentials.password.length < 6) {
      setToast({ type: "error", message: "Wachtwoord moet minimaal 6 tekens zijn" });
      return;
    }

    setIsLoading(true);
    // Tell useSupabase hook to NOT load profile during registration
    setSkipProfileLoad(true);
    try {
      // 1. Create auth user via Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Geen gebruiker aangemaakt");

      // 1b. Ensure we have an active session (email confirmation may block it)
      if (!authData.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (signInErr) throw signInErr;
      }

      // 2. Create account record
      const { data: accountData, error: accError } = await supabase
        .from("accounts")
        .insert({
          company_name: company.name,
          email: credentials.email,
          plan_outlets: outlets,
          plan_start_date: new Date().toISOString().split("T")[0],
          plan_status: "active",
          plan_next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          is_demo: false,
        })
        .select()
        .single();
      if (accError) throw accError;

      // 3. Create profile linked to auth user and account
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          account_id: accountData.id,
          display_name: company.name,
          role: "master",
          branch: null,
        });
      if (profileError) throw profileError;

      // 4. Add default emballage types
      const defaultEmballage = INIT_EMBALLAGE.map(e => ({
        account_id: accountData.id,
        name: e.name,
        value: e.value,
      }));
      await supabase.from("emballage_types").insert(defaultEmballage);

      // 5. Add default suppliers
      const defaultSuppliers = INIT_SUPPLIERS.map(s => ({
        account_id: accountData.id,
        name: s,
      }));
      await supabase.from("suppliers").insert(defaultSuppliers);

      // 6. Sign out so user can log in fresh (avoids stale profile state)
      await supabase.auth.signOut();

      setToast({ type: "success", message: "Account aangemaakt! Log nu in met je email en wachtwoord." });
      setTimeout(() => onDone(), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setToast({ type: "error", message: err.message || "Er ging iets mis bij het aanmaken" });
    } finally {
      setSkipProfileLoad(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-purple-500 flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md lg:max-w-2xl xl:max-w-4xl w-full p-8 animate-slide-up">
        <div className="flex items-center justify-center mb-6">
          <BarcodeLogo size="md" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Nieuw account</h2>
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-gray-600">Stap 1: Kies uw abonnement</p>
            <PricingCalc outlets={outlets} onChange={setOutlets} />
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200">Volgende</button>
            <button onClick={onDone} className="w-full text-gray-500 text-sm hover:text-gray-700">Terug naar inloggen</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-gray-600">Stap 2: Bedrijfsgegevens</p>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bedrijfsnaam</label><input type="text" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Naam" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Telefoon (optioneel)</label><input type="tel" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Telefoon" /></div>
            <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Terug</button><button onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200">Volgende</button></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-gray-600">Stap 3: Aanmeldgegevens</p>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Email" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Wachtwoord</label><input type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Wachtwoord" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">Wachtwoord herhalen</label><input type="password" value={credentials.passwordConfirm} onChange={(e) => setCredentials({ ...credentials, passwordConfirm: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Wachtwoord herhalen" /></div>
            <div className="flex gap-3"><button onClick={() => setStep(2)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all duration-200">Terug</button><button onClick={handleCreateAccount} disabled={isLoading} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? <><Loader2 size={20} className="animate-spin" /> Aanmaken...</> : <><Sparkles size={20} /> Account aanmaken</>}</button></div>
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

  const handleDeleteAccount = async (id) => {
    if (confirm("Weet je zeker dat je dit account wilt verwijderen?")) {
      try {
        // supabase is imported at the top of App.jsx
        const { error } = await supabase.from("accounts").delete().eq("id", id);
        if (error) throw error;
        setAccounts(accounts.filter(a => a.id !== id));
      } catch (err) {
        alert("Fout bij verwijderen: " + err.message);
      }
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
    <p>Gegenereerd door Reggy | Smart Packaging Tracker • reggy.io</p>
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
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-50">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md md:max-w-lg lg:max-w-2xl p-5 md:p-6 animate-slide-up shadow-2xl mx-auto" style={{ maxHeight: "90vh" }}>
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

// ─── MASTER DASHBOARD (RICH) ──────────────────────────────────────────────────
function MasterDashboard({ account }) {
  // Use branches table if available, otherwise fall back to legacy user branch names
  const branches = (account.branches || []).length > 0
    ? (account.branches || []).map(b => b.name)
    : [...new Set(account.users.filter(u => u.role === "branch" && u.branch).map(u => u.branch))];
  const totalTrans = account.transactions.length;
  const inCount = account.transactions.filter(t => t.type === "IN").length;
  const outCount = account.transactions.filter(t => t.type === "OUT").length;
  const totalValue = account.transactions.reduce((sum, t) => {
    const emb = account.emballageTypes.find(e => e.name === t.emballage);
    const val = (emb?.value || 0) * t.qty;
    return t.type === "IN" ? sum + val : sum - val;
  }, 0);

  // Activity last 4 weeks
  const now = new Date();
  const weekData = [3, 2, 1, 0].map(weeksAgo => {
    const start = new Date(now); start.setDate(start.getDate() - (weeksAgo + 1) * 7);
    const end = new Date(now); end.setDate(end.getDate() - weeksAgo * 7);
    const weekTrans = account.transactions.filter(t => { const d = new Date(t.date); return d >= start && d < end; });
    return {
      label: weeksAgo === 0 ? "Deze week" : `${weeksAgo}w`,
      in: weekTrans.filter(t => t.type === "IN").reduce((s, t) => s + t.qty, 0),
      out: weekTrans.filter(t => t.type === "OUT").reduce((s, t) => s + t.qty, 0),
    };
  });

  // Recent activity (last 5)
  const recentTrans = [...account.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // Branch performance
  const branchStats = branches.map(b => {
    const bt = account.transactions.filter(t => t.branch === b);
    return {
      name: b,
      total: bt.length,
      in: bt.filter(t => t.type === "IN").reduce((s, t) => s + t.qty, 0),
      out: bt.filter(t => t.type === "OUT").reduce((s, t) => s + t.qty, 0),
      lastActivity: bt.length > 0 ? [...bt].sort((a, b2) => b2.date.localeCompare(a.date))[0].date : null,
    };
  });

  // Alerts
  const alerts = [];
  const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  branchStats.forEach(bs => {
    if (!bs.lastActivity || new Date(bs.lastActivity) < oneWeekAgo) {
      alerts.push({ type: "warning", message: `${bs.name} heeft al meer dan een week niets geregistreerd` });
    }
  });
  const saldo = buildSaldoData(account.transactions, account.emballageTypes, account.suppliers);
  Object.entries(saldo).forEach(([sup, data]) => {
    if (data.value > 500) {
      alerts.push({ type: "info", message: `Hoog saldo bij ${sup}: ${fmt(data.value)} uitstaand` });
    }
  });

  return (
    <div className="animate-fade-in space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Transacties</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Hash size={16} className="text-blue-500" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalTrans}</p>
          <p className="text-[10px] text-gray-400 mt-1">{branches.length} filialen actief</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Inkomend</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><ArrowDownCircle size={16} className="text-emerald-500" /></div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{inCount}</p>
          <p className="text-[10px] text-gray-400 mt-1">{totalTrans > 0 ? Math.round(inCount / totalTrans * 100) : 0}% van totaal</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Uitgaand</p>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center"><ArrowUpCircle size={16} className="text-rose-500" /></div>
          </div>
          <p className="text-2xl font-bold text-rose-600">{outCount}</p>
          <p className="text-[10px] text-gray-400 mt-1">{totalTrans > 0 ? Math.round(outCount / totalTrans * 100) : 0}% van totaal</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Inventariswaarde</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><DollarSign size={16} className="text-purple-500" /></div>
          </div>
          <p className="text-2xl font-bold text-purple-700">{fmt(totalValue)}</p>
          <p className="text-[10px] text-gray-400 mt-1">Geschatte waarde</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${a.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
              {a.type === "warning" ? <AlertTriangle size={16} /> : <Bell size={16} />}
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Activiteit laatste 4 weken</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> In</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Uit</span>
            </div>
          </div>
          <MiniBarChart data={weekData} />
        </div>

        {/* Recent activity feed */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-3">Recente activiteit</p>
          {recentTrans.length === 0 ? (
            <div className="text-center py-6"><Inbox size={24} className="mx-auto text-gray-300 mb-2" /><p className="text-xs text-gray-400">Nog geen transacties</p></div>
          ) : (
            <div className="space-y-2">
              {recentTrans.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === "IN" ? "bg-emerald-50" : "bg-rose-50"}`}>
                    {t.type === "IN" ? <ArrowDownCircle size={14} className="text-emerald-600" /> : <ArrowUpCircle size={14} className="text-rose-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.emballage} ({t.qty}x)</p>
                    <p className="text-[10px] text-gray-500">{t.supplier} • {t.branch} • {t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights & Upsell */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-purple-200" />
            <p className="text-sm font-semibold text-purple-100">Inzichten</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{fmt(totalValue)}</p>
              <p className="text-xs text-purple-200 mt-0.5">Emballagewaarde uitstaand</p>
              <p className="text-[10px] text-purple-300 mt-1">
                {totalValue > 0
                  ? `Reggy bespaart je gemiddeld ${fmt(totalValue * 0.15)} per maand door nauwkeurige registratie`
                  : "Start met registreren om inzicht in je emballagewaarde te krijgen"}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.length}/{account.plan.outlets}</p>
              <p className="text-xs text-purple-200 mt-0.5">Filialen actief</p>
              {branches.length >= account.plan.outlets && (
                <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Limiet bereikt — upgrade voor meer filialen</p>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">{account.users.filter(u => u.role === "branch").length}</p>
              <p className="text-xs text-purple-200 mt-0.5">Actieve gebruikers</p>
              {(() => {
                const branchesAtLimit = (account.branches || []).filter(b => {
                  const maxForBranch = (account.maxUsersPerBranch || 2) + (b.extraUsers || 0);
                  const usersInBranch = account.users.filter(u => u.branchId === b.id).length;
                  return usersInBranch >= maxForBranch;
                });
                return branchesAtLimit.length > 0 ? (
                  <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-1"><Users size={10} /> {branchesAtLimit.length} filia{branchesAtLimit.length !== 1 ? "len" : "al"} op gebruikerslimiet</p>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Branch overview */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-gray-900 mb-3">Filiaaloverzicht</p>
        {branchStats.length === 0 ? (
          <div className="text-center py-6"><Building2 size={24} className="mx-auto text-gray-300 mb-2" /><p className="text-xs text-gray-400">Geen filialen ingesteld</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Filiaal</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Transacties</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">In</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Uit</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Laatste activiteit</th>
              </tr></thead>
              <tbody>
                {branchStats.map(bs => (
                  <tr key={bs.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900 flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {bs.name}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{bs.total}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">+{bs.in}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-medium">−{bs.out}</td>
                    <td className="py-2.5 px-3 text-right text-gray-400 text-xs">{bs.lastActivity || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MASTER BEHEER (USER MANAGEMENT — per branch) ────────────────────────────
function MasterBeheer({ account, setAccount }) {
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", branchId: "" });
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterBranch, setFilterBranch] = useState("all");

  const branches = account.branches || [];
  const maxPerBranch = account.maxUsersPerBranch || 2;
  const branchUsers = account.users.filter(u => u.role === "branch");
  const totalUsers = account.users.length;

  const usersInBranch = (branchId) => branchUsers.filter(u => u.branchId === branchId).length;
  const maxForBranch = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return maxPerBranch + (branch?.extraUsers || 0);
  };

  const handleAddUser = async () => {
    if (!newUser.firstName.trim() || !newUser.lastName.trim() || !newUser.email || !newUser.password || !newUser.branchId) {
      setToast({ type: "error", message: "Voornaam, achternaam, email, wachtwoord en filiaal zijn verplicht" }); return;
    }
    if (newUser.password.length < 6) { setToast({ type: "error", message: "Wachtwoord moet minimaal 6 tekens zijn" }); return; }

    const branch = branches.find(b => b.id === newUser.branchId);
    if (!branch) { setToast({ type: "error", message: "Kies een geldig filiaal" }); return; }

    const branchMax = maxForBranch(newUser.branchId);
    const currentCount = usersInBranch(newUser.branchId);
    if (currentCount >= branchMax) {
      setToast({ type: "error", message: `Dit filiaal heeft al ${branchMax} gebruiker${branchMax !== 1 ? "s" : ""} (${maxPerBranch} basis${branch.extraUsers ? ` + ${branch.extraUsers} extra` : ""}). Koop extra gebruikers onder "Abonnement".` }); return;
    }

    setIsLoading(true);
    const displayName = `${newUser.firstName.trim()} ${newUser.lastName.trim()}`;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: { data: { display_name: displayName, branch: branch.name } }
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Gebruiker kon niet aangemaakt worden");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId, account_id: account.id, display_name: displayName,
        first_name: newUser.firstName.trim(), last_name: newUser.lastName.trim(),
        phone: newUser.phone.trim() || null, role: "branch",
        branch: branch.name, branch_id: newUser.branchId,
      });
      if (profileError) throw profileError;

      setAccount({
        ...account,
        users: [...account.users, {
          id: userId, name: displayName, firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(), phone: newUser.phone.trim(),
          role: "branch", branch: branch.name, branchId: newUser.branchId,
          branchLogoUrl: null,
        }]
      });
      setNewUser({ firstName: "", lastName: "", email: "", password: "", phone: "", branchId: "" });
      setShowForm(false);
      setToast({ type: "success", message: `${displayName} toegevoegd aan ${branch.name}!` });
    } catch (err) {
      const msg = err.message?.includes("already registered") ? "Dit emailadres is al in gebruik" : err.message || "Er ging iets mis";
      setToast({ type: "error", message: msg });
    } finally { setIsLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    const user = account.users.find(u => u.id === id);
    if (!user || user.role === "master") return;
    if (!confirm(`Weet je zeker dat je ${user.name} wilt verwijderen?`)) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      setAccount({ ...account, users: account.users.filter(u => u.id !== id) });
      setToast({ type: "success", message: "Gebruiker verwijderd!" });
    } catch (err) { setToast({ type: "error", message: "Fout: " + err.message }); }
  };

  const filteredUsers = filterBranch === "all" ? account.users :
    filterBranch === "unassigned" ? account.users.filter(u => u.role === "branch" && !u.branchId) :
    filterBranch === "master" ? account.users.filter(u => u.role === "master") :
    account.users.filter(u => u.branchId === filterBranch);

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Summary bar */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">{totalUsers} gebruiker{totalUsers !== 1 ? "s" : ""}</p>
          <p className="text-xs text-blue-600">{branches.length} filia{branches.length !== 1 ? "len" : "al"} • max {maxPerBranch} per filiaal</p>
        </div>
      </div>

      {/* Branch filter */}
      {branches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterBranch("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterBranch === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Alle</button>
          {branches.map(b => (
            <button key={b.id} onClick={() => setFilterBranch(b.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterBranch === b.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {b.name} ({usersInBranch(b.id)}/{maxForBranch(b.id)})
            </button>
          ))}
        </div>
      )}

      {/* User list grouped by branch */}
      {branches.length > 0 && filterBranch === "all" ? (
        <div className="space-y-6">
          {/* Master admins first */}
          {account.users.filter(u => u.role === "master").length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Master Admin</p>
              <div className="space-y-2">
                {account.users.filter(u => u.role === "master").map(u => (
                  <div key={u.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br from-purple-400 to-purple-600">{(u.name || "?")[0]}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-500">Master Admin</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Per branch */}
          {branches.map(b => {
            const bUsers = branchUsers.filter(u => u.branchId === b.id);
            return (
              <div key={b.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1"><MapPin size={12} /> {b.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${bUsers.length >= maxForBranch(b.id) ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {bUsers.length}/{maxForBranch(b.id)}
                  </span>
                </div>
                <div className="space-y-2">
                  {bUsers.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center"><p className="text-xs text-gray-400">Geen gebruikers in dit filiaal</p></div>
                  ) : bUsers.map(u => (
                    <div key={u.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600">{(u.name || "?")[0]}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                          <p className="text-[10px] text-gray-500">{u.phone ? `${u.phone} • ` : ""}{b.name}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all duration-200 flex-shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Unassigned branch users (legacy) */}
          {branchUsers.filter(u => !u.branchId).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Niet toegewezen</p>
              <div className="space-y-2">
                {branchUsers.filter(u => !u.branchId).map(u => (
                  <div key={u.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-amber-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-600">{(u.name || "?")[0]}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-amber-600">{u.branch || "Geen filiaal"} (legacy)</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all duration-200 flex-shrink-0"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Simple flat list when filtering */
        <div className="space-y-2">
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${u.role === "master" ? "bg-gradient-to-br from-purple-400 to-purple-600" : "bg-gradient-to-br from-blue-400 to-blue-600"}`}>{(u.name || "?")[0]}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-500">{u.role === "master" ? "Master Admin" : u.branch || "Geen filiaal"}{u.phone ? ` • ${u.phone}` : ""}</p>
                </div>
              </div>
              {u.role !== "master" && <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all duration-200 flex-shrink-0"><Trash2 size={16} /></button>}
            </div>
          ))}
          {filteredUsers.length === 0 && <div className="bg-gray-50 rounded-xl p-8 text-center"><Users size={24} className="mx-auto text-gray-300 mb-2" /><p className="text-xs text-gray-400">Geen gebruikers gevonden</p></div>}
        </div>
      )}

      {/* Add user form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Nieuwe gebruiker</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Voornaam *" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Achternaam *" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <input type="email" placeholder="E-mailadres *" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="password" placeholder="Wachtwoord * (min. 6 tekens)" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="tel" placeholder="Mobiel nummer (optioneel)" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={newUser.branchId} onChange={(e) => setNewUser({ ...newUser, branchId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Kies filiaal... *</option>
            {branches.map(b => {
              const count = usersInBranch(b.id);
              const bMax = maxForBranch(b.id);
              const full = count >= bMax;
              return <option key={b.id} value={b.id} disabled={full}>{b.name} ({count}/{bMax}){full ? " — vol" : ""}</option>;
            })}
          </select>
          {branches.length === 0 && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">Maak eerst filialen aan onder "Filialen" voordat je gebruikers toevoegt.</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setNewUser({ firstName: "", lastName: "", email: "", password: "", phone: "", branchId: "" }); }} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">Annuleren</button>
            <button onClick={handleAddUser} disabled={isLoading || branches.length === 0} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Toevoegen
            </button>
          </div>
        </div>
      )}
      {!showForm && (() => {
        const allBranchesFull = branches.length > 0 && branches.every(b => usersInBranch(b.id) >= maxForBranch(b.id));
        const noBranches = branches.length === 0;
        return allBranchesFull ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <Users size={20} className="mx-auto text-amber-500 mb-1" />
            <p className="text-sm font-semibold text-amber-800">Alle filialen zitten vol</p>
            <p className="text-xs text-amber-600 mt-1">Verwijder een gebruiker of koop extra gebruikersplekken onder "Abonnement".</p>
          </div>
        ) : noBranches ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <Building2 size={20} className="mx-auto text-gray-400 mb-1" />
            <p className="text-sm font-semibold text-gray-700">Maak eerst filialen aan</p>
            <p className="text-xs text-gray-500 mt-1">Ga naar "Filialen" om je eerste filiaal te maken.</p>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200">
            <PlusCircle size={16} /> Gebruiker toevoegen
          </button>
        );
      })()}
    </div>
  );
}

// ─── FILIALEN BEHEER (BRANCH MANAGEMENT) ─────────────────────────────────────
function BranchManagement({ account, setAccount }) {
  const [showForm, setShowForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [editingBranch, setEditingBranch] = useState(null);
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const branches = account.branches || [];
  const maxBranches = account.plan.outlets || 1;
  const canAddBranch = branches.length < maxBranches;

  // Legacy branches (from users who have branch names but no branch_id — backwards compat)
  const legacyBranches = [...new Set(
    account.users.filter(u => u.role === "branch" && u.branch && !u.branchId).map(u => u.branch)
  )].filter(name => !branches.some(b => b.name === name));

  const getBranchStats = (branchName) => {
    const bt = account.transactions.filter(t => t.branch === branchName);
    const inQty = bt.filter(t => t.type === "IN").reduce((s, t) => s + t.qty, 0);
    const outQty = bt.filter(t => t.type === "OUT").reduce((s, t) => s + t.qty, 0);
    const userCount = account.users.filter(u => u.role === "branch" && (u.branchId ? branches.find(b => b.id === u.branchId)?.name === branchName : u.branch === branchName)).length;
    const lastDate = bt.length > 0 ? [...bt].sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
    return { total: bt.length, in: inQty, out: outQty, userCount, lastDate };
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;
    if (!canAddBranch) { setToast({ type: "error", message: `Maximaal ${maxBranches} filia${maxBranches !== 1 ? "len" : "al"} voor jouw abonnement.` }); return; }
    if (branches.some(b => b.name.toLowerCase() === newBranchName.trim().toLowerCase())) { setToast({ type: "error", message: "Er bestaat al een filiaal met deze naam" }); return; }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("branches").insert({ account_id: account.id, name: newBranchName.trim() }).select().single();
      if (error) throw error;
      setAccount({ ...account, branches: [...branches, { id: data.id, name: data.name, logoUrl: null }] });
      setNewBranchName("");
      setShowForm(false);
      setToast({ type: "success", message: `Filiaal "${data.name}" aangemaakt!` });
    } catch (err) { setToast({ type: "error", message: err.message }); }
    finally { setIsLoading(false); }
  };

  const handleRenameBranch = async (branchId) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from("branches").update({ name: editName.trim() }).eq("id", branchId);
      if (error) throw error;
      setAccount({ ...account, branches: branches.map(b => b.id === branchId ? { ...b, name: editName.trim() } : b) });
      setEditingBranch(null);
      setToast({ type: "success", message: "Naam bijgewerkt!" });
    } catch (err) { setToast({ type: "error", message: err.message }); }
    finally { setIsLoading(false); }
  };

  const handleDeleteBranch = async (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    const usersInBranch = account.users.filter(u => u.branchId === branchId).length;
    if (usersInBranch > 0) { setToast({ type: "error", message: `Kan niet verwijderen: er ${usersInBranch === 1 ? "is" : "zijn"} nog ${usersInBranch} gebruiker${usersInBranch !== 1 ? "s" : ""} gekoppeld.` }); return; }
    if (!confirm(`"${branch?.name}" verwijderen?`)) return;
    try {
      const { error } = await supabase.from("branches").delete().eq("id", branchId);
      if (error) throw error;
      setAccount({ ...account, branches: branches.filter(b => b.id !== branchId) });
      setToast({ type: "success", message: "Filiaal verwijderd!" });
    } catch (err) { setToast({ type: "error", message: err.message }); }
  };

  const handleBranchLogo = async (branchId, base64) => {
    try {
      const { error } = await supabase.from("branches").update({ logo_url: base64 }).eq("id", branchId);
      if (error) throw error;
      setAccount({ ...account, branches: branches.map(b => b.id === branchId ? { ...b, logoUrl: base64 } : b) });
      setToast({ type: "success", message: "Logo bijgewerkt!" });
    } catch (err) {
      console.warn("Could not save branch logo:", err.message);
      setAccount({ ...account, branches: branches.map(b => b.id === branchId ? { ...b, logoUrl: base64 } : b) });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Usage bar */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">{branches.length} van {maxBranches} filia{maxBranches !== 1 ? "len" : "al"}</p>
          <p className="text-xs text-blue-600">Abonnement: {maxBranches} outlet{maxBranches !== 1 ? "s" : ""}</p>
        </div>
        <div className="text-right">
          <div className="w-32 h-2 bg-blue-200 rounded-full">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.min(100, (branches.length / maxBranches) * 100)}%` }} />
          </div>
          <p className="text-[10px] text-blue-500 mt-1">{branches.length}/{maxBranches} gebruikt</p>
        </div>
      </div>

      {/* Branch cards */}
      {branches.length === 0 && legacyBranches.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">Nog geen filialen aangemaakt</p>
          <p className="text-xs text-gray-400 mt-1">Maak je eerste filiaal aan om te beginnen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map(b => {
            const stats = getBranchStats(b.name);
            const isEditing = editingBranch === b.id;
            return (
              <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <LogoUpload currentUrl={b.logoUrl} onUpload={(base64) => handleBranchLogo(b.id, base64)} label="" size="sm" />
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex gap-2 mb-2">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
                        <button onClick={() => handleRenameBranch(b.id)} disabled={isLoading} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"><Check size={14} /></button>
                        <button onClick={() => setEditingBranch(null)} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                        <button onClick={() => { setEditingBranch(b.id); setEditName(b.name); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><Pencil size={12} /></button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users size={12} /> {stats.userCount} gebruiker{stats.userCount !== 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><Activity size={12} /> {stats.total} transacties</span>
                      <span className="text-emerald-600">↓ {stats.in}</span>
                      <span className="text-rose-600">↑ {stats.out}</span>
                      {stats.lastDate && <span className="text-gray-400">Laatste: {stats.lastDate}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteBranch(b.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all flex-shrink-0" title="Verwijderen"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}

          {/* Legacy branches */}
          {legacyBranches.length > 0 && (
            <>
              <p className="text-xs font-semibold text-amber-600 pt-2">Oude filialen (van voor de update)</p>
              {legacyBranches.map(name => {
                const stats = getBranchStats(name);
                return (
                  <div key={name} className="bg-white rounded-xl p-4 shadow-sm border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">{name} <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">Legacy</span></p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>{stats.userCount} gebruiker{stats.userCount !== 1 ? "s" : ""}</span>
                          <span>{stats.total} transacties</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Add branch form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Nieuw filiaal</p>
          <input type="text" placeholder="Filiaalnaam" value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setNewBranchName(""); }} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">Annuleren</button>
            <button onClick={handleCreateBranch} disabled={isLoading || !newBranchName.trim()} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Aanmaken
            </button>
          </div>
        </div>
      )}
      {!showForm && (
        canAddBranch ? (
          <button onClick={() => setShowForm(true)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200">
            <PlusCircle size={16} /> Filiaal toevoegen ({branches.length}/{maxBranches})
          </button>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-amber-800">Limiet bereikt ({branches.length}/{maxBranches} filialen)</p>
            <p className="text-xs text-amber-600 mt-1">Upgrade je abonnement om meer filialen toe te voegen.</p>
          </div>
        )
      )}
    </div>
  );
}

// ─── LEVERANCIERSSALDO (COMPANY LEVEL) ───────────────────────────────────────
function CompanySupplierBalances({ account }) {
  const saldo = buildSaldoData(account.transactions, account.emballageTypes, account.suppliers);
  const totalValue = Object.values(saldo).reduce((s, d) => s + d.value, 0);
  const entries = Object.entries(saldo).sort((a, b) => b[1].value - a[1].value);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Total card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white">
        <p className="text-sm font-medium text-purple-200">Totale emballagewaarde uitstaand</p>
        <p className="text-3xl font-bold mt-1">{fmt(totalValue)}</p>
        <p className="text-xs text-purple-300 mt-2">{entries.length} leverancier{entries.length !== 1 ? "s" : ""} • {account.transactions.length} transacties</p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100"><Truck size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500">Nog geen transacties</p></div>
      ) : (
        <div className="space-y-3">
          {entries.map(([supplier, data]) => {
            const saldoVal = data.in - data.out;
            const color = getSupplierColor(supplier, account.suppliers);
            const pct = totalValue > 0 ? (data.value / totalValue * 100) : 0;
            return (
              <div key={supplier} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`px-4 py-3 ${color.bg} border-b ${color.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                    <span className={`font-bold text-sm ${color.text}`}>{supplier}</span>
                    <span className="text-[10px] text-gray-400 ml-1">{Math.round(pct)}% van totaal</span>
                  </div>
                  <span className="text-sm font-bold text-purple-700">{fmt(data.value)}</span>
                </div>
                <div className="px-4 py-3">
                  <div className="flex gap-6 text-sm mb-2">
                    <span className="text-emerald-600 font-medium">↓ {data.in} in</span>
                    <span className="text-rose-600 font-medium">↑ {data.out} uit</span>
                    <span className={`font-bold ${saldoVal >= 0 ? "text-emerald-700" : "text-rose-700"}`}>Saldo: {saldoVal >= 0 ? "+" : ""}{saldoVal}</span>
                  </div>
                  {/* Per branch breakdown */}
                  <div className="space-y-1 mt-2">
                    {[...new Set(account.transactions.filter(t => t.supplier === supplier).map(t => t.branch))].map(branch => {
                      const bt = account.transactions.filter(t => t.supplier === supplier && t.branch === branch);
                      const bIn = bt.filter(t => t.type === "IN").reduce((s, t) => s + t.qty, 0);
                      const bOut = bt.filter(t => t.type === "OUT").reduce((s, t) => s + t.qty, 0);
                      return (
                        <div key={branch} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-600 flex items-center gap-1"><MapPin size={10} className="text-gray-400" /> {branch}</span>
                          <div className="flex gap-3">
                            <span className="text-emerald-600">+{bIn}</span>
                            <span className="text-rose-600">−{bOut}</span>
                            <span className="font-semibold text-gray-700 min-w-[28px] text-right">{bIn - bOut >= 0 ? "+" : ""}{bIn - bOut}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── EMBALLAGE & LEVERANCIER BEHEER ──────────────────────────────────────────
function EmballageBeheer({ account, setAccount }) {
  const [tab, setTab] = useState("emballage");
  const [newEmb, setNewEmb] = useState({ name: "", value: "" });
  const [newSup, setNewSup] = useState("");
  const [toast, setToast] = useState(null);

  const handleAddEmballage = async () => {
    if (!newEmb.name || !newEmb.value) return;
    try {
      const { data, error } = await supabase.from("emballage_types").insert({ account_id: account.id, name: newEmb.name, value: parseFloat(newEmb.value) }).select().single();
      if (error) throw error;
      setAccount({ ...account, emballageTypes: [...account.emballageTypes, { name: newEmb.name, value: parseFloat(newEmb.value), id: data.id }] });
      setNewEmb({ name: "", value: "" });
      setToast({ type: "success", message: `${newEmb.name} toegevoegd` });
    } catch (err) { setToast({ type: "error", message: err.message }); }
  };

  const handleDeleteEmballage = async (name) => {
    if (!confirm(`"${name}" verwijderen?`)) return;
    try {
      const { error } = await supabase.from("emballage_types").delete().eq("account_id", account.id).eq("name", name);
      if (error) throw error;
      setAccount({ ...account, emballageTypes: account.emballageTypes.filter(e => e.name !== name) });
      setToast({ type: "success", message: "Verwijderd" });
    } catch (err) { setToast({ type: "error", message: err.message }); }
  };

  const handleAddSupplier = async () => {
    if (!newSup.trim()) return;
    try {
      const { error } = await supabase.from("suppliers").insert({ account_id: account.id, name: newSup.trim() });
      if (error) throw error;
      setAccount({ ...account, suppliers: [...account.suppliers, newSup.trim()] });
      setNewSup("");
      setToast({ type: "success", message: `${newSup} toegevoegd` });
    } catch (err) { setToast({ type: "error", message: err.message }); }
  };

  const handleDeleteSupplier = async (name) => {
    if (!confirm(`"${name}" verwijderen?`)) return;
    try {
      const { error } = await supabase.from("suppliers").delete().eq("account_id", account.id).eq("name", name);
      if (error) throw error;
      setAccount({ ...account, suppliers: account.suppliers.filter(s => s !== name) });
      setToast({ type: "success", message: "Verwijderd" });
    } catch (err) { setToast({ type: "error", message: err.message }); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex gap-2">
        <button onClick={() => setTab("emballage")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "emballage" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}><Package size={14} className="inline mr-1" /> Emballage types</button>
        <button onClick={() => setTab("suppliers")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "suppliers" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}><Truck size={14} className="inline mr-1" /> Leveranciers</button>
      </div>

      {tab === "emballage" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Naam (bijv. Biervat 50L)" value={newEmb.name} onChange={(e) => setNewEmb({ ...newEmb, name: e.target.value })} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            <input type="number" placeholder="€ waarde" value={newEmb.value} onChange={(e) => setNewEmb({ ...newEmb, value: e.target.value })} className="w-24 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" step="0.50" />
            <button onClick={handleAddEmballage} disabled={!newEmb.name || !newEmb.value} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-purple-700 transition-all"><Plus size={16} /></button>
          </div>
          <div className="space-y-2">
            {account.emballageTypes.map((e, i) => (
              <div key={i} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-purple-400" />
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-purple-600">{fmt(e.value)}</span>
                  <button onClick={() => handleDeleteEmballage(e.name)} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "suppliers" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Leveranciersnaam" value={newSup} onChange={(e) => setNewSup(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            <button onClick={handleAddSupplier} disabled={!newSup.trim()} className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-purple-700 transition-all"><Plus size={16} /></button>
          </div>
          <div className="space-y-2">
            {account.suppliers.map((s, i) => {
              const color = getSupplierColor(s, account.suppliers);
              return (
                <div key={i} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                    <span className="text-sm font-medium text-gray-900">{s}</span>
                  </div>
                  <button onClick={() => handleDeleteSupplier(s)} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ALERTS & NOTIFICATIES ───────────────────────────────────────────────────
function AlertsPanel({ account }) {
  const allBranchNames = (account.branches || []).length > 0
    ? (account.branches || []).map(b => b.name)
    : [...new Set(account.users.filter(u => u.role === "branch" && u.branch).map(u => u.branch))];
  const alerts = [];

  // Inactive branches
  const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  allBranchNames.forEach(b => {
    const bt = account.transactions.filter(t => t.branch === b);
    const lastDate = bt.length > 0 ? [...bt].sort((a, b2) => b2.date.localeCompare(a.date))[0].date : null;
    if (!lastDate || new Date(lastDate) < oneWeekAgo) {
      alerts.push({ severity: "warning", title: `${b} is inactief`, message: `Laatste registratie: ${lastDate || "nooit"}`, icon: <Clock size={16} /> });
    }
  });

  // High supplier balances
  const saldo = buildSaldoData(account.transactions, account.emballageTypes, account.suppliers);
  Object.entries(saldo).forEach(([sup, data]) => {
    if (data.value > 500) alerts.push({ severity: "info", title: `Hoog saldo: ${sup}`, message: `${fmt(data.value)} uitstaand emballagewaarde`, icon: <TrendingUp size={16} /> });
    if (data.in - data.out < -10) alerts.push({ severity: "error", title: `Negatief saldo: ${sup}`, message: `Saldo: ${data.in - data.out} stuks — meer uitgaand dan inkomend`, icon: <TrendingDown size={16} /> });
  });

  // Low activity overall
  const thisWeek = account.transactions.filter(t => { const d = new Date(t.date); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; });
  if (thisWeek.length === 0 && account.transactions.length > 0) {
    alerts.push({ severity: "warning", title: "Geen activiteit deze week", message: "Er zijn deze week nog geen transacties geregistreerd", icon: <Activity size={16} /> });
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Bell size={16} />
        <span>{alerts.length} melding{alerts.length !== 1 ? "en" : ""}</span>
      </div>
      {alerts.length === 0 ? (
        <div className="bg-emerald-50 rounded-xl p-8 text-center border border-emerald-200">
          <CheckCircle size={32} className="mx-auto text-emerald-400 mb-2" />
          <p className="text-emerald-700 font-semibold">Alles ziet er goed uit!</p>
          <p className="text-sm text-emerald-600 mt-1">Geen meldingen op dit moment</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${a.severity === "error" ? "bg-red-50 border-red-200" : a.severity === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
              <div className={`mt-0.5 ${a.severity === "error" ? "text-red-500" : a.severity === "warning" ? "text-amber-500" : "text-blue-500"}`}>{a.icon}</div>
              <div>
                <p className={`text-sm font-semibold ${a.severity === "error" ? "text-red-800" : a.severity === "warning" ? "text-amber-800" : "text-blue-800"}`}>{a.title}</p>
                <p className={`text-xs mt-0.5 ${a.severity === "error" ? "text-red-600" : a.severity === "warning" ? "text-amber-600" : "text-blue-600"}`}>{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────
function AuditLog({ account }) {
  const [search, setSearch] = useState("");

  // Build audit entries from transactions (since audit_log table may not have data yet)
  const auditEntries = [...account.transactions].sort((a, b) => b.date.localeCompare(a.date)).map(t => ({
    id: t.id,
    date: t.date,
    user: t.branch,
    action: t.type === "IN" ? "Inkomende registratie" : "Uitgaande registratie",
    detail: `${t.emballage} (${t.qty}x) — ${t.supplier}`,
    type: t.type,
  }));

  const filtered = auditEntries.filter(e =>
    !search || e.user.toLowerCase().includes(search.toLowerCase()) ||
    e.detail.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek in audit log..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <p className="text-xs text-gray-400">{filtered.length} vermelding{filtered.length !== 1 ? "en" : ""}</p>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100"><Shield size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500">Geen audit vermeldingen</p></div>
      ) : (
        <div className="space-y-1">
          {filtered.slice(0, 50).map(e => (
            <div key={e.id} className="bg-white rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${e.type === "IN" ? "bg-emerald-50" : "bg-rose-50"}`}>
                {e.type === "IN" ? <ArrowDownCircle size={14} className="text-emerald-600" /> : <ArrowUpCircle size={14} className="text-rose-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{e.action}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{e.user}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{e.detail}</p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">{e.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MASTER LOGBOEK ───────────────────────────────────────────────────────────
function MasterLogboek({ account, setAccount }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState(null);

  const filtered = account.transactions
    .filter(t => filter === "all" || t.type === filter)
    .filter(t => !search || t.emballage.toLowerCase().includes(search.toLowerCase()) || t.supplier.toLowerCase().includes(search.toLowerCase()) || t.branch.toLowerCase().includes(search.toLowerCase()))
    .filter(t => {
      if (!dateFrom && !dateTo) return true;
      const tDate = new Date(t.date);
      if (dateFrom && tDate < new Date(dateFrom)) return false;
      if (dateTo && tDate > new Date(dateTo)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDeleteTransaction = async (id) => {
    try {
      // supabase is imported at the top of App.jsx
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      setAccount({ ...account, transactions: account.transactions.filter(t => t.id !== id) });
      setToast({ type: "success", message: "Transactie verwijderd!" });
    } catch (err) {
      setToast({ type: "error", message: "Fout bij verwijderen: " + err.message });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between"><p className="text-xs text-gray-400">{filtered.length} transactie{filtered.length !== 1 ? "s" : ""}</p></div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoek op emballage, leverancier of filiaal..." className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      {/* Date filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div className="flex-1 relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>Alles</button>
        <button onClick={() => setFilter("IN")} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 ${filter === "IN" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>Inkomend</button>
        <button onClick={() => setFilter("OUT")} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 ${filter === "OUT" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}>Uitgaand</button>
        {(search || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setFilter("all"); }} className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all duration-200 flex items-center gap-1">
            <X size={14} /> Reset
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">{filtered.length} transactie{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Inbox size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">{search ? "Geen resultaten" : "Geen transacties"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-lg p-3 md:p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                {t.type === "IN" ? <ArrowDownCircle size={18} className="text-green-600 flex-shrink-0 md:w-5 md:h-5" /> : <ArrowUpCircle size={18} className="text-red-600 flex-shrink-0 md:w-5 md:h-5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{t.emballage} ({t.qty}x)</p>
                  <p className="text-[10px] md:text-xs text-gray-600 truncate">{t.date} • {t.supplier} • {t.branch}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all duration-200 flex-shrink-0"><Trash2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ABONNEMENT TAB ───────────────────────────────────────────────────────────
const PRICE_EXTRA_USER = 5; // € per extra gebruiker per maand
const PRICE_EXTRA_OUTLET = 10; // € per extra outlet per maand

function AbonnementTab({ account, setAccount }) {
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showOutletConfirm, setShowOutletConfirm] = useState(false);

  const branches = account.branches || [];
  const basePerBranch = account.maxUsersPerBranch || 2;
  const totalExtraUsers = branches.reduce((sum, b) => sum + (b.extraUsers || 0), 0);
  const extraUsersCost = totalExtraUsers * PRICE_EXTRA_USER;
  const baseCost = calcPrice(account.plan.outlets).total;
  const totalMonthlyCost = baseCost + extraUsersCost;

  const handleAddExtraUser = async (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return;
    setIsLoading(true);
    try {
      const newExtra = (branch.extraUsers || 0) + 1;
      const { error } = await supabase.from("branches").update({ extra_users: newExtra }).eq("id", branchId);
      if (error) throw error;
      setAccount({
        ...account,
        branches: branches.map(b => b.id === branchId ? { ...b, extraUsers: newExtra } : b),
      });
      setShowUserPicker(false);
      setToast({ type: "success", message: `Extra gebruiker toegevoegd aan ${branch.name} (+€${PRICE_EXTRA_USER}/maand)` });
    } catch (err) { setToast({ type: "error", message: err.message }); }
    finally { setIsLoading(false); }
  };

  const handleRemoveExtraUser = async (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch || (branch.extraUsers || 0) <= 0) return;
    const currentUsers = account.users.filter(u => u.branchId === branchId).length;
    const newMax = basePerBranch + (branch.extraUsers - 1);
    if (currentUsers > newMax) {
      setToast({ type: "error", message: `Kan niet verlagen: er zijn ${currentUsers} gebruikers in ${branch.name}. Verwijder eerst een gebruiker.` });
      return;
    }
    setIsLoading(true);
    try {
      const newExtra = (branch.extraUsers || 0) - 1;
      const { error } = await supabase.from("branches").update({ extra_users: newExtra }).eq("id", branchId);
      if (error) throw error;
      setAccount({
        ...account,
        branches: branches.map(b => b.id === branchId ? { ...b, extraUsers: newExtra } : b),
      });
      setToast({ type: "success", message: `Extra gebruiker verwijderd bij ${branch.name}` });
    } catch (err) { setToast({ type: "error", message: err.message }); }
    finally { setIsLoading(false); }
  };

  const handleRequestOutlet = async () => {
    setIsLoading(true);
    try {
      const newOutlets = (account.plan.outlets || 1) + 1;
      const { error } = await supabase.from("accounts").update({ plan_outlets: newOutlets }).eq("id", account.id);
      if (error) throw error;
      setAccount({
        ...account,
        plan: { ...account.plan, outlets: newOutlets },
      });
      setShowOutletConfirm(false);
      setToast({ type: "success", message: `Extra outlet toegevoegd! Je hebt nu ${newOutlets} outlets (+€${PRICE_EXTRA_OUTLET}/maand)` });
    } catch (err) { setToast({ type: "error", message: err.message }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"><CreditCard size={24} className="md:w-7 md:h-7" /> Abonnement</h2>

      {/* Plan overview */}
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
          <p className="text-gray-700">Basisabonnement</p>
          <p className="font-bold text-gray-900">{fmt(baseCost)}/maand</p>
        </div>
        {totalExtraUsers > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-700">Extra gebruikers ({totalExtraUsers}x)</p>
            <p className="font-bold text-purple-700">+{fmt(extraUsersCost)}/maand</p>
          </div>
        )}
        <div className="border-t border-blue-200 pt-4 flex items-center justify-between">
          <p className="text-gray-900 font-semibold">Totaal maandelijks</p>
          <p className="text-xl font-bold text-blue-900">{fmt(totalMonthlyCost)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-700">Volgende facturering</p>
          <p className="font-semibold text-gray-900">{account.plan.nextBilling}</p>
        </div>
      </div>

      {/* Upgrade actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Extra user card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Users size={20} className="text-purple-600" /></div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Extra gebruiker</p>
              <p className="text-xs text-gray-500">€{PRICE_EXTRA_USER}/gebruiker/maand</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4 flex-1">Voeg een extra gebruikersplek toe aan een specifiek filiaal. Standaard heeft elk filiaal {basePerBranch} plekken.</p>
          <button
            onClick={() => setShowUserPicker(true)}
            disabled={branches.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all disabled:opacity-40"
          >
            <PlusCircle size={16} /> Extra gebruiker toevoegen
          </button>
        </div>

        {/* Extra outlet card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Building2 size={20} className="text-blue-600" /></div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Extra outlet</p>
              <p className="text-xs text-gray-500">€{PRICE_EXTRA_OUTLET}/outlet/maand</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4 flex-1">Breid je abonnement uit met een extra filiaal. Je hebt nu {account.plan.outlets} outlet{account.plan.outlets !== 1 ? "s" : ""} ({branches.length} in gebruik).</p>
          <button
            onClick={() => setShowOutletConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            <PlusCircle size={16} /> Extra outlet aanvragen
          </button>
        </div>
      </div>

      {/* Active extras overview */}
      {totalExtraUsers > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-3">Actieve extra's</p>
          <div className="space-y-2">
            {branches.filter(b => (b.extraUsers || 0) > 0).map(b => {
              const extra = b.extraUsers || 0;
              const maxForBranch = basePerBranch + extra;
              const currentUsers = account.users.filter(u => u.branchId === b.id).length;
              return (
                <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{b.name}</p>
                      <p className="text-[10px] text-gray-500">{currentUsers}/{maxForBranch} gebruikers • +{extra} extra</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-700">{fmt(extra * PRICE_EXTRA_USER)}/mnd</span>
                    <button
                      onClick={() => handleRemoveExtraUser(b.id)}
                      disabled={isLoading}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all disabled:opacity-40"
                      title="Extra gebruiker verwijderen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Branch picker modal for extra user */}
      {showUserPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowUserPicker(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Kies een filiaal</h3>
              <button onClick={() => setShowUserPicker(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Aan welk filiaal wil je een extra gebruikersplek toevoegen? (+€{PRICE_EXTRA_USER}/maand)</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {branches.map(b => {
                const extra = b.extraUsers || 0;
                const maxForBranch = basePerBranch + extra;
                const currentUsers = account.users.filter(u => u.branchId === b.id).length;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleAddExtraUser(b.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">{b.name[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                        <p className="text-[10px] text-gray-500">{currentUsers}/{maxForBranch} gebruikers{extra > 0 ? ` (${extra} extra)` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-600">
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                      <span className="text-xs font-semibold">+1</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Outlet confirm modal */}
      {showOutletConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowOutletConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Extra outlet toevoegen</h3>
              <button onClick={() => setShowOutletConfirm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Huidige outlets</span>
                <span className="font-bold text-gray-900">{account.plan.outlets}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Na upgrade</span>
                <span className="font-bold text-blue-700">{account.plan.outlets + 1}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-700">Extra kosten</span>
                <span className="font-bold text-blue-700">+€{PRICE_EXTRA_OUTLET}/maand</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">Na de upgrade kun je onder "Filialen" een nieuw filiaal aanmaken.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowOutletConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all">Annuleren</button>
              <button
                onClick={handleRequestOutlet}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />} Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">Wijzigingen worden direct doorgevoerd en op de volgende factuur verrekend.</p>
    </div>
  );
}

// ─── LOGO UPLOAD HELPER ──────────────────────────────────────────────────────
function resizeImageToBase64(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function LogoUpload({ currentUrl, onUpload, label = "Logo uploaden", size = "lg" }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const dims = size === "lg" ? "w-24 h-24" : "w-14 h-14";
  const iconSize = size === "lg" ? 32 : 18;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const base64 = await resizeImageToBase64(file, size === "lg" ? 200 : 128);
      await onUpload(base64);
    } catch (err) { console.error("Logo upload error:", err); }
    finally { setUploading(false); }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={() => fileRef.current?.click()} className={`${dims} rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center overflow-hidden transition-all duration-200 bg-gray-50 hover:bg-blue-50 group relative`}>
        {uploading ? (
          <Loader2 size={iconSize} className="text-blue-500 animate-spin" />
        ) : currentUrl ? (
          <>
            <img src={currentUrl} alt="logo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Upload size={iconSize * 0.6} className="text-white" /></div>
          </>
        ) : (
          <Image size={iconSize} className="text-gray-300 group-hover:text-blue-400 transition-all" />
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

// ─── INSTELLINGEN (COMPANY SETTINGS) ─────────────────────────────────────────
function CompanySettings({ account, setAccount }) {
  const [companyName, setCompanyName] = useState(account.companyName);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!companyName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("accounts").update({ company_name: companyName.trim() }).eq("id", account.id);
      if (error) throw error;
      setAccount({ ...account, companyName: companyName.trim() });
      setToast({ type: "success", message: "Bedrijfsnaam bijgewerkt!" });
    } catch (err) { setToast({ type: "error", message: err.message }); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (base64) => {
    try {
      const { error } = await supabase.from("accounts").update({ logo_url: base64 }).eq("id", account.id);
      if (error) throw error;
      setAccount({ ...account, logoUrl: base64 });
      setToast({ type: "success", message: "Logo bijgewerkt!" });
    } catch (err) {
      // If column doesn't exist yet, store in local state only
      console.warn("Could not save logo to DB:", err.message);
      setAccount({ ...account, logoUrl: base64 });
      setToast({ type: "info", message: "Logo ingesteld (voer de SQL migratie uit voor permanente opslag)" });
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await supabase.from("accounts").update({ logo_url: null }).eq("id", account.id);
    } catch {}
    setAccount({ ...account, logoUrl: null });
    setToast({ type: "success", message: "Logo verwijderd" });
  };

  return (
    <div className="animate-fade-in space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Company Logo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Bedrijfslogo</h3>
        <div className="flex items-center gap-6">
          <LogoUpload currentUrl={account.logoUrl} onUpload={handleLogoUpload} label="Klik om logo te uploaden" size="lg" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Upload je bedrijfslogo. Het wordt getoond in de sidebar, op rapporten en voor je filiaalgebruikers.</p>
            <p className="text-xs text-gray-400 mt-1">Aanbevolen: vierkant formaat, minimaal 200×200px</p>
            {account.logoUrl && <button onClick={handleRemoveLogo} className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium">Logo verwijderen</button>}
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Bedrijfsnaam</h3>
        <div className="flex gap-3">
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Bedrijfsnaam" />
          <button onClick={handleSaveName} disabled={saving || companyName.trim() === account.companyName} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-40">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Opslaan
          </button>
        </div>
      </div>

      {/* Branch logos info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Filiaallogo's</h3>
        <p className="text-sm text-gray-500">Filiaallogo's kun je instellen bij het betreffende filiaal onder <span className="font-semibold text-blue-600">Filialen</span> in het menu.</p>
      </div>
    </div>
  );
}

function BranchLogoCard({ user: u, account, setAccount }) {
  const [toast, setToast] = useState(null);

  const handleBranchLogo = async (base64) => {
    try {
      const { error } = await supabase.from("profiles").update({ branch_logo_url: base64 }).eq("id", u.id);
      if (error) throw error;
      setAccount({ ...account, users: account.users.map(usr => usr.id === u.id ? { ...usr, branchLogoUrl: base64 } : usr) });
    } catch (err) {
      console.warn("Could not save branch logo to DB:", err.message);
      setAccount({ ...account, users: account.users.map(usr => usr.id === u.id ? { ...usr, branchLogoUrl: base64 } : usr) });
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <LogoUpload currentUrl={u.branchLogoUrl} onUpload={handleBranchLogo} label="" size="sm" />
      <p className="text-xs font-medium text-gray-700 text-center truncate w-full">{u.branch || u.name}</p>
    </div>
  );
}

// ─── MASTER APP (SIDEBAR LAYOUT) ─────────────────────────────────────────────
function MasterApp({ account, user, onLogout, setAccount }) {
  const [masterScreen, setMasterScreen] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "filialen", label: "Filialen", icon: <Building2 size={18} /> },
    { id: "leveranciers", label: "Leveranciers", icon: <Truck size={18} /> },
    { id: "logboek", label: "Logboek", icon: <ClipboardList size={18} /> },
    { id: "beheer", label: "Gebruikers", icon: <Users size={18} /> },
    { id: "emballage", label: "Emballage & Leveranciers", icon: <Package size={18} /> },
    { id: "alerts", label: "Meldingen", icon: <Bell size={18} /> },
    { id: "audit", label: "Audit Log", icon: <Shield size={18} /> },
    { id: "export", label: "Exporteren", icon: <Download size={18} /> },
    { id: "instellingen", label: "Instellingen", icon: <Settings size={18} /> },
    { id: "abonnement", label: "Abonnement", icon: <CreditCard size={18} /> },
  ];

  // Count alerts for badge
  const alertCount = (() => {
    let count = 0;
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const branchNames = (account.branches || []).length > 0
      ? (account.branches || []).map(b => b.name)
      : [...new Set(account.users.filter(u => u.role === "branch" && u.branch).map(u => u.branch))];
    branchNames.forEach(b => {
      const bt = account.transactions.filter(t => t.branch === b);
      const lastDate = bt.length > 0 ? [...bt].sort((a, b2) => b2.date.localeCompare(a.date))[0].date : null;
      if (!lastDate || new Date(lastDate) < oneWeekAgo) count++;
    });
    const saldo = buildSaldoData(account.transactions, account.emballageTypes, account.suppliers);
    Object.values(saldo).forEach(data => { if (data.value > 500) count++; });
    return count;
  })();

  const screenTitle = navItems.find(n => n.id === masterScreen)?.label || "";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <BarcodeLogo size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Company */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          {account.logoUrl ? (
            <img src={account.logoUrl} alt="logo" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{account.companyName?.[0] || "R"}</div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{account.companyName}</p>
            <p className="text-[10px] text-gray-500">{user.name} • Master Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setMasterScreen(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${masterScreen === item.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
              <span className={masterScreen === item.id ? "text-blue-600" : "text-gray-400"}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "alerts" && alertCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{alertCount}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"><LogOut size={18} /> Afmelden</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl"><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-gray-900">{screenTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setMasterScreen("alerts"); setSidebarOpen(false); }} className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <Bell size={18} />
              {alertCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-8 max-w-5xl">
          {masterScreen === "dashboard" && <MasterDashboard account={account} />}
          {masterScreen === "filialen" && <BranchManagement account={account} setAccount={setAccount} />}
          {masterScreen === "leveranciers" && <CompanySupplierBalances account={account} />}
          {masterScreen === "logboek" && <MasterLogboek account={account} setAccount={setAccount} />}
          {masterScreen === "beheer" && <MasterBeheer account={account} setAccount={setAccount} />}
          {masterScreen === "emballage" && <EmballageBeheer account={account} setAccount={setAccount} />}
          {masterScreen === "alerts" && <AlertsPanel account={account} />}
          {masterScreen === "audit" && <AuditLog account={account} />}
          {masterScreen === "export" && <MasterExport account={account} />}
          {masterScreen === "instellingen" && <CompanySettings account={account} setAccount={setAccount} />}
          {masterScreen === "abonnement" && <AbonnementTab account={account} setAccount={setAccount} />}
        </div>
      </main>
    </div>
  );
}

// ─── MASTER EXPORT ───────────────────────────────────────────────────────────
function MasterExport({ account }) {
  return (
    <div className="animate-fade-in space-y-6">
      <p className="text-sm text-gray-500">Exporteer uw bedrijfsgegevens naar CSV of PDF rapport.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => exportToCSV(account.transactions, account.emballageTypes, account.suppliers, account.companyName)} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left group">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-all"><FileText size={24} className="text-emerald-600" /></div>
          <p className="text-lg font-bold text-gray-900">CSV / Excel</p>
          <p className="text-sm text-gray-500 mt-1">Saldo-overzicht, detail per leverancier, alle transacties. Direct te openen in Excel.</p>
        </button>
        <button onClick={() => exportToPDF(account.transactions, account.emballageTypes, account.users, account.suppliers, account.companyName)} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left group">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-all"><FileText size={24} className="text-red-600" /></div>
          <p className="text-lg font-bold text-gray-900">PDF Rapport</p>
          <p className="text-sm text-gray-500 mt-1">Professioneel rapport met Reggy branding, statistieken, saldo en transactiehistorie.</p>
        </button>
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
  const [barcodeScanner, setBarcodeScanner] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding());
  const [attViewer, setAttViewer] = useState(null);
  const [toast, setToast] = useState(null);
  const [logFilter, setLogFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const branchTransactions = account.transactions.filter(t => t.branch === user.branch);

  const handleImportTransaction = async (transOrArray) => {
    const items = Array.isArray(transOrArray) ? transOrArray : [transOrArray];
    try {
      // supabase is imported at the top of App.jsx
      const inserts = items.map(t => ({
        account_id: account.id,
        date: t.date,
        type: t.type,
        supplier: t.supplier,
        emballage: t.emballage,
        qty: parseInt(t.qty),
        note: t.note || null,
        branch: t.branch || user.branch,
      }));
      const { data, error } = await supabase.from("transactions").insert(inserts).select();
      if (error) throw error;
      const newTrans = data.map(t => ({ id: t.id, date: t.date, type: t.type, supplier: t.supplier, emballage: t.emballage, qty: t.qty, note: t.note || "", attachment: t.attachment, branch: t.branch || "" }));
      setAccount({ ...account, transactions: [...newTrans, ...account.transactions] });
      setScanModal(false);
      setToast({ type: "success", message: items.length > 1 ? `${items.length} transacties geregistreerd!` : "Transactie geregistreerd!" });
    } catch (err) {
      console.error("Error saving transaction:", err);
      setToast({ type: "error", message: "Fout bij opslaan: " + err.message });
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      // supabase is imported at the top of App.jsx
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      setAccount({ ...account, transactions: account.transactions.filter(t => t.id !== id) });
      setDeleteConfirm(null);
      setToast({ type: "success", message: "Transactie verwijderd!" });
    } catch (err) {
      setToast({ type: "error", message: "Fout bij verwijderen: " + err.message });
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleSaveTransaction = async (updatedTrans) => {
    try {
      // supabase is imported at the top of App.jsx
      const { error } = await supabase.from("transactions").update({
        type: updatedTrans.type,
        supplier: updatedTrans.supplier,
        emballage: updatedTrans.emballage,
        qty: parseInt(updatedTrans.qty),
        note: updatedTrans.note || null,
      }).eq("id", updatedTrans.id);
      if (error) throw error;
      setAccount({ ...account, transactions: account.transactions.map(t => t.id === updatedTrans.id ? updatedTrans : t) });
      setEditingTransaction(null);
      setToast({ type: "success", message: "Transactie bijgewerkt!" });
    } catch (err) {
      setToast({ type: "error", message: "Fout bij bijwerken: " + err.message });
    }
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
      {showOnboarding && <OnboardingOverlay onDone={() => setShowOnboarding(false)} />}
      {barcodeScanner && <BarcodeScannerModal onScan={(barcode) => { setBarcodeScanner(false); setScanModal(true); }} onClose={() => setBarcodeScanner(false)} />}
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
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {(() => {
              const branchUser = account.users.find(u => u.id === user.id);
              const logo = branchUser?.branchLogoUrl || account.logoUrl;
              return logo ? (
                <img src={logo} alt="logo" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
              ) : (
                <BarcodeLogo size="sm" />
              );
            })()}
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">{user.branch}</h1>
              <p className="text-[10px] md:text-xs text-gray-500">{account.companyName}</p>
            </div>
          </div>
          <div className="flex gap-1 md:gap-1.5">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-1.5 md:px-2 py-1.5 bg-white hover:bg-gray-50 transition-all duration-200">
              <option value="nl">NL</option>
              <option value="en">EN</option>
            </select>
            <button onClick={() => setExportModal(true)} className="p-2 md:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200"><Download size={18} className="text-gray-500" /></button>
            <button onClick={onLogout} className="p-2 md:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200"><LogOut size={18} className="text-gray-500" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 pt-4 pb-24">

        {screen === "overzicht" && (
          <div className="space-y-4 animate-fade-in">
            {/* Stats row */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-3">
              <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">Totaal</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{branchTransactions.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium">In</p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-emerald-600">{inCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium">Uit</p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-rose-600">{outCount}</p>
              </div>
            </div>

            {/* Inventory value */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium mb-1">Geschatte waarde inventaris</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{fmt(value)}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-purple-500 md:w-6 md:h-6" />
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
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 flex items-center justify-around">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setScreen(tab.id)} className={`flex flex-col items-center gap-1 py-3 px-4 transition-all duration-200 ${screen === tab.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
              {tab.icon}
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          ))}
          {/* Scanner button */}
          <button onClick={() => setBarcodeScanner(true)} className="flex flex-col items-center gap-1 py-3 px-3">
            <Camera size={18} className="text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-400">Scan</span>
          </button>
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

// ─── STORAGE & API KEY (legacy, kept for PDF/CSV export compatibility) ────────
function getApiKey() {
  try { return localStorage.getItem(API_KEY_STORAGE) || ""; } catch { return ""; }
}

function setApiKey(key) {
  try { localStorage.setItem(API_KEY_STORAGE, key); } catch {}
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Vul je email en wachtwoord in");
      return;
    }
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message === "Invalid login credentials"
        ? "Ongeldige email of wachtwoord"
        : err.message || "Er ging iets mis bij het inloggen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md lg:max-w-2xl xl:max-w-4xl w-full p-8">
        <div className="flex items-center justify-center mb-8">
          <BarcodeLogo size="lg" />
        </div>

        <div className="space-y-4 mb-6">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

        <button onClick={handleLogin} disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 mb-4 disabled:opacity-60 flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 size={20} className="animate-spin" /> Inloggen...</> : "Inloggen"}
        </button>

        <div className="mt-6 text-center">
          <button onClick={onRegister} className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Nog geen account? Registreren</button>
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
  const {
    session, profile, account, accounts,
    loading, error,
    signIn, signOut,
    addTransactions, updateTransaction, deleteTransaction,
    addEmballageType, removeEmballageType,
    addSupplier, removeSupplier,
    deleteAccount: deleteAccountFn,
    setAccountState,
  } = useSupabase();

  const [screen, setScreen] = useState("login");
  const [language, setLanguage] = useState("nl");

  // Sync screen with auth state
  useEffect(() => {
    if (loading) return;
    if (session && profile) {
      if (profile.role === "superadmin") setScreen("superadmin");
      else setScreen("app");
    } else {
      setScreen("login");
    }
  }, [session, profile, loading]);

  const handleLogin = async (email, password) => {
    await signIn(email, password);
  };

  const handleLogout = async () => {
    await signOut();
    setScreen("login");
  };

  // Build currentUser object from profile (matching existing component interface)
  const currentUser = profile ? {
    id: profile.id,
    name: profile.display_name,
    role: profile.role,
    branch: profile.branch,
    accountId: profile.account_id,
  } : null;

  // Wrapper to update account state when child components call setAccount
  const handleSetAccount = (updatedAcc) => {
    setAccountState(updatedAcc);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BarcodeLogo size="lg" />
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span>Laden...</span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} onRegister={() => setScreen("register")} />;
  }

  if (screen === "register") {
    return <RegisterFlow accounts={[]} setAccounts={() => {}} onDone={() => setScreen("login")} />;
  }

  if (screen === "superadmin" && currentUser?.role === "superadmin") {
    return <SuperAdminPanel accounts={accounts} setAccounts={() => {}} onLogout={handleLogout} />;
  }

  if (!account || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-500">Account laden...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role === "master") {
    return <MasterApp account={account} user={currentUser} onLogout={handleLogout} setAccount={handleSetAccount} />;
  }

  return <BranchApp user={currentUser} account={account} setAccount={handleSetAccount} onLogout={handleLogout} language={language} setLanguage={setLanguage} />;
}

export default App;
