<template>
  <div class="order-history-page">
    <div class="sap-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>My Orders</h1>
          <p>View and manage your order history</p>
        </div>
        <div class="header-actions">
          <button @click="$emit('navigate', 'shop')" class="sap-btn sap-btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>

      <!-- Stats Overview (B2C) -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <span class="stat-value">{{ orderStats.totalOrders }}</span>
            <span class="stat-label">Orders</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <span class="stat-value">{{ orderStats.totalPoints.toLocaleString() }}</span>
            <span class="stat-label">Points Earned</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <span class="stat-value">{{ orderStats.totalSpend.toLocaleString() }} €</span>
            <span class="stat-label">Total Spent</span>
          </div>
        </div>
        <div class="stat-card partnership-stat">
          <div class="stat-icon">{{ getTierIcon(loyaltyTier) }}</div>
          <div class="stat-content">
            <span class="stat-value tier-value">{{ getTierLabel(loyaltyTier) }}</span>
            <span class="stat-label">Membership Status</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="filters-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search orders..."
            class="search-input"
          >
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">✕</button>
        </div>

        <div class="filter-controls">
          <select v-model="filterPeriod" class="filter-select">
            <option value="all">All</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="orders-section">
        <!-- Empty State -->
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Orders Found</h3>
          <p v-if="searchQuery || filterPeriod !== 'all'">
            Try adjusting your search or filters
          </p>
          <p v-else>
            You haven't placed any orders yet. Browse our shop!
          </p>
          <button @click="$emit('navigate', 'shop')" class="sap-btn sap-btn-primary">
            Go to Shop
          </button>
        </div>

        <!-- Orders List -->
        <div v-else class="orders-list">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id" 
            class="order-card"
            :class="{ 'expanded': expandedOrder === order.id }"
          >
            <!-- Order Header -->
            <div class="order-header" @click="toggleOrder(order.id)">
              <div class="order-main-info">
                <div class="order-id-section">
                  <span class="order-id">{{ order.id }}</span>
                  <span class="order-status" :class="getStatusClass(order)">
                    {{ getOrderStatus(order) }}
                  </span>
                </div>
                <div class="order-meta">
                  <span class="order-date">{{ formatDate(order.timestamp) }}</span>
                  <span class="order-items-count">{{ order.items?.length || 0 }} items</span>
                </div>
              </div>
              
              <div class="order-pricing-summary">
                <div v-if="order.discountTotal > 0" class="discount-badge">
                  -{{ order.discountTotal.toLocaleString() }} € saved
                </div>
                <div class="order-total">{{ order.total?.toLocaleString() }} €</div>
                <div class="payment-terms-badge">
                  Net {{ order.paymentTerms || 30 }} days
                </div>
              </div>
              
              <div class="order-expand-icon">
                <span :class="{ 'rotated': expandedOrder === order.id }">▼</span>
              </div>
            </div>

            <!-- Order Details (Expanded) -->
            <div v-if="expandedOrder === order.id" class="order-details">
              <!-- Items -->
              <div class="details-section">
                <h4>Order Items</h4>
                <div class="items-table">
                  <div class="table-header">
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Unit Price</span>
                    <span>Total</span>
                  </div>
                  <div 
                    v-for="item in order.items" 
                    :key="item.id" 
                    class="table-row"
                  >
                    <div class="product-cell">
                      <span class="product-name">{{ item.productName }}</span>
                      <span class="product-category">{{ item.category }}</span>
                    </div>
                    <span class="quantity-cell">{{ item.quantity }}</span>
                    <div class="price-cell">
                      <span v-if="item.finalPrice && item.finalPrice < item.price" class="discounted-price">
                        <span class="original">{{ item.price.toLocaleString() }} €</span>
                        <span class="final">{{ item.finalPrice.toLocaleString() }} €</span>
                      </span>
                      <span v-else>{{ item.price?.toLocaleString() }} €</span>
                    </div>
                    <span class="total-cell">
                      {{ ((item.finalPrice || item.price) * item.quantity).toLocaleString() }} €
                    </span>
                  </div>
                </div>
              </div>

              <!-- Pricing Summary -->
              <div class="details-section pricing-section">
                <h4>Pricing Summary</h4>
                <div class="pricing-grid">
                  <div class="pricing-row">
                    <span>Subtotal (List Price)</span>
                    <span>{{ ((order.subtotal || 0) + (order.discountTotal || 0)).toLocaleString() }} €</span>
                  </div>
                  <div v-if="order.discountTotal > 0" class="pricing-row discount-row">
                    <span>Partnership Discount ({{ order.tier }})</span>
                    <span>-{{ order.discountTotal.toLocaleString() }} €</span>
                  </div>
                  <div class="pricing-row">
                    <span>Net Amount</span>
                    <span>{{ (order.subtotal || 0).toLocaleString() }} €</span>
                  </div>
                  <div class="pricing-row">
                    <span>VAT (19%)</span>
                    <span>{{ (order.tax || 0).toLocaleString() }} €</span>
                  </div>
                  <div class="pricing-row total-row">
                    <span>Total</span>
                    <span>{{ (order.total || 0).toLocaleString() }} €</span>
                  </div>
                </div>
              </div>

              <!-- Addresses -->
              <div v-if="order.billingAddress" class="details-section addresses-section">
                <h4>Addresses</h4>
                <div class="addresses-grid">
                  <div class="address-card">
                    <h5>Billing Address</h5>
                    <p><strong>{{ order.billingAddress.company }}</strong></p>
                    <p>{{ order.billingAddress.contactName }}</p>
                    <p>{{ order.billingAddress.street }}</p>
                    <p>{{ order.billingAddress.postalCode }} {{ order.billingAddress.city }}</p>
                    <p v-if="order.billingAddress.vatId" class="vat-info">VAT: {{ order.billingAddress.vatId }}</p>
                  </div>
                  <div class="address-card">
                    <h5>Delivery Address</h5>
                    <template v-if="order.deliveryAddress">
                      <p><strong>{{ order.deliveryAddress.company }}</strong></p>
                      <p>{{ order.deliveryAddress.contactName }}</p>
                      <p>{{ order.deliveryAddress.street }}</p>
                      <p>{{ order.deliveryAddress.postalCode }} {{ order.deliveryAddress.city }}</p>
                    </template>
                    <p v-else class="same-address">Same as billing address</p>
                  </div>
                </div>
              </div>

              <!-- Order Notes -->
              <div v-if="order.notes" class="details-section">
                <h4>Order Notes</h4>
                <p class="order-notes">{{ order.notes }}</p>
              </div>

              <!-- Actions -->
              <div class="order-actions">
                <button @click="reorderItems(order)" class="sap-btn sap-btn-primary">
                  Reorder
                </button>
                <button @click="downloadInvoice(order)" class="sap-btn sap-btn-secondary">
                  Download Invoice
                </button>
                <button @click="printOrder(order)" class="sap-btn sap-btn-secondary">
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            Previous
          </button>
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = page"
              class="page-number"
              :class="{ active: currentPage === page }"
            >
              {{ page }}
            </button>
          </div>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Loyalty Progress Card (B2C) -->
      <div v-if="nextTierInfo" class="partnership-progress-card">
        <div class="progress-header">
          <h3>Your Progress</h3>
          <span class="current-tier">
            {{ getTierIcon(loyaltyTier) }} {{ getTierLabel(loyaltyTier) }}
          </span>
        </div>
        <div class="progress-content">
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              :style="{ width: nextTierInfo.progress + '%' }"
            ></div>
          </div>
          <div class="progress-info">
            <span>{{ nextTierInfo.currentPoints?.toLocaleString() || 0 }} / {{ nextTierInfo.threshold?.toLocaleString() }} Points</span>
            <span class="remaining">{{ nextTierInfo.remaining?.toLocaleString() }} Points to {{ getTierLabel(nextTierInfo.name) }}</span>
          </div>
        </div>
        <div class="next-tier-benefits">
          <h4>Unlock with {{ getTierLabel(nextTierInfo.name) }}:</h4>
          <ul>
            <li v-for="benefit in nextTierInfo.newBenefits?.slice(0, 3)" :key="benefit">
              {{ benefit }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue'
import { useConsumerLoyalty, loyaltyStorage } from '@/composables/useConsumerLoyalty'

export default {
  name: 'OrderHistoryPage',
  emits: ['navigate', 'reorder'],
  setup(props, { emit }) {
    const user = inject('user', { UID: 'demo_user', isLoggedIn: false })
    const { calculateTier, getNextTierInfo, getTierData } = useConsumerLoyalty()

    // State
    const orders = ref([])
    const searchQuery = ref('')
    const filterPeriod = ref('all')
    const sortBy = ref('date-desc')
    const expandedOrder = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 10

    // Load orders
    onMounted(() => {
      loadOrders()
    })

    const loadOrders = () => {
      const userId = user.UID || 'demo_user'
      orders.value = loyaltyStorage.getOrderHistory(userId)
    }

    // Computed (B2C - points based)
    const orderStats = computed(() => {
      const totalOrders = orders.value.length
      const totalSpend = orders.value.reduce((sum, o) => sum + (o.total || 0), 0)
      const totalPoints = orders.value.reduce((sum, o) => sum + (o.pointsEarned || 0), 0)
      const averageOrder = totalOrders > 0 ? Math.round(totalSpend / totalOrders) : 0

      return {
        totalOrders,
        totalSpend: Math.round(totalSpend),
        totalPoints,
        averageOrder
      }
    })

    const loyaltyTier = computed(() => {
      const userId = user.UID || 'demo_user'
      const points = loyaltyStorage.getPoints(userId)
      return calculateTier(points)
    })

    const nextTierInfo = computed(() => {
      const userId = user.UID || 'demo_user'
      const points = loyaltyStorage.getPoints(userId)
      return getNextTierInfo(points)
    })

    const filteredOrders = computed(() => {
      let result = [...orders.value]

      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(order => 
          order.id?.toLowerCase().includes(query) ||
          order.items?.some(item => 
            item.productName?.toLowerCase().includes(query)
          )
        )
      }

      // Period filter
      if (filterPeriod.value !== 'all') {
        const days = parseInt(filterPeriod.value)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        result = result.filter(order => new Date(order.timestamp) >= cutoff)
      }

      // Sort
      result.sort((a, b) => {
        switch (sortBy.value) {
          case 'date-desc':
            return new Date(b.timestamp) - new Date(a.timestamp)
          case 'date-asc':
            return new Date(a.timestamp) - new Date(b.timestamp)
          case 'amount-desc':
            return (b.total || 0) - (a.total || 0)
          case 'amount-asc':
            return (a.total || 0) - (b.total || 0)
          default:
            return 0
        }
      })

      // Pagination
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return result.slice(start, end)
    })

    const totalPages = computed(() => {
      let count = orders.value.length
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        count = orders.value.filter(order => 
          order.id?.toLowerCase().includes(query) ||
          order.items?.some(item => item.productName?.toLowerCase().includes(query))
        ).length
      }
      
      if (filterPeriod.value !== 'all') {
        const days = parseInt(filterPeriod.value)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        count = orders.value.filter(order => new Date(order.timestamp) >= cutoff).length
      }

      return Math.ceil(count / itemsPerPage)
    })

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // Methods
    const toggleOrder = (orderId) => {
      expandedOrder.value = expandedOrder.value === orderId ? null : orderId
    }

    const getOrderStatus = (order) => {
      const orderDate = new Date(order.timestamp)
      const daysSinceOrder = Math.floor((Date.now() - orderDate) / (1000 * 60 * 60 * 24))
      
      if (daysSinceOrder < 1) return 'Processing'
      if (daysSinceOrder < 3) return 'Shipped'
      return 'Delivered'
    }

    const getStatusClass = (order) => {
      const status = getOrderStatus(order)
      return {
        'status-processing': status === 'Processing',
        'status-shipped': status === 'Shipped',
        'status-delivered': status === 'Delivered'
      }
    }

    const getTierIcon = (tier) => {
      const icons = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' }
      return icons[tier] || '🛒'
    }

    const getTierLabel = (tier) => {
      const labels = {
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        platinum: 'Platinum'
      }
      return labels[tier] || 'Customer'
    }

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const reorderItems = (order) => {
      if (order.items && order.items.length > 0) {
        emit('reorder', order.items)
        emit('navigate', 'shop')
      }
    }

    const downloadInvoice = (order) => {
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { text-align: right; }
            .invoice-title { font-size: 28px; color: #0d6efd; margin-bottom: 20px; }
            .order-info { margin-bottom: 30px; }
            .order-info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .totals { margin-top: 30px; text-align: right; }
            .totals .row { display: flex; justify-content: flex-end; gap: 50px; margin: 8px 0; }
            .totals .total { font-size: 18px; font-weight: bold; color: #0d6efd; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <p><strong>Invoice #:</strong> INV-${order.id}</p>
              <p><strong>Order #:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${formatDate(order.timestamp)}</p>
              <p><strong>Payment Terms:</strong> Net ${order.paymentTerms || 30} days</p>
            </div>
            <div class="company-info">
              <h3>CX Industrial Solutions</h3>
              <p>SAP Customer Experience</p>
              <p>Industriestrasse 123</p>
              <p>69115 Heidelberg, Germany</p>
              <p>VAT: DE123456789</p>
            </div>
          </div>
          
          ${order.billingAddress ? `
          <div class="order-info">
            <strong>Bill To:</strong><br>
            ${order.billingAddress.company}<br>
            ${order.billingAddress.contactName}<br>
            ${order.billingAddress.street}<br>
            ${order.billingAddress.postalCode} ${order.billingAddress.city}<br>
            ${order.billingAddress.vatId ? `VAT: ${order.billingAddress.vatId}` : ''}
          </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${(item.finalPrice || item.price)?.toLocaleString()} EUR</td>
                  <td>${((item.finalPrice || item.price) * item.quantity)?.toLocaleString()} EUR</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="row"><span>Subtotal:</span> <span>${order.subtotal?.toLocaleString()} EUR</span></div>
            ${order.discountTotal > 0 ? `<div class="row"><span>Discount:</span> <span>-${order.discountTotal?.toLocaleString()} EUR</span></div>` : ''}
            <div class="row"><span>VAT (19%):</span> <span>${order.tax?.toLocaleString()} EUR</span></div>
            <div class="row total"><span>Total:</span> <span>${order.total?.toLocaleString()} EUR</span></div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment is due within ${order.paymentTerms || 30} days of invoice date.</p>
            <p>Bank: Deutsche Bank | IBAN: DE89 3704 0044 0532 0130 00 | BIC: COBADEFFXXX</p>
          </div>
        </body>
        </html>
      `

      const blob = new Blob([invoiceHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${order.id}.html`
      a.click()
      URL.revokeObjectURL(url)
    }

    const printOrder = (order) => {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
        <head>
          <title>Order ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0d6efd; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <h1>Order Confirmation</h1>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${formatDate(order.timestamp)}</p>
          <p><strong>Payment Terms:</strong> Net ${order.paymentTerms || 30} days</p>
          
          <h3>Items</h3>
          <table>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            ${order.items?.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${(item.finalPrice || item.price)?.toLocaleString()} EUR</td>
                <td>${((item.finalPrice || item.price) * item.quantity)?.toLocaleString()} EUR</td>
              </tr>
            `).join('') || ''}
          </table>
          
          <p class="total">Total: ${order.total?.toLocaleString()} EUR</p>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }

    return {
      orders,
      searchQuery,
      filterPeriod,
      sortBy,
      expandedOrder,
      currentPage,
      orderStats,
      loyaltyTier,
      nextTierInfo,
      filteredOrders,
      totalPages,
      visiblePages,
      toggleOrder,
      getOrderStatus,
      getStatusClass,
      getTierIcon,
      getTierLabel,
      formatDate,
      reorderItems,
      downloadInvoice,
      printOrder
    }
  }
}
</script>

<style scoped>
.order-history-page {
  padding: 2rem 0 4rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  color: var(--sap-gray-8);
  margin: 0 0 0.25rem;
}

.header-content p {
  color: var(--sap-gray-6);
  margin: 0;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sap-gray-8);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--sap-gray-5);
}

