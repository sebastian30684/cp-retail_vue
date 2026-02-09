<template>
  <div class="strava-widget" v-if="isConnected && athlete">
    <div class="widget-header">
      <svg viewBox="0 0 24 24" class="strava-icon">
        <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      <span class="widget-title">Strava</span>
      <span class="connected-badge">Connected</span>
    </div>

    <div class="widget-stats">
      <div class="stat">
        <span class="stat-value">{{ formatDistance(thisMonthStats?.distance || 0) }}</span>
        <span class="stat-label">This Month</span>
      </div>
      <div class="stat">
        <span class="stat-value">+{{ calculateStravaBonus() }}</span>
        <span class="stat-label">Bonus Points</span>
      </div>
    </div>

    <div class="widget-footer">
      <span class="athlete-name">{{ athlete.firstName }} {{ athlete.lastName }}</span>
    </div>
  </div>

  <div class="strava-widget not-connected" v-else>
    <div class="widget-header">
      <svg viewBox="0 0 24 24" class="strava-icon">
        <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      <span class="widget-title">Strava</span>
    </div>
    <p class="connect-prompt">Connect to earn bonus points</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStrava } from '../composables/useStrava'

const {
  isConnected,
  athlete,
  thisMonthStats,
  initializeStrava,
  calculateStravaBonus,
  formatDistance
} = useStrava()

onMounted(() => {
  initializeStrava()
})
</script>

<style scoped>
.strava-widget {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--sap-gray-2, #EAECEE);
}

.strava-widget.not-connected {
  background: var(--sap-gray-1, #F7F8F9);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.strava-icon {
  width: 20px;
  height: 20px;
  color: #FC4C02;
}

.widget-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--sap-gray-9, #243749);
}

.connected-badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--sap-green-6, #36A41D);
  background: rgba(54, 164, 29, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.widget-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sap-gray-10, #1A2733);
}

.stat:last-child .stat-value {
  color: var(--sap-green-6, #36A41D);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--sap-gray-5, #89919A);
}

.widget-footer {
  padding-top: 0.5rem;
  border-top: 1px solid var(--sap-gray-2, #EAECEE);
}

.athlete-name {
  font-size: 0.8rem;
  color: var(--sap-gray-6, #5B738B);
}

.connect-prompt {
  font-size: 0.8rem;
  color: var(--sap-gray-5, #89919A);
  margin: 0;
}
</style>
