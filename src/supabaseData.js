import { supabase } from "./supabaseClient";

// ─── ACCOUNTS ────────────────────────────────────────────────────────────────

export async function fetchAllAccounts() {
  const { data, error } = await supabase
    .from("accounts")
    .select("*, profiles(count), transactions(count)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAccountDetail(accountId) {
  const [account, profiles, transactions, emballageTypes, suppliers] = await Promise.all([
    supabase.from("accounts").select("*").eq("id", accountId).single(),
    supabase.from("profiles").select("*").eq("account_id", accountId),
    supabase.from("transactions").select("*").eq("account_id", accountId).order("date", { ascending: false }).limit(50),
    supabase.from("emballage_types").select("*").eq("account_id", accountId),
    supabase.from("suppliers").select("*").eq("account_id", accountId),
  ]);
  return {
    account: account.data,
    profiles: profiles.data || [],
    transactions: transactions.data || [],
    emballageTypes: emballageTypes.data || [],
    suppliers: suppliers.data || [],
  };
}

export async function fetchAccount(accountId) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error) throw error;
  return data;
}

export async function createAccount(account) {
  const { data, error } = await supabase
    .from("accounts")
    .insert(account)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccount(id, updates) {
  const { data, error } = await supabase
    .from("accounts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccount(id) {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── PROFILES ────────────────────────────────────────────────────────────────

export async function fetchProfiles(accountId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_id", accountId);
  if (error) throw error;
  return data;
}

export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*");
  if (error) throw error;
  return data;
}

export async function createProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── EMBALLAGE TYPES ─────────────────────────────────────────────────────────

export async function fetchEmballageTypes(accountId) {
  const { data, error } = await supabase
    .from("emballage_types")
    .select("*")
    .eq("account_id", accountId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createEmballageType(item) {
  const { data, error } = await supabase
    .from("emballage_types")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmballageType(id, updates) {
  const { data, error } = await supabase
    .from("emballage_types")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEmballageType(id) {
  const { error } = await supabase
    .from("emballage_types")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── SUPPLIERS ───────────────────────────────────────────────────────────────

export async function fetchSuppliers(accountId) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("account_id", accountId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function createSupplier(item) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id) {
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export async function fetchTransactions(accountId) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTransaction(tx) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(tx)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── SEED DEFAULT DATA ──────────────────────────────────────────────────────

const DEFAULT_EMBALLAGE = [
  { name: "Biervat 50L", value: 30 }, { name: "Biervat 30L", value: 20 },
  { name: "Biervat 20L", value: 15 }, { name: "Biervat 10L", value: 10 },
  { name: "Kratje bier 24x", value: 4.5 }, { name: "Kratje bier 12x", value: 2.5 },
  { name: "Flessenrek wijn", value: 8 }, { name: "Postmix bag", value: 5 },
  { name: "CO2 fles", value: 50 }, { name: "Plastic krat", value: 3 },
];

const DEFAULT_SUPPLIERS = ["Heineken", "AB InBev", "Duvel Moortgat", "Coca-Cola", "Karmeliet"];

export async function seedAccountDefaults(accountId) {
  // Insert default emballage types
  const emballageRows = DEFAULT_EMBALLAGE.map(e => ({ account_id: accountId, ...e }));
  await supabase.from("emballage_types").insert(emballageRows);

  // Insert default suppliers
  const supplierRows = DEFAULT_SUPPLIERS.map(s => ({ account_id: accountId, name: s }));
  await supabase.from("suppliers").insert(supplierRows);
}
