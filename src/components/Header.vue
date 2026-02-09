<template>
  <header class="modern-header">
    <div class="header-container">
      <!-- Left: Logo + Brand -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/2560px-SAP_2011_logo.svg.png" 
            alt="SAP" 
            class="sap-logo"
          >
        </div>
        <div class="brand-text">
          <span class="brand-main">Retail Store by SAP CX</span>
        </div>
      </div>
      
      <!-- Center: Modern Navigation -->
      <nav class="main-nav">
        <ul class="nav-menu">
          <!-- Home -->
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="navigate('home')"
              :class="['nav-link', { active: currentPage === 'home' }]"
            >
              <span class="nav-text">Home</span>
              <div class="nav-indicator"></div>
            </a>
          </li>

          <!-- Shop -->
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="navigate('shop')"
              :class="['nav-link', { active: currentPage === 'shop' }]"
            >
              <span class="nav-text">Shop</span>
              <div class="nav-indicator"></div>
            </a>
          </li>

          <!-- Brands -->
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="navigate('brands')"
              :class="['nav-link', { active: currentPage === 'brands' }]"
            >
              <span class="nav-text">Brands</span>
              <div class="nav-indicator"></div>
            </a>
          </li>

          <!-- Strava moved to profile dropdown -->

          <!-- Deals (hidden for now)
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="navigate('deals')"
              :class="['nav-link', { active: currentPage === 'deals' }]"
            >
              <span class="nav-text">Deals</span>
              <div class="nav-indicator"></div>
            </a>
          </li>
          -->

          <!-- About Us -->
          <li class="nav-item">
            <a
              href="#"
              @click.prevent="navigate('about')"
              :class="['nav-link', { active: currentPage === 'about' }]"
            >
              <span class="nav-text">About Us</span>
              <div class="nav-indicator"></div>
            </a>
          </li>

          <!-- Service Dropdown -->
          <li class="nav-item nav-dropdown" @mouseenter="showServiceDropdown = true" @mouseleave="showServiceDropdown = false">
            <a
              href="#"
              @click.prevent
              :class="['nav-link dropdown-toggle', { active: ['tracking', 'contact', 'faq', 'service-ticket'].includes(currentPage) }]"
            >
              <span class="nav-text">Service</span>
              <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="nav-indicator"></div>
            </a>
            <div v-if="showServiceDropdown" class="service-dropdown-menu">
              <a href="#" @click.prevent="navigate('tracking')" class="dropdown-item" :class="{ active: currentPage === 'tracking' }">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Track Order
              </a>
              <a href="#" @click.prevent="navigate('contact')" class="dropdown-item" :class="{ active: currentPage === 'contact' }">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Contact
              </a>
              <a href="#" @click.prevent="navigate('service-ticket')" class="dropdown-item" :class="{ active: currentPage === 'service-ticket' }">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Service Ticket
              </a>
              <a href="#" @click.prevent="navigate('faq')" class="dropdown-item" :class="{ active: currentPage === 'faq' }">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                FAQ
              </a>
            </div>
          </li>
        </ul>
      </nav>
      
      <!-- Right: Actions -->
      <div class="header-actions">
        <!-- Search Button -->
        <button class="action-btn search-btn" title="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- User Section -->
        <div v-if="!user.isLoggedIn" class="auth-section">
          <button @click="showLogin" class="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Login</span>
          </button>
        </div>
        
        <div v-else class="user-section">
          <div class="user-info">
            <div class="user-avatar">
              {{ (user.name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ user.name || user.email?.split('@')[0] }}</span>
              <span class="user-role">Professional</span>
            </div>
          </div>
          <div class="user-menu-wrapper">
            <button @click="toggleUserMenu" class="user-menu-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <!-- User Dropdown Menu -->
            <div v-if="showUserMenu" class="user-dropdown">
              <a href="#" @click.prevent="handleNavigateAndClose('order-history')" class="dropdown-item">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7H13C13.5304 7 14.0391 6.78929 14.4142 6.41421C14.7893 6.03914 15 5.53043 15 5M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 12H15M9 16H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Order History
              </a>
              <a href="#" @click.prevent="handleShowProfile" class="dropdown-item">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Profile
              </a>
              <a href="#" @click.prevent="handleShowSettings" class="dropdown-item">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Settings
              </a>

              <!-- Strava Widget -->
              <hr class="dropdown-divider">
              <a href="#" @click.prevent="handleNavigateAndClose('strava')" class="dropdown-item strava-widget-item">
                <div class="strava-widget-content">
                  <div class="strava-widget-header">
                    <svg viewBox="0 0 24 24" class="strava-widget-icon">
                      <path fill="currentColor" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    <span class="strava-widget-title">Strava</span>
                    <span v-if="stravaConnected" class="strava-connected-badge">Connected</span>
                    <span v-else class="strava-connect-badge">Connect</span>
                  </div>
                  <div v-if="stravaConnected && stravaMonthStats" class="strava-widget-stats">
                    <span class="strava-stat">{{ formatDistance(stravaMonthStats.distance || 0) }} this month</span>
                  </div>
                </div>
              </a>

              <!-- Bike Garage -->
              <hr class="dropdown-divider">
              <a href="#" @click.prevent="handleNavigateAndClose('bike-garage')" class="dropdown-item bike-garage-widget-item">
                <div class="bike-garage-widget-content">
                  <div class="bike-garage-widget-header">
                    <svg class="bike-garage-widget-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" stroke-width="2"/>
                      <path d="M5.5 17.5L8.5 7H12L15 12H18.5M12 7L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="bike-garage-widget-title">Bike Garage</span>
                    <span v-if="bikeGarageCount > 0" class="bike-garage-count-badge">{{ bikeGarageCount }}</span>
                  </div>
                </div>
              </a>

              <hr class="dropdown-divider">
              <button @click="logout" class="dropdown-item logout-item">
                <svg class="dropdown-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <!-- Cart Button (B2C: für alle User sichtbar) -->
        <button class="action-btn cart-btn" title="Shopping Cart" @click="toggleCart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.5304 17.2107 18.0391 17.5858 18.4142C17.9609 18.7893 18.4696 19 19 19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17C21 16.4696 20.7893 15.9609 20.4142 15.5858C20.0391 15.2107 19.5304 15 19 15H17ZM9 19C9 19.5523 8.55228 20 8 20C7.44772 20 7 19.5523 7 19C7 18.4477 7.44772 18 8 18C8.55228 18 9 18.4477 9 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStrava } from '../composables/useStrava'
import { useBikeGarage } from '../composables/useBikeGarage'

export default {
  name: 'Header',
  props: {
    user: {
      type: Object,
      required: true
    },
    currentPage: {
      type: String,
      required: true
    },
    cartCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['navigate', 'login', 'logout', 'toggle-cart', 'show-profile', 'show-settings'],
  setup(props, { emit }) {
    const showUserMenu = ref(false)
    const showShopDropdown = ref(false)
    const showServiceDropdown = ref(false)

    // Strava integration
    const {
      isConnected: stravaConnected,
      athlete: stravaAthlete,
      thisMonthStats: stravaMonthStats,
      initializeStrava,
      formatDistance
    } = useStrava()

    // Bike Garage integration
    const {
      bikeCount: bikeGarageCount,
      initializeBikeGarage
    } = useBikeGarage()

    onMounted(() => {
      initializeStrava()
      if (props.user?.email) {
        initializeBikeGarage(props.user.email)
      }
    })

    const navigate = (page) => {
      emit('navigate', page)
      showUserMenu.value = false
      showShopDropdown.value = false
      showServiceDropdown.value = false
    }
    
    const handleNavigateAndClose = (page) => {
      navigate(page)
    }
    
    const showLogin = () => {
      emit('login')
    }
    
    const logout = () => {
      emit('logout')
      showUserMenu.value = false
    }
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    const toggleCart = () => {
      emit('toggle-cart')
    }
    
    const handleShowProfile = () => {
      emit('show-profile')
      showUserMenu.value = false
    }
    
    const handleShowSettings = () => {
      emit('show-settings')
      showUserMenu.value = false
    }
    
    return {
      showUserMenu,
      showShopDropdown,
      showServiceDropdown,
      navigate,
      handleNavigateAndClose,
      showLogin,
      logout,
      toggleUserMenu,
      toggleCart,
      handleShowProfile,
      handleShowSettings,
      // Strava
      stravaConnected,
      stravaAthlete,
      stravaMonthStats,
      formatDistance,
      // Bike Garage
      bikeGarageCount
    }
  }
}
</script>

<style scoped>
/* Existing styles remain the same, adding new dropdown styles */

.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  margin-left: 0.25rem;
}

.nav-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.shop-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid var(--sap-gray-2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 280px;
  padding: 0.75rem 0;
  z-index: 1000;
  margin-top: 0.5rem;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--sap-gray-7);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 0;
  border: none;
  background: none;
  width: 100%;
  font-size: 0.9375rem;
  cursor: pointer;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--sap-blue-1);
  color: var(--sap-blue-7);
}

