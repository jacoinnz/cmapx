# Cybersecurity Maturity Health Check — NZ Comparison & Gap Analysis

_Researched 2026-06-15 via multi-source web research (22 NZ sources fetched, 24 claims adversarially verified). Findings reflect current (2024–2026) NZ guidance._

This document compares our two-path assessment against comparable New Zealand
cybersecurity self-assessments and frameworks, and records the gaps it drove us
to close.

---

## 1. The NZ landscape — comparable tools

| Tool / framework | Owner | Audience | Format | Relevance |
|---|---|---|---|---|
| **Own Your Online — Business Security Assessment Tool** | NCSC NZ | SMBs, non-technical | Free quiz → tiered action plan (not a numeric score) | **Closest direct peer** to our business path |
| **NCSC 10 Critical Controls** (formerly CERT NZ) | NCSC NZ | Larger orgs / IT | Control checklist | Authoritative NZ benchmark, aimed a tier above SMBs |
| **NCSC Cyber Security Capability Maturity Model (CS-CMM)** | NCSC NZ | Organisations | 4 maturity levels, Yes/No/Partial responses | The NZ maturity-scoring reference |
| **NCSC Minimum Cyber Security Standards** | NCSC NZ | Govt agencies | Four-level standard | Govt baseline |
| **NZISM v3.9** | GCSB / NCSC | Govt & regulated | Full control manual | Correct anchor for our IT path |
| **Privacy Act 2020 breach notification** | OPC | All holding personal data | Legal duty | Drives our exposure/insurance questions |
| **Essential Eight Maturity Model (ML0–3)** | ACSC (AU) | Technical | 4 maturity levels per control | Widely used in NZ; cited by our IT path |

> **Two factual corrections surfaced by the research:**
> 1. It is the **10 Critical Controls**, not "Top 11."
> 2. **CERT NZ has merged into the NCSC.** References were updated in the question copy.

---

## 2. Coverage map — our tool vs. NZ benchmarks

Legend: ✅ covered · 🟡 partial / one path only · ❌ absent _(before this update)_

