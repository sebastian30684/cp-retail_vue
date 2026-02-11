// composables/useStrava.js
// Strava Mock Integration - Demo fitness tracking for bike shop
// No real API - uses mock data for demonstration purposes

import { reactive, computed, ref } from 'vue'

const STRAVA_STORAGE_KEY = 'strava_connection'
const STRAVA_ACTIVITIES_KEY = 'strava_activities'

// Reactive state (singleton pattern)
const state = reactive({
  isConnected: false,
  athlete: null,
  activities: [],
  isLoading: false,
  lastSyncDate: null
})

export function useStrava() {

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const totalDistance = computed(() => {
    return state.activities.reduce((sum, a) => sum + a.distance, 0)
  })

  const totalElevation = computed(() => {
    return state.activities.reduce((sum, a) => sum + a.elevation, 0)
  })

  const totalTime = computed(() => {
    return state.activities.reduce((sum, a) => sum + a.movingTime, 0)
  })

  const totalCalories = computed(() => {
    return state.activities.reduce((sum, a) => sum + a.calories, 0)
  })

  const totalKudos = computed(() => {
    return state.activities.reduce((sum, a) => sum + a.kudos, 0)
  })

  const recentActivities = computed(() => {
    return [...state.activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  })

  const thisMonthStats = computed(() => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const monthActivities = state.activities.filter(a => {
      const d = new Date(a.date)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    if (monthActivities.length === 0 && !state.athlete?.stats) return null
    return {
      rides: monthActivities.length,
      distance: monthActivities.reduce((sum, a) => sum + a.distance, 0),
      elevation: monthActivities.reduce((sum, a) => sum + a.elevation, 0),
      time: monthActivities.reduce((sum, a) => sum + a.movingTime, 0)
    }
  })

  const yearToDateStats = computed(() => {
    if (!state.athlete?.stats) return null
    return {
      rides: state.athlete.stats.ytdRides,
      distance: state.athlete.stats.ytdDistance,
      elevation: state.athlete.stats.ytdElevation,
      time: state.athlete.stats.ytdTime
    }
  })

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  function formatDistance(km) {
    return km.toFixed(1) + ' km'
  }

  function formatElevation(meters) {
    return meters.toLocaleString() + ' m'
  }

  function formatSpeed(kmh) {
    return kmh.toFixed(1) + ' km/h'
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  function getActivityIcon(type) {
    const icons = {
      'Ride': 'directions_bike',
      'Run': 'directions_run',
      'Walk': 'directions_walk',
      'Hike': 'hiking',
      'Swim': 'pool'
    }
    return icons[type] || 'fitness_center'
  }

  // ============================================
  // MOCK DATA LOADING
  // ============================================

  async function loadMockData() {
    try {
      const [activitiesRes, athleteRes] = await Promise.all([
        fetch('/mock/stravaActivities.json'),
        fetch('/mock/stravaAthlete.json')
      ])

      const activities = await activitiesRes.json()
      const athlete = await athleteRes.json()

      return { activities, athlete }
    } catch (error) {
      console.error('Failed to load Strava mock data:', error)
      return { activities: [], athlete: null }
    }
  }

  // ============================================
  // RANDOM ACTIVITY GENERATION
  // ============================================

  const rideNames = [
    'Morning Coffee Ride', 'Sunset Loop', 'Hill Repeat Session', 'Interval Training',
    'Recovery Spin', 'Long Weekend Ride', 'Black Forest Explorer', 'Rhine Valley Tour',
    'Tempo Ride', 'Endurance Builder', 'Sprint Session', 'Climbing Day',
    'Group Ride', 'Solo Adventure', 'After Work Spin', 'Early Bird Ride',
    'Gravel Detour', 'MTB Trail Blast', 'Base Miles', 'Threshold Effort',
    'Freiburg City Loop', 'Kaiserstuhl Vineyards', 'Dreisamtal Out & Back',
    'Schauinsland Repeats', 'Titisee Round Trip', 'Feldberg Challenge'
  ]

  function generateRandomActivity() {
    const gearIds = ['bike-001', 'bike-002', 'bike-003']
    const gearId = gearIds[Math.floor(Math.random() * gearIds.length)]

    const distance = +(10 + Math.random() * 100).toFixed(1)
    const avgSpeed = +(18 + Math.random() * 18).toFixed(1)
    const movingTime = Math.round((distance / avgSpeed) * 3600)
    const elevation = Math.round(50 + Math.random() * 1200)
    const maxSpeed = +(avgSpeed + 10 + Math.random() * 20).toFixed(1)
    const calories = Math.round(distance * 25 + Math.random() * 200)
    const kudos = Math.floor(Math.random() * 50)
    const achievementCount = Math.floor(Math.random() * 5)

    const maxId = state.activities.length > 0
      ? Math.max(...state.activities.map(a => a.id))
      : 0

    const name = rideNames[Math.floor(Math.random() * rideNames.length)]

    return {
      id: maxId + 1,
      name,
      type: 'Ride',
      gearId,
      date: new Date().toISOString(),
      distance,
      movingTime,
      elevation,
      avgSpeed,
      maxSpeed,
      calories,
      kudos,
      achievementCount
    }
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  async function connectStrava() {
    state.isLoading = true

    // Simulate OAuth delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const { activities, athlete } = await loadMockData()

    state.activities = activities
    state.athlete = athlete
    state.isConnected = true
    state.lastSyncDate = new Date().toISOString()

    // Persist to localStorage
    localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify({
      isConnected: true,
      athlete: athlete,
      lastSyncDate: state.lastSyncDate
    }))
    localStorage.setItem(STRAVA_ACTIVITIES_KEY, JSON.stringify(activities))

    state.isLoading = false

    // Track CDP event
    trackStravaConnection(athlete)
    trackStravaActivitySync(activities)

    return { success: true, athlete }
  }

  function disconnectStrava() {
    state.isConnected = false
    state.athlete = null
    state.activities = []
    state.lastSyncDate = null

    localStorage.removeItem(STRAVA_STORAGE_KEY)
    localStorage.removeItem(STRAVA_ACTIVITIES_KEY)

    return { success: true }
  }

  async function syncActivities() {
    if (!state.isConnected) return { success: false }

    state.isLoading = true

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate a new random ride activity and append it
    const newActivity = generateRandomActivity()
    state.activities.push(newActivity)
    state.lastSyncDate = new Date().toISOString()

    console.log(`[Strava] New activity synced: "${newActivity.name}" - ${newActivity.distance} km on gear ${newActivity.gearId}`)

    localStorage.setItem(STRAVA_ACTIVITIES_KEY, JSON.stringify(state.activities))
    localStorage.setItem(STRAVA_STORAGE_KEY, JSON.stringify({
      isConnected: true,
      athlete: state.athlete,
      lastSyncDate: state.lastSyncDate
    }))

    state.isLoading = false

    // Track CDP event
    trackStravaActivitySync(state.activities)

    return { success: true, activitiesCount: state.activities.length }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async function initializeStrava() {
    const stored = localStorage.getItem(STRAVA_STORAGE_KEY)
    const storedActivities = localStorage.getItem(STRAVA_ACTIVITIES_KEY)

    if (stored) {
      try {
        const data = JSON.parse(stored)
        state.isConnected = data.isConnected
        state.athlete = data.athlete
        state.lastSyncDate = data.lastSyncDate

        if (storedActivities) {
          state.activities = JSON.parse(storedActivities)
        }
      } catch (e) {
        console.error('Failed to parse stored Strava data:', e)
      }
    }
  }

  // ============================================
  // PRODUCT RECOMMENDATIONS
  // ============================================

  function getRecommendedProductCategories() {
    if (!state.isConnected || state.activities.length === 0) {
      return []
    }

    const recommendations = []
    const avgElevation = totalElevation.value / state.activities.length
    const avgDistance = totalDistance.value / state.activities.length

    // High elevation rider
    if (avgElevation > 500) {
      recommendations.push({
        category: 'Road',
        subcategory: 'Climbing',
        reason: 'Based on your climbing activities'
      })
    }

    // Long distance rider
    if (avgDistance > 60) {
      recommendations.push({
        category: 'Road',
        subcategory: 'Endurance',
        reason: 'Perfect for your long-distance rides'
      })
    }

    // MTB activities detected
    const hasMTB = state.activities.some(a =>
      a.name.toLowerCase().includes('mtb') ||
      a.name.toLowerCase().includes('trail')
    )
    if (hasMTB) {
      recommendations.push({
        category: 'MTB',
        subcategory: 'Trail',
        reason: 'For your mountain bike adventures'
      })
    }

    // Gravel activities detected
    const hasGravel = state.activities.some(a =>
      a.name.toLowerCase().includes('gravel')
    )
    if (hasGravel) {
      recommendations.push({
        category: 'Gravel',
        subcategory: 'All-Road',
        reason: 'Ideal for gravel exploration'
      })
    }

    return recommendations
  }

  // ============================================
  // LOYALTY BONUS CALCULATION
  // ============================================

  function calculateStravaBonus() {
    if (!state.isConnected) return 0

    // 1 point per km
    return Math.floor(totalDistance.value)
  }

  function getStravaPointsMultiplier() {
    // 1.5x multiplier for connected users on bike purchases
    return state.isConnected ? 1.5 : 1.0
  }

  // ============================================
  // CDP TRACKING (Mock - for demo purposes)
  // ============================================

  /**
   * Track Strava connection event for CDP
   */
  function trackStravaConnection(athlete) {
    const event = {
      event_type: 'strava_connected',
      timestamp: new Date().toISOString(),
      athlete_id: athlete?.id || 'unknown',
      athlete_name: `${athlete?.firstName || ''} ${athlete?.lastName || ''}`.trim(),
      total_distance: athlete?.stats?.totalDistance || 0,
      total_rides: athlete?.stats?.totalRides || 0,
      bonus_points_awarded: 100 // Connection bonus
    }

    console.log('[CDP] Strava Connection Event:', event)

    // In production, this would call the engagement API:
    // sendEngagementEvent('stravaConnection', event)

    return event
  }

  /**
   * Track Strava activity sync for CDP
   */
  function trackStravaActivitySync(activities) {
    const totalKm = activities.reduce((sum, a) => sum + a.distance, 0)
    const totalElevation = activities.reduce((sum, a) => sum + a.elevation, 0)

    // Per-bike breakdown
    const perBike = {}
    for (const activity of activities) {
      if (activity.gearId) {
        const gearName = getGearName(activity.gearId)
        if (!perBike[gearName]) {
          perBike[gearName] = { gearId: activity.gearId, km: 0, rides: 0 }
        }
        perBike[gearName].km += activity.distance
        perBike[gearName].rides++
      }
    }

    const event = {
      event_type: 'strava_activity_sync',
      timestamp: new Date().toISOString(),
      activities_synced: activities.length,
      total_distance_km: totalKm.toFixed(1),
      total_elevation_m: totalElevation,
      points_earned: Math.floor(totalKm),
      rider_profile: getRiderProfile(activities),
      bikes: perBike
    }

    console.log('[CDP] Strava Activity Sync Event:', event)
    Object.entries(perBike).forEach(([name, data]) => {
      console.log(`[CDP]   🚲 ${name}: ${data.km.toFixed(1)} km (${data.rides} rides)`)
    })

    // In production, this would call the engagement API:
    // sendEngagementEvent('stravaActivitySync', event)

    return event
  }

  /**
   * Determine rider profile based on activities for personalization
   */
  function getRiderProfile(activities) {
    if (!activities.length) return 'unknown'

    const avgElevation = activities.reduce((sum, a) => sum + a.elevation, 0) / activities.length
    const avgDistance = activities.reduce((sum, a) => sum + a.distance, 0) / activities.length

    if (avgElevation > 800) return 'climber'
    if (avgDistance > 80) return 'endurance'
    if (activities.some(a => a.name.toLowerCase().includes('mtb'))) return 'mountain'
    if (activities.some(a => a.name.toLowerCase().includes('gravel'))) return 'gravel'
    if (avgDistance < 30) return 'casual'

    return 'road'
  }

  // ============================================
  // GEAR / BIKE INTEGRATION
  // ============================================

  /**
   * Get gear name by gearId from the athlete's gear list
   */
  function getGearName(gearId) {
    if (!state.athlete?.gear || !gearId) return null
    const gear = state.athlete.gear.find(g => g.id === gearId)
    return gear ? gear.name : null
  }

  /**
   * Calculate total distance per gear from activities
   * Returns: { "bike-001": 385.7, "bike-002": 53.0, ... }
   */
  const distancePerGear = computed(() => {
    const result = {}
    for (const activity of state.activities) {
      if (activity.gearId) {
        result[activity.gearId] = (result[activity.gearId] || 0) + activity.distance
      }
    }
    return result
  })

  /**
   * Get total distance for a gear by its name (for matching with CDP bikes)
   * Returns km or 0 if not found
   */
  function getDistanceByGearName(gearName) {
    if (!state.athlete?.gear || !gearName) return 0
    const gear = state.athlete.gear.find(g => g.name === gearName)
    if (!gear) return 0
    return distancePerGear.value[gear.id] || 0
  }

  /**
   * Get the most recent ride for a gear by its name
   * Returns { date, km } or null if not found
   */
  function getLastRideByGearName(gearName) {
    if (!state.athlete?.gear || !gearName) return null
    const gear = state.athlete.gear.find(g => g.name === gearName)
    if (!gear) return null
    const gearActivities = state.activities.filter(a => a.gearId === gear.id)
    if (gearActivities.length === 0) return null
    const lastActivity = gearActivities.reduce((latest, a) =>
      new Date(a.date) > new Date(latest.date) ? a : latest
    )
    return { date: lastActivity.date, km: lastActivity.distance }
  }

  // ============================================
  // RETURN PUBLIC API
  // ============================================

  return {
    // State
    state,
    isConnected: computed(() => state.isConnected),
    athlete: computed(() => state.athlete),
    activities: computed(() => state.activities),
    isLoading: computed(() => state.isLoading),

    // Stats
    totalDistance,
    totalElevation,
    totalTime,
    totalCalories,
    totalKudos,
    recentActivities,
    thisMonthStats,
    yearToDateStats,

    // Methods
    connectStrava,
    disconnectStrava,
    syncActivities,
    initializeStrava,

    // Helpers
    formatTime,
    formatDistance,
    formatElevation,
    formatSpeed,
    formatDate,
    getActivityIcon,

    // Shop Integration
    getRecommendedProductCategories,
    calculateStravaBonus,
    getStravaPointsMultiplier,

    // Gear / Bike Integration
    getGearName,
    distancePerGear,
    getDistanceByGearName,
    getLastRideByGearName,

    // CDP Tracking
    trackStravaConnection,
    trackStravaActivitySync,
    getRiderProfile
  }
}
