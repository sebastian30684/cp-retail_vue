// composables/useCdpProfile.js
// CDP Profile Service - Fetches customer profile data from SAP CDP
// Follows the same pattern as useBikeGarage.js

import { reactive, computed } from 'vue'

// CDP API configuration (same as useBikeGarage.js)
const CDP_BASE_URL = 'https://cdp.EU5-prod.gigya.com/api/businessunits/4_GJZtcJvXbmKrbEyYcnj4DQ'

const CUSTOMER_API = {
  url: `${CDP_BASE_URL}/views/HJolf9MBIvH7oEBmM3UpOw/customers`,
  purposeIds: 'HG0_WQzkdjLlPJbxrktHzw',
  userKey: 'AJVGIcoKduTt',
  secret: 'GXcc75wJV/hpPraNJ/ymkaySGYTqAWuO'
}

const BIKE_RELATIONSHIP_KEY = 'HJT34xIowhM9jcOzv8dBcQ'
const LOYALTY_RELATIONSHIP_KEY = 'HMkENeXIoBmTpDrYArMBiA'

const CACHE_KEY = 'cdp_profile_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Singleton reactive state
const state = reactive({
  profile: null,
  isLoading: false,
  error: null,
  lastFetchDate: null,
  customerEmail: null
})

export function useCdpProfile() {

  // ============================================
  // CDP API CALL
  // ============================================

  async function fetchCdpProfile(email) {
    if (!email) {
      state.error = 'No email provided'
      return null
    }

    state.isLoading = true
    state.error = null

    try {
      const query = `select * from profile WHERE attributes.primaryEmail = '${email}' LIMIT 10`
      const params = new URLSearchParams({
        purposeIds: CUSTOMER_API.purposeIds,
        userKey: CUSTOMER_API.userKey,
        secret: CUSTOMER_API.secret,
        query: query
      })

      const response = await fetch(`${CUSTOMER_API.url}?${params}`)

      if (!response.ok) {
        throw new Error(`CDP API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const profiles = data?.profiles || []

      if (profiles.length === 0) {
        state.error = 'No profile found for this email'
        state.profile = null
        return null
      }

      const transformed = transformProfile(profiles[0])
      state.profile = transformed
      state.customerEmail = email
      state.lastFetchDate = new Date().toISOString()

      // Cache in localStorage
      saveToCache(email, transformed)

      console.log('[CdpProfile] Profile loaded:', email)
      return transformed
    } catch (err) {
      console.error('[CdpProfile] Error:', err)
      state.error = err.message || 'Failed to load profile from CDP'
      return null
    } finally {
      state.isLoading = false
    }
  }

  // ============================================
  // PROFILE DATA TRANSFORMATION
  // ============================================

  function transformProfile(rawProfile) {
    const attrs = rawProfile?.attributes || {}
    const relationships = rawProfile?.relationships || []
    const activityIndicators = rawProfile?.activityIndicators || []
    const privacy = rawProfile?.privacy || {}

    return {
      // Personal Information
      firstName: attrs.firstName || '',
      lastName: attrs.lastName || '',
      primaryEmail: attrs.primaryEmail || attrs.email || '',
      correspondenceLanguage: attrs.correspondenceLanguage || '',
      locale: attrs.locale || '',
      loyaltyId: attrs.loyaltyId || '',
      registeredDate: attrs.registeredDate || null,
      lastLoginDate: attrs.lastLoginDate || null,
      createdDate: attrs.createdDate || null,
      accountType: attrs.accountType || '',
      regSource: attrs.regSource || '',

      // IDs
      primaryCDPId: attrs.primaryCdpId || '',
      primaryCDCId: attrs.UID || '',

      // Consents & Subscriptions
      consents: attrs.consents || [],
      subscriptions: attrs.subscriptions || [],
      verifiedEmails: attrs.verifiedEmails || [],

      // Relationships
      bikes: parseBikes(relationships),
      loyaltyTier: parseLoyaltyTier(relationships),

      // Activity Indicators
      activityIndicators: parseActivityIndicators(activityIndicators),

      // Privacy
      privacy: {
        purposes: privacy.purposes || [],
        subscriptions: privacy.subscriptions || []
      },

      // Derived newsletter opt-in
      additionalSystemFields: {
        optin: deriveNewsletterOptin(privacy.subscriptions || [])
      },

      // Last seen / first seen
      lastSeen: rawProfile?.lastSeen || null,
      firstSeen: rawProfile?.firstSeen || null
    }
  }

  function parseBikes(relationships) {
    const bikes = []
    for (const rel of relationships) {
      const bikeData = rel[BIKE_RELATIONSHIP_KEY]
      if (bikeData && bikeData.bikeId) {
        bikes.push({ bikeId: bikeData.bikeId })
      }
    }
    return bikes
  }

  function parseLoyaltyTier(relationships) {
    const tiers = []
    for (const rel of relationships) {
      const tierData = rel[LOYALTY_RELATIONSHIP_KEY]
      if (tierData && tierData.loyaltyTier) {
        tiers.push(tierData.loyaltyTier)
      }
    }
    // Return the highest tier found (Platinum > Gold > Silver > Bronze)
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum']
    if (tiers.length === 0) return null
    const sorted = tiers.sort((a, b) => {
      return tierOrder.indexOf(b.toLowerCase()) - tierOrder.indexOf(a.toLowerCase())
    })
    return sorted[0]
  }

  function parseActivityIndicators(indicators) {
    const result = {}
    for (const indicator of indicators) {
      const name = indicator.name || ''
      result[name] = {
        count: indicator.count || 0,
        sum: indicator.sum || 0,
        updated: indicator.updated || null
      }
    }
    return result
  }

  function deriveNewsletterOptin(privacySubscriptions) {
    const newsletter = privacySubscriptions.find(s =>
      s.externalId === 'newsletter'
    )
    if (!newsletter) return '0'
    return newsletter.status === 'Granted' ? '1' : '2'
  }

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  const isLoading = computed(() => state.isLoading)
  const error = computed(() => state.error)
  const profile = computed(() => state.profile)
  const hasProfile = computed(() => state.profile !== null)

  const fullName = computed(() => {
    if (!state.profile) return ''
    return `${state.profile.firstName} ${state.profile.lastName}`.trim()
  })

  const newsletterStatus = computed(() => {
    if (!state.profile?.privacy?.subscriptions) return false
    const newsletter = state.profile.privacy.subscriptions.find(s =>
      s.externalId === 'newsletter'
    )
    return newsletter?.status === 'Granted'
  })

  const emailMarketingConsent = computed(() => {
    if (!state.profile?.privacy?.purposes) return false
    const marketing = state.profile.privacy.purposes.find(p =>
      p.externalId === 'marketing.email'
    )
    return marketing?.status === 'Granted'
  })

  const totalOrders = computed(() => {
    return state.profile?.activityIndicators?.['Total Orders']?.count || 0
  })

  const totalSpend = computed(() => {
    return state.profile?.activityIndicators?.['Total Spend']?.sum || 0
  })

  const loyaltyTierName = computed(() => {
    return state.profile?.loyaltyTier || null
  })

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  function saveToCache(email, profileData) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        email,
        profile: profileData,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn('[CdpProfile] Cache save failed:', e)
    }
  }

  function loadFromCache(email) {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      const data = JSON.parse(cached)
      if (data.email !== email) return null
      if (Date.now() - data.timestamp > CACHE_TTL) return null
      return data.profile
    } catch (e) {
      return null
    }
  }

  function clearCache() {
    localStorage.removeItem(CACHE_KEY)
  }

  // ============================================
  // PUBLIC API
  // ============================================

  async function loadProfile(email, { forceRefresh = false } = {}) {
    if (!email) return null

    // Return in-memory data if same email and not forcing refresh
    if (!forceRefresh && state.customerEmail === email && state.profile) {
      return state.profile
    }

    // Try localStorage cache
    if (!forceRefresh) {
      const cached = loadFromCache(email)
      if (cached) {
        state.profile = cached
        state.customerEmail = email
        state.lastFetchDate = new Date().toISOString()
        console.log('[CdpProfile] Loaded from cache:', email)
        return cached
      }
    }

    return await fetchCdpProfile(email)
  }

  function resetProfile() {
    state.profile = null
    state.error = null
    state.lastFetchDate = null
    state.customerEmail = null
    clearCache()
  }

  return {
    // State
    state,
    profile,
    isLoading,
    error,
    hasProfile,

    // Computed
    fullName,
    newsletterStatus,
    emailMarketingConsent,
    totalOrders,
    totalSpend,
    loyaltyTierName,

    // Methods
    loadProfile,
    resetProfile,
    clearCache
  }
}
