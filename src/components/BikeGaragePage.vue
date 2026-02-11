<template>
  <div class="bike-garage-section">
    <div class="sap-container">
      <!-- Header -->
      <div class="bike-garage-header">
        <div class="header-left">
          <div class="bike-garage-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5.5" cy="17.5" r="3.5" stroke="white" stroke-width="1.8"/>
              <circle cx="18.5" cy="17.5" r="3.5" stroke="white" stroke-width="1.8"/>
              <path d="M5.5 17.5L8.5 7H12L15 12H18.5M12 7L15 12" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 class="section-title">My Bike Garage</h1>
            <p class="section-subtitle">Your registered bikes from SAP Customer Data Platform</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="sync-cdp-btn" @click="handleSyncMileage" :disabled="isSyncing || !hasStravaData" :title="!hasStravaData ? 'Connect Strava first' : 'Sync Strava mileage to CDP'">
            <svg viewBox="0 0 24 24" class="strava-btn-icon" width="16" height="16">
              <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            {{ isSyncing ? 'Syncing...' : 'Sync km to CDP' }}
          </button>
          <button class="refresh-btn" @click="handleRefresh" :disabled="isLoading">
            <span class="material-icons-outlined" :class="{ spinning: isLoading }">sync</span>
            {{ isLoading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && bikes.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your bikes from SAP CDP...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <span class="material-icons-outlined error-icon">error_outline</span>
        <h3>Could not load bikes</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="handleRefresh">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasBikes && !isLoading" class="empty-state">
        <span class="material-icons-outlined empty-icon">directions_bike</span>
        <h3>No Bikes Found</h3>
        <p>No bikes are registered to your account yet. Purchase a bike to see it here!</p>
        <button class="shop-btn" @click="$emit('navigate', 'shop')">Browse Bikes</button>
      </div>

      <!-- Bikes Grid -->
      <div v-else class="bikes-grid">
        <div v-for="bike in bikes" :key="bike.accountID" class="bike-card">
          <div v-if="getBikeImage(bike.accountName)" class="bike-card-image">
            <img :src="getBikeImage(bike.accountName)" :alt="bike.accountName" />
          </div>
          <div class="bike-card-header">
            <div class="bike-title-section">
              <h3 class="bike-name">{{ bike.accountName || 'Unknown Bike' }}</h3>
              <span class="bike-id">{{ bike.accountID }}</span>
            </div>
            <div class="bike-badges">
              <span class="status-badge" :class="'status-' + (bike.bike_status || '').toLowerCase()">
                {{ bike.bike_status || 'Unknown' }}
              </span>
              <span class="warranty-badge" :class="'warranty-' + (bike.warranty_status || '').toLowerCase()">
                {{ bike.warranty_status === 'active' ? 'Warranty Active' : 'Warranty Expired' }}
              </span>
            </div>
          </div>

          <div class="bike-quick-stats">
            <div class="quick-stat">
              <svg class="quick-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <div class="quick-stat-text">
                <span class="quick-stat-label">Color</span>
                <span class="quick-stat-value">{{ bike.color || '-' }}</span>
              </div>
            </div>
            <div class="quick-stat">
              <svg class="quick-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10H3M21 6H3M21 14H3M21 18H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <div class="quick-stat-text">
                <span class="quick-stat-label">Size</span>
                <span class="quick-stat-value">{{ bike.size || '-' }}</span>
              </div>
            </div>
            <div class="quick-stat">
              <svg class="quick-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="quick-stat-text">
                <span class="quick-stat-label">Category</span>
                <span class="quick-stat-value">{{ bike.category || '-' }}</span>
              </div>
            </div>
            <div class="quick-stat">
              <svg class="quick-stat-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3v17M5.2 9l1.4-1.4M17.4 9l-1.4-1.4M3 15h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="quick-stat-text">
                <span class="quick-stat-label">Weight</span>
                <span class="quick-stat-value">{{ bike.weight ? bike.weight + ' kg' : '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Ride Stats from CDP -->
          <div v-if="bike.total_mileage || bike.last_ride_date" class="ride-stats-bar">
            <div class="ride-stat" v-if="bike.total_mileage">
              <span class="material-icons-outlined ride-stat-icon">straighten</span>
              <span class="ride-stat-label">Total</span>
              <span class="ride-stat-value">{{ bike.total_mileage }} km</span>
            </div>
            <div class="ride-stat-divider" v-if="bike.total_mileage && bike.last_ride_date"></div>
            <div class="ride-stat" v-if="bike.last_ride_date">
              <span class="material-icons-outlined ride-stat-icon">event</span>
              <span class="ride-stat-label">Last Ride</span>
              <span class="ride-stat-value">{{ formatRideDate(bike.last_ride_date) }}</span>
            </div>
            <div class="ride-stat-divider" v-if="bike.last_ride_km && bike.last_ride_date"></div>
            <div class="ride-stat" v-if="bike.last_ride_km">
              <span class="material-icons-outlined ride-stat-icon">route</span>
              <span class="ride-stat-label">Distance</span>
              <span class="ride-stat-value">{{ bike.last_ride_km }} km</span>
            </div>
          </div>

          <div v-if="getStravaMileage(bike.accountName) > 0" class="strava-mileage-bar">
            <svg viewBox="0 0 24 24" class="strava-mileage-icon">
              <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            <span class="strava-mileage-label">Strava Mileage</span>
            <span class="strava-mileage-value">{{ getStravaMileage(bike.accountName).toFixed(1) }} km</span>
          </div>

          <div class="bike-details-grid">
            <div
              v-for="field in getDetailFields(bike)"
              :key="field.key"
              class="detail-row"
            >
              <span class="detail-label">{{ field.label }}</span>
              <span class="detail-value">{{ field.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="hasBikes" class="garage-summary">
        <span class="summary-text">{{ bikeCount }} {{ bikeCount === 1 ? 'bike' : 'bikes' }} in your garage</span>
        <span v-if="lastFetchDate" class="last-updated">Last updated: {{ formatDate(lastFetchDate) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, onMounted, watch, ref, computed } from 'vue'
import { useBikeGarage } from '../composables/useBikeGarage'
import { useStrava } from '../composables/useStrava'
import Papa from 'papaparse'

export default {
  name: 'BikeGaragePage',
  emits: ['navigate'],
  setup() {
    const user = inject('user', { email: '', isLoggedIn: false })
    const productImageMap = ref({})
    const isSyncing = ref(false)

    const {
      bikes,
      bikeCount,
      hasBikes,
      isLoading,
      error,
      lastFetchDate,
      initializeBikeGarage,
      refreshBikeGarage,
      getBikeDisplayFields,
      getStravaMileage,
      syncMileageToCDP
    } = useBikeGarage()

    const { isConnected: stravaConnected } = useStrava()
    const hasStravaData = computed(() => stravaConnected.value)

    async function loadProductImages() {
      try {
        const response = await fetch('/productcatalog_consolidated.csv')
        const csvText = await response.text()
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
        const map = {}
        for (const row of parsed.data) {
          if (row.productName && row.imageUrl) {
            map[row.productName.trim()] = row.imageUrl.trim()
          }
        }
        productImageMap.value = map
      } catch (e) {
        console.error('[BikeGarage] Failed to load product catalog:', e)
      }
    }

    const getBikeImage = (accountName) => {
      if (!accountName) return null
      return productImageMap.value[accountName] || null
    }

    onMounted(() => {
      loadProductImages()
      if (user.email) {
        initializeBikeGarage(user.email)
      }
    })

    watch(() => user.email, (newEmail) => {
      if (newEmail) {
        initializeBikeGarage(newEmail)
      }
    })

    const handleRefresh = () => {
      if (user.email) {
        refreshBikeGarage(user.email)
      }
    }

    const handleSyncMileage = async () => {
      isSyncing.value = true
      try {
        const results = await syncMileageToCDP()
        console.log('[BikeGarage] Mileage sync results:', results)
      } finally {
        isSyncing.value = false
      }
    }

    const getDetailFields = (bike) => {
      // Exclude fields already shown in header/quick-stats
      return getBikeDisplayFields(bike).filter(f =>
        !['accountName', 'accountID', 'color', 'size', 'category', 'weight', 'bike_status', 'warranty_status', 'total_mileage', 'last_ride_date', 'last_ride_km'].includes(f.key)
      )
    }

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatRideDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    return {
      bikes,
      bikeCount,
      hasBikes,
      isLoading,
      error,
      lastFetchDate,
      handleRefresh,
      handleSyncMileage,
      getDetailFields,
      formatDate,
      formatRideDate,
      getBikeImage,
      getStravaMileage,
      isSyncing,
      hasStravaData
    }
  }
}
</script>

<style scoped>
.bike-garage-section {
  padding: 2rem 1rem;
  background: var(--sap-gray-1, #F7F8F9);
  min-height: 60vh;
}

.sap-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.bike-garage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bike-garage-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0D6EFD, #0856C9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sap-gray-9, #243749);
  margin: 0;
}

.section-subtitle {
  font-size: 0.85rem;
  color: var(--sap-gray-6, #5B738B);
  margin: 0.25rem 0 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.sync-cdp-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #FC4C02, #E34402);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sync-cdp-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(252, 76, 2, 0.3);
}

.sync-cdp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.strava-btn-icon {
  width: 16px;
  height: 16px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--sap-gray-3, #D5D9DD);
  border-radius: 8px;
  color: var(--sap-gray-7, #475E75);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--sap-gray-1, #F7F8F9);
  border-color: var(--sap-gray-4, #A9B4BE);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-btn .material-icons-outlined {
  font-size: 18px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--sap-gray-3, #D5D9DD);
  border-top-color: #0D6EFD;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: var(--sap-gray-6, #5B738B);
  font-size: 0.9rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.error-icon {
  font-size: 48px;
  color: #DC3545;
}

.error-state h3 {
  color: var(--sap-gray-9, #243749);
  margin: 0.5rem 0;
}

.error-state p {
  color: var(--sap-gray-6, #5B738B);
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1.5rem;
  background: #0D6EFD;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.retry-btn:hover {
  background: #0856C9;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 64px;
  color: var(--sap-gray-4, #A9B4BE);
}

.empty-state h3 {
  color: var(--sap-gray-9, #243749);
  margin: 0.5rem 0;
}

.empty-state p {
  color: var(--sap-gray-6, #5B738B);
  margin-bottom: 1.5rem;
}

.shop-btn {
  padding: 0.6rem 2rem;
  background: linear-gradient(135deg, #0D6EFD, #0856C9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.shop-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

/* Bikes Grid */
.bikes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Bike Card */
.bike-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.bike-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.bike-card-image {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--sap-gray-1, #F7F8F9);
}

.bike-card-image img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.bike-card-header {
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--sap-gray-1, #F7F8F9);
}

.bike-title-section {
  margin-bottom: 0.5rem;
}

.bike-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sap-gray-9, #243749);
  margin: 0;
}

.bike-id {
  font-size: 0.75rem;
  color: var(--sap-gray-4, #A9B4BE);
  font-family: monospace;
}

.bike-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-badge, .warranty-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.status-active {
  background: rgba(54, 164, 29, 0.1);
  color: #36A41D;
}

.status-inactive {
  background: rgba(220, 53, 69, 0.1);
  color: #DC3545;
}

.warranty-active {
  background: rgba(13, 110, 253, 0.1);
  color: #0D6EFD;
}

.warranty-expired {
  background: rgba(220, 53, 69, 0.1);
  color: #DC3545;
}

/* Ride Stats Bar (CDP) */
.ride-stats-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(13, 110, 253, 0.02));
  border-top: 1px solid rgba(13, 110, 253, 0.1);
  border-bottom: 1px solid rgba(13, 110, 253, 0.1);
}

.ride-stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.ride-stat-icon {
  font-size: 15px;
  color: #0D6EFD;
}

.ride-stat-label {
  font-size: 0.75rem;
  color: var(--sap-gray-6, #5B738B);
}

.ride-stat-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0D6EFD;
}

.ride-stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(13, 110, 253, 0.2);
}

/* Strava Mileage Bar */
.strava-mileage-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, rgba(252, 76, 2, 0.05), rgba(252, 76, 2, 0.02));
  border-top: 1px solid rgba(252, 76, 2, 0.1);
  border-bottom: 1px solid rgba(252, 76, 2, 0.1);
}

.strava-mileage-icon {
  width: 16px;
  height: 16px;
  color: #FC4C02;
  flex-shrink: 0;
}

.strava-mileage-label {
  font-size: 0.75rem;
  color: var(--sap-gray-6, #5B738B);
}

.strava-mileage-value {
  margin-left: auto;
  font-size: 0.9rem;
  font-weight: 700;
  color: #FC4C02;
}

/* Quick Stats */
.bike-quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--sap-gray-1, #F7F8F9);
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-stat-icon {
  color: var(--sap-gray-4, #A9B4BE);
  flex-shrink: 0;
}

.quick-stat-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.quick-stat-label {
  font-size: 0.65rem;
  color: var(--sap-gray-4, #A9B4BE);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
}

.quick-stat-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sap-gray-9, #243749);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Detail Grid */
.bike-details-grid {
  padding: 1rem 1.25rem 1.25rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--sap-gray-1, #F7F8F9);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--sap-gray-6, #5B738B);
}

.detail-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sap-gray-9, #243749);
}

/* Summary */
.garage-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.summary-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sap-gray-7, #475E75);
}

.last-updated {
  font-size: 0.75rem;
  color: var(--sap-gray-4, #A9B4BE);
}

/* Responsive */
@media (max-width: 1024px) {
  .bikes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .bike-garage-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .bike-quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .garage-summary {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
}
</style>
