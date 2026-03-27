<template>
  <div class="mr-container manager-reports-page">
    <div class="mr-header">
      <h1>📝 Manager Reports</h1>
      <p class="mr-subtitle">Retrieve completed appointments and job orders with optional filters.</p>
    </div>

    <section class="reports-search-panel">
      <div class="reports-section">
        <div class="reports-section-title">1. Select Record Type</div>
        <div class="record-type-row">
          <button type="button" class="record-type-btn" :class="{ active: filters.type === 'appointments' }"
            @click="setType('appointments')">
            Appointments
          </button>
          <button type="button" class="record-type-btn" :class="{ active: filters.type === 'jobOrders' }"
            @click="setType('jobOrders')">
            Job Orders
          </button>
        </div>
      </div>

      <div class="reports-section">
        <div class="reports-section-title">2. Optional Date Range</div>
        <div class="date-range-row">
          <div class="date-field-group">
            <label class="field-label" for="fromDate">From Date</label>
            <input id="fromDate" v-model="filters.dateFrom" type="date" class="date-input report-input" />
          </div>

          <div class="date-field-group">
            <label class="field-label" for="toDate">To Date</label>
            <input id="toDate" v-model="filters.dateTo" type="date" class="date-input report-input" />
          </div>
        </div>
      </div>

      <div class="reports-section">
        <div class="optional-filters-header">
          <div class="reports-section-title">3. Optional Filters</div>
          <button type="button" class="add-filter-btn" @click="addOptionalFilter">+</button>
        </div>

        <div v-if="filters.advanced.length === 0" class="optional-filters-empty">
          No optional filters added.
        </div>

        <div v-else class="optional-filters-list">
          <div v-for="(filter, index) in filters.advanced" :key="filter.id" class="optional-filter-row">
            <div class="optional-filter-index">{{ index + 1 }}</div>

            <select v-model="filter.field" class="optional-filter-select report-input">
              <option value="customerName">Customer Name</option>
              <option value="vehicleName">Vehicle Name</option>
              <option value="licensePlate">License Plate No.</option>
              <option value="assignedTechnician">Assigned Technician</option>
              <option value="recordId">Record ID</option>
            </select>

            <input v-model.trim="filter.value" type="text" class="optional-filter-input report-input"
              :placeholder="getFilterPlaceholder(filter.field)" />

            <button type="button" class="remove-filter-btn" @click="removeOptionalFilter(filter.id)">
              Remove
            </button>
          </div>
        </div>
      </div>

      <div class="reports-summary-row">
        <div class="appt-count">
          {{ filteredRecords.length }} completed {{ filters.type === 'appointments' ? 'appointment' : 'job order' }}
          record{{ filteredRecords.length === 1 ? '' : 's' }}
        </div>
      </div>
    </section>

    <div v-if="filteredRecords.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <p>No historical records found.</p>
    </div>

    <div v-else class="report-table-wrapper">
      <table class="report-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>ID</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>License Plate</th>
            <th>Technician</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in paginatedRecords" :key="record.key">
            <td>{{ record.typeLabel }}</td>
            <td>{{ record.idLabel }}</td>
            <td>{{ record.filterValues.customerName }}</td>
            <td>{{ record.filterValues.vehicleName }}</td>
            <td>{{ record.filterValues.licensePlate }}</td>
            <td>{{ record.filterValues.assignedTechnician }}</td>
            <td>{{ formatDate(record.dateValue) }}</td>
            <td>
              <button class="btn-view" @click="openRecord(record)">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination-container">
      <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage -= 1">
        Previous
      </button>

      <div class="pagination-info">
        <button v-for="page in totalPages" :key="page" class="pagination-page" :class="{ active: currentPage === page }"
          @click="currentPage = page">
          {{ page }}
        </button>
      </div>

      <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">
        Next
      </button>
    </div>

    <div v-if="selectedRecord" class="modal-overlay" @click.self="closeRecord">
      <div class="modal-content">
        <button class="modal-close" @click="closeRecord">×</button>
        <h2>{{ selectedRecord.title }}</h2>

        <div class="modal-body">
          <div class="detail-group" v-for="detail in selectedRecord.details" :key="detail.label">
            <label>{{ detail.label }}</label>
            <p>{{ detail.value || '-' }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-print" @click="closeRecord">Print</button>  <!-- Change this -->
          <button class="btn-secondary" @click="closeRecord">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import '@/assets/managerReports.css'

const PAGE_SIZE = 8
let filterIdCounter = 1

const filters = reactive({
  type: 'appointments',
  dateFrom: '',
  dateTo: '',
  advanced: []
})

const currentPage = ref(1)
const selectedRecord = ref(null)

// Integrate with Supabase
const appointments = ref([
  {
    id: 101,
    appointment_date: '2026-03-15',
    appointment_time: '09:00:00',
    customer_id: 'CUS-001',
    customer_name: 'Daryl Tan',
    technician_id: 'TECH-002',
    technician_name: 'Marcus Lee',
    customer_notes: 'Rattling sound when accelerating',
    status: 'completed',
    vehicle_license_plate: 'SGB1234A',
    vehicle_make: 'Toyota Corolla',
    phone_number: '91234567'
  },
  {
    id: 103,
    appointment_date: '2026-03-18',
    appointment_time: '11:00:00',
    customer_id: 'CUS-003',
    customer_name: 'Rachel Ng',
    technician_id: 'TECH-003',
    technician_name: 'Jared Lim',
    customer_notes: 'Routine servicing',
    status: 'completed',
    vehicle_license_plate: 'SKM9090P',
    vehicle_make: 'Mazda 3',
    phone_number: '83456789'
  }
])

const jobOrders = ref([
  {
    Order_ID: 'JO-3002',
    Order_Status: 'completed',
    Services: 'Brake pad replacement',
    Parts: 'Front brake pads',
    Service: '2026-03-12',
    Check_Out: '2026-03-13',
    Customer_id: 'CUS-003',
    customer_name: 'Rachel Ng',
    service_technician_name: 'Jared Lim',
    diagnose_technician_name: 'Jared Lim',
    vehicle_license_plate: 'SKM9090P',
    vehicle_name: 'Mazda 3'
  },
  {
    Order_ID: 'JO-3005',
    Order_Status: 'completed',
    Services: 'Battery replacement',
    Parts: 'Battery terminal kit',
    Service: '2026-03-20',
    Check_Out: '2026-03-21',
    Customer_id: 'CUS-001',
    customer_name: 'Daryl Tan',
    service_technician_name: 'Aaron Goh',
    diagnose_technician_name: 'Marcus Lee',
    vehicle_license_plate: 'SGB1234A',
    vehicle_name: 'Toyota Corolla'
  }
])

const appointmentRecords = computed(() => {
  return appointments.value
    .filter((item) => item.status === 'completed')
    .map((item) => ({
      key: 'appointment-' + item.id,
      type: 'appointments',
      typeLabel: 'Appointment',
      title: item.customer_name || 'Appointment Record',
      subtitle: (item.vehicle_make || 'Vehicle') + ' · ' + (item.vehicle_license_plate || 'No Plate'),
      idLabel: 'APT-' + item.id,
      status: item.status,
      statusClass: 'status-badge--completed',
      cardClass: 'card--completed',
      timeClass: 'time-col--completed',
      leftValue: formatTime(item.appointment_time),
      dateValue: item.appointment_date,
      filterValues: {
        customerName: item.customer_name || '',
        vehicleName: item.vehicle_make || '',
        licensePlate: item.vehicle_license_plate || '',
        assignedTechnician: item.technician_name || '',
        recordId: 'APT-' + item.id
      },
      meta: [
        { label: 'Date', value: formatDate(item.appointment_date), className: 'date-tag' },
        { label: 'License Plate', value: item.vehicle_license_plate, className: 'duration-tag' },
        { label: 'Technician', value: item.technician_name || 'Unassigned', className: 'date-tag' }
      ],
      details: [
        { label: 'Record Type', value: 'Appointment' },
        { label: 'Appointment ID', value: 'APT-' + item.id },
        { label: 'Status', value: 'Completed' },
        { label: 'Date', value: formatDate(item.appointment_date) },
        { label: 'Time', value: formatTime(item.appointment_time) },
        { label: 'Customer', value: item.customer_name },
        { label: 'Customer ID', value: item.customer_id },
        { label: 'Vehicle Name', value: item.vehicle_make },
        { label: 'Vehicle Plate', value: item.vehicle_license_plate },
        { label: 'Assigned Technician', value: item.technician_name },
        { label: 'Notes', value: item.customer_notes }
      ]
    }))
})

const jobOrderRecords = computed(() => {
  return jobOrders.value
    .filter((item) => item.Order_Status === 'completed')
    .map((item) => ({
      key: 'joborder-' + item.Order_ID,
      type: 'jobOrders',
      typeLabel: 'Job Order',
      title: item.customer_name || item.Order_ID,
      subtitle: (item.vehicle_name || item.vehicle_license_plate || 'Vehicle') + ' · ' + (item.Services || 'No service listed'),
      idLabel: item.Order_ID,
      status: item.Order_Status,
      statusClass: 'status-badge--completed',
      cardClass: 'card--completed',
      timeClass: 'time-col--completed',
      leftValue: item.Order_ID,
      dateValue: item.Check_Out || item.Service,
      filterValues: {
        customerName: item.customer_name || '',
        vehicleName: item.vehicle_name || '',
        licensePlate: item.vehicle_license_plate || '',
        assignedTechnician: item.service_technician_name || item.diagnose_technician_name || '',
        recordId: item.Order_ID
      },
      meta: [
        { label: 'Completed On', value: formatDate(item.Check_Out || item.Service), className: 'date-tag' },
        { label: 'License Plate', value: item.vehicle_license_plate, className: 'duration-tag' },
        { label: 'Technician', value: item.service_technician_name || item.diagnose_technician_name, className: 'date-tag' }
      ],
      details: [
        { label: 'Record Type', value: 'Job Order' },
        { label: 'Job Order ID', value: item.Order_ID },
        { label: 'Status', value: 'Completed' },
        { label: 'Customer', value: item.customer_name },
        { label: 'Customer ID', value: item.Customer_id },
        { label: 'Vehicle Name', value: item.vehicle_name },
        { label: 'Vehicle Plate', value: item.vehicle_license_plate },
        { label: 'Assigned Technician', value: item.service_technician_name || item.diagnose_technician_name },
        { label: 'Services', value: item.Services },
        { label: 'Parts', value: item.Parts },
        { label: 'Completed On', value: formatDate(item.Check_Out || item.Service) }
      ]
    }))
})

const currentSourceRecords = computed(() => {
  return filters.type === 'appointments' ? appointmentRecords.value : jobOrderRecords.value
})

const filteredRecords = computed(() => {
  return currentSourceRecords.value.filter((record) => {
    const fromMatch = !filters.dateFrom || !record.dateValue || record.dateValue >= filters.dateFrom
    const toMatch = !filters.dateTo || !record.dateValue || record.dateValue <= filters.dateTo

    const advancedMatch = filters.advanced.every((advancedFilter) => {
      if (!advancedFilter.value) return true
      const sourceValue = String(record.filterValues[advancedFilter.field] || '').toLowerCase()
      return sourceValue.includes(advancedFilter.value.toLowerCase())
    })

    return fromMatch && toMatch && advancedMatch
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / PAGE_SIZE)))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredRecords.value.slice(start, start + PAGE_SIZE)
})

