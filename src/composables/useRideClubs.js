// composables/useRideClubs.js
// Canyon CREW - Ride Clubs & Passport System
// Local community groups with gamification

import { reactive, computed } from 'vue'

const RIDE_CLUBS_STORAGE_KEY = 'crew_ride_clubs'

// ============================================
// RIDE CLUB DEFINITIONS
// ============================================

const CLUB_CATALOG = {
  'canyon-koblenz': {
    id: 'canyon-koblenz',
    name: 'Canyon Ride Club Koblenz',
    type: 'official',
    location: 'Koblenz, Germany',
    description: 'Official Canyon Ride Club am Hauptsitz. Wöchentliche Rides entlang der Mosel und durch den Westerwald.',
    memberCount: 234,
    icon: '🏠',
    image: null,
    upcomingRides: [
      { id: 'sunday-social-2026-02-16', name: 'Sunday Social Ride', date: '2026-02-16T09:00:00Z', distance: 60, difficulty: 'medium' },
      { id: 'gravel-explore-2026-02-22', name: 'Gravel Exploration', date: '2026-02-22T10:00:00Z', distance: 45, difficulty: 'hard' },
      { id: 'morning-coffee-2026-03-01', name: 'Morning Coffee Ride', date: '2026-03-01T08:00:00Z', distance: 30, difficulty: 'easy' }
    ]
  },
  'canyon-freiburg': {
    id: 'canyon-freiburg',
    name: 'Canyon Ride Club Freiburg',
    type: 'official',
    location: 'Freiburg, Germany',
    description: 'Rides durch den Schwarzwald - von gemütlichen Genusstouren bis zu anspruchsvollen Bergfahrten.',
    memberCount: 178,
    icon: '🏠',
    image: null,
    upcomingRides: [
      { id: 'schwarzwald-loop-2026-02-23', name: 'Schwarzwald Loop', date: '2026-02-23T09:30:00Z', distance: 80, difficulty: 'hard' },
      { id: 'rheintal-cruise-2026-03-02', name: 'Rheintal Cruise', date: '2026-03-02T10:00:00Z', distance: 50, difficulty: 'easy' }
    ]
  },
  'velo-cafe-munich': {
    id: 'velo-cafe-munich',
    name: 'Velo Café München',
    type: 'partner',
    location: 'München, Germany',
    description: 'Partner-Club im beliebten Velo Café. Rides starten und enden mit einem guten Kaffee.',
    memberCount: 156,
    icon: '🤝',
    image: null,
    upcomingRides: [
      { id: 'isar-trail-2026-02-23', name: 'Isar Trail Ride', date: '2026-02-23T09:00:00Z', distance: 55, difficulty: 'medium' },
      { id: 'alpine-preview-2026-03-08', name: 'Alpine Preview', date: '2026-03-08T08:30:00Z', distance: 90, difficulty: 'hard' }
    ]
  },
  'pro-rides-berlin': {
    id: 'pro-rides-berlin',
    name: 'Pro Rides Berlin',
    type: 'ambassador',
    location: 'Berlin, Germany',
    description: 'Ambassador Club geleitet von Ex-Profi Lisa Brennauer. Schnelle Gruppenfahrten und Trainingstipps.',
    memberCount: 89,
    icon: '👤',
    ambassador: 'Lisa Brennauer',
    image: null,
    upcomingRides: [
      { id: 'tempo-tuesday-2026-02-18', name: 'Tempo Tuesday', date: '2026-02-18T18:00:00Z', distance: 40, difficulty: 'hard' },
      { id: 'endurance-sunday-2026-02-23', name: 'Endurance Sunday', date: '2026-02-23T08:00:00Z', distance: 120, difficulty: 'hard' }
    ]
  },
  'gravel-collective-cologne': {
    id: 'gravel-collective-cologne',
    name: 'Gravel Collective Köln',
    type: 'partner',
    location: 'Köln, Germany',
    description: 'Alles Gravel! Offroad-Touren durch die Eifel und das Bergische Land.',
    memberCount: 112,
    icon: '🤝',
    image: null,
    upcomingRides: [
      { id: 'eifel-gravel-2026-02-22', name: 'Eifel Gravel Tour', date: '2026-02-22T09:00:00Z', distance: 65, difficulty: 'medium' },
      { id: 'night-gravel-2026-03-07', name: 'Night Gravel Ride', date: '2026-03-07T19:00:00Z', distance: 35, difficulty: 'medium' }
    ]
  }
}

// Passport milestones
const PASSPORT_MILESTONES = [
  { rides: 5, reward: 'Club Cap', icon: '🧢', description: '5 Rides absolviert' },
  { rides: 10, reward: 'Club Trikot', icon: '👕', description: '10 Rides absolviert' },
  { rides: 25, reward: 'Club Legend Badge', icon: '🏅', description: '25 Rides absolviert' }
]

