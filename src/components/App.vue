<template>
  <div id="app" class="min-h-screen" :class="{ 'cookie-blur': showCookieConsent }">
    <!-- Cookie Consent -->
    <CookieConsent 
      v-if="showCookieConsent"
      @consent-given="handleConsentGiven"
    />
    
    <!-- Header Component -->
    <Header 
      @navigate="handleNavigation"
      @login="handleShowAuthModal"
      @logout="handleLogout"
      @toggle-cart="toggleCart"
      @show-profile="showProfileModal = true"
      @show-settings="showSettingsModal = true"
      :user="user"
      :current-page="currentPage"
      :cart-count="cartItems.length"
    />
    
    <!-- Main Content -->
    <main class="main-content">
      <!-- Home Page -->
      <div v-if="currentPage === 'home'" class="home-page">
        <HeroSection @navigate="handleNavigation" />
        <FeaturesSection />
        <CategoriesPreview @navigate="handleNavigation" />
        <!-- Emarsys Personalized Recommendations -->
        <div class="sap-container">
          <EmarsysRecommendations
            logic="PERSONAL"
            title="Recommended for you"
            @product-click="showProductModal"
          />
        </div>
      </div>

      <!-- Shop Page -->
      <div v-if="currentPage === 'shop'" class="shop-page">
        <ShopSection
          @show-product="showProductModal"
          @add-to-cart="addToCart"
          :is-logged-in="user.isLoggedIn"
        />
      </div>

      <!-- Brands Page -->
      <div v-if="currentPage === 'brands'" class="brands-page">
        <BrandsSection @navigate="handleNavigation" />
      </div>

      <!-- Strava Page -->
      <div v-if="currentPage === 'strava'" class="strava-page">
        <StravaSection @navigate-shop="() => handleNavigation('shop')" />
      </div>

      <!-- Deals Page -->
      <div v-if="currentPage === 'deals'" class="deals-page">
        <DealsSection @navigate="handleNavigation" />
      </div>

      <!-- About Page -->
      <div v-if="currentPage === 'about'" class="about-page">
        <AboutSection @navigate="handleNavigation" />
      </div>

      <!-- FAQ Page -->
      <div v-if="currentPage === 'faq'" class="faq-page">
        <FAQSection @navigate="handleNavigation" />
      </div>

      <!-- Tracking Page -->
      <div v-if="currentPage === 'tracking'" class="tracking-page">
        <TrackingSection />
      </div>

      <!-- Contact Page -->
      <div v-if="currentPage === 'contact'" class="contact-page">
        <ContactForm />
      </div>

      <!-- Service Ticket Page -->
      <div v-if="currentPage === 'service-ticket'" class="service-ticket-page">
        <ServiceTicketSection />
      </div>

      <!-- Categories Page (legacy) -->
      <div v-if="currentPage === 'categories'" class="categories-page">
        <CategoriesSection @show-modal="showCategoryModal" />
      </div>

      <!-- Checkout Page (für eingeloggte User und Gäste) -->
      <CheckoutPage
        v-if="currentPage === 'checkout' && (user.isLoggedIn || isGuestCheckout)"
        :cart-items="cartItems"
        :cart-discount="cartDiscount"
        :is-guest="isGuestCheckout"
        @navigate="handleNavigation"
        @order-placed="handleOrder"
        @clear-cart="cartItems = []; isGuestCheckout = false"
        @remove-discount="removeCartDiscount"
      />

      <!-- Order History Page -->
      <OrderHistoryPage
        v-if="currentPage === 'order-history' && user.isLoggedIn"
        @navigate="handleNavigation"
        @reorder="handleReorder"
      />

      <!-- Bike Garage Page -->
      <BikeGaragePage
        v-if="currentPage === 'bike-garage' && user.isLoggedIn"
        @navigate="handleNavigation"
      />
    </main>

    <!-- Footer Component with Demo Access -->
    <Footer
      @navigate="handleNavigation"
      @demo-login="handleDemoLogin"
      :show-demo-access="isDevelopment"
    />

    <!-- Category Modal -->
    <CategoryModal
      v-if="showCategoryModalVisible && selectedCategory"
      :industry="selectedCategory"
      @close="closeCategoryModal"
    />

    <!-- Product Modal -->
    <ProductModal
      v-if="showProductModalVisible && selectedProduct"
      :product="selectedProduct"
      :show-prices="true"
      :show-cart-actions="true"
      @close="closeProductModal"
      @add-to-cart="addToCart"
      @add-to-wishlist="addToWishlist"
    />

    <!-- Shopping Cart Sidebar (B2C: verfügbar für alle User) -->
    <CartSidebar
      :is-open="showCart"
      :cart-items="cartItems"
      :cart-discount="cartDiscount"
      :show-test-button="isDevelopment"
      @close="toggleCart"
      @remove-item="removeFromCart"
      @update-quantity="updateCartQuantity"
      @checkout="handleCheckout"
      @order-placed="handleOrder"
      @remove-discount="removeCartDiscount"
    />

    <!-- Order Success Modal -->
    <OrderSuccessModal
      v-if="showOrderSuccess"
      :order-data="lastOrder"
      @close="showOrderSuccess = false"
    />

    <!-- Auth Modal (Login/Register) -->
    <AuthModal
      v-if="showAuthModal"
      @close="closeAuthModal"
      @login="handleLogin"
      @register="handleRegister"
      @gigya-login="handleGigyaLogin"
    />

    <!-- Checkout Options Modal (für nicht eingeloggte User) -->
    <Teleport to="body">
      <div v-if="showCheckoutOptions" class="checkout-options-overlay" @click.self="showCheckoutOptions = false">
        <div class="checkout-options-modal">
          <button class="close-btn" @click="showCheckoutOptions = false">&times;</button>
          <h2>Checkout</h2>
          <p>How would you like to proceed?</p>

          <div class="checkout-options-buttons">
            <button class="option-btn primary" @click="handleCheckoutWithLogin">
              <span class="option-icon">🔐</span>
              <span class="option-text">
                <strong>Login</strong>
                <small>Access your account & earn loyalty points</small>
              </span>
            </button>

            <button class="option-btn secondary" @click="handleCheckoutWithLogin">
              <span class="option-icon">📝</span>
              <span class="option-text">
                <strong>Register</strong>
                <small>Create an account for exclusive benefits</small>
              </span>
            </button>

            <button class="option-btn guest" @click="handleGuestCheckout">
              <span class="option-icon">🛒</span>
              <span class="option-text">
                <strong>Continue as Guest</strong>
                <small>Quick checkout without account</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Profile Modal -->
    <ProfileModal
      v-if="showProfileModal"
      :user-email="user.email"
      :user-name="user.name"
      @close="showProfileModal = false"
    />
    
    <!-- Settings Modal -->
    <SettingsModal
      v-if="showSettingsModal"
      :user-email="user.email"
      @close="showSettingsModal = false"
      @settings-saved="handleSettingsSaved"
    />

    <!-- Loyalty Floating Button (global, on all pages) -->
    <LoyaltyFloatingButton :is-logged-in="user.isLoggedIn" />

    <!-- Cookie Debug Overlay -->
    <CookieDebugOverlay />

      </div>
