<template>
  <div class="td-container technician-dashboard-page">

    <div class="td-header">
      <div>
        <h1>My Dashboard</h1>
        <p class="td-subtitle">Your personal job workload and performance overview.</p>
      </div>
      <button class="td-refresh-btn" @click="refreshAll" :disabled="anyLoading">
        <span :class="{ spinning: anyLoading }">↻</span>
        {{ anyLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- ══════════════════ KPI CARDS ══════════════════ -->
    <section class="kpi-section">
      <div class="kpi-grid">

        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Completed This Month</div>
            <div class="kpi-value">{{ kpi.completedThisMonth }}</div>
            <div class="kpi-sub">{{ currentMonthLabel }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Outstanding Diagnose Jobs</div>
            <div class="kpi-value">{{ kpi.totalDiagnose }}</div>
            <div class="kpi-sub">Assigned for diagnosis</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-body">
            <div class="kpi-label">Outstanding Service Jobs</div>
            <div class="kpi-value">{{ kpi.totalService }}</div>
            <div class="kpi-sub">Assigned for servicing</div>
          </div>
        </div>

      </div>
    </section>

    <!-- ══════════════════ ROW 1: Status Donut + Upcoming Jobs ══════════════════ -->
    <section class="dashboard-section">
      <div class="dashboard-grid dashboard-grid--2col">

        <!-- My Job Status Donut -->
        <div class="dashboard-card donut-card">
          <div class="dashboard-card-title">My Jobs Breakdown</div>
          <div v-if="jobsLoading" class="dashboard-loading">Loading...</div>
          <div v-else class="donut-wrapper">
            <svg viewBox="0 0 160 160" class="donut-svg">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#2a2a2a" stroke-width="22" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#097969" stroke-width="22" stroke-dasharray="0 377"
                :style="donutCompleteStyle" stroke-linecap="butt" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#fb923c" stroke-width="22" stroke-dasharray="0 377"
                :style="donutInProgressStyle" stroke-linecap="butt" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" stroke-width="22" stroke-dasharray="0 377"
                :style="donutWaitingStyle" stroke-linecap="butt" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#4b5563" stroke-width="22" stroke-dasharray="0 377"
                :style="donutOthersStyle" stroke-linecap="butt" transform="rotate(-90 80 80)" />
              <text x="80" y="75" text-anchor="middle" class="donut-center-num">{{ myStats.total }}</text>
              <text x="80" y="97" text-anchor="middle" class="donut-center-label">Total Jobs</text>
            </svg>
            <div class="donut-legend">
              <div class="legend-item">
                <span class="legend-dot" style="background:#097969"></span>
                <span>Completed</span>
                <span class="legend-val">{{ myStats.completed }} ({{ donutPct(myStats.completed) }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background:#fb923c"></span>
                <span>In Progress</span>
                <span class="legend-val">{{ myStats.inProgress }} ({{ donutPct(myStats.inProgress) }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background:#3b82f6"></span>
                <span>Waiting Parts</span>
                <span class="legend-val">{{ myStats.waitingParts }} ({{ donutPct(myStats.waitingParts) }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background:#4b5563"></span>
                <span>Others</span>
                <span class="legend-val">{{ myStats.others }} ({{ donutPct(myStats.others) }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Jobs -->
        <div class="dashboard-card">
          <div class="dashboard-card-title">
            Upcoming Jobs
            <span class="upcoming-badge">{{ upcomingJobs.length }}</span>
          </div>
          <div v-if="jobsLoading" class="dashboard-loading">Loading...</div>
          <div v-else-if="upcomingJobs.length === 0" class="dashboard-empty">No upcoming jobs.</div>
          <div v-else class="upcoming-list">
            <div v-for="(job, i) in upcomingJobs" :key="i" class="today-item">
              <div class="today-item-top">
                <span class="today-date">{{ formatDate(job.appointment?.appointment_date) }}</span>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                  <span class="role-pill" v-for="r in job._roles" :key="r" :class="'role-pill--' + r">{{ r }}</span>
                  <span class="today-badge" :class="upcomingStatusClass(job)">{{ upcomingStatusLabel(job) }}</span>
                </div>
              </div>
              <div class="today-item-meta">
                <span class="today-make">{{ job.appointment?.vehicle_make || '—' }}</span>
                <span class="today-plate">{{ job.appointment?.vehicle_license_plate || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- ══════════════════ ROW 2: Waiting for Parts table ══════════════════ -->
    <section class="dashboard-section">
      <div class="dashboard-card">
        <div class="dashboard-card-title">Jobs Waiting for Parts</div>
        <div v-if="jobsLoading" class="dashboard-loading">Loading...</div>
        <div v-else-if="waitingJobs.length === 0" class="dashboard-empty">No jobs currently waiting for parts.</div>
        <div v-else class="parts-table">
          <div class="parts-table-header">
            <span>Order ID</span>
            <span>Plate</span>
            <span>Make / Year</span>
            <span>Services</span>
            <span>Expected Arrival</span>
          </div>
          <div v-for="(job, i) in waitingJobs" :key="i" class="parts-table-row">
            <span class="parts-id">{{ shortId(job.Order_ID) }}</span>
            <span class="parts-plate">{{ job.appointment?.vehicle_license_plate || '—' }}</span>
            <span class="parts-make">{{ job.appointment?.vehicle_make || '—' }} {{ job.appointment?.vehicle_year || ''
              }}</span>
            <span class="parts-services">{{ formatServices(job.Services) }}</span>
            <span class="parts-arrival"
              :class="{ 'parts-arrival--overdue': isOverdue(job.expected_parts_arrival_date) }">
              {{ formatDate(job.expected_parts_arrival_date) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════ ROW 3: Top Services + Top Vehicle Makes ══════════════════ -->
    <section class="dashboard-section">
      <div class="dashboard-grid dashboard-grid--2col">

        <div class="dashboard-card bar-card">
          <div class="dashboard-card-title">Top Services Handled</div>
          <div v-if="jobsLoading" class="dashboard-loading">Loading...</div>
          <div v-else class="bar-chart">
            <div v-for="(item, i) in topServices" :key="i" class="bar-row">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-track">
                <div class="bar-fill bar-fill--alt" :style="{ width: barPct(item.count, topServices) + '%' }"></div>
              </div>
              <div class="bar-count">{{ item.count }}</div>
            </div>
            <div v-if="topServices.length === 0" class="dashboard-empty">No service data yet.</div>
          </div>
        </div>

        <div class="dashboard-card bar-card">
          <div class="dashboard-card-title">Vehicle Makes Handled</div>
          <div v-if="jobsLoading" class="dashboard-loading">Loading...</div>
          <div v-else class="bar-chart">
            <div v-for="(item, i) in topVehicleMakes" :key="i" class="bar-row">
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: barPct(item.count, topVehicleMakes) + '%' }"></div>
              </div>
              <div class="bar-count">{{ item.count }}</div>
            </div>
            <div v-if="topVehicleMakes.length === 0" class="dashboard-empty">No vehicle data yet.</div>
          </div>
        </div>

      </div>
    </section>


  </div>
</template>

<script>
import '@/assets/technicianDashboard.css'

const CIRCUMFERENCE = 2 * Math.PI * 60
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default {
  name: 'TechnicianDashboard',

  data() {
    return {
      jobsLoading: false,
      myJobs: [
        { Order_ID: 'ORD00001', Order_Status: 'Check Out', Check_Out: new Date().toISOString(), Services: 'Oil Change, Tyre Rotation', appointment: { appointment_date: new Date().toISOString(), vehicle_make: 'Toyota', vehicle_license_plate: 'SBA1234A', vehicle_year: 2020 }, _roles: ['diagnose'] },
        { Order_ID: 'ORD00002', Order_Status: 'Check Out', Check_Out: new Date().toISOString(), Services: 'Brake Inspection, Air Filter', appointment: { appointment_date: new Date().toISOString(), vehicle_make: 'Honda', vehicle_license_plate: 'SBB5678B', vehicle_year: 2019 }, _roles: ['service'] },
        { Order_ID: 'ORD00003', Order_Status: 'Check Out', Check_Out: new Date().toISOString(), Services: 'Oil Change', appointment: { appointment_date: new Date().toISOString(), vehicle_make: 'Mazda', vehicle_license_plate: 'SBC9012C', vehicle_year: 2021 }, _roles: ['service'] },
        { Order_ID: 'ORD00004', Order_Status: 'Check Out', Check_Out: new Date().toISOString(), Services: 'Tyre Rotation, Wheel Alignment', appointment: { appointment_date: new Date().toISOString(), vehicle_make: 'Toyota', vehicle_license_plate: 'SBD3456D', vehicle_year: 2018 }, _roles: ['diagnose'] },
        { Order_ID: 'ORD00005', Order_Status: 'Check Out', Check_Out: new Date().toISOString(), Services: 'Spark Plug Replacement', appointment: { appointment_date: new Date().toISOString(), vehicle_make: 'BMW', vehicle_license_plate: 'SBE7890E', vehicle_year: 2022 }, _roles: ['service'] },
        { Order_ID: 'ORD00006', Order_Status: 'In Progress', Services: 'Brake Inspection', appointment: { appointment_date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString() })(), vehicle_make: 'Honda', vehicle_license_plate: 'SBF2345F', vehicle_year: 2020 }, _roles: ['service'] },
        { Order_ID: 'ORD00007', Order_Status: 'In Progress', Services: 'Oil Change, Air Filter', appointment: { appointment_date: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString() })(), vehicle_make: 'Nissan', vehicle_license_plate: 'SBG6789G', vehicle_year: 2017 }, _roles: ['diagnose'] },
        { Order_ID: 'ORD00008', Order_Status: 'Waiting For Parts', Services: 'Suspension Repair', expected_parts_arrival_date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString() })(), appointment: { appointment_date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString() })(), vehicle_make: 'Mazda', vehicle_license_plate: 'SBH1234H', vehicle_year: 2019 }, _roles: ['service'] },
        { Order_ID: 'ORD00009', Order_Status: 'Waiting For Parts', Services: 'Timing Belt', expected_parts_arrival_date: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString() })(), appointment: { appointment_date: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString() })(), vehicle_make: 'Toyota', vehicle_license_plate: 'SBI5678I', vehicle_year: 2016 }, _roles: ['diagnose'] },
        { Order_ID: 'ORD00010', Order_Status: 'Ready', Services: 'Wheel Alignment', appointment: { appointment_date: (() => { const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString() })(), vehicle_make: 'BMW', vehicle_license_plate: 'SBJ9012J', vehicle_year: 2023 }, _roles: ['service'] },
      ],
      apiSummary: { totalDiagnose: 4, totalService: 6, bothRoles: 1 },
    }
  },

  computed: {
    anyLoading() { return this.jobsLoading },

    currentMonthLabel() {
      const now = new Date()
      return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
    },

    // ══════════════════ KPI ══════════════════

    kpi() {
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()

      const completedThisMonth = this.myJobs.filter(o => {
        if (o.Order_Status !== 'Check Out' || !o.Check_Out) return false
        const d = new Date(o.Check_Out)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      }).length

      return {
        completedThisMonth,
        totalDiagnose: this.apiSummary.totalDiagnose,
        totalService: this.apiSummary.totalService,
        bothRoles: this.apiSummary.bothRoles,
      }
    },

    // ══════════════════ DONUT ══════════════════

    myStats() {
      const total = this.myJobs.length
      const completed = this.myJobs.filter(o => o.Order_Status === 'Check Out').length
      const inProgress = this.myJobs.filter(o => ['In Progress', 'Diagnose', 'Ready'].includes(o.Order_Status)).length
      const waitingParts = this.myJobs.filter(o => o.Order_Status === 'Waiting For Parts').length
      const others = Math.max(0, total - completed - inProgress - waitingParts)
      return { total, completed, inProgress, waitingParts, others }
    },

    donutCompleteStyle() {
      const { total, completed } = this.myStats
      if (!total) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const len = (completed / total) * CIRCUMFERENCE
      return { strokeDasharray: `${len} ${CIRCUMFERENCE - len}`, strokeDashoffset: 0 }
    },
    donutInProgressStyle() {
      const { total, completed, inProgress } = this.myStats
      if (!total) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const prev = (completed / total) * CIRCUMFERENCE
      const len = (inProgress / total) * CIRCUMFERENCE
      return { strokeDasharray: `${len} ${CIRCUMFERENCE - len}`, strokeDashoffset: -prev }
    },
    donutWaitingStyle() {
      const { total, completed, inProgress, waitingParts } = this.myStats
      if (!total) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const prev = ((completed + inProgress) / total) * CIRCUMFERENCE
      const len = (waitingParts / total) * CIRCUMFERENCE
      return { strokeDasharray: `${len} ${CIRCUMFERENCE - len}`, strokeDashoffset: -prev }
    },
    donutOthersStyle() {
      const { total, completed, inProgress, waitingParts, others } = this.myStats
      if (!total) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const prev = ((completed + inProgress + waitingParts) / total) * CIRCUMFERENCE
      const len = (others / total) * CIRCUMFERENCE
      return { strokeDasharray: `${len} ${CIRCUMFERENCE - len}`, strokeDashoffset: -prev }
    },

    // ══════════════════ Upcoming Jobs ══════════════════
    upcomingJobs() {
      const DONE_STATUSES = new Set([
        'Check Out',
        'Check_Out',
        'check_out',
        'completed',
        'Completed',
        'cancelled',
        'PRM - Check Out - PRM',
      ])
      return this.myJobs
        .filter(o =>
          !DONE_STATUSES.has(o.Order_Status) &&
          o._roles && o._roles.length > 0
        )
        .sort((a, b) => {
          const dateA = new Date(a.appointment?.appointment_date || 0)
          const dateB = new Date(b.appointment?.appointment_date || 0)
          return dateA - dateB
        })
        .slice(0, 6)
    },

    // ══════════════════ WAITING FOR PARTS ══════════════════

    waitingJobs() {
      return this.myJobs.filter(o => o.Order_Status === 'Waiting For Parts')
    },

    // ══════════════════ BAR CHARTS ══════════════════

    topServices() {
      const counts = {}
      this.myJobs.forEach(o => {
        (o.Services || '').split(',').map(s => s.trim()).filter(Boolean).forEach(svc => {
          counts[svc] = (counts[svc] || 0) + 1
        })
      })
      return Object.entries(counts).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count).slice(0, 6)
    },

    topVehicleMakes() {
      const counts = {}
      this.myJobs.forEach(o => {
        const make = (o.appointment?.vehicle_make || '').trim()
        if (make) counts[make] = (counts[make] || 0) + 1
      })
      return Object.entries(counts).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count).slice(0, 6)
    },
  },

  mounted() { /* refreshAll() skipped — using hardcoded demo data */ },

  methods: {
    refreshAll() { this.fetchMyJobs() },

    async fetchMyJobs() {
      this.jobsLoading = true
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Not authenticated.')
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/technicians/myJobCards?limit=500&page=1`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || result.message || 'Failed to fetch job cards')
        this.myJobs = result.data || []
        this.apiSummary = result.summary || { totalDiagnose: 0, totalService: 0, bothRoles: 0 }
      } catch (err) {
        console.error('Technician dashboard fetch error:', err)
        this.myJobs = []
        this.apiSummary = { totalDiagnose: 0, totalService: 0, bothRoles: 0 }
      } finally {
        this.jobsLoading = false
      }
    },

    donutPct(count) {
      return this.myStats.total ? Math.round((count / this.myStats.total) * 100) : 0
    },
    barPct(count, list) {
      return Math.round((count / (list[0]?.count || 1)) * 100)
    },
    formatServices(raw) {
      if (!raw) return '—'
      return raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2).join(', ')
    },
    shortId(id) { return id ? String(id).slice(0, 8) : '—' },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const d = new Date(dateStr)
      return isNaN(d) ? '—' : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
    },
    isOverdue(dateStr) { return dateStr ? new Date(dateStr) < new Date() : false },

    upcomingStatusLabel(job) {
      const map = {
        'In Progress': 'In Progress',
        'Waiting For Parts': 'Waiting for Parts',
        'Waiting Car In/Waiting Parts': 'Waiting for Parts',
        'Waiting for Cust Approval': 'Awaiting Cust Approval',
        'Waiting Payment': 'Awaiting Payment',
        'Waiting Quote': 'Awaiting Quote',
        'On Hold': 'On Hold',
        'Quality Check': 'Quality Check',
        'Ready': 'Ready',
        'Check-In': 'Check-In',
        'Re-Check-In': 'Re-Check-In',
        'PPI & Service': 'PPI & Service',
        'PRM - In Progress - PRM': 'PRM - In Progress - PRM',
        'PRM - Check Out - PRM': 'PRM - Check Out - PRM',
        'Koki Pendings': 'Koki Pending',
        'service': 'Service',
        'booked': 'Diagnose',
        'appointment': 'Diagnose',
      }
      return map[job.Order_Status] || job.Order_Status || '—'
    },

    upcomingStatusClass(job) {
      const map = {
        // Active work
        'In Progress': 'badge--inprogress',
        'PRM - In Progress - PRM': 'badge--inprogress',
        'service': 'badge--inprogress',
        'PPI & Service': 'badge--inprogress',

        // Waiting on something
        'Waiting For Parts': 'badge--waiting',
        'Waiting Car In/Waiting Parts': 'badge--waiting',
        'Waiting for Cust Approval': 'badge--waiting',
        'Waiting Payment': 'badge--waiting',
        'Waiting Quote': 'badge--waiting',
        'On Hold': 'badge--on-hold',
        'Koki Pendings': 'badge--on-hold',

        // Diagnose / check-in stage
        'booked': 'badge--diagnose',
        'appointment': 'badge--diagnose',
        'Check-In': 'badge--diagnose',
        'Re-Check-In': 'badge--diagnose',

        // Near completion
        'Quality Check': 'badge--quality',
        'Ready': 'badge--ready',

        // Completed variants
        'PRM - Check Out - PRM': 'badge--complete',
      }
      return map[job.Order_Status] || 'badge--default'
    },
  }
}
</script>