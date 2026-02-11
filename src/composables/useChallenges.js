// composables/useChallenges.js
// Canyon CREW - Ride Challenges Engine
// Strava-integrated challenges with progress tracking

import { reactive, computed } from 'vue'
import { useStrava } from './useStrava'

const CHALLENGES_STORAGE_KEY = 'crew_challenges'

// ============================================
// CHALLENGE DEFINITIONS
// ============================================

const CHALLENGE_TEMPLATES = {

  // --- MONTHLY (Recurring) ---
  'monthly-miles': {
    id: 'monthly-miles',
    name: 'Monthly Miles',
    description: '500 km in einem Monat fahren',
    type: 'monthly',
    targetGoal: 500,
    unit: 'km',
    icon: '🛣️',
    reward: { points: 50, type: 'points', description: '50 Punkte' },
    minTier: 'rider',
    stravaMetric: 'thisMonthDistance'
  },
  'elevation-hunter': {
    id: 'elevation-hunter',
    name: 'Elevation Hunter',
    description: '5.000 Höhenmeter in einem Monat',
    type: 'monthly',
    targetGoal: 5000,
    unit: 'hm',
    icon: '⛰️',
    reward: { points: 75, type: 'points', description: '75 Punkte' },
    minTier: 'rider',
    stravaMetric: 'thisMonthElevation'
  },
  'consistency-king': {
    id: 'consistency-king',
    name: 'Consistency King',
    description: '12 Rides in einem Monat',
    type: 'monthly',
    targetGoal: 12,
    unit: 'rides',
    icon: '📅',
    reward: { points: 50, type: 'points', description: '50 Punkte' },
    minTier: 'rider',
    stravaMetric: 'thisMonthRides'
  },
  'early-bird': {
    id: 'early-bird',
    name: 'Early Bird',
    description: '4 Rides vor 7 Uhr morgens',
    type: 'monthly',
    targetGoal: 4,
    unit: 'rides',
    icon: '🌅',
    reward: { points: 25, type: 'points', description: '25 Punkte' },
    minTier: 'rider',
    stravaMetric: 'earlyRides'
  },

  // --- SEASONAL (Quarterly) ---
  'spring-awakening': {
    id: 'spring-awakening',
    name: 'Spring Awakening',
    description: '1.500 km von März bis Mai',
    type: 'seasonal',
    targetGoal: 1500,
    unit: 'km',
    icon: '🌸',
    reward: { points: 150, type: 'points+voucher', description: '150 Punkte + 15% Gutschein' },
    minTier: 'rider',
    season: 'spring'
  },
  'summer-century': {
    id: 'summer-century',
    name: 'Summer Century',
    description: '3x 100km Rides von Juni bis August',
    type: 'seasonal',
    targetGoal: 3,
    unit: 'centuries',
    icon: '☀️',
    reward: { points: 200, type: 'points+gift', description: '200 Punkte + Bidon Set' },
    minTier: 'racer',
    season: 'summer'
  },
  'autumn-gravel': {
    id: 'autumn-gravel',
    name: 'Autumn Gravel',
    description: '500 km Offroad von September bis November',
    type: 'seasonal',
    targetGoal: 500,
    unit: 'km',
    icon: '🍂',
    reward: { points: 150, type: 'points+gift', description: '150 Punkte + Cap' },
    minTier: 'rider',
    season: 'autumn'
  },
  'winter-warrior': {
    id: 'winter-warrior',
    name: 'Winter Warrior',
    description: '1.000 km von Dezember bis Februar',
    type: 'seasonal',
    targetGoal: 1000,
    unit: 'km',
    icon: '❄️',
    reward: { points: 250, type: 'points+gift', description: '250 Punkte + Buff' },
    minTier: 'rider',
    season: 'winter'
  },

  // --- YEARLY (Mega Challenges) ---
  'canyon-5000': {
    id: 'canyon-5000',
    name: 'Canyon 5000',
    description: '5.000 km in einem Jahr',
    type: 'yearly',
    targetGoal: 5000,
    unit: 'km',
    icon: '🏅',
    reward: { points: 500, type: 'points+gift', description: '500 Punkte + Trikot' },
    minTier: 'rider',
    stravaMetric: 'ytdDistance'
  },
  'everesting-club': {
    id: 'everesting-club',
    name: 'Everesting Club',
    description: '8.848 Höhenmeter in einer einzigen Fahrt',
    type: 'yearly',
    targetGoal: 8848,
    unit: 'hm',
    icon: '🏔️',
    reward: { points: 1000, type: 'points+status', description: '1.000 Punkte + Legend Status' },
    minTier: 'racer'
  },
  'gran-fondo-master': {
    id: 'gran-fondo-master',
    name: 'Gran Fondo Master',
    description: '5x Rides über 100 km',
    type: 'yearly',
    targetGoal: 5,
    unit: 'rides',
    icon: '🎖️',
    reward: { points: 750, type: 'points+event', description: '750 Punkte + Event-Einladung' },
    minTier: 'racer'
  },

  // --- ONBOARDING (One-time) ---
  'first-ride': {
    id: 'first-ride',
    name: 'First Ride',
    description: 'Ersten Ride mit deinem Canyon loggen',
    type: 'onboarding',
    targetGoal: 1,
    unit: 'rides',
    icon: '🎯',
    reward: { points: 25, type: 'points', description: '25 Punkte' },
    minTier: 'rider'
  },
  'strava-connect': {
    id: 'strava-connect',
    name: 'Strava Connect',
    description: 'Verbinde dein Strava Konto',
    type: 'onboarding',
    targetGoal: 1,
    unit: 'count',
    icon: '🔗',
    reward: { points: 50, type: 'points', description: '50 Punkte' },
    minTier: 'rider'
  },
  'first-review': {
    id: 'first-review',
    name: 'First Review',
    description: 'Schreibe deine erste Produktbewertung',
    type: 'onboarding',
    targetGoal: 1,
    unit: 'count',
    icon: '⭐',
    reward: { points: 25, type: 'points', description: '25 Punkte' },
    minTier: 'rider'
  },
  'social-share': {
    id: 'social-share',
    name: 'Social Share',
    description: 'Teile einen Ride auf Social Media',
    type: 'onboarding',
    targetGoal: 1,
    unit: 'count',
    icon: '📱',
    reward: { points: 15, type: 'points', description: '15 Punkte' },
    minTier: 'rider'
  }
}

