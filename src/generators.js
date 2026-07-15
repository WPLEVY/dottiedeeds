// Document generators (extracted Stage 2)
import { COUNTY_ASSESSORS, RT_EXEMPTIONS, NOTARY, VESTING, CAPACITY, CAPACITY_FIELDS, COUNTIES, DOC_TYPES, COUNTY_INFO, DEF_COUNTY, CHECKLISTS, DEFAULT_MASTER, PCOR_DOCS } from './data.js';
import { juratBlock, nb, grantorLine, nbFull, mailTaxDeclHTML, recHdr, venueHTML, juratBoxHTML, notaryHTML, getPCORReason, feeExemptionHTML, bhjaLine, FEE_EXEMPTIONS } from './docHelpers.js';

export const genGrant = (f,m) => {
  const v = f.granteeVesting==="custom"?f.customVesting:f.granteeVesting;
  const yr = new Date().getFullYear();
  const dttLine = f.exemptFromTax
    ? 'Documentary Transfer Tax: $0<br>' + (f.exemptReason||"R&T §11911")
    : 'Documentary Transfer Tax: $' + (f.dtt||"___________");
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">GRANT DEED</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.grantee||"[GRANTEE NAME]") + '<br>' + (f.granteeAddress||"[GRANTEE ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Grantor(s) Declare(s):</div>' +
        '<div style="font-size:11pt;">' + dttLine + '<br>' + bhjaLine(f) + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"[COUNTY]") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + grantorLine(f) + ', hereby GRANTS to</div>' +
    '<div class="body-text">' + (f.grantee||"[GRANTEE NAME]") + ',<br>' + (v||"[VESTING]") + ',</div>' +
    '<div class="body-text">the following described real property in the County of ' + (f.county||"[COUNTY]") + ', State of California:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||'SEE EXHIBIT "A" ATTACHED HERETO AND MADE A PART HEREOF') + '</div>' +
    '<div class="body-text">Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">Dated: _______________________________</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + grantorLine(f) + '</div></div>' +
    notaryHTML(f.grantorCapacity, f);
};

export const genTrust = (f,m) => {
  const yr = new Date().getFullYear();
  const isInto = ["T1","T3","T5"].includes(f.trustTransferReason);
  const reasons = {T1:"Transfer into trust by settlor",T2:"Distribution to beneficiary",T3:"Transfer between trusts",T4:"Transfer upon death of settlor — successor trustee",T5:"Refinance — out then back into trust"};
  const granteeLine = isInto
    ? (f.trusteeName||"[TRUSTEE NAME(S)]") + ", as Trustee of the " + (f.trustName||"[TRUST NAME]") + (f.trustDate?", dated "+f.trustDate:"") + (f.isAmended?", as amended":"")
    : (f.beneficiaryName||"[BENEFICIARY NAME]");
  const prop19Labels = {P1:"Parent to Child — Family Home, Primary Residence (R&T §63.2, Prop 19; file BOE-19-P)",P2:"Child to Parent — Family Home, Primary Residence (R&T §63.2, Prop 19; file BOE-19-P)",P3:"Grandparent to Grandchild — Both Parents Deceased (R&T §63.2, Prop 19; file BOE-19-G)"};
  const trusteeForTax = isInto?(f.trusteeName||"[TRUSTEE]"):(f.beneficiaryName||"[GRANTEE]");
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 4pt;">GRANT DEED</div>' +
    '<div style="text-align:center;font-size:11pt;margin-bottom:12pt;">(Transfer ' + (isInto?"Into":"Out of") + ' Trust)</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + trusteeForTax + '<br>' + (f.granteeAddress||"[GRANTEE ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Grantor(s) Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>R&amp;T §11930 — transfer to/from Living Trust<br>Not Pursuant to Sale<br>' + bhjaLine(f) + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"[COUNTY]") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + (f.grantor||"[GRANTOR NAME AND VESTING]") + ',</div>' +
    '<div class="body-text">FOR VALUABLE CONSIDERATION, receipt of which is hereby acknowledged, hereby GRANTS to</div>' +
    '<div class="body-text">' + granteeLine + ',</div>' +
    '<div class="body-text">the real property in the County of ' + (f.county||"[COUNTY]") + ', State of California, described as:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||'SEE EXHIBIT "A" ATTACHED HERETO AND MADE A PART HEREOF') + '</div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '</div>' +
    (f.cityOfProperty?'<div class="body-text">Commonly known as: ' + (f.propertyAddress||"") + ', ' + f.cityOfProperty + ', CA</div>':'') +
    (f.isSettlorDeceased?'<div class="body-text"><strong>NOTE:</strong> ' + (f.settlorName||"The Settlor") + ' died on ' + (f.dateOfDeath||"[DATE OF DEATH]") + '. Executed by Successor Trustee pursuant to trust terms.</div>':'') +
    (f.prop19&&f.prop19!=="P4"&&f.prop19!==""?'<div class="body-text"><strong>CLAIM FOR REASSESSMENT EXCLUSION — Proposition 19</strong><br>Basis: ' + (prop19Labels[f.prop19]||"") + '</div>':'') +
    (f.certify19100?'<div class="body-text">Pursuant to Probate Code §18100.5, the Trustee certifies that the trust has not been revoked, modified, or amended in any manner that would cause the representations herein to be incorrect.</div>':'') +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.grantor||"[TRUSTEE NAME]") + ', as ' + (f.grantorCapacity||"Trustee") + ' of<br>' + (f.capTrustName||f.trustName||"[TRUST NAME]") + ((f.capTrustDate||f.trustDate)?", dated "+(f.capTrustDate||f.trustDate):"") + (f.isAmended?", as amended":"") + '</div></div>' +
    notaryHTML(f.grantorCapacity||"Trustee", f);
};

