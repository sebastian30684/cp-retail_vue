<template>
  <div class="checkout-page">
    <div class="sap-container">
      <!-- Checkout Header -->
      <div class="checkout-header">
        <button @click="$emit('navigate', 'shop')" class="back-btn">
          ← Back to Shop
        </button>
        <h1>Checkout</h1>
      </div>

      <!-- Progress Bar -->
      <div class="checkout-progress">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="progress-step"
          :class="{ 
            'active': currentStep === index, 
            'completed': currentStep > index 
          }"
        >
          <div class="step-indicator">
            <span v-if="currentStep > index" class="step-check">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>

      <div class="checkout-layout">
        <!-- Main Content -->
        <div class="checkout-main">
          
          <!-- Step 1: Address (B2C simplified) -->
          <div v-if="currentStep === 0" class="checkout-step">
            <div class="step-card">
              <h2 class="step-title">
                <span class="title-icon">📍</span>
                Shipping & Billing Address
              </h2>

              <!-- Address Type Toggle -->
              <div class="address-toggle">
                <button
                  @click="useSameAddress = true"
                  class="toggle-btn"
                  :class="{ active: useSameAddress }"
                >
                  Same Address
                </button>
                <button
                  @click="useSameAddress = false"
                  class="toggle-btn"
                  :class="{ active: !useSameAddress }"
                >
                  Different Shipping Address
                </button>
              </div>

              <!-- Billing Address -->
              <div class="address-section">
                <h3>Billing Address</h3>
                <div class="address-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        v-model="billingAddress.firstName"
                        :class="{ 'input-error': addressErrors.billingFirstName }"
                        placeholder="John"
                      >
                    </div>
                    <div class="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        v-model="billingAddress.lastName"
                        :class="{ 'input-error': addressErrors.billingLastName }"
                        placeholder="Doe"
                      >
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      v-model="billingAddress.email"
                      :class="{ 'input-error': addressErrors.billingEmail }"
                      placeholder="john@email.com"
                    >
                  </div>

                  <div class="form-group">
                    <label>Street & Number *</label>
                    <input
                      type="text"
                      v-model="billingAddress.street"
                      :class="{ 'input-error': addressErrors.billingStreet }"
                      placeholder="123 Main Street"
                    >
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Postal Code *</label>
                      <input
                        type="text"
                        v-model="billingAddress.postalCode"
                        :class="{ 'input-error': addressErrors.billingPostal }"
                        placeholder="12345"
                      >
                    </div>
                    <div class="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        v-model="billingAddress.city"
                        :class="{ 'input-error': addressErrors.billingCity }"
                        placeholder="New York"
                      >
                    </div>
                    <div class="form-group">
                      <label>Country *</label>
                      <select v-model="billingAddress.country">
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="AT">Austria</option>
                        <option value="CH">Switzerland</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Phone (optional)</label>
                    <input
                      type="tel"
                      v-model="billingAddress.phone"
                      placeholder="+1 555 123-4567"
                    >
                  </div>
                </div>
              </div>

              <!-- Delivery Address (if different) -->
              <div v-if="!useSameAddress" class="address-section">
                <h3>Shipping Address</h3>
                <div class="address-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        v-model="deliveryAddress.firstName"
                        placeholder="John"
                      >
                    </div>
                    <div class="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        v-model="deliveryAddress.lastName"
                        placeholder="Doe"
                      >
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Street & Number *</label>
                    <input
                      type="text"
                      v-model="deliveryAddress.street"
                      placeholder="123 Main Street"
                    >
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Postal Code *</label>
                      <input
                        type="text"
                        v-model="deliveryAddress.postalCode"
                        placeholder="12345"
                      >
                    </div>
                    <div class="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        v-model="deliveryAddress.city"
                        placeholder="New York"
                      >
                    </div>
                    <div class="form-group">
                      <label>Country *</label>
                      <select v-model="deliveryAddress.country">
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="AT">Austria</option>
                        <option value="CH">Switzerland</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Delivery Instructions (optional)</label>
                    <textarea
                      v-model="deliveryAddress.instructions"
                      placeholder="e.g. Leave at front door..."
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button @click="nextStep" class="sap-btn sap-btn-primary">
                  Continue to Review →
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Review (B2C) -->
          <div v-if="currentStep === 1" class="checkout-step">
            <div class="step-card">
              <h2 class="step-title">
                <span class="title-icon">📋</span>
                Review Order
              </h2>

              <!-- Address Summary -->
              <div class="review-section">
                <div class="review-header">
                  <h3>Addresses</h3>
                  <button @click="currentStep = 0" class="edit-btn">Edit</button>
                </div>
                <div class="address-summary-grid">
                  <div class="address-summary-card">
                    <h4>Billing Address</h4>
                    <p><strong>{{ billingAddress.firstName }} {{ billingAddress.lastName }}</strong></p>
                    <p>{{ billingAddress.street }}</p>
                    <p>{{ billingAddress.postalCode }} {{ billingAddress.city }}</p>
                    <p>{{ getCountryName(billingAddress.country) }}</p>
                  </div>
                  <div class="address-summary-card">
                    <h4>Shipping Address</h4>
                    <template v-if="useSameAddress">
                      <p class="same-address">Same as billing address</p>
                    </template>
                    <template v-else>
                      <p><strong>{{ deliveryAddress.firstName }} {{ deliveryAddress.lastName }}</strong></p>
                      <p>{{ deliveryAddress.street }}</p>
                      <p>{{ deliveryAddress.postalCode }} {{ deliveryAddress.city }}</p>
                      <p>{{ getCountryName(deliveryAddress.country) }}</p>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Items Review -->
              <div class="review-section">
                <div class="review-header">
                  <h3>Ordered Items ({{ cartItems.length }})</h3>
                </div>
                <div class="items-review">
                  <div v-for="item in cartItems" :key="item.id" class="review-item">
                    <div class="item-info">
                      <h4>{{ item.productName }}</h4>
                      <p class="item-category">{{ item.category }}</p>
                    </div>
                    <div class="item-quantity">
                      {{ item.quantity }}x
                    </div>
                    <div class="item-pricing">
                      <div class="simple-price">
                        {{ (item.price * item.quantity).toLocaleString() }} €
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Applied Loyalty Voucher -->
              <div v-if="hasCartDiscount" class="review-section redeem-section">
                <div class="review-header">
                  <h3>🎁 Loyalty Voucher Applied</h3>
                </div>
                <div class="voucher-applied-card">
                  <div class="voucher-info">
                    <span class="voucher-name">{{ cartDiscount.description }}</span>
                    <span class="voucher-value">-{{ cartDiscountAmount.toLocaleString() }} €</span>
                  </div>
                  <button @click="$emit('remove-discount')" class="remove-voucher-btn">
                    Remove
                  </button>
                </div>
              </div>

              <!-- Points to Earn Section (B2C) -->
              <div class="review-section points-section">
                <div class="crew-points-banner">
                  <div class="crew-points-left">
                    <span class="crew-points-amount">+{{ pointsToEarn }}</span>
                    <span class="crew-points-label">CREW Points</span>
                  </div>
                  <div class="crew-points-right">
                    <span class="crew-tier-badge">{{ getTierIcon(loyaltyTier) }} {{ getTierLabel(loyaltyTier) }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Info (B2C) -->
              <div class="review-section">
                <div class="review-header">
                  <h3>Payment</h3>
                </div>
                <div class="payment-terms-card">
                  <div class="terms-icon">💳</div>
                  <div class="terms-content">
                    <h4>Secure Payment</h4>
                    <p>Payment via invoice, credit card, or PayPal upon confirmation.</p>
                  </div>
                </div>
              </div>

              <!-- Order Notes -->
              <div class="review-section">
                <div class="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    v-model="orderNotes"
                    placeholder="Special delivery requests..."
                    rows="2"
                  ></textarea>
                </div>
              </div>

              <div class="step-actions">
                <button @click="currentStep = 0" class="sap-btn sap-btn-secondary">
                  ← Back
                </button>
                <button
                  @click="placeOrder"
                  class="sap-btn sap-btn-primary place-order-btn"
                  :disabled="!canPlaceOrder || isProcessing"
                >
                  <span v-if="isProcessing" class="spinner"></span>
                  <span v-else>🛒 Place Order</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Confirmation (B2C) -->
          <div v-if="currentStep === 2" class="checkout-step">
            <div class="step-card confirmation-card">
              <div class="confirmation-header">
                <div class="success-icon">🎉</div>
                <h2>Order Placed Successfully!</h2>
                <p class="order-id">Order Number: <strong>{{ placedOrder.id }}</strong></p>
              </div>

              <div class="confirmation-content">
                <!-- Points Hero Card -->
                <div class="crew-points-hero">
                  <div class="hero-points-number">+{{ placedOrder.pointsEarned }}</div>
                  <div class="hero-points-text">CREW Points Earned</div>
                  <div class="hero-tier-badge">{{ getTierIcon(loyaltyTier) }} {{ getTierLabel(loyaltyTier) }} Member</div>
                </div>

                <div class="confirmation-section">
                  <h3>Order Summary</h3>
                  <div class="summary-grid">
                    <div class="summary-item">
                      <span class="label">Order Date</span>
                      <span class="value">{{ formatDate(placedOrder.timestamp) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Total Amount</span>
                      <span class="value total">{{ placedOrder.total?.toLocaleString() }} €</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Points Earned</span>
                      <span class="value points-earned">+{{ placedOrder.pointsEarned }} ⭐</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Items</span>
                      <span class="value">{{ placedOrder.items?.length }} Products</span>
                    </div>
                  </div>
                </div>

                <div class="confirmation-section">
                  <h3>Next Steps</h3>
                  <div class="next-steps-list">
                    <div class="next-step">
                      <span class="step-icon">📧</span>
                      <div>
                        <strong>Confirmation Email</strong>
                        <p>You will receive an order confirmation at {{ billingAddress.email }}</p>
                      </div>
                    </div>
                    <div class="next-step">
                      <span class="step-icon">📦</span>
                      <div>
                        <strong>Shipping</strong>
                        <p>Your order will be shipped within 2-3 business days</p>
                      </div>
                    </div>
                    <div class="next-step">
                      <span class="step-icon">⭐</span>
                      <div>
                        <strong>Points Credited</strong>
                        <p>{{ placedOrder.pointsEarned }} points have been added to your account!</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div class="confirmation-actions">
                <button @click="$emit('navigate', 'order-history')" class="sap-btn sap-btn-secondary">
                  📋 Order History
                </button>
                <button @click="$emit('navigate', 'shop')" class="sap-btn sap-btn-primary">
                  Continue Shopping →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar (B2C) -->
        <div v-if="currentStep < 2" class="checkout-sidebar">
          <div class="sidebar-card">
            <h3>Order Summary</h3>

            <div class="sidebar-items">
              <div v-for="item in cartItems" :key="item.id" class="sidebar-item">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-qty">{{ item.quantity }}x</span>
                <span class="item-price">{{ (item.price * item.quantity).toLocaleString() }} €</span>
              </div>
            </div>

            <div class="sidebar-totals">
              <div class="total-row">
                <span>Subtotal (incl. VAT)</span>
                <span>{{ cartSubtotal.toLocaleString() }} €</span>
              </div>

              <!-- Loyalty Voucher Discount -->
              <div v-if="hasCartDiscount" class="total-row discount voucher-discount">
                <div class="discount-info">
                  <span>🎁 {{ cartDiscount.description }}</span>
                  <button @click="$emit('remove-discount')" class="remove-discount-btn">✕</button>
                </div>
                <span>-{{ cartDiscountAmount.toLocaleString() }} €</span>
              </div>

              <div class="total-row grand-total">
                <span>Total</span>
                <span>{{ cartTotal.toLocaleString() }} €</span>
              </div>

              <div class="total-row vat-info">
                <span>incl. VAT (19%)</span>
                <span>{{ cartTax.toLocaleString() }} €</span>
              </div>
            </div>

            <!-- Points Preview -->
            <div class="crew-points-preview">
              <div class="crew-preview-row">
                <span class="crew-preview-icon">{{ getTierIcon(loyaltyTier) }}</span>
                <span class="crew-preview-tier">Canyon CREW {{ getTierLabel(loyaltyTier) }}</span>
              </div>
              <div class="crew-preview-points">
                <span class="crew-preview-amount">+{{ pointsToEarn }}</span>
                <span class="crew-preview-label">Points with this order</span>
              </div>
            </div>
          </div>

          <!-- Help Card -->
          <div class="sidebar-card help-card">
            <h4>Need Help?</h4>
            <p>Our team is happy to assist you.</p>
            <p><strong>📞</strong> +1 (800) 123-4567</p>
            <p><strong>📧</strong> support@sapretailstore.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, inject } from 'vue'
import { useConsumerLoyalty, loyaltyStorage } from '@/composables/useConsumerLoyalty'
import { useConsumerTracking } from '@/composables/useConsumerLoyaltyTracking'

export default {
  name: 'CheckoutPage',
  props: {
    cartItems: {
      type: Array,
      default: () => []
    },
    cartDiscount: {
      type: Object,
      default: () => ({ type: 'none', value: 0, description: '' })
    },
    isGuest: {
      type: Boolean,
      default: false
    }
  },
  emits: ['navigate', 'order-placed', 'clear-cart', 'remove-discount'],
  setup(props, { emit }) {
    const user = inject('user', { UID: 'demo_user', isLoggedIn: false, name: '', email: '' })
    const { calculateTier, getTierData, calculatePoints } = useConsumerLoyalty()
    const { trackPurchase, trackCdpLoyaltyActivity } = useConsumerTracking()

    // Steps
    const steps = [
      { id: 'address', label: 'Address' },
      { id: 'review', label: 'Review' },
      { id: 'confirmation', label: 'Confirmation' }
    ]
    const currentStep = ref(0)

    // Address state (B2C - simplified for demo)
    const useSameAddress = ref(true)
    const [userFirst, ...lastParts] = (user.name || '').split(' ')
    const billingAddress = reactive({
      firstName: userFirst || 'Max',
      lastName: lastParts.join(' ') || 'Mustermann',
      email: user.email || 'max@example.com',
      street: 'Dietmar Hopp Allee 7',
      postalCode: '69190',
      city: 'Walldorf',
      country: 'DE',
      phone: '+49 123 456789'
    })

    const deliveryAddress = reactive({
      firstName: userFirst || 'Max',
      lastName: lastParts.join(' ') || 'Mustermann',
      street: 'Dietmar Hopp Allee 7',
      postalCode: '69190',
      city: 'Walldorf',
      country: 'DE',
      instructions: ''
    })

    const addressErrors = reactive({})

    // Order state
    const orderNotes = ref('')
    const isProcessing = ref(false)
    const placedOrder = ref({})

    // Loyalty calculations (B2C) - redemption now happens via LoyaltyFloatingButton
    const loyaltyTier = computed(() => {
      const userId = user.UID || 'demo_user'
      const points = loyaltyStorage.getPoints(userId)
      return calculateTier(points)
    })

    const tierData = computed(() => {
      return getTierData(loyaltyTier.value)
    })

    // Check if cart discount is applied (from LoyaltyFloatingButton)
    const hasCartDiscount = computed(() => {
      return props.cartDiscount && props.cartDiscount.type !== 'none' && props.cartDiscount.value > 0
    })

    // Calculate cart discount amount
    const cartDiscountAmount = computed(() => {
      if (!hasCartDiscount.value) return 0
      const subtotal = props.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      if (props.cartDiscount.type === 'percentage') {
        return Math.round(subtotal * (props.cartDiscount.value / 100) * 100) / 100
      }
      if (props.cartDiscount.type === 'fixed') {
        return Math.min(props.cartDiscount.value, subtotal)
      }
      if (props.cartDiscount.type === 'shipping') {
        return 4.95 // Standard shipping cost
      }
      return 0
    })

    // Total discount (from LoyaltyFloatingButton only)
    const totalDiscount = computed(() => {
      return cartDiscountAmount.value
    })

    // Cart calculations (prices are GROSS = including 19% VAT)
    const cartSubtotal = computed(() => {
      return props.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    // Total after all discounts (still gross)
    const cartTotal = computed(() => {
      return Math.max(0, Math.round((cartSubtotal.value - totalDiscount.value) * 100) / 100)
    })

    // VAT is included in the price: VAT = Gross * 19 / 119
    const cartTax = computed(() => {
      return Math.round(cartTotal.value * 19 / 119 * 100) / 100
    })

    // Points to earn from this order (based on final amount after all discounts)
    const pointsToEarn = computed(() => {
      return calculatePoints(cartTotal.value, loyaltyTier.value)
    })

    const canPlaceOrder = computed(() => {
      return props.cartItems.length > 0
    })

    // Validation (B2C simplified)
    const validateAddresses = () => {
      const errors = {}

      if (!billingAddress.firstName) errors.billingFirstName = true
      if (!billingAddress.lastName) errors.billingLastName = true
      if (!billingAddress.email) errors.billingEmail = true
      if (!billingAddress.street) errors.billingStreet = true
      if (!billingAddress.postalCode) errors.billingPostal = true
      if (!billingAddress.city) errors.billingCity = true

      Object.assign(addressErrors, errors)
      return Object.keys(errors).length === 0
    }

    const nextStep = () => {
      if (currentStep.value === 0) {
        if (validateAddresses()) {
          currentStep.value = 1
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }

    const placeOrder = async () => {
      if (!canPlaceOrder.value) return

      isProcessing.value = true

      try {
        await new Promise(resolve => setTimeout(resolve, 2000))

        const orderId = `ORD-${Date.now()}`
        const earnedPoints = pointsToEarn.value
        const userId = user.UID || 'demo_user'

        const orderData = {
          id: orderId,
          timestamp: new Date().toISOString(),
          items: props.cartItems.map(item => ({
            ...item,
            effectivePrice: item.price
          })),
          billingAddress: { ...billingAddress },
          deliveryAddress: useSameAddress.value ? { ...billingAddress } : { ...deliveryAddress },
          subtotal: cartSubtotal.value,
          discount: cartDiscountAmount.value,
          tax: cartTax.value,
          total: cartTotal.value,
          tier: loyaltyTier.value,
          pointsEarned: earnedPoints,
          notes: orderNotes.value
        }

        // Save order (addOrder internally creates the points transaction)
        loyaltyStorage.addOrder(userId, orderData)

        // Track purchase
        trackPurchase(orderData)

        // Send CDP LoyaltyActivity Event for earned points
        const newBalance = loyaltyStorage.getPoints(userId)
        console.log('🔵 About to call trackCdpLoyaltyActivity:', { userId, earnedPoints, newBalance, loyaltyTier: loyaltyTier.value })
        trackCdpLoyaltyActivity({
          cdcUid: user.UID || userId,
          activityType: 'earnPoints',
          pointsAmount: earnedPoints,
          pointsBalance: newBalance,
          relatedOrderId: orderId,
          relatedProductIds: props.cartItems.map(item => ({ productId: item.id })),
          loyaltyTier: loyaltyTier.value
        })

        // Tracking service
        if (window.trackingService) {
          window.trackingService.trackPurchase({
            orderId: orderData.id,
            totalValue: orderData.total,
            tax: orderData.tax,
            currency: 'EUR',
            items: orderData.items
          })
        }

        placedOrder.value = orderData
        currentStep.value = 2

        emit('order-placed', orderData)
        emit('clear-cart')

      } catch (error) {
        console.error('Order placement error:', error)
        alert('An error occurred while processing your order. Please try again.')
      } finally {
        isProcessing.value = false
      }
    }

    // Helpers (B2C)
    const getTierIcon = (tier) => {
      const icons = { rider: '🚴', racer: '⚡', legend: '🏆' }
      return icons[tier] || '🚴'
    }

    const getTierLabel = (tier) => {
      const labels = { rider: 'Rider', racer: 'Racer', legend: 'Legend' }
      return labels[tier] || 'Rider'
    }

    const getCountryName = (code) => {
      const countries = {
        US: 'United States',
        GB: 'United Kingdom',
        DE: 'Germany',
        AT: 'Austria',
        CH: 'Switzerland',
        FR: 'France'
      }
      return countries[code] || code
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      steps,
      currentStep,
      useSameAddress,
      billingAddress,
      deliveryAddress,
      addressErrors,
      orderNotes,
      isProcessing,
      placedOrder,
      loyaltyTier,
      tierData,
      pointsToEarn,
      hasCartDiscount,
      cartDiscountAmount,
      cartSubtotal,
      cartTax,
      cartTotal,
      canPlaceOrder,
      nextStep,
      placeOrder,
      getTierIcon,
      getTierLabel,
      getCountryName,
      formatDate
    }
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 2rem 0 4rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--sap-blue-6);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--sap-blue-1);
}

.checkout-header h1 {
  font-size: 2rem;
  color: var(--sap-gray-8);
  margin: 0;
}

/* Progress Bar */
.checkout-progress {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  background: var(--sap-gray-1);
  color: var(--sap-gray-5);
  transition: all 0.3s;
}

.progress-step.active {
  background: var(--sap-blue-6);
  color: white;
}

.progress-step.completed {
  background: var(--sap-green-6);
  color: white;
}

.step-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.step-label {
  font-weight: 500;
}

/* Layout */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

/* Step Cards */
.step-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.step-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: var(--sap-gray-8);
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--sap-gray-2);
}

.title-icon {
  font-size: 1.5rem;
}

/* Address Toggle */
.address-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--sap-gray-6);
  transition: all 0.2s;
}

.toggle-btn.active {
  background: white;
  color: var(--sap-blue-7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Address Section */
.address-section {
  margin-bottom: 2rem;
}

.address-section h3 {
  font-size: 1.1rem;
  color: var(--sap-gray-7);
  margin-bottom: 1rem;
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: var(--sap-gray-7);
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--sap-gray-3);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--sap-blue-6);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.input-error {
  border-color: #ef4444 !important;
}

/* Review Section */
.review-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--sap-gray-2);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.review-header h3 {
  font-size: 1.1rem;
  color: var(--sap-gray-8);
  margin: 0;
}

.edit-btn {
  background: none;
  border: 1px solid var(--sap-blue-6);
  color: var(--sap-blue-6);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: var(--sap-blue-6);
  color: white;
}

.address-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.address-summary-card {
  background: var(--sap-gray-1);
  padding: 1rem;
  border-radius: 8px;
}

.address-summary-card h4 {
  font-size: 0.875rem;
  color: var(--sap-gray-6);
  margin-bottom: 0.5rem;
}

.address-summary-card p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.same-address {
  color: var(--sap-gray-5);
  font-style: italic;
}

.vat-id {
  color: var(--sap-blue-6);
  font-weight: 500;
}

/* Items Review */
.items-review {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.review-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.review-item h4 {
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.item-category,
.item-id {
  font-size: 0.8rem;
  color: var(--sap-gray-5);
  margin: 0;
}

.item-quantity {
  font-weight: 500;
  color: var(--sap-gray-6);
}

.pricing-with-discount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.original-price {
  text-decoration: line-through;
  color: var(--sap-gray-5);
  font-size: 0.875rem;
}

.discount-badge {
  background: var(--sap-green-6);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.final-price {
  font-weight: 600;
  color: var(--sap-blue-7);
}

.simple-price {
  font-weight: 600;
}

/* Partnership Section */
.partnership-section {
  border: none;
  padding: 0;
}

.partnership-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid var(--sap-blue-2);
  border-radius: 8px;
}

.tier-icon {
  font-size: 2rem;
}

.partnership-info strong {
  color: var(--sap-blue-7);
}

.partnership-info p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

/* Payment Terms */
.payment-terms-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.terms-icon {
  font-size: 2rem;
}

.terms-content h4 {
  margin: 0 0 0.5rem;
  color: var(--sap-gray-8);
}

.terms-content p {
  margin: 0 0 0.75rem;
  color: var(--sap-gray-6);
  font-size: 0.9rem;
}

.terms-details {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: var(--sap-gray-6);
}

.terms-details li {
  margin: 0.25rem 0;
}

/* Terms Section */
.terms-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-option input {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
}

.checkbox-option a {
  color: var(--sap-blue-6);
}

/* Step Actions */
.step-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--sap-gray-2);
}

.place-order-btn {
  min-width: 180px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Confirmation */
.confirmation-card {
  text-align: center;
}

.confirmation-header {
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--sap-gray-2);
  margin-bottom: 1.5rem;
}

.confirmation-header .success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.confirmation-header h2 {
  color: var(--sap-green-7);
  margin-bottom: 0.5rem;
}

.order-id {
  font-size: 1.1rem;
  color: var(--sap-gray-6);
}

.confirmation-content {
  text-align: left;
}

.confirmation-section {
  margin-bottom: 1.5rem;
}

.confirmation-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--sap-gray-8);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.summary-item .label {
  font-size: 0.8rem;
  color: var(--sap-gray-5);
}

