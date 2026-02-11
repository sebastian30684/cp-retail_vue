<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="consumer-loyalty-modal" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <div class="tier-badge-large" :class="`tier-${loyaltyData.currentTier}`">
            <span class="tier-icon">{{ getTierIcon(loyaltyData.currentTier) }}</span>
            <div class="tier-info">
              <span class="tier-name">CREW {{ getTierName(loyaltyData.currentTier) }}</span>
              <small>{{ loyaltyData.lifetimePoints.toLocaleString() }} Lifetime Points</small>
            </div>
          </div>
          <button @click="$emit('close')" class="modal-close">×</button>
        </div>
      </div>

      <div class="modal-body">
        <!-- Points Overview -->
        <div class="section points-overview-section">
          <h3>Your Points Balance</h3>
          <div class="points-hero">
            <div class="points-available-large">
              <span class="points-number">{{ loyaltyData.availablePoints.toLocaleString() }}</span>
              <span class="points-label">Points Available</span>
              <span class="points-value">= {{ getPointsValue(loyaltyData.availablePoints).toFixed(2) }} EUR</span>
            </div>
          </div>

          <div class="points-stats">
            <div class="stat-card">
              <div class="stat-icon">🛒</div>
              <div class="stat-content">
                <span class="stat-value">{{ orderHistory.length }}</span>
                <span class="stat-label">Orders</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <span class="stat-value">{{ loyaltyData.lifetimePoints.toLocaleString() }}</span>
                <span class="stat-label">Points Collected</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎁</div>
              <div class="stat-content">
                <span class="stat-value">{{ (loyaltyData.lifetimePoints - loyaltyData.availablePoints).toLocaleString() }}</span>
                <span class="stat-label">Redeemed</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✨</div>
              <div class="stat-content">
                <span class="stat-value">{{ getMultiplier(loyaltyData.currentTier) }}x</span>
                <span class="stat-label">Points Multiplier</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Redeem Points -->
        <div class="section redeem-section">
          <h3>Redeem Points</h3>
          <div class="redeem-options">
            <div v-for="option in getAvailableRedemptions()" :key="option.points" class="redeem-card"
              :class="{ disabled: loyaltyData.availablePoints < option.points }">
              <div class="redeem-type" :class="option.type">
                <span v-if="option.type === 'voucher'">🎟️</span>
                <span v-else-if="option.type === 'shipping'">📦</span>
                <span v-else-if="option.type === 'experience'">🏔️</span>
                <span v-else>🎁</span>
              </div>
              <div class="redeem-info">
                <span class="redeem-description">{{ option.description }}</span>
                <span class="redeem-points">{{ option.points }} Points</span>
              </div>
              <button v-if="loyaltyData.availablePoints >= option.points" @click="redeemPoints(option)"
                class="redeem-btn">
                Redeem
              </button>
              <span v-else class="redeem-locked">
                {{ option.points - loyaltyData.availablePoints }} more Points
              </span>
            </div>
          </div>
        </div>

        <!-- Current Benefits -->
        <div class="section benefits-section">
          <h3>Your {{ getTierName(loyaltyData.currentTier) }} Benefits</h3>
          <div class="benefits-categories">
            <div v-for="(benefits, category) in loyaltyData.categorizedBenefits" :key="category"
              class="benefit-category">
              <h4>{{ getCategoryLabel(category) }}</h4>
              <div class="benefits-list">
                <div v-for="benefit in benefits" :key="benefit" class="benefit-item">
                  <span class="benefit-icon">✓</span>
                  <span class="benefit-text">{{ benefit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tier Progress -->
        <div v-if="loyaltyData.nextTierInfo" class="section progress-section">
          <h3>
            <span class="next-tier-icon">{{ loyaltyData.nextTierInfo.icon }}</span>
            Progress to {{ loyaltyData.nextTierInfo.name }}
          </h3>

          <div class="progress-container">
            <div class="progress-header">
              <span class="progress-current">{{ loyaltyData.lifetimePoints.toLocaleString() }} Points</span>
              <span class="progress-target">{{ loyaltyData.nextTierInfo.threshold.toLocaleString() }} Points</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${loyaltyData.tierProgress}%` }"></div>
            </div>
            <div class="progress-info">
              <span class="progress-remaining">{{ loyaltyData.nextTierInfo.remaining.toLocaleString() }} Points remaining</span>
              <span class="progress-percentage">{{ Math.round(loyaltyData.tierProgress) }}%</span>
            </div>
          </div>

          <!-- Next Tier Benefits Preview -->
          <div class="next-tier-preview">
            <h4>Unlock with {{ loyaltyData.nextTierInfo.name }}:</h4>
            <div class="next-benefits">
              <div v-for="benefit in loyaltyData.nextTierInfo.newBenefits" :key="benefit" class="next-benefit">
                <span class="next-benefit-icon">+</span>
                <span>{{ benefit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Maxed Out Section -->
        <div v-else class="section maxed-section">
          <div class="maxed-content">
            <div class="celebration-icon">🏆</div>
            <h3>Legend Status Achieved!</h3>
            <p>Du genießt alle exklusiven Benefits unseres höchsten CREW Levels. Danke für deine Treue!</p>
          </div>
        </div>

        <!-- Points History -->
        <div class="section history-section">
          <h3>Points History</h3>
          <div v-if="pointsHistory.length > 0" class="points-history">
            <div v-for="transaction in pointsHistory.slice(0, 8)" :key="transaction.id" class="history-row"
              :class="transaction.type">
              <div class="history-info">
                <span class="history-description">{{ transaction.description }}</span>
                <span class="history-date">{{ formatDate(transaction.timestamp) }}</span>
              </div>
              <div class="history-points" :class="transaction.type">
                {{ transaction.type === 'earn' ? '+' : '-' }}{{ Math.abs(transaction.points) }}
              </div>
            </div>

            <div v-if="pointsHistory.length > 8" class="show-more">
              <button class="show-more-btn">Show all {{ pointsHistory.length }} transactions</button>
            </div>
          </div>
          <div v-else class="no-history">
            <p>No points transactions yet.</p>
          </div>
        </div>

        <!-- Tier Levels -->
        <div class="section tiers-section">
          <h3>All Loyalty Levels</h3>
          <div class="tiers-grid">
            <div v-for="(tier, tierName) in allTiers" :key="tierName"
              :class="['tier-card', `tier-${tierName}`, { active: loyaltyData.currentTier === tierName }]">
              <div class="tier-header">
                <span class="tier-icon-large">{{ tier.icon }}</span>
                <div class="tier-title">
                  <span class="tier-name">{{ tier.name }}</span>
                  <small>From {{ tier.threshold.toLocaleString() }} Points</small>
                </div>
              </div>
              <div class="tier-highlights">
                <div class="highlight">{{ tier.pointsMultiplier }}x Points</div>
                <div class="highlight">{{ tier.discountRate }}% Discount</div>
                <div v-if="tier.freeShippingThreshold === 0" class="highlight">Free Shipping</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ways to Earn -->
        <div class="section earn-section">
          <h3>Ways to Earn Points</h3>
          <div class="earn-options">
            <div class="earn-card">
              <div class="earn-icon">🛒</div>
              <div class="earn-info">
                <span class="earn-title">Shopping</span>
                <span class="earn-points">{{ getMultiplier(loyaltyData.currentTier) }}x Punkte pro EUR</span>
              </div>
            </div>
            <div class="earn-card">
              <div class="earn-icon">🏆</div>
              <div class="earn-info">
                <span class="earn-title">Ride Challenges</span>
                <span class="earn-points">50 - 500 Punkte</span>
              </div>
            </div>
            <div class="earn-card">
              <div class="earn-icon">🚴</div>
              <div class="earn-info">
                <span class="earn-title">Ride Club Events</span>
                <span class="earn-points">25 Punkte pro Ride</span>
              </div>
            </div>
            <div class="earn-card">
              <div class="earn-icon">🔗</div>
              <div class="earn-info">
                <span class="earn-title">Strava verbinden</span>
                <span class="earn-points">100 Punkte + 1 Pt/km</span>
              </div>
            </div>
            <div class="earn-card">
              <div class="earn-icon">⭐</div>
              <div class="earn-info">
                <span class="earn-title">Produktbewertung</span>
                <span class="earn-points">10 Punkte</span>
              </div>
            </div>
            <div class="earn-card">
              <div class="earn-icon">👥</div>
              <div class="earn-info">
                <span class="earn-title">Freund werben</span>
                <span class="earn-points">100 Punkte</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="sap-btn sap-btn-primary">
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsumerLoyaltyModal',
  props: {
    loyaltyData: {
      type: Object,
      required: true
    },
    orderHistory: {
      type: Array,
      default: () => []
    },
    pointsHistory: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'redeem'],
  setup(props, { emit }) {
    const allTiers = {
      rider: {
        name: 'Rider',
        threshold: 0,
        icon: '🚴',
        pointsMultiplier: 1.0,
        discountRate: 0,
        freeShippingThreshold: 50
      },
      racer: {
        name: 'Racer',
        threshold: 500,
        icon: '⚡',
        pointsMultiplier: 1.25,
        discountRate: 5,
        freeShippingThreshold: 0
      },
      legend: {
        name: 'Legend',
        threshold: 2000,
        icon: '🏆',
        pointsMultiplier: 1.5,
        discountRate: 10,
        freeShippingThreshold: 0
      }
    }

    const redemptionOptions = [
      { points: 100, value: 5, type: 'voucher', description: '5 EUR Gutschein' },
      { points: 200, value: 12, type: 'voucher', description: '12 EUR Gutschein' },
      { points: 500, value: 35, type: 'voucher', description: '35 EUR Gutschein' },
      { points: 1000, value: 80, type: 'voucher', description: '80 EUR Gutschein' },
      { points: 150, value: null, type: 'shipping', description: 'Gratis Express-Versand' },
      { points: 250, value: null, type: 'gift', description: 'Überraschungsgeschenk' },
      { points: 1500, value: null, type: 'experience', description: 'Pro Ride Event Ticket' },
      { points: 2000, value: null, type: 'experience', description: 'Factory Tour Koblenz' }
    ]

    const getTierIcon = (tier) => {
      return allTiers[tier]?.icon || '🏆'
    }

    const getTierName = (tier) => {
      return allTiers[tier]?.name || 'Member'
    }

    const getMultiplier = (tier) => {
      return allTiers[tier]?.pointsMultiplier || 1
    }

    const getPointsValue = (points) => {
      return (points / 100) * 5
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getCategoryLabel = (category) => {
      const labels = {
        rewards: '🎁 Rewards',
        shipping: '📦 Shipping',
        exclusive: '⭐ Exclusive Benefits',
        experiences: '🏔️ Experiences'
      }
      return labels[category] || category
    }

    const getAvailableRedemptions = () => {
      return redemptionOptions
    }

    const redeemPoints = (option) => {
      emit('redeem', option)
    }

    return {
      allTiers,
      getTierIcon,
      getTierName,
      getMultiplier,
      getPointsValue,
      formatDate,
      getCategoryLabel,
      getAvailableRedemptions,
      redeemPoints
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.consumer-loyalty-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tier-badge-large {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 2rem;
  color: white;
  font-weight: 600;
}

.tier-rider {
  background: linear-gradient(135deg, #6B7280, #4B5563);
}

.tier-racer {
  background: linear-gradient(135deg, #1F2937, #111827);
}

.tier-legend {
  background: linear-gradient(135deg, #B8860B, #DAA520);
  color: #333;
}

.tier-icon {
  font-size: 2rem;
}

.tier-info {
  display: flex;
  flex-direction: column;
}

.tier-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-close {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #78350f;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.5);
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #78350f;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #fde68a;
}

/* Points Overview */
.points-hero {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.points-available-large {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.points-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: #92400e;
  line-height: 1;
}

.points-label {
  font-size: 1rem;
  color: #a16207;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.points-value {
  font-size: 1.25rem;
  color: #78350f;
  margin-top: 0.5rem;
}

.points-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fffbeb;
  border-radius: 8px;
  border: 1px solid #fde68a;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #92400e;
}

.stat-label {
  font-size: 0.75rem;
  color: #a16207;
}

/* Redeem Section */
.redeem-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.redeem-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fffbeb;
  border-radius: 12px;
  border: 2px solid #fde68a;
  transition: all 0.3s ease;
}

.redeem-card:not(.disabled):hover {
  border-color: #f59e0b;
  transform: translateY(-2px);
}

.redeem-card.disabled {
  opacity: 0.6;
}

.redeem-type {
  font-size: 2rem;
}

.redeem-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.redeem-description {
  font-weight: 600;
  color: #78350f;
}

.redeem-points {
  font-size: 0.875rem;
  color: #a16207;
}

.redeem-btn {
  background: #92400e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.redeem-btn:hover {
  background: #78350f;
}

.redeem-locked {
  font-size: 0.75rem;
  color: #a16207;
}

/* Benefits Section */
.benefits-categories {
  display: grid;
  gap: 1.5rem;
}

.benefit-category h4 {
  margin: 0 0 0.75rem 0;
  color: #92400e;
  font-size: 0.95rem;
}

.benefits-list {
  display: grid;
  gap: 0.5rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f0fdf4;
  border-radius: 6px;
  border-left: 3px solid #22c55e;
}

.benefit-icon {
  color: #22c55e;
  font-weight: bold;
}

.benefit-text {
  color: #166534;
  font-size: 0.875rem;
}

/* Progress Section */
.next-tier-icon {
  margin-right: 0.25rem;
}

.progress-container {
  background: #fffbeb;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.progress-current {
  color: #92400e;
}

.progress-target {
  color: #a16207;
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #92400e, #f59e0b);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.progress-remaining {
  color: #a16207;
}

.progress-percentage {
  color: #92400e;
  font-weight: 600;
}

.next-tier-preview h4 {
  margin: 0 0 0.75rem 0;
  color: #78350f;
  font-size: 0.95rem;
}

.next-benefits {
  display: grid;
  gap: 0.5rem;
}

.next-benefit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
}

.next-benefit-icon {
  font-weight: bold;
  color: #f59e0b;
}

/* Maxed Section */
.maxed-content {
  background: linear-gradient(135deg, #B8860B, #DAA520);
  color: #333;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.celebration-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.maxed-content h3 {
  border: none;
  color: #333;
  margin-bottom: 0.5rem;
}

/* Points History */
.points-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fffbeb;
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.history-row.earn {
  border-left-color: #22c55e;
}

.history-row.redeem {
  border-left-color: #f59e0b;
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.history-description {
  font-weight: 500;
  color: #78350f;
}

.history-date {
  font-size: 0.75rem;
  color: #a16207;
}

.history-points {
  font-weight: 700;
  font-size: 1.1rem;
}

.history-points.earn {
  color: #22c55e;
}

.history-points.redeem {
  color: #f59e0b;
}

.show-more {
  text-align: center;
  margin-top: 0.5rem;
}

.show-more-btn {
  background: none;
  border: 1px solid #f59e0b;
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.show-more-btn:hover {
  background: #fef3c7;
}

.no-history {
  text-align: center;
  padding: 2rem;
  color: #a16207;
}

/* Tier Cards */
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.tier-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.tier-card.active {
  border-color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.tier-card .tier-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.tier-icon-large {
  font-size: 2rem;
}

.tier-title {
  display: flex;
  flex-direction: column;
}

.tier-title .tier-name {
  font-weight: 600;
  color: #78350f;
}

.tier-title small {
  color: #a16207;
  font-size: 0.75rem;
}

.tier-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.highlight {
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Earn Section */
.earn-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.earn-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fffbeb;
  border-radius: 12px;
  text-align: center;
}

.earn-icon {
  font-size: 2rem;
}

.earn-info {
  display: flex;
  flex-direction: column;
}

.earn-title {
  font-weight: 600;
  color: #78350f;
}

.earn-points {
  font-size: 0.875rem;
  color: #a16207;
}

/* Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #fde68a;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .consumer-loyalty-modal {
    margin: 0.5rem;
    max-width: none;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .points-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .redeem-options {
    grid-template-columns: 1fr;
  }

  .tiers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
