// composables/useConsumerLoyalty.js
// B2C Consumer Loyalty System - Points-based rewards program
// Designed for Consumer Products & Retail

import { reactive, computed } from 'vue'

/**
 * B2C Loyalty Tiers:
 * - Bronze: Entry level, basic benefits
 * - Silver: Regular customers, enhanced benefits
 * - Gold: Loyal customers, premium benefits
 * - Platinum: VIP customers, exclusive benefits
 */

export function useConsumerLoyalty() {

  // ============================================
  // CONSUMER LOYALTY TIERS (Points-based)
  // ============================================

  const loyaltyTiers = {
    bronze: {
      name: 'Bronze',
      threshold: 0,
      icon: '🥉',
      color: '#CD7F32',
      pointsMultiplier: 1.0,

      benefits: {
        rewards: [
          '0.5 points per EUR spent',
          'Birthday bonus: 50 points',
          'Welcome bonus: 100 points'
        ],
        shipping: [
          'Standard shipping',
          'Free shipping from 50 EUR'
        ],
        exclusive: [
          'Newsletter with exclusive offers',
          'Early access to sales'
        ],
        support: [
          'Email support',
          'FAQ access'
        ]
      },

      benefitsList: [
        '0.5 points per EUR spent',
        'Birthday bonus: 50 points',
        'Free shipping from 50 EUR',
        'Newsletter with exclusive offers'
      ],

      discountRate: 0,
      freeShippingThreshold: 50,
      supportLevel: 'standard'
    },

    silver: {
      name: 'Silver',
      threshold: 500, // 500 points to reach
      icon: '🥈',
      color: '#C0C0C0',
      pointsMultiplier: 1.25,

      benefits: {
        rewards: [
          '1.25x points multiplier',
          'Birthday bonus: 100 points',
          'Double points events'
        ],
        shipping: [
          'Free standard shipping',
          'Express shipping discount: 50%'
        ],
        exclusive: [
          'Exclusive member sales',
          'Early access: 24h before public'
        ],
        support: [
          'Priority email support',
          'Live chat support'
        ]
      },

      benefitsList: [
        '1.25x points multiplier',
        'Free standard shipping',
        'Priority support'
      ],

      discountRate: 0,
      freeShippingThreshold: 0,
      supportLevel: 'priority'
    },

    gold: {
      name: 'Gold',
      threshold: 2000, // 2000 points to reach
      icon: '🥇',
      color: '#FFD700',
      pointsMultiplier: 1.5,

      benefits: {
        rewards: [
          '1.5x points multiplier',
          'Birthday bonus: 200 points',
          'Double points every month',
          'Bonus points on new products'
        ],
        shipping: [
          'Free express shipping',
          'Same-day delivery in select cities',
          'Free returns (extended 60 days)'
        ],
        exclusive: [
          'VIP member sales',
          'Early access: 48h before public',
          'Exclusive product previews'
        ],
        support: [
          'Dedicated support line',
          'Video consultation available',
          'Faster response times'
        ]
      },

      benefitsList: [
        '1.5x points multiplier',
        'Free express shipping',
        'Dedicated support line',
        '48h early access to sales'
      ],

      discountRate: 0,
      freeShippingThreshold: 0,
      expressShipping: true,
      supportLevel: 'dedicated'
    },

    platinum: {
      name: 'Platinum',
      threshold: 5000, // 5000 points to reach
      icon: '💎',
      color: '#E5E4E2',
      pointsMultiplier: 2.0,

      benefits: {
        rewards: [
          '2x points multiplier',
          'Birthday bonus: 500 points',
          'Surprise bonus points',
          'Partner rewards program'
        ],
        shipping: [
          'Free express shipping worldwide',
          'Priority handling',
          'Free gift wrapping',
          'Unlimited free returns'
        ],
        exclusive: [
          'Private sales access',
          'Early access: 72h before public',
          'Exclusive limited editions',
          'VIP events & experiences'
        ],
        support: [
          'Personal shopping assistant',
          'WhatsApp support',
          '24/7 priority support',
          'Exclusive hotline'
        ]
      },

      benefitsList: [
        '2x points multiplier',
        'Free worldwide express shipping',
        'Personal shopping assistant',
        'VIP events access',
        'Exclusive limited editions'
      ],

      discountRate: 0,
      freeShippingThreshold: 0,
      expressShipping: true,
      worldwideShipping: true,
      supportLevel: 'vip'
    }
  }

  // ============================================
  // POINTS REDEMPTION OPTIONS
  // ============================================

  const redemptionOptions = [
    { points: 100, value: 5, type: 'voucher', description: '5 EUR Gutschein' },
    { points: 200, value: 12, type: 'voucher', description: '12 EUR Gutschein' },
    { points: 500, value: 35, type: 'voucher', description: '35 EUR Gutschein' },
    { points: 1000, value: 80, type: 'voucher', description: '80 EUR Gutschein' },
    { points: 150, value: null, type: 'shipping', description: 'Gratis Express-Versand' },
    { points: 250, value: null, type: 'gift', description: 'Überraschungsgeschenk' }
  ]

  // ============================================
  // BONUS POINT EVENTS
  // ============================================

  const bonusEvents = {
    welcome: { points: 100, description: 'Welcome Bonus' },
    birthday: { points: 50, multiplier: 'tier', description: 'Birthday Bonus' },
    review: { points: 25, description: 'Product Review' },
    referral: { points: 200, description: 'Refer a Friend' },
    newsletter: { points: 50, description: 'Newsletter Signup' },
    firstPurchase: { points: 50, description: 'First Purchase' },
    appDownload: { points: 75, description: 'App Download' },
    // Strava Integration Bonuses
    stravaConnect: { points: 100, description: 'Connect Strava Account' },
    stravaMonthlySync: { points: 50, description: 'Monthly Strava Sync Bonus' },
    stravaKilometers: { points: 1, description: 'Point per kilometer ridden', perUnit: 'km' }
  }

  // ============================================
  // REACTIVE STATE
  // ============================================

  const state = reactive({
    currentTier: 'bronze',
    totalPoints: 0,
    availablePoints: 0,
    lifetimePoints: 0,
    isActive: false
  })

  // ============================================
  // TIER CALCULATION
  // ============================================

  const calculateTier = (lifetimePoints) => {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum']
    const tierEntries = tierOrder.map(key => [key, loyaltyTiers[key]]).reverse()
    return tierEntries.find(([_, tier]) => lifetimePoints >= tier.threshold)?.[0] || 'bronze'
  }

  // ============================================
  // POINTS CALCULATION
  // ============================================

  // Base rate: 0.5 points per EUR (multiplied by tier multiplier)
  const BASE_POINTS_PER_EUR = 0.5

  const calculatePointsForPurchase = (amount, tierName = 'bronze') => {
    const tier = loyaltyTiers[tierName] || loyaltyTiers.bronze
    return Math.floor(amount * BASE_POINTS_PER_EUR * tier.pointsMultiplier)
  }

  const calculateDiscountedPrice = (price, tierName = 'bronze') => {
    const tier = loyaltyTiers[tierName] || loyaltyTiers.bronze
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

  const getNextTierInfo = (currentPoints) => {
    const currentTierName = calculateTier(currentPoints)
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum']
    const currentIndex = tierOrder.indexOf(currentTierName)

    if (currentIndex < tierOrder.length - 1) {
      const nextTierName = tierOrder[currentIndex + 1]
      const nextTier = loyaltyTiers[nextTierName]
      const remaining = nextTier.threshold - currentPoints
      const progress = Math.min((currentPoints / nextTier.threshold) * 100, 100)

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

    return null // Already at highest tier
  }

  const getTierData = (tierName) => {
    return loyaltyTiers[tierName] || loyaltyTiers.bronze
  }

  const getPointsValue = (points) => {
    // 100 points = 5 EUR value
    return (points / 100) * 5
  }

  const getRedemptionOptions = (availablePoints) => {
    return redemptionOptions.filter(option => option.points <= availablePoints)
  }

  const getBonusForEvent = (eventType, tierName = 'bronze') => {
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
      social: 0,
      total: 0
    }

    // Purchase engagement (40%)
    const purchaseScore = Math.min((metrics.orderCount || 0) / 10, 1) * 100
    scores.purchases = Math.round(purchaseScore)

    // Activity engagement (40%)
    const activityScore = Math.min(
      ((metrics.reviewsWritten || 0) * 10 +
       (metrics.wishlistItems || 0) * 5 +
       (metrics.pageViews || 0) * 0.1) / 100, 1
    ) * 100
    scores.activity = Math.round(activityScore)

    // Social engagement (20%)
    const socialScore = Math.min(
      ((metrics.referrals || 0) * 30 +
       (metrics.socialShares || 0) * 10) / 100, 1
    ) * 100
    scores.social = Math.round(socialScore)

    scores.total = Math.round(
      scores.purchases * 0.4 +
      scores.activity * 0.4 +
      scores.social * 0.2
    )

    return scores
  }

  // ============================================
  // ALIAS FUNCTIONS FOR COMPATIBILITY
  // ============================================

  const calculatePoints = (amount, tierName = 'bronze') => {
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

    // State
    state,

    // Tier functions
    calculateTier,
    getActiveBenefits,
    getCategorizedBenefits,
    getNextTierInfo,
    getTierData,

    // Points functions
    calculatePoints, // Alias for checkout compatibility
    calculatePointsForPurchase,
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