.dropdown-item.active {
  background: var(--sap-blue-6);
  color: white;
}

.dropdown-icon-svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.dropdown-item:hover .dropdown-icon-svg {
  opacity: 1;
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.dropdown-item-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.dropdown-item-text {
  flex-grow: 1;
}

.dropdown-item-title {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.3;
}

.dropdown-item-subtitle {
  display: block;
  color: var(--sap-gray-5);
  font-size: 0.75rem;
  line-height: 1.2;
  margin-top: 0.125rem;
}

.dropdown-item-badge {
  background: var(--sap-orange-6);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
}

.dropdown-item.active .dropdown-item-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.dropdown-divider {
  border: none;
  border-top: 1px solid var(--sap-gray-2);
  margin: 0.5rem 1rem;
}

.dropdown-info {
  padding: 0.5rem 1rem;
  background: var(--sap-gray-1);
  margin: 0.5rem 1rem 0;
  border-radius: 6px;
}

.dropdown-info small {
  color: var(--sap-gray-6);
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Ensure dropdown appears above other elements */
.nav-dropdown {
  z-index: 100;
}

.shop-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid var(--sap-gray-2);
  border-top: 1px solid var(--sap-gray-2);
  transform: translateX(-50%) rotate(45deg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .shop-dropdown-menu {
    left: 0;
    right: 0;
    transform: none;
    margin: 0.5rem;
    min-width: auto;
  }
  
  .shop-dropdown-menu::before {
    display: none;
  }
}

/* Request Quote CTA Button */
.nav-cta {
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.nav-cta .cta-link {
  display: inline-block;
  background: linear-gradient(135deg, var(--sap-blue-6), var(--sap-blue-7));
  color: white !important;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
  white-space: nowrap !important;
  line-height: 1.4;
}

.nav-cta .cta-link:hover {
  background: linear-gradient(135deg, var(--sap-blue-7), var(--sap-blue-8));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

.nav-cta .cta-link.active {
  background: var(--sap-blue-8);
}

/* Logout Item Styling */
.logout-item {
  color: var(--sap-orange-6) !important;
}

.logout-item:hover {
  background: var(--sap-orange-1) !important;
  color: var(--sap-orange-7) !important;
}

.logout-item .dropdown-icon-svg {
  opacity: 1;
}

/* Service Dropdown Menu */
.service-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid var(--sap-gray-2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  padding: 0.5rem 0;
  z-index: 1000;
  margin-top: 0.5rem;
  animation: dropdownFadeIn 0.2s ease-out;
}

.service-dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid var(--sap-gray-2);
  border-top: 1px solid var(--sap-gray-2);
}

.service-dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--sap-gray-7);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
  cursor: pointer;
}

.service-dropdown-menu .dropdown-item:hover {
  background: var(--sap-blue-1);
  color: var(--sap-blue-7);
}

.service-dropdown-menu .dropdown-item.active {
  background: var(--sap-blue-6);
  color: white;
}

/* Strava Widget in Dropdown */
.strava-widget-item {
  padding: 0.75rem 1rem !important;
}

.strava-widget-content {
  width: 100%;
}

.strava-widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strava-widget-icon {
  width: 18px;
  height: 18px;
  color: #FC4C02;
}

.strava-widget-title {
  font-weight: 600;
  color: var(--sap-gray-9);
}

.strava-connected-badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--sap-green-6);
  background: rgba(54, 164, 29, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.strava-connect-badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 500;
  color: #FC4C02;
  background: rgba(252, 76, 2, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.strava-widget-stats {
  margin-top: 0.35rem;
  padding-left: 26px;
}

.strava-stat {
  font-size: 0.8rem;
  color: var(--sap-gray-6);
}

.strava-widget-item:hover .strava-widget-icon {
  color: #E34402;
}

/* Bike Garage Widget in Dropdown */
.bike-garage-widget-item {
  padding: 0.75rem 1rem !important;
}

.bike-garage-widget-content {
  width: 100%;
}

.bike-garage-widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bike-garage-widget-icon {
  width: 18px;
  height: 18px;
  color: #0D6EFD;
  flex-shrink: 0;
}

.bike-garage-widget-title {
  font-weight: 600;
  color: var(--sap-gray-9);
  font-size: 0.85rem;
}

.bike-garage-count-badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0D6EFD;
  background: rgba(13, 110, 253, 0.1);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.bike-garage-widget-item:hover .bike-garage-widget-icon {
  color: #0856C9;
}
</style>