export const genDOT = (f,m) => {
  const isSecond = f.dotPosition==="second";
  const v = f.trustorVesting==="custom"?f.trustorCustomVesting:f.trustorVesting;
  const yr = new Date().getFullYear();
  const lateChDays = f.lateChargeDays||(m&&m.lateChargeDays)||"10";
  const latePct = f.lateChargePercent||(m&&m.lateChargePercent)||"6";
  const partA = (m&&m.standardCovenants)||"To protect the security of this Deed of Trust, Trustor covenants and agrees as follows:\n\n1. Payment of Principal and Interest. To promptly pay when due the principal of and interest on the Note, including any prepayment charges, late fees, and all other sums secured by this Deed of Trust.\n\n2. Payment of Taxes and Assessments. To pay, prior to delinquency, all taxes, assessments, charges, and liens now or hereafter levied or assessed upon the property.\n\n3. Insurance. To keep the improvements insured against damage by fire and such other hazards as Beneficiar"+(isSecond?"y":"ies")+" may require, in amounts sufficient to cover all sums secured by this Deed of Trust.\n\n4. Defense of Title. To appear in and defend any action or proceeding purporting to affect the security hereof or the rights or powers of Beneficiar"+(isSecond?"y":"ies")+" or Trustee.\n\n5. Maintenance and Repair of Property. To keep the property in good condition and repair; not to remove or demolish any buildings without prior written consent of Beneficiar"+(isSecond?"y":"ies")+".\n\n6. Compliance with Law. To comply with all applicable laws, ordinances, regulations, covenants, conditions, and restrictions affecting the property.\n\n7. Costs, Fees, and Expenses. To pay when due all costs, fees, and expenses of this trust, including reasonable compensation of the Trustee.\n\n8. Further Assurances. Upon written request of Beneficiar"+(isSecond?"y":"ies")+", to make and deliver any instruments reasonably requested to carry out the intent and purpose of this Deed of Trust.";
  const partB = "The following provisions are an integral part of this Deed of Trust:\n\n1. Trustee’s Obligations Upon Payment in Full. Upon written request of Beneficiar"+(isSecond?"y":"ies")+" stating that all sums secured hereby have been paid in full, and upon surrender of this Deed of Trust and the Note to Trustee, Trustee shall reconvey, without warranty, the property then held hereunder.\n\n2. Trustee’s Authority; Acceptance of Trust. Trustee accepts this trust when this Deed of Trust, duly executed and acknowledged, is made a public record as provided by law.\n\n3. Trustee’s Fees and Costs. Trustee shall be entitled to reasonable compensation for all services rendered in the administration of this trust.\n\n4. Substitution of Trustee. Beneficiar"+(isSecond?"y":"ies")+" may substitute a successor Trustee by instrument in writing duly acknowledged and recorded.\n\n5. Authority to Collect Rents, Issues, and Profits. Upon default by Trustor, Beneficiar"+(isSecond?"y":"ies")+" shall have the right to collect the rents, issues, and profits of the property.\n\n6. Acceleration Upon Default; Power of Sale. Upon default, Beneficiar"+(isSecond?"y":"ies")+" may declare all sums secured hereby immediately due and payable and shall cause Trustee to execute a written notice of default and election to sell.\n\n7. Trustee’s Deed Upon Sale. Trustee shall deliver to the purchaser its deed conveying the property, without any covenant or warranty, express or implied.\n\n8. Application of Proceeds of Sale. After deducting all costs, fees, and expenses, Trustee shall apply proceeds to: (a) sums expended hereunder; (b) all other sums secured; and (c) the remainder to persons legally entitled.\n\n9. Inspection of Property. Beneficiar"+(isSecond?"y":"ies")+" may make reasonable entries and inspections of the property upon reasonable prior written notice.\n\n10. Condemnation. The proceeds of any condemnation award are hereby assigned to Beneficiar"+(isSecond?"y":"ies")+".";

  const titleStr = isSecond ? "SECOND DEED OF TRUST" : "FIRST DEED OF TRUST";
  // mailTo handled by recHdr

  // Trustor name - for DOT use trustorName if set, else grantor
  const trustorDisplay = f.trustorName||f.grantor||"[TRUSTOR NAME]";
  // Legal description - use legalDescription field
  const legalDesc = f.legalDescription||"[LEGAL DESCRIPTION]";

  const body = isSecond
    ? '<div class="body-text"><strong>APN:</strong> ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; <strong>County:</strong> ' + (f.county||"_______________") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; <strong>City:</strong> '+f.cityOfProperty:'') + '</div>' +
      '<div class="body-text">THIS SECOND DEED OF TRUST (\"Deed of Trust\"), made as of ______ day of _________________, ' + yr + ', between ' + trustorDisplay + (f.trustorVesting ? ', ' + f.trustorVesting : '') + ' (\"Trustor\"), whose mailing address is ' + (f.trustorAddress||"[TRUSTOR ADDRESS]") + ', and ' + (f.dotTrustee||(m&&m.defaultTrustee)||"[TRUSTEE]") + ', herein called \"Trustee,\" and ' + (f.beneficiaryLenderName||"[BENEFICIARY NAME]") + ', herein called \"Beneficiary\", whose mailing address is ' + (f.beneficiaryLenderAddress||"[BENEFICIARY ADDRESS]") + '.</div>' +
      '<div class="body-text">WITNESSETH: That Trustor irrevocably grants, transfers and conveys to Trustee, in trust, with power of sale, for the benefit of Beneficiary, the land situated in the County of ' + (f.county||"[COUNTY]") + ', City of ' + (f.cityOfProperty||"[CITY]") + ', State of California,</div>' +
      '<div class="body-text">and is described as follows:</div>' +
      '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + legalDesc + '</div>' +
      '<div class="body-text">Commonly known as:<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', California':'') + '<br>APN: ' + (f.apn||"_______________") + '</div>' +
      '<div class="body-text" style="font-weight:bold;">THIS SECOND DEED OF TRUST IS SUBJECT AND SUBORDINATE TO THAT CERTAIN ' + (f.seniorLienType||"DEED OF TRUST") + ' DATED ' + (f.seniorLoanDate||"[DATE]") + ', EXECUTED BY ' + trustorDisplay.toUpperCase() + ', RECORDED ' + (f.seniorLienRecordingDate||"[RECORDING DATE]") + ', AS INSTRUMENT NO. ' + (f.seniorLienRecording||"[INSTRUMENT NO.]") + ' OF THE OFFICIAL RECORDS OF ' + (f.county||"[COUNTY]").toUpperCase() + ' COUNTY, CALIFORNIA, IN FAVOR OF ' + (f.seniorLienHolder||"[SENIOR LENDER]").toUpperCase() + ', AND ANY EXTENSIONS, MODIFICATIONS, RENEWALS, REPLACEMENTS, REFINANCINGS, CONSOLIDATIONS, OR ASSIGNMENTS THEREOF (COLLECTIVELY, THE \"SENIOR DEED OF TRUST\").</div>' +
      '<div class="body-text">TOGETHER WITH the rents, issues, and profits thereof, SUBJECT, HOWEVER, to the right, power, and authority given to and conferred upon Beneficiary by Paragraph 5 of Part B of the provisions incorporated herein by reference to collect and apply such rents, issues, and profits, for the purpose of securing payment of the indebtedness evidenced by that certain Secured Promissory Note dated ' + (f.loanDate||"[NOTE DATE]") + ' (the \"Note\"), executed by Trustor in favor of Beneficiary in the maximum principal amount of ' + (f.loanAmountWords||"[LOAN AMOUNT IN WORDS]") + ' ($' + (f.loanAmount||"_______________") + '), together with all interest, fees, costs, and other amounts payable thereunder, any lawful charge made by Beneficiary for a statement regarding the obligations secured hereby, and the performance of each agreement herein contained.</div>' +
      '<div class="body-text"><strong>PART A - COVENANTS OF TRUSTOR</strong></div>' +
      '<div class="body-text">' + partA + '</div>' +
      '<div class="body-text"><strong>PART B - TRUSTEE AND BENEFICIARY PROVISIONS</strong></div>' +
      '<div class="body-text">' + partB + '</div>' +
      '<div class="body-text">In the event the Property, or any part thereof or interest therein, is sold, conveyed, assigned, transferred, or otherwise alienated by Trustor, whether voluntarily, involuntarily, by operation of law, or otherwise, except as expressly permitted under the Secured Promissory Note or other Loan Documents, then, at the option of Beneficiary and without demand or notice, all obligations secured by this Deed of Trust, regardless of the stated maturity thereof, shall immediately become due and payable.</div>' +
      '<div class="body-text">Beneficiary hereby requests that a copy of any Notice of Default and any Notice of Sale recorded pursuant to this Deed of Trust be mailed to Beneficiary at the address set forth herein, or at such other address as Beneficiary may designate by written notice, in accordance with applicable California law.</div>' +
      '<div class="body-text"><strong>' + (f.beneficiaryLenderName||"[BENEFICIARY NAME]") + '</strong><br><strong>' + (f.beneficiaryLenderAddress||"[BENEFICIARY ADDRESS]") + '</strong></div>' +
      '<div class="body-text" style="font-style:italic;">[Remainder of page left intentionally blank; Signature Page follows]</div>' +
      '<div class="body-text">Executed on __________ day of _________________, ' + yr + ', in _____________________, California.</div>' +
      '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + grantorLine({...f, grantor:trustorDisplay, grantorCapacity:f.trustorCapacity||"LLC Manager / Member"}) + '</div></div>' +
      notaryHTML(f.trustorCapacity||"LLC Manager / Member", f) +
      '<div class="body-text" style="margin-top:16pt;font-style:italic;">Second Deed of Trust for property commonly known as:<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', California':'') + '<br>APN: ' + (f.apn||"_______________") + '</div>'
    : '<div class="body-text">THIS FIRST DEED OF TRUST, made this ______ day of _________________, ' + yr + ', between ' + (f.trustorName||"[TRUSTOR NAME]") + ', whose address is ' + (f.trustorAddress||"[TRUSTOR ADDRESS]") + ', herein called "Trustors", ' + (f.dotTrustee||(m&&m.defaultTrustee)||"[TRUSTEE]") + ', a California corporation, as "Trustee," and ' + (f.beneficiaryLenderName||"[BENEFICIARY / LENDER NAME]") + ', herein called "Beneficiaries",</div>' +
      '<div class="body-text">WITNESSETH: That Trustors irrevocably grant, transfer and assign to the Trustee, in trust, with power of sale, Trustors\' interest in the real property situated in the County of ' + (f.county||"[COUNTY]") + ', State of California, described in "Exhibit A" attached hereto.</div>' +
      '<div class="body-text"><strong>APN(s):</strong> ' + (f.apn||"_______________") + '</div>' +
      '<div class="body-text">TOGETHER WITH the rents, issues, and profits thereof, for the purpose of securing payment of the indebtedness evidenced by a promissory note of even date herewith, executed by Trustors in the principal amount of ' + (f.loanAmountWords||"[LOAN AMOUNT IN WORDS]") + ' ($' + (f.loanAmount||"_______________") + ').</div>' +
      '<div class="body-text"><strong>PART A — COVENANTS OF TRUSTOR</strong></div>' +
      '<div class="body-text">' + partA.replace(/\n/g,'<br>') + '</div>' +
      '<div class="body-text"><strong>LATE CHARGE:</strong> If any payment is not received within ' + lateChDays + ' calendar days after it is due, Trustor shall pay a late charge equal to ' + latePct + '% of the overdue amount.</div>' +
      '<div class="body-text"><strong>PREPAYMENT:</strong> ' + ((m&&m.prepaymentLanguage)||"This Deed of Trust may be prepaid in whole or in part at any time without penalty.") + '</div>' +
      (f.dueOnSale?'<div class="body-text"><strong>DUE ON SALE:</strong> In the event the herein described property is sold, conveyed, or alienated by Trustor, all obligations secured by this instrument shall, at the option of the holder, immediately become due and payable.</div>':'') +
      (f.businessPurpose?'<div class="body-text"><strong>BUSINESS PURPOSE:</strong> Trustor certifies that this loan is for business or commercial purposes and not for personal, family or household purposes (California Civil Code §1799.90 et seq.).</div>':'') +
      (f.customRiders?'<div class="body-text"><strong>ADDITIONAL PROVISIONS:</strong><br>' + f.customRiders.replace(/\n/g,'<br>') + '</div>':'') +
      '<div class="body-text"><strong>PART B — TRUSTEE AND BENEFICIARY PROVISIONS</strong></div>' +
      '<div class="body-text">' + partB.replace(/\n/g,'<br>') + '</div>' +
      (f.requestNOD?'<div class="body-text">Beneficiaries request that a copy of any Notice of Default and Notice of Sale hereunder be mailed to them at their address given herein.</div>':'') +
      '<div class="body-text">' + (f.beneficiaryLenderName||"[BENEFICIARY NAME]") + '<br>' + (f.beneficiaryLenderAddress||"[BENEFICIARY ADDRESS]") + '</div>' +
      '<div class="body-text">Executed this ______ day of _________________, ' + yr + ', at _____________________, California.</div>' +
      '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + grantorLine({...f, grantor:f.trustorName, grantorCapacity:f.trustorCapacity}) + '</div></div>' +
      notaryHTML(f.trustorCapacity||"Individual", f) +
      '<div class="body-text" style="margin-top:16pt;">First Deed of Trust for property commonly known as:<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '<br>APNs: ' + (f.apn||"_______________") + '</div>';

  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">' + titleStr + '</div>' +
    body;
};