</template>

<script>
import { ref, reactive, onMounted, computed, provide } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'
import CookieConsent from './CookieConsent.vue'
import CategoryModal from './CategoryModal.vue'
import ShopSection from './ShopSection.vue'
import CategoriesSection from './CategoriesSection.vue'
import TrackingSection from './TrackingSection.vue'
import BrandsSection from './BrandsSection.vue'
import StravaSection from './StravaSection.vue'
import DealsSection from './DealsSection.vue'
import AboutSection from './AboutSection.vue'
import FAQSection from './FAQSection.vue'
import ProductModal from './ProductModal.vue'
import CartSidebar from './CartSidebar.vue'
import ContactForm from './ContactForm.vue'
import ServiceTicketSection from './ServiceTicketSection.vue'
import OrderSuccessModal from './OrderSuccessModal.vue'
import CheckoutPage from './CheckoutPage.vue'
import OrderHistoryPage from './OrderHistoryPage.vue'
import BikeGaragePage from './BikeGaragePage.vue'
import AuthModal from './AuthModal.vue'
import ProfileModal from './ProfileModal.vue'
import SettingsModal from './SettingsModal.vue'
import EmarsysRecommendations from './EmarsysRecommendations.vue'
import LoyaltyFloatingButton from './LoyaltyFloatingButton.vue'
import CookieDebugOverlay from './CookieDebugOverlay.vue'
import { loyaltyStorage, useConsumerLoyalty } from '../composables/useConsumerLoyalty.js'
import { useConsumerTracking } from '../composables/useConsumerLoyaltyTracking.js'

