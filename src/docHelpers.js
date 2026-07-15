// Document-building helpers (extracted Stage 2)
import { COUNTY_ASSESSORS, RT_EXEMPTIONS, NOTARY, VESTING, CAPACITY, CAPACITY_FIELDS, COUNTIES, DOC_TYPES, COUNTY_INFO, DEF_COUNTY, CHECKLISTS, DEFAULT_MASTER, PCOR_DOCS } from './data.js';

export const juratBlock = (name) => `
┌─────────────────────────────────────────────────────────────────────────────────┐
│ A notary public or other officer completing this certificate verifies only the  │
│ identity of the individual who signed the document to which this certificate is │
│ attached, and not the truthfulness, accuracy, or validity of that document.     │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    JURAT

State of California           )
                              ) ss.
County of _______________     )

Subscribed and sworn to (or affirmed) before me on this __________ day of _________________, ${new Date().getFullYear()}, by ${name||"_________________________"}, proved to me on the basis of satisfactory evidence to be the person(s) who appeared before me.


_______________________________          (Seal)
Notary Public`;

export const nb = (cap) => NOTARY[cap] || NOTARY["Individual"];

export const grantorLine = (f) => {
  const cap = f.grantorCapacity||"Individual";
  const name = f.grantor||"[GRANTOR NAME]";
  const trust = (f.capTrustName||"[TRUST NAME]") + (f.capTrustDate ? ", dated " + f.capTrustDate : "");
  if (cap==="Trustee") {
    if (f.capTrusteeRole==="Co-Trustee" && f.capCoTrustees) return f.capCoTrustees;
    return name + ", as " + (f.capTrusteeRole||"Trustee") + " of " + trust;
  }
  if (cap==="Successor Trustee") return name + ", as Successor Trustee of " + trust;
  if (cap==="Attorney-in-Fact") return (f.capAifAgent||name) + ", as Attorney-in-Fact for " + (f.capAifPrincipal||"[PRINCIPAL NAME]");
  if (cap==="Corporate Officer") return (f.capEntityName||"[CORPORATION NAME]") + ", a " + (f.capEntityState||"California") + " corporation\nBy: " + (f.capOfficerTitle||"[OFFICER NAME AND TITLE]");
  if (cap==="LLC Manager / Member") { const mgr = f.capOfficerTitle||"[MANAGER NAME]"; return (f.capEntityName||"[LLC NAME]") + ", a " + (f.capEntityState||"California") + " limited liability company\n\nBy: ___________________________\n" + mgr + ", Manager"; }
  if (cap==="General Partner") return (f.capPartnershipName||"[PARTNERSHIP NAME]") + ", a " + (f.capPartnershipType||"LP") + "\nBy: " + (f.capPartnerTitle||"[PARTNER NAME AND TITLE]");
  if (cap==="Personal Representative") return name + ", as " + (f.capPRRole||"Executor") + " of the " + (f.capEstateName||"[ESTATE NAME]");
  if (cap==="Guardian / Conservator") return name + ", as " + (f.capGCRole||"Guardian") + " of " + (f.capWardName||"[WARD NAME]");
  if (cap==="Receiver") return name + ", as Court-Appointed Receiver\n" + (f.capReceiverCourt||"[COURT]") + ", Case No. " + (f.capReceiverCaseNo||"[CASE NO.]");
  return name;
};

export const nbFull = (f) => {
  const cap = f.grantorCapacity||"Individual";
  const block = NOTARY[cap] || NOTARY["Individual"];
  // Replace AIF principal placeholder with actual name
  if (cap==="Attorney-in-Fact" && f.capAifPrincipal) {
    return block.replace("_________________________,", f.capAifPrincipal+",");
  }
  return block;
};

export const mailTaxDeclHTML = (f, dttStr, declLines) => {
  const who = f.mailTaxTo || f.grantee || f.survivingJointTenant || f.grantor || "[MAIL TAX STATEMENTS TO]";
  const addr = f.mailTaxAddress || f.propertyAddress || "[ADDRESS]";
  const city = f.cityOfProperty ? ('<br>' + f.cityOfProperty + ', CA') : '';
  return '<table style="width:100%;border-collapse:collapse;margin:6pt 0 12pt;"><tr>' +
    '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
      '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
      '<div style="font-size:11pt;">' + who + '<br>' + addr + city + '</div>' +
    '</td>' +
    '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
      '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Declare(s):</div>' +
      '<div style="font-size:11pt;">Documentary Transfer Tax: ' + dttStr + '<br>' + declLines + '</div>' +
    '</td>' +
  '</tr></table>';
};

