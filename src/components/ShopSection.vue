<template>
  <section class="shop-main-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Shop</h1>
        <p>Premium Bikes & Accessories</p>

        <!-- Emarsys Web Channel: Loyalty Banner -->
        <div id="emarsys_webchannel_loyalty" class="login-notice">
          <!-- TODO: Remove placeholder after Emarsys zone setup -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px dashed #f59e0b; border-radius: 12px; padding: 2rem; text-align: center; color: #92400e;">
            Emarsys Web Channel Zone: <strong>emarsys_webchannel_loyalty</strong>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="products-section">
        <div style="text-align: center; padding: 4rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
          <h3>Loading products...</h3>
          <p>Please wait a moment.</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="products-section">
        <div style="text-align: center; padding: 4rem; background: #fee; border: 1px solid #fcc; border-radius: 8px;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h3>Error Loading</h3>
          <p>{{ loadError }}</p>
          <button @click="loadProducts" class="sap-btn sap-btn-primary" style="margin-top: 1rem;">
            🔄 Try Again
          </button>
        </div>
      </div>

      <!-- Main Shop Content -->
      <div v-else>
        <!-- Filters and Search -->
        <div class="shop-filters-section">
          <div class="filters-container">
            <div class="filter-group">
              <label class="filter-label">Category</label>
              <select v-model="selectedCategory" class="sap-input">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Product Type</label>
              <select v-model="selectedType" class="sap-input">
                <option value="">All Types</option>
                <option v-for="type in productTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <div class="filter-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="inStockOnly" class="filter-checkbox">
                  <span class="checkmark"></span>
                  In Stock Only
                </label>
              </div>
            </div>

            <div class="filter-group">
              <button @click="resetFilters" class="sap-btn sap-btn-secondary">
                Reset Filters
              </button>
            </div>
          </div>

          <div class="search-section">
            <div class="search-input-group">
              <input
                v-model="searchQuery"
                type="text"
                class="sap-input search-input"
                placeholder="Search products..."
                @keyup.enter="handleSearchSubmit"
              >
              <button class="search-btn" @click="handleSearchSubmit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Emarsys Personalized Recommendations -->
        <div class="emarsys-shop-reco-section">
          <EmarsysRecommendations
            logic="PERSONAL"
            title="Recommended for you"
            @product-click="handleRecoProductClick"
          />
        </div>

        <!-- Emarsys Related Products (only for Road & Apparel) -->
        <div v-if="showRelatedRecos" class="emarsys-shop-reco-section">
          <EmarsysRecommendations
            :key="selectedCategory"
            logic="RELATED"
            title="Related Products"
            @product-click="handleRecoProductClick"
          />
        </div>

        <!-- Products Grid -->
        <div class="products-section">
          <div class="products-header">
            <h3>{{ filteredProducts.length }} Products</h3>
            <div class="sort-options">
              <label>Sort by:</label>
              <select v-model="sortBy" class="sap-input">
                <option value="name">Name</option>
                <option value="price-asc">Price (low → high)</option>
                <option value="price-desc">Price (high → low)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          <div class="sap-grid sap-grid-cols-3 products-grid">
            <div v-for="product in sortedProducts" :key="product.id"
                 class="product-card sap-card hover-lift"
                 @click="handleProductClick(product)">
              <div class="card-content">
                <!-- Product Image -->
                <div class="product-image" :class="getCategoryClass(product.category)">
                  <img :src="product.imageUrl || '/images/sap_logo.png'"
                      :alt="product.productName"
                      class="product-photo">
                  <span class="product-type-badge" :class="'badge-' + (product.productType || 'default').toLowerCase()">
                    {{ product.productType }}
                  </span>
                  <!-- Subcategory Badge -->
                  <span v-if="product.subcategory" class="subcategory-badge">
                    {{ product.subcategory }}
                  </span>
                </div>

                <div class="product-info">
                  <span class="product-brand">{{ product.brand }}</span>
                  <h4 class="product-name">{{ product.productName }}</h4>
                  <p class="product-description">{{ product.productDescription }}</p>

                  <div class="product-meta">
                    <span class="product-category">{{ product.category }}</span>
                    <span v-if="product.colors" class="product-colors">
                      {{ product.colors.split(',').length }} Colors
                    </span>
                  </div>

                  <div class="product-footer">
                    <!-- B2C Pricing Section -->
                    <div class="product-pricing">
                      <div class="pricing-display">
                        <!-- Main Price -->
                        <div class="main-price">
                          <span class="price-amount">{{ product.price.toLocaleString() }} {{ product.currency }}</span>
                        </div>

                        <!-- Points Info -->
                        <div v-if="isLoggedIn" class="points-info">
                          <small>+{{ calculatePoints(product.price) }} Points</small>
                        </div>
                      </div>
                    </div>

                    <div class="product-actions">
                      <span v-if="product.inStock" class="stock-status in-stock">
                        ✓ In Stock
                      </span>
                      <span v-else class="stock-status out-of-stock">
                        ⚠️ Out of Stock
                      </span>

                      <!-- Add to Cart Button -->
                      <button
                        @click.stop="handleAddToCart(product)"
                        :disabled="!product.inStock"
                        class="sap-btn sap-btn-primary add-cart-btn">
                        🛒 Add To Basket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProducts.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No Products Found</h3>
            <p>Try different search terms or filters</p>
            <button @click="resetFilters" class="sap-btn sap-btn-primary">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue'
