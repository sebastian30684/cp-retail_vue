<template>
  <div v-if="isLoggedIn && loyaltyMetrics.lifetimePoints > 0" class="loyalty-floating-container">
    <!-- Success Toast Notification -->
    <Transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">
        <div class="toast-icon">✓</div>
        <div class="toast-content">
          <strong>{{ successToastMessage }}</strong>
          <span>Check your cart to see the discount</span>
        </div>
      </div>
    </Transition>

    <!-- Backdrop when modal is open -->
    <div v-if="isModalOpen" class="modal-backdrop" @click="isModalOpen = false"></div>

    <!-- Floating Button -->
    <button @click="isModalOpen = !isModalOpen" class="loyalty-floating-btn">
      <div class="tier-icon-wrapper">
        <span class="tier-emoji">{{ tierIcon }}</span>
        <span v-if="loyaltyMetrics.availablePoints > 0" class="points-badge">
          {{ pointsBadge }}
        </span>
      </div>
      <div class="btn-text">
        <span class="btn-title">Loyalty Program</span>
        <span class="btn-subtitle">{{ tierName }} &bull; {{ loyaltyMetrics.availablePoints.toLocaleString() }} Points</span>
      </div>
    </button>

    <!-- Compact Modal (like B2B-Shop) -->
    <div v-if="isModalOpen" class="loyalty-modal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2>Loyalty Program</h2>
          <button @click="isModalOpen = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-nav">
          <button
            @click="activeTab = 'overview'"
            :class="['tab-btn', { active: activeTab === 'overview' }]"
          >Overview</button>
          <button
            @click="activeTab = 'history'"
            :class="['tab-btn', { active: activeTab === 'history' }]"
          >History</button>
          <button
            @click="activeTab = 'redeem'"
            :class="['tab-btn', { active: activeTab === 'redeem' }]"
          >Redeem</button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="tab-panel">
            <div class="tier-display">
              <div class="tier-icon-large">{{ tierIcon }}</div>
              <div class="tier-info">
                <h3>{{ tierName }} Member</h3>
                <p class="points-large">{{ loyaltyMetrics.availablePoints.toLocaleString() }} Points</p>
                <p class="points-value">= {{ getPointsValue(loyaltyMetrics.availablePoints) }} EUR</p>
              </div>
            </div>

            <!-- Progress to Next Tier -->
            <div v-if="loyaltyMetrics.nextTierInfo" class="progress-section">
              <div class="progress-header">
                <span>Progress to {{ loyaltyMetrics.nextTierInfo.name }}</span>
                <span>{{ loyaltyMetrics.nextTierInfo.remaining.toLocaleString() }} points needed</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: loyaltyMetrics.tierProgress + '%' }"></div>
              </div>
            </div>

            <!-- Benefits -->
            <div class="benefits-section">
              <h4>Your Benefits</h4>
              <ul class="benefits-list">
                <li v-for="benefit in loyaltyMetrics.activeBenefits.slice(0, 4)" :key="benefit">
                  <span class="check-icon">✓</span>
                  <span>{{ benefit }}</span>
                </li>
              </ul>
            </div>

            <!-- Recent Activity -->
            <div v-if="pointsHistory.length > 0" class="recent-activity">
              <h4>Recent Activity</h4>
              <div class="activity-list">
                <div v-for="tx in pointsHistory.slice(0, 3)" :key="tx.id" class="activity-item">
                  <div class="activity-info">
                    <span class="activity-desc">{{ tx.description }}</span>
                    <span class="activity-date">{{ formatDate(tx.timestamp) }}</span>
                  </div>
                  <span :class="['activity-points', tx.type]">
                    {{ tx.type === 'earn' ? '+' : '' }}{{ tx.points }} pts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="tab-panel">
            <h3>Points History</h3>
            <div v-if="pointsHistory.length > 0" class="history-list">
              <div v-for="tx in pointsHistory" :key="tx.id" class="history-item">
                <div class="history-info">
                  <span class="history-desc">{{ tx.description }}</span>
                  <span class="history-date">{{ formatDate(tx.timestamp) }}</span>
                </div>
                <span :class="['history-points', tx.type]">
                  {{ tx.type === 'earn' ? '+' : '' }}{{ tx.points }} pts
                </span>
              </div>
            </div>
            <p v-else class="empty-state">No points history yet</p>
          </div>

          <!-- Redeem Tab -->
          <div v-if="activeTab === 'redeem'" class="tab-panel">
            <h3>Redeem Your Points</h3>
            <p class="available-points">Available: <strong>{{ loyaltyMetrics.availablePoints.toLocaleString() }}</strong> Points</p>

            <!-- Warning if discount already applied -->
            <div v-if="hasActiveDiscount" class="discount-warning">
              <span class="warning-icon">⚠️</span>
              <span>A discount is already applied to your cart. Open your cart to remove it first.</span>
            </div>

            <div class="redeem-options">
              <div v-for="option in redemptionOptions" :key="option.points" class="redeem-option">
                <div class="redeem-info">
                  <span class="redeem-desc">{{ option.description }}</span>
                  <span class="redeem-points">{{ option.points }} pts</span>
                </div>
                <button
                  @click="handleRedeem(option)"
                  :disabled="loyaltyMetrics.availablePoints < option.points"
                  :class="['redeem-btn', { disabled: loyaltyMetrics.availablePoints < option.points }]"
                >
                  {{ loyaltyMetrics.availablePoints >= option.points ? 'Redeem' : 'Not enough' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useConsumerLoyalty, loyaltyStorage } from '../composables/useConsumerLoyalty.js'
import { useConsumerTracking } from '../composables/useConsumerLoyaltyTracking.js'

export default {
  name: 'LoyaltyFloatingButton',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const user = inject('user', { UID: 'demo_user', isLoggedIn: false })
    const cartDiscount = inject('cartDiscount', { type: 'none', value: 0, description: '' })
    const applyCartDiscount = inject('applyCartDiscount', () => {})
    const { calculateTier, getTierData, getNextTierInfo, getActiveBenefits, getCategorizedBenefits } = useConsumerLoyalty()
    const { trackCdpLoyaltyActivity } = useConsumerTracking()

    const isModalOpen = ref(false)
    const activeTab = ref('overview')
    const orderHistory = ref([])
    const pointsHistory = ref([])
    const refreshKey = ref(0)
    const showSuccessToast = ref(false)
    const successToastMessage = ref('')
    let toastTimeout = null

    const redemptionOptions = [
      { points: 100, value: 5, discountType: 'fixed', description: '5 EUR Voucher' },
      { points: 200, value: 12, discountType: 'fixed', description: '12 EUR Voucher' },
      { points: 500, value: 35, discountType: 'fixed', description: '35 EUR Voucher' },
      { points: 150, value: 4.95, discountType: 'shipping', description: 'Free Express Shipping' }
    ]

    // Check if discount is already applied
    const hasActiveDiscount = computed(() => {
      return cartDiscount && cartDiscount.type !== 'none'
    })

    const loadLoyaltyData = () => {
      const userId = user.UID || 'demo_user'
      orderHistory.value = loyaltyStorage.getOrderHistory(userId)
      pointsHistory.value = loyaltyStorage.getPointsHistory(userId)
      refreshKey.value++
    }

    const loyaltyMetrics = computed(() => {
      // eslint-disable-next-line no-unused-vars
      const _ = refreshKey.value
      const userId = user.UID || 'demo_user'
      const balance = loyaltyStorage.getPointsBalance(userId)

      const currentTier = calculateTier(balance.lifetimePoints)
      const tierData = getTierData(currentTier)
      const activeBenefits = getActiveBenefits(currentTier)
      const categorizedBenefits = getCategorizedBenefits(currentTier)
      const nextTierInfo = getNextTierInfo(balance.lifetimePoints)

      return {
        currentTier,
        lifetimePoints: balance.lifetimePoints,
        availablePoints: balance.availablePoints,
        pointsMultiplier: tierData.pointsMultiplier || 1,
        activeBenefits,
        categorizedBenefits,
        nextTierInfo,
        tierProgress: nextTierInfo ? nextTierInfo.progress : 100
      }
    })

    const tierIcon = computed(() => {
      const icons = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' }
      return icons[loyaltyMetrics.value.currentTier] || '🏆'
    })

    const tierName = computed(() => {
      const names = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }
      return names[loyaltyMetrics.value.currentTier] || 'Member'
    })

    const pointsBadge = computed(() => {
      const points = loyaltyMetrics.value.availablePoints
      return points > 999 ? '999+' : points.toString()
    })

    const getPointsValue = (points) => {
      return ((points / 100) * 5).toFixed(2)
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short'
      })
    }

    const showToast = (message) => {
      // Clear any existing timeout
      if (toastTimeout) {
        clearTimeout(toastTimeout)
      }

      successToastMessage.value = message
      showSuccessToast.value = true

      // Auto-hide after 4 seconds
      toastTimeout = setTimeout(() => {
        showSuccessToast.value = false
      }, 4000)
    }

    const handleRedeem = (option) => {
      if (loyaltyMetrics.value.availablePoints < option.points) return

      // Check if a discount is already applied
      if (hasActiveDiscount.value) {
        alert('A discount is already applied to your cart. Please remove it first.')
        return
      }

      const userId = user.UID || 'demo_user'
      const redemptionId = `REDEEM-${Date.now()}`

      // Apply discount to cart
      applyCartDiscount({
        type: option.discountType,
        value: option.value,
        description: option.description,
        loyaltyRedemptionId: redemptionId
      })

      // Deduct points (tracking happens in App.vue after order completion)
      loyaltyStorage.addPoints(userId, -option.points, `Redeemed: ${option.description}`)

      loadLoyaltyData()

      // Close modal and show success toast
      isModalOpen.value = false
      showToast(`${option.description} applied!`)
    }

    onMounted(() => {
      if (props.isLoggedIn) {
        loadLoyaltyData()
      }
    })

    watch(() => props.isLoggedIn, (newVal) => {
      if (newVal) {
        loadLoyaltyData()
      }
    })

    // Refresh data and track view when modal is opened
    watch(isModalOpen, (isOpen) => {
      if (isOpen) {
        loadLoyaltyData()

        // Track loyalty view in CDP
        const userId = user.UID || 'demo_user'
        const balance = loyaltyStorage.getPointsBalance(userId)
        const currentTier = calculateTier(balance.lifetimePoints)

        trackCdpLoyaltyActivity({
          cdcUid: userId,
          activityType: 'view',
          pointsAmount: 0,
          pointsBalance: balance.availablePoints,
          loyaltyTier: currentTier
        })
      }
    })

    return {
      isModalOpen,
      activeTab,
      loyaltyMetrics,
      orderHistory,
      pointsHistory,
      redemptionOptions,
      tierIcon,
      tierName,
      pointsBadge,
      hasActiveDiscount,
      showSuccessToast,
      successToastMessage,
      getPointsValue,
      formatDate,
      handleRedeem
    }
  }
}
</script>

