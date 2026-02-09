<template>
  <section class="service-ticket-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Pick your service</h1>
        <p>Select the service you need and we'll connect you with the right experts.</p>
      </div>

      <div class="ticket-layout">
        <!-- Ticket Form -->
        <div class="ticket-form-area">
          <div class="ticket-form-card">
            <h2 class="ticket-form-title">New Service Ticket</h2>

            <!-- Logged-in User Info Banner -->
            <div v-if="isLoggedIn" class="user-info-banner">
              <div class="user-avatar">{{ userInitials }}</div>
              <div class="user-details">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
              <span class="logged-in-badge">Logged In</span>
            </div>

            <form @submit.prevent="submitTicket" class="ticket-form">
              <!-- Contact Info Row - Only show for guests -->
              <template v-if="!isLoggedIn">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name *</label>
                    <input v-model="ticket.firstName" type="text" placeholder="John" required>
                  </div>
                  <div class="form-group">
                    <label>Last Name *</label>
                    <input v-model="ticket.lastName" type="text" placeholder="Doe" required>
                  </div>
                </div>

                <div class="form-group">
                  <label>Email *</label>
                  <input v-model="ticket.email" type="email" placeholder="john.doe@email.com" required>
                </div>

                <div class="form-group">
                  <label>Phone</label>
                  <input v-model="ticket.phone" type="tel" placeholder="+1 (555) 123-4567">
                </div>
              </template>

              <!-- Category - Moved up for smart dependencies -->
              <div class="form-group">
                <label>Category *</label>
                <select v-model="ticket.category" required>
                  <option value="">Please select a service</option>
                  <option value="buying-fitting-advice">Buying and fitting advice</option>
                  <option value="repairs-servicing">Repairs and servicing</option>
                  <option value="test-bikes">Test bikes</option>
                  <option value="bike-rental">Bike rental</option>
                  <option value="collect-ride">Collect &amp; Ride - Local experts assemble and hand over your bike</option>
                  <option value="new-bike-day">New Bike Day - Canyon experts build and hand over your bike</option>
                  <option value="new-bike-pickup">New bike pick-up</option>
                  <option value="suspension-servicing">Suspension servicing</option>
                  <option value="wheel-building">Wheel building</option>
                  <option value="mobile-repairs">Mobile repairs and servicing</option>
                  <option value="bike-fitting">Bike fitting</option>
                  <option value="velofix">Velofix - A mobile service for assembly</option>
                  <option value="bike-boxing-shipping">Bike boxing and shipping</option>
                  <option value="ebike-battery-disposal">E-bike battery disposal</option>
                </select>
              </div>

              <!-- Bike Selection - For logged-in users, loaded from CDP -->
              <div class="form-group" v-if="isLoggedIn">
                <label>Your Bike <span class="optional-hint">(optional)</span></label>
                <div v-if="bikesLoading" class="bike-loading">Loading bikes...</div>
                <select v-else-if="hasBikes" v-model="ticket.bikeId">
                  <option value="">Select a bike...</option>
                  <option v-for="bike in bikes" :key="bike.accountID" :value="bike.accountID">
                    {{ bike.accountID }} - {{ bike.accountName }}
                  </option>
                </select>
                <p v-else class="no-bikes-hint">No bikes found in your garage.</p>
              </div>

              <!-- Priority -->
              <div class="form-group">
                <label>Priority *</label>
                <div class="priority-options">
                  <label class="priority-option" :class="{ active: ticket.priority === 'low' }">
                    <input type="radio" v-model="ticket.priority" value="low" required>
                    <span class="priority-badge priority-low">Low</span>
                    <span class="priority-desc">General inquiry, no urgency</span>
                  </label>
                  <label class="priority-option" :class="{ active: ticket.priority === 'medium' }">
                    <input type="radio" v-model="ticket.priority" value="medium">
                    <span class="priority-badge priority-medium">Medium</span>
                    <span class="priority-desc">Needs attention within a few days</span>
                  </label>
                  <label class="priority-option" :class="{ active: ticket.priority === 'high' }">
                    <input type="radio" v-model="ticket.priority" value="high">
                    <span class="priority-badge priority-high">High</span>
                    <span class="priority-desc">Urgent, affecting my order</span>
                  </label>
                </div>
              </div>

              <!-- Subject - Now optional -->
              <div class="form-group">
                <label>Subject <span class="optional-hint">(optional)</span></label>
                <input v-model="ticket.subject" type="text" placeholder="Brief description of the issue">
              </div>

              <!-- Description -->
              <div class="form-group">
                <label>Description *</label>
                <textarea
                  v-model="ticket.description"
                  rows="5"
                  required
                  placeholder="Please describe the issue in detail. Include any relevant information such as product names, quantities, error messages, etc."
                ></textarea>
              </div>

              <!-- File Upload Hint -->
              <div class="form-group">
                <label>Attachments</label>
                <div class="file-upload-area">
                  <div class="upload-placeholder">
                    <span class="upload-icon">📎</span>
                    <p>File upload will be available after ticket creation.<br>You can attach photos or documents via the confirmation email.</p>
                  </div>
                </div>
              </div>

              <!-- Privacy -->
              <div class="form-group">
                <label class="checkbox-option">
                  <input type="checkbox" v-model="ticket.acceptPrivacy" required>
                  <span>I agree to the processing of my data according to the <a href="#" @click.prevent>privacy policy</a> *</span>
                </label>
              </div>

              <!-- Submit -->
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <span v-if="isSubmitting">Creating Ticket...</span>
                <span v-else>Create Service Ticket</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="ticket-sidebar">
          <!-- How It Works -->
          <div class="sidebar-card">
            <h3>How It Works</h3>
            <div class="steps-list">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-text">
                  <strong>Submit your ticket</strong>
                  <p>Fill out the form with details about your issue.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-text">
                  <strong>Receive confirmation</strong>
                  <p>You'll get a ticket number and confirmation email.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-text">
                  <strong>We investigate</strong>
                  <p>Our team reviews your case and takes action.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-text">
                  <strong>Resolution</strong>
                  <p>We'll contact you with a solution or next steps.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Response Times -->
          <div class="sidebar-card response-times">
            <h3>Expected Response Times</h3>
            <div class="response-item">
              <span class="response-priority priority-high">High</span>
              <span class="response-time">Within 4 hours</span>
            </div>
            <div class="response-item">
              <span class="response-priority priority-medium">Medium</span>
              <span class="response-time">Within 24 hours</span>
            </div>
            <div class="response-item">
              <span class="response-priority priority-low">Low</span>
              <span class="response-time">Within 48 hours</span>
            </div>
          </div>

          <!-- Need Immediate Help -->
          <div class="sidebar-card help-card">
            <h3>Need Immediate Help?</h3>
            <p>For urgent matters, contact us directly:</p>
            <p><strong>Phone:</strong> +1 (800) 123-4567</p>
            <p><strong>Email:</strong> support@sapretailstore.com</p>
            <p class="hours">Mon - Fri: 8:00 AM - 8:00 PM</p>
          </div>
        </div>
      </div>

      <!-- Ticket Confirmation (shown after submission) -->
      <div v-if="submittedTicket" class="ticket-confirmation">
        <div class="confirmation-card">
          <div class="confirmation-icon">✓</div>
          <h2>Ticket Created Successfully!</h2>
          <div class="ticket-details">
            <div class="ticket-detail-item">
              <span class="detail-label">Ticket Number</span>
              <span class="detail-value ticket-number">{{ submittedTicket.ticketId }}</span>
            </div>
            <div class="ticket-detail-item">
              <span class="detail-label">Category</span>
              <span class="detail-value">{{ getCategoryLabel(submittedTicket.category) }}</span>
            </div>
            <div class="ticket-detail-item">
              <span class="detail-label">Priority</span>
              <span class="detail-value">
                <span class="priority-badge" :class="'priority-' + submittedTicket.priority">
                  {{ submittedTicket.priority.charAt(0).toUpperCase() + submittedTicket.priority.slice(1) }}
                </span>
              </span>
            </div>
            <div class="ticket-detail-item">
              <span class="detail-label">Subject</span>
              <span class="detail-value">{{ submittedTicket.subject }}</span>
            </div>
          </div>
          <p class="confirmation-message">
            A confirmation email has been sent to <strong>{{ submittedTicket.email }}</strong>.
            Our support team will review your ticket and respond within the expected timeframe.
          </p>
          <button @click="submittedTicket = null" class="new-ticket-btn">Create Another Ticket</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { reactive, ref, computed, inject, onMounted } from 'vue'