export const genQuitclaim = (f,m) => {
  const v = f.granteeVesting==="custom"?f.customVesting:f.granteeVesting;
  const yr = new Date().getFullYear();
  const dttLine = f.exemptFromTax
    ? 'Documentary Transfer Tax: $0<br>' + (f.exemptReason||"R&T §11911")
    : 'Documentary Transfer Tax: $' + (f.dtt||"___________");
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">QUITCLAIM DEED</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.grantee||"[GRANTEE NAME]") + '<br>' + (f.granteeAddress||"[GRANTEE ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Grantor(s) Declare(s):</div>' +
        '<div style="font-size:11pt;">' + dttLine + '<br>Building Homes and Jobs Act Fee: $-0-<br>AB1466 Fee: $-0-<br>GC §27388.1(a)(2)(B)</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"[COUNTY]") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + (f.grantor||"[GRANTOR NAME AND VESTING]") + ',</div>' +
    '<div class="body-text">FOR NO CONSIDERATION, does hereby REMISE, RELEASE, AND QUITCLAIM to</div>' +
    '<div class="body-text">' + (f.grantee||"[GRANTEE NAME]") + ',<br>' + (v||"[VESTING]") + ',</div>' +
    '<div class="body-text">any and all right, title and interest which Grantor now holds or may hereafter acquire in and to the real property in the City of ' + (f.cityOfProperty||"_______________") + ', County of ' + (f.county||"[COUNTY]") + ', State of California, described as:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||'SEE EXHIBIT "A" ATTACHED HERETO AND MADE A PART HEREOF') + '</div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '</div>' +
    '<div class="body-text">Commonly known as:<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.grantor||"[GRANTOR NAME]") + '</div></div>' +
    notaryHTML(f.grantorCapacity, f);
};

export const genInterspousal = (f,m) => {
  const yr = new Date().getFullYear();
  const isTransmutation = ["I4","I5"].includes(f.interspousalReason);
  const reasons = {I1:"Adding spouse to title",I2:"Removing spouse from title (refinance)",I3:"Divorce / marital settlement",I4:"Transmutation — separate to community property",I5:"Transmutation — community to separate property",I6:"Estate planning purposes"};
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 4pt;">INTERSPOUSAL QUITCLAIM DEED</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements As Directed Above</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Grantor(s) Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>This conveyance is solely between spouses and is exempt from Documentary Transfer Tax pursuant to R&amp;T §§11930 and 11911. This is an Interspousal Transfer and not a change in ownership under R&amp;T §63. Not Pursuant to Sale.<br>' + bhjaLine(f) + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"[COUNTY]") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + (f.grantor||"[TRANSFERRING SPOUSE NAME]") + ', Spouse of ' + (f.spouseName||"[RECEIVING SPOUSE NAME]") + ', ' + (f.spouseCurrentVesting||"a married person, as his/her sole and separate property") + ',</div>' +
    '<div class="body-text">FOR NO CONSIDERATION, does hereby REMISE, RELEASE, AND QUITCLAIM any and all of ' + (f.grantorPronoun||"his/her") + ' right, title and interest in and to the real property to</div>' +
    '<div class="body-text">' + (f.spouseName||"[RECEIVING SPOUSE NAME]") + ',<br>' + (f.spouseVesting||"a married person, as his/her sole and separate property") + ',</div>' +
    (isTransmutation?'<div class="body-text"><strong>TRANSMUTATION DECLARATION:</strong> Pursuant to California Family Code §852, this instrument constitutes an express declaration that the character of the above-described property is hereby changed as stated above.</div>':'') +
    '<div class="body-text">the real property in the City of ' + (f.cityOfProperty||"_______________") + ', County of ' + (f.county||"[COUNTY]") + ', State of California, described as:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||'SEE EXHIBIT "A" ATTACHED HERETO AND MADE A PART HEREOF') + '</div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '</div>' +
    '<div class="body-text">Commonly known as:<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.grantor||"[TRANSFERRING SPOUSE NAME]") + '</div></div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.spouseName||"[RECEIVING SPOUSE NAME]") + '</div></div>' +
    notaryHTML("Individual", f);
};

export const genADJT = (f,m) => {
  const yr = new Date().getFullYear();
  const aka = f.deceasedJointTenantAKA ? '<br>(Also known as ' + f.deceasedJointTenantAKA + ')' : '';
  return recHdr(m) +
    mailTaxDeclHTML(f, "$0", '' + bhjaLine(f) + ' — Residential dwelling to owner-occupier') +
    '<hr class="rule">' +
    '<div style="text-align:center;font-size:13pt;font-weight:bold;margin:12pt 0;">AFFIDAVIT OF DEATH OF JOINT TENANT</div>' +
    '<hr class="rule">' +
    '<div class="body-text">I, ' + (f.survivingJointTenant||"[SURVIVING JOINT TENANT NAME]") + ', being duly sworn, say:</div>' +
    '<div class="body-text">I am over the age of 18 years. The decedent described in the attached certified copy of Certificate of Death is the same person as ' + (f.deceasedJointTenant||"[DECEASED JOINT TENANT NAME]") + aka + ', who is named as one of the parties in that certain ' + (f.originalDeedType||"Grant Deed") + ' dated ' + (f.originalDeedDate||"[DEED DATE]") + ', executed by ' + (f.originalDeedGrantor||"[ORIGINAL GRANTOR(S)]") + ', to ' + (f.grantor||"[BOTH JOINT TENANTS AS VESTED]") + ', as Joint Tenants, recorded on ' + (f.originalDeedRecordingDate||"[RECORDING DATE]") + ' as Instrument No. ' + (f.originalDeedRecording||"[RECORDING NUMBER]") + ', in the Official Records of ' + (f.county||"[COUNTY]") + ' County, California, covering the property situated in the ' + (f.cityOfProperty?'City of '+f.cityOfProperty+', ':'') + (f.county||"[COUNTY]") + ' County, California, described as follows:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</div>' +
    '<div class="body-text">Commonly known as ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + (f.apn?'<br>Assessor’s Parcel Number: '+f.apn:'') + '</div>' +
    '<div style="display:table;width:100%;margin:20pt 0;">' +
      '<div style="display:table-cell;width:40%;vertical-align:bottom;">Date: _______________________________</div>' +
      '<div style="display:table-cell;width:60%;vertical-align:bottom;text-align:center;">________________________________________<br>' + (f.survivingJointTenant||"[SURVIVING JOINT TENANT NAME]") + '<br>Affiant</div>' +
    '</div>' +
    juratBoxHTML(f.survivingJointTenant, yr) +
    '<div class="body-text" style="margin-top:16pt;font-weight:bold;">ATTACH CERTIFIED COPY OF DEATH CERTIFICATE</div>';
};

export const genADTR = (f,m) => {
  const yr = new Date().getFullYear();
  const firmName = (m&&m.firmName)||"[FIRM NAME]";
  const firmAddr = (m&&m.firmAddress)||"[FIRM ADDRESS]";
  const firmCity = (m&&m.firmCity)?(m.firmCity+", "+(m.firmState||"CA")+" "+(m.firmZip||"")):"[CITY, STATE ZIP]";
  const successor = f.successorTrusteeName||"[SUCCESSOR TRUSTEE NAME]";
  const trust = f.trustName||"[TRUST NAME]";
  const propAddr = f.propertyAddress||"[PROPERTY ADDRESS]";
  const city = f.cityOfProperty?f.cityOfProperty+", CA":"";
  const deceased = f.deceasedTrusteeName||"[DECEASED TRUSTEE NAME]";
  const legal = f.legalDescription||'SEE EXHIBIT "A" ATTACHED HERETO AND MADE A PART HEREOF';
  return '<div class="rec-hdr">Recording Requested By:</div>' +
    '<div class="rec-hdr">' + firmName + '<br>' + firmAddr + '<br>' + firmCity + '</div>' +
    '<div class="rec-hdr" style="margin-top:8pt">And When Recorded Mail To:</div>' +
    '<div class="rec-hdr">' + firmName + '<br>' + firmAddr + '<br>' + firmCity + '</div>' +
    '<hr class="rec-rule"><div class="rec-space">Space above this line for Recorder\'s use only</div><hr class="rec-rule">' +
    '<table style="width:100%;border-collapse:collapse;margin:12pt 0;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + successor + ', Trustee<br>' + propAddr + '<br>' + city + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>' + bhjaLine(f) + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule"><div class="doc-title">AFFIDAVIT OF DEATH OF TRUSTEE</div><hr class="rule">' +
    '<div class="body-text">' + successor + ', Trustee of the ' + trust + ', of legal age, being first duly sworn, deposes and says:</div>' +
    '<div class="body-text">That ' + deceased + ', the decedent mentioned in the attached certified copy of the Certificate of Death, is the same person as ' + deceased + ' named as one of the parties, to wit, Trustee of the ' + trust + ', in that certain Grant Deed dated ' + (f.trustDate||"[DEED DATE]") + ', recorded as Document Number ' + (f.originalDeedRecording||"[DOCUMENT NUMBER]") + ', of Official Records of the ' + (f.county||"[COUNTY]") + ' County Recorder, covering the real property situated in the County of ' + (f.county||"[COUNTY]") + ', State of California, more fully described as follows:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + legal + '</div>' +
    '<div class="body-text indent">Assessor\'s Parcel Number: ' + (f.apn||"_______________") + '</div>' +
    '<div class="body-text indent">Commonly known as:<br>' + propAddr + '<br>' + city + '</div>' +
    '<div class="body-text">As a result of the death of ' + deceased + ', I, ' + successor + ', am the current acting Trustee of the ' + trust + ' and by this instrument, I accept that office. The ' + trust + ' has not been revoked and was in full force and effect upon the death of ' + deceased + '. The Trust remains in full force and effect.</div>' +
    '<div class="body-text">I declare under penalty of perjury, under the laws of the State of California that the foregoing statements are true and correct.</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + successor + ', Trustee of the<br>' + trust + '</div></div>' +
    juratBoxHTML(successor, yr) ;
};