import { useBikeGarage } from '../composables/useBikeGarage.js'
import trackingService from '../utils/tracking-service.js'
import emarsysTracker from '../utils/emarsys-tracking.js'

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    CookieConsent,
    CategoryModal,
    ShopSection,
    CategoriesSection,
    TrackingSection,
    BrandsSection,
    StravaSection,
    DealsSection,
    AboutSection,
    FAQSection,
    ProductModal,
    CartSidebar,
    ContactForm,
    ServiceTicketSection,
    OrderSuccessModal,
    CheckoutPage,
    OrderHistoryPage,
    BikeGaragePage,
    AuthModal,
    ProfileModal,
    SettingsModal,
    EmarsysRecommendations,
    LoyaltyFloatingButton,
    CookieDebugOverlay,

    // Inline Components for the pages
    HeroSection: {
      template: `
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-text fade-in">
              <h1>Consumer Products & Retail</h1>
              <p>
                Discover our exclusive selection of premium products across all categories.
                From fashion to electronics, home goods to groceries -
                find everything you need in one place.
              </p>
              <div class="cta-buttons">
                <button @click="$emit('navigate', 'applications')" class="sap-btn sap-btn-primary">
                  Browse Categories
                </button>
                <button @click="$emit('navigate', 'shop')" class="sap-btn sap-btn-secondary">
                  Shop Now
                </button>
              </div>
            </div>

            <div class="hero-stats slide-in-up stagger-1">
              <div class="sap-stats-card">
                <div class="stat-number stat-blue">500+</div>
                <div class="stat-label">Products</div>
              </div>
              <div class="sap-stats-card">
                <div class="stat-number stat-green">98%</div>
                <div class="stat-label">Happy Customers</div>
              </div>
              <div class="sap-stats-card">
                <div class="stat-number stat-orange">24h</div>
                <div class="stat-label">Fast Shipping</div>
              </div>
              <div class="sap-stats-card">
                <div class="stat-number stat-blue">5★</div>
                <div class="stat-label">Top Rated</div>
              </div>
            </div>
          </div>
        </section>
      `,
      emits: ['navigate']
    },
    
    FeaturesSection: {
      template: `
        <section class="features-section">
          <div class="sap-container">
            <div class="section-header">
              <h2>Why Choose SAP Customer Experience?</h2>
              <p>
                Leading CX platform delivering personalized experiences across every touchpoint
              </p>
            </div>
            
            <div class="sap-grid sap-grid-cols-4 features-section-grid">
              <div v-for="(feature, index) in features" :key="feature.id" 
                   class="text-center feature-card" :class="'stagger-' + (index + 1)">
                <div class="feature-icon-wrapper">
                  <img :src="feature.icon" :alt="feature.title" class="feature-pictogram" style="width: 80px; height: 80px;">
                </div>
                <h3 class="feature-title">
                  {{ feature.title }}
                </h3>
                <p class="feature-description">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </section>
      `,
      setup() {
        const features = [
          {
            id: 1,
            icon: '/images/sap_pictogram_intelligence.png',
            title: 'Customer Intelligence',
            description: 'AI-powered insights to understand and predict customer behavior'
          },
          {
            id: 2,
            icon: '/images/sap_pictogram_personalization.png',
            title: 'Personalization at Scale',
            description: 'Deliver individualized experiences across all channels'
          },
          {
            id: 3,
            icon: '/images/sap_pictogram_integration.png',
            title: 'Seamless Integration',
            description: 'Unified platform connecting all your customer touchpoints'
          },
          {
            id: 4,
            icon: '/images/sap_pictogram_analytics.png',
            title: 'Real-time Analytics',
            description: 'Instant insights for data-driven customer experience decisions'
          }
        ]
        return { features }
      }
    },
    
    CategoriesPreview: {
      template: `
        <section class="categories-preview-section">
          <div class="sap-container">
            <div class="section-header">
              <h2>Shop by Category</h2>
              <p>
                Discover products across all retail categories
              </p>
            </div>

            <div class="sap-grid sap-grid-cols-4 categories-preview-grid">
              <div v-for="category in previewCategories" :key="category.id" class="sap-card">
                <div class="card-content">
                  <div class="feature-icon-wrapper">
                    <img :src="category.image" :alt="category.title" class="feature-pictogram" style="width: 80px; height: 80px;" />
                  </div>
                  <h3 class="category-title">{{ category.title }}</h3>
                  <p class="category-description">{{ category.description }}</p>
                  <button @click="$emit('navigate', 'shop')" class="sap-btn sap-btn-primary">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            <div class="categories-preview-cta">
              <button @click="$emit('navigate', 'applications')" class="sap-btn sap-btn-secondary categories-preview-btn">
                View All Categories
              </button>
            </div>
          </div>
        </section>
      `,
      emits: ['navigate'],
      setup() {
        const previewCategories = [
          {
            id: 1,
            image: '/images/301697_Consumer_Products_R.png',
            title: 'Fashion & Apparel',
            description: 'Discover the latest trends in clothing, footwear, and accessories.'
          },
          {
            id: 2,
            image: '/images/302220_Storefront-SmallBusiness_R.png',
            title: 'Home & Living',
            description: 'Everything for your home, from furniture to decor and appliances.'
          },
          {
            id: 3,
            image: '/images/301553_User_Experience_R.png',
            title: 'Electronics',
            description: 'Smart devices, gadgets, and technology for modern living.'
          },
          {
            id: 4,
            image: '/images/301700_Grocery_R.png',
            title: 'Food & Grocery',
            description: 'Fresh produce, gourmet foods, and everyday essentials.'
          }
        ]
        return { previewCategories }
      }
    }
  },
  setup() {
    const { trackPurchase, trackCdpLoyaltyActivity } = useConsumerTracking()
    const { calculateTier } = useConsumerLoyalty()
    const { clearBikeGarage } = useBikeGarage()
    
    // Core app state
    const currentPage = ref('home')
    const showCategoryModalVisible = ref(false)
    const selectedCategory = ref(null)
    const showCookieConsent = ref(false)
    
    // Shopping cart state
    const cartItems = ref([])
    const showCart = ref(false)

    // Cart discount state (for Loyalty redemptions)
    const cartDiscount = reactive({
      type: 'none',       // 'none' | 'percentage' | 'fixed' | 'shipping'
      value: 0,           // discount value (percentage or fixed EUR)
      description: '',    // e.g. "5 EUR Voucher"
      loyaltyRedemptionId: null
    })

    // Apply a discount to the cart
    const applyCartDiscount = (discount) => {
      cartDiscount.type = discount.type
      cartDiscount.value = discount.value
      cartDiscount.description = discount.description
      cartDiscount.loyaltyRedemptionId = discount.loyaltyRedemptionId || null
      console.log('🎁 Cart discount applied:', discount)
    }

    // Remove cart discount
    const removeCartDiscount = () => {
      cartDiscount.type = 'none'
      cartDiscount.value = 0
      cartDiscount.description = ''
      cartDiscount.loyaltyRedemptionId = null
      console.log('🗑️ Cart discount removed')
    }

    // Cart Abandon Timer (30 Sekunden für Demo)
    const CART_ABANDON_TIMEOUT = 30 * 1000
    let cartAbandonTimer = null
    const cartCreatedAt = ref(null)

    const startCartAbandonTimer = () => {
      if (cartAbandonTimer) clearTimeout(cartAbandonTimer)
      cartCreatedAt.value = Date.now()

      cartAbandonTimer = setTimeout(() => {
        if (cartItems.value.length > 0) {
          const timeSinceCreation = Math.floor((Date.now() - cartCreatedAt.value) / 1000)
          trackingService.trackCartAbandon(cartItems.value, timeSinceCreation)
        }
      }, CART_ABANDON_TIMEOUT)

      console.log('⏱️ Cart abandon timer started (30s)')
    }

    const stopCartAbandonTimer = () => {
      if (cartAbandonTimer) {
        clearTimeout(cartAbandonTimer)
        cartAbandonTimer = null
      }
      cartCreatedAt.value = null
    }

    const showCheckoutOptions = ref(false)  // Checkout-Optionen Modal
    const isGuestCheckout = ref(false)       // Gast-Checkout aktiv
    const pendingCheckout = ref(false)       // Nach Login zum Checkout
    const showProductModalVisible = ref(false)
    const selectedProduct = ref(null)
    
    // Order state
    const showOrderSuccess = ref(false)
    const lastOrder = ref(null)
    
    // Auth Modal state
    const showAuthModal = ref(false)

    // Profile & Settings Modal state
    const showProfileModal = ref(false)
    const showSettingsModal = ref(false)

    
    // Shared localStorage key for SSO between apps (Machine Hub & Industrial Machines)
    const SHARED_USER_KEY = 'sap_shared_user'

    // User state
    const user = reactive({
      isLoggedIn: false,
      UID: '',
      name: '',
      email: '',
      company: '',
      salutation: '',
      businessArea: 'DEFAULT',
      _gigyaSession: false
    })

    // Save user to shared localStorage for SSO
    const saveUserToSharedStorage = () => {
      const userData = {
        UID: user.UID,
        name: user.name,
        email: user.email,
        company: user.company,
        salutation: user.salutation,
        businessArea: user.businessArea
      }
      localStorage.setItem(SHARED_USER_KEY, JSON.stringify(userData))
      console.log('💾 [Industrial Machines] User saved to shared storage:', user.email)
    }

    // Listen for storage changes from other apps (SSO sync)
    const handleStorageChange = (event) => {
      if (event.key === SHARED_USER_KEY) {
        if (event.newValue) {
          // User logged in from another app
          try {
            const userData = JSON.parse(event.newValue)
            if (userData && userData.email) {
              user.isLoggedIn = true
              user.UID = userData.UID || ''
              user.name = userData.name || ''
              user.email = userData.email || ''
              user.company = userData.company || ''
              user.salutation = userData.salutation || ''
              user.businessArea = userData.businessArea || 'DEFAULT'
              localStorage.setItem('businessArea', user.businessArea)
              console.log('🔄 [Industrial Machines] SSO: User synced from another app:', user.email)

              // Set user identity for tracking
              trackingService.setUser(user.UID, user.email);
              emarsysTracker.setCustomer(user.email);
            }
          } catch (e) {
            console.error('❌ SSO sync error:', e)
          }
        } else {
          // User logged out from another app
          trackingService.clearUser();
          emarsysTracker.clearCustomer();

          user.isLoggedIn = false
          user.UID = ''
          user.name = ''
          user.email = ''
          user.company = ''
          user.salutation = ''
          user.businessArea = 'DEFAULT'
          currentPage.value = 'home'
          cartItems.value = []
          showCart.value = false
          localStorage.removeItem('businessArea')
          console.log('🔄 [Industrial Machines] SSO: User logged out from another app')
        }
      }
    }
    
    // Stub functions (no-op for demo)
    const createContactFromRegistration = () => Promise.resolve()
    const registerUser = () => Promise.resolve()
    const getContactByEmail = () => Promise.resolve(null)
    const trackEngagementPageView = () => {}
    const trackOrder = () => Promise.resolve()
    const trackProductInterest = () => {}
    const engagementLoading = ref(false)
    const engagementError = ref(null)

    // Computed properties
    const isDevelopment = computed(() => process.env.NODE_ENV === 'development')
    
    // Provide user data for child components
    provide('user', user)

    // Provide cart discount functions for child components
    provide('cartDiscount', cartDiscount)
    provide('applyCartDiscount', applyCartDiscount)
    provide('removeCartDiscount', removeCartDiscount)
    
    // Check for existing cookie consent on mount
    onMounted(() => {
      // 1. Check Cookie Consent
      const consentGiven = localStorage.getItem('cookie-consent')
      if (!consentGiven) {
        showCookieConsent.value = true
      } else {
        showCookieConsent.value = false
        console.log('Cookie Consent already saved');
      }

      // 2. Cookie Consent Event Listener
      document.addEventListener('cookie-consent-granted', (event) => {
        console.log('Cookie Consent Event received:', event.detail);

        if (event.detail.fromStorage) {
          console.log('Consent loaded from localStorage - tracking already running');
        } else {
          console.log('New consent - tracking starts now');
        }
      });

      // 3. Restore user from SHARED localStorage (SSO)
      const storedUser = localStorage.getItem(SHARED_USER_KEY)
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData && userData.email) {
            user.isLoggedIn = true
            user.UID = userData.UID || userData.email || 'restored_user'
            user.name = userData.name || userData.email?.split('@')[0] || 'User'
            user.email = userData.email || ''
            user.company = userData.company || ''
            user.businessArea = userData.businessArea || 'DEFAULT'
            user.salutation = userData.salutation || ''

            // Auch businessArea in localStorage sicherstellen
            if (userData.businessArea) {
              localStorage.setItem('businessArea', userData.businessArea)
            }

            console.log('🔄 [Industrial Machines] User restored from shared storage:', user.email, '| Business Area:', user.businessArea)

            // Set user identity for tracking (cdcUid + email)
            trackingService.setUser(user.UID, user.email);
            emarsysTracker.setCustomer(user.email);
          }
        } catch (e) {
          console.error('❌ Failed to restore user from shared storage:', e)
          localStorage.removeItem(SHARED_USER_KEY)
          localStorage.removeItem('businessArea')
        }
      }

      // 3b. Storage Event Listener for SSO between apps
      window.addEventListener('storage', handleStorageChange)

      // 3b2. Gigya login success event listener (from AuthModal)
      window.addEventListener('gigya-login-success', (event) => {
        console.log('Gigya login success event received:', event.detail)
        handleGigyaLogin(event.detail)
      })

      // 3c. Check for existing Gigya session (SSO across Gigya-enabled apps)
      if (!user.isLoggedIn && window.gigya?.accounts) {
        window.gigya.accounts.getAccountInfo({
          include: 'profile, emails',
          callback: (response) => {
            if (response.errorCode === 0 && response.UID && !user.isLoggedIn) {
              const email = response.profile?.email
                || response.emails?.verified?.[0]
                || response.loginIDs?.emails?.[0]
                || ''
              const firstName = response.profile?.firstName || ''
              const lastName = response.profile?.lastName || ''
              const name = `${firstName} ${lastName}`.trim() || email.split('@')[0]

              user.isLoggedIn = true
              user.UID = response.UID
              user.name = name
              user.email = email
              user.company = response.profile?.company || ''
              user.salutation = response.profile?.gender === 'f' ? 'Ms.' : 'Mr.'
              user.businessArea = 'DEFAULT'
              user._gigyaSession = true

              localStorage.setItem('businessArea', user.businessArea)
              saveUserToSharedStorage()

              console.log('Gigya session restored:', user.email)

              // Set user identity for tracking (cdcUid + email)
              trackingService.setUser(response.UID, email);
              emarsysTracker.setCustomer(email);
            }
          }
        })
      }

      // 4. Initial Page View Tracking
      trackingService.trackPageView('home');
      
      if (user.isLoggedIn) {
        trackEngagementPageView({
          url: '/',
          title: document.title,
          type: 'home'
        })
      }

      // 5. Demo data setup removed for B2C version
    })

    
    const handleConsentGiven = () => {
      showCookieConsent.value = false
    }
    
    const handleNavigation = (page) => {
      currentPage.value = page
      showCategoryModalVisible.value = false
      
      // GTM PAGE VIEW TRACKING
      trackingService.trackPageView(page);
      
      // Engagement Event
      trackEngagementPageView({
        url: `/${page}`,
        title: document.title,
        type: page
      })
    }
    
    // Show auth modal (triggered by Header Login button)
    const handleShowAuthModal = () => {
      showAuthModal.value = true
    }
    
    // Close auth modal
    const closeAuthModal = () => {
      showAuthModal.value = false
    }
    
    // Demo login (triggered by Footer Demo Access button)
    const handleDemoLogin = () => {
      user.isLoggedIn = true
      user.UID = 'demo_user'
      user.name = 'John Business'
      user.email = 'john@business.com'
      user.company = 'Business Solutions Ltd.'
      user.salutation = 'Mr.'
      user.businessArea = 'DE'  // Set Business Area

      // Save to localStorage
      localStorage.setItem('businessArea', user.businessArea)

      // SSO: Save to shared storage
      saveUserToSharedStorage()

      console.log('🔑 [Industrial Machines] Demo user logged in:', user.name)

      // Track demo login
      trackingService.trackPageView('demo-login');

      // Set user identity for tracking (cdcUid + email)
      trackingService.setUser(user.UID, user.email);
      emarsysTracker.setCustomer(user.email);
    }
    
    // Handle Gigya / SAP Identity login
    const handleGigyaLogin = (response) => {
      console.log('Gigya login response:', response)

      if (window.gigya?.accounts) {
        window.gigya.accounts.getAccountInfo({
          include: 'profile, emails',
          callback: (accountInfo) => {
            if (accountInfo.errorCode === 0 && accountInfo.UID) {
              const email = accountInfo.profile?.email
                || accountInfo.emails?.verified?.[0]
                || accountInfo.loginIDs?.emails?.[0]
                || ''
              const firstName = accountInfo.profile?.firstName || ''
              const lastName = accountInfo.profile?.lastName || ''
              const name = `${firstName} ${lastName}`.trim() || email.split('@')[0]

              user.isLoggedIn = true
              user.UID = accountInfo.UID
              user.name = name
              user.email = email
              user.company = accountInfo.profile?.company || ''
              user.salutation = accountInfo.profile?.gender === 'f' ? 'Ms.' : 'Mr.'
              user.businessArea = 'DEFAULT'
              user._gigyaSession = true

              localStorage.setItem('businessArea', user.businessArea)
              saveUserToSharedStorage()

              showAuthModal.value = false
              console.log('Gigya user logged in:', user.email, '| UID:', user.UID)

              trackingService.trackPageView('gigya-login-complete')

              // Set user identity for tracking (cdcUid + email)
              trackingService.setUser(user.UID, user.email);
              emarsysTracker.setCustomer(user.email);

              if (pendingCheckout.value) {
                pendingCheckout.value = false
                currentPage.value = 'checkout'
              }
            } else {
              console.error('Gigya getAccountInfo failed:', accountInfo.errorMessage)
            }
          }
        })
      }
    }

    // Handle actual login from AuthModal
    const handleLogin = async (loginData) => {
      console.log('🔐 Login attempt:', loginData)
      
      // Versuche Contact in Emarsys zu finden
      try {
        const contact = await getContactByEmail(loginData.email)
        if (contact) {
          console.log('✅ Contact found in Emarsys:', contact)
          user.name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || loginData.email.split('@')[0]
        } else {
          user.name = loginData.email.split('@')[0]
        }
      } catch (err) {
        console.log('ℹ️ Contact not found in Emarsys, continuing with login')
        user.name = loginData.email.split('@')[0]
      }
      
      // User State setzen
      user.isLoggedIn = true
      user.UID = `user_${Date.now()}`
      user.email = loginData.email
      user.company = 'Unknown Company'
      user.businessArea = loginData.businessArea || 'DEFAULT'

      // Save to localStorage
      localStorage.setItem('businessArea', user.businessArea)

      // SSO: Save to shared storage
      saveUserToSharedStorage()

      showAuthModal.value = false
      console.log('✅ [Industrial Machines] User logged in:', user.email, '| Business Area:', user.businessArea)

      // Track login
      trackingService.trackPageView('login-complete')

      // Set user identity for tracking (cdcUid + email)
      trackingService.setUser(user.UID, user.email);
      emarsysTracker.setCustomer(user.email);

      // Wenn pendingCheckout aktiv, zum Checkout weiterleiten
      if (pendingCheckout.value) {
        pendingCheckout.value = false
        currentPage.value = 'checkout'
        console.log('🛒 Redirecting to checkout after login')
      }
    }
    
    // Handle registration from AuthModal
    const handleRegister = async (registerData) => {
      console.log('📝 New registration:', registerData)

      try {
        const result = await registerUser({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          salutation: registerData.salutation,
          newsletter: registerData.newsletter,
          company: registerData.company,
          businessArea: registerData.businessArea || 'DEFAULT',
        })

        if (result.success) {
          console.log('✅ Registration complete:', result)
        } else {
          console.error('❌ Registration failed:', result.error)
        }
      } catch (err) {
        console.error('❌ Registration error:', err)
      }
      
      // Track registration in GTM
      trackingService.trackPageView('registration-complete')
      
      // Set User State (Auto-Login after Registration)
      user.isLoggedIn = true
      user.UID = `user_${Date.now()}`
      user.salutation = registerData.salutation
      user.name = `${registerData.firstName} ${registerData.lastName}`
      user.email = registerData.email
      user.company = registerData.company
      user.businessArea = registerData.businessArea || 'DEFAULT'

      // Save to localStorage
      localStorage.setItem('businessArea', user.businessArea)

      // SSO: Save to shared storage
      saveUserToSharedStorage()

      showAuthModal.value = false
      console.log('✅ [Industrial Machines] User registered and logged in:', user.name, '| Company:', user.company, '| Business Area:', user.businessArea)

      // Set user identity for tracking (cdcUid + email)
      trackingService.setUser(user.UID, user.email);
      emarsysTracker.setCustomer(user.email);

      // Track newsletter subscription if opted in
      if (registerData.newsletter) {
        console.log('📧 Newsletter subscription: Yes')
      }

      // Wenn pendingCheckout aktiv, zum Checkout weiterleiten
      if (pendingCheckout.value) {
        pendingCheckout.value = false
        currentPage.value = 'checkout'
        console.log('🛒 Redirecting to checkout after registration')
      }
    }
    
    const handleLogout = () => {
      // If Gigya session is active, logout from Gigya first
      if (user._gigyaSession && window.gigya?.socialize) {
        window.gigya.socialize.logout({
          callback: () => {
            console.log('Gigya session ended')
          }
        })
      }

      // Clear user identity for tracking
      trackingService.clearUser();
      emarsysTracker.clearCustomer();

      user.isLoggedIn = false
      user.UID = ''
      user.name = ''
      user.email = ''
      user.company = ''
      user.salutation = ''
      user.businessArea = 'DEFAULT'
      user._gigyaSession = false
      currentPage.value = 'home'
      cartItems.value = []
      showCart.value = false

      // Clean up localStorage
      localStorage.removeItem('businessArea')
      clearBikeGarage()

      // SSO: Remove from shared storage (triggers logout in other apps)
      localStorage.removeItem(SHARED_USER_KEY)

      console.log('User logged out')
    }

    // Handle settings saved
    const handleSettingsSaved = (settings) => {
      console.log('⚙️ Settings saved:', settings)

      // Update user business area if changed
      if (settings.businessArea && settings.businessArea !== user.businessArea) {
        user.businessArea = settings.businessArea
        localStorage.setItem('businessArea', settings.businessArea)

        // Update stored user
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            userData.businessArea = settings.businessArea
            localStorage.setItem('user', JSON.stringify(userData))
          } catch (e) {
            console.error('Failed to update user data:', e)
          }
        }
      }
    }

    const showCategoryModal = (industry) => {
      selectedCategory.value = industry
      showCategoryModalVisible.value = true
    }
    
    const closeCategoryModal = () => {
      showCategoryModalVisible.value = false
      selectedCategory.value = null
    }
    
    // Product modal functions
    const showProductModal = (product) => {
      selectedProduct.value = product
      showProductModalVisible.value = true

      // GTM PRODUCT VIEW TRACKING
      trackingService.trackProductView(product);

      // EMARSYS PRODUCT VIEW TRACKING
      emarsysTracker.trackView(product.id);
    }
    
    const closeProductModal = () => {
      showProductModalVisible.value = false
      selectedProduct.value = null
    }

    const addToWishlist = (product) => {
      trackingService.trackAddToWishlist(product)
      console.log('Added to wishlist:', product.productName)
    }

    // Cart functionality (B2C: keine Login-Pflicht für Cart)
    const addToCart = (product) => {
      const wasEmpty = cartItems.value.length === 0
      const existingItem = cartItems.value.find(item => item.id === product.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cartItems.value.push({ ...product, quantity: 1 })
      }
      console.log(`Added ${product.productName} to cart`)

      // Start cart abandon timer if cart was empty
      if (wasEmpty) {
        startCartAbandonTimer()
      }

      // GTM ADD TO CART TRACKING
      trackingService.trackAddToCart(product, 1, cartItems.value);

      // EMARSYS CART SYNC
      emarsysTracker.trackCart(cartItems.value);
    }
    
    const removeFromCart = (productOrId) => {
      const id = typeof productOrId === 'string' ? productOrId : productOrId.id
      const index = cartItems.value.findIndex(item => item.id === id)
      if (index > -1) {
        const removedItem = cartItems.value[index]
        cartItems.value.splice(index, 1)
        console.log(`Removed item ${id} from cart`)

        // Stop cart abandon timer if cart is now empty
        if (cartItems.value.length === 0) {
          stopCartAbandonTimer()
        }

        // Track RemoveFromCart
        trackingService.trackRemoveFromCart(removedItem, removedItem.quantity || 1, cartItems.value)

        // EMARSYS CART SYNC
        emarsysTracker.trackCart(cartItems.value);
      }
    }
    
    const updateCartQuantity = (productOrId, newQuantity) => {
      const id = typeof productOrId === 'string' ? productOrId : productOrId.id
      if (newQuantity <= 0) {
        removeFromCart(id)
      } else {
        const item = cartItems.value.find(item => item.id === id)
        if (item) {
          item.quantity = newQuantity
          console.log(`Updated quantity for ${id}: ${newQuantity}`)
        }
      }
    }
    
    const toggleCart = () => {
      showCart.value = !showCart.value
      
      // GTM CART VIEW TRACKING
      if (showCart.value && cartItems.value.length > 0) {
        trackingService.trackCartView(cartItems.value);
      }
    }
    
    const handleCheckout = () => {
      console.log('Proceeding to checkout...', cartItems.value)
      showCart.value = false

      if (user.isLoggedIn) {
        // Eingeloggter User → direkt zum Checkout
        currentPage.value = 'checkout'
      } else {
        // Nicht eingeloggt → Checkout-Optionen anzeigen
        showCheckoutOptions.value = true
      }
    }

    // Checkout als Gast
    const handleGuestCheckout = () => {
      showCheckoutOptions.value = false
      isGuestCheckout.value = true
      currentPage.value = 'checkout'
      console.log('🛒 Guest checkout started')
    }

    // Checkout mit Login
    const handleCheckoutWithLogin = () => {
      showCheckoutOptions.value = false
      pendingCheckout.value = true  // Merken dass nach Login Checkout folgen soll
      showAuthModal.value = true
    }
    
    // Order handling
    const handleOrder = (orderData) => {
      console.log('Order received:', orderData)

      // Stop cart abandon timer - order was completed
      stopCartAbandonTimer()

      // Track in CDP (order already saved in CheckoutPage)
      trackPurchase(orderData)

      // GTM PURCHASE TRACKING (loyalty data sent separately via LoyaltyActivity events)
      trackingService.trackPurchase({
        orderId: orderData.id,
        totalValue: orderData.total,
        tax: orderData.total * 0.19, // 19% German VAT
        currency: 'EUR',
        items: orderData.items
      });

      // EMARSYS PURCHASE TRACKING
      emarsysTracker.trackPurchase(orderData.id, orderData.items);

      // Update consumer metrics
      const metrics = loyaltyStorage.getConsumerMetrics(userId)
      console.log('Updated consumer metrics:', metrics)

      // Track loyalty redemption if discount was from loyalty program
      if (cartDiscount.loyaltyRedemptionId) {
        const balance = loyaltyStorage.getPointsBalance(userId)
        trackCdpLoyaltyActivity({
          cdcUid: userId,
          activityType: 'redeemPoints',
          pointsAmount: cartDiscount.value,
          pointsBalance: balance.availablePoints,
          relatedOrderId: orderData.id,
          redemptionType: cartDiscount.type,
          loyaltyTier: calculateTier(balance.lifetimePoints)
        })
        console.log('🎁 Loyalty redemption tracked for order:', orderData.id)
      }

      // Clear cart and discount
      cartItems.value = []
      removeCartDiscount()

      // Show success modal
      lastOrder.value = orderData
      showOrderSuccess.value = true
      
      // Check for tier upgrade
      checkTierUpgrade(metrics.annualSpend)
    }
    
    const handleBusinessPartnershipLoyaltyOrder = (orderData) => {
      handleOrder(orderData)
    }
    
    const checkTierUpgrade = (newAnnualSpend) => {
      // Simple tier upgrade check
      if (newAnnualSpend >= 25000) {
        setTimeout(() => {
          alert('Congratulations! You\'ve achieved Premium Partner status with 5% discounts!')
        }, 2000)
      } else if (newAnnualSpend >= 5000) {
        setTimeout(() => {
          alert('Congratulations! You\'ve achieved Business Partner status with 3% discounts!')
        }, 2000)
      }
    }

    // Handle reorder from OrderHistoryPage
    const handleReorder = (items) => {
      if (!items || items.length === 0) return
      
      console.log('Reorder items:', items)
      
      // Add items to cart
      items.forEach(item => {
        const existingItem = cartItems.value.find(i => i.id === item.id)
        if (existingItem) {
          existingItem.quantity += item.quantity || 1
        } else {
          cartItems.value.push({ ...item, quantity: item.quantity || 1 })
        }
      })
      
      // Navigate to shop and open cart
      currentPage.value = 'shop'
      showCart.value = true
    }
    
    // Handle quote submission
    const handleQuoteSubmitted = (quoteData) => {
      console.log('Quote submitted:', quoteData)
      
      // Track in GTM
      trackingService.trackPageView('quote-submitted')
      
      // Show confirmation
      alert(`Quote Request ${quoteData.referenceNumber || 'submitted'} successfully! Our team will contact you within 24 hours.`)
    }

    
    // Global testing functions
    if (typeof window !== 'undefined' && isDevelopment.value) {
      window.testOrder = () => {
        const testOrder = {
          id: `TEST-${Date.now()}`,
          total: 3500,
          discountTotal: 105,
          tier: 'partner',
          paymentTerms: 45,
          items: [{
            productName: 'Test Product',
            price: 3500,
            finalPrice: 3395,
            quantity: 1
          }]
        }
        handleOrder(testOrder)
      }

      window.resetData = () => {
        loyaltyStorage.reset(user.UID || 'demo_user')
        alert('Data reset! Reload page to see starter status.')
      }

      console.log('Test functions available: testOrder(), resetData()')
    }
    
    return {
      currentPage,
      user,
      showCategoryModalVisible,
      selectedCategory,
      cartItems,
      showCart,
      showCheckoutOptions,
      isGuestCheckout,
      pendingCheckout,
      showProductModalVisible,
      selectedProduct,
      showCookieConsent,
      showOrderSuccess,
      lastOrder,
      showAuthModal,
      showProfileModal,
      showSettingsModal,
      isDevelopment,
      handleNavigation,
      handleShowAuthModal,
      handleLogin,
      handleGigyaLogin,
      handleDemoLogin,
      handleRegister,
      handleLogout,
      closeAuthModal,
      handleSettingsSaved,
      showCategoryModal,
      closeCategoryModal,
      showProductModal,
      closeProductModal,
      addToWishlist,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      toggleCart,
      handleCheckout,
      handleGuestCheckout,
      handleCheckoutWithLogin,
      handleOrder,
      handleBusinessPartnershipLoyaltyOrder,
      handleConsentGiven,
      handleReorder,
      handleQuoteSubmitted
    }
  }
}
</script>