import trackingService from '@/utils/tracking-service'
import { useBikeGarage } from '@/composables/useBikeGarage'

export default {
  name: 'ServiceTicketSection',
  setup() {
    const user = inject('user', { UID: '', isLoggedIn: false, name: '', email: '' })

    const isSubmitting = ref(false)
    const submittedTicket = ref(null)

    const { bikes, hasBikes, isLoading: bikesLoading, initializeBikeGarage } = useBikeGarage()

    const ticket = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      category: '',
      bikeId: '',
      priority: '',
      subject: '',
      description: '',
      acceptPrivacy: false
    })

    // Computed properties
    const isLoggedIn = computed(() => user.isLoggedIn)

    const userInitials = computed(() => {
      if (!user.name) return '?'
      const parts = user.name.split(' ')
      return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
    })

    const categoryLabels = {
      'buying-fitting-advice': 'Buying and fitting advice',
      'repairs-servicing': 'Repairs and servicing',
      'test-bikes': 'Test bikes',
      'bike-rental': 'Bike rental',
      'collect-ride': 'Collect & Ride',
      'new-bike-day': 'New Bike Day',
      'new-bike-pickup': 'New bike pick-up',
      'suspension-servicing': 'Suspension servicing',
      'wheel-building': 'Wheel building',
      'mobile-repairs': 'Mobile repairs and servicing',
      'bike-fitting': 'Bike fitting',
      'velofix': 'Velofix',
      'bike-boxing-shipping': 'Bike boxing and shipping',
      'ebike-battery-disposal': 'E-bike battery disposal'
    }

    const getCategoryLabel = (value) => categoryLabels[value] || value

    const generateTicketId = () => {
      const prefix = 'TKT'
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      return `${prefix}-${timestamp}-${random}`
    }

    // Load bike data from CDP on mount
    onMounted(async () => {
      if (user.isLoggedIn && user.email) {
        await initializeBikeGarage(user.email)
      }
    })

    const submitTicket = async () => {
      // Validation for guests
      if (!isLoggedIn.value) {
        if (!ticket.firstName || !ticket.lastName || !ticket.email) {
          alert('Please fill in your contact information.')
          return
        }
      }

      // Common validation
      if (!ticket.category || !ticket.priority || !ticket.description || !ticket.acceptPrivacy) {
        alert('Please fill in all required fields and accept the privacy policy.')
        return
      }

      isSubmitting.value = true

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Resolve bike name from selected bike
        const selectedBike = ticket.bikeId
          ? bikes.value.find(b => b.accountID === ticket.bikeId)
          : null

        const ticketData = {
          ticketId: generateTicketId(),
          // Use logged-in user data or form data
          firstName: isLoggedIn.value ? user.name?.split(' ')[0] || '' : ticket.firstName,
          lastName: isLoggedIn.value ? user.name?.split(' ').slice(1).join(' ') || '' : ticket.lastName,
          email: isLoggedIn.value ? user.email : ticket.email,
          phone: ticket.phone,
          category: ticket.category,
          priority: ticket.priority,
          subject: ticket.subject || getCategoryLabel(ticket.category),
          description: ticket.description,
          bike_id: ticket.bikeId || '',
          bikeName: selectedBike?.accountName || '',
          status: 'open',
          createdAt: new Date().toISOString()
        }

        // Track service ticket submission in CDP and GTM
        trackingService.trackServiceTicket(ticketData)

        console.log('Service ticket created:', ticketData)

        submittedTicket.value = ticketData

        // Reset form
        resetForm()

        // Scroll to confirmation
        setTimeout(() => {
          const confirmation = document.querySelector('.ticket-confirmation')
          if (confirmation) {
            confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)

      } catch (error) {
        console.error('Ticket creation error:', error)
        alert('There was an error creating your ticket. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    const resetForm = () => {
      ticket.firstName = ''
      ticket.lastName = ''
      ticket.email = ''
      ticket.phone = ''
      ticket.category = ''
      ticket.bikeId = ''
      ticket.priority = ''
      ticket.subject = ''
      ticket.description = ''
      ticket.acceptPrivacy = false
    }

    return {
      user,
      ticket,
      isSubmitting,
      submittedTicket,
      isLoggedIn,
      userInitials,
      bikes,
      hasBikes,
      bikesLoading,
      submitTicket,
      getCategoryLabel
    }
  }
}
</script>

<style scoped>
.service-ticket-section {
  padding: 3rem 0;
  background: var(--sap-gray-1);
  min-height: 100vh;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--sap-blue-7);
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--sap-gray-6);
  max-width: 600px;
  margin: 0 auto;
}

