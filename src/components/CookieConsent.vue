<template>
  <Teleport to="body">
    <!-- Cookie Consent Overlay -->
    <div v-if="showCookieConsent" class="cookie-overlay">
      <div class="cookie-consent-modal">
        <div class="cookie-header">
          <h3>Privacy Settings</h3>
        </div>
        
        <div class="cookie-body">
          <div class="cookie-description">
            <p>
              We use cookies and similar technologies to offer you a better user experience and 
              improve our services. Some are technically necessary, others help us to optimize the 
              website or display advertising.
            </p>
          </div>
          
          <!-- Simple Version (Default) -->
          <div v-if="!showDetails" class="cookie-actions-simple">
            <button @click="acceptAll" class="cookie-btn cookie-btn-primary">
              Accept All
            </button>
            <button @click="showSettings" class="cookie-btn cookie-btn-secondary">
              Settings
            </button>
          </div>
          
          <!-- Detailed Settings -->
          <div v-if="showDetails" class="cookie-settings-detailed">
            <div class="cookie-categories">
              <!-- Necessary Cookies -->
              <div class="cookie-category">
                <div class="category-header">
                  <input 
                    type="checkbox" 
                    id="necessary" 
                    :checked="true" 
                    disabled 
                    class="cookie-checkbox"
                  >
                  <label for="necessary" class="category-label">
                    <strong>Necessary Cookies</strong>
                  </label>
                </div>
                <p class="category-description">
                  These cookies are technically necessary for the operation of the website.
                </p>
              </div>
              
              <!-- Analytics Cookies -->
              <div class="cookie-category">
                <div class="category-header">
                  <input 
                    type="checkbox" 
                    id="analytics" 
                    v-model="cookieSettings.analytics"
                    class="cookie-checkbox"
                  >
                  <label for="analytics" class="category-label">
                    <strong>Analytics Cookies</strong>
                  </label>
                </div>
                <p class="category-description">
                  These cookies help us understand how visitors interact with our website.
                </p>
              </div>
              
              <!-- Marketing Cookies -->
              <div class="cookie-category">
                <div class="category-header">
                  <input 
                    type="checkbox" 
                    id="marketing" 
                    v-model="cookieSettings.marketing"
                    class="cookie-checkbox"
                  >
                  <label for="marketing" class="category-label">
                    <strong>Marketing Cookies</strong>
                  </label>
                </div>
                <p class="category-description">
                  These cookies are used to display relevant advertisements.
                </p>
              </div>
            </div>
            
            <div class="cookie-actions-detailed">
              <button @click="acceptAll" class="cookie-btn cookie-btn-primary">
                Accept All
              </button>
              <button @click="hideDetails" class="cookie-btn cookie-btn-tertiary">
                Hide Details
              </button>
              <button @click="savePreferences" class="cookie-btn cookie-btn-success">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'CookieConsent',
  emits: ['consent-given'],
  setup(props, { emit }) {
    // Check localStorage BEFORE initializing ref
    const consentGiven = localStorage.getItem('cookie-consent')
    const showCookieConsent = ref(!consentGiven) // Only show if NO consent given
    const showDetails = ref(false)

    const cookieSettings = reactive({
      necessary: true, // Always true, can't be disabled
      analytics: false,
      marketing: false
    })

    // Check if user has already given consent
    onMounted(() => {
      const consentGiven = localStorage.getItem('cookie-consent')
      if (consentGiven) {
        showCookieConsent.value = false
        emit('consent-given')

        const savedSettings = JSON.parse(consentGiven)

        // Load saved settings into reactive object
        cookieSettings.analytics = savedSettings.analytics || false
        cookieSettings.marketing = savedSettings.marketing || false

        console.log('📦 Cookie Consent loaded from localStorage:', savedSettings)

        if (savedSettings.analytics || savedSettings.marketing) {
          // Ensure tracking-consent flag is also set
          localStorage.setItem('tracking-consent', 'true')
          console.log('🔄 Cookie Consent aus localStorage geladen - dispatching event...')

          // WICHTIG: Event mit kleinem Delay dispatchen, damit GTM Zeit hat zu laden
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('cookie-consent-granted', {
              detail: {
                analytics: savedSettings.analytics,
                marketing: savedSettings.marketing,
                timestamp: new Date().toISOString(),
                fromStorage: true
              }
            }))

            console.log('✅ Cookie Consent Event dispatched - Tracking aktiviert')
          }, 100)
        }
      }
    })
    
    const acceptAll = () => {
      cookieSettings.analytics = true
      cookieSettings.marketing = true
      saveConsent()
    }
    
    const savePreferences = () => {
      saveConsent()
    }
    
    const saveConsent = () => {
      // Save to localStorage
      localStorage.setItem('cookie-consent', JSON.stringify({
        necessary: cookieSettings.necessary,
        analytics: cookieSettings.analytics,
        marketing: cookieSettings.marketing,
        timestamp: new Date().toISOString()
      }))

      // NEU: Set tracking-consent for CDP compatibility (like b2b-shop)
      if (cookieSettings.analytics || cookieSettings.marketing) {
        localStorage.setItem('tracking-consent', 'true')
      }
      
      showCookieConsent.value = false
      emit('consent-given')
      
      // ========== NEU: COOKIE CONSENT EVENT DISPATCHEN ==========
      if (cookieSettings.analytics || cookieSettings.marketing) {
        document.dispatchEvent(new CustomEvent('cookie-consent-granted', {
          detail: {
            analytics: cookieSettings.analytics,
            marketing: cookieSettings.marketing,
            timestamp: new Date().toISOString()
          }
        }));
        
        console.log('✅ Cookie Consent Event dispatched - Tracking startet');
      }
      // ========== ENDE NEU ==========
      
      // Optional: Show success message
      console.log('Cookie preferences saved:', cookieSettings)
    }
    
    const showSettings = () => {
      showDetails.value = true
    }
    
    const hideDetails = () => {
      showDetails.value = false
    }
    
    return {
      showCookieConsent,
      showDetails,
      cookieSettings,
      acceptAll,
      savePreferences,
      showSettings,
      hideDetails
    }
  }
}
</script>