.partnership-stat {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid var(--sap-blue-2);
}

.tier-value {
  font-size: 1.1rem;
  color: var(--sap-blue-7);
}

/* Filters */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid var(--sap-gray-3);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--sap-blue-6);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--sap-gray-5);
  cursor: pointer;
  padding: 0.25rem;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 1px solid var(--sap-gray-3);
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--sap-gray-8);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--sap-gray-6);
  margin-bottom: 1.5rem;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card.expanded {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  align-items: center;
  transition: background 0.2s;
}

.order-header:hover {
  background: var(--sap-gray-1);
}

.order-id-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.order-id {
  font-weight: 600;
  color: var(--sap-blue-7);
  font-size: 1.1rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-processing {
  background: #fef3c7;
  color: #d97706;
}

.status-shipped {
  background: #dbeafe;
  color: #2563eb;
}

.status-delivered {
  background: #dcfce7;
  color: #16a34a;
}

.order-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

.order-pricing-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.discount-badge {
  background: var(--sap-green-1);
  color: var(--sap-green-7);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.order-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sap-gray-8);
}

.payment-terms-badge {
  background: var(--sap-gray-1);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--sap-gray-6);
}

.order-expand-icon {
  color: var(--sap-gray-5);
  transition: transform 0.3s;
}

.order-expand-icon span.rotated {
  display: inline-block;
  transform: rotate(180deg);
}