<style scoped>
.loyalty-floating-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
}

/* Floating Button */
.loyalty-floating-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  z-index: 51;
}

.loyalty-floating-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.5);
}

.tier-icon-wrapper {
  position: relative;
}

.tier-emoji {
  font-size: 1.75rem;
}

.points-badge {
  position: absolute;
  top: -10px;
  right: -12px;
  background: #eab308;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-subtitle {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Compact Modal */
.loyalty-modal {
  position: fixed;
  right: 1rem;
  bottom: 5rem;
  width: 380px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 51;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  color: white;
  padding: 0.25rem;
  border-radius: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Tab Content */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.tab-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1f2937;
}

/* Overview Tab */
.tier-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.tier-icon-large {
  font-size: 2.5rem;
}

.tier-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #1e40af;
}

.points-large {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e40af;
}

.points-value {
  margin: 0;
  font-size: 0.8rem;
  color: #3b82f6;
}

/* Progress Section */
.progress-section {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Benefits Section */
.benefits-section {
  margin-bottom: 1rem;
}

.benefits-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.benefits-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.benefits-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.8rem;
  color: #4b5563;
}

.check-icon {
  color: #22c55e;
  font-weight: bold;
}

/* Recent Activity */
.recent-activity h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
}

.activity-info {
  display: flex;
  flex-direction: column;
}

