<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-info">
            <div class="activity-type-badge">
              <span class="material-icons-outlined">directions_bike</span>
              {{ activity.type }}
            </div>
            <h2 class="activity-title">{{ activity.name }}</h2>
            <p class="activity-date">{{ formatDate(activity.date) }}</p>
          </div>
          <button class="close-button" @click="$emit('close')">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>

        <!-- Map Placeholder -->
        <div class="map-placeholder">
          <div class="map-content">
            <svg viewBox="0 0 400 200" class="route-svg">
              <path
                d="M20,150 Q80,30 150,100 T280,80 T380,120"
                fill="none"
                stroke="#FC4C02"
                stroke-width="4"
                stroke-linecap="round"
              />
              <circle cx="20" cy="150" r="8" fill="#36A41D" />
              <circle cx="380" cy="120" r="8" fill="#EE3939" />
            </svg>
            <div class="map-overlay">
              <span class="material-icons-outlined">map</span>
              <span>Route Preview</span>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-item">
            <span class="material-icons-outlined stat-icon">straighten</span>
            <div class="stat-content">
              <span class="stat-value">{{ formatDistance(activity.distance) }}</span>
              <span class="stat-label">Distance</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="material-icons-outlined stat-icon">schedule</span>
            <div class="stat-content">
              <span class="stat-value">{{ formatTime(activity.movingTime) }}</span>
              <span class="stat-label">Moving Time</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="material-icons-outlined stat-icon">landscape</span>
            <div class="stat-content">
              <span class="stat-value">{{ formatElevation(activity.elevation) }}</span>
              <span class="stat-label">Elevation Gain</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="material-icons-outlined stat-icon">speed</span>
            <div class="stat-content">
              <span class="stat-value">{{ formatSpeed(activity.avgSpeed) }}</span>
              <span class="stat-label">Avg Speed</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="material-icons-outlined stat-icon">bolt</span>
            <div class="stat-content">
              <span class="stat-value">{{ formatSpeed(activity.maxSpeed) }}</span>
              <span class="stat-label">Max Speed</span>
            </div>
          </div>
          <div class="stat-item">
            <span class="material-icons-outlined stat-icon">local_fire_department</span>
            <div class="stat-content">
              <span class="stat-value">{{ activity.calories.toLocaleString() }}</span>
              <span class="stat-label">Calories</span>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="achievements-section" v-if="activity.achievementCount > 0">
          <h3 class="section-title">
            <span class="material-icons-outlined">emoji_events</span>
            Achievements
          </h3>
          <div class="achievements-list">
            <div class="achievement-badge" v-for="n in activity.achievementCount" :key="n">
              <span class="material-icons-outlined">military_tech</span>
              <span>Personal Record #{{ n }}</span>
            </div>
          </div>
        </div>

        <!-- Social Stats -->
        <div class="social-section">
          <div class="social-stat">
            <span class="material-icons-outlined">thumb_up</span>
            <span>{{ activity.kudos }} Kudos</span>
          </div>
        </div>

        <!-- Points Earned -->
        <div class="points-earned">
          <div class="points-content">
            <span class="points-icon material-icons-outlined">stars</span>
            <div class="points-info">
              <span class="points-value">+{{ Math.floor(activity.distance) }} Points</span>
              <span class="points-label">Earned from this activity</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button class="secondary-button" @click="$emit('close')">
            Close
          </button>
          <button class="primary-button" @click="viewOnStrava">
            <svg viewBox="0 0 24 24" class="strava-icon">
              <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            View on Strava
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useStrava } from '../composables/useStrava'

defineProps({
  activity: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const { formatTime, formatDistance, formatElevation, formatSpeed, formatDate } = useStrava()

function viewOnStrava() {
  // Mock - would open Strava in real integration
  alert('This would open the activity on Strava.com')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Header */
.modal-header {
  background: linear-gradient(135deg, #FC4C02 0%, #FF6B35 100%);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: white;
}

.activity-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.activity-type-badge .material-icons-outlined {
  font-size: 1rem;
}

.activity-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.activity-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Map Placeholder */
.map-placeholder {
  background: var(--sap-gray-1, #F7F8F9);
  padding: 1.5rem;
}

.map-content {
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-svg {
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.map-overlay {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--sap-gray-5, #89919A);
}

.map-overlay .material-icons-outlined {
  font-size: 2rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--sap-gray-2, #EAECEE);
  border-top: 1px solid var(--sap-gray-2, #EAECEE);
  border-bottom: 1px solid var(--sap-gray-2, #EAECEE);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
}

.stat-icon {
  color: #FC4C02;
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sap-gray-10, #1A2733);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--sap-gray-5, #89919A);
}

/* Achievements */
.achievements-section {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--sap-gray-2, #EAECEE);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--sap-gray-9, #243749);
  margin-bottom: 0.75rem;
}

.section-title .material-icons-outlined {
  color: var(--sap-orange-6, #E76500);
}

.achievements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(135deg, rgba(231, 101, 0, 0.1), rgba(231, 101, 0, 0.05));
  color: var(--sap-orange-6, #E76500);
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.achievement-badge .material-icons-outlined {
  font-size: 1rem;
}

/* Social */
.social-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--sap-gray-2, #EAECEE);
}

.social-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--sap-gray-7, #475E75);
  font-size: 0.9rem;
}

.social-stat .material-icons-outlined {
  color: var(--sap-blue-6, #1B90FF);
}

/* Points */
.points-earned {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(54, 164, 29, 0.1), rgba(54, 164, 29, 0.05));
}

.points-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.points-icon {
  color: var(--sap-green-6, #36A41D);
  font-size: 2rem;
}

.points-info {
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sap-green-6, #36A41D);
}

.points-label {
  font-size: 0.85rem;
  color: var(--sap-gray-6, #5B738B);
}

/* Footer */
.modal-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.secondary-button,
.primary-button {
  padding: 0.7rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.secondary-button {
  background: var(--sap-gray-1, #F7F8F9);
  color: var(--sap-gray-7, #475E75);
  border: 1px solid var(--sap-gray-3, #D5D9DD);
}

.secondary-button:hover {
  background: var(--sap-gray-2, #EAECEE);
}

.primary-button {
  background: linear-gradient(135deg, #FC4C02, #E34402);
  color: white;
  border: none;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(252, 76, 2, 0.3);
}

.strava-icon {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-footer {
    flex-direction: column;
  }

  .secondary-button,
  .primary-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
