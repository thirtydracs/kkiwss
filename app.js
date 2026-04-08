// ============================================================
// app.js
// Weekly Snapshot — Main Application Logic
// Plain JavaScript — no frameworks required.
// ============================================================

// ---- STATE ----
let currentFilter = 'All';
let currentSearch = '';
let currentJobId  = null;

// ---- SETUP: Add IDs to jobs ----
// The data doesn't include an id field, so we generate one from the name.
// This runs once when the page loads.
function prepareJobData() {
  window.jobs.forEach(job => {
    job.id = slugify(job.name);
  });
}

// ---- HELPERS ----

/**
 * Converts a name string to a URL-safe slug.
 * e.g. "Pearl Energy Childers" → "pearl-energy-childers"
 */
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Converts a status/value string to a CSS-safe class name.
 * e.g. "At Risk" → "at-risk", "Blind Spot" → "blind-spot"
 */
function statusClass(value) {
  return (value || '').toLowerCase().replace(/\s+/g, '-');
}

/**
 * Formats a date string (YYYY-MM-DD) into a readable date.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

/**
 * Maps internal data values to UI display labels.
 * Keeps data.js unchanged while cleanly renaming in the UI.
 */
function displayLabel(value) {
  const map = { 'Blind Spot': 'Data Gap' };
  return map[value] || value;
}

/**
 * Returns a badge HTML string.
 * type = 'status' | 'labour' | 'confidence'
 */
function badge(type, value) {
  const cls = `badge badge-${type}-${statusClass(value)}`;
  return `<span class="${cls}">${displayLabel(value)}</span>`;
}

// ---- KPI CALCULATIONS ----

function calcKPIs(jobs) {
  return {
    total:      jobs.length,
    onTrack:    jobs.filter(j => j.status === 'On Track').length,
    watch:      jobs.filter(j => j.status === 'Watch').length,
    atRisk:     jobs.filter(j => j.status === 'At Risk').length,
    delayed:    jobs.filter(j => j.status === 'Delayed').length,
    blindSpots: jobs.filter(j => j.status === 'Blind Spot').length
  };
}

function renderKPIs() {
  const kpi = calcKPIs(window.jobs);
  document.getElementById('kpi-total').textContent      = kpi.total;
  document.getElementById('kpi-ontrack').textContent    = kpi.onTrack;
  document.getElementById('kpi-watch').textContent      = kpi.watch;
  document.getElementById('kpi-atrisk').textContent     = kpi.atRisk;
  document.getElementById('kpi-delayed').textContent    = kpi.delayed;
  document.getElementById('kpi-blind').textContent      = kpi.blindSpots;

  // Populate "Updated: [latest date]" line below KPI strip
  const dates = window.jobs.map(j => j.updated).filter(Boolean).sort();
  const latestDate = dates[dates.length - 1];
  const updatedEl = document.getElementById('kpi-updated-date');
  if (updatedEl && latestDate) {
    updatedEl.textContent = 'Updated: ' + formatDate(latestDate);
  }
}

// ---- FILTER & SEARCH ----

function getFilteredJobs() {
  return window.jobs.filter(job => {
    const matchesFilter = currentFilter === 'All' || job.status === currentFilter;
    const q = currentSearch.toLowerCase();
    const matchesSearch = !q || job.name.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });
}

// ---- RENDER JOB CARDS ----

