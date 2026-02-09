<template>
  <section v-if="recommendations.length > 0" class="emarsys-recommendations">
    <div class="recommendations-header">
      <h3>{{ title }}</h3>
    </div>
    <div class="recommendations-grid">
      <div
        v-for="product in recommendations"
        :key="product.id"
        class="recommendation-card"
        @click="handleProductClick(product)"
      >
        <div class="recommendation-image">
          <img
            :src="product.image || '/images/product-placeholder.png'"
            :alt="product.title"
            @error="handleImageError"
          />
        </div>
        <div class="recommendation-content">
          <h4 class="recommendation-title">{{ product.title }}</h4>
          <p v-if="product.category" class="recommendation-category">{{ product.category }}</p>
          <div class="recommendation-price">
            <span class="price">{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import emarsysTracker from '../utils/emarsys-tracking.js'

export default {
  name: 'EmarsysRecommendations',
  props: {
    logic: {
      type: String,
      required: true,
      validator: (value) => ['PERSONAL', 'ALSO_BOUGHT', 'RELATED', 'CATEGORY', 'POPULAR'].includes(value)
    },
    title: {
      type: String,
      default: 'Recommended for you'
    },
    productId: {
      type: String,
      default: null
    },
    maxItems: {
      type: Number,
      default: 4
    }
  },
  emits: ['product-click'],
  setup(props, { emit }) {
    const recommendations = ref([])
    const isLoading = ref(false)

    const loadRecommendations = () => {
      isLoading.value = true

      const callback = (SC) => {
        isLoading.value = false

        if (SC && SC.page && SC.page.products) {
          // Map Emarsys product data to our format
          recommendations.value = SC.page.products
            .slice(0, props.maxItems)
            .map(product => ({
              id: product.item,
              title: product.title || product.item,
              image: product.image || product.link,
              price: parseFloat(product.price) || 0,
              category: product.category || '',
              link: product.link || '',
              msrp: product.msrp || null,
              // Keep original data for reference
              _raw: product
            }))

          console.log(`[Emarsys] Loaded ${recommendations.value.length} recommendations for ${props.logic}`)
        } else {
          console.log('[Emarsys] No recommendations received')
          recommendations.value = []
        }
      }

      // Request recommendations from Emarsys
      emarsysTracker.recommend(props.logic, null, callback)
      emarsysTracker.go()
    }

    const handleProductClick = (product) => {
      // Track the click
      emarsysTracker.trackView(product.id)

      // Emit event to parent
      emit('product-click', product)
    }

    const handleImageError = (event) => {
      event.target.src = '/images/product-placeholder.png'
    }

    const formatPrice = (price) => {
      if (!price) return ''
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    }

    // Load recommendations on mount
    onMounted(() => {
      // Small delay to ensure Scarab SDK is ready
      setTimeout(loadRecommendations, 500)
    })

    // Reload when productId changes (for product detail pages)
    watch(() => props.productId, (newId) => {
      if (newId) {
        loadRecommendations()
      }
    })

    return {
      recommendations,
      isLoading,
      handleProductClick,
      handleImageError,
      formatPrice
    }
  }
}
</script>

<style scoped>
.emarsys-recommendations {
  padding: 2rem 0;
  margin: 2rem 0;
}

.recommendations-header {
  margin-bottom: 1.5rem;
}

.recommendations-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1d2d3e;
  margin: 0;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.recommendation-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.recommendation-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation-content {
  padding: 1rem;
}

.recommendation-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1d2d3e;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommendation-category {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.recommendation-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recommendation-price .price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0070f2;
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .recommendation-image {
    height: 140px;
  }

  .recommendation-content {
    padding: 0.75rem;
  }
}
</style>
