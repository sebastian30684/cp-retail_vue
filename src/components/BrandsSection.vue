<template>
  <section class="brands-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Our Partners</h1>
        <p>Trusted brands powering retail excellence</p>
      </div>

      <!-- Featured Brands -->
      <div class="featured-brands">
        <div v-for="brand in featuredBrands" :key="brand.id" class="brand-card featured">
          <div class="brand-logo" :style="{ background: brand.gradient }">
            <img :src="brand.image" :alt="brand.name" class="brand-pictogram" />
          </div>
          <div class="brand-info">
            <h3>{{ brand.name }}</h3>
            <p class="brand-tagline">{{ brand.tagline }}</p>
            <p class="brand-description">{{ brand.description }}</p>
            <div class="brand-stats">
              <div class="stat">
                <span class="stat-value">{{ brand.products }}+</span>
                <span class="stat-label">Products</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ brand.countries }}</span>
                <span class="stat-label">Countries</span>
              </div>
            </div>
            <button class="sap-btn sap-btn-primary" @click="$emit('navigate', 'shop')">
              Explore {{ brand.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Brand Categories -->
      <div class="brand-categories">
        <h2>Browse by Industry</h2>
        <div class="category-tabs">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-tab', { active: activeCategory === category.id }]"
            @click="activeCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>

        <div class="brands-grid">
          <div
            v-for="brand in filteredBrands"
            :key="brand.id"
            class="brand-tile"
            @click="$emit('navigate', 'shop')"
          >
            <div class="tile-logo" :style="{ background: brand.gradient }">
              <img :src="brand.image" :alt="brand.name" class="tile-pictogram" />
            </div>
            <span class="tile-name">{{ brand.name }}</span>
            <span class="tile-category">{{ brand.categoryLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Brand Story -->
      <div class="brand-story">
        <div class="story-content">
          <h2>Quality You Can Trust</h2>
          <p>
            We partner exclusively with brands that share our commitment to excellence.
            Each brand in our portfolio is carefully selected based on quality, innovation,
            and customer satisfaction across the consumer products and retail industry.
          </p>
          <ul class="story-features">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Authorized partner for all brands
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Full manufacturer warranty
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Expert product support
            </li>
          </ul>
        </div>
        <div class="story-image">
          <div class="image-placeholder">
            <img src="/images/305959_Celebration_R.png" alt="Partnership" class="story-pictogram" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'BrandsSection',
  emits: ['navigate'],
  setup() {
    const activeCategory = ref('all')

    const featuredBrands = ref([
      {
        id: 1,
        name: 'Nike',
        tagline: 'Just Do It',
        description: 'Global leader in athletic footwear, apparel, and sports equipment. Innovation meets performance.',
        image: '/images/301697_Consumer_Products_R.png',
        gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        products: 800,
        countries: 190
      },
      {
        id: 2,
        name: 'Apple',
        tagline: 'Think Different',
        description: 'Premium technology products designed to seamlessly integrate into your digital lifestyle.',
        image: '/images/301553_User_Experience_R.png',
        gradient: 'linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)',
        products: 250,
        countries: 175
      }
    ])

    const categories = ref([
      { id: 'all', name: 'All Partners' },
      { id: 'fashion', name: 'Fashion & Apparel' },
      { id: 'home', name: 'Home & Living' },
      { id: 'electronics', name: 'Electronics' },
      { id: 'food', name: 'Food & Beverage' }
    ])

    const allBrands = ref([
      { id: 1, name: 'Nike', category: 'fashion', categoryLabel: 'Sportswear', image: '/images/301697_Consumer_Products_R.png', gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' },
      { id: 2, name: 'Adidas', category: 'fashion', categoryLabel: 'Sportswear', image: '/images/301464_Customer_R.png', gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
      { id: 3, name: 'H&M', category: 'fashion', categoryLabel: 'Fashion', image: '/images/301553_User_Experience_R.png', gradient: 'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)' },
      { id: 4, name: 'IKEA', category: 'home', categoryLabel: 'Home & Living', image: '/images/299612_Shopping_R.png', gradient: 'linear-gradient(135deg, #fdcb6e 0%, #f39c12 100%)' },
      { id: 5, name: 'Dyson', category: 'home', categoryLabel: 'Home Tech', image: '/images/302220_Storefront-SmallBusiness_R.png', gradient: 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)' },
      { id: 6, name: 'Philips', category: 'home', categoryLabel: 'Electronics', image: '/images/306336_Warehouse_R.png', gradient: 'linear-gradient(135deg, #81ecec 0%, #00cec9 100%)' },
      { id: 7, name: 'Apple', category: 'electronics', categoryLabel: 'Technology', image: '/images/301553_User_Experience_R.png', gradient: 'linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)' },
      { id: 8, name: 'Samsung', category: 'electronics', categoryLabel: 'Electronics', image: '/images/301464_Customer_R.png', gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' },
      { id: 9, name: 'Sony', category: 'electronics', categoryLabel: 'Entertainment', image: '/images/301697_Consumer_Products_R.png', gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)' },
      { id: 10, name: 'Nestlé', category: 'food', categoryLabel: 'Food & Beverage', image: '/images/301700_Grocery_R.png', gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)' },
      { id: 11, name: 'Coca-Cola', category: 'food', categoryLabel: 'Beverages', image: '/images/301700_Grocery_R.png', gradient: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)' },
      { id: 12, name: 'Lindt', category: 'food', categoryLabel: 'Confectionery', image: '/images/301466_Wholesale_Package_R.png', gradient: 'linear-gradient(135deg, #e17055 0%, #d35400 100%)' }
    ])

    const filteredBrands = computed(() => {
      if (activeCategory.value === 'all') {
        return allBrands.value
      }
      return allBrands.value.filter(brand => brand.category === activeCategory.value)
    })

    return {
      activeCategory,
      featuredBrands,
      categories,
      filteredBrands
    }
  }
}
</script>

<style scoped>
.brands-section {
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

/* Featured Brands */
.featured-brands {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.brand-card.featured {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.brand-logo {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-pictogram {
  width: 100px;
  height: auto;
}

.brand-info {
  padding: 2rem;
  flex: 1;
}

.brand-info h3 {
  font-size: 1.75rem;
  color: var(--sap-gray-8);
  margin-bottom: 0.25rem;
}

.brand-tagline {
  color: var(--sap-blue-6);
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.brand-description {
  color: var(--sap-gray-6);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.brand-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sap-blue-7);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--sap-gray-5);
  text-transform: uppercase;
}

/* Brand Categories */
.brand-categories {
  margin-bottom: 4rem;
}

.brand-categories h2 {
  text-align: center;
  color: var(--sap-blue-7);
  margin-bottom: 1.5rem;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--sap-gray-3);
  border-radius: 50px;
  background: white;
  color: var(--sap-gray-6);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab:hover {
  border-color: var(--sap-blue-6);
  color: var(--sap-blue-6);
}

.category-tab.active {
  background: var(--sap-blue-6);
  border-color: var(--sap-blue-6);
  color: white;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
}

.brand-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.brand-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.tile-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.tile-pictogram {
  width: 40px;
  height: auto;
}

.tile-name {
  font-weight: 600;
  color: var(--sap-gray-8);
  margin-bottom: 0.25rem;
}

.tile-category {
  font-size: 0.75rem;
  color: var(--sap-gray-5);
  text-transform: capitalize;
}

/* Brand Story */
.brand-story {
  display: flex;
  gap: 4rem;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.story-content {
  flex: 1;
}

.story-content h2 {
  color: var(--sap-blue-7);
  margin-bottom: 1rem;
}

.story-content > p {
  color: var(--sap-gray-6);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.story-features {
  list-style: none;
  padding: 0;
}

.story-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--sap-gray-7);
  margin-bottom: 0.75rem;
}

.story-features svg {
  color: var(--sap-green-6);
  flex-shrink: 0;
}

.story-image {
  flex: 0 0 300px;
}

.image-placeholder {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-pictogram {
  width: 120px;
  height: auto;
}

@media (max-width: 1024px) {
  .featured-brands {
    grid-template-columns: 1fr;
  }

  .brands-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .brand-story {
    flex-direction: column;
  }

  .story-image {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .brand-card.featured {
    flex-direction: column;
  }

  .brand-logo {
    width: 100%;
    height: 150px;
  }

  .brands-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .brands-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