import trackingService from '../utils/tracking-service.js'
import emarsysTracker from '../utils/emarsys-tracking.js'
import { useConsumerLoyalty, loyaltyStorage } from '../composables/useConsumerLoyalty.js'
import { useConsumerTracking } from '../composables/useConsumerLoyaltyTracking.js'
import EmarsysRecommendations from './EmarsysRecommendations.vue'

export default {
  name: 'ConsumerShopSection',
  components: {
    EmarsysRecommendations
  },
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    }
  },
  emits: ['show-product', 'add-to-cart', 'login-required'],
  setup(props, { emit }) {
    // Consumer Loyalty Setup
    const {
      calculateTier,
      getActiveBenefits,
      getCategorizedBenefits,
      getNextTierInfo,
      getTierData,
      calculatePointsForPurchase,
      calculateDiscountedPrice: calcDiscount
    } = useConsumerLoyalty()

    const {
      trackProductClick,
      trackAddToCart
    } = useConsumerTracking()

    // Inject user from parent if available
    const user = inject('user', { UID: 'guest', isLoggedIn: false })

    // State Management
    const products = ref([])
    const isLoading = ref(true)
    const loadError = ref('')

    // Filter states
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedType = ref('')
    const inStockOnly = ref(false)
    const sortBy = ref('name')

    // Loyalty Metrics (computed)
    const loyaltyMetrics = computed(() => {
      const userId = user.UID || 'guest'
      const balance = loyaltyStorage.getPointsBalance(userId)

      const currentTier = calculateTier(balance.lifetimePoints)
      const tierData = getTierData(currentTier)
      const activeBenefits = getActiveBenefits(currentTier)
      const categorizedBenefits = getCategorizedBenefits(currentTier)
      const nextTierInfo = getNextTierInfo(balance.lifetimePoints)

      return {
        currentTier,
        lifetimePoints: balance.lifetimePoints,
        availablePoints: balance.availablePoints,
        discountRate: tierData.discountRate || 0,
        pointsMultiplier: tierData.pointsMultiplier || 1,
        activeBenefits,
        categorizedBenefits,
        nextTierInfo,
        tierProgress: nextTierInfo ? nextTierInfo.progress : 100
      }
    })

    // Calculate discounted price for a product
    const calculateDiscountedPrice = (listPrice) => {
      const discount = (listPrice * loyaltyMetrics.value.discountRate) / 100
      return Math.round(listPrice - discount)
    }

    // Calculate points for a purchase (0.5 points per EUR * tier multiplier)
    const calculatePoints = (price) => {
      return Math.floor(price * 0.5 * loyaltyMetrics.value.pointsMultiplier)
    }

    // Get category class for styling
    const getCategoryClass = (category) => {
      const categoryMap = {
        'Road': 'category-road',
        'MTB': 'category-mtb',
        'Gravel': 'category-gravel',
        'Urban': 'category-urban',
        'E-Bike': 'category-ebike',
        'Kids': 'category-kids',
        'Accessories': 'category-accessories',
        'Apparel': 'category-apparel',
        'Components': 'category-components'
      }
      return categoryMap[category] || 'category-default'
    }

    // Product click handler
    const handleProductClick = (product) => {
      trackProductClick(product, 'Shop Grid')
      console.log('👁️ Product view tracked:', product.productName)
      emit('show-product', product)
    }

    // Add to cart handler (no discounts - simple pricing)
    const handleAddToCart = (product) => {
      const pointsEarned = props.isLoggedIn ? calculatePoints(product.price) : 0

      trackAddToCart(product, 1)
      console.log('🛒 Add to cart tracked:', product.productName)

      emit('add-to-cart', {
        ...product,
        finalPrice: product.price,
        pointsEarned: pointsEarned,
        memberTier: loyaltyMetrics.value.currentTier
      })

      console.log(`🛒 Added ${product.productName} to cart | Points: +${pointsEarned}`)
    }

    // Load products from CSV
    const loadProducts = async () => {
      isLoading.value = true
      loadError.value = ''

      try {
        const response = await fetch('/productcatalog_consolidated.csv')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const csvContent = await response.text()
        const Papa = (await import('papaparse')).default

        const parsed = Papa.parse(csvContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimiter: ','
        })

        products.value = parsed.data
          .filter(product => product.id && product.productName)
          .map(product => ({
            ...product,
            price: Number(product.price) || 0,
            inStock: product.inStock === true || product.inStock === 'true' || product.inStock === 1
          }))

        if (products.value.length === 0) {
          throw new Error('No products found in CSV')
        }

        console.log(`✅ Loaded ${products.value.length} products`)

      } catch (error) {
        console.error('Error loading products:', error)
        loadError.value = `Error loading: ${error.message}`

        // Use fallback data
        products.value = [
          {
            id: 'CANYON-001',
            productName: 'Canyon Aeroad CFR',
            productDescription: 'The ultimate aero road bike',
            inStock: true,
            price: 8999,
            currency: 'EUR',
            category: 'Road',
            subcategory: 'Aero',
            brand: 'Canyon',
            productType: 'Bike',
            colors: 'Stealth,Red,White',
            sizes: 'XS,S,M,L,XL'
          }
        ]

        loadError.value = ''
      } finally {
        isLoading.value = false
      }
    }

    // Computed properties for filtering and sorting
    const categories = computed(() => {
      return [...new Set(products.value.map(p => p.category).filter(Boolean))].sort()
    })

    const productTypes = computed(() => {
      return [...new Set(products.value.map(p => p.productType).filter(Boolean))].sort()
    })

    const filteredProducts = computed(() => {
      let filtered = products.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(p =>
          p.productName?.toLowerCase().includes(query) ||
          p.productDescription?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
        )
      }

      if (selectedCategory.value) {
        filtered = filtered.filter(p => p.category === selectedCategory.value)
      }

      if (selectedType.value) {
        filtered = filtered.filter(p => p.productType === selectedType.value)
      }

      if (inStockOnly.value) {
        filtered = filtered.filter(p => p.inStock)
      }

      return filtered
    })

    // Track search on explicit user action (Enter key or button click)
    const handleSearchSubmit = () => {
      const query = searchQuery.value
      if (query && query.length >= 2) {
        trackingService.trackSearch(query, filteredProducts.value.length)
        console.log('🔍 Search tracked:', query, '| Results:', filteredProducts.value.length)
      }
    }

    const sortedProducts = computed(() => {
      const sorted = [...filteredProducts.value]

      switch (sortBy.value) {
        case 'name':
          return sorted.sort((a, b) => a.productName.localeCompare(b.productName))
        case 'price-asc':
          return sorted.sort((a, b) => a.price - b.price)
        case 'price-desc':
          return sorted.sort((a, b) => b.price - a.price)
        case 'category':
          return sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
        default:
          return sorted
      }
    })

    const resetFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      selectedType.value = ''
      inStockOnly.value = false
      sortBy.value = 'name'
    }

    // Show related recommendations only for Road & Apparel categories
    const showRelatedRecos = computed(() => {
      return selectedCategory.value === 'Road' || selectedCategory.value === 'Apparel'
    })

    const handleRecoProductClick = (product) => {
      emit('show-product', product)
    }

    // EMARSYS: Track category changes
    watch(selectedCategory, (newCategory) => {
      if (newCategory) {
        emarsysTracker.trackCategory(newCategory)
      }
    })

    // EMARSYS: Track search terms (debounced via handleSearchSubmit)
    watch(searchQuery, (newQuery) => {
      if (newQuery && newQuery.length >= 3) {
        emarsysTracker.trackSearchTerm(newQuery)
      }
    })

    // Initialize component
    onMounted(() => {
      loadProducts()
    })

    return {
      products,
      loyaltyMetrics,
      searchQuery,
      selectedCategory,
      selectedType,
      inStockOnly,
      sortBy,
      isLoading,
      loadError,
      categories,
      productTypes,
      filteredProducts,
      sortedProducts,
      resetFilters,
      loadProducts,
      calculateDiscountedPrice,
      calculatePoints,
      getCategoryClass,
      handleProductClick,
      handleAddToCart,
      handleSearchSubmit,
      showRelatedRecos,
      handleRecoProductClick
    }
  }
}
</script>

