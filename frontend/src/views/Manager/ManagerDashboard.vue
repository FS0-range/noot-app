<template>
  <div class="md-container manager-dashboard-page">
    <div class="md-header">
      <h1>Manager Dashboard</h1>
      <p class="md-subtitle">Overview of job order statuses, vehicle makes, and top services.</p>
    </div>

    <section class="dashboard-section">
      <div class="dashboard-grid">

        <!-- Job Order Status Donut -->
        <div class="dashboard-card donut-card">
          <div class="dashboard-card-title">Job Order Status</div>
          <div v-if="dashboardLoading" class="dashboard-loading">Loading...</div>
          <div v-else class="donut-wrapper">
            <svg viewBox="0 0 160 160" class="donut-svg">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#f0f0f0" stroke-width="22" />
              <!-- Complete segment -->
              <circle
                cx="80" cy="80" r="60"
                fill="none"
                stroke="#097969"
                stroke-width="22"
                stroke-dasharray="0 377"
                :style="donutCompleteStyle"
                stroke-linecap="butt"
                transform="rotate(-90 80 80)"
              />
              <!-- In Progress segment -->
              <circle
                cx="80" cy="80" r="60"
                fill="none"
                stroke="#fb923c"
                stroke-width="22"
                stroke-dasharray="0 377"
                :style="donutInProgressStyle"
                stroke-linecap="butt"
                transform="rotate(-90 80 80)"
              />
              <!-- Others segment -->
              <circle
                cx="80" cy="80" r="60"
                fill="none"
                stroke="#94a3b8"
                stroke-width="22"
                stroke-dasharray="0 377"
                :style="donutOthersStyle"
                stroke-linecap="butt"
                transform="rotate(-90 80 80)"
              />
              <text x="80" y="75" text-anchor="middle" class="donut-center-num">{{ dashboardStats.totalOrders }}</text>
              <text x="80" y="92" text-anchor="middle" class="donut-center-label">Total Orders</text>
            </svg>
            <div class="donut-legend">
              <div class="legend-item">
                <span class="legend-dot" style="background:#097969"></span>
                <span>Completed</span>
                <span class="legend-val">{{ dashboardStats.completed }} ({{ donutPct(dashboardStats.completed) }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background:#fb923c"></span>
                <span>In Progress</span>
                <span class="legend-val">{{ dashboardStats.inProgress }} ({{ donutPct(dashboardStats.inProgress) }}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background:#94a3b8"></span>
                <span>Others</span>
                <span class="legend-val">{{ dashboardStats.others }} ({{ donutPct(dashboardStats.others) }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Vehicle Makes Bar Chart -->
        <div class="dashboard-card bar-card">
          <div class="dashboard-card-title">Top Vehicle Makes</div>
          <div v-if="dashboardLoading" class="dashboard-loading">Loading...</div>
          <div v-else class="bar-chart">
            <div
              v-for="(item, i) in topVehicleMakes"
              :key="i"
              class="bar-row"
            >
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: barPct(item.count, topVehicleMakes) + '%' }"
                ></div>
              </div>
              <div class="bar-count">{{ item.count }}</div>
            </div>
            <div v-if="topVehicleMakes.length === 0" class="dashboard-empty">No data yet.</div>
          </div>
        </div>

        <!-- Top Services Bar Chart -->
        <div class="dashboard-card bar-card">
          <div class="dashboard-card-title">Top Services</div>
          <div v-if="dashboardLoading" class="dashboard-loading">Loading...</div>
          <div v-else class="bar-chart">
            <div
              v-for="(item, i) in topServices"
              :key="i"
              class="bar-row"
            >
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: barPct(item.count, topServices) + '%' }"
                ></div>
              </div>
              <div class="bar-count">{{ item.count }}</div>
            </div>
            <div v-if="topServices.length === 0" class="dashboard-empty">No data yet.</div>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<script>
import '@/assets/managerDashboard.css'

// Circumference of the donut circle (2 * π * r = 2 * π * 60 ≈ 377)
const CIRCUMFERENCE = 2 * Math.PI * 60

export default {
  name: 'ManagerDashboard',

  data() {
    return {
      dashboardLoading: false,
      dashboardAllOrders: [],   // raw job order data for dashboard charts
    }
  },

  computed: {
    /**
     * Counts job orders by status group:
     *  - completed  → "Check Out"
     *  - inProgress → "In Progress" / "Waiting For Parts" / "Ready"
     *  - others     → everything else (e.g. "Pending", "Cancelled")
     */
    dashboardStats() {
      const total = this.dashboardAllOrders.length
      const completed = this.dashboardAllOrders.filter(o => o.Order_Status === 'Check Out').length
      const inProgress = this.dashboardAllOrders.filter(o =>
        ['In Progress', 'Waiting For Parts', 'Ready'].includes(o.Order_Status)
      ).length
      const others = total - completed - inProgress
      return { totalOrders: total, completed, inProgress, others }
    },

    /**
     * SVG stroke-dasharray/offset styles for each donut segment.
     * stroke-dasharray = "filled_length remaining_length"
     * stroke-dashoffset shifts the start point of the dash around the circle.
     */
    donutCompleteStyle() {
      const { totalOrders, completed } = this.dashboardStats
      if (totalOrders === 0) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const len = (completed / totalOrders) * CIRCUMFERENCE
      return {
        strokeDasharray: `${len} ${CIRCUMFERENCE - len}`,
        strokeDashoffset: 0
      }
    },

    donutInProgressStyle() {
      const { totalOrders, completed, inProgress } = this.dashboardStats
      if (totalOrders === 0) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const completedLen = (completed / totalOrders) * CIRCUMFERENCE
      const len = (inProgress / totalOrders) * CIRCUMFERENCE
      return {
        strokeDasharray: `${len} ${CIRCUMFERENCE - len}`,
        strokeDashoffset: -completedLen
      }
    },

    donutOthersStyle() {
      const { totalOrders, completed, inProgress, others } = this.dashboardStats
      if (totalOrders === 0) return { strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: 0 }
      const completedLen = (completed / totalOrders) * CIRCUMFERENCE
      const inProgressLen = (inProgress / totalOrders) * CIRCUMFERENCE
      const len = (others / totalOrders) * CIRCUMFERENCE
      return {
        strokeDasharray: `${len} ${CIRCUMFERENCE - len}`,
        strokeDashoffset: -(completedLen + inProgressLen)
      }
    },

    /**
     * Top 6 vehicle makes from all job orders, sorted descending.
     * Reads vehicle_make from the nested appointment relation.
     */
    topVehicleMakes() {
      const counts = {}
      this.dashboardAllOrders.forEach(order => {
        const make = (order.appointment?.vehicle_make || 'Unknown').trim()
        if (make) counts[make] = (counts[make] || 0) + 1
      })
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    },

    /**
     * Top 6 services requested across all job orders.
     * The Services field may be a comma-separated string like "Oil Change, Brake Pad Replacement".
     * We split it, trim each entry, and tally them individually.
     */
    topServices() {
      const counts = {}
      this.dashboardAllOrders.forEach(order => {
        const raw = order.Services || ''
        const items = raw.split(',').map(s => s.trim()).filter(Boolean)
        items.forEach(svc => {
          counts[svc] = (counts[svc] || 0) + 1
        })
      })
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    },
  },

  mounted() {
    this.fetchDashboard()
  },

  methods: {
    /**
     * Fetches ALL job orders (no status filter) so the dashboard
     * can show the full picture across every status group.
     * Uses a high limit (500) — adjust when your API supports pagination.
     */
    async fetchDashboard() {
      this.dashboardLoading = true
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Not authenticated.')

        const res = await fetch('http://localhost:3000/api/manager/jobCards?limit=500&page=1', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || result.message || 'Failed to fetch dashboard data')

        this.dashboardAllOrders = result.data || []
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        this.dashboardAllOrders = []
      } finally {
        this.dashboardLoading = false
      }
    },

    /**
     * Returns what percentage a count is of the total orders.
     * Used in the donut legend labels.
     */
    donutPct(count) {
      const total = this.dashboardStats.totalOrders
      if (!total) return 0
      return Math.round((count / total) * 100)
    },

    /**
     * Returns what percentage a bar's count is of the max count
     * in its list, so the biggest bar always fills 100%.
     */
    barPct(count, list) {
      const max = list[0]?.count || 1
      return Math.round((count / max) * 100)
    },
  }
}
</script>