<style>
/* Feature Icon Wrapper - WITHOUT blue background */
.feature-icon-wrapper {
  width: 80px !important;
  height: 80px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: transparent;
  border-radius: 0;
  padding: 0;
  overflow: hidden;
}

/* Feature Pictogram Styling - FORCED sizing */
.feature-pictogram {
  width: 80px !important;
  height: 80px !important;
  max-width: 80px !important;
  max-height: 80px !important;
  object-fit: contain !important;
  object-position: center !important;
  transition: all 0.3s ease;
  display: block !important;
}

.feature-pictogram:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Service Icon Wrapper - WITHOUT blue background */
.service-icon-wrapper {
  width: 80px !important;
  height: 80px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: transparent;
  border-radius: 0;
  padding: 0;
  overflow: hidden;
}

/* Service Pictogram Styling - FORCED sizing */
.service-pictogram {
  width: 80px !important;
  height: 80px !important;
  max-width: 80px !important;
  max-height: 80px !important;
  object-fit: contain !important;
  object-position: center !important;
  transition: all 0.3s ease;
  display: block !important;
}

.service-pictogram:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Feature Card Styling */
.feature-card {
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card:hover .feature-pictogram {
  transform: scale(1.15);
}

/* Category Preview Styling */
.category-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 50%;
  overflow: hidden;
}