| Control area | Business path | IT path | NCSC 10 Critical Controls | Own Your Online | Essential Eight |
|---|:--:|:--:|:--:|:--:|:--:|
| MFA / 2-step login | ✅ | ✅ | ✅ (ranked #1) | ✅ | ✅ |
| Patching / updates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Backups (3-2-1, tested, immutable) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Least-privilege / admin restriction | 🟡 | ✅ | ✅ | 🟡 | ✅ |
| Application control / allow-listing | ❌ | ✅ | ✅ | ❌ | ✅ |
| Logging / monitoring | ❌ | ✅ | ✅ | ❌ | — |
| Asset inventory / lifecycle | ❌ | ✅ | ✅ | ❌ | — |
| Incident response & reporting | ✅ | ✅ | ✅ | ✅ | — |
| Phishing / people / awareness | ✅ | 🟡 | ✅ | ✅ | — |
| Supplier / third-party risk | ❌ | ✅ | ✅ | 🟡 | — |
| **Network segmentation / firewalls / VLANs / VPN** | ❌→✅ | ❌→✅ | ✅ (Control 10) | 🟡 | — |
| **Email authentication (SPF/DKIM/DMARC)** | ❌→✅ | ❌→✅ | ✅ | ✅ | — |
| Mobile device management (MDM) | ❌ | ❌ | 🟡 | 🟡 | — |
| Privacy Act / breach readiness | ✅ | ✅ | — | ✅ | — |

`❌→✅` = gap closed in the 2026-06-15 update.

---

## 3. Pros of our tool

1. **Two-path split is genuinely differentiated** — no single NZ tool cleanly serves both the non-technical owner and the technical assessor.
2. **Business path maps one-to-one with NCSC's own SMB guidance.**
3. **Plain-English, consequence-led framing** — better UX than the NCSC checklist.
4. **IT path's NZISM/PSR/Essential Eight/ISO 27001/HISF mapping is correct and credible.**
5. **Exposure → cyber-insurance angle is unique** among NZ tools, grounded in Privacy Act 2020.
6. **Privacy-first ("we store nothing")** — a trust advantage over insurer questionnaires.

## 4. Cons / weaknesses

1. ~~Binary Yes/No scoring on the business path is below the NZ norm (CS-CMM uses Yes/No/Partial).~~ **Fixed:** business path now Yes/Partly/No.
2. ~~Network-layer and email-authentication controls absent from both paths.~~ **Fixed.**
3. ~~MDM absent from both paths.~~ **Fixed.**
4. Business path can't yet "graduate" a user toward the IT path. _(open)_
5. Self-attested, single-respondent (shared limitation of all self-assessments).

---

## 5. Gap backlog (prioritised)

### Implemented 2026-06-15 (P1)
- **Business:** Yes/Partly/No scale (matches CS-CMM); firewall/network question (`acc_firewall`); email-authentication question (`det_email_auth`).
- **IT:** new "Network & Boundary Security" category with segmentation (`net_segmentation`), perimeter/remote-access (`net_boundary`), and SPF/DKIM/DMARC (`net_email_auth`).
- **Copy:** CERT NZ → NCSC across both paths.
- **Summary card:** "to improve" now counts every non-strength area (not just <34% weaknesses), removing the "0 to improve / N actions" contradiction.

### Implemented 2026-06-15 (P2–P3 — backlog cleared)
| Priority | Path | Gap | Question id |
|:--:|---|---|---|
| P2 | Business | Mobile devices (remote lock/wipe) | `ppl_mdm` |
| P2 | Business | Remote access / VPN for home workers | `ppl_remote` |
| P2 | IT | Mobile device management (MDM/UEM) | `hd_mdm` |
| P2 | IT | Secure software development (conditional) | `gov_sdlc` |
| P3 | Business | Supplier/third-party data safety | `acc_supplier` |
| P3 | Business | Data retention / secure disposal | `upd_disposal` |
| P3 | IT | Cloud/SaaS configuration hardening | `hd_cloud` |
| P3 | IT | AI / shadow-IT governance | `gov_ai` |

### Implemented 2026-06-15 (open items closed)
- **Graduation bridge:** business results now show an adaptive "next step up" card linking to the IT path (`PathBridge`) — a direct nudge at Managed/Strong (level ≥ 4), framed as a future step otherwise.
- **Self-assessment caveat:** results footer now states the result is a self-assessment to guide, not a formal audit or guarantee.

### Still open
- _None from this comparison._ Future ideas live in the product backlog, not here.

---

## 6. Scoring methodology

| Approach | Levels |
|---|---|
| Business path (now) | 3 — Yes / Partly / No |
| NCSC CS-CMM | Yes / No / Partial across 4 maturity levels |
| Essential Eight | ML0 → ML3 |
| IT path | 4 — None / Partial / Largely / Fully |

---

## 7. Confidence & caveats

- **High confidence (primary NCSC/govt sources, verified 3-0):** Own Your Online is the closest peer; the 10 Critical Controls benchmark; network segmentation = Critical Control 10; CS-CMM 4-level scoring; MFA ranked #1; NZISM is the correct IT anchor; DMARC enforcement trend.
- **Medium confidence (code inspection):** exact email-auth/MDM absence in peer tools.
- **Not separately verified:** OPC self-assessment specifics, business.govt.nz/Digital Boost tooling, individual NZ insurer questionnaires, ISO 27001/NIST CSF detail, HISF specifics.

### Primary sources
- ownyouronline.govt.nz — Business Security Assessment Tool; Top online security tips for business
- ncsc.govt.nz — 10 Critical Controls; Protect your organisation (summary); NZISM; Capability Maturity Model; Minimum Cyber Security Standards
- cert.govt.nz — Network segmentation and separation
- privacy.org.nz — Privacy breach notification; Privacy Act 2020 (legislation.govt.nz)
