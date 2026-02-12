// composables/useConsumerLoyalty.js
// Canyon CREW Loyalty Program - Community & Performance Membership
// 3 Tiers: Rider → Racer → Legend
// Hybrid qualification: Spend + Engagement Points

import { reactive, computed } from 'vue'

export function useConsumerLoyalty() {

  // ============================================
  // CANYON CREW TIERS (Hybrid: Spend + Engagement)
  // ============================================

  const loyaltyTiers = {
    rider: {
      name: 'Rider',
      threshold: 0,
      maxThreshold: 499,
      icon: '🚴',
      color: '#6B7280',       // Grau
      accentColor: '#9CA3AF',
      pointsMultiplier: 1.0,

      benefits: {
        rewards: [
          'Welcome Gift: Canyon Bidons (Set of 2)',
          'Birthday Reward: 10% on Accessories',
          '0.5 points per EUR spent'
        ],
        shipping: [
          'Standard shipping',
          'Free shipping from 50 EUR'
        ],
        exclusive: [
          'Early Access: 24h before Sale',
          'Member Newsletter with exclusive content',
          'Canyon App: Full Access',
          'Basic Ride Challenges'
        ],
        experiences: [
          'Community Forum Access'
        ]
      },

      benefitsList: [
        'Welcome Gift: Canyon Bidons',
        'Birthday: 10% on Accessories',
        'Early Access: 24h before Sale',
        'Basic Ride Challenges'
      ],

      welcomeGift: 'Canyon Bidons (2er Set)',
      discountRate: 0,
      freeShippingThreshold: 50,
      supportLevel: 'standard'
    },

    racer: {
      name: 'Racer',
      threshold: 500,
      maxThreshold: 1999,
      icon: '⚡',
      color: '#1F2937',       // Schwarz
      accentColor: '#374151',
      pointsMultiplier: 1.25,

      benefits: {
        rewards: [
          'Welcome Gift Upgrade: Canyon Jersey',
          '1.25x Points Multiplier',
          '5% Discount on all orders',
          'Birthday: 15% on all products'
        ],
        shipping: [
          'Free Shipping: Always free',
          'Express Shipping: 50% off'
        ],
        exclusive: [
          'Early Access: 48h before Sale',
          'Pro-Level Ride Challenges',
          'Invitation to local Member Events',
          'Pro Deal Access: Special conditions on accessories'
        ],
        experiences: [
          'Priority Service: Preferred workshop appointments',
          'Ride Club Events Access'
        ]
      },

      benefitsList: [
        '5% Discount on everything',
        'Free Shipping always',
        'Pro Ride Challenges',
        'Priority Workshop Appointments'
      ],

      welcomeGift: 'Canyon Trikot',
      discountRate: 5,
      freeShippingThreshold: 0,
      supportLevel: 'priority'
    },

    legend: {
      name: 'Legend',
      threshold: 2000,
      maxThreshold: null,
      icon: '🏆',
      color: '#B8860B',       // Gold/Schwarz
      accentColor: '#DAA520',
      pointsMultiplier: 1.5,

      benefits: {
        rewards: [
          'Welcome Gift: Canyon Premium Kit (Jersey, Shorts, Cap)',
          '1.5x Points Multiplier',
          '10% Discount on all orders',
          'Birthday: 20% on all products'
        ],
        shipping: [
          'Free Express Shipping worldwide',
          'Priority Handling',
          'Free Gift Wrapping'
        ],
        exclusive: [
          'Early Access: 72h before Sale',
          'Legend-Only Challenges & Events',
          'Custom Options: Personalization on bike purchase',
          'Test Bike Program: Test new models early'
        ],
        experiences: [
          'VIP Service: Personal contact person',
          'Factory Tour: Invitation to Koblenz',
          'Exclusive Rides with Pro Riders',
          'Concierge Service: Bike Fitting, Travel Planning'
        ]
      },

      benefitsList: [
        '10% Discount on everything',
        'Free Express worldwide',
        'Factory Tour Koblenz',
        'Test Bike Program',
        'Personal Contact Person'
      ],

      welcomeGift: 'Canyon Premium Kit (Trikot, Hose, Cap)',
      discountRate: 10,
      freeShippingThreshold: 0,
      expressShipping: true,
      worldwideShipping: true,
      supportLevel: 'vip'
    }
  }

  // ============================================
  // ENGAGEMENT POINT SOURCES
  // ============================================

  const engagementPointSources = {
    bikePurchase:       { pointsPerEur: 1,   description: 'Bike-Kauf' },
    accessoryPurchase:  { pointsPerEur: 1,   description: 'Zubehör/Bekleidung' },
    servicePurchase:    { pointsPerEur: 1.5, description: 'Service/Wartung' },
    challengeComplete:  { pointsRange: [50, 500], description: 'Challenge abgeschlossen' },
    rideClubAttend:     { points: 25,  description: 'Ride Club Teilnahme' },
    productReview:      { points: 10,  description: 'Produktbewertung' },
    referral:           { points: 100, description: 'Freund geworben' },
    stravaShare:        { points: 5,   description: 'Strava Ride geteilt' }
  }

  // ============================================
  // POINTS REDEMPTION OPTIONS
  // ============================================

  const redemptionOptions = [
    { points: 100,  value: 5,    type: 'voucher',  description: '5 EUR Gutschein',    discountType: 'fixed' },
    { points: 200,  value: 12,   type: 'voucher',  description: '12 EUR Gutschein',   discountType: 'fixed' },
    { points: 500,  value: 35,   type: 'voucher',  description: '35 EUR Gutschein',   discountType: 'fixed' },
    { points: 1000, value: 80,   type: 'voucher',  description: '80 EUR Gutschein',   discountType: 'fixed' },
    { points: 150,  value: null,  type: 'shipping', description: 'Gratis Express-Versand', discountType: 'shipping' },
    { points: 250,  value: null,  type: 'gift',     description: 'Überraschungsgeschenk',  discountType: 'gift' },
    // Legend-exclusive redemptions
    { points: 2000, value: null,  type: 'experience', description: 'Factory Tour Koblenz',  discountType: 'experience', minTier: 'legend' },
    { points: 1500, value: null,  type: 'experience', description: 'Pro Ride Event Ticket', discountType: 'experience', minTier: 'racer' }
  ]

  // ============================================
  // BONUS POINT EVENTS
  // ============================================

  const bonusEvents = {
    welcome:            { points: 100, description: 'Welcome Bonus' },
    birthday:           { points: 50,  multiplier: 'tier', description: 'Birthday Bonus' },
    review:             { points: 10,  description: 'Produktbewertung' },
    referral:           { points: 100, description: 'Freund geworben' },
    newsletter:         { points: 50,  description: 'Newsletter Signup' },
    firstPurchase:      { points: 50,  description: 'First Purchase' },
    appDownload:        { points: 75,  description: 'App Download' },
    // Strava Integration
    stravaConnect:      { points: 100, description: 'Connect Strava Account' },
    stravaMonthlySync:  { points: 50,  description: 'Monthly Strava Sync Bonus' },
    stravaKilometers:   { points: 1,   description: 'Point per kilometer ridden', perUnit: 'km' },
    // CREW specific
    challengeComplete:  { points: 50,  description: 'Challenge abgeschlossen (Basis)', variable: true },
    rideClubJoin:       { points: 25,  description: 'Ride Club beigetreten' },
    rideClubAttend:     { points: 25,  description: 'Ride Club Event Teilnahme' },
    stravaShare:        { points: 5,   description: 'Strava Ride geteilt' }
  }

  // ============================================
  // REACTIVE STATE
  // ============================================

  const state = reactive({
    currentTier: 'rider',
    totalPoints: 0,
    availablePoints: 0,
    lifetimePoints: 0,
    engagementPoints: 0,
    isActive: false
  })

  // ============================================
  // TIER CALCULATION (Hybrid: max of Spend OR Engagement)
  // ============================================

  const calculateTier = (lifetimePoints, engagementPoints = 0) => {
    const effectivePoints = Math.max(lifetimePoints || 0, engagementPoints || 0)
    const tierOrder = ['rider', 'racer', 'legend']
    const tierEntries = tierOrder.map(key => [key, loyaltyTiers[key]]).reverse()
    return tierEntries.find(([_, tier]) => effectivePoints >= tier.threshold)?.[0] || 'rider'
  }

  // ============================================
  // POINTS CALCULATION
  // ============================================

  const BASE_POINTS_PER_EUR = 0.5

  const calculatePointsForPurchase = (amount, tierName = 'rider', purchaseType = 'standard') => {
    const tier = loyaltyTiers[tierName] || loyaltyTiers.rider
    let multiplier = tier.pointsMultiplier
    // Service purchases get 1.5x bonus
    if (purchaseType === 'service') {
      multiplier *= 1.5
    }
    return Math.floor(amount * BASE_POINTS_PER_EUR * multiplier)
  }

  const calculateEngagementPointsForPurchase = (amount, purchaseType = 'standard') => {
    const source = purchaseType === 'service'
      ? engagementPointSources.servicePurchase
      : purchaseType === 'bike'
        ? engagementPointSources.bikePurchase
        : engagementPointSources.accessoryPurchase
    return Math.floor(amount * source.pointsPerEur)
  }

  const calculateDiscountedPrice = (price, tierName = 'rider') => {
    const tier = loyaltyTiers[tierName] || loyaltyTiers.rider
    const discount = (price * tier.discountRate) / 100
    return price - discount
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getActiveBenefits = (tierName) => {
    const tier = loyaltyTiers[tierName]
    if (!tier) return []
    return tier.benefitsList || []
  }

  const getCategorizedBenefits = (tierName) => {
    const tier = loyaltyTiers[tierName]
    if (!tier) return {}
    return tier.benefits || {}
  }

  const getNextTierInfo = (currentPoints, engagementPoints = 0) => {
    const effectivePoints = Math.max(currentPoints || 0, engagementPoints || 0)
    const currentTierName = calculateTier(currentPoints, engagementPoints)
    const tierOrder = ['rider', 'racer', 'legend']
    const currentIndex = tierOrder.indexOf(currentTierName)

    if (currentIndex < tierOrder.length - 1) {
      const nextTierName = tierOrder[currentIndex + 1]
      const nextTier = loyaltyTiers[nextTierName]
      const remaining = nextTier.threshold - effectivePoints
      const currentTierThreshold = loyaltyTiers[currentTierName].threshold
      const range = nextTier.threshold - currentTierThreshold
      const progressInRange = effectivePoints - currentTierThreshold
      const progress = Math.min((progressInRange / range) * 100, 100)

      return {
        name: nextTier.name,
        tierKey: nextTierName,
        threshold: nextTier.threshold,
        remaining: Math.max(remaining, 0),
        progress,
        newBenefits: nextTier.benefitsList.filter(
          benefit => !loyaltyTiers[currentTierName].benefitsList.includes(benefit)
        ),
        icon: nextTier.icon
      }
    }

    return null // Already Legend (highest tier)
  }

  const getTierData = (tierName) => {
    return loyaltyTiers[tierName] || loyaltyTiers.rider
  }

  const getPointsValue = (points) => {
    // 100 points = 5 EUR value
    return (points / 100) * 5
  }

  const getRedemptionOptions = (availablePoints, tierName = 'rider') => {
    const tierOrder = ['rider', 'racer', 'legend']
    const currentTierIndex = tierOrder.indexOf(tierName)
    return redemptionOptions.filter(option => {
      if (option.points > availablePoints) return false
      if (option.minTier) {
        const minTierIndex = tierOrder.indexOf(option.minTier)
        if (currentTierIndex < minTierIndex) return false
      }
      return true
    })
  }

  const getBonusForEvent = (eventType, tierName = 'rider') => {
    const event = bonusEvents[eventType]
    if (!event) return 0

    if (event.multiplier === 'tier') {
      const tier = loyaltyTiers[tierName]
      return event.points * (tier?.pointsMultiplier || 1)
    }

    return event.points
  }

  // ============================================
  // LOYALTY SCORE & ENGAGEMENT
  // ============================================

  const calculateEngagementScore = (metrics) => {
    const scores = {
      purchases: 0,
      activity: 0,
      community: 0,
      challenges: 0,
      total: 0
    }

    // Purchase engagement (30%)
    const purchaseScore = Math.min((metrics.orderCount || 0) / 10, 1) * 100
    scores.purchases = Math.round(purchaseScore)

    // Activity engagement (25%)
    const activityScore = Math.min(
      ((metrics.reviewsWritten || 0) * 10 +
       (metrics.wishlistItems || 0) * 5 +
       (metrics.stravaKm || 0) * 0.1 +
       (metrics.pageViews || 0) * 0.1) / 100, 1
    ) * 100
    scores.activity = Math.round(activityScore)

    // Community engagement (25%)
    const communityScore = Math.min(
      ((metrics.referrals || 0) * 30 +
       (metrics.rideClubAttendance || 0) * 15 +
       (metrics.socialShares || 0) * 10) / 100, 1
    ) * 100
    scores.community = Math.round(communityScore)

    // Challenge engagement (20%)
    const challengeScore = Math.min(
      ((metrics.challengesCompleted || 0) * 25) / 100, 1
    ) * 100
    scores.challenges = Math.round(challengeScore)

    scores.total = Math.round(
      scores.purchases * 0.30 +
      scores.activity * 0.25 +
      scores.community * 0.25 +
      scores.challenges * 0.20
    )

    return scores
  }

  // ============================================
  // ALIAS FUNCTIONS FOR COMPATIBILITY
  // ============================================

  const calculatePoints = (amount, tierName = 'rider') => {
    return calculatePointsForPurchase(amount, tierName)
  }

  // ============================================
  // RETURN PUBLIC API
  // ============================================

  return {
    // Tier data
    loyaltyTiers,
    redemptionOptions,
    bonusEvents,
    engagementPointSources,

    // State
    state,

    // Tier functions
    calculateTier,
    getActiveBenefits,
    getCategorizedBenefits,
    getNextTierInfo,
    getTierData,

    // Points functions
    calculatePoints,
    calculatePointsForPurchase,
    calculateEngagementPointsForPurchase,
    calculateDiscountedPrice,
    getPointsValue,
    getRedemptionOptions,
    getBonusForEvent,

    // Engagement
    calculateEngagementScore
  }
}


// ============================================
// CONSUMER LOYALTY STORAGE UTILITY
// ============================================

export const loyaltyStorage = {
  getUserKey: (userId, type) => `loyalty_${userId}_${type}`,

  // Get current points balance (simple getter)
  getPoints: (userId) => {
    try {
      const balance = loyaltyStorage.getPointsBalance(userId)
      return balance.lifetimePoints || 0
    } catch (error) {
      return 0
    }
  },

  // Add points directly (positive = earn, negative = redeem)
  addPoints: (userId, points, description = 'Points added') => {
    const isRedemption = points < 0
    return loyaltyStorage.addPointsTransaction(userId, {
      type: isRedemption ? 'redeem' : 'earn',
      points: isRedemption ? Math.abs(points) : points,
      description: description
    })
  },

  // Points History
  getPointsHistory: (userId) => {
    try {
      const stored = localStorage.getItem(loyaltyStorage.getUserKey(userId, 'points_history'))
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading points history:', error)
      return []
    }
  },

  savePointsHistory: (userId, history) => {
    try {
      localStorage.setItem(loyaltyStorage.getUserKey(userId, 'points_history'), JSON.stringify(history))
      return true
    } catch (error) {
      console.error('Error saving points history:', error)
      return false
    }
  },

  // Add points transaction
  addPointsTransaction: (userId, transaction) => {
    try {
      const history = loyaltyStorage.getPointsHistory(userId)
      history.push({
        ...transaction,
        id: `TXN-${Date.now()}`,
        timestamp: transaction.timestamp || new Date().toISOString()
      })

      loyaltyStorage.savePointsHistory(userId, history)
      loyaltyStorage.updatePointsBalance(userId)

      return history
    } catch (error) {
      console.error('Error adding points transaction:', error)
      return null
    }
  },

  // Update points balance
  updatePointsBalance: (userId) => {
    const history = loyaltyStorage.getPointsHistory(userId)

    const earned = history
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + (t.points || 0), 0)

    const redeemed = history
      .filter(t => t.type === 'redeem')
      .reduce((sum, t) => sum + Math.abs(t.points || 0), 0)

    const balance = {
      lifetimePoints: earned,
      availablePoints: earned - redeemed,
      redeemedPoints: redeemed
    }

    localStorage.setItem(loyaltyStorage.getUserKey(userId, 'balance'), JSON.stringify(balance))

    return balance
  },

  // Get points balance
  getPointsBalance: (userId) => {
    try {
      const stored = localStorage.getItem(loyaltyStorage.getUserKey(userId, 'balance'))
      return stored ? JSON.parse(stored) : { lifetimePoints: 0, availablePoints: 0, redeemedPoints: 0 }
    } catch (error) {
      console.error('Error loading points balance:', error)
      return { lifetimePoints: 0, availablePoints: 0, redeemedPoints: 0 }
    }
  },

  // Order History
  getOrderHistory: (userId) => {
    try {
      const stored = localStorage.getItem(loyaltyStorage.getUserKey(userId, 'orders'))
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading order history:', error)
      return []
    }
  },

  addOrder: (userId, orderData) => {
    try {
      const orders = loyaltyStorage.getOrderHistory(userId)
      orders.push({
        ...orderData,
        id: orderData.id || `ORD-${Date.now()}`,
        timestamp: orderData.timestamp || new Date().toISOString()
      })

      localStorage.setItem(loyaltyStorage.getUserKey(userId, 'orders'), JSON.stringify(orders))

      // Add points for purchase
      if (orderData.pointsEarned) {
        loyaltyStorage.addPointsTransaction(userId, {
          type: 'earn',
          points: orderData.pointsEarned,
          description: `Einkauf #${orderData.id}`,
          orderId: orderData.id
        })
      }

      return orders
    } catch (error) {
      console.error('Error adding order:', error)
      return null
    }
  },

  // Get consumer metrics
  getConsumerMetrics: (userId) => {
    const orders = loyaltyStorage.getOrderHistory(userId)
    const balance = loyaltyStorage.getPointsBalance(userId)
    const currentYear = new Date().getFullYear()

    const yearlyOrders = orders.filter(order =>
      new Date(order.timestamp).getFullYear() === currentYear
    )

    const totalSpend = yearlyOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const orderCount = yearlyOrders.length
    const averageOrderValue = orderCount > 0 ? totalSpend / orderCount : 0

    return {
      totalSpend,
      orderCount,
      averageOrderValue,
      orders: yearlyOrders,
      ...balance
    }
  },

  // Wishlist
  getWishlist: (userId) => {
    try {
      const stored = localStorage.getItem(loyaltyStorage.getUserKey(userId, 'wishlist'))
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  },

  addToWishlist: (userId, product) => {
    const wishlist = loyaltyStorage.getWishlist(userId)
    if (!wishlist.find(item => item.id === product.id)) {
      wishlist.push({ ...product, addedAt: new Date().toISOString() })
      localStorage.setItem(loyaltyStorage.getUserKey(userId, 'wishlist'), JSON.stringify(wishlist))
    }
    return wishlist
  },

  removeFromWishlist: (userId, productId) => {
    let wishlist = loyaltyStorage.getWishlist(userId)
    wishlist = wishlist.filter(item => item.id !== productId)
    localStorage.setItem(loyaltyStorage.getUserKey(userId, 'wishlist'), JSON.stringify(wishlist))
    return wishlist
  },

  // Reset all data
  reset: (userId) => {
    try {
      localStorage.removeItem(loyaltyStorage.getUserKey(userId, 'points_history'))
      localStorage.removeItem(loyaltyStorage.getUserKey(userId, 'balance'))
      localStorage.removeItem(loyaltyStorage.getUserKey(userId, 'orders'))
      localStorage.removeItem(loyaltyStorage.getUserKey(userId, 'wishlist'))
      console.log('Consumer loyalty data reset for user:', userId)
    } catch (error) {
      console.error('Error resetting consumer data:', error)
    }
  }
}

// Global access for testing
if (typeof window !== 'undefined') {
  window.loyaltyStorage = loyaltyStorage
}
