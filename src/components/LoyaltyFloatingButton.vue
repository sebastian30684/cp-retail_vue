<template>
  <div v-if="isLoggedIn" class="loyalty-floating-container">
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
        <span class="btn-title">Canyon CREW</span>
        <span class="btn-subtitle">{{ tierName }} &bull; {{ loyaltyMetrics.availablePoints.toLocaleString() }} Points</span>
      </div>
    </button>

    <!-- Compact Modal (like B2B-Shop) -->
    <div v-if="isModalOpen" class="loyalty-modal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2>Canyon CREW</h2>
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
            @click="activeTab = 'challenges'"
            :class="['tab-btn', { active: activeTab === 'challenges' }]"
          >Challenges</button>
          <button
            @click="activeTab = 'clubs'"
            :class="['tab-btn', { active: activeTab === 'clubs' }]"
          >Clubs</button>
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
                <h3>CREW {{ tierName }}</h3>
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

          <!-- Challenges Tab -->
          <div v-if="activeTab === 'challenges'" class="tab-panel">
            <!-- Active Challenges -->
            <div v-if="activeChallenges.length > 0" class="challenges-section">
              <h4>Active Challenges</h4>
              <div class="challenge-list">
                <div v-for="ch in activeChallenges" :key="ch.id" class="challenge-card">
                  <div class="challenge-header">
                    <span class="challenge-icon">{{ ch.icon }}</span>
                    <div class="challenge-info">
                      <span class="challenge-name">{{ ch.name }}</span>
                      <span class="challenge-desc">{{ ch.description }}</span>
                    </div>
                  </div>
                  <div class="challenge-progress">
                    <div class="progress-bar-sm">
                      <div class="progress-fill-sm" :style="{ width: Math.min(100, (ch.currentProgress / ch.targetGoal) * 100) + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ ch.currentProgress }} / {{ ch.targetGoal }} {{ ch.unit }}</span>
                  </div>
                  <div class="challenge-reward">
                    <span>🎁 {{ ch.reward.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Available Challenges -->
            <div class="challenges-section">
              <h4>Available Challenges</h4>
              <div v-if="availableChallengesList.length > 0" class="challenge-list">
                <div v-for="ch in availableChallengesList" :key="ch.id" class="challenge-card available">
                  <div class="challenge-header">
                    <span class="challenge-icon">{{ ch.icon }}</span>
                    <div class="challenge-info">
                      <span class="challenge-name">{{ ch.name }}</span>
                      <span class="challenge-desc">{{ ch.description }}</span>
                    </div>
                  </div>
                  <div class="challenge-reward">
                    <span>🎁 {{ ch.reward.description }}</span>
                  </div>
                  <button class="start-challenge-btn" @click="handleStartChallenge(ch.id)">Start Challenge</button>
                </div>
              </div>
              <p v-else class="empty-state">No more challenges available</p>
            </div>

            <div v-if="completedChallengeCount > 0" class="challenges-completed">
              ✅ {{ completedChallengeCount }} challenge{{ completedChallengeCount > 1 ? 's' : '' }} completed
            </div>

            <button v-if="activeChallenges.length > 0" class="sync-strava-btn" @click="handleUpdateChallengesFromStrava">
              🔄 Update from Strava
            </button>
          </div>

          <!-- Clubs Tab -->
          <div v-if="activeTab === 'clubs'" class="tab-panel">
            <!-- My Clubs -->
            <div v-if="myClubs.length > 0" class="clubs-section">
              <h4>My Clubs</h4>
              <div class="club-list">
                <div v-for="club in myClubs" :key="club.id" class="club-card joined">
                  <span class="club-icon">{{ club.icon }}</span>
                  <div class="club-info">
                    <span class="club-name">{{ club.name }}</span>
                    <span class="club-location">{{ club.location }}</span>
                  </div>
                  <span class="club-members">{{ club.memberCount }} members</span>
                </div>
              </div>
            </div>

            <!-- Upcoming Rides -->
            <div v-if="nextUpcomingRides.length > 0" class="clubs-section">
              <h4>Upcoming Rides</h4>
              <div class="ride-list">
                <div v-for="ride in nextUpcomingRides" :key="ride.id" class="ride-card">
                  <div class="ride-date">
                    <span class="ride-day">{{ formatRideDay(ride.date) }}</span>
                    <span class="ride-month">{{ formatRideMonth(ride.date) }}</span>
                  </div>
                  <div class="ride-info">
                    <span class="ride-name">{{ ride.name }}</span>
                    <span class="ride-details">{{ ride.distance }} km · {{ ride.difficulty }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Available Clubs -->
            <div v-if="availableClubs.length > 0" class="clubs-section">
              <h4>Join a Club</h4>
              <div class="club-list">
                <div v-for="club in availableClubs" :key="club.id" class="club-card">
                  <span class="club-icon">{{ club.icon }}</span>
                  <div class="club-info">
                    <span class="club-name">{{ club.name }}</span>
                    <span class="club-location">{{ club.location }}</span>
                  </div>
                  <button class="join-club-btn" @click="handleJoinClub(club.id)">Join +25pts</button>
                </div>
              </div>
            </div>

            <!-- Passport -->
            <div class="clubs-section passport-section">
              <h4>🛂 Ride Passport</h4>
              <div class="passport-stats">
                <span class="passport-rides">{{ passport.totalRides }} Rides</span>
                <div class="passport-milestones">
                  <span v-for="ms in passportMilestones" :key="ms.rides" :class="['milestone-badge', { achieved: passport.totalRides >= ms.rides }]">
                    {{ ms.icon }} {{ ms.reward }}
                  </span>
                </div>
              </div>
            </div>
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
              <div v-for="option in redemptionOptions" :key="option.description" :class="['redeem-option', { 'product-option': option.type === 'product' }]">
                <div class="redeem-info">
                  <span class="redeem-icon">{{ option.icon }}</span>
                  <div>
                    <span class="redeem-desc">{{ option.description }}</span>
                    <span class="redeem-points">{{ option.points }} pts</span>
                  </div>
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
import { useChallenges } from '../composables/useChallenges.js'
import { useRideClubs } from '../composables/useRideClubs.js'

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
    const addToCart = inject('addToCart', () => {})
    const { calculateTier, getTierData, getNextTierInfo, getActiveBenefits, getCategorizedBenefits } = useConsumerLoyalty()
    const { trackCdpLoyaltyActivity, trackCdpChallengeActivity, trackCdpRideClubActivity } = useConsumerTracking()

    // Challenges
    const {
      activeChallenges,
      completedChallengeCount,
      getAvailableChallenges,
      startChallenge,
      updateAllChallengesFromStrava,
      initializeChallenges
    } = useChallenges()

    // Ride Clubs
    const {
      myClubs,
      availableClubs,
      passport,
      upcomingRides,
      passportMilestones,
      joinClub,
      initializeRideClubs
    } = useRideClubs()

    const isModalOpen = ref(false)
    const activeTab = ref('overview')
    const orderHistory = ref([])
    const pointsHistory = ref([])
    const refreshKey = ref(0)
    const showSuccessToast = ref(false)
    const successToastMessage = ref('')
    let toastTimeout = null

    const allRedemptionOptions = [
      { points: 100, value: 5, type: 'discount', discountType: 'fixed', description: '5 EUR Voucher', icon: '🎟️', minTier: 'rider' },
      { points: 200, value: 12, type: 'discount', discountType: 'fixed', description: '12 EUR Voucher', icon: '🎟️', minTier: 'rider' },
      { points: 500, value: 35, type: 'discount', discountType: 'fixed', description: '35 EUR Voucher', icon: '🎟️', minTier: 'rider' },
      { points: 150, value: 4.95, type: 'discount', discountType: 'shipping', description: 'Free Express Shipping', icon: '📦', minTier: 'rider' },
      { points: 500, value: 0, type: 'product', description: 'Free Canyon Cycling Socks', icon: '👕', minTier: 'racer' },
      { points: 1000, value: 0, type: 'product', description: 'Free Canyon CORE Road Jersey', icon: '👕', minTier: 'racer' },
      { points: 1500, value: 0, type: 'product', description: 'Free Canyon Bibshort', icon: '👕', minTier: 'legend' },
      { points: 2000, value: 0, type: 'product', description: 'Free Canyon Premium Kit', icon: '👕', minTier: 'legend' }
    ]

    const tierOrder = ['rider', 'racer', 'legend']

    const redemptionOptions = computed(() => {
      const currentTier = loyaltyMetrics.value.currentTier
      const currentTierIndex = tierOrder.indexOf(currentTier)
      return allRedemptionOptions.filter(opt => {
        const minTierIndex = tierOrder.indexOf(opt.minTier || 'rider')
        return currentTierIndex >= minTierIndex
      })
    })

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
      const icons = { rider: '🚴', racer: '⚡', legend: '🏆' }
      return icons[loyaltyMetrics.value.currentTier] || '🚴'
    })

    const tierName = computed(() => {
      const names = { rider: 'Rider', racer: 'Racer', legend: 'Legend' }
      return names[loyaltyMetrics.value.currentTier] || 'Rider'
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

      const userId = user.UID || 'demo_user'

      if (option.type === 'product') {
        // Product redemption: deduct points + add free item to cart
        loyaltyStorage.addPoints(userId, -option.points, `Redeemed: ${option.description}`)

        // Add free product to cart
        const freeProduct = {
          id: `crew-reward-${Date.now()}`,
          productName: option.description,
          category: 'CREW Reward',
          price: 0,
          originalPrice: option.points / 10, // show original value
          image: null,
          isCREWReward: true
        }
        addToCart(freeProduct)

        loadLoyaltyData()
        isModalOpen.value = false
        showToast(`${option.description} added to cart!`)
        return
      }

      // Discount redemption: apply to cart
      if (hasActiveDiscount.value) {
        alert('A discount is already applied to your cart. Please remove it first.')
        return
      }

      const redemptionId = `REDEEM-${Date.now()}`

      applyCartDiscount({
        type: option.discountType,
        value: option.value,
        description: option.description,
        loyaltyRedemptionId: redemptionId
      })

      loyaltyStorage.addPoints(userId, -option.points, `Redeemed: ${option.description}`)

      loadLoyaltyData()

      isModalOpen.value = false
      showToast(`${option.description} applied!`)
    }

    // Challenge & Club computed/helpers
    const availableChallengesList = computed(() => {
      const tier = loyaltyMetrics.value.currentTier
      return getAvailableChallenges(tier)
    })

    const nextUpcomingRides = computed(() => {
      return upcomingRides.value.slice(0, 3)
    })

    const handleStartChallenge = (challengeId) => {
      const challenge = startChallenge(challengeId)
      // Track ChallengeActivity in CDP
      const userId = user.UID || 'demo_user'
      const template = availableChallengesList.value.find(c => c.id === challengeId) || {}
      trackCdpChallengeActivity({
        cdcUid: userId,
        challengeId: challengeId,
        challengeName: template.name || challengeId,
        challengeType: template.type || 'monthly',
        activityType: 'started',
        currentProgress: 0,
        targetGoal: template.targetGoal || 0,
        unit: template.unit || 'km',
        pointsEarned: 0,
        rewardType: template.reward?.type || 'points',
        rewardDescription: template.reward?.description || ''
      })
      console.log('📤 ChallengeActivity: started', challengeId)
    }

    const handleUpdateChallengesFromStrava = () => {
      const updated = updateAllChallengesFromStrava()
      if (updated.length > 0) {
        showToast(`Updated ${updated.length} challenge${updated.length > 1 ? 's' : ''} from Strava`)
      }
    }

    const handleJoinClub = (clubId) => {
      joinClub(clubId)
      const userId = user.UID || 'demo_user'
      loyaltyStorage.addPoints(userId, 25, 'Joined Ride Club')
      loadLoyaltyData()

      // Track RideClubActivity in CDP
      const club = availableClubs.value.find(c => c.id === clubId) || {}
      trackCdpRideClubActivity({
        cdcUid: userId,
        clubId: clubId,
        clubName: club.name || clubId,
        clubType: club.type || 'official',
        activityType: 'joined',
        rideId: null,
        rideName: null,
        totalRides: 0,
        pointsEarned: 25,
        milestoneType: null,
        milestoneReward: null
      })
      console.log('📤 RideClubActivity: joined', clubId)

      showToast('Joined club! +25 Points')
    }

    const formatRideDay = (dateStr) => {
      return new Date(dateStr).getDate()
    }

    const formatRideMonth = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' })
    }

    onMounted(() => {
      if (props.isLoggedIn) {
        loadLoyaltyData()
        initializeChallenges()
        initializeRideClubs()
      }
    })

    watch(() => props.isLoggedIn, (newVal) => {
      if (newVal) {
        loadLoyaltyData()
        initializeChallenges()
        initializeRideClubs()
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
      handleRedeem,
      // Challenges
      activeChallenges,
      completedChallengeCount,
      availableChallengesList,
      handleStartChallenge,
      handleUpdateChallengesFromStrava,
      // Clubs
      myClubs,
      availableClubs,
      passport,
      passportMilestones,
      nextUpcomingRides,
      handleJoinClub,
      formatRideDay,
      formatRideMonth
    }
  }
}
</script>

<style scoped>
.loyalty-floating-container {
  position: fixed;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 50;
  pointer-events: none;
}

/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
  pointer-events: auto;
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
  pointer-events: auto;
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
  pointer-events: auto;
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
  padding: 0.75rem 0.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.8rem;
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
  align-items: center;
  gap: 0.5rem;
}

