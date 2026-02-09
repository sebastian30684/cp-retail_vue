<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="profile-modal">
      <!-- Close Button -->
      <button class="close-btn" @click="$emit('close')" title="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- Header -->
      <div class="modal-header">
        <div class="profile-avatar-large">
          {{ userInitial }}
        </div>
        <h2>My Profile</h2>
        <p class="subtitle">Data from SAP</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading profile from SAP</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p>{{ error }}</p>
        <button @click="fetchProfile" class="retry-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 105.64 5.64L1 10M23 14L18.36 18.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retry
        </button>
      </div>
      
      <!-- Profile Content -->
      <div v-else class="profile-content">
        <!-- Personal Information -->
        <div class="profile-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Personal Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Form of Address</label>
              <span>{{ profile.formOfAddress?.name || '–' }}</span>
            </div>
            <div class="info-item">
              <label>First Name</label>
              <span>{{ profile.firstName || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Last Name</label>
              <span>{{ profile.lastName || '–' }}</span>
            </div>
            <div class="info-item full-width">
              <label>Email</label>
              <span class="email-value">{{ profile.primaryEmail || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <span>{{ profile.primaryPhone || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Gender</label>
              <span>{{ profile.gender?.name || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Birth Date</label>
              <span>{{ formatDate(profile.birthDate) || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Marital Status</label>
              <span>{{ profile.maritalStatus?.name || '–' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Address Information -->
        <div class="profile-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Address</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Department</label>
              <span>{{ profile.address?.department || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Town</label>
              <span>{{ profile.address?.town || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Region</label>
              <span>{{ profile.address?.region || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Postal Code</label>
              <span>{{ profile.address?.postalCode || '–' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Business Information -->
        <div class="profile-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Business Information</h3>
          </div>
          <div class="info-grid">
            <div class="info-item full-width">
              <label>Business Areas</label>
              <div class="business-areas">
                <span 
                  v-for="area in profile.businessAreaIds" 
                  :key="area" 
                  class="business-area-badge"
                >
                  {{ area }}
                </span>
                <span v-if="!profile.businessAreaIds?.length" class="no-data">–</span>
              </div>
            </div>
            <div class="info-item">
              <label>Correspondence Language</label>
              <span>{{ profile.correspondenceLanguage?.name || '–' }}</span>
            </div>
            <div class="info-item">
              <label>Academic Title</label>
              <span>{{ profile.academicTitle?.name || '–' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Marketing Preferences -->
        <div class="profile-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Marketing Preferences</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Newsletter Opt-in</label>
              <span :class="['opt-status', getOptinStatus(profile.additionalSystemFields?.optin)]">
                {{ getOptinLabel(profile.additionalSystemFields?.optin) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- SAP Integration IDs -->
        <div class="profile-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.479 3.53087C19.5519 2.60383 18.2978 2.07799 16.9868 2.0666C15.6759 2.0552 14.4129 2.55918 13.47 3.47L11.75 5.18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3935 9.60706C11.7643 9.26329 11.0685 9.05886 10.3534 9.00765C9.63821 8.95643 8.92041 9.05966 8.24866 9.3102C7.5769 9.56074 6.96689 9.95296 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>SAP Integration</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>CDP ID</label>
              <span class="mono">{{ profile.primaryCDPId || 'Not linked' }}</span>
            </div>
            <div class="info-item">
              <label>CDC ID (Gigya)</label>
              <span class="mono">{{ profile.primaryCDCId || 'Not linked' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="profile-footer">
          <div class="footer-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <small>Data synced from SAP</small>
          </div>
          <button @click="fetchProfile" class="refresh-btn" title="Refresh data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 105.64 5.64L1 10M23 14L18.36 18.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'ProfileModal',
  props: {
    userEmail: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  setup(props) {
    const loading = ref(true)
    const error = ref(null)
    const profile = ref({})
    
    const userInitial = computed(() => {
      if (props.userName) {
        return props.userName.charAt(0).toUpperCase()
      }
      if (props.userEmail) {
        return props.userEmail.charAt(0).toUpperCase()
      }
      return 'U'
    })
    
    const fetchProfile = async () => {
      loading.value = true
      error.value = null

      try {
        // Mock profile data
        profile.value = {
          email: props.userEmail,
          firstName: props.userName?.split(' ')[0] || 'User',
          lastName: props.userName?.split(' ').slice(1).join(' ') || '',
          additionalSystemFields: {
            optin: '1'
          }
        }
      } catch (err) {
        console.error('[ProfileModal] Error fetching profile:', err)
        error.value = err.message || 'Failed to load profile data'
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return null
      try {
        return new Date(dateString).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch {
        return dateString
      }
    }
    
    const getOptinStatus = (optin) => {
      if (optin === '1' || optin === 1) return 'opted-in'
      if (optin === '2' || optin === 2) return 'opted-out'
      return 'unknown'
    }
    
    const getOptinLabel = (optin) => {
      if (optin === '1' || optin === 1) return 'Subscribed'
      if (optin === '2' || optin === 2) return 'Not subscribed'
      return 'Not set'
    }
    
    onMounted(() => {
      fetchProfile()
    })
    
    return {
      loading,
      error,
      profile,
      userInitial,
      fetchProfile,
      formatDate,
      getOptinStatus,
      getOptinLabel
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

.profile-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
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

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, var(--sap-blue-1), var(--sap-blue-2));
  border-bottom: 1px solid var(--sap-gray-2);
}

.profile-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sap-blue-6), var(--sap-blue-7));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
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

/* Loading State */
.loading-state {
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--sap-gray-2);
  border-top-color: var(--sap-blue-6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--sap-gray-6);
  margin: 0;
}

/* Error State */
.error-state {
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  color: var(--sap-orange-6);
  margin-bottom: 1rem;
}

.error-state p {
  color: var(--sap-gray-7);
  margin: 0 0 1.5rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--sap-blue-6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--sap-blue-7);
}

/* Profile Content */
.profile-content {
  padding: 0.5rem 0;
}

.profile-section {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--sap-gray-2);
}

.profile-section:last-of-type {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 0.75rem;
  color: var(--sap-gray-5);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 500;
}

.info-item span {
  font-size: 0.9375rem;
  color: var(--sap-gray-8);
}

.info-item .email-value {
  word-break: break-all;
}

.info-item .mono {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.8125rem;
  background: var(--sap-gray-1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* Business Areas */
.business-areas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.business-area-badge {
  background: var(--sap-blue-1);
  color: var(--sap-blue-7);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.no-data {
  color: var(--sap-gray-4);
}

/* Opt-in Status */
.opt-status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.opt-status.opted-in {
  background: var(--sap-green-1);
  color: var(--sap-green-7);
}

.opt-status.opted-out {
  background: var(--sap-gray-2);
  color: var(--sap-gray-6);
}

.opt-status.unknown {
  background: var(--sap-gray-1);
  color: var(--sap-gray-5);
}

/* Profile Footer */
.profile-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--sap-gray-1);
  border-top: 1px solid var(--sap-gray-2);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--sap-gray-5);
}

.footer-info small {
  font-size: 0.75rem;
}

.refresh-btn {
  background: none;
  border: 1px solid var(--sap-gray-3);
  color: var(--sap-gray-6);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: white;
  border-color: var(--sap-blue-6);
  color: var(--sap-blue-6);
}

/* Responsive */
@media (max-width: 480px) {
  .profile-modal {
    max-height: 100vh;
    border-radius: 0;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item.full-width {
    grid-column: 1;
  }
}
</style>