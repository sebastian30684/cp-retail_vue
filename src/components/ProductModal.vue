<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="closeModal" v-if="product">
      <div class="sap-modal sap-modal-large" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header gradient-bg">
          <div class="modal-header-content">
            <div class="product-header-info">
              <div class="product-icon-large">
                <!-- SAP Logo -->
                <img src="/images/sap_logo.png" 
                    alt="SAP Logo" 
                    class="sap-logo-img-large">
              </div>
              <div class="product-title-section">
                <h2 class="sap-text-3xl sap-font-bold">{{ product.productName }}</h2>
                <div class="product-badges">
                  <span class="sap-badge badge-category">{{ product.category }}</span>
                  <span class="sap-badge badge-type">{{ product.productType }}</span>
                </div>
              </div>
            </div>
            <button @click="closeModal" class="modal-close">✕</button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div class="modal-body">
          <div class="product-content">
            <!-- Product Description -->
            <div class="product-description-section">
              <h3 class="sap-text-xl sap-font-semibold">Product Overview</h3>
              <p class="product-full-description">{{ product.productDescription }}</p>
            </div>
            
            <!-- Product Details -->
            <div class="product-details-grid">
              <div class="detail-item">
                <div class="detail-label">Product ID</div>
                <div class="detail-value">{{ product.id }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">{{ product.category }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">{{ product.productType }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Region</div>
                <div class="detail-value">{{ product.region }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Availability</div>
                <div class="detail-value">
                  <span :class="product.inStock ? 'text-green' : 'text-red'">
                    {{ product.inStock ? '✓ In Stock' : '⚠ Out of Stock' }}
                  </span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Warranty</div>
                <div class="detail-value">
                  <span :class="product.hasWarranty ? 'text-green' : 'text-red'">
                    {{ product.hasWarranty ? '✓ Included' : '✕ Not included' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Technical Specifications (Bikes only) -->
            <div v-if="product.productType === 'Bike' && product.groupset" class="product-specs-section">
              <h3 class="sap-text-xl sap-font-semibold">Technical Specifications</h3>
              <div class="specs-grid">
                <div class="spec-item" v-if="product.groupset">
                  <div class="spec-label">Groupset</div>
                  <div class="spec-value">{{ product.groupset }}</div>
                </div>
                <div class="spec-item" v-if="product.brakes">
                  <div class="spec-label">Brakes</div>
                  <div class="spec-value">{{ product.brakes }}</div>
                </div>
                <div class="spec-item" v-if="product.frameMaterial">
                  <div class="spec-label">Frame Material</div>
                  <div class="spec-value">{{ product.frameMaterial }}</div>
                </div>
                <div class="spec-item" v-if="product.wheelSize">
                  <div class="spec-label">Wheel Size</div>
                  <div class="spec-value">{{ product.wheelSize }}</div>
                </div>
                <div class="spec-item" v-if="product.suspension && product.suspension !== 'None'">
                  <div class="spec-label">Suspension</div>
                  <div class="spec-value">{{ product.suspension }}</div>
                </div>
                <div class="spec-item" v-if="product.weight">
                  <div class="spec-label">Weight</div>
                  <div class="spec-value">{{ product.weight }} kg</div>
                </div>
              </div>
            </div>

            <!-- Size & Color Selection -->
            <div v-if="availableSizes.length > 0 || availableColors.length > 0" class="product-options-section">
              <div v-if="availableSizes.length > 0" class="option-group">
                <label class="option-label">Size</label>
                <div class="option-buttons">
                  <button
                    v-for="size in availableSizes"
                    :key="size"
                    :class="['option-btn', { active: selectedSize === size }]"
                    @click="selectedSize = size"
                  >{{ size }}</button>
                </div>
              </div>
              <div v-if="availableColors.length > 0" class="option-group">
                <label class="option-label">Color</label>
                <div class="option-buttons">
                  <button
                    v-for="color in availableColors"
                    :key="color"
                    :class="['option-btn', { active: selectedColor === color }]"
                    @click="selectedColor = color"
                  >{{ color }}</button>
                </div>
              </div>
            </div>

            <!-- Pricing and Actions -->
            <div class="product-purchase-section">
              <div class="price-section">
                <div class="main-price">
                  <span class="price-amount">{{ product.price.toLocaleString() }}</span>
                  <span class="price-currency">{{ product.currency }}</span>
                </div>
                <div class="price-note">Retail Price</div>
              </div>

              <div class="quantity-section">
                <label class="quantity-label">Quantity</label>
                <div class="quantity-controls">
                  <button @click="decreaseQuantity" :disabled="quantity <= 1" class="quantity-btn">−</button>
                  <input v-model.number="quantity" type="number" min="1" class="quantity-input">
                  <button @click="increaseQuantity" class="quantity-btn">+</button>
                </div>
              </div>

              <div class="purchase-actions">
                <button
                  @click="addToCart"
                  :disabled="!product.inStock"
                  class="sap-btn sap-btn-primary purchase-btn">
                  🛒 Add to Cart
                </button>
                <button
                  @click="addToWishlist"
                  class="sap-btn sap-btn-secondary purchase-btn">
                  ♡ Add to Wishlist
                </button>
              </div>
            </div>

            <!-- Emarsys Product View Recommendations -->
            <div id="productViewRecoId" class="emarsys-reco-container"></div>

          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'ProductModal',
  props: {
    product: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'add-to-cart', 'add-to-wishlist'],
  setup(props, { emit }) {
    const quantity = ref(1)
    const selectedSize = ref('')
    const selectedColor = ref('')

    const parseCsvList = (value) => {
      if (!value || typeof value !== 'string') return []
      return value.split(',').map(v => v.trim()).filter(Boolean)
    }

    const availableSizes = computed(() => parseCsvList(props.product?.sizes))
    const availableColors = computed(() => parseCsvList(props.product?.colors))

    watch(() => props.product, () => {
      quantity.value = 1
      selectedSize.value = availableSizes.value[0] || ''
      selectedColor.value = availableColors.value[0] || ''
    }, { immediate: true })

    const closeModal = () => {
      emit('close')
    }

    const increaseQuantity = () => {
      quantity.value++
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = () => {
      emit('add-to-cart', {
        ...props.product,
        quantity: quantity.value,
        selectedSize: selectedSize.value,
        selectedColor: selectedColor.value
      })
      closeModal()
    }

    const addToWishlist = () => {
      emit('add-to-wishlist', {
        ...props.product
      })
      closeModal()
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const ensureRecoTemplate = () => {
      const existing = document.getElementById('productViewRecoTmpl')
      if (existing) existing.remove()
      const tmpl = document.createElement('script')
      tmpl.type = 'text/html'
      tmpl.id = 'productViewRecoTmpl'
      tmpl.text = [
        '<![CDATA[',
        '<h4>{{=SC.title}}</h4>',
        '{{ for (var i=0; i < SC.page.products.length; i++) { }}',
        '  {{ var p = SC.page.products[i]; }}',
        '  <span data-scarabitem="{{= p.id }}" class="rec-item">',
        '    <a href="{{=p.link}}" target="_blank">',
        '      <img src="{{=p.image}}" class="rec-image" title="{{=p.title}}">',
        '      <span class="rec-title">{{=p.title}}</span>',
        '    </a>',
        '  </span>',
        '{{ } }}',
        ']]>'
      ].join('\n')
      document.body.appendChild(tmpl)
    }

    const loadRecommendations = () => {
      if (!props.product?.id) return
      ensureRecoTemplate()

      window.ScarabQueue = window.ScarabQueue || []
      // Send view command so ALSO_BOUGHT logic knows which product to base on
      window.ScarabQueue.push(['view', String(props.product.id)])
      window.ScarabQueue.push(['recommend', {
        logic: 'ALSO_BOUGHT',
        containerId: 'productViewRecoId',
        templateId: 'productViewRecoTmpl',
        limit: 4,
        success: function (SC, render) {
          if (SC.page.products.length > 0) {
            SC.title = 'Customers Also Bought'
            render(SC)
          }
        }
      }])
      window.ScarabQueue.push(['go'])
    }

    onMounted(() => {
      if (props.product) {
        loadRecommendations()
      }
    })

    watch(() => props.product, (newProduct) => {
      if (newProduct) {
        loadRecommendations()
      }
    })

    return {
      quantity,
      selectedSize,
      selectedColor,
      availableSizes,
      availableColors,
      closeModal,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      addToWishlist,
      formatDate
    }
  }
}
</script>