export const genSSCP = (f,m) => {
  const yr = new Date().getFullYear();
  const sb2Line = f.sscp_isPrimaryResidence
    ? '' + bhjaLine(f) + ' — Residential dwelling to owner-occupier'
    : 'Building Homes and Jobs Act Fee: $___<br>GC §27388.1 (beginning Jan. 1, 2018)';
  return recHdr(m) +
    '<div style="text-align:center;font-size:13pt;font-weight:bold;margin:18pt 0 4pt;">AFFIDAVIT OF SURVIVING SPOUSE</div>' +
    '<div style="text-align:center;font-size:11pt;margin-bottom:4pt;">Succeeding to Title to Community Property</div>' +
    '<div style="text-align:center;font-size:11pt;margin-bottom:12pt;">(Probate Code §13540, State of California)</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.grantor||"[SURVIVING SPOUSE NAME]") + '<br>' + (f.granteeAddress||"[ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>' + sb2Line + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
        venueHTML(f.county, true) +
    '<div class="body-text">' + (f.grantor||"[SURVIVING SPOUSE NAME]") + ', of legal age, being first duly sworn, deposes and says:</div>' +
    '<div class="body-text">That ' + (f.decedentName||"[DECEDENT NAME — AS ON DEATH CERTIFICATE]") + ', the decedent mentioned in the attached Certificate of Death, is the same person as ' + (f.decedentName||"[DECEDENT NAME]") + ' named as one of the parties in that certain Grant Deed dated ' + (f.originalDeedDate||"[DEED DATE]") + ', executed by ' + (f.originalDeedGrantor||"[ORIGINAL GRANTOR]") + ', to ' + (f.decedentName||"[DECEDENT NAME]") + ' and ' + (f.grantor||"[SURVIVING SPOUSE NAME]") + ', husband and wife as community property, recorded as Document Number ' + (f.originalDeedRecording||"[RECORDING NUMBER]") + ' on ' + (f.originalDeedRecordingDate||"[RECORDING DATE]") + ', of Official Records of the ' + (f.county||"[COUNTY]") + ' County Recorder, covering the real property situated in the County of ' + (f.county||"[COUNTY]") + ', State of California, more fully described as follows:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||'SEE EXHIBIT "A" ATTACHED HERETO AND MADE A PART HEREOF') + '</div>' +
    '<div class="body-text indent">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '</div>' +
    '<div class="body-text indent">Commonly known as:<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">That ' + (f.grantor||"[SURVIVING SPOUSE NAME]") + ' was married to ' + (f.decedentName||"[DECEDENT NAME]") + ' at the time of the death of the decedent.</div>' +
    '<div class="body-text">That the above-described property has been at all times since acquisition considered the community property of ' + (f.grantor||"[SURVIVING SPOUSE NAME]") + ' and ' + (f.decedentName||"[DECEDENT NAME]") + '. More than forty (40) days have passed since the death of the above-named decedent, and no notice has been recorded pursuant to Probate Code §13541.</div>' +
    '<div class="body-text">That, with respect to the above-described property, there has not been nor will there be an election filed pursuant to Probate Code §§13502 or 13503 in any probate proceedings in any court of competent jurisdiction.</div>' +
    '<div class="body-text">That the above described property has not passed to someone other than the affiant under the decedent’s will or by intestate succession. That the property has not been disposed of in trust under the decedent’s will. That the decedent’s will does not limit the affiant to a qualified ownership.</div>' +
    '<div class="body-text">That this Affidavit is made for the protection and benefit of the surviving spouse, his/her successors, assigns and personal representatives and all other parties hereafter dealing with or who may acquire an interest in the above described property.</div>' +
    '<div class="body-text">I declare under penalty of perjury, under the laws of the State of California that the foregoing statements are true and correct.</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.grantor||"[SURVIVING SPOUSE NAME]") + ', Declarant</div></div>' +
    juratBoxHTML(f.grantor, yr);
};

export const genTOD = (f,m) => {
  const btypes = {
    "Individual": f.todBeneficiary||"[BENEFICIARY FULL NAME]",
    "Two individuals as joint tenants": (f.todBeneficiary||"[BENEFICIARY 1]") + " and " + (f.todBeneficiary2||"[BENEFICIARY 2]") + ", as joint tenants",
    "Two individuals as tenants in common": (f.todBeneficiary||"[BENEFICIARY 1]") + " and " + (f.todBeneficiary2||"[BENEFICIARY 2]") + ", as tenants in common",
    "Trustee of a trust": (f.todTrusteeName||"[TRUSTEE NAME(S)]") + ", Trustee(s) of the " + (f.todTrustName||"[TRUST NAME]") + ", dated " + (f.todTrustDate||"[TRUST DATE]"),
    "Entity": f.todEntityName||"[ENTITY NAME]",
  };
  return '<div style="font-size:11pt;margin-bottom:14pt;">RECORDING REQUESTED BY AND WHEN RECORDED MAIL DOCUMENT AND TAX STATEMENT TO:<br><br>' +
    (f.todOwner||"[OWNER NAME]") + '<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', CA '+(f.todOwnerZip||""):'') + '</div>' +
    '<hr style="border:none;border-top:1px solid #000;margin:6pt 0 2pt;">' +
    '<div style="text-align:center;font-size:9pt;color:#444;margin-bottom:2pt;">Space above this line for Recorder’s use only</div>' +
    '<hr style="border:none;border-top:1px solid #000;margin:0 0 14pt;">' +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 4pt;">REVOCABLE TRANSFER ON DEATH (TOD) DEED</div>' +
    '<div style="text-align:center;font-size:11pt;margin-bottom:12pt;">(California Probate Code §5642)</div>' +
    '<div class="body-text"><strong>ASSESSOR’S PARCEL NUMBER:</strong> ' + (f.apn||"_______________") + '</div>' +
    '<div class="body-text" style="border:1.5pt solid #000;padding:8pt 10pt;background:#fff8f0;">&#9888; <strong>IMPORTANT NOTICE: THIS DEED MUST BE RECORDED ON OR BEFORE 60 DAYS AFTER THE DATE IT IS NOTARIZED.</strong></div>' +
    '<div class="body-text">This document is exempt from documentary transfer tax under Revenue &amp; Taxation Code §11930.<br>This document is exempt from preliminary change of ownership report under Revenue &amp; Taxation Code §480.3.</div>' +
    '<div class="body-text"><strong>PROPERTY DESCRIPTION:</strong><br><span style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</span></div>' +
    '<div class="body-text"><strong>BENEFICIARY(IES):</strong><br>' + (btypes[f.todBeneficiaryType]||"[BENEFICIARY NAME]") + (f.todBeneficiaryRelationship?'<br>Relationship to transferor: '+f.todBeneficiaryRelationship:'') + '</div>' +
    '<div class="body-text"><strong>TRANSFER ON DEATH</strong><br>I transfer all of my interest in the described property to the named beneficiary(ies) on my death. I may revoke this deed. When recorded, this deed revokes any TOD deed that I made before signing this deed.</div>' +
    '<div style="display:table;width:100%;margin:20pt 0;">' +
      '<div style="display:table-cell;width:40%;vertical-align:bottom;">Date _______________________</div>' +
      '<div style="display:table-cell;width:60%;text-align:center;vertical-align:bottom;">' +
        '<div style="border-bottom:1px solid #000;padding-bottom:2pt;">' + (f.todOwner||"[OWNER NAME — must match title exactly]") + '</div>' +
        '<div style="font-size:10pt;margin-top:3pt;">Signature of Grantor</div>' +
      '</div>' +
    '</div>' +
    notaryHTML("Individual", f) +
    '<div class="body-text" style="margin-top:16pt;border:1px solid #000;padding:8pt 10pt;"><strong>WITNESSES (both must be present simultaneously):</strong><br><br>' +
    'Signature Witness #1 ___________________________________<br>Printed Name Witness #1 ___________________________________<br><br>' +
    'Signature Witness #2 ___________________________________<br>Printed Name Witness #2 ___________________________________</div>' +
    '<div class="body-text" style="font-size:9pt;color:#444;">Rev 1/1/2022</div>';
};

export const genRecon = (f,m) => {
  const yr = new Date().getFullYear();
  if (f.reconType==="sub_and_recon") {
    return recHdr(m) +
      '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">SUBSTITUTION OF TRUSTEE AND FULL RECONVEYANCE</div>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
        '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
          '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
          '<div style="font-size:11pt;">' + (f.grantor||"[TRUSTOR NAME]") + '<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', CA':'') + '</div>' +
        '</td>' +
        '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
          '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Declare(s):</div>' +
          '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>Building Homes and Jobs Act Fee: $0<br>GC §27388.1(a)(2)(B)</div>' +
        '</td>' +
      '</tr></table>' +
      '<hr class="rule">' +
      '<div class="body-text">WHEREAS, ' + (f.grantor||"[TRUSTOR NAME(S)]") + ', TRUSTORS, ' + (f.reconOriginalTrustee||f.reconTrustee||"[ORIGINAL TRUSTEE]") + ', TRUSTEE, and ' + (f.reconBeneficiary||"[ORIGINAL BENEFICIARY]") + ', BENEFICIARY, executed a Deed of Trust dated ' + (f.reconOriginalDeedDate||"[DEED DATE]") + ', recorded on ' + (f.reconRecordingDate||"[RECORDING DATE]") + ' as Document Number ' + (f.reconRecording||"[DOCUMENT NUMBER]") + ' in the Official Records of ' + (f.county||"[COUNTY]") + ' County, California, encumbering the following real property:</div>' +
      '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</div>' +
      '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '<br>Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
      '<div class="body-text">WHEREAS, the undersigned, ' + (f.reconNewTrustee||"[NEW TRUSTEE NAME(S)]") + ', as a result of ' + (f.reconSuccessionReason||"[reason for succession]") + ', are the current acting Trustees.</div>' +
      '<div class="body-text">WHEREAS, the undersigned BENEFICIARY desires to substitute a new TRUSTEE in place of ' + (f.reconOriginalTrustee||"[ORIGINAL TRUSTEE]") + ', and does hereby substitute themselves, ' + (f.reconNewTrustee||"[NEW TRUSTEE NAME(S)]") + ', as TRUSTEE.</div>' +
      '<div class="body-text">AND WHEREAS, the obligation secured by the Deed of Trust has been fully satisfied;</div>' +
      '<div class="body-text">NOW, THEREFORE, the undersigned hereby accepts said appointment as Trustee and does hereby RECONVEY WITHOUT WARRANTY, TO THE PERSONS LEGALLY ENTITLED THERETO, all the estate now held under said Deed of Trust.</div>' +
      '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
      '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.reconNewTrustee||"[NEW TRUSTEE]") + ', as Trustee</div></div>' +
      notaryHTML("Trustee", f);
  }
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">FULL RECONVEYANCE</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.grantor||"[TRUSTOR NAME]") + '<br>' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?'<br>'+f.cityOfProperty+', CA':'') + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>Building Homes and Jobs Act Fee: $0<br>GC §27388.1(a)(2)(B)</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">' + (f.reconTrustee||"[TRUSTEE NAME]") + ', as Trustee under the Deed of Trust described below, having been requested in writing by the holder of the obligation secured by said Deed of Trust to reconvey the real property described herein, and having been paid all sums secured thereby, does hereby RECONVEY, without warranty, to the person or persons legally entitled thereto, all the estate, title, and interest now held by said Trustee under the following described Deed of Trust:</div>' +
    '<div class="body-text"><strong>ORIGINAL DEED OF TRUST:</strong><br>' +
      'Trustor: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (f.grantor||"[TRUSTOR NAME]") + '<br>' +
      'Beneficiary: &nbsp; ' + (f.reconBeneficiary||"[ORIGINAL BENEFICIARY]") + '<br>' +
      'Trustee: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (f.reconTrustee||"[TRUSTEE NAME]") + '<br>' +
      'Dated: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (f.reconOriginalDeedDate||"_______________") + '<br>' +
      'Recorded: &nbsp;&nbsp;&nbsp;&nbsp; ' + (f.reconRecording||"_______________") + ' on ' + (f.reconRecordingDate||"_______________") + '<br>' +
      'County: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (f.county||"_______________") + ', California<br>' +
      'Loan Amount: &nbsp; $' + (f.reconLoanAmount||"_______________") + '</div>' +
    '<div class="body-text"><strong>PROPERTY DESCRIPTION:</strong><br><span style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</span></div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '<br>Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text"><strong>THE OBLIGATION SECURED BY SAID DEED OF TRUST HAS BEEN FULLY PAID AND SATISFIED.</strong></div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.reconTrustee||"[TRUSTEE NAME]") + ', as Trustee</div></div>' +
    notaryHTML("Corporate Officer", f);
};

