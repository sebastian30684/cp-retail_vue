<template>
  <section class="deals-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Deals & Offers</h1>
        <p>Exclusive savings on premium products</p>
      </div>

      <!-- Featured Deal Banner -->
      <div class="featured-deal">
        <div class="deal-background" :style="{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }">
          <div class="deal-badge">Limited Time</div>
          <div class="deal-content">
            <span class="deal-label">Up to</span>
            <span class="deal-percentage">40% OFF</span>
            <span class="deal-title">Seasonal Sale</span>
            <p>Selected products across all categories</p>
            <button class="sap-btn sap-btn-primary" @click="$emit('navigate', 'shop')">
              Shop Now
            </button>
          </div>
          <div class="deal-timer">
            <span class="timer-label">Ends in:</span>
            <div class="timer-display">
              <div class="time-unit">
                <span class="time-value">{{ countdown.days }}</span>
                <span class="time-label">Days</span>
              </div>
              <div class="time-unit">
                <span class="time-value">{{ countdown.hours }}</span>
                <span class="time-label">Hours</span>
              </div>
              <div class="time-unit">
                <span class="time-value">{{ countdown.minutes }}</span>
                <span class="time-label">Min</span>
              </div>
              <div class="time-unit">
                <span class="time-value">{{ countdown.seconds }}</span>
                <span class="time-label">Sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Deal Categories -->
      <div class="deal-categories">
        <button
          v-for="cat in dealCategories"
          :key="cat.id"
          :class="['category-btn', { active: activeCategory === cat.id }]"
          @click="activeCategory = cat.id"
        >
          <img :src="cat.image" :alt="cat.name" class="cat-pictogram" />
          <span class="cat-name">{{ cat.name }}</span>
          <span v-if="cat.count" class="cat-count">{{ cat.count }}</span>
        </button>
      </div>

      <!-- Deals Grid -->
      <div class="deals-grid">
        <div v-for="deal in filteredDeals" :key="deal.id" class="deal-card">
          <div class="deal-image" :style="{ background: deal.gradient }">
            <img :src="deal.image" :alt="deal.name" class="deal-pictogram" />
            <span class="discount-badge">-{{ deal.discount }}%</span>
          </div>
          <div class="deal-info">
            <span class="deal-category">{{ deal.categoryLabel }}</span>
            <h3>{{ deal.name }}</h3>
            <div class="deal-pricing">
              <span class="original-price">{{ formatPrice(deal.originalPrice) }}</span>
              <span class="sale-price">{{ formatPrice(deal.salePrice) }}</span>
            </div>
            <div class="deal-savings">
              You save: {{ formatPrice(deal.originalPrice - deal.salePrice) }}
            </div>
            <button class="sap-btn sap-btn-primary" @click="$emit('navigate', 'shop')">
              Add to Cart
            </button>
          </div>
          <div v-if="deal.stock <= 5" class="low-stock">
            Only {{ deal.stock }} left!
          </div>
        </div>
      </div>

      <!-- Newsletter Signup -->
      <div class="newsletter-section">
        <div class="newsletter-content">
          <h2>Never Miss a Deal</h2>
          <p>Subscribe to our newsletter and be the first to know about exclusive offers</p>
          <div class="newsletter-form">
            <input type="email" placeholder="Enter your email" class="sap-input">
            <button class="sap-btn sap-btn-primary">Subscribe</button>
          </div>
          <span class="newsletter-note">No spam, unsubscribe anytime</span>
        </div>
      </div>

      <!-- Special Offers -->
      <div class="special-offers">
        <h2>Special Offers</h2>
        <div class="offers-grid">
          <div class="offer-card">
            <img src="/images/306336_Warehouse_R.png" alt="Free Shipping" class="offer-pictogram" />
            <h3>Free Shipping</h3>
            <p>On orders over 99 EUR</p>
          </div>
          <div class="offer-card">
            <img src="/images/301466_Wholesale_Package_R.png" alt="Returns" class="offer-pictogram" />
            <h3>30-Day Returns</h3>
            <p>Hassle-free returns</p>
          </div>
          <div class="offer-card">
            <img src="/images/301464_Customer_R.png" alt="Financing" class="offer-pictogram" />
            <h3>0% Financing</h3>
            <p>On selected items</p>
          </div>
          <div class="offer-card">
            <img src="/images/305959_Celebration_R.png" alt="Rewards" class="offer-pictogram" />
            <h3>Loyalty Rewards</h3>
            <p>Earn points on every purchase</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'DealsSection',
  emits: ['navigate'],
  setup() {
    const activeCategory = ref('all')
    const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    let countdownInterval = null

    const dealCategories = ref([
      { id: 'all', name: 'All Deals', image: '/images/299612_Shopping_R.png', count: 24 },
      { id: 'fashion', name: 'Fashion', image: '/images/301697_Consumer_Products_R.png', count: 8 },
      { id: 'home', name: 'Home', image: '/images/302220_Storefront-SmallBusiness_R.png', count: 5 },
      { id: 'electronics', name: 'Electronics', image: '/images/301553_User_Experience_R.png', count: 6 },
      { id: 'food', name: 'Food', image: '/images/301700_Grocery_R.png', count: 5 }
    ])

    const allDeals = ref([
      {
        id: 1,
        name: 'Premium Jacket Collection',
        category: 'fashion',
        categoryLabel: 'Fashion',
        image: '/images/301697_Consumer_Products_R.png',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        originalPrice: 249,
        salePrice: 174,
        discount: 30,
        stock: 3
      },
      {
        id: 2,
        name: 'Smart Home Bundle',
        category: 'home',
        categoryLabel: 'Home & Living',
        image: '/images/302220_Storefront-SmallBusiness_R.png',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        originalPrice: 329,
        salePrice: 263,
        discount: 20,
        stock: 7
      },
      {
        id: 3,
        name: 'Wireless Audio System',
        category: 'electronics',
        categoryLabel: 'Electronics',
        image: '/images/301553_User_Experience_R.png',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        originalPrice: 199,
        salePrice: 139,
        discount: 30,
        stock: 12
      },
      {
        id: 4,
        name: 'Gourmet Gift Box',
        category: 'food',
        categoryLabel: 'Food & Beverage',
        image: '/images/301700_Grocery_R.png',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        originalPrice: 89,
        salePrice: 62,
        discount: 30,
        stock: 25
      },
      {
        id: 5,
        name: 'Designer Footwear',
        category: 'fashion',
        categoryLabel: 'Fashion',
        image: '/images/301464_Customer_R.png',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        originalPrice: 189,
        salePrice: 132,
        discount: 30,
        stock: 5
      },
      {
        id: 6,
        name: 'Kitchen Essentials Set',
        category: 'home',
        categoryLabel: 'Home Goods',
        image: '/images/299612_Shopping_R.png',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        originalPrice: 449,
        salePrice: 359,
        discount: 20,
        stock: 2
      },
      {
        id: 7,
        name: 'Fitness Tracker Pro',
        category: 'electronics',
        categoryLabel: 'Wearables',
        image: '/images/301553_User_Experience_R.png',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        originalPrice: 129,
        salePrice: 77,
        discount: 40,
        stock: 8
      },
      {
        id: 8,
        name: 'Organic Tea Collection',
        category: 'food',
        categoryLabel: 'Organic',
        image: '/images/301700_Grocery_R.png',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        originalPrice: 49,
        salePrice: 39,
        discount: 20,
        stock: 15
      }
    ])

    const filteredDeals = computed(() => {
      if (activeCategory.value === 'all') {
        return allDeals.value
      }
      return allDeals.value.filter(deal => deal.category === activeCategory.value)
    })

    const formatPrice = (price) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    const updateCountdown = () => {
      // Set end date to 7 days from now
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)
      endDate.setHours(23, 59, 59)

      const now = new Date()
      const diff = endDate - now

      if (diff > 0) {
        countdown.value = {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        }
      }
    }

    onMounted(() => {
      updateCountdown()
      countdownInterval = setInterval(updateCountdown, 1000)
    })

    onUnmounted(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    })

    return {
      activeCategory,
      dealCategories,
      filteredDeals,
      countdown,
      formatPrice
    }
  }
}
</script>

