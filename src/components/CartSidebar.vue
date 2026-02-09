<template>
  <Teleport to="body">
    <div v-if="isOpen" class="cart-overlay" @click="$emit('close')">
      <div class="cart-sidebar" @click.stop>
        <div class="cart-header">
          <h3>Shopping Cart ({{ cartItems.length }})</h3>
          <button @click="$emit('close')" class="cart-close">✕</button>
        </div>
        
        <div class="cart-body">
          <div v-if="cartItems.length === 0" class="cart-empty">
            <div class="empty-cart-icon">🛒</div>
            <p>Your cart is empty</p>
            <small>Add some products to get started</small>
          </div>
          
          <div v-else class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="item-info">
                <h4 class="item-name">{{ item.productName }}</h4>
                
                <!-- Pricing Display -->
                <div class="item-pricing">
                  <span class="item-price">{{ item.price.toLocaleString() }} {{ item.currency }}</span>
                </div>

                <small class="item-category">{{ item.category }}</small>
              </div>
              
              <div class="item-controls">
                <div class="quantity-controls">
                  <button @click="$emit('update-quantity', item.id, item.quantity - 1)" 
                          :disabled="item.quantity <= 1" class="qty-btn">−</button>
                  <span class="qty-display">{{ item.quantity }}</span>
                  <button @click="$emit('update-quantity', item.id, item.quantity + 1)" class="qty-btn">+</button>
                </div>
                
                <button @click="$emit('remove-item', item.id)" class="remove-btn" title="Remove item">
                  🗑️
                </button>
              </div>
              
              <div class="item-total">
                <strong>{{ (item.price * item.quantity).toLocaleString() }} {{ item.currency }}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="cartItems.length > 0" class="cart-footer">
          <div class="cart-summary">
            <!-- Subtotal -->
            <div class="summary-row subtotal-row">
              <span>Subtotal:</span>
              <span>{{ cartSubtotal.toLocaleString() }} EUR</span>
            </div>

            <!-- Discount (if applied) -->
            <div v-if="hasDiscount" class="summary-row discount-row">
              <div class="discount-info">
                <span class="discount-label">🎁 {{ cartDiscount.description }}</span>
                <button @click="$emit('remove-discount')" class="remove-discount-btn" title="Remove discount">✕</button>
              </div>
              <span class="discount-amount">-{{ discountAmount.toLocaleString() }} EUR</span>
            </div>

            <!-- Total -->
            <div class="cart-total">
              <div class="total-label">Total:</div>
              <div class="total-amount">{{ cartTotal.toLocaleString() }} EUR</div>
            </div>

            <div class="summary-row vat-info">
              <span>incl. VAT (19%)</span>
              <span>{{ cartTax.toLocaleString() }} EUR</span>
            </div>
          </div>
          
          <div class="cart-actions">
            <button @click="handleCheckout" class="sap-btn sap-btn-primary checkout-btn">
              💳 Proceed to Checkout
            </button>
            <button @click="$emit('close')" class="sap-btn sap-btn-secondary continue-btn">
              ← Continue Shopping
            </button>
            
            <!-- Test Order Button (Development) -->
            <button v-if="showTestButton" @click="simulateOrder" class="sap-btn sap-btn-success test-btn">
              🧪 Simulate Order (Test)
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed, inject } from 'vue'
import { useConsumerTracking } from '@/composables/useConsumerLoyaltyTracking'

