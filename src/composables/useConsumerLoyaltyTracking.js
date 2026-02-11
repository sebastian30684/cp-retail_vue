// composables/useConsumerLoyaltyTracking.js
// B2C Consumer Loyalty Tracking for SAP Customer Data Platform
// Tracks consumer behavior, purchases, and loyalty program interactions

import { ref } from 'vue'

// Capitalize tier for CDP (rider → Rider, racer → Racer, legend → Legend)
const capitalizeTier = (tier) => {
  if (!tier) return 'Rider'
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
}

export function useConsumerTracking() {
  const isTracking = ref(false)
  const trackingQueue = ref([])

  // ============================================
  // CORE TRACKING FUNCTION
  // ============================================

  const sendTrackingEvent = (eventData) => {
    // Add to queue
    trackingQueue.value.push({
      ...eventData,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    })

    // Log for development
    console.log('📊 [Consumer Tracking]', eventData.event, eventData)

    // In production, this would send to CDP/Analytics
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData)
    }

    return eventData
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('consumer_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('consumer_session_id', sessionId)
    }
    return sessionId
  }

  // ============================================
  // PRODUCT TRACKING
  // ============================================

  const trackProductView = (product) => {
    return sendTrackingEvent({
      event: 'product_view',
      ecommerce: {
        detail: {
          products: [{
            id: product.id,
            name: product.productName,
            category: product.category,
            subcategory: product.subcategory,
            price: product.price,
            brand: product.brand,
            variant: product.variant
          }]
        }
      }
    })
  }

  const trackProductClick = (product, listName = 'Product List') => {
    return sendTrackingEvent({
      event: 'product_click',
      ecommerce: {
        click: {
          actionField: { list: listName },
          products: [{
            id: product.id,
            name: product.productName,
            category: product.category,
            price: product.price,
            brand: product.brand
          }]
        }
      }
    })
  }

  const trackAddToCart = (product, quantity = 1) => {
    return sendTrackingEvent({
      event: 'add_to_cart',
      ecommerce: {
        currencyCode: product.currency || 'EUR',
        add: {
          products: [{
            id: product.id,
            name: product.productName,
            category: product.category,
            price: product.finalPrice || product.price,
            brand: product.brand,
            variant: product.selectedVariant,
            quantity: quantity
          }]
        }
      }
    })
  }

  const trackRemoveFromCart = (product, quantity = 1) => {
    return sendTrackingEvent({
      event: 'remove_from_cart',
      ecommerce: {
        remove: {
          products: [{
            id: product.id,
            name: product.productName,
            price: product.price,
            quantity: quantity
          }]
        }
      }
    })
  }

  const trackAddToWishlist = (product) => {
    return sendTrackingEvent({
      event: 'add_to_wishlist',
      ecommerce: {
        items: [{
          id: product.id,
          name: product.productName,
          category: product.category,
          price: product.price,
          brand: product.brand
        }]
      }
    })
  }

  // ============================================
  // CHECKOUT TRACKING
  // ============================================

  const trackCheckoutStep = (step, cartItems, option = '') => {
    return sendTrackingEvent({
      event: 'checkout',
      ecommerce: {
        checkout: {
          actionField: { step, option },
          products: cartItems.map(item => ({
            id: item.id,
            name: item.productName,
            category: item.category,
            price: item.finalPrice || item.price,
            brand: item.brand,
            variant: item.selectedVariant,
            quantity: item.quantity
          }))
        }
      }
    })
  }

  const trackPurchase = (orderData) => {
    // Loyalty data is now sent separately via trackCdpLoyaltyActivity (earnPoints/redeemPoints)
    return sendTrackingEvent({
      event: 'purchase',
      ecommerce: {
        purchase: {
          actionField: {
            id: orderData.id,
            revenue: orderData.total,
            tax: orderData.tax || 0,
            shipping: orderData.shipping || 0,
            coupon: orderData.couponCode || ''
          },
          products: (orderData.items || []).map(item => ({
            id: item.id,
            name: item.productName,
            category: item.category,
            price: item.finalPrice || item.price,
            brand: item.brand,
            variant: item.selectedVariant,
            quantity: item.quantity
          }))
        }
      }
    })
  }

  // ============================================
  // LOYALTY PROGRAM TRACKING
  // ============================================

  const trackPointsEarned = (points, source, orderId = null) => {
    return sendTrackingEvent({
      event: 'loyalty_points_earned',
      loyalty: {
        points: points,
        source: source, // 'purchase', 'bonus', 'referral', 'review', etc.
        orderId: orderId
      }
    })
  }

  // ============================================
  // CDP LOYALTY ACTIVITY TRACKING
  // ============================================

  const getCookieId = () => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === '_ga' || name === 'cookieId') {
        return value
      }
    }
    return `cookie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const trackCdpLoyaltyActivity = (activityData) => {
    const {
      cdcUid,
      activityType,
      pointsAmount,
      pointsBalance,
      relatedOrderId,
      relatedProductIds = [],
      redemptionType = '',
      loyaltyTier,
      inviteReason = ''
    } = activityData

    const eventData = {
      cookieId: getCookieId(),
      cdcUid: cdcUid,
      timestamp: new Date().toISOString(),
      loyaltyActivity: {
        activityType: activityType,
        pointsAmount: pointsAmount,
        pointsBalance: pointsBalance,
        relatedOrderId: relatedOrderId || '',
        relatedProductIds: relatedProductIds,
        redemptionType: redemptionType,
        loyaltyTier: capitalizeTier(loyaltyTier),
        inviteReason: inviteReason
      },
      loyaltyId: cdcUid
    }

    // Send to CDP
    if (typeof window !== 'undefined' && window.CDP) {
      window.CDP.report('LoyaltyActivity', eventData)
      console.log('📊 [CDP LoyaltyActivity]', eventData)
    } else {
      console.warn('⚠️ CDP not available, queuing LoyaltyActivity event')
      // Fallback: store for later or log
      trackingQueue.value.push({ type: 'CDP_LoyaltyActivity', data: eventData })
    }

    return eventData
  }

  const trackPointsRedeemed = (points, redemptionType, value) => {
    return sendTrackingEvent({
      event: 'loyalty_points_redeemed',
      loyalty: {
        points: points,
        redemptionType: redemptionType, // 'voucher', 'shipping', 'gift'
        value: value
      }
    })
  }

  const trackTierChange = (oldTier, newTier, lifetimePoints) => {
    return sendTrackingEvent({
      event: 'loyalty_tier_change',
      loyalty: {
        previousTier: oldTier,
        newTier: newTier,
        lifetimePoints: lifetimePoints,
        direction: newTier > oldTier ? 'upgrade' : 'downgrade'
      }
    })
  }

  const trackLoyaltySignup = (userId) => {
    return sendTrackingEvent({
      event: 'loyalty_signup',
      loyalty: {
        userId: userId,
        tier: 'rider',
        welcomeBonus: 100
      }
    })
  }

  // Track loyalty program view
  const trackLoyaltyView = (cdcUid, balance, tier) => {
    return trackCdpLoyaltyActivity({
      cdcUid: cdcUid,
      activityType: 'view',
      pointsAmount: 0,
      pointsBalance: balance,
      loyaltyTier: tier
    })
  }

  // Track invitation view
  const trackInviteView = (cdcUid, balance, tier, reason) => {
    return trackCdpLoyaltyActivity({
      cdcUid: cdcUid,
      activityType: 'inviteView',
      pointsAmount: 0,
      pointsBalance: balance,
      loyaltyTier: tier,
      inviteReason: reason
    })
  }

  // Track invitation accepted
  const trackInviteAccept = (cdcUid, balance, tier) => {
    return trackCdpLoyaltyActivity({
      cdcUid: cdcUid,
      activityType: 'inviteAccept',
      pointsAmount: 0,
      pointsBalance: balance,
      loyaltyTier: tier
    })
  }

  // Track invitation declined
  const trackInviteDecline = (cdcUid, balance, tier) => {
    return trackCdpLoyaltyActivity({
      cdcUid: cdcUid,
      activityType: 'inviteDecline',
      pointsAmount: 0,
      pointsBalance: balance,
      loyaltyTier: tier
    })
  }

  // ============================================
  // CREW: CHALLENGE ACTIVITY TRACKING
  // ============================================

  const trackCdpChallengeActivity = (activityData) => {
    const {
      cdcUid,
      challengeId,
      challengeName,
      challengeType = 'monthly',
      activityType,    // 'started', 'progress', 'completed'
      currentProgress = 0,
      targetGoal = 0,
      unit = 'km',
      pointsEarned = 0,
      rewardType = null,
      rewardDescription = null
    } = activityData

    const eventData = {
      cookieId: getCookieId(),
      cdcUid: cdcUid,
      timestamp: new Date().toISOString(),
      challengeId,
      challengeName,
      challengeType,
      activityType,
      currentProgress,
      targetGoal,
      unit,
      pointsEarned,
      rewardType,
      rewardDescription
    }

    if (typeof window !== 'undefined' && window.CDP) {
      window.CDP.report('ChallengeActivity', eventData)
      console.log('📊 [CDP ChallengeActivity]', eventData)
    } else {
      console.warn('⚠️ CDP not available, queuing ChallengeActivity event')
      trackingQueue.value.push({ type: 'CDP_ChallengeActivity', data: eventData })
    }

    return eventData
  }

  // ============================================
  // CREW: RIDE CLUB ACTIVITY TRACKING
  // ============================================

  const trackCdpRideClubActivity = (activityData) => {
    const {
      cdcUid,
      clubId,
      clubName,
      clubType = 'official',
      activityType,    // 'joined', 'ride_attended', 'milestone', 'ride_organized'
      rideId = null,
      rideName = null,
      totalRides = 0,
      pointsEarned = 0,
      milestoneType = null,
      milestoneReward = null
    } = activityData

    const eventData = {
      cookieId: getCookieId(),
      cdcUid: cdcUid,
      timestamp: new Date().toISOString(),
      clubId,
      clubName,
      clubType,
      activityType,
      rideId,
      rideName,
      totalRides,
      pointsEarned,
      milestoneType,
      milestoneReward
    }

    if (typeof window !== 'undefined' && window.CDP) {
      window.CDP.report('RideClubActivity', eventData)
      console.log('📊 [CDP RideClubActivity]', eventData)
    } else {
      console.warn('⚠️ CDP not available, queuing RideClubActivity event')
      trackingQueue.value.push({ type: 'CDP_RideClubActivity', data: eventData })
    }

    return eventData
  }

  // ============================================
  // USER ENGAGEMENT TRACKING
  // ============================================

  const trackReviewSubmitted = (product, rating, hasText = false) => {
    return sendTrackingEvent({
      event: 'review_submitted',
      engagement: {
        productId: product.id,
        productName: product.productName,
        rating: rating,
        hasTextReview: hasText,
        pointsEarned: 25
      }
    })
  }

  const trackReferral = (referralCode, referredEmail) => {
    return sendTrackingEvent({
      event: 'referral_sent',
      engagement: {
        referralCode: referralCode,
        referredEmail: referredEmail ? '***' : null, // Privacy
        pointsEarned: 200
      }
    })
  }

  const trackNewsletterSignup = (email) => {
    return sendTrackingEvent({
      event: 'newsletter_signup',
      engagement: {
        email: email ? '***' : null, // Privacy
        pointsEarned: 50
      }
    })
  }

  const trackSocialShare = (platform, productId) => {
    return sendTrackingEvent({
      event: 'social_share',
      engagement: {
        platform: platform,
        productId: productId
      }
    })
  }

  // ============================================
  // SEARCH & NAVIGATION TRACKING
  // ============================================

  const trackSearch = (query, resultsCount) => {
    return sendTrackingEvent({
      event: 'search',
      search: {
        query: query,
        resultsCount: resultsCount
      }
    })
  }

  const trackCategoryView = (category, subcategory = null) => {
    return sendTrackingEvent({
      event: 'category_view',
      navigation: {
        category: category,
        subcategory: subcategory
      }
    })
  }

  const trackFilterApplied = (filterType, filterValue) => {
    return sendTrackingEvent({
      event: 'filter_applied',
      navigation: {
        filterType: filterType,
        filterValue: filterValue
      }
    })
  }

  // ============================================
  // USER PROFILE TRACKING
  // ============================================

  const trackLogin = (userId, method = 'email') => {
    return sendTrackingEvent({
      event: 'login',
      user: {
        userId: userId,
        method: method
      }
    })
  }

  const trackSignup = (userId, method = 'email') => {
    return sendTrackingEvent({
      event: 'signup',
      user: {
        userId: userId,
        method: method
      }
    })
  }

  const trackProfileUpdate = (fields) => {
    return sendTrackingEvent({
      event: 'profile_update',
      user: {
        updatedFields: fields
      }
    })
  }

  // ============================================
  // RETURN PUBLIC API
  // ============================================

  return {
    // State
    isTracking,
    trackingQueue,

    // Product tracking
    trackProductView,
    trackProductClick,
    trackAddToCart,
    trackRemoveFromCart,
    trackAddToWishlist,

    // Checkout tracking
    trackCheckoutStep,
    trackPurchase,

    // Loyalty tracking
    trackPointsEarned,
    trackPointsRedeemed,
    trackTierChange,
    trackLoyaltySignup,
    trackCdpLoyaltyActivity,
    trackLoyaltyView,
    trackInviteView,
    trackInviteAccept,
    trackInviteDecline,

    // CREW: Challenge & Ride Club tracking
    trackCdpChallengeActivity,
    trackCdpRideClubActivity,

    // Engagement tracking
    trackReviewSubmitted,
    trackReferral,
    trackNewsletterSignup,
    trackSocialShare,

    // Navigation tracking
    trackSearch,
    trackCategoryView,
    trackFilterApplied,

    // User tracking
    trackLogin,
    trackSignup,
    trackProfileUpdate
  }
}
