import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

// Module-level flag: skip profile loading during registration
let _skipProfileLoad = false;
export function setSkipProfileLoad(val) { _skipProfileLoad = val; }

/**
 * Custom hook that bridges Supabase with the existing Reggy frontend.
 * Returns data in the same shape the components expect, so UI changes are minimal.
 */
export function useSupabase() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [account, setAccountState] = useState(null);
  const [accounts, setAccountsState] = useState([]); // For super admin
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileLoadAttempted = useRef(false);

  // ─── AUTH STATE ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user && !_skipProfileLoad) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user && !_skipProfileLoad) {
        loadProfile(session.user.id);
      } else if (!session) {
        setProfile(null);
        setAccountState(null);
        setAccountsState([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── LOAD PROFILE & ACCOUNT DATA ─────────────────────────────────────────
  const loadProfile = async (userId) => {
    try {
      if (profileLoadAttempted.current) return; // Prevent duplicate loads
      profileLoadAttempted.current = true;
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        // Profile doesn't exist yet — just show login, don't sign out
        console.warn("Profile not found:", profileError.message);
        setProfile(null);
        setLoading(false);
        profileLoadAttempted.current = false;
        return;
      }
      setProfile(profileData);

      if (profileData.role === "superadmin") {
        await loadAllAccounts();
      } else if (profileData.account_id) {
        await loadAccountData(profileData.account_id);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── LOAD SINGLE ACCOUNT (for master/branch users) ────────────────────────
  const loadAccountData = async (accountId) => {
    try {
      // Fetch account, profiles, branches, transactions, emballage_types, suppliers in parallel
      const [accountRes, profilesRes, branchesRes, transactionsRes, emballageRes, suppliersRes] = await Promise.all([
        supabase.from("accounts").select("*").eq("id", accountId).single(),
        supabase.from("profiles").select("*").eq("account_id", accountId).order("created_at"),
        supabase.from("branches").select("*").eq("account_id", accountId).order("name").then(r => r).catch(() => ({ data: [], error: null })),
        supabase.from("transactions").select("*").eq("account_id", accountId).order("date", { ascending: false }),
        supabase.from("emballage_types").select("*").eq("account_id", accountId).order("name"),
        supabase.from("suppliers").select("*").eq("account_id", accountId).order("name"),
      ]);

      if (accountRes.error) throw accountRes.error;

      // Shape data to match existing frontend structure
      const shaped = shapeAccountData(
        accountRes.data,
        profilesRes.data || [],
        branchesRes.data || [],
        transactionsRes.data || [],
        emballageRes.data || [],
        suppliersRes.data || []
      );

      setAccountState(shaped);
    } catch (err) {
      console.error("Error loading account:", err);
      setError(err.message);
    }
  };

  // ─── LOAD ALL ACCOUNTS (for super admin) ──────────────────────────────────
  const loadAllAccounts = async () => {
    try {
      const { data: allAccounts, error: accError } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (accError) throw accError;

      // For each account, load profiles to get user count
      const shaped = await Promise.all(
        allAccounts.map(async (acc) => {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .eq("account_id", acc.id);
          return {
            id: acc.id,
            companyName: acc.company_name,
            email: acc.email,
            plan: {
              outlets: acc.plan_outlets,
              startDate: acc.plan_start_date,
              status: acc.plan_status,
              nextBilling: acc.plan_next_billing,
            },
            users: (profiles || []).map(p => ({
              id: p.id,
              name: p.display_name,
              role: p.role,
              branch: p.branch,
            })),
          };
        })
      );

      setAccountsState(shaped);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError(err.message);
    }
  };

  // ─── SHAPE DATA ───────────────────────────────────────────────────────────
  function shapeAccountData(acc, profiles, branches, transactions, emballageTypes, suppliers) {
    return {
      id: acc.id,
      companyName: acc.company_name,
      email: acc.email,
      logoUrl: acc.logo_url || null,
      maxUsersPerBranch: acc.max_users_per_branch || 2,
      plan: {
        outlets: acc.plan_outlets,
        startDate: acc.plan_start_date,
        status: acc.plan_status,
        nextBilling: acc.plan_next_billing,
      },
      branches: (branches || []).map(b => ({
        id: b.id,
        name: b.name,
        logoUrl: b.logo_url || null,
        extraUsers: b.extra_users || 0,
      })),
      users: profiles.map(p => ({
        id: p.id,
        name: p.display_name,
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        phone: p.phone || "",
        role: p.role,
        branch: p.branch,
        branchId: p.branch_id || null,
        branchLogoUrl: p.branch_logo_url || null,
      })),
      emballageTypes: emballageTypes.map(e => ({
        id: e.id,
        name: e.name,
        value: e.value,
      })),
      suppliers: suppliers.map(s => s.name),
      _supplierRecords: suppliers, // Keep full records for CRUD
      transactions: transactions.map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        supplier: t.supplier,
        emballage: t.emballage,
        qty: t.qty,
        note: t.note || "",
        attachment: t.attachment,
        branch: t.branch || "",
        userId: t.user_id || null,
      })),
    };
  }

  // ─── AUTH ACTIONS ─────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    profileLoadAttempted.current = false; // Reset so loadProfile runs after login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
    setAccountState(null);
    setAccountsState([]);
  };

  // ─── TRANSACTION CRUD ─────────────────────────────────────────────────────
  const addTransactions = async (transactionsData) => {
    const items = Array.isArray(transactionsData) ? transactionsData : [transactionsData];
    const inserts = items.map(t => ({
      account_id: account.id,
      date: t.date,
      type: t.type,
      supplier: t.supplier,
      emballage: t.emballage,
      qty: parseInt(t.qty),
      note: t.note || null,
      attachment: t.attachment || null,
      branch: t.branch || null,
    }));

    const { data, error } = await supabase
      .from("transactions")
      .insert(inserts)
      .select();

    if (error) throw error;

    // Update local state
    const newTrans = data.map(t => ({
      id: t.id, date: t.date, type: t.type, supplier: t.supplier,
      emballage: t.emballage, qty: t.qty, note: t.note || "",
      attachment: t.attachment, branch: t.branch || "",
    }));

    setAccountState(prev => ({
      ...prev,
      transactions: [...newTrans, ...prev.transactions],
    }));

    return data;
  };

  const updateTransaction = async (transactionId, updates) => {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        type: updates.type,
        supplier: updates.supplier,
        emballage: updates.emballage,
        qty: parseInt(updates.qty),
        note: updates.note || null,
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) throw error;

    setAccountState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t =>
        t.id === transactionId
          ? { ...t, type: data.type, supplier: data.supplier, emballage: data.emballage, qty: data.qty, note: data.note || "" }
          : t
      ),
    }));

    return data;
  };

  const deleteTransaction = async (transactionId) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (error) throw error;

    setAccountState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== transactionId),
    }));
  };

  // ─── ACCOUNT CRUD (super admin) ───────────────────────────────────────────
  const deleteAccount = async (accountId) => {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", accountId);

    if (error) throw error;
    setAccountsState(prev => prev.filter(a => a.id !== accountId));
  };

  // ─── EMBALLAGE TYPE CRUD ──────────────────────────────────────────────────
  const addEmballageType = async (name, value) => {
    const { data, error } = await supabase
      .from("emballage_types")
      .insert({ account_id: account.id, name, value: parseFloat(value) })
      .select()
      .single();

    if (error) throw error;

    setAccountState(prev => ({
      ...prev,
      emballageTypes: [...prev.emballageTypes, { id: data.id, name: data.name, value: data.value }],
    }));
  };

  const removeEmballageType = async (name) => {
    // Find the record by name in the account's emballage types
    const record = account.emballageTypes.find(e => e.name === name);
    if (!record?.id) return;

    const { error } = await supabase
      .from("emballage_types")
      .delete()
      .eq("id", record.id);

    if (error) throw error;

    setAccountState(prev => ({
      ...prev,
      emballageTypes: prev.emballageTypes.filter(e => e.name !== name),
    }));
  };

  // ─── SUPPLIER CRUD ────────────────────────────────────────────────────────
  const addSupplier = async (name) => {
    const { data, error } = await supabase
      .from("suppliers")
      .insert({ account_id: account.id, name })
      .select()
      .single();

    if (error) throw error;

    setAccountState(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, name],
      _supplierRecords: [...(prev._supplierRecords || []), data],
    }));
  };

  const removeSupplier = async (name) => {
    const record = account._supplierRecords?.find(s => s.name === name);
    if (!record) return;

    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", record.id);

    if (error) throw error;

    setAccountState(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s !== name),
      _supplierRecords: prev._supplierRecords.filter(s => s.name !== name),
    }));
  };

  // ─── REFRESH ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (profile?.account_id) {
      await loadAccountData(profile.account_id);
    } else if (profile?.role === "superadmin") {
      await loadAllAccounts();
    }
  }, [profile]);

  return {
    // State
    session,
    profile,
    account,
    accounts,
    loading,
    error,

    // Auth
    signIn,
    signUp,
    signOut,

    // Transactions
    addTransactions,
    updateTransaction,
    deleteTransaction,

    // Emballage
    addEmballageType,
    removeEmballageType,

    // Suppliers
    addSupplier,
    removeSupplier,

    // Accounts (super admin)
    deleteAccount,

    // Utils
    refresh,
    setAccountState,
  };
}