// ============================================
// SINGLETON STATE
// ============================================

const state = reactive({
  activeChallenges: [],      // Currently active challenges with progress
  completedChallenges: [],   // Completed challenge IDs
  isInitialized: false
})

// ============================================
// COMPOSABLE
// ============================================

export function useChallenges() {

  // ---- COMPUTED ----
  const activeChallenges = computed(() => state.activeChallenges)
  const completedChallenges = computed(() => state.completedChallenges)

  const activeChallengeCount = computed(() => state.activeChallenges.length)
  const completedChallengeCount = computed(() => state.completedChallenges.length)

  // ---- CHALLENGE CATALOG ----

  function getAvailableChallenges(tier = 'rider') {
    const tierOrder = ['rider', 'racer', 'legend']
    const tierIndex = tierOrder.indexOf(tier)
    const activeIds = state.activeChallenges.map(c => c.id)
    const completedIds = state.completedChallenges

    return Object.values(CHALLENGE_TEMPLATES).filter(challenge => {
      // Filter by tier
      const minTierIndex = tierOrder.indexOf(challenge.minTier || 'rider')
      if (tierIndex < minTierIndex) return false

      // Filter out already active
      if (activeIds.includes(challenge.id)) return false

      // Onboarding challenges: only show if not completed
      if (challenge.type === 'onboarding' && completedIds.includes(challenge.id)) return false

      return true
    })
  }

  function getChallengesByType(type) {
    return Object.values(CHALLENGE_TEMPLATES).filter(c => c.type === type)
  }

  // ---- START / COMPLETE ----

  function startChallenge(challengeId) {
    const template = CHALLENGE_TEMPLATES[challengeId]
    if (!template) return null

    // Don't start if already active
    if (state.activeChallenges.find(c => c.id === challengeId)) return null

    const challenge = {
      ...template,
      currentProgress: 0,
      startedAt: new Date().toISOString(),
      completedAt: null
    }

    state.activeChallenges.push(challenge)
    saveToLocalStorage()

    console.log('[Challenges] Started:', challengeId)
    return challenge
  }

  function completeChallenge(challengeId) {
    const index = state.activeChallenges.findIndex(c => c.id === challengeId)
    if (index === -1) return null

    const challenge = state.activeChallenges[index]
    challenge.completedAt = new Date().toISOString()

    // Move to completed
    state.activeChallenges.splice(index, 1)
    if (!state.completedChallenges.includes(challengeId)) {
      state.completedChallenges.push(challengeId)
    }

    saveToLocalStorage()
    console.log('[Challenges] Completed:', challengeId, 'Reward:', challenge.reward)
    return challenge
  }

  // ---- PROGRESS TRACKING ----

  function updateChallengeProgress(challengeId, newProgress) {
    const challenge = state.activeChallenges.find(c => c.id === challengeId)
    if (!challenge) return null

    challenge.currentProgress = Math.min(newProgress, challenge.targetGoal)

    // Auto-complete if goal reached
    if (challenge.currentProgress >= challenge.targetGoal) {
      return completeChallenge(challengeId)
    }

    saveToLocalStorage()
    return challenge
  }

  function updateAllChallengesFromStrava() {
    const { state: stravaState, isConnected, thisMonthStats } = useStrava()
    if (!isConnected.value) return []

    const updated = []

    for (const challenge of state.activeChallenges) {
      let newProgress = challenge.currentProgress

      if (challenge.stravaMetric === 'thisMonthDistance') {
        newProgress = thisMonthStats.value?.distance || 0
      } else if (challenge.stravaMetric === 'thisMonthElevation') {
        newProgress = thisMonthStats.value?.elevation || 0
      } else if (challenge.stravaMetric === 'thisMonthRides') {
        newProgress = thisMonthStats.value?.rides || 0
      } else if (challenge.stravaMetric === 'ytdDistance') {
        newProgress = stravaState.athlete?.stats?.ytdDistance || 0
      } else if (challenge.stravaMetric === 'earlyRides') {
        // Count rides before 7am this month
        const earlyRides = stravaState.activities.filter(a => {
          const hour = new Date(a.date).getHours()
          return hour < 7
        }).length
        newProgress = earlyRides
      }

      if (newProgress !== challenge.currentProgress) {
        const result = updateChallengeProgress(challenge.id, newProgress)
        if (result) updated.push(result)
      }
    }

    return updated
  }

  function getChallengeProgress(challengeId) {
    const challenge = state.activeChallenges.find(c => c.id === challengeId)
    if (!challenge) return null

    return {
      current: challenge.currentProgress,
      target: challenge.targetGoal,
      percentage: Math.min((challenge.currentProgress / challenge.targetGoal) * 100, 100),
      remaining: Math.max(challenge.targetGoal - challenge.currentProgress, 0),
      unit: challenge.unit
    }
  }

  // ---- LOCAL STORAGE ----

  function saveToLocalStorage() {
    try {
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify({
        activeChallenges: state.activeChallenges,
        completedChallenges: state.completedChallenges
      }))
    } catch (e) {
      console.error('[Challenges] Failed to save:', e)
    }
  }

  function restoreFromLocalStorage() {
    try {
      const stored = localStorage.getItem(CHALLENGES_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        state.activeChallenges = data.activeChallenges || []
        state.completedChallenges = data.completedChallenges || []
      }
    } catch (e) {
      console.error('[Challenges] Failed to restore:', e)
    }
  }

  function initializeChallenges() {
    if (state.isInitialized) return
    restoreFromLocalStorage()
    state.isInitialized = true
  }

  function resetChallenges() {
    state.activeChallenges = []
    state.completedChallenges = []
    state.isInitialized = false
    localStorage.removeItem(CHALLENGES_STORAGE_KEY)
  }

  // ---- PUBLIC API ----

  return {
    // State
    activeChallenges,
    completedChallenges,
    activeChallengeCount,
    completedChallengeCount,

    // Catalog
    challengeTemplates: CHALLENGE_TEMPLATES,
    getAvailableChallenges,
    getChallengesByType,

    // Actions
    startChallenge,
    completeChallenge,
    updateChallengeProgress,
    updateAllChallengesFromStrava,
    getChallengeProgress,

    // Lifecycle
    initializeChallenges,
    resetChallenges
  }
}