.ticket-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* Ticket Form */
.ticket-form-card {
  background: white;
  padding: 2rem;
  border-radius: var(--sap-radius-lg);
  box-shadow: var(--sap-shadow-md);
  border: 1px solid var(--sap-gray-2);
}

.ticket-form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--sap-blue-7);
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--sap-gray-2);
}

/* User Info Banner for logged-in users */
.user-info-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid var(--sap-blue-2);
  border-radius: var(--sap-radius-md);
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--sap-blue-6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--sap-gray-8);
}

.user-email {
  font-size: 0.85rem;
  color: var(--sap-gray-6);
}

.logged-in-badge {
  padding: 0.25rem 0.75rem;
  background: var(--sap-green-6);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Manual input field */
.manual-input {
  margin-top: 0.5rem;
}

/* Optional hint */
.optional-hint {
  font-weight: 400;
  color: var(--sap-gray-5);
  font-size: 0.85rem;
}

/* Bike loading and hint */
.bike-loading {
  padding: 0.75rem;
  color: var(--sap-gray-5);
  font-size: 0.9rem;
  font-style: italic;
}

.no-bikes-hint {
  margin: 0;
  padding: 0.5rem 0;
  color: var(--sap-gray-5);
  font-size: 0.85rem;
}

.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--sap-gray-8);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid var(--sap-gray-3);
  border-radius: var(--sap-radius-md);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  width: 100%;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--sap-blue-6);
  box-shadow: 0 0 0 3px rgba(27, 144, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

/* Priority Options */
.priority-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--sap-gray-3);
  border-radius: var(--sap-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-option:hover {
  border-color: var(--sap-blue-4);
  background: var(--sap-blue-1);
}

.priority-option.active {
  border-color: var(--sap-blue-6);
  background: var(--sap-blue-1);
}

.priority-option input[type="radio"] {
  display: none;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.priority-low {
  background: #dbeafe;
  color: #2563eb;
}

.priority-medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-desc {
  font-size: 0.85rem;
  color: var(--sap-gray-6);
}

/* File Upload */
.file-upload-area {
  border: 2px dashed var(--sap-gray-3);
  border-radius: var(--sap-radius-md);
  padding: 1.5rem;
  text-align: center;
}

.upload-placeholder {
  color: var(--sap-gray-5);
}

.upload-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.upload-placeholder p {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}

/* Checkbox */
.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--sap-gray-7);
  line-height: 1.4;
}