<style scoped>
.cookie-overlay {
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
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cookie-consent-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cookie-header {
  background: linear-gradient(135deg, var(--sap-blue-7), var(--sap-blue-9));
  color: white;
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
}

.cookie-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.cookie-body {
  padding: 2rem;
}

.cookie-description {
  margin-bottom: 2rem;
}

.cookie-description p {
  color: var(--sap-gray-7);
  line-height: 1.6;
  margin: 0;
}

.cookie-actions-simple {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cookie-categories {
  margin-bottom: 2rem;
}

.cookie-category {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
  border: 1px solid var(--sap-gray-2);
}

.category-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.cookie-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--sap-gray-4);
  border-radius: 4px;
  accent-color: var(--sap-blue-6);
  cursor: pointer;
  margin-top: 2px;
  flex-shrink: 0;
}

.cookie-checkbox:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.category-label {
  cursor: pointer;
  color: var(--sap-gray-9);
  font-size: 0.95rem;
  line-height: 1.4;
  flex: 1;
}

.category-description {
  color: var(--sap-gray-6);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  margin-left: 2.5rem;
}

.cookie-actions-detailed {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cookie-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  white-space: nowrap;
}

.cookie-btn-primary {
  background: linear-gradient(135deg, var(--sap-blue-6), var(--sap-blue-7));
  color: white;
}

.cookie-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 144, 255, 0.4);
}

.cookie-btn-secondary {
  background: transparent;
  color: var(--sap-blue-6);
  border: 2px solid var(--sap-blue-6);
}

.cookie-btn-secondary:hover {
  background: var(--sap-blue-6);
  color: white;
}

.cookie-btn-tertiary {
  background: var(--sap-gray-2);
  color: var(--sap-gray-7);
}

.cookie-btn-tertiary:hover {
  background: var(--sap-gray-3);
  color: var(--sap-gray-9);
}

.cookie-btn-success {
  background: linear-gradient(135deg, var(--sap-green-6), var(--sap-green-7));
  color: white;
}

.cookie-btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(54, 164, 29, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .cookie-consent-modal {
    max-width: 95vw;
    margin: 0.5rem;
  }
  
  .cookie-body {
    padding: 1.5rem;
  }
  
  .cookie-header {
    padding: 1rem 1.5rem;
  }
  
  .cookie-actions-simple,
  .cookie-actions-detailed {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cookie-btn {
    min-width: auto;
    width: 100%;
  }
  
  .category-description {
    margin-left: 2rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .cookie-overlay {
    padding: 0.5rem;
  }
  
  .cookie-consent-modal {
    max-height: 90vh;
  }
  
  .cookie-body {
    padding: 1rem;
  }
  
  .cookie-header {
    padding: 1rem;
  }
  
  .cookie-header h3 {
    font-size: 1.1rem;
  }
}
</style>