.summary-item .value {
  font-weight: 600;
  color: var(--sap-gray-8);
}

.summary-item .value.total {
  font-size: 1.25rem;
  color: var(--sap-blue-7);
}

.next-steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.next-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.next-step .step-icon {
  font-size: 1.5rem;
}

.next-step strong {
  display: block;
  margin-bottom: 0.25rem;
}

.next-step p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

.savings-banner {
  padding: 1rem;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-radius: 8px;
  text-align: center;
  margin-top: 1.5rem;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--sap-gray-2);
}

/* Sidebar */
.checkout-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
}

.sidebar-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.sidebar-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--sap-gray-2);
}

.sidebar-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.sidebar-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.5rem;
  font-size: 0.875rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--sap-gray-2);
}

.sidebar-item .item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-item .item-qty {
  color: var(--sap-gray-5);
}

.sidebar-item .item-price {
  font-weight: 500;
}

.sidebar-totals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 2px solid var(--sap-gray-2);
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.total-row.discount {
  color: var(--sap-green-6);
}

.total-row.voucher-discount {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 0;
}

.total-row.voucher-discount .discount-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-row.voucher-discount .remove-discount-btn {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
}

.total-row.voucher-discount .remove-discount-btn:hover {
  background: #fee2e2;
}

.total-row.grand-total {
  font-size: 1.1rem;
  font-weight: 700;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 2px solid var(--sap-gray-3);
  color: var(--sap-blue-7);
}