function buildJobCard(job) {
  // Data Gap tag for jobs with status Blind Spot
  let dataGapHTML = '';
  if (job.status === 'Blind Spot') {
    dataGapHTML = `
      <div class="card-row">
        <span class="card-label">Data Gap</span>
        <div class="blind-spot-tags">
          <span class="blind-tag">${job.issue || 'No structured data'}</span>
        </div>
      </div>`;
  }

  return `
    <article class="job-card status-${statusClass(job.status)}" data-id="${job.id}">

      <div class="card-header">
        <div class="card-project-name">${job.name}</div>
        <div class="card-builder">W/E ${formatDate(job.weekEnding)}</div>
      </div>

      <div class="card-body">
        <div class="card-row">
          <span class="card-label">Status</span>
          <span class="card-value">${badge('status', job.status)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Holding Up</span>
          <span class="card-value">${job.holdingUp}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Labour</span>
          <span class="card-value">${badge('labour', job.labour)}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Reality</span>
          <span class="card-value muted">${job.reality}</span>
        </div>
        <div class="card-row card-row-action">
          <span class="card-label card-label-action">Next Action</span>
          <span class="card-value card-value-action">${job.next}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Confidence</span>
          <span class="card-value">${badge('confidence', job.dataConfidence)}</span>
        </div>
        ${dataGapHTML}
      </div>

      <div class="card-footer">
        <div class="footer-meta">
          <span class="text-muted" style="font-size:0.75rem;">Report Date: ${formatDate(job.updated)}</span>
          ${job.criticalPath && job.criticalPath !== 'Unknown'
            ? `<span class="text-muted" style="font-size:0.75rem;">CP: ${job.criticalPath}</span>`
            : `<span class="text-muted" style="font-size:0.75rem; color:#9CA3AF;">CP: Unknown</span>`
          }
        </div>
        <button class="btn-view-job" onclick="openJobDetail('${job.id}')">View Job</button>
      </div>

    </article>`;
}

