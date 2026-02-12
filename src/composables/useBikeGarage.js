// composables/useBikeGarage.js
// Bike Garage - Fetches bike data from SAP CDP for display in the UI

import { reactive, computed } from 'vue'
import { useStrava } from './useStrava'
import trackingService from '../utils/tracking-service.js'

const BIKE_GARAGE_STORAGE_KEY = 'bike_garage_data'
const BIKE_GARAGE_EMAIL_KEY = 'bike_garage_email'

// CDP API proxy endpoint (Netlify Function)
const CDP_PROXY_URL = '/.netlify/functions/cdp-proxy'

const BIKE_RELATIONSHIP_KEY = 'HJT34xIowhM9jcOzv8dBcQ'

// Singleton reactive state
const state = reactive({
  bikes: [],
  isLoading: false,
  error: null,
  lastFetchDate: null,
  customerEmail: null
})

export function useBikeGarage() {

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const bikeCount = computed(() => state.bikes.length)
  const hasBikes = computed(() => state.bikes.length > 0)

  // ============================================
  // CDP API CALLS
  // ============================================

  async function fetchCustomerByEmail(email) {
    const response = await fetch(CDP_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'customer', email })
    })
    if (!response.ok) throw new Error(`Customer API error: ${response.status}`)
    return await response.json()
  }

  function extractBikeIds(customerData) {
    const bikeIds = []
    const customers = customerData?.profiles || customerData?.data || customerData?.customers || []
    const customerList = Array.isArray(customers) ? customers : [customers]

    for (const customer of customerList) {
      const relationships = customer?.relationships || []
      for (const rel of relationships) {
        const bikeData = rel[BIKE_RELATIONSHIP_KEY]
        if (bikeData && bikeData.bikeId) {
          bikeIds.push(bikeData.bikeId)
        }
      }
    }

    return [...new Set(bikeIds)]
  }

  async function fetchBikeDetails(bikeId) {
    const response = await fetch(CDP_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bike', bikeId })
    })
    if (!response.ok) throw new Error(`Bike API error: ${response.status} for ${bikeId}`)
    const data = await response.json()

    const groups = data?.groups || []
    if (groups.length > 0) {
      return groups[0]?.attributes || null
    }
    return null
  }

  // ============================================
  // MAIN METHODS
  // ============================================

  async function loadBikeGarage(email) {
    if (!email) {
      state.error = 'No email provided'
      return
    }

    if (state.customerEmail === email && state.bikes.length > 0) {
      console.log('[BikeGarage] Using cached data for', email)
      return
    }

    state.isLoading = true
    state.error = null

    try {
      const customerData = await fetchCustomerByEmail(email)
      const bikeIds = extractBikeIds(customerData)
      console.log('[BikeGarage] Found bike IDs:', bikeIds)

      if (bikeIds.length === 0) {
        state.bikes = []
        state.customerEmail = email
        state.lastFetchDate = new Date().toISOString()
        saveToLocalStorage()
        state.isLoading = false
        return
      }

      const bikePromises = bikeIds.map(id => fetchBikeDetails(id))
      const bikeResults = await Promise.allSettled(bikePromises)

      state.bikes = bikeResults
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value)

      state.customerEmail = email
      state.lastFetchDate = new Date().toISOString()
      saveToLocalStorage()

      console.log('[BikeGarage] Loaded', state.bikes.length, 'bikes')
    } catch (err) {
      console.error('[BikeGarage] Error:', err)
      state.error = err.message || 'Failed to load bike data'
    } finally {
      state.isLoading = false
    }
  }

  async function refreshBikeGarage(email) {
    state.bikes = []
    state.customerEmail = null
    await loadBikeGarage(email)
  }

  function clearBikeGarage() {
    state.bikes = []
    state.isLoading = false
    state.error = null
    state.lastFetchDate = null
    state.customerEmail = null
    localStorage.removeItem(BIKE_GARAGE_STORAGE_KEY)
    localStorage.removeItem(BIKE_GARAGE_EMAIL_KEY)
  }

  // ============================================
  // LOCAL STORAGE
  // ============================================

  function saveToLocalStorage() {
    localStorage.setItem(BIKE_GARAGE_STORAGE_KEY, JSON.stringify({
      bikes: state.bikes,
      lastFetchDate: state.lastFetchDate
    }))
    localStorage.setItem(BIKE_GARAGE_EMAIL_KEY, state.customerEmail)
  }

  function restoreFromLocalStorage(email) {
    try {
      const storedEmail = localStorage.getItem(BIKE_GARAGE_EMAIL_KEY)
      const stored = localStorage.getItem(BIKE_GARAGE_STORAGE_KEY)
      if (stored && storedEmail === email) {
        const data = JSON.parse(stored)
        state.bikes = data.bikes || []
        state.lastFetchDate = data.lastFetchDate
        state.customerEmail = storedEmail
        return true
      }
    } catch (e) {
      console.error('[BikeGarage] Failed to restore from localStorage:', e)
    }
    return false
  }

  async function initializeBikeGarage(email) {
    if (!email) return
    const restored = restoreFromLocalStorage(email)
    if (!restored) {
      await loadBikeGarage(email)
    }
  }

  // ============================================
  // STRAVA MILEAGE INTEGRATION
  // ============================================

  /**
   * Get Strava mileage for a bike by matching accountName with Strava gear name
   */
  function getStravaMileage(accountName) {
    const { getDistanceByGearName, isConnected, state: stravaState } = useStrava()
    if (!isConnected.value) {
      console.log('[BikeGarage] Strava not connected')
      return 0
    }
    // Check if activities have gearId
    const activitiesWithGear = stravaState.activities.filter(a => a.gearId)
    if (activitiesWithGear.length === 0 && stravaState.activities.length > 0) {
      console.warn('[BikeGarage] ⚠️ Activities have no gearId! Click "Sync Activities" in Strava to reload mock data.')
    }
    const km = getDistanceByGearName(accountName)
    return km
  }

  function getStravaLastRide(accountName) {
    const { getLastRideByGearName, isConnected } = useStrava()
    if (!isConnected.value) return null
    return getLastRideByGearName(accountName)
  }

  /**
   * Send bike mileage to CDP via tracking service (same pattern as Orders, LoyaltyActivity)
   */
  function sendBikeMileageToCDP(bikeId, bikeName, totalKm, lastRideDate, lastRideKm) {
    console.log('📤 BikeMileageUpdate:', { bikeId, bikeName, totalKm, lastRideDate, lastRideKm })
    trackingService.trackBikeMileage(bikeId, bikeName, totalKm, lastRideDate, lastRideKm)
    return true
  }

  /**
   * Sync all bike mileages to CDP
   */
  async function syncMileageToCDP() {
    const { isConnected, syncActivities, state: stravaState, distancePerGear } = useStrava()
    console.log('[BikeGarage] Sync started. Strava connected:', isConnected.value, 'Bikes:', state.bikes.length)

    if (!isConnected.value) {
      console.warn('[BikeGarage] Strava not connected - cannot sync mileage')
      return []
    }

    // Auto-refresh Strava activities to ensure gearId data is present
    const activitiesWithGear = stravaState.activities.filter(a => a.gearId)
    if (activitiesWithGear.length === 0) {
      console.log('[BikeGarage] Activities missing gearId - reloading Strava data...')
      await syncActivities()
    }

    console.log('[BikeGarage] Strava distancePerGear:', JSON.parse(JSON.stringify(distancePerGear.value)))

    const results = []
    for (const bike of state.bikes) {
      const km = getStravaMileage(bike.accountName)
      const lastRide = getStravaLastRide(bike.accountName)
      console.log('[BikeGarage] Bike:', bike.accountName, '| accountID:', bike.accountID, '| Strava km:', km, '| lastRide:', lastRide)
      if (km > 0 && bike.accountID) {
        sendBikeMileageToCDP(bike.accountID, bike.accountName, km, lastRide?.date, lastRide?.km)
        results.push({ bikeId: bike.accountID, name: bike.accountName, km, lastRide, success: true })
      }
    }
    console.log('[BikeGarage] Sync complete. Results:', results)
    return results
  }

  // ============================================
  // DISPLAY HELPERS
  // ============================================

  function getBikeDisplayFields(bike) {
    const fields = [
      { key: 'accountName', label: 'Bike', value: bike.accountName },
      { key: 'accountID', label: 'Bike ID', value: bike.accountID },
      { key: 'brand', label: 'Brand', value: bike.brand },
      { key: 'category', label: 'Category', value: bike.category },
      { key: 'color', label: 'Color', value: bike.color },
      { key: 'size', label: 'Size', value: bike.size },
      { key: 'wheelSize', label: 'Wheel Size', value: bike.wheelSize },
      { key: 'frameMaterial', label: 'Frame Material', value: bike.frameMaterial },
      { key: 'groupset', label: 'Groupset', value: bike.groupset },
      { key: 'brakes', label: 'Brakes', value: bike.brakes },
      { key: 'suspension', label: 'Suspension', value: bike.suspension },
      { key: 'weight', label: 'Weight', value: bike.weight ? `${bike.weight} kg` : null },
      { key: 'year_of_manufacture', label: 'Year', value: bike.year_of_manufacture },
      { key: 'purchase_price', label: 'Purchase Price', value: bike.purchase_price ? `€${bike.purchase_price.toLocaleString()}` : null },
      { key: 'bike_status', label: 'Status', value: bike.bike_status },
      { key: 'warranty_status', label: 'Warranty', value: bike.warranty_status },
      { key: 'warranty_end_date', label: 'Warranty Until', value: bike.warranty_end_date ? new Date(bike.warranty_end_date).toLocaleDateString() : null },
      { key: 'total_mileage', label: 'Total Mileage', value: bike.total_mileage ? `${bike.total_mileage} km` : null },
      { key: 'last_ride_date', label: 'Last Ride', value: bike.last_ride_date ? new Date(bike.last_ride_date).toLocaleDateString() : null },
      { key: 'last_ride_km', label: 'Last Ride Distance', value: bike.last_ride_km ? `${bike.last_ride_km} km` : null },
    ]
    return fields.filter(f => f.value !== undefined && f.value !== null && f.value !== '')
  }

  // ============================================
  // RETURN PUBLIC API
  // ============================================

  return {
    state,
    bikes: computed(() => state.bikes),
    bikeCount,
    hasBikes,
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    lastFetchDate: computed(() => state.lastFetchDate),

    loadBikeGarage,
    refreshBikeGarage,
    clearBikeGarage,
    initializeBikeGarage,

    getBikeDisplayFields,

    // Strava Mileage
    getStravaMileage,
    sendBikeMileageToCDP,
    syncMileageToCDP
  }
}
