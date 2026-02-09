<template>
  <div class="consumer-loyalty-card">
    <div class="loyalty-header">
      <div class="tier-info">
        <div class="tier-badge" :class="`tier-${loyaltyTier}`">
          <span class="tier-icon">{{ getTierIcon(loyaltyTier) }}</span>
          <span class="tier-name">{{ getTierName(loyaltyTier) }}</span>
        </div>
        <div class="points-display">
          <div class="points-available">
            <span class="points-number">{{ availablePoints.toLocaleString() }}</span>
            <span class="points-label">Points Available</span>
          </div>
          <div class="points-value">
            = {{ getPointsValue(availablePoints).toFixed(2) }} EUR
          </div>
        </div>
      </div>
      <button @click="$emit('view-details')" class="details-btn">
        My Loyalty Account
      </button>
    </div>

    <div class="loyalty-body">
      <!-- Current Benefits -->
      <div class="benefits-section">
        <h4>Your Benefits</h4>
        <div class="benefits-list">
          <div v-for="benefit in activeBenefits.slice(0, 4)" :key="benefit" class="benefit-item">
            <span class="benefit-icon">✓</span>
            <span class="benefit-text">{{ benefit }}</span>
          </div>
        </div>
      </div>

      <!-- Progress to Next Tier -->
      <div v-if="nextTierInfo" class="progress-section">
        <div class="progress-header">
          <h4>
            <span class="next-tier-icon">{{ nextTierInfo.icon }}</span>
            {{ nextTierInfo.remaining.toLocaleString() }} more Points to {{ nextTierInfo.name }}
          </h4>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${tierProgress}%` }"></div>
          </div>
          <span class="progress-percentage">{{ Math.round(tierProgress) }}%</span>
        </div>

        <!-- Next Tier Benefits Preview -->
        <div class="next-benefits-preview">
          <h5>Coming soon:</h5>
          <div class="next-benefits">
            <span v-for="benefit in nextTierInfo.newBenefits.slice(0, 3)" :key="benefit" class="next-benefit">
              + {{ benefit }}
            </span>
          </div>
        </div>
      </div>

      <!-- Maxed Out Message -->
      <div v-else class="maxed-out-section">
        <div class="celebration-icon">💎</div>
        <h4>Platinum Status Achieved!</h4>
        <p>You enjoy all exclusive benefits of our highest loyalty level.</p>
      </div>

      <!-- Points Multiplier Info -->
      <div class="multiplier-info">
        <span class="multiplier-badge">
          {{ getMultiplier(loyaltyTier) }}x Points
        </span>
        <span class="multiplier-text">on every purchase</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsumerLoyaltyCard',
  props: {
    loyaltyTier: {
      type: String,
      required: true,
      default: 'bronze'
    },
    availablePoints: {
      type: Number,
      required: true,
      default: 0
    },
    lifetimePoints: {
      type: Number,
      default: 0
    },
    tierProgress: {
      type: Number,
      default: 0
    },
    activeBenefits: {
      type: Array,
      default: () => []
    },
    nextTierInfo: {
      type: Object,
      default: null
    }
  },
  emits: ['view-details'],
  setup() {
    const getTierIcon = (tier) => {
      switch (tier) {
        case 'bronze': return '🥉'
        case 'silver': return '🥈'
        case 'gold': return '🥇'
        case 'platinum': return '💎'
        default: return '🏆'
      }
    }

    const getTierName = (tier) => {
      switch (tier) {
        case 'bronze': return 'Bronze'
        case 'silver': return 'Silver'
        case 'gold': return 'Gold'
        case 'platinum': return 'Platinum'
        default: return 'Member'
      }
    }

    const getMultiplier = (tier) => {
      switch (tier) {
        case 'bronze': return '1'
        case 'silver': return '1.25'
        case 'gold': return '1.5'
        case 'platinum': return '2'
        default: return '1'
      }
    }

    const getPointsValue = (points) => {
      // 100 points = 5 EUR
      return (points / 100) * 5
    }

    return {
      getTierIcon,
      getTierName,
      getMultiplier,
      getPointsValue
    }
  }
}
</script>

<style scoped>
.consumer-loyalty-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
  border: 2px solid #f59e0b;
  border-radius: var(--sap-border-radius-lg, 12px);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.loyalty-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.tier-info {
  flex-grow: 1;
}

.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.tier-bronze {
  background: linear-gradient(135deg, #CD7F32, #B8722A);
  color: white;
}

.tier-silver {
  background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
  color: #333;
}

.tier-gold {
  background: linear-gradient(135deg, #FFD700, #DAA520);
  color: #333;
}

.tier-platinum {
  background: linear-gradient(135deg, #E5E4E2, #B4B4B4);
  color: #333;
  border: 2px solid #8B8B8B;
}

.points-display {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.points-available {
  display: flex;
  flex-direction: column;
}

.points-number {
  font-size: 2rem;
  font-weight: 700;
  color: #92400e;
  line-height: 1;
}

.points-label {
  font-size: 0.75rem;
  color: #a16207;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.points-value {
  font-size: 0.875rem;
  color: #92400e;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.details-btn {
  background: #92400e;
  color: white;
  border: none;
  border-radius: var(--sap-border-radius-md, 8px);
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.details-btn:hover {
  background: #78350f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(120, 53, 15, 0.3);
}

.loyalty-body {
  display: grid;
  gap: 1.25rem;
}

.benefits-section h4,
.progress-section h4 {
  margin: 0 0 0.75rem 0;
  color: #78350f;
  font-size: 0.95rem;
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.benefit-icon {
  color: #15803d;
  font-weight: bold;
  font-size: 0.875rem;
}

.benefit-text {
  color: #78350f;
  font-size: 0.8rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.next-tier-icon {
  margin-right: 0.25rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.progress-bar {
  flex-grow: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #92400e, #d97706);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 700;
  color: #92400e;
  min-width: 40px;
}

.next-benefits-preview h5 {
  margin: 0 0 0.5rem 0;
  color: #a16207;
  font-size: 0.8rem;
  font-weight: 500;
}

.next-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.next-benefit {
  background: rgba(255, 255, 255, 0.7);
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.maxed-out-section {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
}

.celebration-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.maxed-out-section h4 {
  color: #78350f;
  margin-bottom: 0.5rem;
}

.maxed-out-section p {
  color: #92400e;
  font-size: 0.875rem;
}

.multiplier-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(120, 53, 15, 0.2);
}

.multiplier-badge {
  background: #92400e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.multiplier-text {
  color: #78350f;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .loyalty-header {
    flex-direction: column;
    gap: 1rem;
  }

  .benefits-list {
    grid-template-columns: 1fr;
  }

  .next-benefits {
    flex-direction: column;
    align-items: flex-start;
  }

  .points-display {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