.savings-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--sap-green-8);
}

.payment-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--sap-gray-2);
}

.payment-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.help-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid var(--sap-blue-2);
}

.help-card h4 {
  margin-bottom: 0.5rem;
  color: var(--sap-blue-7);
}

.help-card p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .checkout-sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .checkout-progress {
    flex-direction: column;
    gap: 0.5rem;
  }

  .address-summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .review-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .step-actions {
    flex-direction: column;
  }

  .confirmation-actions {
    flex-direction: column;
  }
}

/* Voucher Applied Card */
.voucher-applied-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #22c55e;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voucher-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.voucher-name {
  font-weight: 600;
  color: #15803d;
  font-size: 1rem;
}

.voucher-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #166534;
}

.remove-voucher-btn {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-voucher-btn:hover {
  background: #fecaca;
  border-color: #f87171;
}

.total-row.discount {
  color: #059669;
}

.total-row.vat-info {
  font-size: 0.85rem;
  color: var(--sap-gray-5);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--sap-gray-3);
}

/* CREW Points Banner (Review Step) */
.crew-points-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  border: 1px solid #f59e0b;
}

.crew-points-left {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.crew-points-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #92400e;
}

.crew-points-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #92400e;
}

.crew-tier-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
  background: rgba(255, 255, 255, 0.6);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
}

/* CREW Points Preview (Sidebar) */
.crew-points-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  border: 1px solid #f59e0b;
}

.crew-preview-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.crew-preview-icon {
  font-size: 1.1rem;
}

.crew-preview-tier {
  font-size: 0.8rem;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.crew-preview-points {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.crew-preview-amount {
  font-size: 1.4rem;
  font-weight: 800;
  color: #92400e;
}

.crew-preview-label {
  font-size: 0.85rem;
  color: #92400e;
  font-weight: 500;
}

/* CREW Points Hero Card (Order Placed) */
.crew-points-hero {
  text-align: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 16px;
  border: 2px solid #f59e0b;
  margin-bottom: 1.5rem;
}

.hero-points-number {
  font-size: 3rem;
  font-weight: 900;
  color: #92400e;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.hero-points-text {
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.75rem;
}

.hero-tier-badge {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #92400e;
  background: rgba(255, 255, 255, 0.6);
  padding: 0.35rem 1rem;
  border-radius: 20px;
}
</style>