.activity-desc {
  font-size: 0.8rem;
  color: #374151;
}

.activity-date {
  font-size: 0.7rem;
  color: #9ca3af;
}

.activity-points {
  font-size: 0.8rem;
  font-weight: 600;
}

.activity-points.earn {
  color: #22c55e;
}

.activity-points.redeem {
  color: #f59e0b;
}

/* History Tab */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid transparent;
}

.history-item:has(.history-points.earn) {
  border-left-color: #22c55e;
}

.history-item:has(.history-points.redeem) {
  border-left-color: #f59e0b;
}

.history-info {
  display: flex;
  flex-direction: column;
}

.history-desc {
  font-size: 0.85rem;
  color: #374151;
}

.history-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.history-points {
  font-size: 0.9rem;
  font-weight: 600;
}

.history-points.earn {
  color: #22c55e;
}

.history-points.redeem {
  color: #f59e0b;
}

/* Redeem Tab */
.available-points {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #374151;
}

.available-points strong {
  color: #3b82f6;
}

.redeem-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.redeem-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.redeem-info {
  display: flex;
  flex-direction: column;
}

.redeem-desc {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.redeem-points {
  font-size: 0.75rem;
  color: #6b7280;
}

.redeem-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.redeem-btn:hover:not(.disabled) {
  background: #2563eb;
}

.redeem-btn.disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
}

/* Discount Warning */
.discount-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #92400e;
}

.warning-icon {
  font-size: 1rem;
}

/* Success Toast */
.success-toast {
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(5, 150, 105, 0.4);
  z-index: 60;
  white-space: nowrap;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast-content strong {
  font-size: 0.95rem;
  font-weight: 600;
}

.toast-content span {
  font-size: 0.85rem;
  opacity: 0.9;
  padding-left: 0.75rem;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

/* Toast Animation */
.toast-enter-active {
  animation: toast-in 0.4s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.95);
  }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .loyalty-modal {
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
    bottom: 4.5rem;
  }

  .loyalty-floating-btn {
    padding: 0.75rem 1rem;
  }

  .tier-emoji {
    font-size: 1.5rem;
  }

  .btn-title {
    font-size: 0.8rem;
  }

  .btn-subtitle {
    font-size: 0.7rem;
  }

  .success-toast {
    left: 1rem;
    right: 1rem;
    transform: none;
    bottom: 5rem;
    white-space: normal;
    padding: 1rem 1.25rem;
  }

  .toast-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .toast-content span {
    padding-left: 0;
    border-left: none;
  }

  .toast-enter-active {
    animation: toast-in-mobile 0.4s ease-out;
  }

  .toast-leave-active {
    animation: toast-out-mobile 0.3s ease-in;
  }

  @keyframes toast-in-mobile {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes toast-out-mobile {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
  }
}
</style>