function renderJobCards() {
  const grid     = document.getElementById('jobs-grid');
  const filtered = getFilteredJobs();

  document.getElementById('jobs-count').textContent = `${filtered.length} job${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-results">No jobs match your search or filter.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(buildJobCard).join('');
}

// ---- MANAGER SUMMARY ----

/**
 * Builds a short, human-readable reason for why a job has low confidence.
 * Checks multiple fields and combines any that apply.
 */
function getConfidenceReason(job) {
  const reasons = [];
  if (job.issue) reasons.push(job.issue.toLowerCase());
  if (job.labour === 'Unknown') reasons.push('labour unknown');
  if (!job.criticalPath || job.criticalPath === 'Unknown') reasons.push('critical path not defined');
  if (!job.weekActivity || job.weekActivity.length === 0) reasons.push('no activity logged');
  // Deduplicate, take first 2 to keep it compact
  const unique = [...new Set(reasons)];
  return unique.slice(0, 2).join(' · ') || 'no usable data';
}

function renderManagerSummary() {
  // Only At Risk, Watch, Delayed in this box — Blind Spot is excluded
  const attentionStatuses = ['At Risk', 'Watch', 'Delayed'];

  // Box 1: Jobs Needing Attention grouped by status
  let attentionHTML = '';
  let anyAttention = false;

  attentionStatuses.forEach(status => {
    const jobs = window.jobs.filter(j => j.status === status);
    if (jobs.length === 0) return; // skip empty statuses — no heading shown
    anyAttention = true;
    attentionHTML += `
      <div class="summary-subheading summary-subheading-${statusClass(status)}">${status}</div>
      <ul class="summary-list">
        ${jobs.map(j => `<li><span class="summary-job-name">${j.name}</span></li>`).join('')}
      </ul>`;
  });

  if (!anyAttention) {
    attentionHTML = '<p class="summary-all-good">All jobs are tracking well.</p>';
  }

  // Box 2: Low Confidence Data — jobs where dataConfidence === 'Low'
  const lowConfidence = window.jobs.filter(j => j.dataConfidence === 'Low');
  let confidenceHTML = '';

  if (lowConfidence.length === 0) {
    confidenceHTML = '<p class="summary-all-good">All data confidence is acceptable.</p>';
  } else {
    confidenceHTML = `
      <div class="summary-subheading summary-subheading-low">Confidence: Low</div>
      <ul class="summary-list">
        ${lowConfidence.map(j => `
          <li>
            <span class="summary-job-name">${j.name}</span>
            <span class="summary-job-detail">${getConfidenceReason(j)}</span>
          </li>`).join('')}
      </ul>`;
  }

  document.getElementById('summary-grid').innerHTML = `
    <div class="summary-block needs-attention">
      <div class="summary-block-title">⚠️ Immediate Attention</div>
      ${attentionHTML}
    </div>
    <div class="summary-block low-confidence">
      <div class="summary-block-title">⚠️ Data Gaps</div>
      ${confidenceHTML}
    </div>
  `;
}

// ---- BLIND SPOTS PANEL ----

/**
 * Auto-detects data quality issues across all jobs.
 */
function detectBlindSpots() {
  const spots = [];

  window.jobs.forEach(job => {
    // Blind Spot status is itself the primary flag
    if (job.status === 'Blind Spot') {
      spots.push({ project: job.name, text: job.issue || 'No structured site data' });
    }

    // Unknown labour
    if (job.labour === 'Unknown') {
      spots.push({ project: job.name, text: 'Labour position unknown' });
    }

    // Unknown or missing critical path
    if (!job.criticalPath || job.criticalPath === 'Unknown') {
      spots.push({ project: job.name, text: 'Critical path not defined' });
    }

    // Low confidence
    if (job.dataConfidence === 'Low') {
      spots.push({ project: job.name, text: 'Low data confidence' });
    }

    // No activity logged
    if (!job.weekActivity || job.weekActivity.length === 0) {
      spots.push({ project: job.name, text: 'No weekly activity logged' });
    }
  });

  // Deduplicate
  const seen = new Set();
  return spots.filter(s => {
    const key = `${s.project}::${s.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderBlindSpots() {
  const spots = detectBlindSpots();
  const panel = document.getElementById('blindspots-panel');

  if (spots.length === 0) {
    panel.innerHTML = `<div class="no-blindspots">&#10003; No blind spots detected — all data looks complete.</div>`;
    return;
  }

  panel.innerHTML = spots.map(s => `
    <div class="blindspot-item">
      <div class="blindspot-project">${s.project}</div>
      <div class="blindspot-text">${s.text}</div>
    </div>`
  ).join('');
}

// ---- DATA GAPS HELPER ----

/**
 * Computes data gap tags for a job.
 * Checks: stale daily logs, missing critical path, unknown labour.
 * Returns an array of short descriptive strings.
 */
function getDataGaps(job) {
  const gaps = [];

  // Log freshness: compare latestDailyLog against updated (Report Date)
  if (!job.latestDailyLog) {
    gaps.push('No daily logs available');
  } else if (job.updated) {
    const reportDate = new Date(job.updated    + 'T00:00:00');
    const logDate    = new Date(job.latestDailyLog + 'T00:00:00');
    const daysBehind = Math.floor((reportDate - logDate) / 86400000);
    if (daysBehind >= 4) {
      gaps.push('Daily logs not current');
    }
  }

  // Unknown critical path
  if (!job.criticalPath || job.criticalPath === 'Unknown') {
    gaps.push('Critical path not defined');
  }

  // Unknown labour
  if (job.labour === 'Unknown') {
    gaps.push('Labour not recorded');
  }

  return gaps;
}

// ---- JOB DETAIL VIEW ----

function openJobDetail(jobId) {
  const job = window.jobs.find(j => j.id === jobId);
  if (!job) return;

  currentJobId = jobId;

  // Build activity table rows — weekActivity uses {day, text}
  let activityHTML;
  if (!job.weekActivity || job.weekActivity.length === 0) {
    activityHTML = `<div class="no-activity">No weekly activity logged for this job.</div>`;
  } else {
    const rows = job.weekActivity.map(a => `
      <tr>
        <td class="activity-day">${a.day}</td>
        <td>${a.text}</td>
      </tr>`
    ).join('');
    activityHTML = `
      <table class="activity-table">
        <thead>
          <tr>
            <th style="width:110px;">Day</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // Latest Daily Log display
  const latestLogDisplay = job.latestDailyLog
    ? formatDate(job.latestDailyLog)
    : '<span class="detail-missing">No logs recorded</span>';

  // Data Gaps
  const gaps = getDataGaps(job);
  let dataGapsHTML;
  if (gaps.length === 0) {
    dataGapsHTML = `<span class="detail-ok">None detected</span>`;
  } else {
    dataGapsHTML = `<div class="detail-gap-tags">
      ${gaps.map(g => `<span class="gap-tag">${g}</span>`).join('')}
    </div>`;
  }

  // Auto-generate Overall Position sentence from holdingUp + first sentence of next
  const firstAction = job.next ? job.next.split('.')[0].trim() : '';
  const overallPosition = `${job.holdingUp}. ${firstAction}.`;

  document.getElementById('detail-content').innerHTML = `

    <button class="btn-back" onclick="showDashboard()">&#8592; Back to Dashboard</button>

    <div class="detail-card status-${statusClass(job.status)}">

      <div class="detail-card-header">
        <div class="detail-project-name">${job.name}</div>
        <div class="detail-builder-line">
          <span>Report Date: ${formatDate(job.updated)}</span>
          <span>&#183;</span>
          ${badge('status', job.status)}
        </div>
        <div class="detail-position-summary">${overallPosition}</div>
      </div>

      <div class="detail-body">

        <div class="detail-field">
          <div class="detail-field-label">Holding Up</div>
          <div class="detail-field-value">${job.holdingUp}</div>
        </div>

        <div class="detail-field">
          <div class="detail-field-label">Critical Path</div>
          <div class="detail-field-value">${job.criticalPath && job.criticalPath !== 'Unknown' ? job.criticalPath : '<span class="detail-missing">Unknown</span>'}</div>
        </div>

        <div class="detail-field">
          <div class="detail-field-label">Labour</div>
          <div class="detail-field-value">${badge('labour', job.labour)}</div>
        </div>

        <div class="detail-field">
          <div class="detail-field-label">Confidence</div>
          <div class="detail-field-value">${badge('confidence', job.dataConfidence)}</div>
        </div>

        <hr class="detail-divider" />

        <div class="detail-field">
          <div class="detail-field-label">Reality</div>
          <div class="detail-field-value muted">${job.reality}</div>
        </div>

        <div class="detail-field detail-field-action">
          <div class="detail-field-label detail-label-action">Next Action</div>
          <div class="detail-field-value detail-value-action">${job.next}</div>
        </div>

        <div class="detail-field">
          <div class="detail-field-label">Data Gaps</div>
          <div class="detail-field-value">${dataGapsHTML}</div>
        </div>

        <div class="detail-field">
          <div class="detail-field-label">Latest Daily Log</div>
          <div class="detail-field-value">${latestLogDisplay}</div>
        </div>

      </div>
    </div>

    <div class="activity-section">
      <div class="activity-header">Weekly Activity Log</div>
      ${activityHTML}
    </div>

  `;

  document.getElementById('page-dashboard').classList.remove('active');
  document.getElementById('page-detail').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDashboard() {
  document.getElementById('page-detail').classList.remove('active');
  document.getElementById('page-dashboard').classList.add('active');
  currentJobId = null;
}

// ---- EVENT LISTENERS ----

function setupSearch() {
  document.getElementById('search-input').addEventListener('input', function () {
    currentSearch = this.value.trim();
    renderJobCards();
  });
}

function setupFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderJobCards();
    });
  });
}

// ---- WEEK BANNER ----

function renderWeekBanner() {
  const dates = window.jobs.map(j => j.weekEnding).filter(Boolean);
  if (!dates.length) return;
  const freq = {};
  dates.forEach(d => { freq[d] = (freq[d] || 0) + 1; });
  const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  document.getElementById('banner-week').textContent = formatDate(dominant);
}

// ---- INIT ----

function init() {
  prepareJobData();       // Add generated IDs to each job
  renderKPIs();
  renderWeekBanner();
  renderManagerSummary();
  renderJobCards();
  setupSearch();
  setupFilterButtons();
  document.getElementById('page-dashboard').classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);

