// Config, plan metadata, and design tokens (extracted Stage 1)
export const MODEL = "claude-sonnet-4-6";
export const PROXY = "https://dottie-proxy.wplevy.workers.dev";
export const SUPA_URL = "https://mmhodgxhpsractyhxazw.supabase.co";
export const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taG9kZ3hocHNyYWN0eWh4YXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Mjk2OTYsImV4cCI6MjA5ODAwNTY5Nn0.lbfc_K_ZvgeH9Gm5Thv7uADlgVHC7cnZaCtN8gK1vb4";
export const STRIPE_WORKER = "https://dottie-stripe.wplevy.workers.dev";
export const ENFORCE_SUBSCRIPTION = false; // flip true to require an active plan to generate
export const PLAN_META = { solo:{label:"Solo",price:"$99/mo",included:10,over:"$10",users:"1 attorney and 1 staff seat"}, firm:{label:"Firm",price:"$199/mo",included:30,over:"$8",users:"Up to 6 attorney or staff seats"} };
export const PLAN_FEATURES = ["All 14 California deed & transfer generators","AI deed extraction & triple-document analysis","Automatic PCOR (BOE-502-A), all 58 counties","Saved documents & firm master settings"];

export const C = { gold:"#b8960c", goldlt:"#e8c84a", ink:"#1a1710", paper:"#f5f0e8", cream:"#ede7d8", rule:"#e0d8c8", muted:"#7a7060", green:"#3a7a3a", amber:"#c07a10", red:"#c03020" };
export const ST = {
  inp:{ width:"100%", background:"#fff", border:`1px solid ${C.rule}`, color:C.ink, padding:"10px 14px", fontSize:14, fontFamily:"Georgia,serif", borderRadius:2, outline:"none", boxSizing:"border-box" },
  lbl:{ display:"block", fontSize:10, letterSpacing:3, textTransform:"uppercase", color:C.muted, marginBottom:6 },
  btnP:{ background:C.gold, color:"#fff", border:"none", padding:"12px 32px", fontSize:11, letterSpacing:3, textTransform:"uppercase", cursor:"pointer", fontFamily:"Georgia,serif", borderRadius:2 },
  btnS:{ background:"none", border:`1px solid ${C.rule}`, color:C.muted, padding:"12px 24px", fontSize:11, letterSpacing:3, textTransform:"uppercase", cursor:"pointer", fontFamily:"Georgia,serif", borderRadius:2 },
  btnG:{ background:"none", border:"none", color:"#a09070", padding:"12px 20px", fontSize:11, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", fontFamily:"Georgia,serif" },
  sec:{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:C.gold, marginBottom:12, marginTop:24, paddingBottom:8, borderBottom:`1px solid ${C.rule}` },
  card:{ background:"#fff", border:`1px solid ${C.rule}`, borderRadius:2, padding:"18px 22px", marginBottom:12 },
  warn:{ background:"#fff8f0", border:`1px solid #e8c060`, borderLeft:`3px solid ${C.gold}`, padding:"12px 16px", fontSize:12, color:"#5a4010", lineHeight:1.8, marginBottom:16 },
  err:{ background:"#fff0f0", border:`1px solid #e09080`, borderLeft:`3px solid ${C.red}`, padding:"12px 16px", fontSize:12, color:"#5a1010", lineHeight:1.8, marginBottom:12 },
};
