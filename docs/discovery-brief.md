# Discovery Brief: Network Operations Reporting & Analytics
**Date**: June 1, 2026
**Status**: Draft — pending user approval
**Source**: Research Brief + AppFactory Discovery Session

---

## Executive Summary

A multi-persona React + Express demo app (deployed to SPCS) for telecom network operations teams. Built on Snowflake's certified telecom NOC data model, the app provides four role-specific dashboards (Network Engineer, Performance Analyst, Network Manager, Executive), an AI-powered alarm triage queue, conversational analytics via Snowflake Intelligence, and auto-generated incident reports. Designed for deployment in telecom customer conversations to demonstrate real-time NOC operations intelligence on Snowflake.

---

## Problem Statement

Telecom NOC teams face three compounding problems:

1. **No single pane of glass** — Alarm, performance, and SLA data exist in separate systems across RAN, Core, and Transport layers. Engineers manually correlate.
2. **Reactive SLA management** — Breaches are discovered after the fact. Teams cannot proactively identify sites approaching SLA thresholds.
3. **No executive business impact view** — Revenue-at-risk and churn impact from network events are not quantified or surfaced to leadership.

---

## Personas

| Persona | Role | Key Decisions | Primary KPIs |
|---|---|---|---|
| Network Engineer | NOC shift analyst — real-time monitoring & incident response | Which alarms need immediate action? What's causing degradation at this site? | MTTD, MTTR, Active Alarm Count, RRC Success Rate, PRB Utilization |
| Performance Analyst | Capacity planning & optimization | Which sites are approaching capacity? Where should we invest in 5G upgrades? | PRB Utilization Trend, Throughput (UL/DL), Capacity Forecast |
| Network Manager | Operations management, SLA accountability | Are we meeting SLAs? Which regions are underperforming? How is the team doing? | SLA Compliance %, TTN/TTA Compliance, Sites Below SLA, Team Resolution Time |
| Executive | C-level/VP — business impact & investment | What is the financial impact of current network health? Where should we invest? | Revenue at Risk, Churn Indicators, Network Availability %, 4G vs 5G ROI |

---

## Data Inventory

| Source | Tables | Row Count | Format | Location |
|---|---|---|---|---|
| Snowflake Certified Guide | DIM_CELL_SITE | 450 | CSV → Snowflake | GitHub: sfguide-telecom-network-operations-analytics |
| Snowflake Certified Guide | DIM_NETWORK_ELEMENT | 480 | CSV → Snowflake | GitHub |
| Snowflake Certified Guide | FACT_RAN_PERFORMANCE | 604,800 | CSV → Snowflake | GitHub |
| Snowflake Certified Guide | FACT_CORE_PERFORMANCE | 13,440 | CSV → Snowflake | GitHub |
| Synthetic (new) | ALARMS | ~2,000 | Generated | AppFactory synthetic-data |
| Synthetic (new) | INCIDENTS / TICKETS | ~500 | Generated | AppFactory synthetic-data |
| Synthetic (new) | SLA_TARGETS | ~50 | Generated | AppFactory synthetic-data |
| Synthetic (new) | TEAMS / ENGINEERS | ~20 | Generated | AppFactory synthetic-data |

**Database**: `NETWORK_OPERATIONS`
**Schemas**: `RAN_4G`, `RAN_5G`, `CORE_4G`, `CORE_5G`, `TRANSPORT`, `ANALYTICS`, `STAGING`, `AI` (new — for triage runs, assist outputs)

---

## Cortex Feature Map

| Question Type | Cortex Feature | Usage |
|---|---|---|
| "Which cells have RRC below 95%?" | Cortex Analyst + Semantic View | EXPLORE pattern — NL queries on performance data |
| "Assess this alarm — what is the likely cause?" | Cortex Agent | TRIAGE pattern — per-alarm severity assessment |
| "Draft an incident summary for this alarm" | Cortex Agent | ASSIST pattern — incident report generation |
| "Draft this week's SLA compliance report" | Cortex Agent | ASSIST pattern — manager/executive deliverable |
| "Write the shift handover note for tonight" | Cortex Agent | ASSIST pattern — shift transition deliverable |
| Fixed KPI lookups (alarm counts, site metrics) | Direct SQL via Express | All dashboard pages |

