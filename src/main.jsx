import React from 'react';
import { createRoot } from 'react-dom/client';
import * as PDFLib from 'pdf-lib';
import { MODEL, PROXY, SUPA_URL, SUPA_KEY, STRIPE_WORKER, ENFORCE_SUBSCRIPTION, PLAN_META, PLAN_FEATURES, C, ST } from './config.js';
import { supa } from './supabase.js';
import { COUNTY_ASSESSORS, RT_EXEMPTIONS, NOTARY, VESTING, CAPACITY, CAPACITY_FIELDS, COUNTIES, DOC_TYPES, COUNTY_INFO, DEF_COUNTY, CHECKLISTS, DEFAULT_MASTER, PCOR_DOCS } from './data.js';
import { FEE_EXEMPTIONS } from './docHelpers.js';
import { getPCORReason } from './docHelpers.js';
import { genGrant, genTrust, genDOT, genQuitclaim, genInterspousal, genADJT, genADTR, genSSCP, genTOD, genRecon, genEasement, genDOTMod, genTrusteeDeed, genSheriff, genPCOR, genCourtOrder, genCorrective, genACT } from './generators.js';

        const { useState, useCallback, useEffect } = React;

let ddToken = "";


const Field = ({label, children, hint, warn, required}) => (
  <div style={{marginBottom:18}}>
    {label && <label style={{...ST.lbl, ...(required?{color:C.gold}:{})}}>{label}{required&&<span style={{color:C.gold}}> *</span>}</label>}
    {children}
    {hint && <div style={{fontSize:11,color:"#a09070",marginTop:4}}>{hint}</div>}
    {warn && <div style={{fontSize:11,color:C.amber,marginTop:4}}>⚠ {warn}</div>}
  </div>
);




// Build complete grantor signature line based on capacity and sub-fields


// Build notary block with correct capacity-specific language


// Capacity sub-fields needed for each capacity type


const ICONS = {
  doc: <><path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5V7h4"/><path d="M9 12.5h6M9 16h4"/></>,
  grant: <><path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5V7h4"/><path d="M9 12.5h6M9 16h4"/></>,
  granttrust: <><path d="M4 9.5l8-5 8 5"/><path d="M5.5 10v8M9.5 10v8M14.5 10v8M18.5 10v8"/><path d="M3.5 20.5h17"/></>,
  dot: <><rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></>,
  quitclaim: <><path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5V7h4"/><path d="M8.5 16c1-1.4 2-1.4 3 0s2 1.4 3 0"/></>,
  interspousal: <><circle cx="9.5" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></>,
  adjt: <><path d="M6 2.5h8l4 4v11H6z"/><path d="M14 2.5V7h4"/><circle cx="12" cy="12" r="2.3"/><path d="M10 14l-1 6 3-1.6 3 1.6-1-6"/></>,
  adtr: <><path d="M6 2.5h8l4 4v11H6z"/><path d="M14 2.5V7h4"/><circle cx="12" cy="12" r="2.3"/><path d="M10 14l-1 6 3-1.6 3 1.6-1-6"/></>,
  sscp: <><circle cx="8.5" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M3.5 20c0-3 2.2-5 5-5s5 2 5 5"/><path d="M14.5 20c.2-2.4 1.4-3.6 3-3.6"/></>,
  tod: <><path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5V7h4"/><path d="M9 15h6M13 12l3 3-3 3"/></>,
  recon: <><rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 017-2.8"/></>,
  easement: <><path d="M12 21.5s-6.5-5.2-6.5-10.5a6.5 6.5 0 0113 0c0 5.3-6.5 10.5-6.5 10.5z"/><circle cx="12" cy="11" r="2.3"/></>,
  dotmod: <><path d="M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/><path d="M14 7l3 3"/></>,
  trustees: <><path d="M12 4v16M6.5 20.5h11"/><path d="M12 6.5l-5.5 3.5M12 6.5l5.5 3.5"/><path d="M3.5 10a3 3 0 006 0M14.5 10a3 3 0 006 0"/></>,
  sheriff: <><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9.3 11.6l1.9 1.9L15 9.7"/></>,
  save: <><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3"/><rect x="8" y="13" width="8" height="6"/></>,
  print: <><path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8.5" rx="2"/><path d="M7 14h10v6H7z"/></>,
  edit: <><path d="M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/><path d="M14 7l3 3"/></>,
  settings: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="7" cy="17" r="2.2"/></>,
  tip: <><path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 3a6 6 0 00-3.8 10.6c.8.7 1.3 1.5 1.3 2.4h5c0-.9.5-1.7 1.3-2.4A6 6 0 0012 3z"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5.5"/></>,
  warn: <><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v5M12 18h.01"/></>,
  upload: <><path d="M12 15V4M8 8l4-4 4 4"/><path d="M4 15v4a1 1 0 001 1h14a1 1 0 001-1v-4"/></>,
  download: <><path d="M12 4v11M8 11l4 4 4-4"/><path d="M4 19h16"/></>,
  link: <><path d="M9.5 14.5l5-5"/><path d="M10.5 6.5l1.5-1.5a3.5 3.5 0 015 5l-1.5 1.5"/><path d="M13.5 17.5l-1.5 1.5a3.5 3.5 0 01-5-5l1.5-1.5"/></>,
  clip: <><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
};
function Spinner({size=32,color}){return (<div style={{width:size,height:size,border:`${Math.max(2,Math.round(size/12))}px solid ${C.rule}`,borderTopColor:color||C.gold,borderRadius:"50%",animation:"ddspin .7s linear infinite",margin:"0 auto"}}/>);}
function Icon({t, size=22, color, sw=1.7, style}){
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||C.gold} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display:"block",...(style||{})}}>{ICONS[t]||ICONS.doc}</svg>);
}





// ─── Document generators — built from California public law sources ────────────





























// ─── PCOR applicable doc types ───────────────────────────────────────────────

// ─── PCOR reason code mapping ─────────────────────────────────────────────────



const esc = (v) => String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const firmProvisionsHTML = (m, docType) => {
  const list = (m && m.provisions) || [];
  const app = list.filter(pr => pr && pr.enabled!==false && pr.body && String(pr.body).trim() && (!pr.applyTo || pr.applyTo==="all" || pr.applyTo===docType));
  if (!app.length) return "";
  return '<div class="body-text"><strong>ADDITIONAL PROVISIONS</strong></div>' +
    app.map(pr => '<div class="body-text">' + (pr.title?('<strong>'+esc(pr.title)+'.</strong> '):'') + esc(pr.body).replace(/\n/g,'<br>') + '</div>').join('');
};
const withFirmProvisions = (html, docType, m) => {
  const prov = firmProvisionsHTML(m, docType);
  if (!prov) return html;
  const i = html.indexOf('<div class="sig-block"');
  return i===-1 ? (html + prov) : (html.slice(0,i) + prov + html.slice(i));
};
const _genDocRaw = (docType, f, m) => {
  switch(docType) {
    case "grant":        return genGrant(f,m);
    case "granttrustin":  return genTrust({...f, trustTransferReason: f.trustTransferReason||"T1"}, m);
    case "granttrustout": return genTrust({...f, trustTransferReason: f.trustTransferReason||"T2"}, m);
    case "dot":          return genDOT(f,m);
    case "quitclaim":    return genQuitclaim(f,m);
    case "interspousal": return genInterspousal(f,m);
    case "adjt":         return genADJT(f,m);
    case "adtr":         return genADTR(f,m);
    case "act":          return genACT(f,m);
    case "sscp":         return genSSCP(f,m);
    case "tod":          return genTOD(f,m);
    case "recon":        return genRecon(f,m);
    case "easement":     return genEasement(f,m);
    case "dotmod":       return genDOTMod(f,m);
    case "trustees":     return genTrusteeDeed(f,m);
    case "sheriff":      return genSheriff(f,m);
    case "courtorder":   return genCourtOrder(f,m);
    case "corrective":   return genCorrective(f,m);
    default:             return "";
  }
};
const generateDoc = (docType, f, m) => withFirmProvisions(_genDocRaw(docType, f, m), docType, m);

const docPageCSS = '@page{size:8.5in 11in;margin:1in;}*{box-sizing:border-box;}body{font-family:Times New Roman,serif;font-size:11pt;color:#000;background:#fff;line-height:1.6;}.doc-wrap{max-width:6.5in;margin:0 auto;}.rec-hdr{font-size:10pt;margin-bottom:4pt;}.rec-rule{border:none;border-top:1px solid #000;margin:6pt 0 2pt;}.rec-space{font-size:8pt;text-align:center;color:#444;margin:0 0 6pt;}.doc-title{text-align:center;font-size:13pt;font-weight:bold;margin:18pt 0 12pt;}.doc-subtitle{text-align:center;font-size:11pt;margin:0 0 12pt;}.two-col{display:table;width:100%;margin:8pt 0;}.col-l{display:table-cell;width:50%;vertical-align:top;padding-right:12pt;}.col-r{display:table-cell;width:50%;vertical-align:top;padding-left:12pt;}.col-label{font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;}.rule{border:none;border-top:1px solid #000;margin:10pt 0;}.body-text{font-size:11pt;margin:8pt 0;text-align:left;line-height:1.7;}.indent{margin-left:36pt;}.sig-block{margin:24pt 0 8pt;}.sig-line{font-size:11pt;margin-bottom:1pt;letter-spacing:0.5pt;}.sig-name{font-size:11pt;}.notary-box{border:1.5pt solid #000;padding:8pt 10pt;margin:16pt 0 8pt;font-size:10pt;line-height:1.6;}.jurat-title{text-align:center;font-weight:bold;font-size:11pt;margin:12pt 0 8pt;letter-spacing:2px;}.jurat-block{font-size:11pt;margin:8pt 0;line-height:1.8;}.ss-block{margin-left:20pt;}.footer-note{font-size:9pt;color:#444;margin-top:24pt;border-top:1px solid #ccc;padding-top:6pt;}.doc-pre{font-family:Times New Roman,serif;font-size:11pt;white-space:pre-wrap;line-height:1.7;margin:0;padding:0;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}';

const wrapDocHTML = (bodyHTML, docLabel, apn) => {
  const isHTML = (bodyHTML||"").indexOf('<div') >= 0 || (bodyHTML||"").indexOf('<hr') >= 0;
  const body = isHTML
    ? (bodyHTML||"")
    : '<pre style="font-family:Times New Roman,serif;font-size:11pt;white-space:pre-wrap;line-height:1.6;margin:0;">' + (bodyHTML||"") + '</pre>';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + (docLabel||"") + ' - ' + (apn||"draft") + '</title><style>' + docPageCSS + '</style></head><body><div class="doc-wrap">' + body + '</div></body></html>';
};

