<template>
  <div class="strava-connect-card">
    <div class="strava-logo">
      <svg viewBox="0 0 24 24" class="strava-icon">
        <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
    </div>

    <div class="card-content">
      <h3 class="card-title">Connect with Strava</h3>
      <p class="card-description">
        Link your Strava account to track your rides, earn bonus points, and get personalized product recommendations based on your cycling activities.
      </p>

      <div class="benefits-list">
        <div class="benefit-item">
          <span class="benefit-icon">+1</span>
          <span class="benefit-text">Point per kilometer ridden</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">1.5x</span>
          <span class="benefit-text">Points multiplier on bike purchases</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">100</span>
          <span class="benefit-text">Bonus points for connecting</span>
        </div>
      </div>

      <button
        class="connect-button"
        @click="handleConnect"
        :disabled="isLoading"
      >
        <svg v-if="!isLoading" viewBox="0 0 24 24" class="button-icon">
          <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        <span v-if="isLoading" class="loading-spinner"></span>
        {{ isLoading ? 'Connecting...' : 'Connect with Strava' }}
      </button>

      <p class="privacy-note">
        We only access your public activity data. You can disconnect at any time.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useStrava } from '../composables/useStrava'

const emit = defineEmits(['connected'])

const { connectStrava, isLoading } = useStrava()

async function handleConnect() {
  const result = await connectStrava()
  if (result.success) {
    emit('connected', result.athlete)
  }
}
</script>

<style scoped>
.strava-connect-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

.strava-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #FC4C02, #E34402);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.strava-icon {
  width: 48px;
  height: 48px;
  color: white;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sap-gray-10, #1A2733);
  margin-bottom: 0.75rem;
}

.card-description {
  color: var(--sap-gray-6, #5B738B);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  text-align: left;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--sap-gray-1, #F7F8F9);
  border-radius: 10px;
}

.benefit-icon {
  background: linear-gradient(135deg, #FC4C02, #E34402);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  min-width: 42px;
  text-align: center;
}

.benefit-text {
  color: var(--sap-gray-8, #354A5F);
  font-size: 0.9rem;
}

.connect-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #FC4C02, #E34402);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.connect-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(252, 76, 2, 0.4);
}

.connect-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-icon {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.privacy-note {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--sap-gray-5, #89919A);
}
</style>