<style scoped>
/* B2C Pricing Display */
.pricing-display {
  margin-bottom: 1rem;
}

.main-price {
  margin-bottom: 0.25rem;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sap-blue-7);
}

.member-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.original-price {
  text-decoration: line-through;
  color: var(--sap-gray-5);
  font-size: 0.875rem;
}

.discounted-price {
  color: #dc2626;
  font-size: 1.1rem;
  font-weight: 700;
}

.discount-badge {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.points-info {
  color: #f59e0b;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Shop Main Section */
.shop-main-section {
  padding: 2rem 0;
  background: var(--sap-gray-1);
  min-height: 100vh;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--sap-blue-7);
  margin-bottom: 0.5rem;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--sap-gray-6);
}

/* Emarsys Web Channel: Loyalty Banner */
.login-notice {
  margin-top: 1.5rem;
}

.login-notice:empty {
  display: none;
}

.login-notice:not(:empty) {
  min-height: 270px;
  border-radius: 12px;
  overflow: hidden;
}

/* Filters Section */
.shop-filters-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: var(--sap-shadow-sm);
}

.filters-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sap-gray-7);
}

.filter-checkboxes {
  display: flex;
  align-items: center;
  height: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--sap-gray-7);
}

.search-section {
  flex-shrink: 0;
}