watch(
  () => [filters.type, filters.dateFrom, filters.dateTo, JSON.stringify(filters.advanced)],
  () => {
    currentPage.value = 1
  }
)

watch(totalPages, (value) => {
  if (currentPage.value > value) currentPage.value = value
})

function setType(value) {
  filters.type = value
}

function addOptionalFilter() {
  filters.advanced.push({
    id: filterIdCounter++,
    field: 'customerName',
    value: ''
  })
}

function removeOptionalFilter(id) {
  const index = filters.advanced.findIndex((filter) => filter.id === id)
  if (index !== -1) {
    filters.advanced.splice(index, 1)
  }
}

function getFilterPlaceholder(field) {
  const placeholders = {
    customerName: 'Enter customer name',
    vehicleName: 'Enter vehicle name',
    licensePlate: 'Enter license plate number',
    assignedTechnician: 'Enter technician name',
    recordId: 'Enter appointment or job order ID'
  }
  return placeholders[field] || 'Enter value'
}

function openRecord(record) {
  selectedRecord.value = record
}

function closeRecord() {
  selectedRecord.value = null
}

function formatLabel(value) {
  if (!value) return ''
  return String(value)
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatTime(value) {
  if (!value) return ''
  const parts = String(value).split(':')
  const hours = Number(parts[0] || 0)
  const minutes = Number(parts[1] || 0)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString('en-SG', {
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>
