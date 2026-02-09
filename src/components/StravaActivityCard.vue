<template>
  <div class="activity-card" @click="$emit('click', activity)">
    <div class="card-header">
      <div class="activity-type">
        <span class="material-icons-outlined type-icon">directions_bike</span>
      </div>
      <div class="kudos-badge" v-if="activity.kudos > 0">
        <span class="material-icons-outlined">thumb_up</span>
        {{ activity.kudos }}
      </div>
    </div>

    <div class="card-body">
      <h4 class="activity-name">{{ activity.name }}</h4>
      <div class="activity-meta">
        <span class="activity-date">{{ formatDate(activity.date) }}</span>
        <span v-if="gearName" class="gear-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2"/>
            <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2"/>
            <path d="M5.5 17.5L8.5 7H12L15 12H18.5M12 7L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ gearName }}
        </span>
      </div>

      <div class="stats-grid">
        <div class="stat">
          <span class="stat-value">{{ formatDistance(activity.distance) }}</span>
          <span class="stat-label">Distance</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatElevation(activity.elevation) }}</span>
          <span class="stat-label">Elevation</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatTime(activity.movingTime) }}</span>
          <span class="stat-label">Time</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatSpeed(activity.avgSpeed) }}</span>
          <span class="stat-label">Avg Speed</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="achievements" v-if="activity.achievementCount > 0">
        <span class="material-icons-outlined achievement-icon">emoji_events</span>
        <span>{{ activity.achievementCount }} {{ activity.achievementCount === 1 ? 'achievement' : 'achievements' }}</span>
      </div>
      <div class="points-earned">
        <span class="points-value">+{{ Math.floor(activity.distance) }}</span>
        <span class="points-label">pts</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStrava } from '../composables/useStrava'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const { formatTime, formatDistance, formatElevation, formatSpeed, formatDate, getGearName } = useStrava()

const gearName = computed(() => getGearName(props.activity.gearId))
</script>

<style scoped>
.activity-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #FC4C02 0%, #FF6B35 100%);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-type {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon {
  color: white;
  font-size: 1.4rem;
}

.kudos-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.kudos-badge .material-icons-outlined {
  font-size: 1rem;
}

.card-body {
  padding: 1.25rem;
}

.activity-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.activity-date {
  font-size: 0.85rem;
  color: var(--sap-gray-5, #89919A);
}

.gear-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0D6EFD;
  background: rgba(13, 110, 253, 0.08);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.gear-badge svg {
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--sap-gray-9, #243749);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--sap-gray-5, #89919A);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background: var(--sap-gray-1, #F7F8F9);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.achievements {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--sap-orange-6, #E76500);
  font-size: 0.85rem;
  font-weight: 500;
}

.achievement-icon {
  font-size: 1.1rem;
}

.points-earned {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.points-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--sap-green-6, #36A41D);
}

.points-label {
  font-size: 0.75rem;
  color: var(--sap-green-6, #36A41D);
  font-weight: 500;
}
</style>
