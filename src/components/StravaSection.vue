<template>
  <section class="strava-section">
    <div class="sap-container">
      <!-- Header -->
      <div class="section-header">
        <div class="header-content">
          <div class="strava-badge">
            <svg viewBox="0 0 24 24" class="strava-logo">
              <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          </div>
          <div>
            <h1 class="section-title">Strava Integration</h1>
            <p class="section-subtitle">Track your rides, earn rewards, and get personalized recommendations</p>
          </div>
        </div>

        <div v-if="isConnected" class="header-actions">
          <button class="sync-button" @click="handleSync" :disabled="isLoading">
            <span class="material-icons-outlined" :class="{ spinning: isLoading }">sync</span>
            {{ isLoading ? 'Syncing...' : 'Sync Activities' }}
          </button>
          <button class="disconnect-button" @click="handleDisconnect">
            <span class="material-icons-outlined">link_off</span>
            Disconnect
          </button>
        </div>
      </div>

      <!-- Not Connected State -->
      <div v-if="!isConnected" class="connect-section">
        <StravaConnectCard @connected="onConnected" />
      </div>

      <!-- Connected State -->
      <template v-else>
        <!-- Athlete Profile Card -->
        <div class="profile-card" v-if="athlete">
          <div class="profile-header">
            <div class="profile-avatar">
              <span class="material-icons-outlined">person</span>
            </div>
            <div class="profile-info">
              <h3 class="profile-name">{{ user.name || `${athlete.firstName} ${athlete.lastName}` }}</h3>
              <span v-if="athlete.premium" class="premium-badge">Premium</span>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-box">
              <span class="stat-number">{{ athlete.stats.totalRides }}</span>
              <span class="stat-label">Total Rides</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">{{ formatDistance(athlete.stats.totalDistance) }}</span>
              <span class="stat-label">Total Distance</span>
            </div>
            <div class="stat-box">
              <span class="stat-number">{{ formatElevation(athlete.stats.totalElevation) }}</span>
              <span class="stat-label">Total Elevation</span>
            </div>
            <div class="stat-box highlight">
              <span class="stat-number">{{ calculateStravaBonus() }}</span>
              <span class="stat-label">Bonus Points</span>
            </div>
          </div>
        </div>

        <!-- This Month Stats -->
        <div class="month-stats" v-if="thisMonthStats">
          <h2 class="subsection-title">
            <span class="material-icons-outlined">calendar_month</span>
            This Month
          </h2>
          <div class="stats-row">
            <div class="stat-card">
              <span class="stat-icon material-icons-outlined">pedal_bike</span>
              <span class="stat-value">{{ thisMonthStats.rides }}</span>
              <span class="stat-name">Rides</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-icons-outlined">straighten</span>
              <span class="stat-value">{{ formatDistance(thisMonthStats.distance) }}</span>
              <span class="stat-name">Distance</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-icons-outlined">landscape</span>
              <span class="stat-value">{{ formatElevation(thisMonthStats.elevation) }}</span>
              <span class="stat-name">Elevation</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon material-icons-outlined">schedule</span>
              <span class="stat-value">{{ formatTime(thisMonthStats.time) }}</span>
              <span class="stat-name">Time</span>
            </div>
          </div>
        </div>

        <!-- Recommended Products -->
        <div class="recommendations" v-if="recommendations.length > 0">
          <h2 class="subsection-title">
            <span class="material-icons-outlined">recommend</span>
            Recommended for You
          </h2>
          <div class="recommendation-cards">
            <div
              v-for="rec in recommendations"
              :key="rec.subcategory"
              class="recommendation-card"
              @click="$emit('navigate-shop', rec)"
            >
              <div class="rec-icon">
                <span class="material-icons-outlined">directions_bike</span>
              </div>
              <div class="rec-content">
                <h4>{{ rec.subcategory }} Bikes</h4>
                <p>{{ rec.reason }}</p>
              </div>
              <span class="material-icons-outlined arrow">arrow_forward</span>
            </div>
          </div>
        </div>

        <!-- Activities Grid -->
        <div class="activities-section">
          <h2 class="subsection-title">
            <span class="material-icons-outlined">history</span>
            Recent Activities
          </h2>
          <div class="activities-grid">
            <StravaActivityCard
              v-for="activity in activities"
              :key="activity.id"
              :activity="activity"
              @click="openActivityModal"
            />
          </div>
        </div>

        <!-- Gear Section -->
        <div class="gear-section" v-if="athlete?.gear?.length > 0">
          <h2 class="subsection-title">
            <span class="material-icons-outlined">settings</span>
            Your Gear
          </h2>
          <div class="gear-grid">
            <div v-for="gear in athlete.gear" :key="gear.id" class="gear-card">
              <div class="gear-icon">
                <span class="material-icons-outlined">pedal_bike</span>
              </div>
              <div class="gear-info">
                <h4>{{ gear.name }}</h4>
                <p>{{ gear.type }}</p>
                <span class="gear-distance">{{ formatDistance(gear.distance) }} ridden</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Activity Modal -->
      <StravaActivityModal
        v-if="selectedActivity"
        :activity="selectedActivity"
        @close="selectedActivity = null"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useStrava } from '../composables/useStrava'