.redeem-info > div {
  display: flex;
  flex-direction: column;
}

.redeem-icon {
  font-size: 1.1rem;
}

.redeem-option.product-option {
  background: linear-gradient(135deg, #fef3c7, #fefce8);
  border-color: #f59e0b;
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

/* Challenges Tab */
.challenges-section {
  margin-bottom: 1rem;
}

.challenges-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #374151;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.challenge-card {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.challenge-card.available {
  border-style: dashed;
}

.challenge-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.challenge-icon {
  font-size: 1.25rem;
}

.challenge-info {
  display: flex;
  flex-direction: column;
}

.challenge-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
}

.challenge-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

.challenge-progress {
  margin-bottom: 0.35rem;
}

.progress-bar-sm {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill-sm {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #eab308);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.7rem;
  color: #6b7280;
}

.challenge-reward {
  font-size: 0.75rem;
  color: #92400e;
}

.start-challenge-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.4rem;
  background: linear-gradient(135deg, #f59e0b, #eab308);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.start-challenge-btn:hover {
  filter: brightness(1.1);
}

.challenges-completed {
  text-align: center;
  font-size: 0.8rem;
  color: #059669;
  padding: 0.5rem;
  background: #ecfdf5;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.sync-strava-btn {
  width: 100%;
  padding: 0.5rem;
  background: white;
  border: 1px solid #FC4C02;
  color: #FC4C02;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.sync-strava-btn:hover {
  background: #fff7ed;
}

/* Clubs Tab */
.clubs-section {
  margin-bottom: 1rem;
}

.clubs-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #374151;
}

.club-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.club-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.club-card.joined {
  border-left: 3px solid #3b82f6;
}

.club-icon {
  font-size: 1.2rem;
}

.club-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1f2937;
}

.club-location {
  font-size: 0.7rem;
  color: #6b7280;
}

.club-members {
  font-size: 0.7rem;
  color: #9ca3af;
}

.join-club-btn {
  padding: 0.3rem 0.6rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.join-club-btn:hover {
  background: #2563eb;
}

/* Ride List */
.ride-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ride-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.ride-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 36px;
  padding: 0.25rem;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
}

.ride-day {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
}

.ride-month {
  font-size: 0.6rem;
  text-transform: uppercase;
}

.ride-info {
  display: flex;
  flex-direction: column;
}

.ride-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1f2937;
}

.ride-details {
  font-size: 0.7rem;
  color: #6b7280;
}

/* Passport */
.passport-section {
  padding: 0.75rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 10px;
}

.passport-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.passport-rides {
  font-size: 1rem;
  font-weight: 700;
  color: #1e40af;
}

.passport-milestones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.milestone-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 12px;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.milestone-badge.achieved {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
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
  pointer-events: auto;
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
