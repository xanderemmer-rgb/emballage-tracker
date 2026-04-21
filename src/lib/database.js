import { supabase } from "./supabase";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────

export async function getAccount(accountId) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllAccounts() {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAccount(accountData) {
  const { data, error } = await supabase
    .from("accounts")
    .insert(accountData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccount(accountId, updates) {
  const { data, error } = await supabase
    .from("accounts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", accountId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccount(accountId) {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId);
  if (error) throw error;
}

// ─── PROFILES BY ACCOUNT ──────────────────────────────────────────────────────

export async function getProfilesByAccount(accountId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProfile(profileData) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profileData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProfile(profileId) {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);
  if (error) throw error;
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export async function getTransactions(accountId) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTransaction(transactionData) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createTransactions(transactionsData) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionsData)
    .select();
  if (error) throw error;
  return data;
}

export async function updateTransaction(transactionId, updates) {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", transactionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(transactionId) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId);
  if (error) throw error;
}

// ─── EMBALLAGE TYPES ──────────────────────────────────────────────────────────

export async function getEmballageTypes(accountId) {
  const { data, error } = await supabase
    .from("emballage_types")
    .select("*")
    .eq("account_id", accountId)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createEmballageType(typeData) {
  const { data, error } = await supabase
    .from("emballage_types")
    .insert(typeData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmballageType(typeId, updates) {
  const { data, error } = await supabase
    .from("emballage_types")
    .update(updates)
    .eq("id", typeId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEmballageType(typeId) {
  const { error } = await supabase
    .from("emballage_types")
    .delete()
    .eq("id", typeId);
  if (error) throw error;
}

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────

export async function getSuppliers(accountId) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("account_id", accountId)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createSupplier(supplierData) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(supplierData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(supplierId) {
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", supplierId);
  if (error) throw error;
}

// ─── BRANCHES ─────────────────────────────────────────────────────────────────

export async function getBranches(accountId) {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("account_id", accountId)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createBranch(branchData) {
  const { data, error } = await supabase
    .from("branches")
    .insert(branchData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBranch(branchId) {
  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("id", branchId);
  if (error) throw error;
}