import StravaConnectCard from './StravaConnectCard.vue'
import StravaActivityCard from './StravaActivityCard.vue'
import StravaActivityModal from './StravaActivityModal.vue'

defineEmits(['navigate-shop'])

const user = inject('user', { name: '', email: '' })

const {
  isConnected,
  athlete,
  activities,
  isLoading,
  thisMonthStats,
  initializeStrava,
  syncActivities,
  disconnectStrava,
  getRecommendedProductCategories,
  calculateStravaBonus,
  formatTime,
  formatDistance,
  formatElevation
} = useStrava()

const selectedActivity = ref(null)

const recommendations = computed(() => getRecommendedProductCategories())

onMounted(() => {
  initializeStrava()
})

function onConnected(athleteData) {
  console.log('Connected to Strava:', athleteData)
}

async function handleSync() {
  await syncActivities()
}

function handleDisconnect() {
  disconnectStrava()
}

function openActivityModal(activity) {
  selectedActivity.value = activity
}
</script>

<style scoped>
.strava-section {
  padding: 2rem 0 4rem;
  min-height: 100vh;
  background: var(--sap-gray-1, #F7F8F9);
}

.sap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.strava-badge {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #FC4C02, #E34402);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.strava-logo {
  width: 32px;
  height: 32px;
  color: white;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.25rem;
}

.section-subtitle {
  color: var(--sap-gray-6, #5B738B);
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.sync-button,
.disconnect-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sync-button {
  background: linear-gradient(135deg, #FC4C02, #E34402);
  color: white;
  border: none;
}

.sync-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(252, 76, 2, 0.3);
}

.sync-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.disconnect-button {
  background: white;
  color: var(--sap-gray-7, #475E75);
  border: 1px solid var(--sap-gray-3, #D5D9DD);
}

.disconnect-button:hover {
  background: var(--sap-gray-1, #F7F8F9);
  border-color: var(--sap-gray-4, #A9B4BE);
}

/* Connect Section */
.connect-section {
  padding: 4rem 0;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FC4C02, #FF6B35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar .material-icons-outlined {
  font-size: 2rem;
  color: white;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.25rem;
}

.profile-location {
  color: var(--sap-gray-6, #5B738B);
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
}

.premium-badge {
  display: inline-block;
  background: linear-gradient(135deg, #FC4C02, #E34402);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-box {
  text-align: center;
  padding: 1rem;
  background: var(--sap-gray-1, #F7F8F9);
  border-radius: 12px;
}

.stat-box.highlight {
  background: linear-gradient(135deg, rgba(54, 164, 29, 0.1), rgba(54, 164, 29, 0.05));
}

.stat-box.highlight .stat-number {
  color: var(--sap-green-6, #36A41D);
}

.stat-number {
  display: block;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--sap-gray-6, #5B738B);
}

/* Subsection Titles */
.subsection-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--sap-gray-9, #243749);
  margin-bottom: 1rem;
}

.subsection-title .material-icons-outlined {
  color: #FC4C02;
  font-size: 1.4rem;
}

/* Month Stats */
.month-stats {
  margin-bottom: 2rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  display: block;
  color: #FC4C02;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.25rem;
}

.stat-name {
  font-size: 0.8rem;
  color: var(--sap-gray-6, #5B738B);
}

/* Recommendations */
.recommendations {
  margin-bottom: 2rem;
}

.recommendation-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.recommendation-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.rec-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #FC4C02, #FF6B35);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-icon .material-icons-outlined {
  color: white;
  font-size: 1.5rem;
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.15rem;
}

.rec-content p {
  font-size: 0.85rem;
  color: var(--sap-gray-6, #5B738B);
}

.arrow {
  color: var(--sap-gray-4, #A9B4BE);
}

/* Activities Grid */
.activities-section {
  margin-bottom: 2rem;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

/* Gear Section */
.gear-section {
  margin-bottom: 2rem;
}

.gear-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.gear-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.gear-icon {
  width: 48px;
  height: 48px;
  background: var(--sap-gray-1, #F7F8F9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gear-icon .material-icons-outlined {
  color: var(--sap-gray-6, #5B738B);
  font-size: 1.5rem;
}

.gear-info h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.1rem;
}

.gear-info p {
  font-size: 0.8rem;
  color: var(--sap-gray-6, #5B738B);
  margin-bottom: 0.25rem;
}

.gear-distance {
  font-size: 0.8rem;
  color: #FC4C02;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .activities-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gear-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .sync-button,
  .disconnect-button {
    flex: 1;
    justify-content: center;
  }

  .profile-stats,
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .activities-grid,
  .gear-grid {
    grid-template-columns: 1fr;
  }
}
</style>