export const recHdr = (m) => {
  const fn = (m&&m.firmName)||"[FIRM NAME]";
  const fa = (m&&m.firmAddress)||"[FIRM ADDRESS]";
  const fc = (m&&m.firmCity)?(m.firmCity+", "+(m.firmState||"CA")+" "+(m.firmZip||"")):"[CITY, STATE ZIP]";
  return '<div style="font-weight:bold;font-size:11pt;margin-bottom:4pt;">RECORDING REQUESTED BY:</div>' +
    '<div style="font-size:11pt;margin-bottom:14pt;">' + fn + '</div>' +
    '<div style="font-weight:bold;font-size:11pt;margin-bottom:4pt;">AND WHEN RECORDED MAIL TO:</div>' +
    '<div style="font-size:11pt;margin-bottom:14pt;">' + fn + (fa?'<br>'+fa:'') + (fc?'<br>'+fc:'') + '</div>' +
    '<hr style="border:none;border-top:1px solid #000;margin:6pt 0 2pt 0;">' +
    '<div style="text-align:center;font-size:9pt;color:#444;margin-bottom:2pt;">Space above this line for Recorder’s use only</div>' +
    '<hr style="border:none;border-top:1px solid #000;margin:0 0 14pt 0;">';
};

export const venueHTML = (county, upper) => {
  const st = upper ? 'STATE OF CALIFORNIA' : 'State of California';
  const cty = (upper ? 'COUNTY OF ' : 'County of ') + (county ? (upper ? String(county).toUpperCase() : county) : '_______________');
  return '<table style="border-collapse:collapse;margin:8pt 0;font-size:11pt;line-height:1.4;"><tbody>' +
    '<tr><td style="white-space:nowrap;padding:0;">' + st + '</td><td style="padding:0 0 0 10pt;">)</td><td style="padding:0;"></td></tr>' +
    '<tr><td style="padding:0;"></td><td style="padding:0 0 0 10pt;">)</td><td style="padding:0 0 0 6pt;">ss.</td></tr>' +
    '<tr><td style="white-space:nowrap;padding:0;">' + cty + '</td><td style="padding:0 0 0 10pt;">)</td><td style="padding:0;"></td></tr>' +
    '</tbody></table>';
};

export const juratBoxHTML = (name, yr) => {
  const n = name||"_________________________";
  return '<div class="notary-box">A notary public or other officer completing this certificate verifies only the identity of the individual who signed the document to which this certificate is attached, and not the truthfulness, accuracy, or validity of that document.</div>' +
    '<div class="jurat-title">JURAT</div>' +
    '<div class="jurat-block">' + venueHTML() + 'Subscribed and sworn to (or affirmed) before me on this __________ day of _________________, ' + yr + ', by ' + n + ', proved to me on the basis of satisfactory evidence to be the person(s) who appeared before me.<br><br><br>_______________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Seal)<br>Notary Public</div>';
};

export const notaryHTML = (cap, f) => {
  const capKey = cap||"Individual";
  const capLabel = {
    "Individual": "",
    "Trustee": "as Trustee(s) of the trust named in the instrument",
    "Successor Trustee": "as Successor Trustee(s) of the trust named in the instrument",
    "Attorney-in-Fact": "as Attorney-in-Fact for " + ((f&&f.capAifPrincipal)||"_________________________"),
    "Corporate Officer": "as an authorized officer of the corporation named therein",
    "LLC Manager / Member": "as Manager/Member of the limited liability company named therein",
    "General Partner": "as General Partner of the partnership named therein",
    "Personal Representative": "as Executor/Administrator of the estate named in the instrument",
    "Guardian / Conservator": "as Guardian/Conservator of the person/estate named in the instrument",
    "Receiver": "as court-appointed Receiver",
    "Sheriff / Public Official": "as Sheriff/Public Official of the county named in the instrument",
  }[capKey] || "";
  const capText = capLabel ? ', and that by his/her/their signature(s) on the instrument the person(s), or the entity upon behalf of which the person(s) acted, executed the instrument in his/her/their authorized capacity(ies) ' + capLabel + '.' : ', and that by his/her/their signature(s) on the instrument the person(s), or the entity upon behalf of which the person(s) acted, executed the instrument.';
  return '<div class="notary-box">A notary public or other officer completing this certificate verifies only the identity of the individual who signed the document to which this certificate is attached, and not the truthfulness, accuracy, or validity of that document.</div>' +
    '<div style="margin-top:14pt;">' +
    venueHTML() +
    '<div class="body-text">On _____________ before me, _________________________, Notary Public, personally appeared _________________________, who proved to me on the basis of satisfactory evidence to be the person(s) whose name(s) is/are subscribed to the within instrument and acknowledged to me that he/she/they executed the same in his/her/their authorized capacity(ies)' + capText + '</div>' +
    '<div class="body-text">I certify under PENALTY OF PERJURY under the laws of the State of California that the foregoing paragraph is true and correct.</div>' +
    '<div class="body-text">WITNESS my hand and official seal.</div>' +
    '<div style="margin-top:20pt;">Signature _________________________ &nbsp;&nbsp;&nbsp;&nbsp; (Seal)</div>' +
    '</div>';
};