.category-emoji {
  font-size: 2.5rem;
}

.category-pictogram {
  width: 50px;
  height: 50px;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.categories-preview-section {
  padding: 4rem 0;
  background: #fafafa;
}

.categories-preview-cta {
  text-align: center;
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Ensure proper spacing and alignment */
.features-section-grid .feature-card,
.categories-preview-grid .sap-card {
  padding: 2.5rem 1.5rem;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.features-section-grid .feature-card .card-content,
.categories-preview-grid .sap-card .card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  width: 100%;
}

/* Center icon wrapper in categories */
.categories-preview-grid .feature-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.feature-title,
.category-title {
  color: var(--sap-blue-7);
  font-weight: 600;
  margin: 1rem 0;
  text-align: center;
  width: 100%;
}

.feature-description,
.category-description {
  color: var(--sap-gray-6);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

/* Button positioning for categories */
.categories-preview-grid .sap-btn {
  margin-top: auto;
}

/* Access Denied Styling */
.access-denied-section {
  padding: 4rem 2rem;
  text-align: center;
}

.access-denied-content {
  max-width: 400px;
  margin: 0 auto;
}

.access-denied-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Checkout Options Modal */
.checkout-options-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.checkout-options-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;
}

.checkout-options-modal .close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--sap-gray-5);
  line-height: 1;
}

.checkout-options-modal .close-btn:hover {
  color: var(--sap-gray-7);
}

.checkout-options-modal h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--sap-blue-7);
}

.checkout-options-modal p {
  margin: 0 0 1.5rem 0;
  color: var(--sap-gray-6);
}

.checkout-options-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--sap-gray-3);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.option-btn:hover {
  border-color: var(--sap-blue-6);
  background: var(--sap-blue-1);
}

.option-btn.primary {
  border-color: var(--sap-blue-6);
  background: linear-gradient(135deg, var(--sap-blue-1), white);
}

.option-btn.primary:hover {
  background: var(--sap-blue-2);
}

.option-btn .option-icon {
  font-size: 1.75rem;
}

.option-btn .option-text {
  display: flex;
  flex-direction: column;
}

.option-btn .option-text strong {
  font-size: 1rem;
  color: var(--sap-blue-7);
}

.option-btn .option-text small {
  font-size: 0.8rem;
  color: var(--sap-gray-5);
  margin-top: 0.25rem;
}
</style>