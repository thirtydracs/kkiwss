// ============================================================
// data.js
// All job data for the Weekly Snapshot app.
// Add or edit jobs here. Each job follows the same structure.
// ============================================================

window.jobs = [
  {
    name: "Caltex D'Aguilar",
    status: "At Risk",
    weekEnding: "2026-04-02",
    updated: "2026-04-06",
    latestDailyLog: "2026-04-03",
    issue: "Behind programme",
    labour: "Adequate",
    holdingUp: "Demolition not performing — no clear recovery plan in place",
    next: "Replace contractor or enforce recovery plan this week. Confirm critical path and tighten daily logs.",
    criticalPath: "Civil works",
    dataConfidence: "Medium",
    reality: "Civil works are progressing with PGE and Virgil onsite, but demolition is still holding the overall programme back.",
    weekActivity: [
      {
        day: "Monday",
        text: "Site setup and civil prep continued. Demolition performance remained below programme."
      },
      {
        day: "Tuesday",
        text: "PGE and Virgil continued civil support works and material movement."
      },
      {
        day: "Wednesday",
        text: "Demolition remained the main constraint with no clear recovery plan issued."
      },
      {
        day: "Thursday",
        text: "PGE with 3 men and Virgil with 2 men onsite. Sediment fencing completed. Programme recorded as Behind."
      }
    ]
  },
  {
    name: "Pearl Energy Childers",
    status: "Watch",
    weekEnding: "2026-04-02",
    updated: "2026-04-06",
    latestDailyLog: "2026-04-03",
    issue: "Thin labour",
    labour: "Insufficient",
    holdingUp: "Low labour depth ahead of concreter start",
    next: "Lock concreter start date, increase labour immediately, and ensure slab prep is ready.",
    criticalPath: "Slab / concreting",
    dataConfidence: "Medium",
    reality: "Prep is largely complete, but the job is fragile. Without more labour, the concreter start is at risk.",
    weekActivity: [
      {
        day: "Monday",
        text: "Prep works continued with limited manpower onsite."
      },
      {
        day: "Tuesday",
        text: "Site progress held together, but labour depth remained too thin for comfort."
      },
      {
        day: "Wednesday",
        text: "Concreter start timing remained exposed unless labour was lifted."
      },
      {
        day: "Thursday",
        text: "Single operator carried most of the load. Prep works continued, but labour depth remains too thin."
      }
    ]
  },
  {
    name: "Exus Williamstown",
    status: "Blind Spot",
    weekEnding: "2026-03-30",
    updated: "2026-04-06",
    latestDailyLog: "2026-04-01",
    issue: "No structured data",
    labour: "Active trades onsite",
    holdingUp: "No programme visibility due to missing daily logs",
    next: "Complete daily logs properly with programme status, work areas and completed works.",
    criticalPath: "Unknown",
    dataConfidence: "Low",
    reality: "Work appears active onsite, but the real programme position cannot be assessed from current logs.",
    weekActivity: [
      {
        day: "Monday",
        text: "General site activity appeared to be underway, but structured reporting was missing."
      },
      {
        day: "Tuesday",
        text: "Trades were active onsite, but no reliable programme position was captured."
      },
      {
        day: "Wednesday",
        text: "No clear work area, progress status, or completed works were logged."
      },
      {
        day: "Thursday",
        text: "General site activity noted, but no structured entries were recorded clearly enough to assess status."
      }
    ]
  },
  {
    name: "Pearl Energy Emerald",
    status: "Blind Spot",
    weekEnding: "2026-04-06",
    updated: "2026-04-06",
    latestDailyLog: null,
    issue: "No daily logs",
    labour: "Unknown",
    holdingUp: "No data uploaded for reporting",
    next: "Export and upload valid daily logs before next reporting cycle.",
    criticalPath: "Unknown",
    dataConfidence: "Low",
    reality: "No visibility on progress, labour or programme because no usable site logs were available.",
    weekActivity: [
      {
        day: "Monday",
        text: "No daily logs were available for review."
      },
      {
        day: "Tuesday",
        text: "No usable site records were uploaded."
      },
      {
        day: "Wednesday",
        text: "Progress, labour, and programme position could not be assessed."
      },
      {
        day: "Thursday",
        text: "No activity records available."
      }
    ]
  }
];

