# Research Brief: Network Operations Reporting & Analytics
**Date**: June 1, 2026
**Domain**: Telecom Network Operations (NOC) — Reporting, Alerting, SLA Management

---

## Domain Overview

Telecom network operations teams monitor thousands of network elements across Radio Access Network (RAN), Core, and Transport layers simultaneously. Their core challenges are:

1. **No unified view** — Alarm data lives across separate systems per network layer (RAN_4G, RAN_5G, CORE_4G, CORE_5G, TRANSPORT). NOC engineers manually correlate.
2. **Reactive SLA management** — Breaches are discovered after the fact. Teams lack proactive alerting against SLA thresholds in real time.
3. **No business impact quantification** — Executives cannot easily see the financial cost of network events, churn risk, or revenue-at-risk figures.

---

## Key Resources

| Resource | Type | URL | Notes |
|---|---|---|---|
| Snowflake Certified Developer Guide | Solution Guide | https://www.snowflake.com/en/developers/guides/telecom-network-ops-intelligence/ | End-to-end telecom NOC solution — exact match to this app |
| GitHub Repo | Code + Data | https://github.com/Snowflake-Labs/sfguide-telecom-network-operations-analytics | Setup SQL, CSV data, Streamlit app, Semantic View |
| INOC NOC Reporting Guide | Industry | https://www.inoc.com/blog/network-operations-center-reporting | Comprehensive NOC KPIs, SLA reporting model, 3-tier report structure |

---

## Domain Vocabulary

| Term | Definition |
|---|---|
| NOC | Network Operations Center — team responsible for 24x7 monitoring and incident response |
| RAN | Radio Access Network — the cell tower/eNodeB/gNodeB layer connecting devices to the network |
| Core | Core network — MME, SGW, PGW (4G), AMF, SMF, UPF (5G) — routes data between RAN and internet |
| Transport | Backhaul/fronthaul — physical links connecting cell sites to core |
| eNodeB / gNodeB | 4G / 5G base station hardware at a cell site |
| MTTD | Mean Time to Detect — how quickly an issue is identified after it starts |
| MTTR | Mean Time to Resolve — total time from detection to resolution |
| TTN | Time to Notify — how quickly the relevant person is alerted after detection |
| TTA | Time to Action — when troubleshooting actually begins |
| TTC | Time to Close | Full lifecycle duration from ticket open to close |
| PRB | Physical Resource Block — smallest unit of RAN spectrum allocation; PRB Utilization = capacity indicator |
| RRC | Radio Resource Control — connection success rate; below 95% = degraded service |
| SLA | Service Level Agreement — contractual uptime/performance targets |
| SLO | Service Level Objective — internal targets, typically more stringent than SLA |
| P1–P5 | Incident priority levels: P1 = critical outage, P5 = informational |
| Revenue at Risk | Estimated financial loss attributable to active network degradation |
| Churn Indicator | Metric estimating customer churn probability due to service quality |

---

## Typical Workflow Stages

```
[Alarm Fires]
     ↓
[NOC Engineer: Detect + Triage]   ← MTTD starts here
     ↓
[Classify + Assign Priority]       ← P1-P5 assignment
     ↓
[Begin Troubleshooting]            ← TTA starts here
     ↓
[Notify Stakeholders]              ← TTN measured
     ↓
[Resolve + Close Ticket]           ← MTTR, TTC measured
     ↓
[Post-Incident Report]             ← Root cause, RFO analysis
     ↓
[Manager/Executive Review]         ← SLA compliance, business impact
```

---

## Common Data Entities

| Entity | Description |
|---|---|
| Cell Site (`DIM_CELL_SITE`) | Physical antenna location — site ID, lat/lon, city, region, tech (4G/5G) |
| Network Element (`DIM_NETWORK_ELEMENT`) | Individual hardware component (eNodeB, MME, router) at a site |
| RAN Performance Fact (`FACT_RAN_PERFORMANCE`) | 15-min interval metrics per element: PRB utilization, throughput, RRC success rate |
| Core Performance Fact (`FACT_CORE_PERFORMANCE`) | Core layer metrics: session success rates, packet loss |
| Alarm / Incident | Triggered event when a metric crosses threshold; has severity, site, timestamp |
| SLA Record | Target + actual performance per site/region per period |
| Ticket | ITSM record tracking an incident from detection to closure |

**From the certified guide**: 450 cell sites in Portugal (Lisboa, Porto, Braga, Coimbra, Faro), ~604,800 RAN performance records at 15-min intervals, September 2025 time window.

---

## Industry KPIs and Metrics

### Network Engineer KPIs
- Active alarm count by severity (P1–P3)
- MTTD, MTTR by site / region
- RRC Success Rate (threshold: 95%)
- Sites with critical PRB utilization (threshold: >85%)
- 5G PDU session success rate

### Performance Analyst KPIs
- PRB Utilization trend by site/region
- Uplink/Downlink throughput (Mbps)
- Capacity forecast (% remaining capacity)
- 4G vs 5G throughput comparison by region

### Network Manager KPIs
- SLA compliance % (overall + by site)
- Sites below SLA target (count)
- TTN, TTA compliance % by priority level
- Team performance (resolution times)

### Executive KPIs
- Revenue at Risk (€) — financial impact of degradation
- Churn Risk indicators
- Network availability % (overall)
- 4G vs 5G investment ROI

---

## Business Value (from Snowflake certified guide)

| Persona | Benefit | Annual Value |
|---|---|---|
| Network Engineer | 40% faster issue detection | €230K–275K/year |
| Performance Analyst | Proactive capacity planning | €1.2M/year |
| Network Manager | SLA protection | €870K/year |
| Executive | Reduced churn | €9.9M/year |

---

## NOC Reporting Model (3-Tier, from INOC)

| Tier | Content |
|---|---|
| Standard | Ticket trends, SLA/SLO compliance, TTN/TTA compliance, priority heatmaps, resolution category analysis |
| Optional | Asset reachability, dispatch reports, circuit availability |
| Custom | Client-specific operational reports, task timelines |

Key reporting insights:
- **Heatmap by day/hour** is one of the most actionable NOC visuals
- **Resolution category breakdown** (carrier failure vs hardware vs config change) is essential for root cause analysis
- **Drill-down to individual tickets** is required — aggregate stats alone are insufficient

---

## Relevant Snowflake Resources

| Resource | Description |
|---|---|
| Streamlit in Snowflake | Native Streamlit deployment — used in the certified guide |
| Snowflake Intelligence | Agent + semantic view for natural language queries — built in the certified guide |
| PyDeck | 3D geospatial visualization — used for cell site topology map in the guide |
| Semantic Views | NETWORK_SEMANTIC_VIEW — covers DIM_CELL_SITE + FACT_RAN_PERFORMANCE |
| Cortex Analyst | Powers natural language → SQL on structured performance data |

---

## Recommendations for Discovery

1. **Use the certified guide as the data foundation** — don't reinvent the data model. The 13 CSV files + setup.sql from `sfguide-telecom-network-operations-analytics` give us production-quality synthetic data instantly.
2. **Prioritize the Network Engineer and Executive personas** — they offer the most demo contrast (technical operations vs business impact).
3. **Build a 3D cell site map** — PyDeck is already used in the guide and is a strong visual demo moment.
4. **Alarm triage queue is the highest-impact page** — it's the moment where AI augments human decisions in real time.
5. **EXPLORE pattern via Snowflake Intelligence** aligns perfectly with the verified queries already in the certified guide.