export const getPCORReason = (docType, f) => {
  if (docType==="adtr") return {box:"C", desc:"Change in ownership on death of trustee. Date of death: "+( f.dateOfDeathJT||"_______________")};
  if (docType==="interspousal") return {box:"A", desc:"Transfer between spouses"};
  if (docType==="adjt") return {box:"D", desc:"Death of joint tenant. Date of death: "+( f.dateOfDeathJT||"_______________")};
  if (docType==="sscp") return {box:"A", desc:"Death of spouse — community property succession"};
  if (docType==="granttrust"||docType==="trust") return {box:"L", desc:`Transfer ${["T2","T4"].includes(f.trustTransferReason)?"out of":"into"} revocable living trust`};
  if (docType==="trustees"||docType==="sheriff") return {box:"K", desc:"Foreclosure / court-ordered sale"};
  if (docType==="easement") return {box:"other", desc:"Conveyance of easement only"};
  if (f.exemptFromTax) return {box:"J", desc:"Transfer not subject to documentary transfer tax — "+( f.exemptReason||"see deed")};
  return {box:"other", desc:"Other transfer — see deed"};
};

// --- Recording fee exemptions (GC 27388.1 / SB 2 and GC 27388.2 / AB 1466).
// Reasons and citations taken from a recorded, county-accepted filing.
export const FEE_EXEMPTIONS = [
  {id:"dtt",   cite:"GC 27388.1(a)(2); GC 27388.2(b)",       text:"Exempt from fee per GC 27388.1(a)(2) and GC 27388.2(b); recorded concurrently \u201cin connection with\u201d a transfer subject to the imposition of documentary transfer tax (DTT)."},
  {id:"owner", cite:"GC 27388.1(a)(2); GC 27388.2(b)",       text:"Exempt from fee per GC 27388.1(a)(2) and GC 27388.2(b); recorded concurrently \u201cin connection with\u201d a transfer of real property that is a residential dwelling to an owner-occupier."},
  {id:"cap",   cite:"GC 27388.1(a)(1)",                      text:"Exempt from fee per GC 27388.1(a)(1); fee cap of $225.00 reached."},
  {id:"notrp", cite:"GC 27388.1(b)(2)(D); GC 27388.2(a)",    text:"Exempt from the fee per GC 27388.1(b)(2)(D) and GC 27388.2(a); not related to real property."},
  {id:"gov",   cite:"GC 27388.1(a)(2); GC 27388.2(b)",       text:"Exempt from the fee per GC 27388.1(a)(2) and GC 27388.2(b); this instrument is executed or recorded by a state, or county, or municipality, or other political subdivision of the state."}
];

// One-line fee declaration used inside the deed header blocks.
export const bhjaLine = (f) => {
  const sel = (f && f.feeExemption) || "owner";
  if (sel === "none") return "Building Homes and Jobs Act Fee: $75.00<br>GC 27388.1 (no exemption claimed; $225.00 cap applies)";
  const e = FEE_EXEMPTIONS.find(x => x.id === sel);
  return "Building Homes and Jobs Act Fee: $-0-<br>" + (e ? e.cite : "GC 27388.1(a)(2); GC 27388.2(b)");
};

// Full AB 1466 / SB 2 declaration block with the exemption checked, for recording cover pages.
export const feeExemptionHTML = (selected) => {
  const box = (on) => on
    ? '<span style="display:inline-block;width:11px;height:11px;border:1px solid #000;text-align:center;line-height:11px;font-size:8pt;margin-right:6px;vertical-align:top;">X</span>'
    : '<span style="display:inline-block;width:11px;height:11px;border:1px solid #000;margin-right:6px;vertical-align:top;"></span>';
  return '<div class="body-text" style="font-size:9.5pt;line-height:1.5;">Pursuant to Assembly Bill 1466 \u2013 Restrictive Covenant (GC Code Section 27388.2), effective January 1, 2022, a fee of two dollars ($2) for recording the first page of every instrument, paper, or notice required or permitted by law to be recorded per each single transaction per parcel of real property, except those expressly exempted from payment of recording fees, as authorized by each county\u2019s board of supervisors and in accordance with applicable constitutional requirements.</div>' +
    '<div class="body-text" style="font-size:9.5pt;line-height:1.5;">Pursuant to Senate Bill 2 \u2013 Building Homes and Jobs Act (GC Code Section 27388.1), effective January 1, 2018, a fee of seventy-five dollars ($75.00) shall be paid at the time of recording of every real estate instrument, paper, or notice required or permitted by law to be recorded, except those expressly exempted from payment of recording fees, per each single transaction per parcel of real property. The fee imposed by this section shall not exceed two hundred twenty-five dollars ($225.00).</div>' +
    '<div class="body-text" style="font-size:9.5pt;margin:10pt 0 4pt;">Reason for Exemption:</div>' +
    FEE_EXEMPTIONS.map(e => '<div style="font-size:9.5pt;line-height:1.45;margin:5pt 0;">' + box(selected === e.id) + '<span>' + e.text + '</span></div>').join("") +
    (selected === "none" ? '<div class="body-text" style="font-size:9.5pt;margin-top:8pt;">No exemption claimed. The Building Homes and Jobs Act fee of $75.00 applies, subject to the $225.00 cap.</div>' : "");
};
