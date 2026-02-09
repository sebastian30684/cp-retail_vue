// composables/useBikeGarage.js
// Bike Garage - Fetches bike data from SAP CDP for display in the UI

import { reactive, computed } from 'vue'
import { useStrava } from './useStrava'

const BIKE_GARAGE_STORAGE_KEY = 'bike_garage_data'
const BIKE_GARAGE_EMAIL_KEY = 'bike_garage_email'

// CDP API configuration
const CDP_BASE_URL = 'https://cdp.EU5-prod.gigya.com/api/businessunits/4_GJZtcJvXbmKrbEyYcnj4DQ'

const CUSTOMER_API = {
  url: `${CDP_BASE_URL}/views/HJolf9MBIvH7oEBmM3UpOw/customers`,
  purposeIds: 'HG0_WQzkdjLlPJbxrktHzw',
  userKey: 'AJVGIcoKduTt',
  secret: 'GXcc75wJV/hpPraNJ/ymkaySGYTqAWuO'
}

const BIKE_API = {
  url: `${CDP_BASE_URL}/schemas/HKpZLWYkvpRykUOwL4YiCw/groups`,
  userKey: 'AOZa92f657HN',
  secret: '+0lRIgq+CFC9nJD4Ne5To3vdtNLk1OPF'
}

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
    const query = `select * from profile WHERE attributes.primaryEmail = '${email}' LIMIT 10`
    const params = new URLSearchParams({
      purposeIds: CUSTOMER_API.purposeIds,
      userKey: CUSTOMER_API.userKey,
      secret: CUSTOMER_API.secret,
      query: query
    })

    const response = await fetch(`${CUSTOMER_API.url}?${params}`)
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
    const query = `select * from groups WHERE attributes.accountID = "${bikeId}"`
    const params = new URLSearchParams({
      query: query,
      userKey: BIKE_API.userKey,
      secret: BIKE_API.secret
    })

    const response = await fetch(`${BIKE_API.url}?${params}`)
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
    const { getDistanceByGearName, isConnected } = useStrava()
    if (!isConnected.value) return 0
    return getDistanceByGearName(accountName)
  }

  /**
   * Update total_mileage attribute for a bike in CDP
   */
  async function updateBikeMileageCDP(bikeId, totalKm) {
    try {
      const response = await fetch(BIKE_API.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userKey: BIKE_API.userKey,
          secret: BIKE_API.secret,
          groups: [{
            matchRules: { accountID: bikeId },
            attributes: { total_mileage: Math.round(totalKm * 10) / 10 }
          }]
        })
      })
      if (!response.ok) throw new Error(`CDP Write error: ${response.status}`)
      const data = await response.json()
      console.log('[BikeGarage] Mileage updated in CDP for', bikeId, ':', totalKm, 'km', data)
      return true
    } catch (err) {
      console.error('[BikeGarage] Failed to update mileage in CDP:', err)
      return false
    }
  }

  /**
   * Sync all bike mileages to CDP
   */
  async function syncMileageToCDP() {
    const { isConnected } = useStrava()
    console.log('[BikeGarage] Sync started. Strava connected:', isConnected.value, 'Bikes:', state.bikes.length)
    const results = []
    for (const bike of state.bikes) {
      const km = getStravaMileage(bike.accountName)
      console.log('[BikeGarage] Bike:', bike.accountName, '| accountID:', bike.accountID, '| Strava km:', km)
      if (km > 0 && bike.accountID) {
        const success = await updateBikeMileageCDP(bike.accountID, km)
        results.push({ bikeId: bike.accountID, km, success })
      }
    }
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
    updateBikeMileageCDP,
    syncMileageToCDP
  }
}
