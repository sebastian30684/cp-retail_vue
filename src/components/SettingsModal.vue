<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="settings-modal">
      <!-- Close Button -->
      <button class="close-btn" @click="$emit('close')" title="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- Header -->
      <div class="modal-header">
        <div class="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Settings</h2>
        <p class="subtitle">Manage your preferences</p>
        <span v-if="cdpLoaded" class="cdp-sync-badge" title="Pre-populated from SAP CDP">CDP synced</span>
      </div>
      
      <!-- Settings Content -->
      <div class="settings-content">
        <!-- Notification Settings -->
        <div class="settings-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Notifications</h3>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Email Notifications</span>
              <span class="setting-description">Receive order confirmations and updates</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.emailNotifications">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Newsletter</span>
              <span class="setting-description">Product updates and special offers</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.newsletter">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Training Reminders</span>
              <span class="setting-description">Get notified about upcoming trainings</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.trainingReminders">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <!-- Display Settings -->
        <div class="settings-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 21H16M12 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Display</h3>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Language</span>
              <span class="setting-description">Interface language</span>
            </div>
            <select v-model="settings.language" class="setting-select">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Currency</span>
              <span class="setting-description">Default currency for prices</span>
            </div>
            <select v-model="settings.currency" class="setting-select">
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Date Format</span>
              <span class="setting-description">How dates are displayed</span>
            </div>
            <select v-model="settings.dateFormat" class="setting-select">
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        
        <!-- Privacy Settings -->
        <div class="settings-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Privacy</h3>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Analytics Tracking</span>
              <span class="setting-description">Help improve our services with usage data</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.analyticsTracking">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Personalization</span>
              <span class="setting-description">Personalized product recommendations</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.personalization">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <!-- Business Area -->
        <div class="settings-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Business Area</h3>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Region</span>
              <span class="setting-description">Your business region for localized content</span>
            </div>
            <select v-model="settings.businessArea" class="setting-select">
              <option value="DEFAULT">Global</option>
              <option value="DE">Germany</option>
              <option value="AT">Austria</option>
              <option value="CH">Switzerland</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="settings-footer">
        <button @click="resetSettings" class="reset-btn">
          Reset to Defaults
        </button>
        <div class="footer-actions">
          <button @click="$emit('close')" class="cancel-btn">
            Cancel
          </button>
          <button @click="saveSettings" class="save-btn" :disabled="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useCdpProfile } from '../composables/useCdpProfile.js'

export default {
  name: 'SettingsModal',
  props: {
    userEmail: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'settings-saved'],
  setup(props, { emit }) {
    const saving = ref(false)
    const cdpLoaded = ref(false)

    const { loadProfile, profile: cdpProfile, newsletterStatus, emailMarketingConsent } = useCdpProfile()

    const defaultSettings = {
      emailNotifications: true,
      newsletter: true,
      trainingReminders: true,
      language: 'en',
      currency: 'EUR',
      dateFormat: 'DD.MM.YYYY',
      analyticsTracking: true,
      personalization: true,
      businessArea: 'DEFAULT'
    }

    const settings = reactive({ ...defaultSettings })

    const loadSettings = async () => {
      try {
        // 1. Load from localStorage first (user's local overrides)
        const stored = localStorage.getItem('userSettings')
        if (stored) {
          const parsed = JSON.parse(stored)
          Object.assign(settings, parsed)
        }

        // Also sync business area
        const businessArea = localStorage.getItem('businessArea')
        if (businessArea) {
          settings.businessArea = businessArea
        }

        // 2. Load CDP profile for initial values (if no local override)
        if (props.userEmail) {
          await loadProfile(props.userEmail)
          if (cdpProfile.value) {
            cdpLoaded.value = true

            // Pre-populate from CDP only if no local override exists
            if (!stored) {
              const cdpLang = cdpProfile.value.correspondenceLanguage
              if (cdpLang && ['en', 'de', 'fr', 'es'].includes(cdpLang)) {
                settings.language = cdpLang
              }
              settings.newsletter = newsletterStatus.value
              settings.emailNotifications = emailMarketingConsent.value
            }
          }
        }
      } catch (err) {
        console.error('[SettingsModal] Error loading settings:', err)
      }
    }

    const saveSettings = async () => {
      saving.value = true

      try {
        // Save to localStorage
        localStorage.setItem('userSettings', JSON.stringify(settings))
        localStorage.setItem('businessArea', settings.businessArea)

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log('[SettingsModal] Settings saved:', settings)

        emit('settings-saved', { ...settings })
        emit('close')
      } catch (err) {
        console.error('[SettingsModal] Error saving settings:', err)
      } finally {
        saving.value = false
      }
    }

    const resetSettings = () => {
      if (confirm('Reset all settings to default values?')) {
        Object.assign(settings, defaultSettings)
      }
    }

    onMounted(() => {
      loadSettings()
    })

    return {
      settings,
      saving,
      cdpLoaded,
      saveSettings,
      resetSettings
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.settings-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--sap-gray-5);
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: var(--sap-gray-1);
  color: var(--sap-gray-7);
}

/* Header */
.modal-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, var(--sap-gray-1), var(--sap-gray-2));
  border-bottom: 1px solid var(--sap-gray-2);
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  color: var(--sap-blue-6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: var(--sap-gray-8);
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-header .subtitle {
  margin: 0.5rem 0 0;
  color: var(--sap-gray-6);
  font-size: 0.875rem;
}

/* Settings Content */
.settings-content {
  padding: 0.5rem 0;
}

.settings-section {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--sap-gray-2);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--sap-blue-7);
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.section-header svg {
  flex-shrink: 0;
}

/* Setting Item */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 1rem;
}

.setting-item + .setting-item {
  border-top: 1px solid var(--sap-gray-1);
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--sap-gray-8);
  margin-bottom: 0.125rem;
}

.setting-description {
  display: block;
  font-size: 0.8125rem;
  color: var(--sap-gray-5);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--sap-gray-3);
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--sap-blue-6);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* Select */
.setting-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--sap-gray-3);
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  color: var(--sap-gray-8);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  min-width: 140px;
}

.setting-select:focus {
  outline: none;
  border-color: var(--sap-blue-6);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

/* Footer */
.settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--sap-gray-1);
  border-top: 1px solid var(--sap-gray-2);
}

.reset-btn {
  background: none;
  border: none;
  color: var(--sap-gray-5);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.reset-btn:hover {
  color: var(--sap-orange-6);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.cancel-btn {
  background: white;
  border: 1px solid var(--sap-gray-3);
  color: var(--sap-gray-7);
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--sap-gray-1);
  border-color: var(--sap-gray-4);
}

.save-btn {
  background: var(--sap-blue-6);
  border: none;
  color: white;
  padding: 0.625rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: var(--sap-blue-7);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* CDP Sync Badge */
.cdp-sync-badge {
  display: inline-block;
  font-size: 0.6875rem;
  background: var(--sap-blue-6);
  color: white;
  padding: 0.1875rem 0.625rem;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 480px) {
  .settings-modal {
    max-height: 100vh;
    border-radius: 0;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .setting-select {
    width: 100%;
  }
  
  .settings-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>