<style scoped>
.deals-section {
  padding: 4rem 0;
  background: #fafafa;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h1 {
  font-size: 2.5rem;
  color: var(--sap-blue-7);
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--sap-gray-6);
  font-size: 1.125rem;
}

/* Featured Deal */
.featured-deal {
  margin-bottom: 3rem;
}

.deal-background {
  border-radius: 16px;
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.deal-badge {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: white;
  color: var(--sap-orange-7);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.deal-content {
  color: white;
}

.deal-label {
  display: block;
  font-size: 1.25rem;
  opacity: 0.9;
}

.deal-percentage {
  display: block;
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
}

.deal-title {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.deal-content p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.deal-timer {
  text-align: center;
  color: white;
}

.timer-label {
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.timer-display {
  display: flex;
  gap: 1rem;
}

.time-unit {
  background: rgba(255,255,255,0.2);
  padding: 1rem;
  border-radius: 8px;
  min-width: 70px;
}

.time-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.time-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Deal Categories */
.deal-categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid var(--sap-gray-3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  border-color: var(--sap-blue-6);
}

.category-btn.active {
  background: var(--sap-blue-6);
  border-color: var(--sap-blue-6);
  color: white;
}

.cat-pictogram {
  width: 24px;
  height: auto;
}

.cat-name {
  font-weight: 600;
}

.cat-count {
  background: var(--sap-gray-2);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
}

.category-btn.active .cat-count {
  background: rgba(255,255,255,0.3);
}

/* Deals Grid */
.deals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.deal-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
}

.deal-card:hover {
  transform: translateY(-4px);
}

.deal-image {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.deal-pictogram {
  width: 80px;
  height: auto;
}

.discount-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--sap-orange-6);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.875rem;
}

.deal-info {
  padding: 1.25rem;
}

.deal-info .deal-category {
  color: var(--sap-blue-6);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.deal-info h3 {
  color: var(--sap-gray-8);
  margin: 0.5rem 0;
  font-size: 1rem;
}

.deal-pricing {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.original-price {
  color: var(--sap-gray-5);
  text-decoration: line-through;
  font-size: 0.875rem;
}

.sale-price {
  color: var(--sap-orange-7);
  font-size: 1.25rem;
  font-weight: 700;
}

.deal-savings {
  color: var(--sap-green-6);
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.low-stock {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--sap-orange-6);
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Newsletter */
.newsletter-section {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  margin-bottom: 4rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.newsletter-content h2 {
  color: var(--sap-blue-7);
  margin-bottom: 0.5rem;
}

.newsletter-content > p {
  color: var(--sap-gray-6);
  margin-bottom: 1.5rem;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.newsletter-form .sap-input {
  flex: 1;
}

.newsletter-note {
  display: block;
  margin-top: 0.75rem;
  color: var(--sap-gray-5);
  font-size: 0.75rem;
}

/* Special Offers */
.special-offers h2 {
  text-align: center;
  color: var(--sap-blue-7);
  margin-bottom: 2rem;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.offer-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.offer-pictogram {
  width: 60px;
  height: auto;
  margin-bottom: 1rem;
}

.offer-card h3 {
  color: var(--sap-gray-8);
  margin-bottom: 0.5rem;
}

.offer-card p {
  color: var(--sap-gray-6);
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .deals-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .offers-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .deal-background {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .deals-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .newsletter-form {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .deals-grid,
  .offers-grid {
    grid-template-columns: 1fr;
  }

  .time-unit {
    min-width: 50px;
    padding: 0.75rem;
  }

  .time-value {
    font-size: 1.5rem;
  }
}
</style>