const generateWordDoc = (docHTML, docLabel, apn) => {
  const fullHTML = wrapDocHTML(docHTML, docLabel, apn);
  const printWindow = window.open("","_blank");
  if (!printWindow) { alert("Please allow popups to print documents."); return; }
  printWindow.document.write(fullHTML);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(function(){ printWindow.print(); }, 800);
};
const downloadWordDoc = (docHTML, docLabel, apn) => {
  const fullHTML = wrapDocHTML(docHTML, docLabel, apn);
  const blob = new Blob(['\ufeff', fullHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (docLabel||"deed") + "_" + (apn||"draft") + ".doc";
  a.click();
  URL.revokeObjectURL(url);
};
// Deeds collect a mailing address as one combined string ("123 Main St, Los Angeles, CA 90001"),
// but the PCOR has separate Address / City / State / Zip boxes. Splitting avoids printing the
// city, state and zip twice. Anything that does not parse cleanly stays whole in `street`
// rather than being silently mangled.
const splitAddress = (raw) => {
  const out = { street: "", city: "", state: "", zip: "" };
  const val = String(raw || "").trim();
  if (!val) return out;
  const parts = val.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length < 2) { out.street = val; return out; }

  const tail = parts[parts.length - 1];
  // Only a 2-letter code or a spelled-out "California", optionally with a ZIP, counts as
  // a state/zip tail. Otherwise a 2-part address like "123 Main St, Oakland" would file
  // the city as the state.
  const m = tail.match(/^\s*(?:([A-Za-z]{2})|(California))?\s*(\d{5}(?:-\d{4})?)?\s*$/i);
  const stateTxt = m ? ((m[1] || m[2] || "").trim()) : "";
  const zipTxt = m ? ((m[3] || "").trim()) : "";
  const looksLikeStateZip = !!(stateTxt || zipTxt);

  if (looksLikeStateZip && parts.length >= 3) {
    out.state = stateTxt;
    out.zip = zipTxt;
    out.city = parts[parts.length - 2];
    out.street = parts.slice(0, parts.length - 2).join(", ");
  } else if (looksLikeStateZip && parts.length === 2) {
    out.state = stateTxt;
    out.zip = zipTxt;
    out.street = parts[0];
  } else {
    out.city = parts[parts.length - 1];
    out.street = parts.slice(0, parts.length - 1).join(", ");
  }
  return out;
};

// Format checks for address fields. These warn, they never block: an attorney must always
// be able to record an address we do not recognize.
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const zipWarn = (v) => {
  const t = String(v || "").trim();
  if (!t) return "";
  return /^\d{5}(-\d{4})?$/.test(t) ? "" : "ZIP should be 5 digits, or 5+4 like 90001-1234.";
};
const stateWarn = (v) => {
  const t = String(v || "").trim();
  if (!t) return "";
  if (/^california$/i.test(t)) return "";
  return US_STATES.includes(t.toUpperCase()) ? "" : "Use a two-letter state code, for example CA.";
};

const NavMenu = ({ isMobile, open, setOpen, isAdmin, go }) => {
  const items = [
    { key:"mydocs",  label:"My Docs",  fn:go.mydocs },
    { key:"guide",   label:"Guide",    fn:go.guide },
    { key:"billing", label:"Billing",  fn:go.billing },
    { key:"settings",label:"Settings", fn:go.settings, dark:true },
    ...(isAdmin ? [{ key:"admin", label:"\u2691 Admin", fn:go.admin, admin:true }] : []),
    { key:"signout", label:"Sign out", fn:go.signout },
  ];
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open, setOpen]);

  if (!isMobile) {
    return (
      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
        {items.map(it => (
          <button key={it.key} onClick={it.fn} style={
            it.dark ? {background:C.ink,color:"#d4c49a",border:"none",padding:"7px 10px",fontSize:9,cursor:"pointer",fontFamily:"Georgia,serif",borderRadius:2,whiteSpace:"nowrap"}
            : it.admin ? {background:"#8a2020",color:"#fff",border:"none",padding:"7px 10px",fontSize:9,cursor:"pointer",fontFamily:"Georgia,serif",borderRadius:2,whiteSpace:"nowrap"}
            : {...ST.btnS,padding:"6px 10px",fontSize:9,letterSpacing:1,whiteSpace:"nowrap"}
          }>{it.key==="settings"?<><Icon t="settings" size={12} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>Settings</>:it.label}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
      <button aria-label="Menu" onClick={()=>setOpen(!open)} style={{background:open?C.cream:"#fff",border:`1px solid ${C.rule}`,borderRadius:4,padding:"7px 10px",cursor:"pointer",display:"flex",flexDirection:"column",gap:3,width:38,alignItems:"center",justifyContent:"center",height:34}}>
        <span style={{display:"block",width:18,height:2,background:C.ink}}/>
        <span style={{display:"block",width:18,height:2,background:C.ink}}/>
        <span style={{display:"block",width:18,height:2,background:C.ink}}/>
      </button>
      {open && (
        <div style={{position:"absolute",right:0,top:42,background:"#fff",border:`1px solid ${C.rule}`,borderRadius:6,boxShadow:"0 10px 40px rgba(26,23,16,0.16)",minWidth:180,zIndex:50,overflow:"hidden"}}>
          {items.map((it,idx) => (
            <button key={it.key} onClick={()=>{setOpen(false);it.fn();}} style={{display:"block",width:"100%",textAlign:"left",padding:"13px 16px",fontSize:13,fontFamily:"Georgia,serif",cursor:"pointer",background:it.admin?"#fbeaea":"#fff",color:it.admin?"#8a2020":C.ink,border:"none",borderTop:idx?`1px solid ${C.cream}`:"none",letterSpacing:0.5}}>{it.label}</button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = ({subtitle, onHome, rightContent}) => (
  <div style={{background:"#fff",borderBottom:`1px solid ${C.rule}`,flexShrink:0}}>
    <div style={{height:58,padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between",overflow:"visible"}}>
      <div style={{display:"flex",alignItems:"center",height:"100%",cursor:"pointer",flexShrink:0}} onClick={onHome}>
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${C.rule}`,paddingRight:12,marginRight:12,height:"100%"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.gold,letterSpacing:5,textTransform:"uppercase",lineHeight:1.5}}>Dottie</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:C.ink,letterSpacing:5,textTransform:"uppercase",lineHeight:1.5}}>Deeds</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,overflow:"visible",flexShrink:1,minWidth:0}}>
        {rightContent}
      </div>
    </div>
    <div style={{height:2,background:`linear-gradient(90deg,${C.gold},${C.goldlt},${C.gold})`}}/>
  </div>
);

function DottieDeeds() {
  const [screen, setScreen] = useState("loading");
  const [isMobile, setIsMobile] = useState(typeof window!=="undefined" && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const [navOpen, setNavOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [myDocs, setMyDocs] = useState([]);
  const [myDocsLoading, setMyDocsLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [trackWarn, setTrackWarn] = useState("");
  const [authProfile, setAuthProfile] = useState(null);
  const [firmId, setFirmId] = useState(null);
  const [firmInviteCode, setFirmInviteCode] = useState("");
  const [oJoinCode, setOJoinCode] = useState("");
  const [firmIsAdmin, setFirmIsAdmin] = useState(false);
  const [invite, setInvite] = useState(()=>{ try{ const u=new URL(window.location.href); const q=(u.searchParams.get("invite")||"").trim().toUpperCase(); if(q){ try{localStorage.setItem("dd_invite",q);}catch(e){} return q; } return (localStorage.getItem("dd_invite")||"").toUpperCase(); }catch(e){ return ""; } });
  const [autoJoinTried, setAutoJoinTried] = useState(false);
  const [oErr, setOErr] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const authName = [authFirstName.trim(), authLastName.trim()].filter(Boolean).join(" ");
  const [checkoutMsg, setCheckoutMsg] = useState("");
  const [billingBusy, setBillingBusy] = useState(false);
  const [periodDeeds, setPeriodDeeds] = useState(null);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [authFirm, setAuthFirm] = useState("");
  const [authRole, setAuthRole] = useState("");
  const [authRoleOther, setAuthRoleOther] = useState("");
  const [authMode, setAuthMode] = useState(() => {
    try {
      const q = new URL(window.location.href).searchParams;
      if (q.get("signup") !== null || q.get("invite")) return "signup";
    } catch (e) {}
    return "login";
  }); // login | signup | forgot
  const [authLoading, setAuthLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminDeeds, setAdminDeeds] = useState([]);
  const [adminMsg, setAdminMsg] = useState(null);
  const [docType, setDocType] = useState("grant");
  const [step, setStep] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [extractError, setExtractError] = useState("");
  const [extractConf, setExtractConf] = useState({});
  const [pnExtracted, setPnExtracted] = useState(null);
  const [pnExtracting, setPnExtracting] = useState(false);
  const [pnError, setPnError] = useState("");
  const [slExtracted, setSlExtracted] = useState(null);
  const [slExtracting, setSlExtracting] = useState(false);
  const [slError, setSlError] = useState("");
  const [legalVerified, setLegalVerified] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [pcorOutput, setPcorOutput] = useState("");
  const [pcorCopied, setPcorCopied] = useState(false);
  const [pcorStep, setPcorStep] = useState(1);
  const [pcorForm, setPcorForm] = useState({
    buyerName:"", buyerAddress:"", buyerCity:"", buyerState:"", buyerZip:"",
    buyerPhone:"", buyerEmail:"",
    isPrimaryResidence:"", occupancyDate:"",
    isDisabledVet:"",
    mailTaxName:"", mailTaxAddress:"", mailTaxCity:"", mailTaxState:"", mailTaxZip:"",
    p1a:"", p1b:"", p1c:"", p1d:"", p1e:"", p1f:"", p1g:"",
    p1h:"", p1i:"", p1j:"", p1k:"", p1l1:"", p1l2:"",
    p1m:"", p1n:"", p1o:"", p1p:"", p1q:"", p1qDesc:"",
    dateOfTransfer:"", transferType:"", transferTypeOther:"",
    inheritanceDate:"", partialInterest:"", partialPct:"",
    totalPurchasePrice:"", downPayment:"",
    propertyType:"", hasPersonalProperty:"",
    hasManufacturedHome:"", producesIncome:"",
    propertyCondition:"", conditionDesc:""
  });
  const updPcor = (k,v) => setPcorForm(p=>({...p,[k]:v}));
  const [dragOver, setDragOver] = useState(false);
  const [masterSaved, setMasterSaved] = useState(false);
  const [masterVersions, setMasterVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [masterNote, setMasterNote] = useState("");
  const [dataMsg, setDataMsg] = useState("");
  const [oStep, setOStep] = useState(0);
  const [oForm, setOForm] = useState({firmName:"",firmAddress:"",firmCity:"",firmState:"California",firmZip:"",defaultTrustee:""});
  const [gDoc, setGDoc] = useState("grant");
  const [gCounty, setGCounty] = useState("Alameda");
  const [master, setMaster] = useState(() => { try { const s = localStorage.getItem("dd_master"); return s?{...DEFAULT_MASTER,...JSON.parse(s)}:DEFAULT_MASTER; } catch { return DEFAULT_MASTER; } });

  const blank = (m=DEFAULT_MASTER) => ({
    grantor:"", grantorCapacity:"", apn:"", county:"", countyOfResidence:"",
    feeExemption:"", orderTitle:"", additionalApns:"", courtCaseNumber:"",
    correctiveOriginalType:"", correctiveOriginalDocNumber:"", correctiveOriginalRecordingDate:"", correctiveReason:"",
    actReason:"", actPriorTrusteeName:"", actRestatementDate:"", actResignationDate:"", actAppointerName:"", actOriginalGrantees:"",
    propertyAddress:"", granteeAddress:"", grantorPronoun:"", rtCodeKey:"",
    trustorAddress:"", loanAmountWords:"", seniorLienRecordingDate:"",
    seniorLienType:"", spouseCurrentVesting:"", isAmended:false,
    legalDescription:"", cityOfProperty:"",
    exemptFromTax:false, exemptReason:((m&&m.defaultExemptReason)||"R&T §11930 — transfer to/from trust"), dtt:"",
    grantee:"", granteeVesting:"", customVesting:"",
    trustName:"", trustDate:"", trustType:"Revocable Living Trust", settlorName:"",
    trusteeName:"", trustTransferReason:"", beneficiaryName:"",
    isSettlorDeceased:false, dateOfDeath:"", prop19:"", certify19100:false,
    dotPosition:"", trustorName:"", trustorVesting:"",
    trustorCustomVesting:"", trustorCapacity:"",
    beneficiaryLenderName:"", beneficiaryLenderAddress:"",
    dotTrustee:((m&&m.defaultTrustee)||""), loanAmount:"",
    dueOnSale:false, lateChargeDays:"", lateChargePercent:"",
    businessPurpose:false, customRiders:"", requestNOD:false,
    seniorLienHolder:"", seniorLienAmount:"", seniorLienRecording:"",
    spouseName:"", spouseVesting:"", interspousalReason:"",
    survivingJointTenant:"", deceasedJointTenant:"", deceasedJointTenantAKA:"", originalDeedType:"", dateOfDeathJT:"", placeOfDeath:"",
    originalDeedDate:"", originalDeedRecording:"", originalDeedGrantor:"", originalDeedRecordingDate:"",
    deceasedTrusteeName:"", successorTrusteeName:"", dateOfDeathTrustee:"",
    decedentName:"", sscp_isPrimaryResidence:false, sscp_sb2Exempt:false,
    todOwner:"", todOwnerVesting:"", todOwnerZip:"", todBeneficiaryType:"",
    todEntityName:"", todBeneficiaryRelationship:"",
    todBeneficiary:"", todBeneficiary2:"", todTrustName:"", todTrustDate:"", todTrusteeName:"",
    reconTrustee:"", reconBeneficiary:"", reconOriginalDeedDate:"", reconRecording:"",
    reconLoanAmount:"", reconType:"", reconRecordingDate:"",
    reconOriginalTrustee:"", reconNewTrustee:"", reconSuccessionReason:"",
    reconSuccessorTrustName:"", reconSuccessorTrustTitle:"",
    easementType:"", easementTypeCustom:"", easementDescription:"",
    easementTerms:"", easementWidth:"", easementExclusive:false, dominantDescription:"",
    dotModPosition:"", dotModTerms:"", dotModNewAmount:"", dotModNewMaturity:"", dotModNewRate:"",
    trusteeSaleDate:"", trusteeSaleLocation:"", trusteeSalePrice:"",
    sheriffName:"", courtName:"", caseNumber:"", caseName:"", judgmentDate:"",
    judgmentCreditor:"", judgmentDebtor:"",
    // Signing capacity sub-fields
    capTrustName:"", capTrustDate:"", capCoTrustees:"", capTrusteeRole:"",
    capDeceasedTrusteeName:"",
    capAifPrincipal:"", capAifAgent:"",
    capEntityName:"", capEntityState:"", capOfficerTitle:"",
    capPartnershipName:"", capPartnershipType:"", capPartnerTitle:"",
    capEstateName:"", capPRCourt:"", capPRCaseNo:"", capPRRole:"",
    capWardName:"", capGCRole:"",
    capReceiverCourt:"", capReceiverCaseNo:"",
  });

  const [form, setForm] = useState(blank);
  const upd = useCallback((k,v) => setForm(p=>({...p,[k]:v})), []);
  const oUpd = (k,v) => setOForm(p=>({...p,[k]:v}));

  // Auth state management
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supa.auth.getSession();
        if (session) {
          setAuthUser(session.user);
          ddToken = session.access_token || "";
          const { data: profile } = await supa.from("profiles").select("*").eq("id", session.user.id).single();
          setAuthProfile(profile);
          console.log("INIT PROFILE:", JSON.stringify(profile));
          if (profile && profile.is_approved === true) {
            if (!localStorage.getItem("dd_sid")) registerSession(session.user.id);
            if (profile.firm_id) {
              try {
                const { data: firm } = await supa.from("firms").select("*").eq("id", profile.firm_id).single();
                if (firm) {
                  setFirmId(firm.id);
                  setFirmInviteCode(firm.invite_code || ""); setFirmIsAdmin(firm.created_by === session.user.id);
                  const nm = {...DEFAULT_MASTER, ...(firm.master || {})};
                  setMaster(nm);
                  try { localStorage.setItem("dd_master", JSON.stringify(nm)); } catch(e) {}
                  setScreen("home");
                } else { setScreen("onboard"); }
              } catch(e) { setScreen("onboard"); }
            } else {
              setScreen("onboard");
            }
          } else if (profile) {
            setScreen("pending");
          } else {
            setScreen("auth");
          }
        } else {
          setScreen("auth");
        }
      } catch(e) {
        setScreen("auth");
      }
    };
    initAuth();
    const { data: { subscription } } = supa.auth.onAuthStateChange(async (event, session) => {
      ddToken = session ? (session.access_token || "") : "";
      if (event === "SIGNED_OUT") { setAuthUser(null); setAuthProfile(null); setFirmId(null); setFirmInviteCode(""); setFirmIsAdmin(false); setMaster({...DEFAULT_MASTER}); try{localStorage.removeItem("dd_master");localStorage.removeItem("dd_sid");}catch(e){} setScreen("auth"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Single active session: sign out if the account is used elsewhere
  useEffect(() => {
    if (!authUser) return;
    const iv = setInterval(async () => {
      try {
        const { data } = await supa.from("profiles").select("active_session").eq("id",authUser.id).single();
        const local = localStorage.getItem("dd_sid");
        if (data && data.active_session && local && data.active_session !== local) {
          clearInterval(iv);
          await supa.auth.signOut();
          alert("You have been signed out because your account was used on another device.");
          setAuthUser(null); setAuthProfile(null); setScreen("auth");
        }
      } catch(e){}
    }, 45000);
    return () => clearInterval(iv);
  }, [authUser]);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("checkout");
    if (p === "success") setCheckoutMsg("\u2713 Subscription active. Thank you.");
    else if (p === "cancel") setCheckoutMsg("Checkout canceled \u2014 no charge was made.");
    if (p) { const u = new URL(window.location.href); u.searchParams.delete("checkout"); window.history.replaceState({}, "", u.toString()); setTimeout(()=>setCheckoutMsg(""), 6000); }
  }, []);

  useEffect(() => {
    setForm(blank(master||DEFAULT_MASTER));
    setExtracted(null); setExtractConf({}); setLegalVerified(false); setStep(0); setOutput("");
    setPnExtracted(null); setPnError("");
    setSlExtracted(null); setSlError("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType]);

  // Track deed generation
  // Records the deed and reports metered usage. supabase-js RETURNS errors rather than
  // throwing them, so the result must be checked: a swallowed error here once hid a
  // failing insert for nine days, which would also have meant unbilled documents.
  const trackDeed = async (docType, county, completed) => {
    if (!authUser) return;
    try {
      const { error: insErr } = await supa.from("deeds").insert({
        user_id: authUser.id,
        doc_type: docType,
        firm_id: firmId,
        county: county,
        completed: completed,
        downloaded: false,
        master_version: master.masterVersion || 1,
      });
      if (insErr) {
        console.error("trackDeed: deed was NOT recorded:", insErr);
        setTrackWarn("This document was created, but it could not be recorded to your account history. " + (insErr.message || ""));
        return; // do not report usage for a deed we failed to record
      }
      setTrackWarn("");

      const { error: seenErr } = await supa.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", authUser.id);
      if (seenErr) console.error("trackDeed: last_seen not updated:", seenErr);

      try {
        const r = await fetch(STRIPE_WORKER+"/report-usage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken,quantity:1})});
        if (!r.ok) console.error("trackDeed: usage not reported, HTTP " + r.status);
      } catch(e) { console.error("trackDeed: usage not reported:", e); }
    } catch(e) {
      console.error("trackDeed failed:", e);
      setTrackWarn("This document was created, but it could not be recorded to your account history.");
    }
  };

  const hasActiveSub = () => ["active","trialing"].includes(authProfile?.subscription_status);
  const compDaysLeft = () => {
    const t = authProfile?.comp_until; if (!t) return null;
    const ms = new Date(t).getTime() - Date.now();
    return ms > 0 ? Math.ceil(ms / 86400000) : 0;
  };
  const isComped = () => { const d = compDaysLeft(); return d !== null && d > 0; };
  const canUse = () => hasActiveSub() || isComped() || !!authProfile?.is_admin;
  const registerSession = async (userId) => { try { const sid = (crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()); localStorage.setItem("dd_sid", sid); await supa.from("profiles").update({active_session:sid}).eq("id",userId); } catch(e){} };
  const startCheckout = async (plan, annual) => {
    setBillingBusy(true); setCheckoutMsg("");
    try {
      const r = await fetch(STRIPE_WORKER+"/create-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken,plan,annual:!!annual})});
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      setCheckoutMsg(d.error||"Could not start checkout. Please try again.");
    } catch(e){ setCheckoutMsg("Could not reach billing. Please try again."); }
    setBillingBusy(false);
  };
  const openPortal = async () => {
    setBillingBusy(true); setCheckoutMsg("");
    try {
      const r = await fetch(STRIPE_WORKER+"/portal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken})});
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      setCheckoutMsg(d.error||"Could not open the billing portal.");
    } catch(e){ setCheckoutMsg("Could not reach the billing portal."); }
    setBillingBusy(false);
  };
  const approveUser = async (u, withComp) => {
    const patch = {is_approved:true};
    if (withComp && !u.comp_until) patch.comp_until = new Date(Date.now()+60*86400000).toISOString();
    const {error} = await supa.from("profiles").update(patch).eq("id",u.id);
    if (error) { setAdminMsg({ok:false,text:"Could not approve "+(u.name||u.email)+": "+(error.message||error)}); return; }
    setAdminUsers(prev=>prev.map(p=>p.id===u.id?{...p,...patch}:p));
    const label = withComp ? " with 60 days free" : "";
    try {
      const r = await fetch(STRIPE_WORKER+"/notify-approved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken,email:u.email,name:u.name,free_days:withComp?60:0})});
      const j = await r.json().catch(()=>({}));
      if (j && j.ok) setAdminMsg({ok:true,text:"Approved "+(u.name||u.email)+label+". Approval email sent to "+u.email+"."});
      else setAdminMsg({ok:false,text:"Approved "+(u.name||u.email)+label+", but the email did not send: "+((j&&(j.error||j.reason))||("HTTP "+r.status))+". Reach them another way."});
    } catch(e) { setAdminMsg({ok:false,text:"Approved "+(u.name||u.email)+label+", but the email request failed: "+(e.message||e)+"."}); }
  };
  const refreshProfile = async () => { if(!authUser) return; try { const {data} = await supa.from("profiles").select("*").eq("id",authUser.id).single(); if(data) setAuthProfile(data); } catch(e){} };
  const changePlan = async (plan) => {
    setBillingBusy(true); setCheckoutMsg("");
    try {
      const r = await fetch(STRIPE_WORKER+"/change-plan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken,plan})});
      const d = await r.json();
      if (d.ok) { await refreshProfile(); loadPeriodUsage(); setCheckoutMsg("Plan updated to "+(PLAN_META[plan]?.label||plan)+"."); }
      else setCheckoutMsg(d.error||"Could not change plan. Please try again.");
    } catch(e){ setCheckoutMsg("Could not reach billing. Please try again."); }
    setBillingBusy(false);
  };
  const loadPeriodUsage = async () => {
    if (!authUser) { setPeriodDeeds(null); return; }
    try {
      const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
      const { count } = await supa.from("deeds").select("*",{count:"exact",head:true}).eq("user_id",authUser.id).gte("created_at",start.toISOString());
      setPeriodDeeds(count||0);
    } catch(e){ setPeriodDeeds(null); }
  };
  const saveMaster = async () => {
    const provs=(master.provisions||[]).map(pv=>pv.source?pv:{...pv,source:"firm"});
    const nm={...master,provisions:provs,masterVersion:(master.masterVersion||1)+1,masterUpdated:new Date().toLocaleDateString()};
    setMaster(nm);
    try { localStorage.setItem("dd_master",JSON.stringify(nm)); } catch {}
    if(authUser && firmId){
      try { await supa.from("firms").update({ master: nm, name: nm.firmName||"" }).eq("id", firmId); } catch(e){}
      try { await supa.from("master_versions").insert({ user_id: authUser.id, firm_id: firmId, version_no: nm.masterVersion, snapshot: nm, note: (masterNote||"").trim()||null }); } catch(e){}
    } else if(authUser){
      try { await supa.from("profiles").update({master:nm, firm:nm.firmName}).eq("id",authUser.id); } catch(e){}
    }
    setMasterNote("");
    setMasterSaved(true); setTimeout(()=>setMasterSaved(false),2500);
  };
  const isMasterDirty = () => { try { return JSON.stringify(master) !== JSON.stringify({...DEFAULT_MASTER, ...JSON.parse(localStorage.getItem("dd_master")||"{}")}); } catch { return false; } };
  const leaveMaster = () => { if(isMasterDirty() && !window.confirm("You have unsaved changes to your firm settings. Leave without saving?")) return; setScreen("home"); };
  const MASTER_DIFF_FIELDS=[["firmName","firm name"],["firmAddress","address"],["firmCity","city"],["firmState","state"],["firmZip","zip"],["defaultTrustee","default trustee"],["lateChargeDays","late charge days"],["lateChargePercent","late charge %"],["defaultDueOnSale","due-on-sale default"],["standardCovenants","standard covenants"],["defaultExemptReason","default DTT exemption"],["prepaymentLanguage","prepayment language"]];
  const diffMasters = (prev, curr) => {
    if(!prev) return "Initial version.";
    const changed=[]; MASTER_DIFF_FIELDS.forEach(([k,label])=>{ if(JSON.stringify(prev[k]??"")!==JSON.stringify(curr[k]??"")) changed.push(label); });
    const key=x=>((x.title||"")+"|"+(x.body||"")); const pv=(prev.provisions||[]).map(key), cv=(curr.provisions||[]).map(key);
    const added=cv.filter(k=>!pv.includes(k)).length, removed=pv.filter(k=>!cv.includes(k)).length;
    const parts=[]; if(changed.length) parts.push("Changed: "+changed.join(", ")); if(added) parts.push("+"+added+" provision"+(added>1?"s":"")); if(removed) parts.push("-"+removed+" provision"+(removed>1?"s":""));
    return parts.length?parts.join(" · "):"No tracked changes.";
  };
  const loadMasterVersions = async () => {
    if(!authUser){ setMasterVersions([]); return; }
    try { const { data } = await supa.from("master_versions").select("*").eq("firm_id",firmId).order("created_at",{ascending:false}); setMasterVersions(data||[]); } catch(e){ setMasterVersions([]); }
  };
  const restoreMasterVersion = (snap) => { if(!snap) return; setMaster({...DEFAULT_MASTER,...snap}); setShowHistory(false); setMasterSaved(false); };
  const saveDocument = async (title) => {
    if (!authUser) { setSaveMsg("Sign in to save."); setTimeout(()=>setSaveMsg(""),3000); return; }
    setSaveMsg("Saving…");
    try {
      const { error } = await supa.from("saved_documents").insert({ user_id: authUser.id, firm_id: firmId, doc_type: docType, title: (title||"").trim()||"(untitled)", form_data: form, master_version: master.masterVersion || 1 });
      if (error) throw error;
      setSaveMsg("✓ Saved to My Documents");
      setTimeout(()=>setSaveMsg(""),2800);
    } catch(e) { setSaveMsg("Could not save — try again"); setTimeout(()=>setSaveMsg(""),3500); }
  };
  const loadMyDocuments = async () => {
    if (!authUser) { setMyDocs([]); return; }
    setMyDocsLoading(true);
    try { const { data } = await supa.from("saved_documents").select("*").eq("firm_id",firmId).order("updated_at",{ascending:false}); setMyDocs(data||[]); }
    catch(e) { setMyDocs([]); }
    setMyDocsLoading(false);
  };
  const openDocument = (d) => { setDocType(d.doc_type); setForm({...blank(master),...(d.form_data||{})}); setStep(1); setOutput(""); setScreen("draft"); };
  const deleteDocument = async (id) => { try { await supa.from("saved_documents").delete().eq("id",id); setMyDocs(prev=>prev.filter(x=>x.id!==id)); } catch(e){} };
  const deleteAllMatters = async () => {
    if(!authUser) return;
    if(!window.confirm("Delete ALL your saved matters? This permanently removes every saved document and the client information in them. This cannot be undone.")) return;
    try { await supa.from("saved_documents").delete().eq("user_id",authUser.id); setMyDocs([]); setDataMsg("All saved matters deleted."); }
    catch(e){ setDataMsg("Could not delete. Try again."); }
    setTimeout(()=>setDataMsg(""),3000);
  };
  const deleteMyAccount = async () => {
    if(!authUser) return;
    if(!window.confirm("Delete your account and ALL your data permanently? This removes your login, firm settings, version history, saved matters, and all client information. This cannot be undone.")) return;
    const typed = window.prompt('This is permanent. Type DELETE to confirm.');
    if(typed!=="DELETE"){ setDataMsg("Cancelled."); setTimeout(()=>setDataMsg(""),2500); return; }
    try {
      try { await fetch(STRIPE_WORKER+"/cancel-subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken})}); } catch(e){}
      const { error } = await supa.rpc("delete_my_account");
      if(error) throw error;
      try { localStorage.clear(); } catch {}
      await supa.auth.signOut();
      setScreen("auth");
    } catch(e){ setDataMsg("Could not delete account. Please contact support."); setTimeout(()=>setDataMsg(""),4000); }
  };
  const inviteLink = () => { try { return window.location.origin + "/app.html?invite=" + encodeURIComponent(firmInviteCode||""); } catch(e){ return ""; } };
  const tryAutoJoin = async (userObj) => {
    const code = ((userObj && userObj.user_metadata && userObj.user_metadata.invite) || invite || "").trim();
    if(!code || !authUser) return false;
    try {
      const { data, error } = await supa.rpc("join_firm_by_code", { p_code: code });
      if(error || !data) return false;
      setFirmId(data.firm_id); setFirmInviteCode(data.invite_code||""); setFirmIsAdmin(false);
      const nm={...DEFAULT_MASTER, ...(data.master||{})};
      setMaster(nm); setForm(blank(nm));
      try{ localStorage.setItem("dd_master", JSON.stringify(nm)); localStorage.removeItem("dd_invite"); }catch(e){}
      setScreen("home");
      return true;
    } catch(e){ return false; }
  };
  useEffect(() => {
    if (screen!=="onboard" || !authUser || autoJoinTried) return;
    const code = ((authUser.user_metadata && authUser.user_metadata.invite) || invite || "").trim();
    if (!code) return;
    setAutoJoinTried(true); setOJoinCode(code); tryAutoJoin(authUser);
  }, [screen, authUser, autoJoinTried, invite]);
  const invited = !!((authUser && authUser.user_metadata && authUser.user_metadata.invite) || invite);
  const finish = async () => {
    setOErr("");
    const nm={...DEFAULT_MASTER,...oForm}; setMaster(nm); setForm(blank(nm));
    try{localStorage.setItem("dd_master",JSON.stringify(nm));}catch{}
    if(authUser){
      try {
        const { data, error } = await supa.rpc("create_firm", { p_name: oForm.firmName||"My Firm", p_master: nm });
        if(error || !data){ setOErr("We couldn't create your firm: "+((error&&error.message)||"unknown error")+". Please try again."); return; }
        setFirmId(data.firm_id); setFirmInviteCode(data.invite_code||""); setFirmIsAdmin(true);
      } catch(e){ setOErr("We couldn't create your firm: "+(e.message||e)+". Please try again."); return; }
    }
    setScreen("home");
  };
  const joinFirm = async () => {
    setOErr("");
    const code=(oJoinCode||"").trim(); if(!code || !authUser) return;
    try {
      const { data, error } = await supa.rpc("join_firm_by_code", { p_code: code });
      if(error || !data){ setOErr("That invite code isn't valid. Check it with your firm admin and try again."); return; }
      setFirmId(data.firm_id); setFirmInviteCode(data.invite_code||""); setFirmIsAdmin(false);
      const nm={...DEFAULT_MASTER, ...(data.master||{})};
      setMaster(nm); setForm(blank(nm));
      try{localStorage.setItem("dd_master",JSON.stringify(nm));}catch{}
      setScreen("home");
    } catch(e){ setOErr("We couldn't join the firm. Please try again."); }
  };
  const skipOnboard = async () => {
    setOErr("");
    if(authUser){ try { const { data, error } = await supa.rpc("create_firm", { p_name: master.firmName||"My Firm", p_master: master }); if(error || !data){ setOErr("We couldn't set up your firm: "+((error&&error.message)||"unknown error")+". Please try again."); return; } setFirmId(data.firm_id); setFirmInviteCode(data.invite_code||""); setFirmIsAdmin(true); } catch(e){ setOErr("We couldn't set up your firm: "+(e.message||e)+". Please try again."); return; } }
    setScreen("home");
  };

  const handleFile = useCallback(async (file) => {
    if (!file||file.type!=="application/pdf") { setExtractError("Please upload a PDF file."); return; }
    setExtractError(""); setExtracting(true); setLegalVerified(false);
    try {
      const base64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
     const resp = await fetch(PROXY,{
        method:"POST", headers:{"Content-Type":"application/json"},
body:JSON.stringify({_dd_auth:ddToken, model:MODEL, max_tokens:1500, messages:[{role:"user",content:[
          {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
         {type:"text",text:`Extract from this recorded deed. Return ONLY valid JSON:\n{"grantor":"the GRANTEE/TRANSFEREE full name and current vesting exactly as written on this prior deed — this is the CURRENT OWNER who will become the GRANTOR on the new deed being drafted, NOT the original grantor on this prior deed","grantorMailingAddress":"the mail tax statements to address or mailing address of grantee/transferee if shown else empty","apn":"assessor parcel number","county":"county name only","city":"city of property","propertyAddress":"street address of the property e.g. 123 Main Street","legalDescription":"complete legal description verbatim","inferredCapacity":"one of exactly: Individual, Trustee, Successor Trustee, LLC Manager / Member, Corporate Officer, General Partner, Attorney-in-Fact, Personal Representative, Guardian / Conservator — infer from the grantee name and vesting","entityName":"if grantee is a corporation or LLC, the entity name only without state or entity type e.g. Amicita LLC becomes Amicita LLC, else empty","stateOfFormation":"if grantee is a corporation or LLC, the state of formation e.g. California, else empty","trustName":"trust name if present else empty","trustDate":"trust date if present else empty","settlorName":"settlor name if present else empty","deedDate":"date of prior deed else empty","recordingInfo":"recording number else empty","confidence":{"grantor":"high|medium|low","apn":"high|medium|low","legalDescription":"high|medium|low","county":"high|medium|low"}}`}
        ]}]})
      });
      const data = await resp.json(); console.log("PROXY RESPONSE:", JSON.stringify(data));
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setExtracted(parsed); setExtractConf(parsed.confidence||{});
      setForm(p=>({...p, grantor:parsed.grantor||"", apn:parsed.apn||"", county:parsed.county||p.county, cityOfProperty:parsed.city||p.cityOfProperty, propertyAddress:parsed.propertyAddress||p.propertyAddress||"", grantorAddress:parsed.grantorMailingAddress||p.grantorAddress||"", trustorAddress:parsed.grantorMailingAddress||p.trustorAddress||"", legalDescription:parsed.legalDescription||"", grantorCapacity:inferCapacity(parsed.grantor, parsed.inferredCapacity)||p.grantorCapacity||"",
          trustorCapacity:inferCapacity(parsed.grantor, parsed.inferredCapacity)||p.trustorCapacity||"",
          trustorVesting:inferVesting(parsed.grantor)||p.trustorVesting||"",
          capEntityName:parsed.entityName||p.capEntityName||"",
          capEntityState:parsed.stateOfFormation||p.capEntityState||"", trustName:parsed.trustName||p.trustName, trustDate:parsed.trustDate||p.trustDate, settlorName:parsed.settlorName||p.settlorName, originalDeedDate:parsed.deedDate||p.originalDeedDate, originalDeedRecording:parsed.recordingInfo||p.originalDeedRecording, reconOriginalDeedDate:parsed.deedDate||p.reconOriginalDeedDate, reconRecording:parsed.recordingInfo||p.reconRecording }));
      setStep(1);
    } catch { setExtractError("Could not extract data. Please enter details manually."); setStep(1); }
    finally { setExtracting(false); }
  },[]);

  const onDrop = useCallback((e)=>{ e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f)handleFile(f); },[handleFile]);
  // Extract from Promissory Note (for DOT)
  const handlePNFile = useCallback(async (file) => {
    if (!file||file.type!=="application/pdf") { setPnError("Please upload a PDF file."); return; }
    setPnError(""); setPnExtracting(true);
    try {
      const base64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
      const resp = await fetch(PROXY,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({_dd_auth:ddToken, model:MODEL, max_tokens:1000, messages:[{role:"user",content:[
          {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
          {type:"text",text:`Extract from this promissory note. Return ONLY valid JSON:
{"borrowerName":"full legal name of borrower/trustor e.g. 11 Amicita LLC, a California limited liability company","borrowerAddress":"borrower street address if shown else empty","signingOfficerName":"if borrower is an entity, the individual name signing on behalf of the entity e.g. John Smith — look in signature block or borrower section, else empty","signingOfficerTitle":"title of the signing officer e.g. Manager, CEO, Member, Managing Member, else empty","lenderName":"full legal name of lender/beneficiary","lenderAddress":"lender street address if shown else empty","lenderCity":"lender city state zip if shown else empty","loanAmount":"loan amount as written e.g. $500,000.00","interestRate":"interest rate e.g. 6.500%","loanDate":"date of note","maturityDate":"maturity/due date if stated else empty","loanType":"e.g. Fixed Rate, Adjustable Rate","monthlyPayment":"monthly payment amount if stated else empty"}`}
        ]}]})
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const clean = text.replace(/^```json\n?/,"").replace(/\n?```$/,"").trim();
      const parsed = JSON.parse(clean);
      setPnExtracted(parsed);
      // Convert loan amount to words
      const amtWords = parsed.loanAmount ? numberToWords(parsed.loanAmount) : "";
      // Auto-populate DOT form fields from PN
      setForm(prev=>({
        ...prev,
        trustorName: parsed.borrowerName||prev.trustorName,
        grantor: parsed.borrowerName||prev.grantor,
        trustorAddress: parsed.borrowerAddress||prev.trustorAddress||"",
        grantorAddress: parsed.borrowerAddress||prev.grantorAddress||"",
        beneficiaryLenderName: parsed.lenderName||prev.beneficiaryLenderName,
        beneficiaryLenderAddress: (parsed.lenderAddress?(parsed.lenderAddress+(parsed.lenderCity?" "+parsed.lenderCity:"")):"")||prev.beneficiaryLenderAddress||"",
        loanAmount: parsed.loanAmount||prev.loanAmount,
        loanAmountWords: amtWords||prev.loanAmountWords||"",
        interestRate: parsed.interestRate||prev.interestRate,
        loanDate: parsed.loanDate||prev.loanDate,
        maturityDate: parsed.maturityDate||prev.maturityDate,
        loanType: parsed.loanType||prev.loanType||"",
        monthlyPayment: parsed.monthlyPayment||prev.monthlyPayment||"",
        capOfficerTitle: parsed.signingOfficerTitle||prev.capOfficerTitle||"",
        capEntityName: prev.capEntityName||(parsed.signingOfficerName?prev.capEntityName:"")||"",
      }));
    } catch(e) {
      setPnError("Could not extract from promissory note. Please fill fields manually.");
    }
    setPnExtracting(false);
  }, []);

  // Convert number to words for loan amount
  const numberToWords = (num) => {
    const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const scales = ["","Thousand","Million","Billion"];
    if (!num) return "";
    // Strip $ and commas
    const clean = String(num).replace(/[$,]/g,"").trim();
    const parts = clean.split(".");
    const dollars = parseInt(parts[0])||0;
    const cents = parts[1] ? parseInt(parts[1].padEnd(2,"0").substring(0,2)) : 0;
    if (dollars === 0 && cents === 0) return "Zero Dollars";
    const convertHundreds = (n) => {
      if (n === 0) return "";
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n/10)] + (n%10?" "+ones[n%10]:"");
      return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+convertHundreds(n%100):"");
    };
    let result = "";
    let remaining = dollars;
    let scaleIdx = 0;
    while (remaining > 0) {
      const chunk = remaining % 1000;
      if (chunk !== 0) {
        const chunkWords = convertHundreds(chunk);
        result = chunkWords + (scales[scaleIdx]?" "+scales[scaleIdx]:"") + (result?" "+result:"");
      }
      remaining = Math.floor(remaining/1000);
      scaleIdx++;
    }
    result += " Dollars";
    if (cents > 0) result += " and "+cents+"/100";
    else result += " and No/100";
    return result;
  };

  // Infer vesting from grantor name string
  const inferVesting = (name) => {
    if (!name) return "";
    const n = name.toLowerCase();
    if (n.includes("llc") || n.includes("limited liability")) return "a California limited liability company";
    if (n.includes("corporation") || n.includes("corp.") || n.includes(", inc.")) return "a California corporation";
    if (n.includes("joint tenants") || n.includes("jtwros")) return "as joint tenants";
    if (n.includes("tenants in common") || n.includes("tic")) return "as tenants in common";
    if (n.includes("community property with right of survivorship")) return "husband and wife as community property with right of survivorship";
    if (n.includes("community property")) return "husband and wife as community property";
    if (n.includes("husband and wife") && n.includes("joint")) return "husband and wife as joint tenants";
    if (n.includes("unmarried")) return "an unmarried man/woman";
    if (n.includes("sole and separate")) return "a married man/woman as his/her sole and separate property";
    if (n.includes("trust") || n.includes("trustee")) return "";
    return "";
  };

  // Infer capacity from grantor name string
  const inferCapacity = (name, inferredFromClaude) => {
    if (inferredFromClaude && inferredFromClaude !== "Individual") return inferredFromClaude;
    if (!name) return "";
    const n = name.toLowerCase();
    if (n.includes("llc") || n.includes("limited liability")) return "LLC Manager / Member";
    if (n.includes("corporation") || n.includes("corp.") || n.includes(", inc.")) return "Corporate Officer";
    if (n.includes("trustee") || n.includes("trust")) return "Trustee";
    if (n.includes("attorney-in-fact") || n.includes("aif")) return "Attorney-in-Fact";
    if (n.includes("general partner") || n.includes("limited partnership") || n.includes(", lp")) return "General Partner";
    if (n.includes("guardian") || n.includes("conservator")) return "Guardian / Conservator";
    if (n.includes("executor") || n.includes("administrator") || n.includes("personal representative")) return "Personal Representative";
    return inferredFromClaude || "";
  };

  // Extract from Senior Lien document
  const handleSLFile = useCallback(async (file) => {
    if (!file||file.type!=="application/pdf") { setSlError("Please upload a PDF file."); return; }
    setSlError(""); setSlExtracting(true);
    try {
      const base64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
      const resp = await fetch(PROXY,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({_dd_auth:ddToken, model:MODEL, max_tokens:1000, messages:[{role:"user",content:[
          {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
          {type:"text",text:'Extract from this deed of trust or mortgage (senior lien). Return ONLY valid JSON:\n{"seniorTrusteeName":"trustee name on the senior deed of trust","seniorBeneficiaryName":"lender/beneficiary on senior deed of trust","seniorBeneficiaryAddress":"beneficiary/lender address if shown else empty","seniorLoanAmount":"original loan amount e.g. $500,000.00","seniorLoanDate":"date of senior deed of trust","seniorRecordingDate":"recording date if shown else empty","seniorRecordingNumber":"document/recording number if shown else empty","seniorLoanType":"e.g. Deed of Trust or Mortgage"}'}
        ]}]})
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const clean = text.replace(/^```json\n?/,"").replace(/\n?```$/,"").trim();
      const parsed = JSON.parse(clean);
      setSlExtracted(parsed);
      setForm(prev=>({
        ...prev,
        // Senior lien fields (correct blank() names)
        seniorLienHolder: parsed.seniorBeneficiaryName||prev.seniorLienHolder||"",
        seniorLienAmount: parsed.seniorLoanAmount||prev.seniorLienAmount||"",
        seniorLienRecording: parsed.seniorRecordingNumber||prev.seniorLienRecording||"",
        seniorLienRecordingDate: parsed.seniorRecordingDate||prev.seniorLienRecordingDate||"",
        seniorLienType: (parsed.seniorLoanType||"").toUpperCase().includes("MORTGAGE")?"MORTGAGE":(parsed.seniorLoanType?"DEED OF TRUST":prev.seniorLienType||""),
        // Use same trustee for new DOT if not already set
        dotTrustee: prev.dotTrustee||parsed.seniorTrusteeName||"",
        beneficiaryLenderAddress: prev.beneficiaryLenderAddress||parsed.seniorBeneficiaryAddress||"",
      }));
    } catch(e) {
      setSlError("Could not extract from senior lien. Please fill fields manually.");
    }
    setSlExtracting(false);
  }, []);

  const handleGenerate = () => {
    if (ENFORCE_SUBSCRIPTION && !canUse()) { loadPeriodUsage(); setScreen("billing"); return; }
    const doc = generateDoc(docType,form,master);
    setOutput(doc);
    setStep(3);
    trackDeed(docType, form.county, true);
    try { localStorage.setItem("dd_lastform", JSON.stringify({docType,form,step:3,output:doc,ts:Date.now()})); } catch(e) {}
  };
  const copyAndDownload = () => {
    const tmp = document.createElement("div"); tmp.innerHTML = output;
    const plainText = tmp.innerText||tmp.textContent||output;
    navigator.clipboard.writeText(plainText).catch(()=>{});
    const blob = new Blob([plainText],{type:"text/plain"}); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${DOC_TYPES.find(d=>d.id===docType)?.label||"deed"}_${form.apn||"draft"}.txt`; a.click(); URL.revokeObjectURL(url);
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };

  const dt = DOC_TYPES.find(d=>d.id===docType);
  const STEPS = ["Upload","Property Details","Transfer Details","Review & Download","PCOR"];
  const gcl = CHECKLISTS[gDoc]||CHECKLISTS.grant;
  const gci = COUNTY_INFO[gCounty]||DEF_COUNTY;

  const ConfBadge = ({level}) => {
    const cfg = {high:{bg:"#e8f5e0",border:"#90c060",color:C.green,text:"✓ Extracted"},medium:{bg:"#fff8e8",border:"#e0c060",color:C.amber,text:"⚠ Verify"},low:{bg:"#fff0f0",border:"#e09080",color:C.red,text:"✗ Enter manually"}};
    const c = cfg[level]||{bg:C.cream,border:C.rule,color:C.muted,text:"Manual"};
    return <span style={{background:c.bg,border:`1px solid ${c.border}`,color:c.color,padding:"2px 8px",borderRadius:2,fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:1,marginLeft:8}}>{c.text}</span>;
  };

  const RTDropdown = () => (
    <>
      <select value={form.rtCodeKey||""} onChange={e=>{ const sel=RT_EXEMPTIONS.find(r=>r.code===e.target.value); upd("rtCodeKey",e.target.value); if(sel&&sel.text)upd("exemptReason",sel.text); }} style={{...ST.inp,marginBottom:8}}>
        <option value="">— Select exemption reason —</option>
        {RT_EXEMPTIONS.map(r=><option key={r.code} value={r.code}>{r.label}</option>)}
      </select>
      <textarea value={form.exemptReason} onChange={e=>upd("exemptReason",e.target.value)} rows={3} placeholder="Exemption language (auto-fills when you select above)" style={{...ST.inp,resize:"vertical",fontSize:12,lineHeight:1.6}}/>
    </>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (screen==="loading") return (
    <div style={{fontFamily:"Georgia,serif",background:C.paper,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:C.gold,letterSpacing:5,textTransform:"uppercase",marginBottom:8}}>Dottie Deeds</div>
        <div style={{marginBottom:14}}><Spinner size={30}/></div><div style={{fontSize:12,color:C.muted}}>Loading...</div>
      </div>
    </div>
  );

  // ── Auth Screen (Login / Signup / Forgot) ──────────────────────────────────
  if (screen==="billing") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="Billing" onHome={()=>setScreen("home")} rightContent={<button onClick={()=>setScreen("home")} style={{...ST.btnS,padding:"8px 16px",fontSize:10}}>← Back</button>}/>
      <div style={{maxWidth:640,margin:"0 auto",padding:isMobile?"20px 14px 48px":"36px 20px 60px",flex:1,width:"100%"}}>
        {checkoutMsg&&<div style={{background:"#f9f6f0",border:`1px solid ${C.rule}`,borderLeft:`3px solid ${C.gold}`,padding:"12px 16px",fontSize:13,marginBottom:22,borderRadius:2}}>{checkoutMsg}</div>}

        {authProfile?.plan ? (<>
          <div style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:8,padding:"24px 26px",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <div style={{fontSize:24}}>{PLAN_META[authProfile.plan].label} <span style={{fontSize:15,color:C.muted}}>{PLAN_META[authProfile.plan].price}</span></div>
              <span style={{fontSize:10,fontFamily:"monospace",letterSpacing:1,textTransform:"uppercase",color:hasActiveSub()?C.green:C.amber,border:`1px solid ${hasActiveSub()?C.green:C.amber}`,borderRadius:20,padding:"3px 10px"}}>{hasActiveSub()?"Active":(authProfile.subscription_status||"—")}</span>
            </div>
            {periodDeeds!=null&&(()=>{ const inc=PLAN_META[authProfile.plan].included; const over=periodDeeds>inc; const pct=over?100:Math.round(periodDeeds/inc*100); return (
              <div style={{marginTop:22}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:7}}>
                  <span style={{color:C.muted}}>Deeds this month</span>
                  <span style={{color:over?C.amber:C.ink}}><b>{periodDeeds}</b> of {inc} included</span>
                </div>
                <div style={{height:8,background:"#ececec",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:over?C.amber:C.gold,transition:"width .3s"}}/></div>
                <div style={{fontSize:11.5,color:C.muted,marginTop:7}}>{over?`${periodDeeds-inc} beyond included · billed at ${PLAN_META[authProfile.plan].over}/deed`:`${PLAN_META[authProfile.plan].over} per deed after ${inc}`}</div>
              </div>
            );})()}
            <div style={{marginTop:22,paddingTop:16,borderTop:`1px solid ${C.rule}`}}>
              <span onClick={()=>!billingBusy&&openPortal()} style={{fontSize:12.5,color:C.gold,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}}>Manage payment & invoices</span>
            </div>
          </div>

          {(()=>{ const other=authProfile.plan==="solo"?"firm":"solo"; const up=other==="firm"; const m=PLAN_META[other]; return (
            <div style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:8,padding:"22px 26px"}}>
              <div style={{fontSize:10,fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:12}}>{up?"Upgrade available":"Change plan"}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:20}}>{m.label} <span style={{fontSize:14,color:C.muted}}>{m.price}</span></div>
                  <div style={{fontSize:12.5,color:C.gold,fontWeight:"bold",marginTop:4}}>{m.included} deeds included, then {m.over} each</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{m.users}</div>
                </div>
                <button disabled={billingBusy} onClick={()=>setPendingPlan(other)} style={{...(up?ST.btnP:ST.btnS),whiteSpace:"nowrap"}}>{up?"Upgrade to Firm":"Switch to Solo"}</button>
              </div>
            </div>
          );})()}
        </>) : (
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16}}>
            {["solo","firm"].map(pl=>(
              <div key={pl} style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:8,padding:"24px 24px"}}>
                <div style={{fontSize:19}}>{PLAN_META[pl].label}</div>
                <div style={{fontSize:26,margin:"6px 0"}}>{PLAN_META[pl].price}</div>
                <div style={{fontSize:12.5,color:C.gold,fontWeight:"bold",marginBottom:4}}>{PLAN_META[pl].included} deeds included, then {PLAN_META[pl].over} each</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:18}}>{PLAN_META[pl].users}</div>
                <button disabled={billingBusy} onClick={()=>startCheckout(pl,false)} style={{...ST.btnP,width:"100%"}}>{billingBusy?"…":`Choose ${PLAN_META[pl].label}`}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingPlan&&(()=>{ const m=PLAN_META[pendingPlan]; const up=pendingPlan==="firm"; return (
        <div style={{position:"fixed",inset:0,background:"rgba(20,18,14,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:1000}} onClick={()=>!billingBusy&&setPendingPlan(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.paper,border:`1px solid ${C.rule}`,borderRadius:10,maxWidth:440,width:"100%",padding:"28px 30px",boxShadow:"0 20px 60px rgba(0,0,0,.35)"}}>
            <div style={{fontSize:10,fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>{up?"Confirm upgrade":"Confirm change"}</div>
            <div style={{fontSize:24}}>{m.label} <span style={{fontSize:15,color:C.muted}}>{m.price}</span></div>
            <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:13.5}}>✓ {m.included} recorded deeds included each month</div>
              <div style={{fontSize:13.5}}>✓ {m.over} per deed after that</div>
              <div style={{fontSize:13.5}}>✓ {m.users}</div>
              {PLAN_FEATURES.map((f,i)=><div key={i} style={{fontSize:13.5}}>✓ {f}</div>)}
            </div>
            <div style={{fontSize:12,color:C.ink,marginTop:18,lineHeight:1.55,background:"#f9f6f0",border:`1px solid ${C.rule}`,borderRadius:6,padding:"11px 13px"}}>{up?`Your card on file is charged the prorated difference for the rest of this billing period now, then ${m.price} going forward.`:`You'll receive a prorated credit for unused time on your current plan, applied to your next invoice. Billed ${m.price} going forward.`}</div>
            <div style={{display:"flex",gap:10,marginTop:22}}>
              <button disabled={billingBusy} onClick={()=>setPendingPlan(null)} style={{...ST.btnS,flex:1}}>Cancel</button>
              <button disabled={billingBusy} onClick={async()=>{await changePlan(pendingPlan);setPendingPlan(null);}} style={{...ST.btnP,flex:1}}>{billingBusy?"…":(up?"Confirm upgrade":"Confirm switch")}</button>
            </div>
          </div>
        </div>
      );})()}
    </div>
  );

  if (screen==="auth") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",borderBottom:`1px solid ${C.rule}`}}>
        <div style={{height:58,padding:isMobile?"0 14px":"0 28px",display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",borderRight:`1px solid ${C.rule}`,paddingRight:18,marginRight:18}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.gold,letterSpacing:5,textTransform:"uppercase",lineHeight:1.5}}>Dottie</div>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.ink,letterSpacing:5,textTransform:"uppercase",lineHeight:1.5}}>Deeds</div>
          </div>
          {!isMobile&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}>California deed drafting. Done right.</div>}
          <a href="/" style={{marginLeft:"auto",fontSize:12,color:C.gold,textDecoration:"none",fontFamily:"monospace",letterSpacing:1}}>← Back to home</a>
        </div>
        <div style={{height:2,background:`linear-gradient(90deg,${C.gold},${C.goldlt},${C.gold})`}}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
        <div style={{maxWidth:440,width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <img src="/dottie.svg" alt="Dottie" width="92" height="92" style={{display:"block",margin:"0 auto 16px"}}/>
            <div style={{fontSize:11,letterSpacing:4,textTransform:"uppercase",color:C.gold,fontFamily:"monospace",marginBottom:10}}>
              {authMode==="login"?"Welcome Back":authMode==="signup"?"Create your account":"Reset Password"}
            </div>
            <h2 style={{fontSize:26,fontWeight:300,marginBottom:8,lineHeight:1.3}}>
              {authMode==="login"?"Sign in to Dottie Deeds":authMode==="signup"?"Get started with Dottie Deeds":"Forgot your password?"}
            </h2>
          </div>
          <div style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:4,padding:"28px 32px",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            {authMode==="signup"&&<>
              <div style={{marginBottom:16}}>
                <label style={ST.lbl}>Your name <span style={{color:C.gold}}>*</span></label>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                  <input value={authFirstName} onChange={e=>setAuthFirstName(e.target.value)} placeholder="First name" autoComplete="given-name" style={ST.inp}/>
                  <input value={authLastName} onChange={e=>setAuthLastName(e.target.value)} placeholder="Last name" autoComplete="family-name" style={ST.inp}/>
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={ST.lbl}>Firm name <span style={{color:C.gold}}>*</span></label>
                <input value={authFirm} onChange={e=>setAuthFirm(e.target.value)} placeholder="e.g. Smith & Jones, APC" style={ST.inp}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={ST.lbl}>Role</label>
                <select value={authRole} onChange={e=>setAuthRole(e.target.value)} style={ST.inp}>
                  <option value="">— Select role —</option><option>Attorney</option><option>Paralegal</option><option>Legal Assistant</option><option>Office Manager</option><option>Other</option>
                </select>
                {authRole==="Other"&&<input value={authRoleOther} onChange={e=>setAuthRoleOther(e.target.value)} placeholder="Tell us your role" style={{...ST.inp,marginTop:8}}/>}
              </div>
            </>}
            <div style={{marginBottom:16}}>
              <label style={ST.lbl}>Email address <span style={{color:C.gold}}>*</span></label>
              <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="e.g. jane@smithjones.com" type="email" autoComplete={authMode==="signup"?"off":"username"} style={ST.inp}/>
            </div>
            {authMode!=="forgot"&&<div style={{marginBottom:20}}>
              <label style={ST.lbl}>Password <span style={{color:C.gold}}>*</span></label>
              <input value={authPassword} onChange={e=>setAuthPassword(e.target.value)} autoComplete={authMode==="signup"?"new-password":"current-password"} placeholder={authMode==="signup"?"At least 8 characters":""} type="password" style={ST.inp}/>
            </div>}
            {authNotice&&<div style={{background:"#eaf5ea",border:"1px solid #bcd9bc",color:"#2e6b2e",padding:"12px 14px",borderRadius:4,marginBottom:16,fontSize:13,lineHeight:1.6}}>{authNotice}</div>}
            {authError&&<div style={{...ST.err,marginBottom:16}}>{authError}</div>}
            <button
              disabled={authLoading||!authEmail||(authMode!=="forgot"&&!authPassword)||(authMode==="signup"&&(!authFirstName.trim()||!authLastName.trim()||!authFirm))}
              onClick={async()=>{
                setAuthLoading(true); setAuthError("");
                try {
                  if (authMode==="login") {
                    const {data,error} = await supa.auth.signInWithPassword({email:authEmail,password:authPassword});
                    if (error) throw error;
                    const {data:profile, error:profileErr} = await supa.from("profiles").select("*").eq("id",data.user.id).single();
                    console.log("PROFILE:", JSON.stringify(profile), "ERR:", profileErr?.message);
                    setAuthUser(data.user); setAuthProfile(profile);
                    if (profile?.is_approved) registerSession(data.user.id);
                    const approved = profile && profile.is_approved === true;
                    console.log("IS_APPROVED:", profile?.is_approved, "approved:", approved);
                    if (!approved) { setScreen("pending"); }
                    else if (profile.firm_id) {
                      try {
                        const { data: firm } = await supa.from("firms").select("*").eq("id", profile.firm_id).single();
                        if (firm) {
                          setFirmId(firm.id); setFirmInviteCode(firm.invite_code||""); setFirmIsAdmin(firm.created_by === data.user.id);
                          const nm = {...DEFAULT_MASTER, ...(firm.master||{})};
                          setMaster(nm);
                          try { localStorage.setItem("dd_master", JSON.stringify(nm)); } catch(e) {}
                          setScreen("home");
                        } else {
                          try { localStorage.removeItem("dd_master"); } catch(e) {}
                          setFirmId(null); setFirmInviteCode(""); setFirmIsAdmin(false); setMaster({...DEFAULT_MASTER});
                          setScreen("onboard");
                        }
                      } catch(e) { setScreen("onboard"); }
                    } else {
                      try { localStorage.removeItem("dd_master"); } catch(e) {}
                      setFirmId(null); setFirmInviteCode(""); setFirmIsAdmin(false); setMaster({...DEFAULT_MASTER});
                      setScreen("onboard");
                    }
                  } else if (authMode==="signup") {
                    const {data,error} = await supa.auth.signUp({
                      email:authEmail, password:authPassword,
                      options:{data:{name:authName,firm:authFirm,role:(authRole==="Other"&&authRoleOther.trim())?authRoleOther.trim():authRole,invite:invite||undefined}}
                    });
                    if (error) throw error;
                    // Alert the admin (and confirm to the user). Not gated on a session:
                    // with email confirmation on, signUp returns no session, which is why
                    // the old session-gated call never fired.
                    let _notified = false;
                    try {
                      const _r = await fetch(STRIPE_WORKER+"/notify-admin-signup",{
                        method:"POST", headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({
                          email:authEmail, name:authName, firm:authFirm,
                          role:(authRole==="Other"&&authRoleOther.trim())?authRoleOther.trim():authRole
                        })
                      });
                      const _j = await _r.json().catch(()=>({}));
                      _notified = !!(_j && _j.ok);
                    } catch(e) { _notified = false; }
                    // Secondary path. Kept as a backup, no longer the only alert.
                    // Notify admin of new signup via Formspree
                    try {
                      await fetch("https://formspree.io/f/maqzeewn", {
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({
                          _subject: "New Dottie Deeds Beta Signup: " + authName,
                          name: authName,
                          firm: authFirm,
                          email: authEmail,
                          role: (authRole==="Other"&&authRoleOther.trim())?authRoleOther.trim():authRole,
                          message: "New beta user signed up. Log in to approve: https://dottiedeeds.com/app.html",
                          source: "Dottie Deeds Beta Signup"
                        })
                      });
                    } catch(e) {}
                    try { await supa.auth.signOut(); } catch(e) {}
                    setAuthMode("login"); setAuthEmail(""); setAuthPassword(""); setAuthFirstName(""); setAuthLastName(""); setAuthFirm("");
                    setAuthError(""); setAuthNotice("Request received. We'll email you when your access is approved. You can sign in once you're approved.");
                    setScreen("auth");
                  } else {
                    const {error} = await supa.auth.resetPasswordForEmail(authEmail,{redirectTo:"https://dottiedeeds.com/app.html"});
                    if (error) throw error;
                    setAuthError(""); alert("Password reset email sent. Check your inbox.");
                    setAuthMode("login");
                  }
                } catch(e) { setAuthError(e.message||"An error occurred."); }
                setAuthLoading(false);
              }}
              style={{...ST.btnP,width:"100%",padding:"13px",fontSize:11,opacity:(authLoading||!authEmail||(authMode!=="forgot"&&!authPassword))?0.5:1}}
            >{authLoading?"Please wait...":{login:"Sign In →",signup:"Request Access →",forgot:"Send Reset Email →"}[authMode]}</button>
            <div style={{textAlign:"center",marginTop:16,fontSize:12,color:C.muted,lineHeight:2}}>
              {authMode==="login"&&<><span style={{cursor:"pointer",color:C.gold}} onClick={()=>{setAuthMode("signup");setAuthError("");}}>Create an account</span> · <span style={{cursor:"pointer",color:C.gold}} onClick={()=>{setAuthMode("forgot");setAuthError("");}}>Forgot password?</span></>}
              {authMode==="signup"&&<span style={{cursor:"pointer",color:C.gold}} onClick={()=>{setAuthMode("login");setAuthError("");}}>Already have an account? Sign in</span>}
              {authMode==="forgot"&&<span style={{cursor:"pointer",color:C.gold}} onClick={()=>{setAuthMode("login");setAuthError("");}}>Back to sign in</span>}
              <div style={{marginTop:14,fontSize:11,color:C.muted}}>By using Dottie you agree to our <a href="/terms.html" style={{color:C.gold}}>Terms</a> and <a href="/privacy.html" style={{color:C.gold}}>Privacy Policy</a>.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Pending Approval ───────────────────────────────────────────────────────
  if (screen==="pending") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",borderBottom:`1px solid ${C.rule}`}}>
        <div style={{height:58,padding:isMobile?"0 14px":"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",flexDirection:"column",borderRight:`1px solid ${C.rule}`,paddingRight:18,marginRight:18}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.gold,letterSpacing:5,textTransform:"uppercase",lineHeight:1.5}}>Dottie</div>
            <div style={{fontFamily:"monospace",fontSize:9,color:C.ink,letterSpacing:5,textTransform:"uppercase",lineHeight:1.5}}>Deeds</div>
          </div>
          <div style={{display:"flex",gap:8}}><button onClick={async()=>{try{await supa.auth.signOut();}catch(e){} setAuthNotice(""); setScreen("auth");}} style={{...ST.btnS,padding:"6px 14px",fontSize:10}}>Sign out</button><button onClick={()=>{window.location.href="/";}} style={{...ST.btnS,padding:"6px 14px",fontSize:10}}>Home</button></div>
        </div>
        <div style={{height:2,background:`linear-gradient(90deg,${C.gold},${C.goldlt},${C.gold})`}}/>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
        <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
          <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><Icon t="clock" size={46} color={C.amber} sw={1.6}/></div>
          <h2 style={{fontSize:26,fontWeight:300,marginBottom:12}}>Access Pending</h2>
          <p style={{fontSize:14,color:C.muted,lineHeight:1.8,marginBottom:24}}>
            Your request is in. We'll email you at <strong>{authUser?.email}</strong> once your access is approved, with a link to sign in. Nothing else to do for now.
          </p>
          <p style={{fontSize:13,color:C.muted,lineHeight:1.8}}>
            Questions? Contact <a href="mailto:william@cunninghamlegal.com" style={{color:C.gold}}>william@cunninghamlegal.com</a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  if (screen==="admin") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="Admin Dashboard" onHome={()=>setScreen("home")} rightContent={
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setScreen("home")} style={{...ST.btnS,padding:"7px 14px",fontSize:10}}>← App</button>
          <button onClick={async()=>{await supa.auth.signOut();setScreen("auth");}} style={{...ST.btnS,padding:"7px 14px",fontSize:10}}>Sign out</button>
        </div>
      }/>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px",flex:1}}>
        {adminMsg&&<div style={{background:adminMsg.ok?"#eaf5ea":"#f7e8e8",border:`1px solid ${adminMsg.ok?"#bcd9bc":"#e0b4b4"}`,color:adminMsg.ok?"#2e6b2e":"#8a2020",padding:"10px 14px",borderRadius:4,marginBottom:16,fontSize:13,lineHeight:1.6,display:"flex",justifyContent:"space-between",gap:12}}><span>{adminMsg.text}</span><span onClick={()=>setAdminMsg(null)} style={{cursor:"pointer",opacity:0.6}}>✕</span></div>}
        <div style={ST.sec}>Users</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:`2px solid ${C.rule}`}}>
              {["Name","Firm","Email","Role","Approved","Admin","Last Seen","Deeds","Actions"].map(h=>(
                <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {adminUsers.map(u=>(
                <tr key={u.id} style={{borderBottom:`1px solid ${C.cream}`}}>
                  <td style={{padding:"10px"}}>{u.name||"—"}</td>
                  <td style={{padding:"10px"}}>{u.firm||"—"}</td>
                  <td style={{padding:"10px",color:C.muted}}>{u.email}</td>
                  <td style={{padding:"10px"}}>{u.role||"—"}</td>
                  <td style={{padding:"10px",textAlign:"center"}}>
                    <span style={{color:u.is_approved?C.green:C.red,fontWeight:"bold"}}>{u.is_approved?(u.comp_until?(new Date(u.comp_until)>new Date()?("✓ free "+Math.ceil((new Date(u.comp_until)-Date.now())/86400000)+"d"):"✓ expired"):"✓"):"✗"}</span>
                  </td>
                  <td style={{padding:"10px",textAlign:"center"}}>
                    <span style={{color:u.is_admin?C.gold:C.muted}}>{u.is_admin?"★":"—"}</span>
                  </td>
                  <td style={{padding:"10px",color:C.muted,fontSize:11}}>{u.last_seen?new Date(u.last_seen).toLocaleDateString():"Never"}</td>
                  <td style={{padding:"10px",textAlign:"center"}}>{adminDeeds.filter(d=>d.user_id===u.id).length}</td>
                  <td style={{padding:"10px"}}>
                    <div style={{display:"flex",gap:6}}>
                      {!u.is_approved&&<button onClick={()=>approveUser(u,false)} style={{...ST.btnS,padding:"4px 10px",fontSize:10}}>Approve</button>}
                      {!u.is_approved&&<button onClick={async()=>{
                        const _patch = {is_approved:true};
                        if (!u.comp_until) _patch.comp_until = new Date(Date.now()+60*86400000).toISOString();
                        const {error:upErr}=await supa.from("profiles").update(_patch).eq("id",u.id);
                        if(upErr){ setAdminMsg({ok:false,text:"Could not approve "+(u.name||u.email)+": "+(upErr.message||upErr)}); return; }
                        setAdminUsers(prev=>prev.map(p=>p.id===u.id?{...p,..._patch}:p));
                        try{ const _r=await fetch(STRIPE_WORKER+"/notify-approved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_dd_auth:ddToken,email:u.email,name:u.name,free_days:60})}); const _j=await _r.json().catch(()=>({})); if(_j&&_j.ok){ setAdminMsg({ok:true,text:"Approved "+(u.name||u.email)+". Approval email sent to "+u.email+"."}); } else { setAdminMsg({ok:false,text:"Approved "+(u.name||u.email)+", but the email did not send: "+((_j&&(_j.error||_j.reason))||("HTTP "+_r.status))+". Reach them another way."}); } }catch(e){ setAdminMsg({ok:false,text:"Approved "+(u.name||u.email)+", but the email request failed: "+(e.message||e)+". Reach them another way."}); }
                      }} style={{...ST.btnP,padding:"4px 10px",fontSize:10,background:C.green}}>Approve + 60d free</button>}
                      {u.is_approved&&<button onClick={async()=>{
                        const {error:rvErr}=await supa.from("profiles").update({is_approved:false}).eq("id",u.id);
                        if(rvErr){ setAdminMsg({ok:false,text:"Could not revoke "+(u.name||u.email)+": "+(rvErr.message||rvErr)}); return; }
                        setAdminUsers(prev=>prev.map(p=>p.id===u.id?{...p,is_approved:false}:p));
                        setAdminMsg({ok:true,text:"Revoked access for "+(u.name||u.email)+"."});
                      }} style={{...ST.btnP,padding:"4px 10px",fontSize:10,background:C.red}}>Revoke</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {adminUsers.length===0&&<div style={{padding:"20px",color:C.muted,textAlign:"center"}}>No users yet.</div>}
        </div>
        <div style={{...ST.sec,marginTop:32}}>Recent Deeds</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:`2px solid ${C.rule}`}}>
              {["User","Document Type","County","Completed","Date"].map(h=>(
                <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:10,letterSpacing:1,textTransform:"uppercase",color:C.muted}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {adminDeeds.slice(0,50).map(d=>{
                const u = adminUsers.find(u=>u.id===d.user_id);
                return <tr key={d.id} style={{borderBottom:`1px solid ${C.cream}`}}>
                  <td style={{padding:"10px",fontSize:11,color:C.muted}}>{u?.email||"—"}</td>
                  <td style={{padding:"10px"}}>{d.doc_type}</td>
                  <td style={{padding:"10px"}}>{d.county}</td>
                  <td style={{padding:"10px",textAlign:"center"}}><span style={{color:d.completed?C.green:C.amber}}>{d.completed?"✓":"…"}</span></td>
                  <td style={{padding:"10px",color:C.muted,fontSize:11}}>{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>;
              })}
            </tbody>
          </table>
          {adminDeeds.length===0&&<div style={{padding:"20px",color:C.muted,textAlign:"center"}}>No deeds yet.</div>}
        </div>
      </div>
    </div>
  );

  // ── Onboarding ─────────────────────────────────────────────────────────────
  if (screen==="onboard") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="Getting started" onHome={()=>setScreen("home")} rightContent={
        <div style={{display:"flex"}}>{["Welcome","Firm Details","Your Trustee","Ready"].map((s,i)=>(<div key={i} style={{padding:"0 12px",display:"flex",alignItems:"center",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:i===oStep?C.gold:i<oStep?"#6a5a3a":"#aaa",borderBottom:i===oStep?`2px solid ${C.gold}`:"2px solid transparent",fontFamily:"'DM Mono',monospace",height:56}}>{i<oStep?"✓ ":""}{s}</div>))}</div>
      }/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
        <div style={{maxWidth:500,width:"100%"}}>
          {oErr&&<div style={{background:"#f7e8e8",border:"1px solid #e0b4b4",color:"#8a2020",padding:"10px 14px",borderRadius:4,marginBottom:16,fontSize:12,lineHeight:1.5}}>{oErr}</div>}{oStep===0&&(<div style={{textAlign:"center"}}><div style={{fontSize:52,marginBottom:16}}>✍️</div><h2 style={{fontFamily:"Georgia,serif",fontSize:30,fontWeight:300,marginBottom:14,lineHeight:1.2}}>Welcome to Dottie Deeds</h2><p style={{fontSize:14,color:C.muted,lineHeight:1.85,marginBottom:28}}>{invited?"You've been invited to a firm. Enter the code below to join and share their settings and saved matters.":"Are you setting up your firm on Dottie, or joining a firm that already uses it?"}</p><div style={{display:"grid",gap:14,textAlign:"left",maxWidth:440,margin:"0 auto"}}>{!invited&&<div style={{...ST.card,padding:"18px 20px"}}><div style={{fontSize:15,color:C.ink,marginBottom:4,fontWeight:600}}>Set up my firm</div><div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>Create your firm on Dottie. You become the firm admin and can invite your team with an invite code.</div><button onClick={()=>setOStep(1)} style={{...ST.btnP,padding:"11px 28px",fontSize:12}}>Set up my firm →</button></div>}<div style={{...ST.card,padding:"18px 20px"}}><div style={{fontSize:15,color:C.ink,marginBottom:4,fontWeight:600}}>Join my firm</div><div style={{fontSize:12,color:C.muted,lineHeight:1.7,marginBottom:12}}>Your firm already uses Dottie. Enter the invite code from your firm admin to share their settings and saved matters.</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input value={oJoinCode} onChange={e=>setOJoinCode(e.target.value.toUpperCase())} placeholder="Invite code" style={{...ST.inp,maxWidth:170,marginBottom:0}}/><button onClick={joinFirm} disabled={!oJoinCode.trim()} style={{...ST.btnS,opacity:oJoinCode.trim()?1:0.5}}>Join firm</button></div></div></div>{!invited&&<div style={{marginTop:16}}><button onClick={skipOnboard} style={{...ST.btnG,textDecoration:"underline",fontSize:12}}>Skip for now</button></div>}</div>)}{oStep===1&&(<div><h2 style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:300,marginBottom:20}}>Your firm details</h2><Field label="Firm name" required><input value={oForm.firmName} onChange={e=>oUpd("firmName",e.target.value)} placeholder="e.g. Smith & Jones, APC" style={ST.inp}/></Field><Field label="Street address"><input value={oForm.firmAddress} onChange={e=>oUpd("firmAddress",e.target.value)} placeholder="e.g. 123 Main Street, Suite 100" style={ST.inp}/></Field><div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr 1fr",gap:12}}><Field label="City"><input value={oForm.firmCity} onChange={e=>oUpd("firmCity",e.target.value)} style={ST.inp}/></Field><Field label="State"><input value={oForm.firmState} onChange={e=>oUpd("firmState",e.target.value)} style={ST.inp}/></Field><Field label="Zip"><input value={oForm.firmZip} onChange={e=>oUpd("firmZip",e.target.value)} style={ST.inp}/></Field></div><div style={{display:"flex",gap:12}}><button onClick={()=>setOStep(0)} style={ST.btnS}>← Back</button><button onClick={()=>setOStep(2)} disabled={!oForm.firmName} style={{...ST.btnP,opacity:oForm.firmName?1:0.5}}>Continue →</button></div></div>)}
          {oStep===2&&(<div><h2 style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:300,marginBottom:8}}>Default trustee for Deeds of Trust</h2><p style={{fontSize:14,color:C.muted,marginBottom:20,lineHeight:1.8}}>Optional. If your firm uses a standard trustee, enter it and it will pre-fill on every Deed of Trust. Leave it blank to fill in per deal.</p><Field label="Default trustee"><input value={oForm.defaultTrustee} onChange={e=>oUpd("defaultTrustee",e.target.value)} placeholder="Leave blank to enter per deal" style={ST.inp}/></Field><div style={{display:"flex",gap:12}}><button onClick={()=>setOStep(1)} style={ST.btnS}>← Back</button><button onClick={()=>setOStep(3)} style={ST.btnP}>Continue →</button></div></div>)}
          {oStep===3&&(<div style={{textAlign:"center"}}><div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><Icon t="check" size={54} color={C.green} sw={1.6}/></div><h2 style={{fontFamily:"Georgia,serif",fontSize:30,fontWeight:300,marginBottom:16}}>Dottie is ready.</h2><div style={{...ST.card,textAlign:"left",marginBottom:28}}>{[["Firm",oForm.firmName],["Address",`${oForm.firmAddress}${oForm.firmCity?`, ${oForm.firmCity}, ${oForm.firmState} ${oForm.firmZip}`:""}`],["Trustee",oForm.defaultTrustee]].map(([l,v])=>(<div key={l} style={{display:"flex",gap:16,padding:"7px 0",borderBottom:`1px solid ${C.cream}`,fontSize:13}}><span style={{color:C.muted,minWidth:70,fontSize:10,letterSpacing:1,textTransform:"uppercase",paddingTop:2}}>{l}</span><span>{v||"—"}</span></div>))}</div><button onClick={finish} style={{...ST.btnP,padding:"14px 44px",fontSize:13}}>Start Drafting →</button></div>)}
        </div>
      </div>
    </div>
  );

  // ── Paralegal Guide ────────────────────────────────────────────────────────
  if (screen==="guide") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="Paralegal Execution Guide" onHome={()=>setScreen("home")} rightContent={<button onClick={()=>setScreen("home")} style={{...ST.btnS,padding:"8px 16px",fontSize:10}}>← Back</button>}/>
      <div style={{maxWidth:740,margin:"0 auto",padding:"28px 20px 48px",flex:1}}>
        <div style={{...ST.card,marginBottom:20}}><div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16}}><div><label style={ST.lbl}>Document type</label><select value={gDoc} onChange={e=>setGDoc(e.target.value)} style={ST.inp}>{DOC_TYPES.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></div><div><label style={ST.lbl}>County</label><select value={gCounty} onChange={e=>setGCounty(e.target.value)} style={ST.inp}><option value="">— Select county —</option>{COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div></div></div>
        <div style={ST.sec}>Steps to execute and record</div>
        {gcl.steps.map((s,i)=>(<div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}><span style={{fontSize:18,color:"#c8bfa8",flexShrink:0,lineHeight:1.3}}>☐</span><span style={{fontSize:13,lineHeight:1.75}}>{s}</span></div>))}
        <div style={ST.sec}>Recording fees — {gCounty} County</div>
        <div style={ST.card}>{[["Base recording fee (first page)","$15.00"],["SB2 — Building Homes & Jobs Act","$75.00"],["Real estate fraud fee","$7.00"],["AB 1466 — Restrictive Covenant Modification","$2.00"],["Each additional page","+$3.00"]].map(([l,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.cream}`,fontSize:13}}><span>{l}</span><span style={{fontWeight:"bold"}}>{v}</span></div>))}{gci.note&&<div style={{marginTop:10,fontSize:12,color:"#8a5010",background:"#fdf5e0",padding:"8px 10px",borderLeft:`2px solid ${C.gold}`}}>⚠ {gci.note}</div>}</div>
        <div style={ST.sec}>Recorder info — {gCounty} County</div>
        <div style={ST.card}><div style={{fontSize:13,marginBottom:8}}>Phone: <strong>{gci.phone}</strong></div>{gci.eRecord&&<div style={{fontSize:13,marginBottom:8}}>e-Recording: <strong>{gci.vendors.join(", ")}</strong></div>}{gci.url&&<div style={{fontSize:13,marginBottom:8}}><a href={gci.url} target="_blank" rel="noreferrer" style={{color:C.gold}}>Open recorder website ↗</a></div>}</div>
        <div style={ST.sec}>Common rejection reasons</div>
        {gcl.rejections.map((r,i)=>(<div key={i} style={{...ST.err,display:"flex",gap:10}}><span style={{color:C.red,flexShrink:0}}>✕</span><span>{r}</span></div>))}
        <div style={{marginTop:20,...ST.warn}}><strong>Attorney supervision required.</strong> Dottie does not confirm title. Verify fees with county recorder before submitting.</div>
      </div>
    </div>
  );

  // ── Firm Settings ──────────────────────────────────────────────────────────
  if (screen==="master") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="Firm Settings" onHome={leaveMaster} rightContent={<button onClick={leaveMaster} style={{...ST.btnS,padding:"8px 16px",fontSize:10}}>← Back</button>}/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 48px",flex:1}}>
        <div style={ST.sec}>Firm Information</div>{firmIsAdmin&&firmInviteCode&&<div style={{...ST.card,padding:"10px 14px",marginBottom:14}}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Invite teammates to this firm with this code. They enter it when they sign up, and share your firm settings and saved matters.</div><div style={{fontSize:18,letterSpacing:3,fontFamily:"monospace",color:C.ink,marginBottom:10}}>{firmInviteCode}</div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Or send this invite link. Anyone who signs up through it joins your firm automatically, with no code to type.</div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><input readOnly value={inviteLink()} onFocus={e=>e.target.select()} style={{...ST.inp,marginBottom:0,fontSize:11,flex:1,minWidth:180}}/><button onClick={()=>{ try{ navigator.clipboard.writeText(inviteLink()); setInviteCopied(true); setTimeout(()=>setInviteCopied(false),1800); }catch(e){} }} style={{...ST.btnS,padding:"6px 12px",fontSize:10,whiteSpace:"nowrap"}}>{inviteCopied?"Copied":"Copy link"}</button></div></div>}{!firmIsAdmin&&<div style={{fontSize:11,color:C.muted,marginBottom:14}}>Your firm's invite code is managed by your firm admin.</div>}
        <Field label="Firm name"><input value={master.firmName} onChange={e=>setMaster(p=>({...p,firmName:e.target.value}))} placeholder="e.g. Smith & Jones, APC" style={ST.inp}/></Field>
        <Field label="Street address"><input value={master.firmAddress} onChange={e=>setMaster(p=>({...p,firmAddress:e.target.value}))} placeholder="e.g. 123 Main Street, Suite 100" style={ST.inp}/></Field>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr 1fr",gap:12}}><Field label="City"><input value={master.firmCity} onChange={e=>setMaster(p=>({...p,firmCity:e.target.value}))} style={ST.inp}/></Field><Field label="State"><input value={master.firmState} onChange={e=>setMaster(p=>({...p,firmState:e.target.value}))} style={ST.inp}/></Field><Field label="Zip"><input value={master.firmZip} onChange={e=>setMaster(p=>({...p,firmZip:e.target.value}))} style={ST.inp}/></Field></div>
        <div style={ST.sec}>Deed of Trust Defaults</div>
        <Field label="Default trustee"><input value={master.defaultTrustee} onChange={e=>setMaster(p=>({...p,defaultTrustee:e.target.value}))} style={ST.inp}/></Field>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Late charge grace period (days)"><input value={master.lateChargeDays} onChange={e=>setMaster(p=>({...p,lateChargeDays:e.target.value}))} style={ST.inp}/></Field><Field label="Late charge (%)"><input value={master.lateChargePercent} onChange={e=>setMaster(p=>({...p,lateChargePercent:e.target.value}))} style={ST.inp}/></Field></div>
        <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:C.muted,marginBottom:20}}><input type="checkbox" checked={master.defaultDueOnSale} onChange={e=>setMaster(p=>({...p,defaultDueOnSale:e.target.checked}))} style={{width:15,height:15}}/>Include due-on-sale clause by default</label>
        <Field label="Standard DOT covenants" hint="Leave blank to use California standard covenants"><textarea value={master.standardCovenants} onChange={e=>setMaster(p=>({...p,standardCovenants:e.target.value}))} rows={4} style={{...ST.inp,resize:"vertical",lineHeight:1.6}}/></Field>
        <div style={ST.sec}>Transfer Defaults</div>
        <Field label="Default DTT exemption language"><input value={master.defaultExemptReason} onChange={e=>setMaster(p=>({...p,defaultExemptReason:e.target.value}))} style={ST.inp}/></Field>
        <Field label="Default prepayment language" hint="Used on Deeds of Trust"><textarea value={master.prepaymentLanguage} onChange={e=>setMaster(p=>({...p,prepaymentLanguage:e.target.value}))} rows={2} style={{...ST.inp,resize:"vertical",lineHeight:1.6}}/></Field>
        <div style={{...ST.sec,marginTop:20}}>Custom Provisions</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.6}}>Firm-authored provisions are inserted into the documents you choose, directly above the signature block. Pick which document each one applies to, or apply it to all.</div>
        {(master.provisions||[]).map((pv,idx)=>(
          <div key={idx} style={{...ST.card,marginBottom:12,padding:"14px 16px"}}>
            <div style={{display:"flex",gap:10,marginBottom:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:10,letterSpacing:0.5,textTransform:"uppercase",color:(pv.source==="dottie")?C.amber:C.green,border:`1px solid ${(pv.source==="dottie")?C.amber:C.green}`,borderRadius:3,padding:"2px 6px",whiteSpace:"nowrap"}}>{pv.source==="dottie"?"Dottie default":"Firm-authored"}</span>
              <input value={pv.title||""} onChange={e=>setMaster(p=>{const a=[...(p.provisions||[])];a[idx]={...a[idx],title:e.target.value};return{...p,provisions:a};})} placeholder="Provision title (optional)" style={{...ST.inp,flex:1,minWidth:160,marginBottom:0}}/>
              <select value={pv.applyTo||"all"} onChange={e=>setMaster(p=>{const a=[...(p.provisions||[])];a[idx]={...a[idx],applyTo:e.target.value};return{...p,provisions:a};})} style={{...ST.inp,width:210,marginBottom:0}}>
                <option value="all">All documents</option>
                {DOC_TYPES.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <button onClick={()=>setMaster(p=>{const a=[...(p.provisions||[])];a.splice(idx,1);return{...p,provisions:a};})} style={{...ST.btnS,padding:"8px 12px",color:"#a44"}}>Delete</button>
            </div>
            <textarea value={pv.body||""} onChange={e=>setMaster(p=>{const a=[...(p.provisions||[])];a[idx]={...a[idx],body:e.target.value};return{...p,provisions:a};})} rows={3} placeholder="Provision text" style={{...ST.inp,resize:"vertical",lineHeight:1.6,marginBottom:0}}/>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.muted,marginTop:8}}><input type="checkbox" checked={pv.enabled!==false} onChange={e=>setMaster(p=>{const a=[...(p.provisions||[])];a[idx]={...a[idx],enabled:e.target.checked};return{...p,provisions:a};})} style={{width:14,height:14}}/>Active</label>
          </div>
        ))}
        <button onClick={()=>setMaster(p=>({...p,provisions:[...(p.provisions||[]),{title:"",body:"",applyTo:"all",enabled:true,source:"firm"}]}))} style={{...ST.btnS,marginBottom:10}}>+ Add provision</button>
        <div style={{fontSize:11,color:C.muted,marginBottom:14,fontStyle:"italic"}}>Provisions and all firm settings on this screen are saved only when you click Save Firm Settings below.</div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,flexWrap:"wrap"}}><div style={{fontSize:11,color:C.muted}}>Firm template version {master.masterVersion||1}{master.masterUpdated?(" · last saved "+master.masterUpdated):""}</div><button onClick={()=>{ if(!showHistory) loadMasterVersions(); setShowHistory(v=>!v); }} style={{...ST.btnS,padding:"5px 10px",fontSize:10}}>{showHistory?"Hide history":"Version history"}</button></div>
        {showHistory&&(<div style={{...ST.card,marginBottom:12,padding:"10px 14px",maxHeight:240,overflowY:"auto"}}>{masterVersions.length===0?<div style={{fontSize:12,color:C.muted}}>No saved versions yet. Saving your firm settings creates a version you can restore later.</div>:masterVersions.map((v,i)=>(<div key={v.id} style={{padding:"8px 0",borderBottom:`1px solid ${C.rule}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><div style={{fontSize:12,color:C.ink}}>Version {v.version_no}<span style={{color:C.muted}}> · {new Date(v.created_at).toLocaleString()} · {((v.snapshot&&v.snapshot.provisions)||[]).length} provision(s)</span></div><button onClick={()=>restoreMasterVersion(v.snapshot)} style={{...ST.btnS,padding:"4px 10px",fontSize:10}}>Restore</button></div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{diffMasters(masterVersions[i+1]&&masterVersions[i+1].snapshot, v.snapshot)}</div>{v.note&&<div style={{fontSize:11,color:C.ink,marginTop:2,fontStyle:"italic"}}>Note: {v.note}</div>}</div>))}</div>)}
        {isMasterDirty()&&<input value={masterNote} onChange={e=>setMasterNote(e.target.value)} placeholder="Describe what you changed (optional)" style={{...ST.inp,marginTop:4,marginBottom:8}}/>}
        <div style={{display:"flex",gap:12,marginTop:8,alignItems:"center"}}><button onClick={saveMaster} style={{...ST.btnP,background:masterSaved?"#5a9a5a":C.gold}}>{masterSaved?"✓ Saved":"Save Firm Settings"}</button><button onClick={()=>setMaster(DEFAULT_MASTER)} style={ST.btnS}>Reset</button>{isMasterDirty()&&!masterSaved&&<span style={{fontSize:11,color:C.amber,alignSelf:"center"}}>● Unsaved changes</span>}</div>
        <div style={{...ST.sec,marginTop:32}}>Data & Privacy</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.6}}>Your firm settings, version history, and any matters you save are stored in your account. Saved matters include the client and property information you enter. Use these controls to permanently remove your data.</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <button onClick={deleteAllMatters} style={{...ST.btnS,color:"#a44"}}>Delete all saved matters</button>
          <button onClick={deleteMyAccount} style={{background:"#8a2020",color:"#fff",border:"none",padding:"10px 16px",fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif",borderRadius:2}}>Delete my account and all data</button>
          {dataMsg&&<span style={{fontSize:12,color:C.muted,alignSelf:"center"}}>{dataMsg}</span>}
        </div>
      </div>
    </div>
  );

  // ── Home ───────────────────────────────────────────────────────────────────
  if (screen==="mydocs") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="My Documents" onHome={()=>setScreen("home")} rightContent={<button onClick={()=>setScreen("home")} style={{...ST.btnS,padding:"8px 16px",fontSize:10}}>← Back</button>}/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 48px",flex:1,width:"100%"}}>
        <div style={ST.sec}>Saved Documents</div>
        {myDocsLoading ? <div style={{color:C.muted,padding:20}}>Loading…</div> :
         myDocs.length===0 ? <div style={{...ST.warn}}>No saved documents yet. When you prepare a document, use <strong>Save to My Documents</strong> on the draft screen to keep it here and reopen it later.</div> :
         myDocs.map(d=>{ const dt=(DOC_TYPES.find(x=>x.id===d.doc_type)||{}); return (
           <div key={d.id} style={{...ST.card,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
             <div><div style={{fontWeight:"bold",color:C.ink,fontSize:14}}>{d.title||"(untitled)"}</div><div style={{fontSize:11,color:C.muted,marginTop:3}}>{(dt.label||d.doc_type)} · saved {new Date(d.created_at).toLocaleDateString()}</div></div>
             <div style={{display:"flex",gap:8}}>
               <button onClick={()=>openDocument(d)} style={{...ST.btnP,padding:"7px 18px",fontSize:11}}>Open</button>
               <button onClick={()=>deleteDocument(d.id)} style={{...ST.btnS,padding:"7px 12px",fontSize:11,color:"#a44"}}>Delete</button>
             </div>
           </div>); })}
      </div>
    </div>
  );

  if (screen==="home") return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle="California deed drafting. Done right." onHome={()=>setScreen("home")} rightContent={<NavMenu isMobile={isMobile} open={navOpen} setOpen={setNavOpen} isAdmin={authProfile?.is_admin} go={{
        mydocs:()=>{loadMyDocuments();setScreen("mydocs");},
        guide:()=>setScreen("guide"),
        billing:()=>{loadPeriodUsage();setScreen("billing");},
        settings:()=>setScreen("master"),
        admin:async()=>{const {data:users}=await supa.from("profiles").select("*").order("created_at",{ascending:false});const {data:deeds}=await supa.from("deeds").select("*").order("created_at",{ascending:false});setAdminUsers(users||[]);setAdminDeeds(deeds||[]);setScreen("admin");},
        signout:async()=>{await supa.auth.signOut();setScreen("auth");},
      }}/>}/>
      {(master.firmName||authProfile?.firm)&&<div style={{background:"#f9f6f0",borderBottom:`1px solid ${C.cream}`,padding:isMobile?"5px 14px":"5px 28px",fontSize:11,color:"#8a7a5a",letterSpacing:1,display:"flex",justifyContent:"space-between"}}><span>{master.firmName||authProfile?.firm}</span>{isComped()&&!hasActiveSub()&&!authProfile?.is_admin&&<span onClick={()=>{loadPeriodUsage();setScreen("billing");}} style={{cursor:"pointer",color:compDaysLeft()<=7?"#8a2020":"#8a7a5a",fontWeight:compDaysLeft()<=7?600:400}}>{compDaysLeft()} {compDaysLeft()===1?"day":"days"} of free access left</span>}<span style={{color:C.muted}}>{authProfile?.name||""}</span></div>}
      <div style={{maxWidth:820,margin:"0 auto",padding:"36px 20px",flex:1}}>
        <h2 style={{fontSize:22,fontWeight:"normal",marginBottom:8}}>What would you like to draft today?</h2>
        <p style={{fontSize:14,color:C.muted,marginBottom:28,lineHeight:1.8}}>Select a document type. Dottie guides you through the rest.</p>
        {!master.firmName&&<div style={{...ST.warn,marginBottom:24}}><Icon t="tip" size={14} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/><strong>First time?</strong> Set up your <span style={{color:C.gold,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setScreen("master")}>Firm Settings</span> to pre-populate your firm name on every document.</div>}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:10,marginBottom:32}}>
          {DOC_TYPES.map(d=>(<div key={d.id} onClick={()=>{setDocType(d.id);setStep((d.id==="courtorder")?1:0);setScreen("draft");}} style={{background:"#fff",border:`2px solid ${C.rule}`,borderRadius:4,padding:"18px 14px",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.background=C.cream;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.rule;e.currentTarget.style.background="#fff";}}><div style={{marginBottom:10}}><Icon t={d.id}/></div><div style={{fontSize:13,fontWeight:"bold",color:C.ink,marginBottom:3}}>{d.label}</div><div style={{fontSize:11,color:C.muted,lineHeight:1.5}}>{d.desc}</div></div>))}
        </div>
        <div style={{borderTop:`1px solid ${C.rule}`,paddingTop:20,fontSize:13,color:C.muted,lineHeight:1.8}}><strong style={{color:C.ink}}>Dottie</strong> drafts all 14 California deed and transfer document types with AI extraction, correct notary blocks, and a paralegal guide for every county. <span style={{color:C.gold,cursor:"pointer"}} onClick={()=>setScreen("guide")}>View paralegal guide →</span></div>
      </div>
    </div>
  );

  // ── Draft screen ───────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"Georgia,serif",color:C.ink,background:C.paper,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <Header subtitle={null} onHome={()=>setScreen("home")} rightContent={
        <div style={{display:"flex",alignItems:"center",gap:isMobile?8:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {(docType==="courtorder"?["Cover Details","Details","Review & Download"]:STEPS.slice(0,4)).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:i<step?"#3a7a3a":i===step?C.gold:"#e0d8c8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:i<=step?"#fff":"#a09070",fontFamily:"'DM Mono',monospace",flexShrink:0}}>
                    {i<step?"✓":i+1}
                  </div>
                  <span style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:i===step?C.gold:i<step?"#6a5a3a":"#bbb",fontFamily:"'DM Mono',monospace",display:isMobile?"none":"inline"}}>{s}</span>
                </div>
                {i<3&&<div style={{width:20,height:1,background:i<step?"#3a7a3a":"#e0d8c8"}}/>}
              </div>
            ))}
          </div>
          {!isMobile&&<div style={{width:1,height:24,background:C.rule}}/>}
          {!isMobile&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic"}}><span style={{display:"inline-flex",alignItems:"center",gap:6,verticalAlign:"middle"}}><Icon t={dt?.id} size={13}/>{dt?.label}</span></div>}
          <button onClick={()=>setScreen("home")} style={{...ST.btnS,padding:"7px 14px",fontSize:10}}>← Documents</button>
        </div>
      }/>

      <div style={{maxWidth:740,margin:"0 auto",padding:"28px 20px 48px",flex:1}}>

        {step===0&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:"normal",marginBottom:8}}>Upload the current recorded deed</h2>
            <p style={{fontSize:14,color:C.muted,marginBottom:28,lineHeight:1.8}}>Dottie reads the prior deed and extracts all information automatically. You verify before anything is used.</p>
            <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>document.getElementById("fileInput").click()} style={{border:`2px dashed ${dragOver?C.gold:"#c8bfa8"}`,borderRadius:4,padding:"52px 40px",textAlign:"center",cursor:"pointer",background:dragOver?C.cream:"transparent",transition:"all .2s"}}>
              <div style={{marginBottom:12,opacity:.4,display:"flex",justifyContent:"center"}}><Icon t="upload" size={30} color={C.muted}/></div>
              <div style={{fontSize:15,color:C.muted,marginBottom:6}}>{docType==="sheriff"?"Drop a copy of the certified court order here, or click to browse":(docType==="recon"||docType==="dotmod")?"Drop the prior deed of trust here, or click to browse":"Drop the prior recorded deed here, or click to browse"}</div>
              <div style={{fontSize:11,color:"#a09070",letterSpacing:1}}>PDF format only</div>
              <input id="fileInput" type="file" accept=".pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
            </div>
            {extracting&&<div style={{textAlign:"center",marginTop:24,color:C.muted,fontSize:12,letterSpacing:3,textTransform:"uppercase"}}>Reading deed...</div>}

            {/* Promissory Note upload - DOT only */}
            {docType==="dot"&&<div style={{marginTop:24}}>
              <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:12}}>Step 2 — Upload Promissory Note</div>
              <div
                onDragOver={e=>{e.preventDefault();}}
                onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handlePNFile(f);}}
                onClick={()=>document.getElementById("pnFileInput").click()}
                style={{border:`2px dashed ${pnExtracted?C.gold:"#c8bfa8"}`,borderRadius:4,padding:"32px 40px",textAlign:"center",cursor:"pointer",background:pnExtracted?"#fffbf0":"transparent",transition:"all .2s"}}>
                <div style={{fontSize:32,marginBottom:12,opacity:.4}}>{pnExtracting?<Spinner size={26}/>:<Icon t="clip" size={30} color={C.muted} style={{margin:"0 auto"}}/>}</div>
                <div style={{fontSize:15,color:C.muted,marginBottom:6}}>
                  {pnExtracting?"Extracting from promissory note...":pnExtracted?"✅ Promissory note extracted — drop another to replace":"Drop the promissory note here, or click to browse"}
                </div>
                <div style={{fontSize:11,color:"#a09070",letterSpacing:1}}>PDF format only</div>
                <input id="pnFileInput" type="file" accept=".pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&handlePNFile(e.target.files[0])}/>
              </div>
              {pnError&&<div style={{color:"#c0392b",fontSize:12,marginTop:8}}>{pnError}</div>}
              {pnExtracted&&<div style={{marginTop:16,background:"#f9f6f0",border:`1px solid ${C.rule}`,borderRadius:4,padding:"12px 16px",fontSize:12}}>
                <div style={{fontWeight:"bold",marginBottom:8,fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.gold}}>Extracted from Promissory Note</div>
                {pnExtracted.borrowerName&&<div style={{marginBottom:4}}><strong>Borrower:</strong> {pnExtracted.borrowerName}</div>}
                {pnExtracted.lenderName&&<div style={{marginBottom:4}}><strong>Lender/Beneficiary:</strong> {pnExtracted.lenderName}</div>}
                {pnExtracted.loanAmount&&<div style={{marginBottom:4}}><strong>Loan Amount:</strong> {pnExtracted.loanAmount}</div>}
                {pnExtracted.interestRate&&<div style={{marginBottom:4}}><strong>Interest Rate:</strong> {pnExtracted.interestRate}</div>}
                {pnExtracted.loanDate&&<div style={{marginBottom:4}}><strong>Note Date:</strong> {pnExtracted.loanDate}</div>}
                {pnExtracted.maturityDate&&<div style={{marginBottom:4}}><strong>Maturity Date:</strong> {pnExtracted.maturityDate}</div>}
                {pnExtracted.monthlyPayment&&<div style={{marginBottom:4}}><strong>Monthly Payment:</strong> {pnExtracted.monthlyPayment}</div>}
                {pnExtracted.signingOfficerName&&<div style={{marginBottom:4}}><strong>Signing Officer:</strong> {pnExtracted.signingOfficerName}{pnExtracted.signingOfficerTitle?", "+pnExtracted.signingOfficerTitle:""}</div>}
              </div>}
            </div>}

            {/* Senior Lien upload - DOT only */}
            {docType==="dot"&&<div style={{marginTop:24}}>
              <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:12}}>Step 3 — Upload Senior Deed of Trust (if refinance or 2nd DOT)</div>
              <div
                onDragOver={e=>{e.preventDefault();}}
                onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleSLFile(f);}}
                onClick={()=>document.getElementById("slFileInput").click()}
                style={{border:`2px dashed ${slExtracted?C.gold:"#c8bfa8"}`,borderRadius:4,padding:"32px 40px",textAlign:"center",cursor:"pointer",background:slExtracted?"#fffbf0":"transparent",transition:"all .2s"}}>
                <div style={{fontSize:32,marginBottom:12,opacity:.4}}>{slExtracting?<Spinner size={26}/>:<Icon t="granttrust" size={30} color={C.muted} style={{margin:"0 auto"}}/>}</div>
                <div style={{fontSize:15,color:C.muted,marginBottom:6}}>
                  {slExtracting?"Extracting senior lien info...":slExtracted?"✅ Senior lien extracted — drop another to replace":"Drop the senior deed of trust here, or click to browse"}
                </div>
                <div style={{fontSize:11,color:"#a09070",letterSpacing:1}}>PDF format only · Optional</div>
                <input id="slFileInput" type="file" accept=".pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleSLFile(e.target.files[0])}/>
              </div>
              {slError&&<div style={{color:"#c0392b",fontSize:12,marginTop:8}}>{slError}</div>}
              {slExtracted&&<div style={{marginTop:16,background:"#f9f6f0",border:`1px solid ${C.rule}`,borderRadius:4,padding:"12px 16px",fontSize:12}}>
                <div style={{fontWeight:"bold",marginBottom:8,fontSize:11,letterSpacing:2,textTransform:"uppercase",color:C.gold}}>Extracted from Senior Lien</div>
                {slExtracted.seniorTrusteeName&&<div style={{marginBottom:4}}><strong>Trustee:</strong> {slExtracted.seniorTrusteeName}</div>}
                {slExtracted.seniorBeneficiaryName&&<div style={{marginBottom:4}}><strong>Beneficiary:</strong> {slExtracted.seniorBeneficiaryName}</div>}
                {slExtracted.seniorLoanAmount&&<div style={{marginBottom:4}}><strong>Original Amount:</strong> {slExtracted.seniorLoanAmount}</div>}
                {slExtracted.seniorLoanDate&&<div style={{marginBottom:4}}><strong>Date:</strong> {slExtracted.seniorLoanDate}</div>}
                {slExtracted.seniorRecordingNumber&&<div style={{marginBottom:4}}><strong>Recording No:</strong> {slExtracted.seniorRecordingNumber}</div>}
              </div>}
            </div>}
            {extractError&&<div style={{marginTop:12,...ST.err}}>{extractError}</div>}
            <div style={{marginTop:20,textAlign:"center"}}>
              <button onClick={()=>setStep(1)} style={{...ST.btnG,textDecoration:"underline",fontSize:12}}>Skip — I’ll enter details manually</button>
            </div>
            <div style={{marginTop:32,borderTop:`1px solid ${C.rule}`,paddingTop:16,textAlign:"center"}}>
              <button onClick={()=>setScreen("home")} style={{...ST.btnG,fontSize:11,color:C.muted,letterSpacing:1}}>← Back to all documents</button>
            </div>
          </div>
        )}

        {step===1&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:"normal",marginBottom:8}}>{extracted?"Confirm extracted data":"Property details"}</h2>
            {extracted&&<div style={{...ST.warn,marginBottom:20}}><strong>Review every field carefully.</strong> Verify the legal description character by character against the original deed before continuing.</div>}

            {docType!=="adjt"&&docType!=="adtr"&&docType!=="sscp"&&(
              <Field label={docType==="dot"?"Trustor (borrower) — name and vesting":"Grantor — name and vesting exactly as on current recorded deed"}>
                <div><input value={docType==="dot"?form.trustorName:form.grantor} onChange={e=>upd(docType==="dot"?"trustorName":"grantor",e.target.value)} placeholder="Full name and vesting exactly as it appears" style={ST.inp}/>{extracted&&<ConfBadge level={extractConf.grantor||"medium"}/>}</div>
              </Field>
            )}
            {docType!=="adjt"&&docType!=="adtr"&&docType!=="sscp"&&docType!=="interspousal"&&docType!=="dot"&&docType!=="act"&&docType!=="courtorder"&&docType!=="corrective"&&(
              <div style={{background:"#fff",border:`1px solid ${C.rule}`,borderRadius:2,padding:"18px 22px",marginBottom:18}}>
                <div style={{...ST.sec,marginTop:0}}>Signing capacity</div>
                <Field label="How is the grantor signing?">
                  <select value={form.grantorCapacity} onChange={e=>upd("grantorCapacity",e.target.value)} style={ST.inp}>
                    <option value="">— Select capacity —</option>{((docType==="granttrustin"||docType==="granttrustout")
                      ? ["Individual","Trustee","Successor Trustee","Attorney-in-Fact","Corporate Officer","LLC Manager / Member","General Partner","Personal Representative"]
                      : CAPACITY
                    ).map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                {/* Trustee sub-fields */}
                {(form.grantorCapacity==="Trustee")&&<>
                  <Field label="Trust name"><input value={form.capTrustName} onChange={e=>upd("capTrustName",e.target.value)} placeholder="e.g. The Smith Family Revocable Trust" style={ST.inp}/></Field>
                  <Field label="Trust date"><input value={form.capTrustDate} onChange={e=>upd("capTrustDate",e.target.value)} placeholder="e.g. January 15, 2018" style={ST.inp}/></Field>
                  <Field label="Trustee role"><select value={form.capTrusteeRole} onChange={e=>upd("capTrusteeRole",e.target.value)} style={ST.inp}><option value="">— Select role —</option><option value="Trustee">Trustee</option><option value="Co-Trustee">Co-Trustee</option></select></Field>
                  {form.capTrusteeRole==="Co-Trustee"&&<Field label="All co-trustee names" hint="Enter all trustees who will sign, one per line"><textarea value={form.capCoTrustees} onChange={e=>upd("capCoTrustees",e.target.value)} rows={3} placeholder="e.g. John Smith, Trustee&#10;Jane Smith, Co-Trustee" style={{...ST.inp,resize:"vertical"}}/></Field>}
                </>}

                {/* Successor Trustee sub-fields */}
                {form.grantorCapacity==="Successor Trustee"&&<>
                  <Field label="Trust name"><input value={form.capTrustName} onChange={e=>upd("capTrustName",e.target.value)} placeholder="e.g. The Smith Family Revocable Trust" style={ST.inp}/></Field>
                  <Field label="Trust date"><input value={form.capTrustDate} onChange={e=>upd("capTrustDate",e.target.value)} placeholder="e.g. January 15, 2018" style={ST.inp}/></Field>
                  <Field label="Deceased/removed trustee name"><input value={form.capDeceasedTrusteeName} onChange={e=>upd("capDeceasedTrusteeName",e.target.value)} placeholder="e.g. John Smith" style={ST.inp}/></Field>
                </>}

                {/* Attorney-in-Fact sub-fields */}
                {form.grantorCapacity==="Attorney-in-Fact"&&<>
                  <Field label="Principal name" hint="The person who granted the Power of Attorney"><input value={form.capAifPrincipal} onChange={e=>upd("capAifPrincipal",e.target.value)} placeholder="e.g. John Robert Smith" style={ST.inp}/></Field>
                  <Field label="Attorney-in-Fact name" hint="The person acting under the POA"><input value={form.capAifAgent} onChange={e=>upd("capAifAgent",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field>
                </>}

                {/* Corporate Officer sub-fields */}
                {form.grantorCapacity==="Corporate Officer"&&<>
                  <Field label="Corporation name"><input value={form.capEntityName} onChange={e=>upd("capEntityName",e.target.value)} placeholder="e.g. Smith Properties Inc." style={ST.inp}/></Field>
                  <Field label="State of incorporation"><input value={form.capEntityState} onChange={e=>upd("capEntityState",e.target.value)} placeholder="e.g. California" style={ST.inp}/></Field>
                  <Field label="Officer name and title"><input value={form.capOfficerTitle} onChange={e=>upd("capOfficerTitle",e.target.value)} placeholder="e.g. Jane Smith, President" style={ST.inp}/></Field>
                </>}

                {/* LLC Manager sub-fields */}
                {form.grantorCapacity==="LLC Manager / Member"&&<>
                  <Field label="LLC name"><input value={form.capEntityName} onChange={e=>upd("capEntityName",e.target.value)} placeholder="e.g. 123 Main Street LLC" style={ST.inp}/></Field>
                  <Field label="State of formation"><input value={form.capEntityState} onChange={e=>upd("capEntityState",e.target.value)} placeholder="e.g. California" style={ST.inp}/></Field>
                  <Field label="Manager/Member name and title"><input value={form.capOfficerTitle} onChange={e=>upd("capOfficerTitle",e.target.value)} placeholder="e.g. Jane Smith, Managing Member" style={ST.inp}/></Field>
                </>}

                {/* General Partner sub-fields */}
                {form.grantorCapacity==="General Partner"&&<>
                  <Field label="Partnership name"><input value={form.capPartnershipName} onChange={e=>upd("capPartnershipName",e.target.value)} placeholder="e.g. Smith Family Limited Partnership" style={ST.inp}/></Field>
                  <Field label="Partnership type"><select value={form.capPartnershipType} onChange={e=>upd("capPartnershipType",e.target.value)} style={ST.inp}><option value="">— Select type —</option><option value="LP">Limited Partnership (LP)</option><option value="LLP">Limited Liability Partnership (LLP)</option><option value="GP">General Partnership (GP)</option></select></Field>
                  <Field label="Partner name and title"><input value={form.capPartnerTitle} onChange={e=>upd("capPartnerTitle",e.target.value)} placeholder="e.g. Jane Smith, General Partner" style={ST.inp}/></Field>
                </>}

                {/* Personal Representative sub-fields */}
                {form.grantorCapacity==="Personal Representative"&&<>
                  <Field label="Estate name"><input value={form.capEstateName} onChange={e=>upd("capEstateName",e.target.value)} placeholder="e.g. Estate of John Robert Smith" style={ST.inp}/></Field>
                  <Field label="Appointing court"><input value={form.capPRCourt} onChange={e=>upd("capPRCourt",e.target.value)} placeholder="e.g. Superior Court of California, County of Los Angeles" style={ST.inp}/></Field>
                  <Field label="Case number"><input value={form.capPRCaseNo} onChange={e=>upd("capPRCaseNo",e.target.value)} placeholder="e.g. 24STPB12345" style={ST.inp}/></Field>
                  <Field label="Role"><select value={form.capPRRole} onChange={e=>upd("capPRRole",e.target.value)} style={ST.inp}><option value="">— Select role —</option><option value="Executor">Executor</option><option value="Administrator">Administrator</option><option value="Administrator with Will Annexed">Administrator with Will Annexed</option><option value="Special Administrator">Special Administrator</option></select></Field>
                </>}

                {/* Guardian / Conservator sub-fields */}
                {form.grantorCapacity==="Guardian / Conservator"&&<>
                  <Field label="Ward / conservatee name"><input value={form.capWardName} onChange={e=>upd("capWardName",e.target.value)} placeholder="e.g. John Robert Smith" style={ST.inp}/></Field>
                  <Field label="Role"><select value={form.capGCRole} onChange={e=>upd("capGCRole",e.target.value)} style={ST.inp}><option value="">— Select role —</option><option value="Guardian">Guardian</option><option value="Conservator of the Estate">Conservator of the Estate</option><option value="Conservator of the Person">Conservator of the Person</option><option value="Guardian of the Estate">Guardian of the Estate</option></select></Field>
                </>}

                {/* Receiver sub-fields */}
                {form.grantorCapacity==="Receiver"&&<>
                  <Field label="Appointing court"><input value={form.capReceiverCourt} onChange={e=>upd("capReceiverCourt",e.target.value)} placeholder="e.g. Superior Court of California, County of Orange" style={ST.inp}/></Field>
                  <Field label="Case number"><input value={form.capReceiverCaseNo} onChange={e=>upd("capReceiverCaseNo",e.target.value)} placeholder="e.g. 24STCV12345" style={ST.inp}/></Field>
                </>}
              </div>
            )}
            
            
            
            

            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              <Field label="APN"><div><input value={form.apn} onChange={e=>upd("apn",e.target.value)} placeholder="e.g. 123-456-789" style={ST.inp}/>{extracted&&<ConfBadge level={extractConf.apn||"medium"}/>}</div></Field>
              <Field label="County"><div><select value={form.county} onChange={e=>upd("county",e.target.value)} style={ST.inp}><option value="">— Select county —</option>{COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}</select>{extracted&&<ConfBadge level={extractConf.county||"high"}/>}</div></Field>
            </div>
            <Field label="City"><input value={form.cityOfProperty} onChange={e=>upd("cityOfProperty",e.target.value)} placeholder="e.g. Pasadena" style={ST.inp} autoCapitalize="words"/></Field>
            <Field label="Property street address"><input value={form.propertyAddress} onChange={e=>upd("propertyAddress",e.target.value)} placeholder="e.g. 123 Main Street" style={ST.inp} autoCapitalize="words"/></Field>
            <Field label="Legal description">
              <textarea value={form.legalDescription} onChange={e=>upd("legalDescription",e.target.value)} rows={5} placeholder="Complete legal description verbatim" style={{...ST.inp,resize:"vertical",lineHeight:1.65,fontFamily:"'Courier New',monospace",fontSize:12,borderColor:extracted&&extractConf.legalDescription==="low"?"#e09080":C.rule}}/>
              {extracted&&<ConfBadge level={extractConf.legalDescription||"medium"}/>}
              {extracted&&extractConf.legalDescription==="low"&&<div style={{...ST.err,marginTop:8}}>Dottie had difficulty reading the legal description. Enter manually from the original document.</div>}
            </Field>
            {extracted&&(
              <div style={{background:"#f0f8f0",border:"1px solid #b0d090",borderLeft:`3px solid ${C.green}`,padding:"14px 16px",borderRadius:2,marginBottom:20}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer"}}>
                  <input type="checkbox" checked={legalVerified} onChange={e=>setLegalVerified(e.target.checked)} style={{width:16,height:16,marginTop:2,flexShrink:0}}/>
                  <span style={{fontSize:13,color:"#2a5010",lineHeight:1.7}}><strong>I have verified the legal description</strong> above against the original recorded deed and confirm it is complete and accurate.</span>
                </label>
              </div>
            )}
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>setStep(0)} style={ST.btnS}>← Back</button>
              <button onClick={()=>setStep(2)} disabled={extracted&&!legalVerified} style={{...ST.btnP,opacity:(extracted&&!legalVerified)?0.4:1,cursor:(extracted&&!legalVerified)?"not-allowed":"pointer"}}>Continue →</button>
              {extracted&&!legalVerified&&<span style={{fontSize:12,color:C.amber,alignSelf:"center"}}>Verify legal description to continue</span>}
            </div>
          </div>
        )}

        {step===2&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:"normal",marginBottom:8}}>Transfer details</h2>
            <p style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.8}}>Enter the details specific to this transfer.</p>

            {(docType==="grant"||docType==="granttrustin"||docType==="granttrustout")&&<>
              <Field label="Grantee — full name"><input value={form.grantee} onChange={e=>upd("grantee",e.target.value)} placeholder="e.g. Jane Doe and Robert Doe" style={ST.inp}/></Field>
              <Field label="How the grantee takes title" ><select value={form.granteeVesting} onChange={e=>upd("granteeVesting",e.target.value)} style={ST.inp}><option value="">— Select vesting —</option>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}<option value="custom">Custom vesting...</option></select>{form.granteeVesting==="custom"&&<input value={form.customVesting} onChange={e=>upd("customVesting",e.target.value)} placeholder="Custom vesting language" style={{...ST.inp,marginTop:8}}/>}</Field>
              <Field label="Grantee mailing address"><input value={form.granteeAddress} onChange={e=>upd("granteeAddress",e.target.value)} placeholder="e.g. 123 Main Street, Los Angeles, CA 90001" style={ST.inp}/></Field>
              <Field label="Documentary Transfer Tax"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:10,fontSize:13,color:C.muted}}><input type="checkbox" checked={form.exemptFromTax} onChange={e=>upd("exemptFromTax",e.target.checked)} style={{width:15,height:15}}/>Exempt from Documentary Transfer Tax</label>{form.exemptFromTax?<RTDropdown/>:<input value={form.dtt} onChange={e=>upd("dtt",e.target.value)} placeholder="e.g. 935.00" style={ST.inp}/>}</Field>
              {(docType==="granttrustin"||docType==="granttrustout")&&<>
                <Field label="Trust name"><input value={form.trustName} onChange={e=>upd("trustName",e.target.value)} placeholder="e.g. The Smith Family Revocable Living Trust" style={ST.inp}/></Field>
                <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:16,fontSize:13,color:C.muted}}><input type="checkbox" checked={form.isAmended} onChange={e=>upd("isAmended",e.target.checked)} style={{width:15,height:15}}/>Trust has been amended — include "as amended"</label>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Trust date"><input value={form.trustDate} onChange={e=>upd("trustDate",e.target.value)} placeholder="e.g. January 15, 2018" style={ST.inp}/></Field><Field label="Settlor(s)"><input value={form.settlorName} onChange={e=>upd("settlorName",e.target.value)} placeholder="e.g. John Smith and Jane Smith" style={ST.inp}/></Field></div>
                <Field label="Trustee(s)"><input value={form.trusteeName} onChange={e=>upd("trusteeName",e.target.value)} placeholder="e.g. John Smith and Jane Smith" style={ST.inp}/></Field>
                {docType==="granttrustin"&&<Field label="Reason for transfer"><select value={form.trustTransferReason} onChange={e=>upd("trustTransferReason",e.target.value)} style={ST.inp}><option value="T1">Initial funding by settlor</option><option value="T3">Transfer between trusts</option><option value="T5">Refinance — out then back into trust</option></select></Field>}
                {docType==="granttrustout"&&<Field label="Reason for transfer"><select value={form.trustTransferReason} onChange={e=>upd("trustTransferReason",e.target.value)} style={ST.inp}><option value="T2">Distribution to beneficiary</option><option value="T4">Death of settlor — successor trustee to beneficiary</option></select></Field>}
                {docType==="granttrustout"&&<Field label="Beneficiary name"><input value={form.beneficiaryName} onChange={e=>upd("beneficiaryName",e.target.value)} placeholder="e.g. Sarah Smith, an unmarried woman" style={ST.inp}/></Field>}
                <div style={{background:"#f8f4ec",border:`1px solid ${C.rule}`,padding:"14px 16px",borderRadius:2,marginBottom:18}}><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:form.isSettlorDeceased?12:0,fontSize:13,color:"#8a6020"}}><input type="checkbox" checked={form.isSettlorDeceased} onChange={e=>upd("isSettlorDeceased",e.target.checked)} style={{width:15,height:15}}/>Settlor is deceased — successor trustee transfer</label>{form.isSettlorDeceased&&<Field label="Date of death"><input value={form.dateOfDeath} onChange={e=>upd("dateOfDeath",e.target.value)} placeholder="e.g. March 10, 2025" style={ST.inp}/></Field>}</div>
                <Field label="Prop 19 reassessment exclusion"><select value={form.prop19} onChange={e=>upd("prop19",e.target.value)} style={ST.inp}><option value="">— Select —</option><option value="P4">Not applicable</option><option value="P1">Parent to child — primary residence</option><option value="P2">Child to parent</option><option value="P3">Grandparent to grandchild (both parents deceased)</option></select></Field>
                
              </>}
            </>}

            {docType==="dot"&&<>
              <Field label="Lien position"><div style={{display:"flex",gap:10}}>{["first","second"].map(pos=>(<div key={pos} onClick={()=>upd("dotPosition",pos)} style={{flex:1,padding:"11px 16px",border:`2px solid ${form.dotPosition===pos?C.gold:C.rule}`,borderRadius:2,cursor:"pointer",background:form.dotPosition===pos?C.cream:"#fff",fontSize:13,color:form.dotPosition===pos?C.ink:C.muted,textAlign:"center",textTransform:"capitalize",transition:"all .15s"}}>{pos} position</div>))}</div></Field>
              {form.dotPosition==="second"&&(<div style={{background:"#f0f8f0",border:"1px solid #b0d090",padding:"14px 16px",borderRadius:2,marginBottom:18}}>
                <div style={{fontSize:11,color:"#3a6010",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Senior lien information</div>
                <div style={{background:"#fff8e8",border:"1px solid #e8d080",borderRadius:4,padding:"8px 12px",fontSize:12,color:"#7a6020",marginBottom:12,fontStyle:"italic"}}>⚠ The following was extracted from the uploaded senior deed of trust. Please verify all fields before generating.</div><Field label="Senior lien holder"><input value={form.seniorLienHolder} onChange={e=>upd("seniorLienHolder",e.target.value)} placeholder="e.g. UBS Bank USA" style={ST.inp}/></Field>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Senior lien type"><select value={form.seniorLienType} onChange={e=>upd("seniorLienType",e.target.value)} style={ST.inp}><option value="">— Select —</option><option value="DEED OF TRUST">DEED OF TRUST</option><option value="MORTGAGE">MORTGAGE</option></select></Field><Field label="Senior lien amount ($)"><input value={form.seniorLienAmount} onChange={e=>upd("seniorLienAmount",e.target.value)} placeholder="e.g. 500,000" style={ST.inp}/></Field></div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Recording date"><input value={form.seniorLienRecordingDate} onChange={e=>upd("seniorLienRecordingDate",e.target.value)} placeholder="e.g. 01/25/2022" style={ST.inp}/></Field><Field label="Instrument number"><input value={form.seniorLienRecording} onChange={e=>upd("seniorLienRecording",e.target.value)} placeholder="e.g. 2022008090" style={ST.inp}/></Field></div>
                <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:C.muted}}><input type="checkbox" checked={form.requestNOD} onChange={e=>upd("requestNOD",e.target.checked)} style={{width:15,height:15}}/>Request for notice of default on senior lien (CC §2924b)</label>
              </div>)}
              <Field label="How trustor holds title"><div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:4,marginBottom:6}}>Inferred from prior deed. Confirm how your client currently holds title.</div><select value={form.trustorVesting} onChange={e=>upd("trustorVesting",e.target.value)} style={ST.inp}><option value="">— Select vesting —</option>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}<option value="custom">Custom...</option></select>{form.trustorVesting==="custom"&&<input value={form.trustorCustomVesting} onChange={e=>upd("trustorCustomVesting",e.target.value)} placeholder="Custom vesting" style={{...ST.inp,marginTop:8}}/>}</Field>
              <Field label="Trustor signing capacity"><div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:4,marginBottom:6}}>Inferred from prior deed. Confirm signing capacity with your client.</div><select value={form.trustorCapacity} onChange={e=>upd("trustorCapacity",e.target.value)} style={ST.inp}><option value="">— Select capacity —</option>{["Individual","Trustee","Corporate Officer","LLC Manager / Member","General Partner","Attorney-in-Fact"].map(c=><option key={c} value={c}>{c}</option>)}</select></Field>
              {form.trustorCapacity==="Trustee"&&<><Field label="Trust name"><input value={form.capTrustName} onChange={e=>upd("capTrustName",e.target.value)} placeholder="e.g. The Smith Family Trust" style={ST.inp}/></Field><Field label="Trust date"><input value={form.capTrustDate} onChange={e=>upd("capTrustDate",e.target.value)} placeholder="e.g. January 15, 2018" style={ST.inp}/></Field></>}
              {(form.trustorCapacity==="Corporate Officer"||form.trustorCapacity==="LLC Manager / Member")&&<><Field label="Entity name"><input value={form.capEntityName} onChange={e=>upd("capEntityName",e.target.value)} placeholder="e.g. Smith Properties Inc." style={ST.inp}/></Field><Field label="State of formation"><input value={form.capEntityState} onChange={e=>upd("capEntityState",e.target.value)} placeholder="California" style={ST.inp}/></Field><Field label="Officer/Manager name and title"><input value={form.capOfficerTitle} onChange={e=>upd("capOfficerTitle",e.target.value)} placeholder="e.g. Jane Smith, Managing Member" style={ST.inp}/></Field></>}
              {form.trustorCapacity==="Attorney-in-Fact"&&<><Field label="Principal name"><input value={form.capAifPrincipal} onChange={e=>upd("capAifPrincipal",e.target.value)} placeholder="e.g. John Robert Smith" style={ST.inp}/></Field><Field label="AIF name"><input value={form.capAifAgent} onChange={e=>upd("capAifAgent",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field></>}
              <Field label="Beneficiary (lender) name"><input value={form.beneficiaryLenderName} onChange={e=>upd("beneficiaryLenderName",e.target.value)} placeholder="e.g. John Doe, an unmarried man" style={ST.inp}/></Field>
              <Field label="Beneficiary (lender) address — extracted from promissory note, verify"><input value={form.beneficiaryLenderAddress} onChange={e=>upd("beneficiaryLenderAddress",e.target.value)} placeholder="e.g. 123 Main St, Los Angeles, CA 90001" style={ST.inp}/></Field>
              <Field label="Trustee"><input value={form.dotTrustee} onChange={e=>upd("dotTrustee",e.target.value)} style={ST.inp}/>{slExtracted&&form.dotTrustee&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:4}}>Pre-filled from senior deed of trust. Verify this is the correct trustee for the new loan.</div>}</Field>
              <Field label="Trustor address"><input value={form.trustorAddress} onChange={e=>upd("trustorAddress",e.target.value)} placeholder="e.g. 123 Main Street, Sacramento, CA 95814" style={ST.inp}/>{pnExtracted&&form.trustorAddress&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:4}}>Extracted from promissory note. Verify with your client.</div>}</Field>
              <Field label="Loan amount ($)"><input value={form.loanAmount} onChange={e=>upd("loanAmount",e.target.value)} placeholder="e.g. 500,000" style={ST.inp}/></Field>
              <Field label="Loan amount in words"><input value={form.loanAmountWords} onChange={e=>upd("loanAmountWords",e.target.value)} placeholder="e.g. Five Hundred Thousand Dollars and No Cents" style={ST.inp}/>{pnExtracted&&form.loanAmountWords&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:4}}>Auto-converted from loan amount. Verify spelling before generating.</div>}</Field>
              <div style={{display:"flex",gap:24,flexWrap:"wrap",marginBottom:18}}>{[["dueOnSale","Due-on-sale clause"],["businessPurpose","Business purpose declaration"]].map(([k,l])=>(<label key={k} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:C.muted}}><input type="checkbox" checked={form[k]} onChange={e=>upd(k,e.target.checked)} style={{width:15,height:15}}/>{l}</label>))}</div>
            </>}

            {docType==="quitclaim"&&<>
              <div style={{...ST.card,fontSize:13,color:"#3a6020",background:"#f0f8f0",borderLeft:`3px solid ${C.green}`,marginBottom:16}}>A Quitclaim Deed releases whatever interest the grantor holds — with no warranties of title.</div>
              <Field label="Grantee — full name"><input value={form.grantee} onChange={e=>upd("grantee",e.target.value)} placeholder="e.g. Jane Doe, an unmarried woman" style={ST.inp}/></Field>
              <Field label="How grantee takes title"><select value={form.granteeVesting} onChange={e=>upd("granteeVesting",e.target.value)} style={ST.inp}><option value="">— Select vesting —</option>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}<option value="custom">Custom...</option></select>{form.granteeVesting==="custom"&&<input value={form.customVesting} onChange={e=>upd("customVesting",e.target.value)} placeholder="Custom vesting" style={{...ST.inp,marginTop:8}}/>}</Field>
              <Field label="Grantee mailing address"><input value={form.granteeAddress} onChange={e=>upd("granteeAddress",e.target.value)} placeholder="e.g. 123 Main Street, Oakland, CA 94601" style={ST.inp}/></Field>
              <Field label="Documentary Transfer Tax"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:10,fontSize:13,color:C.muted}}><input type="checkbox" checked={form.exemptFromTax} onChange={e=>upd("exemptFromTax",e.target.checked)} style={{width:15,height:15}}/>Exempt from Documentary Transfer Tax</label>{form.exemptFromTax?<RTDropdown/>:<input value={form.dtt} onChange={e=>upd("dtt",e.target.value)} placeholder="e.g. 935.00" style={ST.inp}/>}</Field>
            </>}

            {docType==="interspousal"&&<>
              
              <Field label="Reason for transfer"><select value={form.interspousalReason} onChange={e=>upd("interspousalReason",e.target.value)} style={ST.inp}><option value="">— Select reason —</option><option value="I1">Adding spouse to title</option><option value="I2">Removing spouse from title (refinance)</option><option value="I3">Divorce / marital settlement</option><option value="I4">Transmutation — separate to community property</option><option value="I5">Transmutation — community to separate property</option><option value="I6">Estate planning purposes</option></select></Field>
              {["I4","I5"].includes(form.interspousalReason)&&<div style={ST.warn}>Transmutation requires Family Code §852 express declaration. Confirm both spouses understand the legal effect.</div>}
              <Field label="Transferring spouse (grantor)"><input value={form.grantor} onChange={e=>upd("grantor",e.target.value)} placeholder="e.g. John Smith, a married man" style={ST.inp}/></Field>
              <Field label="Receiving spouse (grantee)"><input value={form.spouseName} onChange={e=>upd("spouseName",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field>
              <Field label="Transferring spouse current vesting"><input value={form.spouseCurrentVesting} onChange={e=>upd("spouseCurrentVesting",e.target.value)} placeholder="e.g. a married man, as his sole and separate property" style={ST.inp}/></Field>
              <Field label="How grantee takes title" ><select value={form.spouseVesting} onChange={e=>upd("spouseVesting",e.target.value)} style={ST.inp}>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}</select></Field>
              <Field label="Grantor pronoun"><select value={form.grantorPronoun} onChange={e=>upd("grantorPronoun",e.target.value)} style={ST.inp}><option value="">— Select —</option><option value="his/her">his/her</option><option value="his">his</option><option value="her">her</option><option value="their">their</option></select></Field>
              <Field label="Grantee mailing address"><input value={form.granteeAddress} onChange={e=>upd("granteeAddress",e.target.value)} placeholder="e.g. 1535 Forest Way, Del Mar, CA 92014" style={ST.inp}/></Field>
            </>}

            {docType==="adjt"&&<>
              <div style={ST.warn}>A certified copy of the death certificate must accompany this affidavit. Submit both together as one recording package.</div>
              <Field label="Surviving joint tenant name"><input value={form.survivingJointTenant} onChange={e=>upd("survivingJointTenant",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field>
              <Field label="Deceased joint tenant — name as it appears on the death certificate"><input value={form.deceasedJointTenant} onChange={e=>upd("deceasedJointTenant",e.target.value)} placeholder="e.g. Allen Joel Blair" style={ST.inp}/></Field>
              <Field label="AKA — name as it appears on the original deed (if different from death certificate)" hint="If the death certificate name differs from how they were vested on title, enter the deed name here to add an AKA clause"><input value={form.deceasedJointTenantAKA} onChange={e=>upd("deceasedJointTenantAKA",e.target.value)} placeholder="e.g. Allen J. Blair (leave blank if same as above)" style={ST.inp}/></Field>
              <Field label="Both joint tenants as vested on prior deed"><input value={form.grantor} onChange={e=>upd("grantor",e.target.value)} placeholder="e.g. John Smith and Jane Smith, as joint tenants" style={ST.inp}/></Field>
              <Field label="Original deed type"><select value={form.originalDeedType} onChange={e=>upd("originalDeedType",e.target.value)} style={ST.inp}><option value="">— Select deed type —</option><option value="Grant Deed">Grant Deed</option><option value="Joint Tenancy Grant Deed">Joint Tenancy Grant Deed</option><option value="Quitclaim Deed">Quitclaim Deed</option><option value="Interspousal Transfer Deed">Interspousal Transfer Deed</option></select></Field>
              <Field label="Original deed grantor(s) — names of the people who signed the original deed" hint="These are the sellers/grantors — not the joint tenants who received title"><input value={form.originalDeedGrantor} onChange={e=>upd("originalDeedGrantor",e.target.value)} placeholder="e.g. Sharon Elizabeth Blair, who acquired title as Sharon E. Murphy, and Richard P. Murray and Kathleen M. Murray" style={ST.inp}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Prior deed date"><input value={form.originalDeedDate} onChange={e=>upd("originalDeedDate",e.target.value)} placeholder="e.g. June 1, 2010" style={ST.inp}/></Field><Field label="Recording date"><input value={form.originalDeedRecordingDate} onChange={e=>upd("originalDeedRecordingDate",e.target.value)} placeholder="e.g. June 15, 2010" style={ST.inp}/></Field></div>
              <Field label="Recording instrument number"><input value={form.originalDeedRecording} onChange={e=>upd("originalDeedRecording",e.target.value)} placeholder="e.g. DOC-2015-0049442-00" style={ST.inp}/></Field>
            </>}

            {docType==="act"&&<>
              <div style={ST.warn}>Records a change of trustee without a death. The triggering document (physician certification, restatement, or notice of resignation) is recited here, not attached. Do not record medical records.</div>
              <Field label="Reason for the change" required><select value={form.actReason} onChange={e=>upd("actReason",e.target.value)} style={ST.inp}>
                <option value="">Incapacity of the prior trustee (default)</option>
                <option value="incapacity">Incapacity of the prior trustee</option>
                <option value="restatement">Incapacity, and a restatement designates the successor</option>
                <option value="resignation">Resignation and appointment of a new trustee</option>
              </select></Field>
              <Field label="Trust name" required><input value={form.trustName} onChange={e=>upd("trustName",e.target.value)} placeholder="e.g. The Public Family Trust" style={ST.inp}/></Field>
              <Field label="Trust date" required><input value={form.trustDate} onChange={e=>upd("trustDate",e.target.value)} placeholder="e.g. March 5, 2015" style={ST.inp}/></Field>
              <Field label="New trustee(s)" required hint={"For co-trustees, join the names with \u201cand\u201d. Each gets a signature line."}><input value={form.successorTrusteeName} onChange={e=>upd("successorTrusteeName",e.target.value)} placeholder="e.g. Mary R. Public and Susan T. Public" style={ST.inp}/></Field>
              <Field label="Prior trustee(s)" required hint="The trustee being replaced, exactly as named on the recorded deed"><input value={form.actPriorTrusteeName} onChange={e=>upd("actPriorTrusteeName",e.target.value)} placeholder="e.g. John Q. Public" style={ST.inp}/></Field>
              {form.actReason==="restatement"&&<Field label="Restatement executed on" required><input value={form.actRestatementDate} onChange={e=>upd("actRestatementDate",e.target.value)} placeholder="e.g. June 1, 2026" style={ST.inp}/></Field>}
              {form.actReason==="resignation"&&<>
                <Field label="Notice of Resignation executed on" required><input value={form.actResignationDate} onChange={e=>upd("actResignationDate",e.target.value)} placeholder="e.g. June 1, 2026" style={ST.inp}/></Field>
                <Field label="Who appointed the new trustee(s)?" hint="Usually the settlor, acting under the terms of the trust"><input value={form.actAppointerName} onChange={e=>upd("actAppointerName",e.target.value)} placeholder="e.g. Mary R. Public" style={ST.inp}/></Field>
              </>}
              <div style={{...ST.sec,marginTop:18}}>The recorded deed that put the property in the trust</div>
              <Field label="Deed type"><select value={form.originalDeedType} onChange={e=>upd("originalDeedType",e.target.value)} style={ST.inp}><option value="">Grant Deed (default)</option><option>Grant Deed</option><option>Quitclaim Deed</option><option>Trust Transfer Deed</option></select></Field>
              <Field label="Deed date"><input value={form.originalDeedDate} onChange={e=>upd("originalDeedDate",e.target.value)} placeholder="e.g. March 5, 2015" style={ST.inp}/></Field>
              <Field label="Executed by (grantors on that deed)"><input value={form.originalDeedGrantor} onChange={e=>upd("originalDeedGrantor",e.target.value)} placeholder="e.g. John Q. Public and Mary R. Public, husband and wife" style={ST.inp}/></Field>
              <Field label="Granted to (as named on that deed)" hint="Leave blank to use the prior trustee(s) as trustee of the trust"><input value={form.actOriginalGrantees} onChange={e=>upd("actOriginalGrantees",e.target.value)} placeholder="e.g. John Q. Public and Mary R. Public, Trustees of The Public Family Trust" style={ST.inp}/></Field>
              <Field label="Recording document number"><input value={form.originalDeedRecording} onChange={e=>upd("originalDeedRecording",e.target.value)} placeholder="e.g. 2015-0123456" style={ST.inp}/></Field>
              <Field label="Recording date"><input value={form.originalDeedRecordingDate} onChange={e=>upd("originalDeedRecordingDate",e.target.value)} placeholder="e.g. March 10, 2015" style={ST.inp}/></Field>
            </>}
            {docType==="adtr"&&<>
              <div style={ST.warn}>A certified copy of the death certificate must accompany this affidavit.</div>
              <Field label="Trust name"><input value={form.trustName} onChange={e=>upd("trustName",e.target.value)} placeholder="e.g. The Smith Family Revocable Trust dated March 5, 2015" style={ST.inp}/></Field>
              <Field label="Trust date"><input value={form.trustDate} onChange={e=>upd("trustDate",e.target.value)} placeholder="e.g. March 5, 2015" style={ST.inp}/></Field>
              <Field label="Deceased trustee name"><input value={form.deceasedTrusteeName} onChange={e=>upd("deceasedTrusteeName",e.target.value)} placeholder="e.g. John Smith" style={ST.inp}/></Field>
              <Field label="Successor trustee name"><input value={form.successorTrusteeName} onChange={e=>upd("successorTrusteeName",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field>
              <Field label="Deceased trustee — exactly as named on original deed" hint="This is how the trustee appears in the recorded deed being referenced"><input value={form.deceasedTrusteeName} onChange={e=>upd("deceasedTrusteeName",e.target.value)} placeholder="e.g. John Robert Smith" style={ST.inp}/></Field>
              <Field label="County of residence at date of death"><input value={form.countyOfResidence} onChange={e=>upd("countyOfResidence",e.target.value)} placeholder="e.g. Placer" style={ST.inp}/></Field>
              <Field label="Original deed recording number"><input value={form.originalDeedRecording} onChange={e=>upd("originalDeedRecording",e.target.value)} placeholder="e.g. Document Number 2000-0136395-00" style={ST.inp}/></Field>
            </>}

            {docType==="sscp"&&<>
              <div style={{background:"#f0f8f0",border:`1px solid #b0d090`,borderLeft:`3px solid ${C.green}`,padding:"16px 20px",borderRadius:2,marginBottom:18,textAlign:"center"}}>
                <label style={{display:"inline-flex",alignItems:"center",gap:12,cursor:"pointer",fontSize:13,color:"#3a6010",fontWeight:"bold",justifyContent:"center"}}>
                  <input type="checkbox" checked={form.sscp_isPrimaryResidence} onChange={e=>upd("sscp_isPrimaryResidence",e.target.checked)} style={{width:16,height:16}}/>
                  This property is the primary residence of the surviving spouse
                </label>
                {form.sscp_isPrimaryResidence&&<div style={{fontSize:12,color:"#3a6010",marginTop:8,lineHeight:1.7}}>✓ SB2 Building Homes & Jobs Act fee will be marked <strong>$-0- exempt</strong> on the document.</div>}
              </div>
              <div style={ST.warn}>A certified copy of the death certificate must accompany this affidavit. 40 days must have passed since date of death before recording.</div>
              <Field label="Surviving spouse (affiant)"><input value={form.grantor} onChange={e=>upd("grantor",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field>
              <Field label="Deceased spouse — exactly as on death certificate"><input value={form.decedentName} onChange={e=>upd("decedentName",e.target.value)} placeholder="e.g. John Robert Smith" style={ST.inp}/></Field>
              <Field label="Original deed grantor(s)" hint="Both spouses as vested on the original deed — e.g. 'John Smith and Jane Smith'"><input value={form.originalDeedGrantor} onChange={e=>upd("originalDeedGrantor",e.target.value)} placeholder="e.g. John Robert Smith and Jane Smith" style={ST.inp}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Original deed date"><input value={form.originalDeedDate} onChange={e=>upd("originalDeedDate",e.target.value)} placeholder="e.g. June 1, 2010" style={ST.inp}/></Field><Field label="Recording number"><input value={form.originalDeedRecording} onChange={e=>upd("originalDeedRecording",e.target.value)} placeholder="e.g. Doc No. 2010-456789" style={ST.inp}/></Field></div>
              <Field label="Recording date"><input value={form.originalDeedRecordingDate} onChange={e=>upd("originalDeedRecordingDate",e.target.value)} placeholder="e.g. June 15, 2010" style={ST.inp}/></Field>
              <Field label="Surviving spouse mailing address"><input value={form.granteeAddress} onChange={e=>upd("granteeAddress",e.target.value)} placeholder="e.g. 123 Main Street, Auburn, CA 95603" style={ST.inp}/></Field>
            </>}

            {docType==="tod"&&<>
              <div style={{background:"#fff0f0",border:"1px solid #e09080",borderLeft:`3px solid ${C.red}`,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#5a1010",lineHeight:1.8}}><strong>MUST BE RECORDED WITHIN 60 DAYS OF NOTARIZATION</strong> — otherwise void. Two witnesses required in addition to notary.</div>
              <div style={{...ST.card,fontSize:13,color:"#3a6020",background:"#f0f8f0",borderLeft:`3px solid ${C.green}`,marginBottom:16}}>Exempt from PCOR (R&T §480.3) and Documentary Transfer Tax (R&T §11930). No PCOR required.</div>
              <Field label="Owner (transferor) full name" hint="Must exactly match name shown on title documents"><input value={form.todOwner} onChange={e=>upd("todOwner",e.target.value)} placeholder="e.g. John Robert Smith" style={ST.inp}/></Field>
              <Field label="Owner zip code"><input value={form.todOwnerZip} onChange={e=>upd("todOwnerZip",e.target.value)} placeholder="e.g. 90024" style={ST.inp}/></Field>
              <Field label="Beneficiary type"><select value={form.todBeneficiaryType} onChange={e=>upd("todBeneficiaryType",e.target.value)} style={ST.inp}><option value="">— Select type —</option><option value="Individual">Individual person</option><option value="Two individuals as joint tenants">Two individuals as joint tenants</option><option value="Two individuals as tenants in common">Two individuals as tenants in common</option><option value="Trustee of a trust">Trustee of a trust</option><option value="Entity">Private or public entity</option></select></Field>
              {form.todBeneficiaryType==="Trustee of a trust"?<><Field label="Trustee name(s)"><input value={form.todTrusteeName} onChange={e=>upd("todTrusteeName",e.target.value)} style={ST.inp}/></Field><Field label="Trust name"><input value={form.todTrustName} onChange={e=>upd("todTrustName",e.target.value)} style={ST.inp}/></Field><Field label="Trust date"><input value={form.todTrustDate} onChange={e=>upd("todTrustDate",e.target.value)} style={ST.inp}/></Field></>:form.todBeneficiaryType==="Entity"?<Field label="Entity name" hint="State precisely — exactly as the entity is legally named"><input value={form.todEntityName||""} onChange={e=>upd("todEntityName",e.target.value)} placeholder="e.g. Los Angeles County Museum of Art" style={ST.inp}/></Field>:<><Field label={form.todBeneficiaryType.includes("Two")?"Beneficiary 1 — full name":"Beneficiary full name"} hint="Full legal name — do NOT use general terms like 'my children'"><input value={form.todBeneficiary} onChange={e=>upd("todBeneficiary",e.target.value)} placeholder="e.g. Sarah Jane Smith" style={ST.inp}/></Field>{form.todBeneficiaryType.includes("Two")&&<Field label="Beneficiary 2 — full name"><input value={form.todBeneficiary2} onChange={e=>upd("todBeneficiary2",e.target.value)} placeholder="e.g. Michael Robert Smith" style={ST.inp}/></Field>}</>}
              <Field label="Beneficiary’s relationship to owner" hint="Optional — e.g. daughter, son, spouse, friend"><input value={form.todBeneficiaryRelationship||""} onChange={e=>upd("todBeneficiaryRelationship",e.target.value)} placeholder="e.g. daughter" style={ST.inp}/></Field>
              <div style={{background:"#fff8f0",border:`1px solid #e8c060`,borderLeft:`3px solid ${C.gold}`,padding:"12px 16px",fontSize:12,color:"#5a4010",lineHeight:1.8,marginBottom:18}}><strong>Two witnesses required.</strong> Both must be present at the same time when the owner signs. Witnesses do not need their signatures notarized.</div>
            </>}

            {docType==="courtorder"&&<>
              <div style={ST.warn}>This produces the recording cover page only. Record it on top of a certified copy of the order. Dottie does not draft the order itself.</div>
              <Field label="Document title of the court order" required><textarea value={form.orderTitle} onChange={e=>upd("orderTitle",e.target.value)} placeholder="e.g. ORDER CONFIRMING TRUST ASSETS" style={{...ST.inp,minHeight:70,resize:"vertical"}}/></Field>
              <Field label="Court case number"><input value={form.courtCaseNumber} onChange={e=>upd("courtCaseNumber",e.target.value)} placeholder="e.g. 24STPB01234" style={ST.inp}/></Field>
              <Field label="Additional APNs (one per line, or comma separated)"><textarea value={form.additionalApns} onChange={e=>upd("additionalApns",e.target.value)} placeholder={"1234-005-678\n1234-005-679"} style={{...ST.inp,minHeight:60,resize:"vertical"}}/></Field>
            </>}
            {docType==="corrective"&&<>
              <div style={ST.warn}>A corrective deed re-records a prior instrument to fix an error in it. State the correction precisely.</div>
              <Field label="Type of deed being corrected"><select value={form.correctiveOriginalType} onChange={e=>upd("correctiveOriginalType",e.target.value)} style={ST.inp}><option value="">Grant Deed (default)</option><option value="Grant Deed">Grant Deed</option><option value="Quitclaim Deed">Quitclaim Deed</option><option value="Interspousal Transfer Deed">Interspousal Transfer Deed</option><option value="Trust Transfer Deed">Trust Transfer Deed</option></select></Field>
              <Field label="Original instrument number" required><input value={form.correctiveOriginalDocNumber} onChange={e=>upd("correctiveOriginalDocNumber",e.target.value)} placeholder="e.g. 20240123456" style={ST.inp}/></Field>
              <Field label="Original recording date" required><input value={form.correctiveOriginalRecordingDate} onChange={e=>upd("correctiveOriginalRecordingDate",e.target.value)} placeholder="e.g. March 3, 2024" style={ST.inp}/></Field>
              <Field label="What is being corrected, and why" required><textarea value={form.correctiveReason} onChange={e=>upd("correctiveReason",e.target.value)} placeholder="e.g. The legal description omitted the second parcel." style={{...ST.inp,minHeight:70,resize:"vertical"}}/></Field>
              <Field label="Grantor"><input value={form.grantor} onChange={e=>upd("grantor",e.target.value)} placeholder="e.g. Jane Smith, a married woman" style={ST.inp}/></Field>
              <Field label="Grantee"><input value={form.grantee} onChange={e=>upd("grantee",e.target.value)} placeholder="e.g. Jane Smith, Trustee of the Smith Family Trust" style={ST.inp}/></Field>
            </>}
            <Field label="Recording fee exemption (SB 2 / AB 1466)"><select value={form.feeExemption} onChange={e=>upd("feeExemption",e.target.value)} style={ST.inp}>
              <option value="">{docType==="courtorder"?"Executed or recorded by the state or a court (default)":"Residential dwelling to an owner-occupier (default)"}</option>
              {FEE_EXEMPTIONS.map(x=><option key={x.id} value={x.id}>{x.text.replace(/^Exempt from (the )?fee per /,"").slice(0,90)}</option>)}
              <option value="none">No exemption. The $75 fee applies.</option>
            </select></Field>
            {docType==="recon"&&<>
              <Field label="Reconveyance type"><div style={{display:"flex",gap:10}}>{[["standard","Standard Full Reconveyance"],["sub_and_recon","Substitution of Trustee + Reconveyance"]].map(([val,lbl])=>(<div key={val} onClick={()=>upd("reconType",val)} style={{flex:1,padding:"11px 14px",border:`2px solid ${form.reconType===val?C.gold:C.rule}`,borderRadius:2,cursor:"pointer",background:form.reconType===val?C.cream:"#fff",fontSize:12,color:form.reconType===val?C.ink:C.muted,transition:"all .15s"}}>{lbl}</div>))}</div></Field>
              
              {form.reconType==="standard"&&<div style={ST.warn}>The Deed of Trust TRUSTEE executes this reconveyance — not the lender. Confirm loan is fully paid.</div>}
              <Field label="Original trustor (borrower)"><input value={form.grantor} onChange={e=>upd("grantor",e.target.value)} placeholder="e.g. Jane Smith, a married woman" style={ST.inp}/></Field>
              <Field label="Original trustee"><input value={form.reconType==="sub_and_recon"?form.reconOriginalTrustee:form.reconTrustee} onChange={e=>upd(form.reconType==="sub_and_recon"?"reconOriginalTrustee":"reconTrustee",e.target.value)} placeholder="e.g. Placer Title Company" style={ST.inp}/></Field>
              <Field label="Original beneficiary (lender)"><input value={form.reconBeneficiary} onChange={e=>upd("reconBeneficiary",e.target.value)} placeholder="e.g. John Doe, Trustee of the Doe Family Trust" style={ST.inp}/></Field>
              <Field label="Original loan amount ($)"><input value={form.reconLoanAmount} onChange={e=>upd("reconLoanAmount",e.target.value)} placeholder="e.g. 500,000" style={ST.inp}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Original DOT date"><input value={form.reconOriginalDeedDate} onChange={e=>upd("reconOriginalDeedDate",e.target.value)} placeholder="e.g. January 19, 2017" style={ST.inp}/></Field><Field label="Recording date"><input value={form.reconRecordingDate} onChange={e=>upd("reconRecordingDate",e.target.value)} placeholder="e.g. February 10, 2017" style={ST.inp}/></Field></div>
              <Field label="Document number"><input value={form.reconRecording} onChange={e=>upd("reconRecording",e.target.value)} placeholder="e.g. 2017-0010475" style={ST.inp}/></Field>
              {form.reconType==="sub_and_recon"&&<><div style={ST.sec}>Substitution details</div><Field label="New trustee(s) name(s)"><input value={form.reconNewTrustee} onChange={e=>upd("reconNewTrustee",e.target.value)} placeholder="e.g. Mark S. Hack and Eric J. Hack" style={ST.inp}/></Field><Field label="Reason for trustee succession"><input value={form.reconSuccessionReason} onChange={e=>upd("reconSuccessionReason",e.target.value)} placeholder="e.g. the death of the original Beneficiary" style={ST.inp}/></Field><Field label="Successor trust name"><input value={form.reconSuccessorTrustName} onChange={e=>upd("reconSuccessorTrustName",e.target.value)} placeholder="e.g. Hack Family Trust dated September 22, 1999" style={ST.inp}/></Field></>}
            </>}

            {docType==="easement"&&<>
              <Field label="Easement type"><select value={form.easementType} onChange={e=>upd("easementType",e.target.value)} style={ST.inp}><option value="">— Select easement type —</option><option value="ingress_egress">Ingress and Egress</option><option value="utility">Utility</option><option value="access">Access</option><option value="appurtenant">Appurtenant</option><option value="drainage">Drainage</option><option value="solar">Solar access (Civil Code §801.5)</option><option value="conservation">Conservation (Civil Code §815)</option><option value="other">Other — describe below</option></select>{form.easementType==="other"&&<input value={form.easementTypeCustom} onChange={e=>upd("easementTypeCustom",e.target.value)} placeholder="Describe easement type" style={{...ST.inp,marginTop:8}}/>}</Field>
              <Field label="Grantee — who receives the easement"><input value={form.grantee} onChange={e=>upd("grantee",e.target.value)} placeholder="e.g. Pacific Gas and Electric Company" style={ST.inp}/></Field>
              <Field label="How grantee holds easement"><select value={form.granteeVesting} onChange={e=>upd("granteeVesting",e.target.value)} style={ST.inp}><option value="">— Select vesting —</option>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}<option value="custom">Custom...</option></select>{form.granteeVesting==="custom"&&<input value={form.customVesting} onChange={e=>upd("customVesting",e.target.value)} placeholder="Custom vesting" style={{...ST.inp,marginTop:8}}/>}</Field>
              <Field label="Grantee mailing address"><input value={form.granteeAddress} onChange={e=>upd("granteeAddress",e.target.value)} placeholder="e.g. 123 Main Street, Sacramento, CA 95814" style={ST.inp}/></Field>
              <Field label="Easement description" hint="State specific location, dimensions, and purpose."><textarea value={form.easementDescription} onChange={e=>upd("easementDescription",e.target.value)} rows={4} placeholder="e.g. A strip of land 10 feet in width lying 5 feet on each side of the following described centerline..." style={{...ST.inp,resize:"vertical",lineHeight:1.6,fontFamily:"'Courier New',monospace",fontSize:12}}/></Field>
              <Field label="Dominant tenement description" hint="Leave blank for easements in gross"><textarea value={form.dominantDescription} onChange={e=>upd("dominantDescription",e.target.value)} rows={3} placeholder="Legal description of the benefited parcel (if appurtenant)" style={{...ST.inp,resize:"vertical",lineHeight:1.6,fontFamily:"'Courier New',monospace",fontSize:12}}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Easement width (feet)"><input value={form.easementWidth} onChange={e=>upd("easementWidth",e.target.value)} placeholder="e.g. 10" style={ST.inp}/></Field><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:C.muted,paddingTop:24}}><input type="checkbox" checked={form.easementExclusive} onChange={e=>upd("easementExclusive",e.target.checked)} style={{width:15,height:15}}/>Exclusive easement</label></div>
              <Field label="Additional terms and conditions"><textarea value={form.easementTerms} onChange={e=>upd("easementTerms",e.target.value)} rows={3} placeholder="Optional — any special terms or restrictions" style={{...ST.inp,resize:"vertical",lineHeight:1.6}}/></Field>
              <Field label="Documentary Transfer Tax"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:8,fontSize:13,color:C.muted}}><input type="checkbox" checked={form.exemptFromTax} onChange={e=>upd("exemptFromTax",e.target.checked)} style={{width:15,height:15}}/>Exempt from Documentary Transfer Tax</label>{form.exemptFromTax?<RTDropdown/>:<input value={form.dtt} onChange={e=>upd("dtt",e.target.value)} placeholder="e.g. 0.00" style={ST.inp}/>}</Field>
            </>}

            {docType==="dotmod"&&<>
              <div style={{...ST.card,fontSize:13,color:"#3a6020",background:"#f0f8f0",borderLeft:`3px solid ${C.green}`,marginBottom:16}}>Both trustor AND beneficiary must sign this modification. No PCOR required.</div>
              <Field label="Lien position of original DOT"><div style={{display:"flex",gap:10}}>{["first","second"].map(pos=>(<div key={pos} onClick={()=>upd("dotModPosition",pos)} style={{flex:1,padding:"11px 16px",border:`2px solid ${form.dotModPosition===pos?C.gold:C.rule}`,borderRadius:2,cursor:"pointer",background:form.dotModPosition===pos?C.cream:"#fff",fontSize:13,color:form.dotModPosition===pos?C.ink:C.muted,textAlign:"center",textTransform:"capitalize",transition:"all .15s"}}>{pos} DOT</div>))}</div></Field>
              <Field label="Trustor (borrower)"><input value={form.trustorName} onChange={e=>upd("trustorName",e.target.value)} placeholder="e.g. Jane Smith, a married woman" style={ST.inp}/></Field>
              <Field label="Beneficiary (lender)"><input value={form.beneficiaryLenderName} onChange={e=>upd("beneficiaryLenderName",e.target.value)} placeholder="e.g. John Doe, an unmarried man" style={ST.inp}/></Field>
              <Field label="Beneficiary address"><input value={form.beneficiaryLenderAddress} onChange={e=>upd("beneficiaryLenderAddress",e.target.value)} placeholder="e.g. 123 Main Street, Los Angeles, CA 90001" style={ST.inp}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Original DOT date"><input value={form.reconOriginalDeedDate} onChange={e=>upd("reconOriginalDeedDate",e.target.value)} placeholder="e.g. June 1, 2022" style={ST.inp}/></Field><Field label="Recording date"><input value={form.reconRecordingDate} onChange={e=>upd("reconRecordingDate",e.target.value)} placeholder="e.g. June 15, 2022" style={ST.inp}/></Field></div>
              <Field label="Document number"><input value={form.reconRecording} onChange={e=>upd("reconRecording",e.target.value)} placeholder="e.g. 2022-123456" style={ST.inp}/></Field>
              <Field label="Original loan amount ($)"><input value={form.reconLoanAmount} onChange={e=>upd("reconLoanAmount",e.target.value)} placeholder="e.g. 500,000" style={ST.inp}/></Field>
              <div style={ST.sec}>Modifications being made</div>
              <Field label="Describe all modifications"><textarea value={form.dotModTerms} onChange={e=>upd("dotModTerms",e.target.value)} rows={5} placeholder="e.g. 1. The maturity date of the Note is hereby extended from June 1, 2025 to June 1, 2027." style={{...ST.inp,resize:"vertical",lineHeight:1.65}}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:12}}><Field label="Modified loan amount ($)"><input value={form.dotModNewAmount} onChange={e=>upd("dotModNewAmount",e.target.value)} placeholder="e.g. 550,000" style={ST.inp}/></Field><Field label="New maturity date"><input value={form.dotModNewMaturity} onChange={e=>upd("dotModNewMaturity",e.target.value)} placeholder="e.g. June 1, 2027" style={ST.inp}/></Field><Field label="New interest rate (%)"><input value={form.dotModNewRate} onChange={e=>upd("dotModNewRate",e.target.value)} placeholder="e.g. 9.0" style={ST.inp}/></Field></div>
            </>}

            {docType==="trustees"&&<>
              
              <Field label="Trustee (foreclosing trustee) name"><input value={form.reconTrustee} onChange={e=>upd("reconTrustee",e.target.value)} placeholder="e.g. the trustee named on the deed of trust" style={ST.inp}/></Field>
              <Field label="Purchaser at sale (grantee)"><input value={form.grantee} onChange={e=>upd("grantee",e.target.value)} placeholder="e.g. ABC Investments LLC, a California limited liability company" style={ST.inp}/></Field>
              <Field label="How purchaser takes title"><select value={form.granteeVesting} onChange={e=>upd("granteeVesting",e.target.value)} style={ST.inp}><option value="">— Select vesting —</option>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}<option value="custom">Custom...</option></select>{form.granteeVesting==="custom"&&<input value={form.customVesting} onChange={e=>upd("customVesting",e.target.value)} placeholder="Custom vesting" style={{...ST.inp,marginTop:8}}/>}</Field>
              <Field label="Original trustor (defaulting borrower)"><input value={form.grantor} onChange={e=>upd("grantor",e.target.value)} placeholder="e.g. Jane Smith, a married woman" style={ST.inp}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Original DOT date"><input value={form.reconOriginalDeedDate} onChange={e=>upd("reconOriginalDeedDate",e.target.value)} placeholder="e.g. June 1, 2022" style={ST.inp}/></Field><Field label="Recording date"><input value={form.reconRecordingDate} onChange={e=>upd("reconRecordingDate",e.target.value)} placeholder="e.g. June 15, 2022" style={ST.inp}/></Field></div>
              <Field label="Document number"><input value={form.reconRecording} onChange={e=>upd("reconRecording",e.target.value)} placeholder="e.g. 2022-123456" style={ST.inp}/></Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Sale date"><input value={form.trusteeSaleDate} onChange={e=>upd("trusteeSaleDate",e.target.value)} placeholder="e.g. March 15, 2026" style={ST.inp}/></Field><Field label="Sale location"><input value={form.trusteeSaleLocation} onChange={e=>upd("trusteeSaleLocation",e.target.value)} placeholder="e.g. Front steps of the County Courthouse" style={ST.inp}/></Field></div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Unpaid balance at time of sale ($)"><input value={form.reconLoanAmount} onChange={e=>upd("reconLoanAmount",e.target.value)} placeholder="e.g. 750,000" style={ST.inp}/></Field><Field label="Amount bid / purchase price ($)"><input value={form.trusteeSalePrice} onChange={e=>upd("trusteeSalePrice",e.target.value)} placeholder="e.g. 825,000" style={ST.inp}/></Field></div>
              <Field label="Documentary Transfer Tax"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:8,fontSize:13,color:C.muted}}><input type="checkbox" checked={form.exemptFromTax} onChange={e=>upd("exemptFromTax",e.target.checked)} style={{width:15,height:15}}/>Exempt (R&T Code §11922 — amount bid at foreclosure sale)</label>{!form.exemptFromTax&&<input value={form.dtt} onChange={e=>upd("dtt",e.target.value)} placeholder="DTT amount" style={ST.inp}/>}</Field>
            </>}

            {docType==="sheriff"&&<>
              <div style={ST.warn}>Sheriff’s Deed is issued following a court-ordered judicial sale. Obtain certified copies of the Writ of Execution and Judgment before drafting.</div>
              <Field label="Sheriff’s name"><input value={form.sheriffName} onChange={e=>upd("sheriffName",e.target.value)} placeholder="e.g. Robert Luna" style={ST.inp}/></Field>
              <Field label="Court name"><input value={form.courtName} onChange={e=>upd("courtName",e.target.value)} placeholder="e.g. Superior Court of the State of California, County of Los Angeles" style={ST.inp}/></Field>
              <Field label="Case number"><input value={form.caseNumber} onChange={e=>upd("caseNumber",e.target.value)} placeholder="e.g. 24STCV12345" style={ST.inp}/></Field>
              <Field label="Case name"><input value={form.caseName} onChange={e=>upd("caseName",e.target.value)} placeholder="e.g. Smith v. Jones" style={ST.inp}/></Field>
              <Field label="Judgment date"><input value={form.judgmentDate} onChange={e=>upd("judgmentDate",e.target.value)} placeholder="e.g. January 15, 2026" style={ST.inp}/></Field>
              <Field label="Judgment creditor (plaintiff)"><input value={form.judgmentCreditor} onChange={e=>upd("judgmentCreditor",e.target.value)} placeholder="e.g. First Bank of California" style={ST.inp}/></Field>
              <Field label="Judgment debtor (defendant / property owner)"><input value={form.judgmentDebtor} onChange={e=>upd("judgmentDebtor",e.target.value)} placeholder="e.g. Jane Smith" style={ST.inp}/></Field>
              <Field label="Purchaser at sale (grantee)"><input value={form.grantee} onChange={e=>upd("grantee",e.target.value)} placeholder="e.g. First Bank of California" style={ST.inp}/></Field>
              <Field label="How purchaser takes title"><select value={form.granteeVesting} onChange={e=>upd("granteeVesting",e.target.value)} style={ST.inp}><option value="">— Select vesting —</option>{VESTING.map(v=><option key={v} value={v}>{v}</option>)}<option value="custom">Custom...</option></select>{form.granteeVesting==="custom"&&<input value={form.customVesting} onChange={e=>upd("customVesting",e.target.value)} placeholder="Custom vesting" style={{...ST.inp,marginTop:8}}/>}</Field>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Sale date"><input value={form.trusteeSaleDate} onChange={e=>upd("trusteeSaleDate",e.target.value)} placeholder="e.g. March 15, 2026" style={ST.inp}/></Field><Field label="Sale location"><input value={form.trusteeSaleLocation} onChange={e=>upd("trusteeSaleLocation",e.target.value)} placeholder="e.g. Front steps of the Los Angeles County Courthouse" style={ST.inp}/></Field></div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><Field label="Judgment amount ($)"><input value={form.reconLoanAmount} onChange={e=>upd("reconLoanAmount",e.target.value)} placeholder="e.g. 500,000" style={ST.inp}/></Field><Field label="Purchase price ($)"><input value={form.trusteeSalePrice} onChange={e=>upd("trusteeSalePrice",e.target.value)} placeholder="e.g. 550,000" style={ST.inp}/></Field></div>
              <Field label="Documentary Transfer Tax"><label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:8,fontSize:13,color:C.muted}}><input type="checkbox" checked={form.exemptFromTax} onChange={e=>upd("exemptFromTax",e.target.checked)} style={{width:15,height:15}}/>Exempt (R&T Code §11922)</label>{!form.exemptFromTax&&<input value={form.dtt} onChange={e=>upd("dtt",e.target.value)} placeholder="DTT amount" style={ST.inp}/>}</Field>
            </>}

            <div style={{display:"flex",gap:12,marginTop:8}}>
              <button onClick={()=>setStep(1)} style={ST.btnS}>← Back</button>
              <button onClick={handleGenerate} style={ST.btnP}>Generate document →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:"normal",marginBottom:4}}>Document ready</h2>
            {trackWarn&&<div style={{background:"#fdf6e3",border:"1px solid #e0c97a",color:"#7a5c10",padding:"10px 14px",borderRadius:4,fontSize:12,lineHeight:1.6,marginBottom:14}}>{trackWarn}</div>}
            <div style={{fontSize:12,color:C.muted,marginBottom:20,letterSpacing:1}}>{dt?.label} · {form.county} County · {new Date().toLocaleDateString()}</div>
            <div style={{background:"#fff",border:"1px solid #bbb",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",marginBottom:16,maxHeight:480,overflowY:"auto",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
              <div style={{padding:"6px 28px 2px",background:"#f0f8e8",borderBottom:"1px solid #c8e0c0",fontSize:11,color:"#4a6a3a",fontStyle:"italic"}}><Icon t="edit" size={12} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>Document is editable — click anywhere to make changes before downloading.</div><div style={{padding:"20px 28px",fontFamily:"'Times New Roman',Times,serif",fontSize:"10.5px",lineHeight:1.65,color:"#000",outline:"none"}} dangerouslySetInnerHTML={{__html: wrapDocHTML(output, dt?.label||"deed", form.apn)}} contentEditable={true} suppressContentEditableWarning={true} onInput={e=>{setOutput(e.currentTarget.innerHTML);}}/>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={copyAndDownload} style={{...ST.btnP,background:copied?"#5a9a5a":C.gold}}>{copied?"✓ Copied & Downloaded":"Copy + Download .txt"}</button>
              <button onClick={()=>downloadWordDoc(output,dt?.label||"deed",form.apn)} style={{...ST.btnP,background:"#2c5f8a"}}><Icon t="download" size={13} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>Download Word .doc</button>
              <button onClick={()=>generateWordDoc(output,dt?.label||"deed",form.apn)} style={ST.btnS}><Icon t="print" size={13} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>Print / Save as PDF</button>
              <button onClick={()=>{const t=prompt("Name this document to save it:", (form.grantor||"")+" — "+((DOC_TYPES.find(x=>x.id===docType)||{}).label||""));if(t!==null)saveDocument(t);}} style={ST.btnS}><span style={{display:"inline-flex",alignItems:"center",gap:6}}><Icon t="save" size={13} color="currentColor"/>Save to My Documents</span></button>{saveMsg&&<span style={{fontSize:11,color:C.green,alignSelf:"center",marginLeft:4}}>{saveMsg}</span>}<button onClick={()=>setScreen("guide")} style={ST.btnS}>Paralegal Guide</button>
              <button onClick={()=>setStep(2)} style={ST.btnS}>← Edit</button>
              <button onClick={()=>{setScreen("home");setStep(0);setOutput("");setForm(blank(master));setExtracted(null);setExtractConf({});setLegalVerified(false);}} style={{...ST.btnG,marginLeft:"auto"}}>New document</button>
            </div>
            {PCOR_DOCS.includes(docType)&&(
              <div style={{background:"#f0f8f0",border:`1px solid #b0d090`,borderLeft:`3px solid ${C.green}`,padding:"16px 20px",borderRadius:2,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:"bold",color:"#2a5010",marginBottom:4}}><Icon t="clip" size={13} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>PCOR Required for this deed</div>
                    <div style={{fontSize:12,color:"#3a6010",lineHeight:1.7}}>A Preliminary Change of Ownership Report must be filed with the county assessor.<br/>Without it, the recorder charges an additional <strong>$25.00 fee</strong> and requires supplemental information after recording.</div>
                  </div>
                  <button onClick={()=>{
              const reason = getPCORReason(docType,form);
              const isSpouseDeath = docType==="sscp"||(docType==="adjt");
              const isTrust = docType==="granttrustin"||docType==="granttrustout";
              const isInter = docType==="interspousal";
              const buyer = form.grantee||form.spouseName||form.survivingJointTenant||form.grantor||"";
              // The property's city is deliberately NOT used here: it is not a mailing address.
              const addr = splitAddress(form.granteeAddress);
              setPcorForm(p=>({...p,
                buyerName: buyer,
                buyerAddress: addr.street,
                buyerCity: addr.city,
                buyerState: addr.state,
                buyerZip: addr.zip,
                mailTaxName: buyer,
                mailTaxAddress: addr.street,
                mailTaxCity: addr.city,
                mailTaxState: addr.state,
                mailTaxZip: addr.zip,
              }));
              setPcorStep(1);
              setStep(4);
            }} style={{...ST.btnP,background:"#3a7a3a",whiteSpace:"nowrap"}}>Generate PCOR →</button>
                </div>
              </div>
            )}
            <div style={{padding:"14px 18px",background:"#1a0e08",border:"1px solid #3a2010",fontSize:12,color:"#8a6040",lineHeight:1.8,borderRadius:2}}><strong style={{color:"#c08050"}}>Attorney review required.</strong> Dottie generates draft documents only. The supervising attorney must verify all legal descriptions, vesting, notary blocks, and statutory language before execution and recordation. <strong>Dottie does not confirm vesting of title.</strong></div>
          </div>
        )}

        {step===4&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:"normal",marginBottom:4}}>PCOR — Preliminary Change of Ownership Report</h2>
            <div style={{fontSize:12,color:C.muted,marginBottom:16,letterSpacing:1}}>{dt?.label} · {form.county} County · BOE-502-A</div>

            {/* Progress indicator */}
            <div style={{display:"flex",gap:0,marginBottom:28,border:`1px solid ${C.rule}`,borderRadius:2,overflow:"hidden"}}>
              {["Buyer & Property","Transfer Info","Property Details","Review & Print"].map((s,i)=>(
                <div key={i} onClick={()=>i+1<pcorStep&&setPcorStep(i+1)} style={{flex:1,padding:"10px 8px",textAlign:"center",fontSize:10,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",background:i+1===pcorStep?C.gold:i+1<pcorStep?"#3a7a3a":"#fff",color:i+1<=pcorStep?"#fff":C.muted,borderRight:i<3?`1px solid ${C.rule}`:"none",cursor:i+1<pcorStep?"pointer":"default"}}>
                  {i+1<pcorStep?"✓ ":""}{s}
                </div>
              ))}
            </div>

            {/* PCOR Step 1 — Buyer & Property Info */}
            {pcorStep===1&&(
              <div>
                <div style={ST.sec}>Buyer / Transferee Information</div>
                <Field label="Buyer / transferee full name" required><input value={pcorForm.buyerName} onChange={e=>updPcor("buyerName",e.target.value)} style={ST.inp}/></Field>
                <Field label="Buyer mailing address"><input value={pcorForm.buyerAddress} onChange={e=>updPcor("buyerAddress",e.target.value)} placeholder="Street address" style={ST.inp}/></Field>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr 1fr",gap:12}}>
                  <Field label="City"><input value={pcorForm.buyerCity} onChange={e=>updPcor("buyerCity",e.target.value)} style={ST.inp}/></Field>
                  <Field label="State" warn={stateWarn(pcorForm.buyerState)}><input value={pcorForm.buyerState} onChange={e=>updPcor("buyerState",e.target.value)} style={ST.inp}/></Field>
                  <Field label="Zip" warn={zipWarn(pcorForm.buyerZip)}><input value={pcorForm.buyerZip} onChange={e=>updPcor("buyerZip",e.target.value)} style={ST.inp}/></Field>
                </div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
                  <Field label="Buyer daytime phone"><input value={pcorForm.buyerPhone} onChange={e=>updPcor("buyerPhone",e.target.value)} placeholder="(___) ___-____" style={ST.inp}/></Field>
                  <Field label="Buyer email"><input value={pcorForm.buyerEmail} onChange={e=>updPcor("buyerEmail",e.target.value)} placeholder="email@firm.com" style={ST.inp}/></Field>
                </div>

                <div style={ST.sec}>Mail Property Tax Information To</div>
                <Field label="Name" hint="If same as buyer, leave as is"><input value={pcorForm.mailTaxName} onChange={e=>updPcor("mailTaxName",e.target.value)} style={ST.inp}/></Field>
                <Field label="Address"><input value={pcorForm.mailTaxAddress} onChange={e=>updPcor("mailTaxAddress",e.target.value)} style={ST.inp}/></Field>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"2fr 1fr 1fr",gap:12}}>
                  <Field label="City"><input value={pcorForm.mailTaxCity} onChange={e=>updPcor("mailTaxCity",e.target.value)} style={ST.inp}/></Field>
                  <Field label="State" warn={stateWarn(pcorForm.mailTaxState)}><input value={pcorForm.mailTaxState} onChange={e=>updPcor("mailTaxState",e.target.value)} style={ST.inp}/></Field>
                  <Field label="Zip" warn={zipWarn(pcorForm.mailTaxZip)}><input value={pcorForm.mailTaxZip} onChange={e=>updPcor("mailTaxZip",e.target.value)} style={ST.inp}/></Field>
                </div>

                <div style={ST.sec}>Principal Residence</div>
                <div style={{...ST.card,marginBottom:16}}>
                  <div style={{fontSize:13,marginBottom:12}}>Is this property intended as the buyer’s principal residence?</div>
                  <div style={{display:"flex",gap:24,marginBottom:12}}>
                    {["YES","NO"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:pcorForm.isPrimaryResidence===v?"bold":"normal"}}>
                        <input type="checkbox" checked={pcorForm.isPrimaryResidence===v} onChange={()=>updPcor("isPrimaryResidence",v)} style={{width:15,height:15}}/>
                        {v}
                      </label>
                    ))}
                  </div>
                  {pcorForm.isPrimaryResidence==="YES"&&<Field label="Date of occupancy or intended occupancy"><input value={pcorForm.occupancyDate} onChange={e=>updPcor("occupancyDate",e.target.value)} placeholder="e.g. 07/01/2026" style={ST.inp}/></Field>}
                </div>

                <div style={{...ST.card,marginBottom:24}}>
                  <div style={{fontSize:13,marginBottom:12}}>Are you a 100% rated disabled veteran compensated at 100% by the Department of Veterans Affairs, or an unmarried surviving spouse of such a veteran?</div>
                  <div style={{display:"flex",gap:24}}>
                    {["YES","NO"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:pcorForm.isDisabledVet===v?"bold":"normal"}}>
                        <input type="checkbox" checked={pcorForm.isDisabledVet===v} onChange={()=>updPcor("isDisabledVet",v)} style={{width:15,height:15}}/>
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display:"flex",gap:12}}>
                  <button onClick={()=>{setStep(3);setPcorStep(1);}} style={ST.btnS}>← Back to Deed</button>
                  <button onClick={()=>{setPcorStep(2);window.scrollTo(0,0);}} style={ST.btnP}>Continue →</button>
                </div>
              </div>
            )}

            {/* PCOR Step 2 — Transfer Information (Part 1) */}
            {pcorStep===2&&(
              <div>
                <div style={ST.sec}>Part 1 — Transfer Information</div>
                <div style={{...ST.warn,marginBottom:16}}>Review each item. Items pre-checked based on your deed type — verify before printing.</div>

                {[
                  {key:"p1a", label:"A. This transfer is solely between spouses (addition or removal of a spouse, death of a spouse, divorce settlement, etc.)."},
                  {key:"p1b", label:"B. This transfer is solely between domestic partners currently registered with the California Secretary of State."},
                  {key:"p1c", label:"C. This is a transfer between parent(s) and child(ren), or between grandparent(s) and grandchild(ren)."},
                  {key:"p1d", label:"D. This transfer is the result of a cotenant’s death."},
                  {key:"p1e", label:"E. This transaction is to replace a principal residence owned by a person 55 years of age or older."},
                  {key:"p1f", label:"F. This transaction is to replace a principal residence by a person who is severely disabled."},
                  {key:"p1g", label:"G. This transaction is to replace a principal residence substantially damaged or destroyed by a wildfire or natural disaster."},
                  {key:"p1h", label:"H. This transaction is only a correction of the name(s) of the person(s) holding title to the property."},
                  {key:"p1i", label:"I. The recorded document creates, terminates, or reconveys a lender’s interest in the property."},
                  {key:"p1j", label:"J. This transaction is recorded only as a requirement for financing purposes or to create, terminate, or reconvey a security interest."},
                  {key:"p1k", label:"K. The recorded document substitutes a trustee of a trust, mortgage, or other similar document."},
                  {key:"p1l1", label:"L1. Transfer to/from a revocable trust that may be revoked by the transferor and is for the benefit of the transferor, and/or the transferor’s spouse or registered domestic partner."},
                  {key:"p1l2", label:"L2. Transfer to/from an irrevocable trust for the benefit of the creator/grantor/trustor and/or grantor’s/trustor’s spouse or registered domestic partner."},
                  {key:"p1m", label:"M. This property is subject to a lease with a remaining lease term of 35 years or more including written options."},
                  {key:"p1n", label:"N. Transfer between parties in which proportional interests of the transferor(s) and transferee(s) in each and every parcel remain exactly the same after the transfer."},
                  {key:"p1o", label:"O. This is a transfer subject to subsidized low-income housing requirements with governmentally imposed restrictions."},
                  {key:"p1p", label:"P. This transfer is to the first purchaser of a new building containing an active solar energy system."},
                  {key:"p1q", label:"Q. Other. If none of the above apply, mark YES and describe the transfer."},
                ].map(({key,label})=>(
                  <div key={key} style={{...ST.card,marginBottom:8,padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
                      <div style={{display:"flex",gap:16,flexShrink:0,paddingTop:2}}>
                        {["YES","NO"].map(v=>(
                          <label key={v} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,fontWeight:pcorForm[key]===v?"bold":"normal",color:pcorForm[key]===v&&v==="YES"?C.green:pcorForm[key]===v&&v==="NO"?C.muted:"inherit"}}>
                            <input type="checkbox" checked={pcorForm[key]===v} onChange={()=>updPcor(key,v)} style={{width:14,height:14}}/>
                            {v}
                          </label>
                        ))}
                      </div>
                      <div style={{fontSize:13,lineHeight:1.7,flex:1}}>{label}</div>
                    </div>
                    {key==="p1d"&&pcorForm.p1d==="YES"&&(
                      <div style={{marginTop:8,paddingLeft:80}}>
                        <Field label="Date of death"><input value={pcorForm.inheritanceDate} onChange={e=>updPcor("inheritanceDate",e.target.value)} placeholder="e.g. 01/15/2026" style={{...ST.inp,marginTop:4}}/></Field>
                      </div>
                    )}
                    {key==="p1c"&&pcorForm.p1c==="YES"&&(
                      <div style={{marginTop:8,paddingLeft:80}}>
                        <Field label="Relationship">
                          <select value={pcorForm.p1cRel||""} onChange={e=>updPcor("p1cRel",e.target.value)} style={ST.inp}>
                            <option value="">— Select —</option>
                            <option value="parentchild">Between parent(s) and child(ren)</option>
                            <option value="grandparent">Between grandparent(s) and grandchild(ren)</option>
                          </select>
                        </Field>
                        <div style={{display:"flex",gap:24,margin:"8px 0",fontSize:12,alignItems:"center"}}><span>Transferor’s principal residence?</span>{["YES","NO"].map(v=>(<label key={v} style={{display:"flex",gap:4,cursor:"pointer",fontWeight:pcorForm.p1cPrimary===v?"bold":"normal"}}><input type="checkbox" checked={pcorForm.p1cPrimary===v} onChange={()=>updPcor("p1cPrimary",v)}/>{v}</label>))}</div>
                        <div style={{display:"flex",gap:24,fontSize:12,alignItems:"center"}}><span>Family farm?</span>{["YES","NO"].map(v=>(<label key={v} style={{display:"flex",gap:4,cursor:"pointer",fontWeight:pcorForm.p1cFarm===v?"bold":"normal"}}><input type="checkbox" checked={pcorForm.p1cFarm===v} onChange={()=>updPcor("p1cFarm",v)}/>{v}</label>))}</div>
                      </div>
                    )}
                    {key==="p1p"&&pcorForm.p1p==="YES"&&(
                      <div style={{marginTop:8,paddingLeft:80,display:"flex",gap:24,fontSize:12,alignItems:"center"}}><span>Solar energy system is:</span>{["leased","owned"].map(v=>(<label key={v} style={{display:"flex",gap:4,cursor:"pointer",fontWeight:pcorForm.p1pType===v?"bold":"normal"}}><input type="checkbox" checked={pcorForm.p1pType===v} onChange={()=>updPcor("p1pType",v)}/>{v}</label>))}</div>
                    )}
                    {key==="p1q"&&pcorForm.p1q==="YES"&&(
                      <div style={{marginTop:8,paddingLeft:80}}>
                        <Field label="Describe the transfer"><input value={pcorForm.p1qDesc||""} onChange={e=>updPcor("p1qDesc",e.target.value)} style={{...ST.inp,marginTop:4}}/></Field>
                      </div>
                    )}
                  </div>
                ))}

                <div style={{display:"flex",gap:12,marginTop:8}}>
                  <button onClick={()=>{setPcorStep(1);window.scrollTo(0,0);}} style={ST.btnS}>← Back</button>
                  <button onClick={()=>{setPcorStep(3);window.scrollTo(0,0);}} style={ST.btnP}>Continue →</button>
                </div>
              </div>
            )}

            {/* PCOR Step 3 — Type of Transfer & Property Details */}
            {pcorStep===3&&(
              <div>
                <div style={ST.sec}>Part 2 — Type of Transfer</div>
                <Field label="Date of transfer (if different from recording date)"><input value={pcorForm.dateOfTransfer} onChange={e=>updPcor("dateOfTransfer",e.target.value)} placeholder="Leave blank if same as recording date" style={ST.inp}/></Field>
                <Field label="Type of transfer">
                  <select value={pcorForm.transferType} onChange={e=>updPcor("transferType",e.target.value)} style={ST.inp}>
                    <option value="">— Select transfer type —</option>{["Purchase","Foreclosure","Gift","Trade or exchange","Inheritance","Sale/leaseback","Other"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  {pcorForm.transferType==="Inheritance"&&<Field label="Date of death" hint="Enter date of death for inheritance transfers"><input value={pcorForm.inheritanceDate} onChange={e=>updPcor("inheritanceDate",e.target.value)} placeholder="e.g. 01/15/2026" style={{...ST.inp,marginTop:8}}/></Field>}
                  {pcorForm.transferType==="Other"&&<input value={pcorForm.transferTypeOther} onChange={e=>updPcor("transferTypeOther",e.target.value)} placeholder="Please describe the transfer" style={{...ST.inp,marginTop:8}}/>}
                </Field>
                <Field label="Was only a partial interest in the property transferred?">
                  <div style={{display:"flex",gap:24,marginBottom:pcorForm.partialInterest==="YES"?12:0}}>
                    {["YES","NO"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
                        <input type="checkbox" checked={pcorForm.partialInterest===v} onChange={()=>updPcor("partialInterest",v)} style={{width:15,height:15}}/>{v}
                      </label>
                    ))}
                  </div>
                  {pcorForm.partialInterest==="YES"&&<input value={pcorForm.partialPct} onChange={e=>updPcor("partialPct",e.target.value)} placeholder="Percentage transferred e.g. 50%" style={ST.inp}/>}
                </Field>

                {pcorForm.transferType==="Purchase"&&<>
                  <div style={ST.sec}>Part 3 — Purchase Price</div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
                    <Field label="Total purchase price ($)"><input value={pcorForm.totalPurchasePrice} onChange={e=>updPcor("totalPurchasePrice",e.target.value)} placeholder="e.g. 850,000" style={ST.inp}/></Field>
                    <Field label="Cash down payment ($)"><input value={pcorForm.downPayment} onChange={e=>updPcor("downPayment",e.target.value)} placeholder="e.g. 170,000" style={ST.inp}/></Field>
                  </div>
                </>}

                <div style={ST.sec}>Part 4 — Property Information</div>
                <Field label="Type of property transferred">
                  <select value={pcorForm.propertyType} onChange={e=>updPcor("propertyType",e.target.value)} style={ST.inp}>
                    <option value="">— Select property type —</option>{["Single-family residence","Multiple-family residence (2-4 units)","Condominium","Co-op/Own-your-own","Manufactured home","Unimproved lot","Timeshare","Commercial/Industrial","Other"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Does the property produce rental or other income?">
                  <div style={{display:"flex",gap:24}}>
                    {["YES","NO"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}>
                        <input type="checkbox" checked={pcorForm.producesIncome===v} onChange={()=>updPcor("producesIncome",v)} style={{width:15,height:15}}/>{v}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Condition of property at time of transfer">
                  <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                    {["Good","Average","Fair","Poor"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:pcorForm.propertyCondition===v?"bold":"normal"}}>
                        <input type="checkbox" checked={pcorForm.propertyCondition===v} onChange={()=>updPcor("propertyCondition",v)} style={{width:15,height:15}}/>{v}
                      </label>
                    ))}
                  </div>
                  {["Fair","Poor"].includes(pcorForm.propertyCondition)&&<input value={pcorForm.conditionDesc} onChange={e=>updPcor("conditionDesc",e.target.value)} placeholder="Brief description of condition" style={{...ST.inp,marginTop:8}}/>}
                </Field>

                <Field label="B. Personal/business property or incentives provided by seller to buyer are included in the purchase price (e.g. furniture, farm equipment, club memberships)">
                  <div style={{display:"flex",gap:24}}>
                    {["YES","NO"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:pcorForm.hasPersonalProperty===v?"bold":"normal"}}>
                        <input type="checkbox" checked={pcorForm.hasPersonalProperty===v} onChange={()=>updPcor("hasPersonalProperty",v)} style={{width:15,height:15}}/>{v}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="C. A manufactured home is included in the purchase price">
                  <div style={{display:"flex",gap:24}}>
                    {["YES","NO"].map(v=>(
                      <label key={v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:pcorForm.hasManufacturedHome===v?"bold":"normal"}}>
                        <input type="checkbox" checked={pcorForm.hasManufacturedHome===v} onChange={()=>updPcor("hasManufacturedHome",v)} style={{width:15,height:15}}/>{v}
                      </label>
                    ))}
                  </div>
                </Field>

                <div style={{display:"flex",gap:12,marginTop:8}}>
                  <button onClick={()=>setPcorStep(2)} style={ST.btnS}>← Back</button>
                  <button onClick={()=>{setPcorStep(4);window.scrollTo(0,0);}} style={ST.btnP}>Review & Print →</button>
                </div>
              </div>
            )}

            {/* PCOR Step 4 — Review & Print */}
            {pcorStep===4&&(
              <div>
                <div style={ST.sec}>Review Before Printing</div>
                <div style={{...ST.card,marginBottom:16,fontSize:13,lineHeight:2}}>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8}}>
                    {[
                      ["Buyer/Transferee", pcorForm.buyerName],
                      ["APN", form.apn],
                      ["Property", `${form.propertyAddress}${form.cityOfProperty?`, ${form.cityOfProperty}`:""}${form.county?`, ${form.county} County`:""}`],
                      ["Seller/Transferor", form.grantor],
                      ["Transfer type", pcorForm.transferType],
                      ["Principal residence", pcorForm.isPrimaryResidence],
                      ["Property type", pcorForm.propertyType],
                      ["Mail tax to", pcorForm.mailTaxName],
                    ].map(([label,val])=>(
                      <div key={label} style={{borderBottom:`1px solid ${C.cream}`,paddingBottom:4}}>
                        <div style={{fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>{label}</div>
                        <div style={{fontSize:13}}>{val||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={ST.warn}>Review all information above before printing. The PCOR must be filed with the county assessor at or before recording. Missing PCOR results in a $20 additional recording fee.</div>
                <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                  <button onClick={async()=>{
                    try {
                      const d = pcorForm;
                      const f = form;
                      const county = f.county||"";
                      const assessor = COUNTY_ASSESSORS[county]||{name:"",addr:"",city:""};
                      const buyer = d.buyerName||(f.grantee||f.spouseName||f.survivingJointTenant||f.grantor||"");

                      // Fetch the real BOE-502-A PDF
                      const pdfRes = await fetch("/boe502a.pdf");
                      if(!pdfRes.ok) throw new Error("Could not load BOE-502-A PDF");
                      const pdfBytes = await pdfRes.arrayBuffer();

                      const { PDFDocument, rgb, StandardFonts } = PDFLib;
                      const pdfDoc = await PDFDocument.load(pdfBytes);
                      const pdfForm = pdfDoc.getForm();
                      const pages = pdfDoc.getPages();
                      const page1 = pages[0];
                      const { width, height } = page1.getSize();
                      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
                      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

                      // WHITE OUT only the Santa Cruz county header (top-right, above the form fields)
                      // From pdftotext: header text is on lines 2-5, y roughly 718-787
                      // Form fields start at "NAME AND MAILING ADDRESS" around y=700
                      page1.drawRectangle({
                        x: 355,
                        y: 716,
                        width: 257,
                        height: 72,
                        color: rgb(1, 1, 1),
                        borderWidth: 0,
                      });

                      // Draw the correct county assessor info
                      if (assessor.name) {
                        page1.drawText(assessor.name, {
                          x: 358, y: 772,
                          size: 8, font: helveticaBold, color: rgb(0,0,0)
                        });
                        page1.drawText(assessor.addr, {
                          x: 358, y: 760,
                          size: 7.5, font: helvetica, color: rgb(0,0,0)
                        });
                        page1.drawText(assessor.city, {
                          x: 358, y: 749,
                          size: 7.5, font: helvetica, color: rgb(0,0,0)
                        });
                      }

                      // Helper functions
                      const txt = (name, val) => {
                        if (!val) return;
                        try { pdfForm.getTextField(name).setText(String(val)); } catch(e) {}
                      };
                      const chk = (name, yes) => {
                        try { const fld = pdfForm.getCheckBox(name); yes ? fld.check() : fld.uncheck(); } catch(e) {}
                      };

                      // Uncheck ALL checkboxes first (clear any pre-checked state)
                      try {
                        pdfForm.getFields().forEach(fld => {
                          try { if(fld.constructor.name==="PDFCheckBox") fld.uncheck(); } catch(e) {}
                        });
                      } catch(e) {}

                      // ── Page 1: Header ─────────────────────────────────────────────────
                      txt("Name and mailing address of buyer/transferee",
                        (buyer||"") +
                        (d.buyerAddress?"\n"+d.buyerAddress:"") +
                        (d.buyerCity?"\n"+d.buyerCity+", "+(d.buyerState||"CA")+" "+(d.buyerZip||""):"")
                      );
                      txt("Assessors parcel number", f.apn||"");
                      txt("seller transferor", f.grantor||"");
                      if (d.buyerPhone) {
                        const digits = (d.buyerPhone||"").replace(/\D/g,"");
                        txt("area code", digits.substring(0,3));
                        txt("buyer\u0027s daytime telephone number1", digits.substring(3));
                      }
                      txt("Buyer\u0027s email address", d.buyerEmail||"");
                      txt("street address or physical location of real property",
                        (f.propertyAddress||"") +
                        (f.cityOfProperty?", "+f.cityOfProperty:"") +
                        (county?", "+county+" County, CA":"")
                      );

                      // Principal residence
                      chk("This property is intended as my principal residence. If YES, please indicate the date of occupancy or intended occupancy Yes", d.isPrimaryResidence==="YES");
                      chk("This property is intended as my principal residence. If YES, please indicate the date of occupancy or intended occupancy_no", d.isPrimaryResidence==="NO");
                      if (d.isPrimaryResidence==="YES" && d.occupancyDate) {
                        const parts = (d.occupancyDate||"").split("/");
                        if(parts[0]) txt("Month", parts[0]);
                        if(parts[1]) txt("day", parts[1]);
                        if(parts[2]) txt("year", parts[2]);
                      }

                      // Disabled veteran
                      chk("Are you a disabled veteran or an unmarried surviving spouse of a disabled veteran who was compensated at 100% by the Department of Veterans Affairs or an unmarried surviving spouse of a 100% rated disabled veteran? Yes", d.isDisabledVet==="YES");
                      chk("Are you a disabled veteran or an unmarried surviving spouse of a disabled veteran who was compensated at 100% by the Department of Veterans Affairs or an unmarried surviving spouse of a 100% rated disabled veteran? No", d.isDisabledVet==="NO");

                      // Mail tax info
                      txt("mail property tax information to (name)", d.mailTaxName||buyer);
                      txt("Mail property tax informatino to address", d.mailTaxAddress||d.buyerAddress||"");
                      txt("city", d.mailTaxCity||d.buyerCity||"");
                      txt("state", d.mailTaxState||"CA");
                      txt("ZIP code", d.mailTaxZip||d.buyerZip||"");

                      // ── Part 1: Transfer Information ───────────────────────────────────
                      chk("A. This transfer is solely between spouses (addition or removal of a spouse, death of a spouse, divorce settlement, etc.)\u00adyes", d.p1a==="YES");
                      chk("A. This transfer is solely between spouses (addition or removal of a spouse, death of a spouse, divorce settlement, etc.)_no1", d.p1a==="NO");
                      chk("B. This transfer is solely between domestic partners currently registered with the California Secretary of State (addition or removal of a partner, death of a partner, termination settlement, etc.)_yes", d.p1b==="YES");
                      chk("B. This transfer is solely between domestic partners currently registered with the California Secretary of State (addition or removal of a partner, death of a partner, termination settlement, etc.)_no", d.p1b==="NO");
                      chk("C. This is a transfer between: parents and children or grandparents and grandchildren_yes", d.p1c==="YES");
                      chk("C. This is a transfer between: parents and children or grandparents and grandchildren_no", d.p1c==="NO");
                      if (d.p1c==="YES") {
                        chk("C. This is a transfer between parent(s) and child(ren)", d.p1cParentChild===true||d.p1cParentChild==="YES");
                        chk("C. This is a transfer between parent(s) and child(ren)_1", d.p1cGrandparent===true||d.p1cGrandparent==="YES");
                        chk("Was this the transferor/grantor\u0027s principal residence? Yes", d.p1cPrimaryRes==="YES");
                        chk("Was this the transferor/grantor\u0027s principal residence? No", d.p1cPrimaryRes==="NO");
                        chk("Is this a family farm? Yes", d.p1cFamilyFarm==="YES");
                        chk("Is this a family farm? No", d.p1cFamilyFarm==="NO");
                      }
                      chk("D.This transfer is the result of a cotenant's death_yes", d.p1d==="YES");
                      chk("D.This transfer is the result of a cotenant's death_no", d.p1d==="NO");
                      if (d.p1d==="YES") txt("DATE OF DEATH", d.inheritanceDate||f.dateOfDeathJT||"");
                      chk("E. This transaction is to replace a principal residence by a person 55 years of age or older_yes", d.p1e==="YES");
                      chk("E. This transaction is to replace a principal residence by a person 55 years of age or older_no", d.p1e==="NO");
                      chk("F. This transaction is to replace a principal residence by a person who is severely disabled. Yes", d.p1f==="YES");
                      chk("F. This transaction is to replace a principal residence by a person who is severely disabled. No", d.p1f==="NO");
                      chk("G. This transaction is to replace a principal residence substantially damaged or destroyed by a wildfire or natural disaster for which the Governor proclaimed a state of emergency. Yes", d.p1g==="YES");
                      chk("G. This transaction is to replace a principal residence substantially damaged or destroyed by a wildfire or natural disaster for which the Governor proclaimed a state of emergency. No", d.p1g==="NO");
                      chk("H. This transaction is only a correction of the name(s) of the person(s) holding title to the property (e.g. a name change upon marriage) If yes, please explain: _ yes", d.p1h==="YES");
                      chk("H. This transaction is only a correction of the name(s) of the person(s) holding title to the property (e.g. a name change upon marriage) If yes, please explain: _ no", d.p1h==="NO");
                      chk("I. The recorded document creates, terminates, or reconveys a lender's interest in the property. Yes", d.p1i==="YES");
                      chk("I. The recorded document creates, terminates, or reconveys a lender's interest in the property_no", d.p1i==="NO");
                      chk("J. This transaction is recorded only as a requirement for financing purposes or to create, terminate, or reconvey a security interest (e.g., cosigner) Yes", d.p1j==="YES");
                      chk("J. This transaction is recorded only as a requirement for financing purposes or to create, terminate, or reconvey a security interest (e.g., cosigner)\u2011no", d.p1j==="NO");
                      chk("K. The recorded document substitutes a trustee of a trust, mortgage, or other similar documentI. The recorded document substitutes a trustee of a trust, mortgage, or other similar document. Yes", d.p1k==="YES");
                      chk("K. The recorded document substitutes a trustee of a trust, mortgage, or other similar documentI. The recorded document substitutes a trustee of a trust, mortgage, or other similar document_no", d.p1k==="NO");
                      // L1 - revocable trust
                      chk("L1. This is a transfer of property to/from a revocable trust that may be revoked by the transferor and is for the benefit of the transferor and/or the transferor's spouse and/or registered domestic partner Yes", d.p1l1==="YES");
                      chk("L1. This is a transfer of property to/from a revocable trust that may be revoked by the transferor and is for the benefit of the transferor and/or the transferor's spouse and/or registered domestic partner_no", d.p1l1==="NO");
                      if (d.p1l1==="YES") {
                        chk("This is a transfer of property 1. to/from a revocable trust that may be revoked by the transferor and is for the benefit of the transferor, and/or", true);
                        chk("This is a transfer of property 1. to/from a revocable trust that may be revoked by the transferor and is for the benefit of the transferor\u0027s spouse", true);
                      }
                      // L2 - irrevocable trust
                      chk("L2. This is a transfer of property to/from an irrevocable trust for the benefit of the creator/grantor/trustor and/or grantor's trustor's spouse grantor's/trustor's registered domestic partner Yes", d.p1l2==="YES");
                      chk("L2. This is a transfer of property to/from an irrevocable trust for the benefit of the creator/grantor/trustor and/or grantor's trustor's spouse grantor's/trustor's registered domestic partner No", d.p1l2==="NO");
                      if (d.p1l2==="YES") {
                        chk("L2. This is a transfer of property to/from an irrevocable trust for the benefit of the grantor's/trustor's spouse", true);
                      }
                      chk("M. This property is subject to a lease with a remaining lease term of 35 years or more including written options Yes", d.p1m==="YES");
                      chk("M. This property is subject to a lease with a remaining lease term of 35 years or more including written options_no", d.p1m==="NO");
                      chk("N. This is a transfer between parties in which proportional interests of the transferor(s) and transferee(s) in each and every parcel being transferred remain exactly the same after the transfer yes", d.p1n==="YES");
                      chk("N. This is a transfer between parties in which proportional interests of the transferor(s) and transferee(s) in each and every parcel being transferred remain exactly the same after the transfer no", d.p1n==="NO");
                      chk("O. This is a transfer subject to subsidized low-income housing requirements with governmentally imposed restrictions imposed by specified nonprofit corporations yes", d.p1o==="YES");
                      chk("O. This is a transfer subject to subsidized low-income housing requirements with governmentally imposed restrictions imposed by specified nonprofit corporations no", d.p1o==="NO");
                      chk("P. This transfer is to the first purchaser of a new building containing a leased or owned active solar energy system. Yes", d.p1p==="YES");
                      chk("P. This transfer is to the first purchaser of a new building containing a leased or owned active solar energy system. No", d.p1p==="NO");
                      chk("Q. Other. This transfer is to Yes", d.p1q==="YES");
                      chk("Q. Other. This transfer to no", d.p1q==="NO");
                      if (d.p1q==="YES") txt("Q. Other. his transfer is to", d.p1qDesc||"");

                      // ── Part 2: Other Transfer Information ─────────────────────────────
                      txt("A. Date of transfer, if other than recording date", d.dateOfTransfer||"");
                      chk("B. Type of transfer purchase", d.transferType==="Purchase");
                      chk("B. Type of transfer foreclosure", d.transferType==="Foreclosure");
                      chk("B. Type of transfer gift", d.transferType==="Gift");
                      chk("B. Type of transfer trade or exchange", d.transferType==="Trade or exchange");
                      chk("B. Type of transfer contract of sale", d.transferType==="Contract of sale");
                      chk("B. Type of transfer sale/leaseback", d.transferType==="Sale/leaseback");
                      chk("B. Type of transfer creation of a lease", d.transferType==="Creation of a lease");
                      chk("B. Type of transfer assignment of a lease", d.transferType==="Assignment of a lease");
                      chk("B. Type of transfer inheritance", d.transferType==="Inheritance");
                      chk("B. Type of transfer termination of a lease", d.transferType==="Termination of a lease");
                      chk("B. Type of transfer other", d.transferType==="Other");
                      chk("B. Type of transfer merger, stock, or partnership", d.transferType==="Merger");
                      chk("Boundary Adjustment", d.transferType==="Boundary Adjustment");
                      if (d.transferType==="Contract of sale") txt("contract of sale.  date of contract", d.contractDate||"");
                      if (d.transferType==="Inheritance") txt("inheritance.  date of death", d.inheritanceDate||"");
                      if (d.transferType==="Other") txt("other. please explain1", d.transferTypeOther||"");
                      if (d.transferType==="Termination of a lease") txt("termination of a lease. date lease began", d.leaseBegan||"");
                      chk("C. Only a partial interest in the property was transferred. Yes", d.partialInterest==="YES");
                      chk("Only a partial interest in the property was transferred_no", d.partialInterest==="NO");
                      if (d.partialInterest==="YES") txt("if yes, indicate the percentage transferred", d.partialPct||"");

                      // ── Part 3: Purchase Price ──────────────────────────────────────────
                      if (d.totalPurchasePrice) txt("Total purchase price", d.totalPurchasePrice);
                      if (d.downPayment) txt("Cash down payment or value of trade or exchange excluding closing costs amount $", d.downPayment);

                      // ── Part 4: Property Information ───────────────────────────────────
                      chk("A. Type of property transferred single-family residence", d.propertyType==="Single-family residence");
                      chk("A. Type of property transferred Co-op Own-your-own", d.propertyType==="Co-op/Own-your-own");
                      chk("A. Type of property transferred Manufactured Home", d.propertyType==="Manufactured home");
                      chk("A. Type of property transferred multiple-family residence", (d.propertyType||"").includes("Multiple"));
                      chk("A. Type of property transferred Condominium", d.propertyType==="Condominium");
                      chk("A. Type of property transferred Unimproved lot", d.propertyType==="Unimproved lot");
                      chk("A. Type of property transferred Timeshare", d.propertyType==="Timeshare");
                      chk("A. Type of property transferred Commercial/Industrial", d.propertyType==="Commercial/Industrial");
                      chk("Personal/business property, or incentives, are included in the purchase price. Examples are furniture, farm equipment, machinery, club memberships, etc. Attach list if available", d.hasPersonalProperty==="YES");
                      chk("Personal/business property, or incentives, are included in the purchase price. Examples are furniture, farm equipment, machinery, club memberships, etc. Attach list if available_no", d.hasPersonalProperty==="NO");
                      chk("C. A manufactured home is included in the purchase price", d.hasManufacturedHome==="YES");
                      chk("C. A manufactured home is included in the purchase price_no", d.hasManufacturedHome==="NO");
                      chk("D. The property produces rental or other income", d.producesIncome==="YES");
                      chk("D. The property produces rental or other income_no", d.producesIncome==="NO");
                      chk("E. The condition of the property at the time of sale was good", d.propertyCondition==="Good");
                      chk("E. The condition of the property at the time of sale was average1", d.propertyCondition==="Average");
                      chk("E. The condition of the property at the time of sale was fair", d.propertyCondition==="Fair");
                      chk("E. The condition of the property at the time of sale was poor3", d.propertyCondition==="Poor");

                      // ── Certification ───────────────────────────────────────────────────
                      txt("Name of buyer/transferee/personal representative/corporate officer (please print)", buyer);

                      // Save and download
                      const filledBytes = await pdfDoc.save();
                      const blob = new Blob([filledBytes], {type:"application/pdf"});
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "PCOR_BOE502A_"+(f.apn||"draft").replace(/[^a-zA-Z0-9]/g,"-")+".pdf";
                      a.click();
                      URL.revokeObjectURL(url);

                    } catch(err) {
                      alert("PCOR error: "+err.message);
                    }
                  }} style={{...ST.btnP,background:"#2c5f8a"}}><Icon t="download" size={13} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>Download PCOR (BOE-502-A PDF)</button>
                  <button onClick={()=>{
                    const urls = {"Alameda": "https://www.acgov.org/auditor/prop/changewnership.htm", "Contra Costa": "https://www.ccclerkrec.us", "Los Angeles": "https://assessor.lacounty.gov/forms/", "Marin": "https://www.marincounty.gov/depts/ar", "Orange": "https://www.ocassessor.gov", "Placer": "https://www.placer.ca.gov/recorder", "Sacramento": "https://assessor.saccounty.gov", "San Diego": "https://arcc.sdcounty.ca.gov", "San Francisco": "https://www.sfassessor.org", "Santa Clara": "https://assessor.sccgov.org", "Santa Cruz": "https://www.sccassessor.org", "Ventura": "https://assessor.countyofventura.org"};
                    const county = form.county||"";
                    const url = urls[county] || "https://www.boe.ca.gov/proptaxes/pcor.htm";
                    window.open(url, "_blank");
                  }} style={{...ST.btnS}}><Icon t="link" size={13} color="currentColor" style={{display:"inline-block",verticalAlign:"-2px",marginRight:5}}/>Get Official County Form</button>
                  <button onClick={()=>setPcorStep(3)} style={ST.btnS}>← Edit</button>
                  <button onClick={()=>{setScreen("home");setStep(0);setOutput("");setPcorOutput("");setPcorStep(1);setForm(blank(master));setExtracted(null);setExtractConf({});setLegalVerified(false);}} style={{...ST.btnG,marginLeft:"auto"}}>New document</button>
                </div>
                <div style={{padding:"14px 18px",background:"#1a0e08",border:"1px solid #3a2010",fontSize:12,color:"#8a6040",lineHeight:1.8,borderRadius:2}}>
                  <strong style={{color:"#c08050"}}>Attorney review required.</strong> This PCOR is pre-filled as a drafting aid only. The supervising attorney must verify all information before submission to the county assessor. Dottie does not provide tax advice.
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}


        const root = createRoot(document.getElementById('root'));
        root.render(<DottieDeeds />);


