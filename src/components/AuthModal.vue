<template>
  <div class="auth-modal-overlay" @click.self="$emit('close')">
    <div class="auth-modal">
      <!-- Close Button -->
      <button class="auth-close-btn" @click="$emit('close')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Modal Header with SAP Branding -->
      <div class="auth-header">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/2560px-SAP_2011_logo.svg.png"
          alt="SAP"
          class="auth-logo"
        >
        <h2 class="auth-title">Consumer Products & Retail</h2>
      </div>

      <!-- Login Method Selection (initial screen) -->
      <div v-if="authMode === 'select'" class="auth-select">
        <p class="auth-select-subtitle">Choose how you'd like to sign in</p>

        <button class="auth-option-btn sap-identity" @click="handleSapIdentityLogin">
          <span class="auth-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V10C2 16.5 6.84 22.74 12 24C17.16 22.74 22 16.5 22 10V7L12 2ZM12 11.99H20C19.47 16.11 16.18 19.83 12 20.92V12H4V8.3L12 4.19V11.99Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="auth-option-text">
            <strong>Login with SAP Identity</strong>
            <small>Use your SAP account credentials</small>
          </span>
        </button>

        <div class="auth-divider">
          <span>or</span>
        </div>

        <button class="auth-option-btn demo-login" @click="authMode = 'demo'">
          <span class="auth-option-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="auth-option-text">
            <strong>Login with Email</strong>
            <small>Sign in or register with your email address</small>
          </span>
        </button>
      </div>

      <!-- Demo Login: Tab Navigation -->
      <div v-if="authMode === 'demo'" class="auth-tabs-wrapper">
        <button class="auth-back-btn" @click="authMode = 'select'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
        <div class="auth-tabs">
          <button
            :class="['auth-tab', { active: activeTab === 'login' }]"
            @click="activeTab = 'login'"
          >
            Login
          </button>
          <button
            :class="['auth-tab', { active: activeTab === 'register' }]"
            @click="activeTab = 'register'"
          >
            Register
          </button>
        </div>
      </div>

      <!-- Login Form (Email only - no password) -->
      <form v-if="authMode === 'demo' && activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email Address *</label>
          <input
            type="email"
            id="login-email"
            v-model="loginForm.email"
            placeholder="your.email@company.com"
            required
          >
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="loginForm.rememberMe">
            <span class="checkbox-custom"></span>
            Remember me
          </label>
        </div>

        <button type="submit" class="auth-submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">Login</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <p class="auth-switch">
          Don't have an account? 
          <a href="#" @click.prevent="activeTab = 'register'">Register now</a>
        </p>

        <!-- Demo Access Info -->
        <div class="demo-info">
          <p>For demo access, use any email address.</p>
        </div>
      </form>

      <!-- Registration Form (simplified for B2C) -->
      <form v-if="authMode === 'demo' && activeTab === 'register'" @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="reg-firstname">First Name *</label>
            <input
              type="text"
              id="reg-firstname"
              v-model="registerForm.firstName"
              placeholder="John"
              required
            >
          </div>
          <div class="form-group form-group-half">
            <label for="reg-lastname">Last Name *</label>
            <input
              type="text"
              id="reg-lastname"
              v-model="registerForm.lastName"
              placeholder="Doe"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label for="reg-email">Email Address *</label>
          <input
            type="email"
            id="reg-email"
            v-model="registerForm.email"
            placeholder="john.doe@email.com"
            required
          >
        </div>

        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="reg-country">Country *</label>
            <select id="reg-country" v-model="registerForm.country" required>
              <option value="">Please select...</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label newsletter-checkbox">
            <input type="checkbox" v-model="registerForm.newsletter">
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              Yes, I would like to receive news and updates via email.
            </span>
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label terms-checkbox">
            <input type="checkbox" v-model="registerForm.acceptTerms" required>
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              I accept the <a href="#" @click.stop>Terms & Conditions</a> and <a href="#" @click.stop>Privacy Policy</a> *
            </span>
          </label>
        </div>

        <button type="submit" class="auth-submit-btn" :disabled="isLoading || !registerForm.acceptTerms">
          <span v-if="!isLoading">Create Account</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <p class="auth-switch">
          Already registered?
          <a href="#" @click.prevent="activeTab = 'login'">Log in here</a>
        </p>
      </form>

      <!-- Success Message -->
      <div v-if="showSuccess" class="auth-success">
        <div class="success-icon">✓</div>
        <h3>{{ successTitle }}</h3>
        <p>{{ successMessage }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="auth-error">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

// Countries Configuration for B2C
const COUNTRIES = [
  { id: 'US', label: 'United States' },
  { id: 'GB', label: 'United Kingdom' },
  { id: 'DE', label: 'Germany' },
  { id: 'AT', label: 'Austria' },
  { id: 'CH', label: 'Switzerland' },
  { id: 'NL', label: 'Netherlands' },
  { id: 'BE', label: 'Belgium' },
  { id: 'FR', label: 'France' },
  { id: 'IT', label: 'Italy' },
  { id: 'ES', label: 'Spain' },
  { id: 'OTHER', label: 'Other' },
]

export default {
  name: 'AuthModal',
  emits: ['close', 'login', 'register', 'gigya-login'],
  setup(props, { emit }) {
    const authMode = ref('select') // 'select' | 'demo'
    const activeTab = ref('login')
    const isLoading = ref(false)
    const showSuccess = ref(false)
    const successTitle = ref('')
    const successMessage = ref('')
    const errorMessage = ref('')

    const countries = ref(COUNTRIES)

    const loginForm = reactive({
      email: '',
      rememberMe: false
    })

    const registerForm = reactive({
      firstName: '',
      lastName: '',
      email: '',
      country: 'US',
      newsletter: false,
      acceptTerms: false
    })

    /**
     * Handle SAP Identity Login (Gigya Screen-Set)
     */
    const handleSapIdentityLogin = () => {
      emit('close')
      if (window.gigya?.accounts) {
        window.gigya.accounts.showScreenSet({
          screenSet: 'Default-RegistrationLogin',
          startScreen: 'gigya-login-screen',
          onAfterSubmit: (response) => {
            if (!response.errorCode) {
              // Dispatch custom event that App.vue listens to
              window.dispatchEvent(new CustomEvent('gigya-login-success', { detail: response }))
            }
          }
        })
      } else {
        console.error('Gigya SDK not loaded')
      }
    }

    /**
     * Handle Login
     */
    const handleLogin = async () => {
      errorMessage.value = ''
      isLoading.value = true

      try {
        await new Promise(resolve => setTimeout(resolve, 800))

        emit('login', {
          email: loginForm.email,
          country: 'US',
          rememberMe: loginForm.rememberMe
        })

      } catch (error) {
        errorMessage.value = 'Login failed. Please try again.'
        console.error('Login error:', error)
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Handle Registration (B2C simplified)
     */
    const handleRegister = async () => {
      if (!registerForm.acceptTerms) return

      errorMessage.value = ''
      isLoading.value = true

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        emit('register', {
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          email: registerForm.email,
          country: registerForm.country,
          newsletter: registerForm.newsletter
        })

        console.log('📤 B2C Registration:', {
          name: `${registerForm.firstName} ${registerForm.lastName}`,
          country: registerForm.country
        })

        // Show success message
        successTitle.value = 'Registration successful!'
        successMessage.value = `Welcome ${registerForm.firstName}! Your account has been created.`
        showSuccess.value = true

        // Reset form and switch to login after delay
        setTimeout(() => {
          showSuccess.value = false
          activeTab.value = 'login'
          loginForm.email = registerForm.email
          resetRegisterForm()
        }, 3000)

      } catch (error) {
        errorMessage.value = 'Registration failed. Please try again.'
        console.error('Registration error:', error)
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Reset registration form
     */
    const resetRegisterForm = () => {
      Object.assign(registerForm, {
        firstName: '',
        lastName: '',
        email: '',
        country: 'US',
        newsletter: false,
        acceptTerms: false
      })
    }

    return {
      authMode,
      activeTab,
      isLoading,
      showSuccess,
      successTitle,
      successMessage,
      errorMessage,
      countries,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
      handleSapIdentityLogin
    }
  }
}
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.auth-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* Close Button */
.auth-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--sap-gray-5, #89919a);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 10;
}

.auth-close-btn:hover {
  background: var(--sap-gray-1, #f5f6f7);
  color: var(--sap-gray-7, #32363a);
}

/* Header */
.auth-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid var(--sap-gray-2, #e5e5e5);
}

.auth-logo {
  height: 32px;
  margin-bottom: 0.75rem;
}

.auth-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--sap-gray-7, #32363a);
  margin: 0;
}

/* Auth Select Screen */
.auth-select {
  padding: 1.5rem 2rem 2rem;
}

.auth-select-subtitle {
  text-align: center;
  color: var(--sap-gray-6, #6a6d70);
  font-size: 0.9375rem;
  margin: 0 0 1.5rem;
}

.auth-option-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid var(--sap-gray-3, #d1d1d1);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.auth-option-btn:hover {
  border-color: var(--sap-blue-6, #0070f2);
  background: rgba(0, 112, 242, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.auth-option-btn.sap-identity {
  border-color: var(--sap-blue-6, #0070f2);
  background: linear-gradient(135deg, rgba(0, 112, 242, 0.06), white);
}

.auth-option-btn.sap-identity:hover {
  background: rgba(0, 112, 242, 0.1);
}

.auth-option-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.auth-option-btn.sap-identity .auth-option-icon {
  background: rgba(0, 112, 242, 0.1);
  color: var(--sap-blue-6, #0070f2);
}

.auth-option-btn.demo-login .auth-option-icon {
  background: var(--sap-gray-1, #f5f6f7);
  color: var(--sap-gray-6, #6a6d70);
}

.auth-option-text {
  display: flex;
  flex-direction: column;
}

.auth-option-text strong {
  font-size: 0.9375rem;
  color: var(--sap-gray-7, #32363a);
}

.auth-option-text small {
  font-size: 0.8125rem;
  color: var(--sap-gray-5, #89919a);
  margin-top: 0.25rem;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.25rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--sap-gray-2, #e5e5e5);
}

.auth-divider span {
  padding: 0 1rem;
  font-size: 0.8125rem;
  color: var(--sap-gray-5, #89919a);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Back Button & Tabs Wrapper */
.auth-tabs-wrapper {
  border-bottom: 2px solid var(--sap-gray-2, #e5e5e5);
}

.auth-back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem 0;
  background: none;
  border: none;
  font-size: 0.8125rem;
  color: var(--sap-gray-5, #89919a);
  cursor: pointer;
  transition: color 0.2s ease;
}

.auth-back-btn:hover {
  color: var(--sap-blue-6, #0070f2);
}

/* Tabs */
.auth-tabs {
  display: flex;
}

.auth-tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--sap-gray-5, #89919a);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.auth-tab:hover {
  color: var(--sap-blue-6, #0070f2);
}

.auth-tab.active {
  color: var(--sap-blue-6, #0070f2);
}

.auth-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--sap-blue-6, #0070f2);
}

/* Form */
.auth-form {
  padding: 1.5rem 2rem 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group-half {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sap-gray-7, #32363a);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--sap-gray-3, #d1d1d1);
  border-radius: 8px;
  font-size: 0.9375rem;
  color: var(--sap-gray-7, #32363a);
  transition: all 0.2s ease;
  box-sizing: border-box;
  background-color: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--sap-blue-6, #0070f2);
  box-shadow: 0 0 0 3px rgba(0, 112, 242, 0.15);
}

.form-group input::placeholder {
  color: var(--sap-gray-4, #a9a9a9);
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--sap-gray-5, #89919a);
  margin-top: 0.375rem;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--sap-gray-6, #6a6d70);
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: 2px solid var(--sap-gray-4, #a9a9a9);
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: 1px;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--sap-blue-6, #0070f2);
  border-color: var(--sap-blue-6, #0070f2);
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  flex: 1;
}

.checkbox-text a {
  color: var(--sap-blue-6, #0070f2);
  text-decoration: none;
}

.checkbox-text a:hover {
  text-decoration: underline;
}

.newsletter-checkbox,
.terms-checkbox {
  margin-top: 0.5rem;
}

/* Form Options (Remember me) */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Submit Button */
.auth-submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--sap-blue-6, #0070f2), var(--sap-blue-7, #0063d8));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.auth-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--sap-blue-7, #0063d8), var(--sap-blue-8, #0057be));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 112, 242, 0.3);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Switch Link */
.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--sap-gray-6, #6a6d70);
}

.auth-switch a {
  color: var(--sap-blue-6, #0070f2);
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}

/* Demo Info */
.demo-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--sap-gray-1, #f5f6f7);
  border-radius: 8px;
  text-align: center;
}

.demo-info p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--sap-gray-6, #6a6d70);
}

/* Success Message */
.auth-success {
  padding: 3rem 2rem;
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--sap-green-6, #36a41d), var(--sap-green-7, #2d8a19));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 28px;
  color: white;
}

.auth-success h3 {
  font-size: 1.25rem;
  color: var(--sap-gray-7, #32363a);
  margin: 0 0 0.5rem;
}

.auth-success p {
  color: var(--sap-gray-6, #6a6d70);
  margin: 0;
  line-height: 1.5;
}

/* Error Message */
.auth-error {
  padding: 1rem 2rem;
  background: #fff0f0;
  border-top: 1px solid #ffcccc;
}

.auth-error p {
  margin: 0;
  color: #c41e3a;
  font-size: 0.875rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 520px) {
  .auth-modal {
    max-width: 100%;
    margin: 0;
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .auth-form {
    padding: 1.25rem 1.5rem 1.5rem;
  }
  
  .auth-header {
    padding: 1.5rem 1.5rem 1rem;
  }
}
</style>