---

## Agent Pattern Map

| Page | Persona | Agent Pattern | Key Components | Triggers / Actions | Write-backs |
|---|---|---|---|---|---|
| Home / Overview | All | None | Network health summary cards, KPI snapshot, region map | None — read-only | None |
| Network Engineer Dashboard | Network Engineer | EXPLORE (FAB) | Active alarm count, MTTD/MTTR cards, cell site 3D map, severity breakdown | FAB chat sidebar | None |
| Alarm Triage Queue | Network Engineer | TRIAGE | Alarm list, per-alarm AI assessment panel, criteria cards, action bar | Auto-assess on select / Accept · Override · Suppress · Escalate | AI.TRIAGE_RUNS, ALARMS (status update) |
| Performance Dashboard | Performance Analyst | EXPLORE (FAB) | PRB utilization trend chart, throughput by region, capacity forecast, site comparison | FAB chat sidebar | None |
| Manager Dashboard | Network Manager | EXPLORE (FAB) | SLA compliance gauge, TTN/TTA compliance chart, priority heatmap (day × hour), team metrics | FAB chat sidebar | None |
| Executive Dashboard | Executive | EXPLORE (FAB) | Revenue at Risk KPI, churn indicators, 4G vs 5G summary, network availability | FAB chat sidebar | None |
| Reports & Assist | Manager / Executive | ASSIST | Report type selector, Generate button, editable output, approve/send | User-initiated — select type → generate → review → approve | AI.ASSIST_OUTPUTS |
| Network Intelligence Chat | All | EXPLORE (full-page) | Full-page chat, starter question grid (persona-filtered), table/chart rendering, SQL toggle | User-initiated | None |

---

## Workflow Process Map (TRIAGE Pattern)

```
[ALARMS table: new high-severity alarm appears]
        ↓
[Alarm Triage Queue page loads with unreviewed alarms]
        ↓
[Engineer selects an alarm]
        ↓
[Cortex Agent auto-assesses in background (server-side)]
   → Fetches site performance context (Cortex Analyst)
   → Fetches historical alarm patterns for this element
   → Produces: Probable Cause, Severity Rating, Recommended Action
        ↓
[Criteria cards surface: Probable Cause | Severity | Impacted Services | Recommended Action]
        ↓
[Engineer reviews AI reasoning (collapsible "View AI Reasoning" panel)]
        ↓
[Engineer takes action]:
   ✓ Accept → Update alarm status, log triage run, show in history
   ✏ Override → Engineer changes severity/action, log override with reason
   🔇 Suppress → Mark as false positive, suppress future alerts for this element/type
   ↑ Escalate → Assign to senior engineer or manager queue
        ↓
[Write-back to AI.TRIAGE_RUNS + ALARMS.status]
```

---

## ASSIST Pattern: Report Generation Outputs

| Report Type | Who Uses It | Contents | Cache? |
|---|---|---|---|
| Incident Summary | NOC Engineer, Manager | Alarm details, impacted sites, probable cause, recommended action, resolution steps | No — incident-specific |
| SLA Compliance Report | Network Manager | Period, SLA target vs actual by region, sites below SLA, trend vs prior period | Yes — cacheable by week |
| Shift Handover Note | NOC Engineer | Active alarms, resolved incidents, open tickets, watch list for incoming shift | No — shift-specific |

---

## Design Spec