export const genEasement = (f,m) => {
  const yr = new Date().getFullYear();
  const v = f.granteeVesting==="custom"?f.customVesting:f.granteeVesting;
  const et = {ingress_egress:"an easement for ingress and egress",utility:"an easement for utility purposes",access:"an access easement",appurtenant:"an appurtenant easement",drainage:"an easement for drainage",solar:"a solar access easement (Civil Code §801.5)",conservation:"a conservation easement (Civil Code §815 et seq.)",other:f.easementTypeCustom||"[DESCRIBE EASEMENT]"};
  const dttLine = f.exemptFromTax
    ? 'Documentary Transfer Tax: $0<br>' + (f.exemptReason||"R&T §11911")
    : 'Documentary Transfer Tax: $' + (f.dtt||"___________");
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">EASEMENT DEED</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.grantee||"[GRANTEE NAME]") + '<br>' + (f.granteeAddress||"[GRANTEE ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Grantor(s) Declare(s):</div>' +
        '<div style="font-size:11pt;">' + dttLine + '<br>Building Homes and Jobs Act Fee: $-0-<br>AB1466 Fee: $-0-<br>GC §27388.1(a)(2)(B)</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"[COUNTY]") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + (f.grantor||"[GRANTOR NAME AND VESTING]") + ',</div>' +
    '<div class="body-text">hereby GRANTS to ' + (f.grantee||"[GRANTEE NAME]") + ', ' + (v||"[VESTING]") + ',</div>' +
    '<div class="body-text">' + (et[f.easementType]||et.other) + ' over, under, and across the following described real property in the County of ' + (f.county||"[COUNTY]") + ', State of California:</div>' +
    '<div class="body-text"><strong>SERVIENT TENEMENT:</strong><br><span style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</span></div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '<br>Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
    (f.dominantDescription?'<div class="body-text"><strong>DOMINANT TENEMENT:</strong><br>' + f.dominantDescription + '</div>':'') +
    '<div class="body-text"><strong>EASEMENT DESCRIPTION:</strong><br>' + (f.easementDescription||"[DESCRIBE SPECIFIC LOCATION, DIMENSIONS, AND PURPOSE]") + '</div>' +
    (f.easementWidth?'<div class="body-text">Width of easement: ' + f.easementWidth + ' feet</div>':'') +
    (f.easementTerms?'<div class="body-text"><strong>TERMS AND CONDITIONS:</strong><br>' + f.easementTerms + '</div>':'') +
    '<div class="body-text">This easement is ' + (f.easementExclusive?"exclusive":"non-exclusive") + ' and shall run with the land.</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.grantor||"[GRANTOR NAME]") + '</div></div>' +
    notaryHTML(f.grantorCapacity||"Individual", f);
};

export const genDOTMod = (f,m) => {
  const yr = new Date().getFullYear();
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">MODIFICATION OF DEED OF TRUST</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.beneficiaryLenderName||"[BENEFICIARY NAME]") + '<br>' + (f.beneficiaryLenderAddress||"[BENEFICIARY ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $0<br>' + bhjaLine(f) + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">THIS MODIFICATION OF DEED OF TRUST is entered into as of ______________________, ' + yr + ', by and between:</div>' +
    '<div class="body-text">' +
      'TRUSTOR: &nbsp;&nbsp;&nbsp;&nbsp; ' + (f.trustorName||"[TRUSTOR NAME]") + ', ' + (f.trustorVesting==="custom"?f.trustorCustomVesting:f.trustorVesting||"[VESTING]") + '<br>' +
      'TRUSTEE: &nbsp;&nbsp;&nbsp;&nbsp; ' + (f.dotTrustee||(m&&m.defaultTrustee)||"[TRUSTEE]") + '<br>' +
      'BENEFICIARY: ' + (f.beneficiaryLenderName||"[BENEFICIARY / LENDER NAME]") + '<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + (f.beneficiaryLenderAddress||"[BENEFICIARY ADDRESS]") + '</div>' +
    '<div class="body-text"><strong>RECITALS:</strong></div>' +
    '<div class="body-text">A. Trustor executed that certain ' + (f.dotModPosition==="second"?"Second":"First") + ' Deed of Trust dated ' + (f.reconOriginalDeedDate||"[ORIGINAL DATE]") + ', recorded on ' + (f.reconRecordingDate||"[RECORDING DATE]") + ' as Document Number ' + (f.reconRecording||"[DOCUMENT NUMBER]") + ' in the Official Records of ' + (f.county||"[COUNTY]") + ' County, California, encumbering the real property described as:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '<br>Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">B. Original principal amount: $' + (f.reconLoanAmount||"[ORIGINAL AMOUNT]") + '</div>' +
    '<div class="body-text"><strong>AGREEMENT:</strong></div>' +
    '<div class="body-text"><strong>1. MODIFICATIONS:</strong><br>' + (f.dotModTerms||"[DESCRIBE SPECIFIC MODIFICATIONS]").replace(/\n/g,'<br>') + '</div>' +
    (f.dotModNewAmount?'<div class="body-text"><strong>2. MODIFIED LOAN AMOUNT:</strong> $' + f.dotModNewAmount + '</div>':'') +
    (f.dotModNewMaturity?'<div class="body-text"><strong>3. MODIFIED MATURITY DATE:</strong> ' + f.dotModNewMaturity + '</div>':'') +
    (f.dotModNewRate?'<div class="body-text"><strong>4. MODIFIED INTEREST RATE:</strong> ' + f.dotModNewRate + '% per annum</div>':'') +
    '<div class="body-text"><strong>' + (f.dotModNewAmount||f.dotModNewMaturity||f.dotModNewRate?'5':'2') + '. RATIFICATION:</strong> Except as modified herein, all terms of the Original Deed of Trust remain in full force and effect.</div>' +
    '<div class="body-text"><strong>TRUSTOR:</strong></div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.trustorName||"[TRUSTOR NAME]") + '</div></div>' +
    '<div class="body-text" style="margin-top:20pt;"><strong>BENEFICIARY:</strong></div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.beneficiaryLenderName||"[BENEFICIARY NAME]") + '</div></div>' +
    notaryHTML(f.trustorCapacity||"Individual", f);
};

export const genTrusteeDeed = (f,m) => {
  const yr = new Date().getFullYear();
  const v = f.granteeVesting==="custom"?f.customVesting:f.granteeVesting;
  return recHdr(m) +
    mailTaxDeclHTML(f, (f.exemptFromTax?('EXEMPT — '+(f.exemptReason||"see deed")):('$'+(f.dtt||"_______________"))), 'Building Homes and Jobs Act Fee: $'+(f.sb2Fee||"_______")) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">TRUSTEE’S DEED UPON SALE</div>' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"_______________") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + (f.reconTrustee||"[TRUSTEE NAME]") + ' (hereinafter "Grantor"), as Trustee under that certain Deed of Trust dated ' + (f.reconOriginalDeedDate||"[DEED DATE]") + ', executed by ' + (f.grantor||"[TRUSTOR / BORROWER NAME]") + ', recorded on ' + (f.reconRecordingDate||"[RECORDING DATE]") + ' as Document Number ' + (f.reconRecording||"[DOCUMENT NUMBER]") + ' in the Official Records of ' + (f.county||"[COUNTY]") + ' County, California, does hereby GRANT AND CONVEY, but without covenant or warranty, to:</div>' +
    '<div class="body-text">' + (f.grantee||"[PURCHASER NAME]") + ', ' + (v||"[VESTING]") + ',</div>' +
    '<div class="body-text">all right, title and interest in and to the real property described as follows:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '<br>Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">This conveyance is made pursuant to California Civil Code §2924 et seq.</div>' +
    '<div class="body-text"><strong>TRUSTEE’S STATEMENTS:</strong><br>' +
      '1. The grantee is the purchaser at a Trustee’s Sale conducted on ' + (f.trusteeSaleDate||"[SALE DATE]") + ', at ' + (f.trusteeSaleLocation||"[SALE LOCATION]") + '.<br>' +
      '2. Total unpaid debt at time of sale: $' + (f.reconLoanAmount||"[UNPAID BALANCE]") + '<br>' +
      '3. Amount bid by grantee: $' + (f.trusteeSalePrice||"[SALE PRICE]") + '</div>' +
    '<div class="body-text">Documentary Transfer Tax: ' + (f.exemptFromTax?'EXEMPT — '+(f.exemptReason||"R&T §11922"):'$'+(f.dtt||"___________")) + '<br>Building Homes and Jobs Act Fee: $-0-</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.reconTrustee||"[TRUSTEE NAME]") + ', as Trustee</div></div>' +
    notaryHTML("Corporate Officer", f);
};

export const genSheriff = (f,m) => {
  const yr = new Date().getFullYear();
  const v = f.granteeVesting==="custom"?f.customVesting:f.granteeVesting;
  const redemption = f.sheriffRedemption==="3month"
    ? 'The property was sold subject to the right of redemption. The three-month redemption period provided by Code of Civil Procedure section 729.030(a) has expired without redemption of the property.'
    : f.sheriffRedemption==="1year"
    ? 'The property was sold subject to the right of redemption. The one-year redemption period provided by Code of Civil Procedure section 729.030(b) has expired without redemption of the property.'
    : f.sheriffRedemption==="none"
    ? 'The sale was not subject to any right of redemption.'
    : '[REDEMPTION STATUS REQUIRED — state either: the sale was not subject to any right of redemption; OR the property was sold subject to the right of redemption and the applicable three-month (CCP 729.030(a)) or one-year (CCP 729.030(b)) redemption period has expired without redemption.]';
  return recHdr(m) +
    mailTaxDeclHTML(f, (f.exemptFromTax?('EXEMPT — '+(f.exemptReason||"see deed")):('$'+(f.dtt||"_______________"))), 'Building Homes and Jobs Act Fee: $'+(f.sb2Fee||"_______")) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 12pt;">SHERIFF’S DEED</div>' +
    '<div class="body-text">APN: ' + (f.apn||"_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county||"_______________") + (f.cityOfProperty?' &nbsp;&nbsp;&nbsp; City: '+f.cityOfProperty:'') + '</div>' +
    '<div class="body-text">' + (f.sheriffName||"[SHERIFF’S NAME]") + ', Sheriff of ' + (f.county||"[COUNTY]") + ' County, California, pursuant to a Writ of Execution/Sale issued out of the ' + (f.courtName||"[COURT NAME]") + ', Case Number ' + (f.caseNumber||"[CASE NUMBER]") + ', entitled ' + (f.caseName||"[PLAINTIFF] v. [DEFENDANT]") + ', pursuant to a Judgment entered on ' + (f.judgmentDate||"[JUDGMENT DATE]") + ', in favor of ' + (f.judgmentCreditor||"[JUDGMENT CREDITOR]") + ' and against ' + (f.judgmentDebtor||"[JUDGMENT DEBTOR]") + ', does hereby GRANT AND CONVEY to:</div>' +
    '<div class="body-text">' + (f.grantee||"[PURCHASER NAME]") + ', ' + (v||"[VESTING]") + ',</div>' +
    '<div class="body-text">all right, title, and interest of ' + (f.judgmentDebtor||"[JUDGMENT DEBTOR]") + ' in and to the following described real property in the County of ' + (f.county||"[COUNTY]") + ', State of California:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription||"[LEGAL DESCRIPTION]") + '</div>' +
    '<div class="body-text">Assessor’s Parcel Number: ' + (f.apn||"_______________") + '<br>Commonly known as: ' + (f.propertyAddress||"[PROPERTY ADDRESS]") + (f.cityOfProperty?', '+f.cityOfProperty+', CA':'') + '</div>' +
    '<div class="body-text">The above-described property was sold at public auction on ' + (f.trusteeSaleDate||"[SALE DATE]") + ', at ' + (f.trusteeSaleLocation||"[SALE LOCATION]") + ', pursuant to said Writ and the Notice of Sale duly given as required by law. At the sale, ' + (f.grantee||"[PURCHASER NAME]") + ' was the highest bidder and became the purchaser of the property for the sum of $' + (f.trusteeSalePrice||"[BID AMOUNT]") + ', which sum was paid.</div>' +
    '<div class="body-text">' + redemption + '</div>' +
    '<div class="body-text">This deed is made without covenant or warranty, express or implied, and conveys only such right, title, and interest as the judgment debtor, ' + (f.judgmentDebtor||"[JUDGMENT DEBTOR]") + ', held at the time of levy.</div>' +
    '<div class="body-text">Executed this __________ day of ______________________, ' + yr + ', at _____________________, California.</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + (f.sheriffName||"[SHERIFF’S NAME]") + '<br>Sheriff, ' + (f.county||"[COUNTY]") + ' County, California</div></div>' +
    notaryHTML("Sheriff / Public Official", f);
};

export const genPCOR = (docType, f, m, pf={}) => {
  const yr = new Date().getFullYear();
  const reason = getPCORReason(docType, f);
  const isSale = !f.exemptFromTax && docType==="grant";
  const isSpouseDeath = docType==="sscp" || (docType==="adjt" && f.survivingSpouse);
  const isTrustTransfer = docType==="granttrust";
  const isInterspousal = docType==="interspousal";
  const buyer = pf.buyerName||f.grantee||f.spouseName||f.survivingJointTenant||f.grantor||"";
  const seller = f.grantor||"";
  const addr = f.propertyAddress||"";
  const city = f.cityOfProperty||"";
  const county = f.county||"";
  const apn = f.apn||"";

  // Part 1 checkboxes
  const p1a = pf.p1a||(isSpouseDeath||isInterspousal ? "YES" : "NO");
  const p1d = pf.p1d||(docType==="adjt" ? "YES" : "NO");
  const p1l1 = pf.p1l1||((isTrustTransfer&&["T1","T5"].includes(f.trustTransferReason)) ? "YES" : "NO");
  const p1l2 = pf.p1l2||((isTrustTransfer&&["T2"].includes(f.trustTransferReason)) ? "YES" : "NO");
  const p1l = (p1l1==="YES"||p1l2==="YES") ? "YES" : "NO";
  const p1n = pf.p1n||((isTrustTransfer) ? "YES" : "NO");
  const p1c = pf.p1c||"NO";
  const p1m = pf.p1m||"NO";
  const p1o = pf.p1o||"NO";
  const p1p = pf.p1p||"NO";
  const p1q = pf.p1q||(reason.box==="other"?"YES":"NO");

  // Part 2 transfer type
  let transferType = pf.transferType||"Other";
  if (!pf.transferType && isSale) transferType = "Purchase";
  if (!pf.transferType && (docType==="adjt"||docType==="sscp")) transferType = "Inheritance";
  if (!pf.transferType && (docType==="trustees"||docType==="sheriff")) transferType = "Foreclosure";

  const cb = (val) => val==="YES"
    ? `<span style="display:inline-block;width:14px;height:14px;border:1px solid #000;background:#000;color:#fff;font-size:9px;text-align:center;line-height:14px;margin-right:4px;">✓</span>`
    : `<span style="display:inline-block;width:14px;height:14px;border:1px solid #000;margin-right:4px;"></span>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>PCOR - ${apn||"draft"}</title>
<style>
  @page { size: 8.5in 11in; margin: 0.5in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: #fff; }
  .page { max-width: 7.5in; margin: 0 auto; padding: 8px; }
  .title-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
  .title-left { flex: 1; }
  .title-right { width: 120px; border: 1px solid #000; padding: 4px; font-size: 7pt; text-align: center; }
  h1 { font-size: 13pt; font-weight: bold; margin-bottom: 4px; }
  .subtitle { font-size: 8pt; line-height: 1.5; }
  .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #000; margin-bottom: 4px; }
  .header-left { border-right: 1px solid #000; padding: 4px; min-height: 80px; }
  .header-right { padding: 4px; }
  .field-label { font-size: 7pt; font-style: italic; color: #333; display: block; margin-bottom: 1px; }
  .field-value { font-size: 9pt; border-bottom: 1px solid #000; min-height: 16px; padding: 1px 2px; margin-bottom: 6px; }
  .full-row { border: 1px solid #000; border-top: none; padding: 4px; margin-bottom: 4px; }
  .yn-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; padding: 3px 0; border-bottom: 1px solid #eee; }
  .yn-boxes { display: flex; gap: 4px; align-items: center; flex-shrink: 0; white-space: nowrap; }
  .yn-label { font-size: 8pt; flex: 1; line-height: 1.4; }
  .yn-label em { font-style: italic; }
  .part-header { background: #000; color: #fff; padding: 3px 6px; font-size: 9pt; font-weight: bold; margin: 6px 0 4px; display: flex; justify-content: space-between; align-items: center; }
  .part-sub { font-size: 8pt; font-weight: normal; font-style: italic; }
  .cb-row { display: flex; align-items: flex-start; gap: 6px; padding: 2px 0; font-size: 8pt; line-height: 1.4; }
  .cb-label { flex: 1; }
  .cb-label em { font-style: italic; }
  .indent { margin-left: 20px; }
  .sig-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; margin-top: 6px; }
  .sig-grid2 { display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 8px; margin-top: 6px; }
  .sig-field { border-bottom: 1px solid #000; min-height: 20px; margin-bottom: 2px; }
  .sig-label { font-size: 7pt; }
  .notice { font-size: 7.5pt; border: 1px solid #000; padding: 4px 6px; margin: 6px 0; line-height: 1.5; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .p2-checks { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 4px 0; font-size: 8pt; }
  .p2-check { display: flex; align-items: center; gap: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head><body><div class="page">

<div class="title-row">
  <div class="title-left">
    <div style="font-size:7pt;margin-bottom:2px;">BOE-502-A (P1) REV. 18 (05-23) ASSR-70 (REV. 5-24)</div>
    <h1>PRELIMINARY CHANGE OF OWNERSHIP REPORT</h1>
    <div class="subtitle">To be completed by the transferee (buyer) prior to a transfer of subject property, in accordance with section 480.3 of the Revenue and Taxation Code. A Preliminary Change of Ownership Report must be <strong>filed with each conveyance in the County Recorder’s office for the county where the property is located.</strong></div>
  </div>
  <div class="title-right">
    <div style="font-size:7pt;font-weight:bold;margin-bottom:4px;">FOR RECORDER’S USE ONLY</div>
    <div style="font-size:7pt;">DOCUMENT NO. / RECORDING DATE</div>
    <div style="height:40px;border-top:1px solid #000;margin-top:4px;"></div>
  </div>
</div>

<div class="header-grid">
  <div class="header-left">
    <span class="field-label">NAME AND MAILING ADDRESS OF BUYER/TRANSFEREE<br><em>(Make necessary corrections to the printed name and mailing address)</em></span>
    <div class="field-value">${buyer}</div>
    <div class="field-value">${f.granteeAddress||""}</div>
    <div class="field-value"></div>
  </div>
  <div class="header-right">
    <span class="field-label">ASSESSOR’S PARCEL NUMBER</span>
    <div class="field-value">${apn}</div>
    <span class="field-label">SELLER/TRANSFEROR</span>
    <div class="field-value">${seller}</div>
    <span class="field-label">BUYER’S DAYTIME TELEPHONE NUMBER</span>
    <div class="field-value">( )</div>
    <span class="field-label">BUYER’S EMAIL ADDRESS</span>
    <div class="field-value"></div>
  </div>
</div>

<div class="full-row">
  <span class="field-label">STREET ADDRESS OR PHYSICAL LOCATION OF REAL PROPERTY</span>
  <div class="field-value">${addr}${city?", "+city:""}${county?", "+county+" County, CA":""}</div>
</div>

<div style="border:1px solid #000;border-top:none;padding:4px;margin-bottom:4px;">
  <div class="yn-row">
    <div class="yn-boxes">${cb(f.sscp_isPrimaryResidence?"YES":"NO")} YES &nbsp; ${cb(!f.sscp_isPrimaryResidence?"YES":"NO")} NO</div>
    <div class="yn-label">This property is intended as my principal residence. If YES, please indicate the date of occupancy or intended occupancy.
      <span style="margin-left:8px;font-size:7pt;">MO _____ DAY _____ YEAR _____</span>
    </div>
  </div>
  <div class="yn-row" style="border-bottom:none;">
    <div class="yn-boxes">${cb("NO")} YES &nbsp; ${cb("YES")} NO</div>
    <div class="yn-label">Are you a 100% rated disabled veteran who was compensated at 100% by the Department of Veterans Affairs or an unmarried surviving spouse of a 100% rated disabled veteran?</div>
  </div>
</div>

<div style="border:1px solid #000;border-top:none;padding:4px;margin-bottom:6px;">
  <div style="display:grid;grid-template-columns:1fr 2fr 1fr 1fr;gap:4px;align-items:end;">
    <div><span class="field-label">MAIL PROPERTY TAX INFORMATION TO (NAME)</span><div class="field-value">${buyer}</div></div>
    <div><span class="field-label">MAIL PROPERTY TAX INFORMATION TO (ADDRESS)</span><div class="field-value">${f.granteeAddress||""}</div></div>
    <div><span class="field-label">CITY</span><div class="field-value">${city}</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
      <div><span class="field-label">STATE</span><div class="field-value">CA</div></div>
      <div><span class="field-label">ZIP</span><div class="field-value"></div></div>
    </div>
  </div>
</div>

<div class="part-header">PART 1. TRANSFER INFORMATION <span class="part-sub">Please complete all statements.</span></div>
<div style="font-size:7.5pt;margin-bottom:4px;font-style:italic;">This section contains possible exclusions from reassessment for certain types of transfers.</div>

<div style="display:grid;grid-template-columns:40px 1fr;gap:0;font-size:8pt;">
  <div style="font-weight:bold;padding:2px 4px;">YES &nbsp; NO</div><div></div>

  <div style="padding:2px 4px;">${cb(p1a)} ${cb(p1a==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">A. This transfer is solely between spouses <em>(addition or removal of a spouse, death of a spouse, divorce settlement, etc.)</em>.</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">B. This transfer is solely between domestic partners currently registered with the California Secretary of State <em>(addition or removal of a partner, death of a partner, termination settlement, etc.)</em>.</div>

  <div style="padding:2px 4px;">${cb(p1c)} ${cb(p1c==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">C. This is a transfer: ${cb(pf.p1cRel==="parentchild"?"YES":"NO")} between parent(s) and child(ren) &nbsp; ${cb(pf.p1cRel==="grandparent"?"YES":"NO")} between grandparent(s) and grandchild(ren).<br>
  <span class="indent">Was this the transferor/grantor’s principal residence? ${cb(pf.p1cPrimary==="YES"?"YES":"NO")} YES ${cb(pf.p1cPrimary==="NO"?"YES":"NO")} NO</span><br>
  <span class="indent">Is this a family farm? ${cb(pf.p1cFarm==="YES"?"YES":"NO")} YES ${cb(pf.p1cFarm==="NO"?"YES":"NO")} NO</span></div>

  <div style="padding:2px 4px;">${cb(p1d)} ${cb(p1d==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">* D. This transfer is the result of a cotenant’s death. Date of death: ${pf.inheritanceDate||f.dateOfDeathJT||"___________________"}</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">* E. This transaction is to replace a principal residence owned by a person 55 years of age or older.</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">* F. This transaction is to replace a principal residence by a person who is severely disabled.</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">* G. This transaction is to replace a principal residence substantially damaged or destroyed by a wildfire or natural disaster for which the Governor proclaimed a state of emergency.</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">H. This transaction is only a correction of the name(s) of the person(s) holding title to the property. If YES, please explain: _______________</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">I. The recorded document creates, terminates, or reconveys a lender’s interest in the property.</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">J. This transaction is recorded only as a requirement for financing purposes or to create, terminate, or reconvey a security interest <em>(e.g., cosigner)</em>. If YES, please explain: _______________</div>

  <div style="padding:2px 4px;">${cb("NO")} ${cb("YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">K. The recorded document substitutes a trustee of a trust, mortgage, or other similar document.</div>

  <div style="padding:2px 4px;">${cb(p1l)} ${cb(p1l==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">L. This is a transfer of property:<br>
  <span class="indent">1. to/from a revocable trust that may be revoked by the transferor and is for the benefit of ${cb(p1l1)} the transferor, and/or ${cb("NO")} the transferor’s spouse ${cb("NO")} registered domestic partner.</span><br>
  <span class="indent">2. to/from an irrevocable trust for the benefit of the ${cb(p1l2)} creator/grantor/trustor and/or ${cb("NO")} grantor’s/trustor’s spouse ${cb("NO")} grantor’s/trustor’s registered domestic partner.</span></div>

  <div style="padding:2px 4px;">${cb(p1m)} ${cb(p1m==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">M. This property is subject to a lease with a remaining lease term of 35 years or more including written options.</div>

  <div style="padding:2px 4px;">${cb(p1n)} ${cb(p1n==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">N. This is a transfer between parties in which proportional interests of the transferor(s) and transferee(s) in each and every parcel being transferred remain exactly the same after the transfer.</div>

  <div style="padding:2px 4px;">${cb(p1o)} ${cb(p1o==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">O. This is a transfer subject to subsidized low-income housing requirements with governmentally imposed restrictions.</div>

  <div style="padding:2px 4px;">${cb(p1p)} ${cb(p1p==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;border-bottom:1px solid #eee;">* P. This transfer is to the first purchaser of a new building containing a ${cb(pf.p1pType==="leased"?"YES":"NO")} leased ${cb(pf.p1pType==="owned"?"YES":"NO")} owned active solar energy system.</div>

  <div style="padding:2px 4px;">${cb(p1q)} ${cb(p1q==="YES"?"NO":"YES")}</div>
  <div class="cb-label" style="padding:2px 0;">Q. Other. This transfer is to: ${p1q==="YES"?(pf.p1qDesc||reason.desc||""):""}</div>
</div>

<div style="font-size:7.5pt;margin:4px 0;font-style:italic;">* Please refer to the instructions for Part 1.</div>
<div style="font-size:7.5pt;font-weight:bold;margin-bottom:6px;">Please provide any other information that will help the Assessor understand the nature of the transfer.</div>
<div style="text-align:center;border:1px solid #000;padding:3px;font-size:8pt;font-weight:bold;margin-bottom:8px;">THIS DOCUMENT IS NOT SUBJECT TO PUBLIC INSPECTION</div>

<div style="font-size:7pt;margin-bottom:2px;">BOE-502-A (P2) REV. 18 (05-23) ASSR-70 (REV. 5-24)</div>
<div class="part-header">PART 2. OTHER TRANSFER INFORMATION <span class="part-sub">Check and complete as applicable.</span></div>

<div style="margin-bottom:4px;">
  <div style="font-size:8pt;font-weight:bold;margin-bottom:4px;">A. Date of transfer, if other than recording date: ___________________________</div>
  <div style="font-size:8pt;font-weight:bold;margin-bottom:4px;">B. Type of transfer:</div>
  <div class="p2-checks">
    <div class="p2-check">${cb(transferType==="Purchase")} Purchase</div>
    <div class="p2-check">${cb(transferType==="Foreclosure")} Foreclosure</div>
    <div class="p2-check">${cb("NO")} Gift</div>
    <div class="p2-check">${cb("NO")} Merger, stock, or partnership acquisition (Form BOE-100-B)</div>
    <div class="p2-check">${cb("NO")} Contract of sale. Date of contract: ___________</div>
    <div class="p2-check">${cb(transferType==="Inheritance")} Inheritance. Date of death: ${f.dateOfDeathJT||f.dateOfDeath||"___________"}</div>
    <div class="p2-check">${cb("NO")} Sale/leaseback. Date lease began: ___________</div>
    <div class="p2-check">${cb("NO")} Trade or exchange</div>
    <div class="p2-check">${cb("NO")} Creation of a lease &nbsp; ${cb("NO")} Assignment of a lease &nbsp; ${cb("NO")} Termination of a lease</div>
    <div class="p2-check">${cb(transferType==="Other")} Other. Please explain: ${transferType==="Other"?(f.exemptReason||""):""}</div>
  </div>
  <div style="font-size:8pt;margin-top:4px;">C. Only a partial interest in the property was transferred. ${cb("NO")} YES &nbsp; ${cb("YES")} NO &nbsp; If YES, indicate the percentage transferred: _______% </div>
</div>

<div class="part-header">PART 3. PURCHASE PRICE AND TERMS OF SALE <span class="part-sub">Check and complete as applicable.</span></div>
<div style="font-size:8pt;padding:4px 0;color:#444;font-style:italic;">Complete only if this was a purchase transaction. For transfers exempt from documentary transfer tax, skip this section.</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:8pt;margin-bottom:4px;">
  <div><span class="field-label">A. Total purchase price</span><div class="field-value">${isSale?(f.salePrice||"$_______________"):"N/A"}</div></div>
  <div><span class="field-label">B. Cash down payment or value of trade or exchange</span><div class="field-value">${isSale?"$_______________":"N/A"}</div></div>
</div>

<div class="part-header">PART 4. PROPERTY INFORMATION <span class="part-sub">Check and complete as applicable.</span></div>
<div style="font-size:8pt;padding:4px 0;">
  <div style="margin-bottom:4px;font-weight:bold;">A. Type of property transferred:</div>
  <div class="p2-checks">
    <div class="p2-check">${cb("YES")} Single-family residence</div>
    <div class="p2-check">${cb("NO")} Co-op/Own-your-own</div>
    <div class="p2-check">${cb("NO")} Manufactured home</div>
    <div class="p2-check">${cb("NO")} Multiple-family residence</div>
    <div class="p2-check">${cb("NO")} Condominium</div>
    <div class="p2-check">${cb("NO")} Unimproved lot</div>
    <div class="p2-check">${cb("NO")} Timeshare</div>
    <div class="p2-check">${cb("NO")} Commercial/Industrial</div>
    <div class="p2-check">${cb("NO")} Other: _______________</div>
  </div>
  <div class="yn-row" style="margin-top:4px;">
    <div class="yn-boxes">${cb("NO")} YES &nbsp; ${cb("YES")} NO</div>
    <div class="yn-label">B. Personal/business property, or incentives, provided by seller to buyer are included in the purchase price.</div>
  </div>
  <div class="yn-row">
    <div class="yn-boxes">${cb("NO")} YES &nbsp; ${cb("YES")} NO</div>
    <div class="yn-label">C. A manufactured home is included in the purchase price.</div>
  </div>
  <div class="yn-row">
    <div class="yn-boxes">${cb("NO")} YES &nbsp; ${cb("YES")} NO</div>
    <div class="yn-label">D. The property produces rental or other income.</div>
  </div>
  <div style="margin-top:4px;">E. The condition of the property at the time of sale was: ${cb("YES")} Good &nbsp; ${cb("NO")} Average &nbsp; ${cb("NO")} Fair &nbsp; ${cb("NO")} Poor</div>
</div>

<div style="border-top:2px solid #000;margin-top:8px;padding-top:6px;">
  <div style="font-size:8.5pt;font-weight:bold;margin-bottom:6px;">CERTIFICATION</div>
  <div style="font-size:7.5pt;margin-bottom:6px;">I certify (or declare) that the foregoing and all information hereon, including any accompanying statements or documents, is true and correct to the best of my knowledge and belief.</div>
  <div class="sig-grid">
    <div><div class="sig-field"></div><div class="sig-label">SIGNATURE OF BUYER/TRANSFEREE OR CORPORATE OFFICER</div></div>
    <div><div class="sig-field"></div><div class="sig-label">DATE</div></div>
    <div><div class="sig-field"></div><div class="sig-label">TELEPHONE ( )</div></div>
  </div>
  <div class="sig-grid2" style="margin-top:8px;">
    <div><div class="sig-field">${buyer}</div><div class="sig-label">NAME OF BUYER/TRANSFEREE (PLEASE PRINT)</div></div>
    <div><div class="sig-field"></div><div class="sig-label">TITLE</div></div>
    <div><div class="sig-field"></div><div class="sig-label">EMAIL ADDRESS</div></div>
  </div>
  <div style="font-size:7.5pt;margin-top:6px;font-style:italic;">The Assessor’s office may contact you for additional information regarding this transaction.</div>
</div>

</div></body></html>`;
};


// Recording cover page for a certified court order (Probate Code 850 orders, orders
// confirming trust assets, and other orders recorded to affect title). Dottie does not
// draft the order itself; this is the cover that rides on top of the certified copy.
export function genCourtOrder(f, m) {
  const apns = [f.apn, ...(f.additionalApns ? String(f.additionalApns).split(/[,\n]/) : [])]
    .map(a => (a || "").trim()).filter(Boolean);
  const title = (f.orderTitle || "[DOCUMENT TITLE OF THE COURT ORDER]").toUpperCase();
  return recHdr(m) +
    '<div style="text-align:center;font-size:11pt;margin:16pt 0 4pt;text-decoration:underline;">DOCUMENT TITLE:</div>' +
    '<div style="text-align:center;font-size:12pt;font-weight:bold;margin:0 0 14pt;line-height:1.5;">' + title + '</div>' +
    (apns.length
      ? '<div class="body-text">' + (apns.length > 1 ? "Assessor\u2019s Parcel Numbers: " : "Assessor\u2019s Parcel Number: ") + apns.join("; ") +
        (f.county ? ' &nbsp;&nbsp;&nbsp; County: ' + f.county : '') + '</div>'
      : '') +
    (f.courtCaseNumber ? '<div class="body-text">Court Case No.: ' + f.courtCaseNumber + '</div>' : '') +
    '<hr class="rule">' +
    feeExemptionHTML(f.feeExemption || "gov") +
    '<div class="footer-note">Record this cover page together with a certified copy of the court order. The order itself is the operative instrument.</div>';
}

// Corrective deed: re-records a previously recorded instrument to fix an error in it.
export function genCorrective(f, m) {
  const origType = f.correctiveOriginalType || "Grant Deed";
  const grantorC = grantorLine(f);
  return recHdr(m) +
    '<div style="text-align:center;font-size:14pt;font-weight:bold;margin:18pt 0 4pt;">CORRECTIVE ' + origType.toUpperCase() + '</div>' +
    '<div class="doc-subtitle">Recorded to correct that certain ' + origType + ' recorded ' +
      (f.correctiveOriginalRecordingDate || "[RECORDING DATE]") + ' as Instrument No. ' +
      (f.correctiveOriginalDocNumber || "[INSTRUMENT NUMBER]") + '</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:12pt;"><tr>' +
      '<td style="width:50%;vertical-align:top;padding-right:12pt;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">Mail Tax Statements To:</div>' +
        '<div style="font-size:11pt;">' + (f.grantee || "[GRANTEE NAME]") + '<br>' + (f.granteeAddress || "[GRANTEE ADDRESS]") + '</div>' +
      '</td>' +
      '<td style="width:50%;vertical-align:top;padding-left:12pt;border-left:1px solid #ccc;">' +
        '<div style="font-size:9pt;font-weight:bold;text-transform:uppercase;margin-bottom:3pt;">The Undersigned Grantor(s) Declare(s):</div>' +
        '<div style="font-size:11pt;">Documentary Transfer Tax: $-0-<br>Corrective instrument. No additional consideration.<br>' + bhjaLine(f) + '</div>' +
      '</td>' +
    '</tr></table>' +
    '<hr class="rule">' +
    '<div class="body-text">APN: ' + (f.apn || "_______________") + ' &nbsp;&nbsp;&nbsp; County: ' + (f.county || "[COUNTY]") + '</div>' +
    '<div class="body-text"><strong>THE PURPOSE OF THIS CORRECTIVE ' + origType.toUpperCase() + ' IS:</strong> ' +
      (f.correctiveReason || "[STATE EXACTLY WHAT IS BEING CORRECTED AND WHY]") + '</div>' +
    '<div class="body-text">This Corrective ' + origType + ' is recorded to correct that certain ' + origType +
      ' executed by ' + (f.grantor || "[GRANTOR NAME]") + ', recorded ' + (f.correctiveOriginalRecordingDate || "[RECORDING DATE]") +
      ' as Instrument No. ' + (f.correctiveOriginalDocNumber || "[INSTRUMENT NUMBER]") + ', of Official Records of the ' +
      (f.county || "[COUNTY]") + ' County Recorder, State of California. Except as expressly corrected herein, the prior instrument remains in full force and effect.</div>' +
    '<div class="body-text">FOR VALUABLE CONSIDERATION, receipt of which is hereby acknowledged, ' + grantorC + ', hereby GRANTS to</div>' +
    '<div class="body-text indent"><strong>' + (f.grantee || "[GRANTEE NAME]") + '</strong></div>' +
    '<div class="body-text">the following described real property in the County of ' + (f.county || "[COUNTY]") + ', State of California, as corrected:</div>' +
    '<div class="body-text indent" style="font-family:Courier New,monospace;font-size:10pt;">' + (f.legalDescription || "[CORRECTED LEGAL DESCRIPTION]") + '</div>' +
    '<div class="body-text">Dated: _______________________________</div>' +
    '<div class="sig-block"><div class="sig-line">________________________________________</div><div class="sig-name">' + grantorC + '</div></div>' +
    notaryHTML(f, f.grantor);
}