export default {
  name: 'EnhancedCartSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    cartItems: {
      type: Array,
      default: () => []
    },
    cartDiscount: {
      type: Object,
      default: () => ({ type: 'none', value: 0, description: '' })
    },
    showTestButton: {
      type: Boolean,
      default: process.env.NODE_ENV === 'development'
    }
  },
  emits: ['close', 'update-quantity', 'remove-item', 'checkout', 'order-placed', 'remove-discount'],
  setup(props, { emit }) {
    const { trackPurchase } = useConsumerTracking()
    const user = inject('user', null)

    // Inject cart discount directly from App.vue (same reactive object)
    const cartDiscount = inject('cartDiscount', { type: 'none', value: 0, description: '' })

    // Calculate subtotal (prices are GROSS = already including 19% VAT)
    const cartSubtotal = computed(() => {
      return props.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    })

    // Check if discount is applied (using injected cartDiscount, not prop)
    const hasDiscount = computed(() => {
      return cartDiscount && cartDiscount.type !== 'none' && cartDiscount.value > 0
    })

    // Calculate discount amount
    const discountAmount = computed(() => {
      if (!hasDiscount.value) return 0

      if (cartDiscount.type === 'percentage') {
        return Math.round(cartSubtotal.value * (cartDiscount.value / 100) * 100) / 100
      }

      if (cartDiscount.type === 'fixed') {
        // Fixed discount cannot exceed subtotal
        return Math.min(cartDiscount.value, cartSubtotal.value)
      }

      if (cartDiscount.type === 'shipping') {
        // Free shipping savings (assume standard shipping cost)
        return 4.95
      }

      return 0
    })

    // Total = Subtotal - Discount (prices already include VAT)
    const cartTotal = computed(() => {
      return Math.max(0, cartSubtotal.value - discountAmount.value)
    })

    // VAT is INCLUDED in the price: VAT = Total * 19 / 119
    const cartTax = computed(() => {
      return Math.round(cartTotal.value * 19 / 119 * 100) / 100
    })
    
    const handleCheckout = () => {
      emit('checkout')
    }
    
    // Simulate order for testing
    const simulateOrder = async () => {
      // Check if user is logged in (user is a reactive object, not a ref)
      if (!user || !user.isLoggedIn) {
        alert('Please login to place an order')
        return
      }

      const orderId = `ORD-${Date.now()}`
      const orderData = {
        id: orderId,
        timestamp: new Date().toISOString(),
        currency: 'EUR',
        items: props.cartItems.map(item => ({
          id: item.id,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: cartSubtotal.value,
        tax: cartTax.value,
        total: cartTotal.value
      }

      console.log('📦 Preparing order for user:', user.email)

      try {
        // Track order for Consumer Loyalty
        trackPurchase(orderData)
        console.log('✅ Order tracked')

        // Emit order placed event
        emit('order-placed', orderData)

        // Show success message
        alert(`Order ${orderId} placed successfully! Total: ${cartTotal.value.toLocaleString()}€`)

        // Close cart
        emit('close')
      } catch (error) {
        console.error('❌ Error placing order:', error)
        alert(`Order ${orderId} placed successfully!`)
        emit('close')
      }
    }
    
    return {
      cartSubtotal,
      cartTax,
      cartTotal,
      hasDiscount,
      discountAmount,
      cartDiscount,
      handleCheckout,
      simulateOrder
    }
  }
}
</script>

<style scoped>
.item-pricing {
  margin: 0.5rem 0;
}

.pricing-breakdown .list-price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.original-price {
  text-decoration: line-through;
  color: var(--sap-gray-5);
  font-size: 0.875rem;
}

.discount-label {
  background: var(--sap-green-6);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.final-price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.final-price {
  font-weight: 600;
  color: var(--sap-blue-7);
  font-size: 1rem;
}

.savings {
  color: var(--sap-green-6);
  font-size: 0.75rem;
  font-weight: 500;
}

.simple-pricing .item-price {
  font-weight: 600;
  color: var(--sap-gray-7);
}

.partnership-tier {
  color: var(--sap-blue-6);
  font-weight: 500;
  font-size: 0.75rem;
}

.partnership-summary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid var(--sap-blue-2);
  border-radius: var(--sap-border-radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.partnership-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--sap-blue-7);
  margin-bottom: 0.5rem;
}

.benefits-applied {
  display: grid;
  gap: 0.25rem;
}

.benefit-item {
  font-size: 0.875rem;
  color: var(--sap-gray-7);
}

.discount-row {
  color: var(--sap-green-6);
  font-weight: 600;
}

.discount-amount {
  color: var(--sap-green-6);
}

.total-savings {
  text-align: center;
  margin-top: 0.5rem;
  color: var(--sap-green-6);
  font-weight: 500;
}

.item-savings {
  margin-top: 0.25rem;
}

.item-savings small {
  color: var(--sap-green-6);
  font-weight: 500;
}

.test-btn {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.cart-summary {
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--sap-gray-7);
}

.subtotal-row {
  padding-bottom: 0.5rem;
}

.discount-row {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.discount-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.discount-label {
  color: #15803d;
  font-weight: 600;
  font-size: 0.8rem;
}

.remove-discount-btn {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
}

.remove-discount-btn:hover {
  background: #fee2e2;
}

.discount-row .discount-amount {
  color: #15803d;
  font-weight: 700;
  font-size: 0.9rem;
}

.item-category {
  color: var(--sap-gray-5);
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}

.continue-btn {
  margin-top: 0.5rem;
}

.summary-row.vat-info {
  font-size: 0.8rem;
  color: var(--sap-gray-5);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--sap-gray-3);
}
</style>