/* Order Details */
.order-details {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid var(--sap-gray-2);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-section {
  margin-top: 1.5rem;
}

.details-section h4 {
  font-size: 1rem;
  color: var(--sap-gray-7);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--sap-gray-2);
}

/* Items Table */
.items-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--sap-gray-1);
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--sap-gray-2);
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 500;
  color: var(--sap-gray-8);
}

.product-category {
  font-size: 0.8rem;
  color: var(--sap-gray-5);
}

.discounted-price {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.discounted-price .original {
  text-decoration: line-through;
  color: var(--sap-gray-5);
  font-size: 0.8rem;
}

.discounted-price .final {
  color: var(--sap-green-7);
  font-weight: 500;
}

.total-cell {
  font-weight: 600;
}

/* Pricing Section */
.pricing-grid {
  max-width: 400px;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.discount-row {
  color: var(--sap-green-6);
}

.total-row {
  border-top: 2px solid var(--sap-gray-3);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--sap-blue-7);
}

/* Addresses */
.addresses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.address-card {
  background: var(--sap-gray-1);
  padding: 1rem;
  border-radius: 8px;
}

.address-card h5 {
  font-size: 0.8rem;
  color: var(--sap-gray-5);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.address-card p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.vat-info {
  color: var(--sap-blue-6);
  font-weight: 500;
  margin-top: 0.5rem !important;
}

.same-address {
  color: var(--sap-gray-5);
  font-style: italic;
}

.order-notes {
  background: var(--sap-gray-1);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--sap-gray-7);
}

/* Order Actions */
.order-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--sap-gray-2);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid var(--sap-gray-3);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--sap-blue-1);
  border-color: var(--sap-blue-3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid var(--sap-gray-3);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number.active {
  background: var(--sap-blue-6);
  color: white;
  border-color: var(--sap-blue-6);
}

.page-number:hover:not(.active) {
  background: var(--sap-gray-1);
}

/* Partnership Progress Card */
.partnership-progress-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  margin: 0;
  color: var(--sap-gray-8);
}

.current-tier {
  font-weight: 600;
  color: var(--sap-blue-7);
}

.progress-bar-container {
  height: 12px;
  background: var(--sap-gray-2);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--sap-blue-6), var(--sap-blue-4));
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

.remaining {
  color: var(--sap-blue-6);
  font-weight: 500;
}

.next-tier-benefits {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--sap-gray-2);
}

.next-tier-benefits h4 {
  font-size: 0.9rem;
  color: var(--sap-gray-7);
  margin-bottom: 0.75rem;
}

.next-tier-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
}

.next-tier-benefits li {
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-controls {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .order-header {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .order-pricing-summary {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
  }

  .addresses-grid {
    grid-template-columns: 1fr;
  }

  .order-actions {
    flex-direction: column;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>