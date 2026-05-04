// Vercel Serverless Function: Check alerts and send email notifications
// Called via cron or manually from SuperAdmin/MasterApp

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = "alerts@reggy.io";
const FROM_NAME = "Reggy Alerts";

async function sendEmail(to, subject, htmlContent) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
  return res.ok;
}

function buildAlertEmail(accountName, alerts) {
  const alertRows = alerts.map(a => {
    const color = a.severity === "error" ? "#ef4444" : a.severity === "warning" ? "#f59e0b" : "#8b5cf6";
    const bg = a.severity === "error" ? "#fef2f2" : a.severity === "warning" ? "#fffbeb" : "#f5f3ff";
    return `<tr><td style="padding:12px 16px;border-bottom:1px solid #f4f4f5"><div style="display:flex;align-items:center;gap:8px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}"></span><strong style="color:#18181b">${a.title}</strong></div><div style="color:#71717a;font-size:13px;margin-top:4px">${a.message}</div></td></tr>`;
  }).join("");

  return `
    <div style="font-family:'Inter',-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="font-size:20px;font-weight:800;color:#18181b;margin:0">🔔 Reggy Alert</h1>
        <p style="color:#71717a;font-size:14px;margin:4px 0 0">${accountName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden">
        ${alertRows}
      </table>
      <div style="text-align:center;margin-top:24px">
        <a href="https://app.reggy.io" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">Bekijk in Reggy →</a>
      </div>
      <p style="text-align:center;color:#a1a1aa;font-size:12px;margin-top:24px">Je ontvangt deze email omdat je alerts hebt ingeschakeld in Reggy.<br>Beheer je meldingen in de app onder Alerts → Configuratie.</p>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: "BREVO_API_KEY not configured" });
  }

  try {
    // Get all accounts with their alert preferences
    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, company_name, email, plan_status")
      .eq("plan_status", "active");

    if (accError) throw accError;

    let emailsSent = 0;

    for (const account of accounts || []) {
      // Get alert config for this account (stored in alert_preferences table)
      const { data: prefData } = await supabase
        .from("alert_preferences")
        .select("*")
        .eq("account_id", account.id)
        .single();

      // Skip if no preferences or email alerts disabled
      if (!prefData || !prefData.email_enabled) continue;

      const config = prefData.config || {};

      // Get account transactions for alert checking
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", account.id)
        .order("created_at", { ascending: false });

      const { data: branches } = await supabase
        .from("branches")
        .select("name")
        .eq("account_id", account.id);

      const { data: emballageTypes } = await supabase
        .from("emballage_types")
        .select("*")
        .eq("account_id", account.id);

      const alerts = [];
      const trans = transactions || [];
      const branchNames = (branches || []).map(b => b.name);

      // 1. Inactive branches
      if (config.inactiveBranches !== false) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        branchNames.forEach(b => {
          const bt = trans.filter(t => t.branch === b);
          const lastDate = bt.length > 0 ? bt[0].date : null;
          if (!lastDate || new Date(lastDate) < oneWeekAgo) {
            alerts.push({ severity: "warning", title: `${b} is inactief`, message: `Laatste registratie: ${lastDate || "nooit"}` });
          }
        });
      }

      // 2. High supplier balances
      if (config.highSupplierSaldo !== false) {
        const saldo = {};
        trans.forEach(t => {
          if (!saldo[t.supplier]) saldo[t.supplier] = { in: 0, out: 0, value: 0 };
          if (t.type === "IN") saldo[t.supplier].in += t.qty;
          else saldo[t.supplier].out += t.qty;
        });
        // Calculate value
        Object.entries(saldo).forEach(([sup, data]) => {
          const net = data.in - data.out;
          const avgValue = (emballageTypes || []).filter(e => e.supplier_name === sup);
          const unitValue = avgValue.length > 0 ? avgValue.reduce((s, e) => s + e.value, 0) / avgValue.length : 10;
          data.value = Math.abs(net) * unitValue;
          if (data.value > 500) {
            alerts.push({ severity: "info", title: `Hoog saldo: ${sup}`, message: `€${data.value.toFixed(0)} uitstaand` });
          }
        });
      }

      // 3. Negative balance
      if (config.negativeBalance !== false) {
        const saldo = {};
        trans.forEach(t => {
          if (!saldo[t.supplier]) saldo[t.supplier] = { in: 0, out: 0 };
          if (t.type === "IN") saldo[t.supplier].in += t.qty;
          else saldo[t.supplier].out += t.qty;
        });
        Object.entries(saldo).forEach(([sup, data]) => {
          if (data.in - data.out < -10) {
            alerts.push({ severity: "error", title: `Negatief saldo: ${sup}`, message: `${data.in - data.out} stuks` });
          }
        });
      }

      // 4. No weekly activity
      if (config.noWeeklyActivity !== false) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const thisWeek = trans.filter(t => new Date(t.date) >= weekAgo);
        if (thisWeek.length === 0 && trans.length > 0) {
          alerts.push({ severity: "warning", title: "Geen activiteit deze week", message: "Er zijn deze week geen transacties geregistreerd" });
        }
      }

      // Send email if there are alerts
      if (alerts.length > 0) {
        const html = buildAlertEmail(account.company_name, alerts);
        const sent = await sendEmail(
          prefData.email || account.email,
          `🔔 ${alerts.length} melding${alerts.length !== 1 ? "en" : ""} — ${account.company_name}`,
          html
        );
        if (sent) emailsSent++;
      }
    }

    return res.status(200).json({ success: true, emailsSent });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