| Decision | Choice | Notes |
|---|---|---|
| Theme | Light | Enterprise/corporate feel |
| Primary color | #0066CC (Snowflake blue) | Professional, trustworthy |
| Alert/status colors | Amber (#F59E0B), Red (#EF4444), Green (#10B981) | NOC severity palette |
| Layout | Sidebar navigation | Collapsible; persona role switcher at top |
| Density | Spacious | Generous whitespace; large KPI cards |
| Border radius | 12px (rounded) | Modern, polished |
| Shadows | Subtle card shadows | Clean, layered look |
| Typography | Inter (modern sans-serif) | Polished, readable |
| Loading states | Skeleton loaders | Content-shaped per component |
| Agent progress | SSE streaming | Contextual messages: "Analyzing alarm...", "Fetching site history..." |
| Cross-filter | Yes | Click chart → filter other charts on page |
| Persona switcher | Yes | Header dropdown to switch persona for demos |
| Nav badges | Yes | Pending alarm count on Triage Queue nav item |
| AI transparency | Yes | Collapsible "View AI Reasoning" panel in Triage; "View AI Prompt" toggle |
| Demo reset | Yes | Clear triage decisions / restore to unreviewed state |
| 3D geo map | Yes (PyDeck-style) | Cell site topology map on Network Engineer page |

---

## Data Generation Plan

### Reuse from Certified Guide (via setup.sql from GitHub)
- `DIM_CELL_SITE` — 450 sites, Portugal geography (Lisboa, Porto, Braga, Coimbra, Faro), lat/lon included
- `DIM_NETWORK_ELEMENT` — 480 elements across sites
- `FACT_RAN_PERFORMANCE` — 604,800 records, 15-min intervals, Sept 2025
- `FACT_CORE_PERFORMANCE` — 13,440 records

### Generate New (AppFactory synthetic-data skill)
| Table | Schema | Rows | Key Distributions |
|---|---|---|---|
| ALARMS | ANALYTICS | 2,000 | 10% P1, 20% P2, 40% P3, 30% P4/P5; ~300 unreviewed (for triage demo) |
| INCIDENTS | ANALYTICS | 500 | Linked to alarms; MTTD 2–45 min; MTTR 10 min–4 hrs |
| SLA_TARGETS | ANALYTICS | 50 | By site × metric: RRC ≥95%, PRB ≤85%, Availability ≥99.9% |
| TEAMS | ANALYTICS | 20 | 3 teams: Network Ops L1, Network Ops L2, Core Network |
| ENGINEERS | ANALYTICS | 20 | Linked to teams; assigned shift |
| AI.TRIAGE_RUNS | AI | 0 (seeded at runtime) | Agent assessment results per alarm |
| AI.ASSIST_OUTPUTS | AI | 0 (seeded at runtime) | Generated reports, approval status |

---

## Page Inventory

| # | Page Name | Path | Persona | Priority |
|---|---|---|---|---|
| 1 | Home / Overview | `/` | All | Must |
| 2 | Network Engineer Dashboard | `/engineer` | Network Engineer | Must |
| 3 | Alarm Triage Queue | `/triage` | Network Engineer | Must |
| 4 | Performance Dashboard | `/performance` | Performance Analyst | Must |
| 5 | Manager Dashboard | `/manager` | Network Manager | Must |
| 6 | Executive Dashboard | `/executive` | Executive | Must |
| 7 | Reports & Assist | `/reports` | Manager, Executive | Should |
| 8 | Network Intelligence Chat | `/chat` | All | Should |

---

## MoSCoW Prioritization

**Must Have**
- 4 persona dashboards (Engineer, Performance, Manager, Executive)
- Alarm Triage Queue with TRIAGE pattern (the core AI demo moment)
- Cell site 3D map on Engineer dashboard
- FAB chat sidebar on all dashboards (EXPLORE)
- Light theme, spacious layout, persona switcher

**Should Have**
- Reports & Assist page (ASSIST pattern — 3 report types)
- Dedicated full-page Intelligence Chat (EXPLORE full-page)
- Demo reset button
- Nav badges for pending triage items

**Could Have**
- Export to PDF for generated reports
- Real-time SSE alert feed simulation
- Drill-down from map to site detail panel

**Won't Have (v1)**
- Live data integration (synthetic data only)
- Multi-tenant/role-based data isolation
- ROUTE or RENDER patterns

---

## Open Questions / Risks

| # | Question | Impact | Status |
|---|---|---|---|
| 1 | Does the target telecom customer have existing branding to apply? | Design | Open |
| 2 | Is SPCS deployment available in the target demo environment? | Deploy | Open |
| 3 | Should the app show Portugal geography (as in the guide) or use generic/US geography? | Data | Open |
| 4 | Does the Snowflake account already have the certified guide data loaded? | Data | Open |
| 5 | What language model should the Intelligence Agent use? (default: Snowflake default orchestration model) | Agent | Open |