// ============================================
// SINGLETON STATE
// ============================================

const state = reactive({
  myClubs: [],           // Joined club IDs
  rideHistory: [],       // Attended rides: { clubId, rideId, rideName, date, pointsEarned }
  isInitialized: false
})

// ============================================
// COMPOSABLE
// ============================================

export function useRideClubs() {

  // ---- COMPUTED ----
  const myClubs = computed(() =>
    state.myClubs.map(id => CLUB_CATALOG[id]).filter(Boolean)
  )

  const availableClubs = computed(() =>
    Object.values(CLUB_CATALOG).filter(club => !state.myClubs.includes(club.id))
  )

  const totalRidesAttended = computed(() => state.rideHistory.length)

  const passport = computed(() => {
    const total = state.rideHistory.length
    const stamps = state.rideHistory.map(r => ({
      clubName: CLUB_CATALOG[r.clubId]?.name || r.clubId,
      rideName: r.rideName,
      date: r.date
    }))

    // Find next milestone
    const nextMilestone = PASSPORT_MILESTONES.find(m => total < m.rides) || null
    const currentMilestones = PASSPORT_MILESTONES.filter(m => total >= m.rides)

    return {
      totalRides: total,
      stamps,
      nextMilestone,
      currentMilestones,
      milestones: PASSPORT_MILESTONES
    }
  })

  const upcomingRides = computed(() => {
    const now = new Date()
    const rides = []

    for (const clubId of state.myClubs) {
      const club = CLUB_CATALOG[clubId]
      if (!club) continue
      for (const ride of club.upcomingRides || []) {
        if (new Date(ride.date) > now) {
          rides.push({ ...ride, clubId, clubName: club.name })
        }
      }
    }

    return rides.sort((a, b) => new Date(a.date) - new Date(b.date))
  })

  // ---- ACTIONS ----

  function joinClub(clubId) {
    if (state.myClubs.includes(clubId)) return false
    if (!CLUB_CATALOG[clubId]) return false

    state.myClubs.push(clubId)
    saveToLocalStorage()

    console.log('[RideClubs] Joined:', clubId, '(+25 Punkte)')
    return true
  }

  function leaveClub(clubId) {
    const index = state.myClubs.indexOf(clubId)
    if (index === -1) return false

    state.myClubs.splice(index, 1)
    saveToLocalStorage()
    return true
  }

  function attendRide(clubId, rideId, rideName) {
    // Check if already attended
    if (state.rideHistory.find(r => r.rideId === rideId)) return null

    const entry = {
      clubId,
      rideId,
      rideName: rideName || rideId,
      date: new Date().toISOString(),
      pointsEarned: 25
    }

    state.rideHistory.push(entry)
    saveToLocalStorage()

    // Check milestone
    const total = state.rideHistory.length
    const milestone = PASSPORT_MILESTONES.find(m => m.rides === total)

    console.log('[RideClubs] Attended ride:', rideName, '(+25 Punkte)', milestone ? `MILESTONE: ${milestone.reward}!` : '')

    return { entry, milestone }
  }

  function getClubDetails(clubId) {
    return CLUB_CATALOG[clubId] || null
  }

  function getMyRidesForClub(clubId) {
    return state.rideHistory.filter(r => r.clubId === clubId)
  }

  // ---- LOCAL STORAGE ----

  function saveToLocalStorage() {
    try {
      localStorage.setItem(RIDE_CLUBS_STORAGE_KEY, JSON.stringify({
        myClubs: state.myClubs,
        rideHistory: state.rideHistory
      }))
    } catch (e) {
      console.error('[RideClubs] Failed to save:', e)
    }
  }

  function restoreFromLocalStorage() {
    try {
      const stored = localStorage.getItem(RIDE_CLUBS_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        state.myClubs = data.myClubs || []
        state.rideHistory = data.rideHistory || []
      }
    } catch (e) {
      console.error('[RideClubs] Failed to restore:', e)
    }
  }

  function initializeRideClubs() {
    if (state.isInitialized) return
    restoreFromLocalStorage()
    state.isInitialized = true
  }

  function resetRideClubs() {
    state.myClubs = []
    state.rideHistory = []
    state.isInitialized = false
    localStorage.removeItem(RIDE_CLUBS_STORAGE_KEY)
  }

  // ---- PUBLIC API ----

  return {
    // State
    myClubs,
    availableClubs,
    totalRidesAttended,
    passport,
    upcomingRides,

    // Catalog
    clubCatalog: CLUB_CATALOG,
    passportMilestones: PASSPORT_MILESTONES,

    // Actions
    joinClub,
    leaveClub,
    attendRide,
    getClubDetails,
    getMyRidesForClub,

    // Lifecycle
    initializeRideClubs,
    resetRideClubs
  }
}