.checkbox-option input[type="checkbox"] {
  margin-top: 0.2rem;
  width: 16px;
  height: 16px;
  accent-color: var(--sap-blue-6);
}

.checkbox-option a {
  color: var(--sap-blue-6);
  text-decoration: none;
}

.checkbox-option a:hover {
  text-decoration: underline;
}

/* Submit Button */
.submit-btn {
  background: var(--sap-blue-6);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--sap-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--sap-blue-7);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 144, 255, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Sidebar */
.ticket-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
}

.sidebar-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--sap-radius-lg);
  box-shadow: var(--sap-shadow-sm);
  border: 1px solid var(--sap-gray-2);
}

.sidebar-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sap-blue-7);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--sap-gray-2);
}

/* Steps */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sap-blue-6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-text strong {
  display: block;
  color: var(--sap-gray-8);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.step-text p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--sap-gray-6);
  line-height: 1.4;
}

/* Response Times */
.response-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--sap-gray-2);
}

.response-item:last-child {
  border-bottom: none;
}

.response-priority {
  padding: 0.2rem 0.6rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.response-time {
  font-size: 0.875rem;
  color: var(--sap-gray-7);
  font-weight: 500;
}

/* Help Card */
.help-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid var(--sap-blue-2);
}

.help-card h3 {
  border-bottom-color: var(--sap-blue-2);
}

.help-card p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--sap-gray-7);
}

.help-card .hours {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--sap-gray-5);
}

/* Confirmation */
.ticket-confirmation {
  margin-top: 3rem;
}

.confirmation-card {
  background: white;
  padding: 3rem;
  border-radius: var(--sap-radius-lg);
  box-shadow: var(--sap-shadow-md);
  border: 1px solid var(--sap-gray-2);
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.confirmation-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.confirmation-card h2 {
  color: var(--sap-green-7);
  margin-bottom: 1.5rem;
}

.ticket-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.ticket-detail-item {
  background: var(--sap-gray-1);
  padding: 1rem;
  border-radius: 8px;
}

.detail-label {
  display: block;
  font-size: 0.75rem;
  color: var(--sap-gray-5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 600;
  color: var(--sap-gray-8);
}

.ticket-number {
  font-size: 1.1rem;
  color: var(--sap-blue-7);
  font-family: monospace;
}

.confirmation-message {
  color: var(--sap-gray-6);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.new-ticket-btn {
  background: var(--sap-blue-6);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--sap-radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-ticket-btn:hover {
  background: var(--sap-blue-7);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .ticket-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .ticket-sidebar {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-card {
    flex: 1;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .service-ticket-section { padding: 2rem 0; }
  .ticket-form-card { padding: 1.5rem; }
  .form-row { grid-template-columns: 1fr; }
  .section-header h1 { font-size: 1.75rem; }
  .ticket-details { grid-template-columns: 1fr; }
  .confirmation-card { padding: 2rem 1.5rem; }

  .ticket-sidebar {
    flex-direction: column;
  }
}
</style>