.search-input-group {
  display: flex;
  align-items: center;
}

.search-input {
  width: 250px;
  border-radius: 8px 0 0 8px;
}

.search-btn {
  padding: 0.75rem 1rem;
  background: var(--sap-blue-6);
  border: none;
  border-radius: 0 8px 8px 0;
  color: white;
  cursor: pointer;
}

.search-btn:hover {
  background: var(--sap-blue-7);
}

/* Products Section */
.products-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--sap-shadow-sm);
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--sap-gray-2);
}

.products-header h3 {
  font-size: 1.25rem;
  color: var(--sap-blue-7);
  margin: 0;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-options label {
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

.products-grid {
  gap: 1.5rem;
}

/* Product Card */
.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--sap-gray-2);
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sap-shadow-lg);
  border-color: var(--sap-blue-6);
}

.card-content {
  padding: 0;
}

/* Category-based gradient backgrounds */
.product-image {
  position: relative;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.category-road { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.category-mtb { background: linear-gradient(135deg, #22c55e, #15803d); }
.category-gravel { background: linear-gradient(135deg, #a16207, #78350f); }
.category-urban { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.category-ebike { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.category-kids { background: linear-gradient(135deg, #f472b6, #db2777); }
.category-accessories { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.category-apparel { background: linear-gradient(135deg, #f59e0b, #d97706); }
.category-components { background: linear-gradient(135deg, #64748b, #475569); }
.category-default { background: linear-gradient(135deg, var(--sap-blue-6), var(--sap-blue-8)); }

.product-photo {
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  padding: 0.5rem;
}

.product-type-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.3);
}

.subcategory-badge {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  color: white;
  background: rgba(0, 0, 0, 0.4);
}

.badge-bike { background: rgba(59, 130, 246, 0.8); }
.badge-accessory { background: rgba(139, 92, 246, 0.8); }
.badge-apparel { background: rgba(245, 158, 11, 0.8); }
.badge-component { background: rgba(100, 116, 139, 0.8); }

.product-info {
  padding: 1.5rem;
}

.product-brand {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--sap-gray-5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sap-blue-10);
  margin: 0.25rem 0 0.5rem 0;
  line-height: 1.3;
}

.product-description {
  font-size: 0.875rem;
  color: var(--sap-gray-6);
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.product-category,
.product-colors {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--sap-gray-1);
  border-radius: 4px;
  color: var(--sap-gray-6);
}

.product-footer {
  border-top: 1px solid var(--sap-gray-2);
  padding-top: 1rem;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.stock-status {
  font-size: 0.8rem;
  font-weight: 500;
}

.in-stock { color: var(--sap-green-7); }
.out-of-stock { color: var(--sap-orange-6); }

.add-cart-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--sap-gray-7);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--sap-gray-5);
  margin-bottom: 1.5rem;
}

/* Emarsys Shop Recommendations */
.emarsys-shop-reco-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--sap-shadow-sm);
}

/* Responsive */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .shop-filters-section {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .filters-container {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }
}
</style>
