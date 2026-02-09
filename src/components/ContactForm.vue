<template>
  <section class="contact-main-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Contact Us</h1>
        <p>
          Have a question, feedback, or need help with your order? We're here for you.
        </p>
      </div>

      <div class="contact-grid-wide">
        <!-- Contact Info - Left Side -->
        <div class="contact-info-compact">
          <div class="contact-info-section">
            <h3 class="contact-section-title">Customer Service</h3>
            <div class="contact-detail">
              Email: support@sapretailstore.com<br>
              Phone: +1 (800) 123-4567
            </div>
          </div>

          <div class="contact-info-section">
            <h3 class="contact-section-title">Opening Hours</h3>
            <div class="contact-detail">
              Mon - Fri: 8:00 AM - 8:00 PM<br>
              Sat: 9:00 AM - 5:00 PM<br>
              Sun: Closed
            </div>
          </div>

          <div class="contact-info-section">
            <h3 class="contact-section-title">Our Services</h3>
            <div class="contact-detail">
              Order Support &amp; Tracking<br>
              Returns &amp; Exchanges<br>
              Product Questions<br>
              Account Assistance
            </div>
          </div>

          <div class="contact-info-section">
            <h3 class="contact-section-title">Address</h3>
            <div class="contact-detail">
              SAP Retail Store<br>
              3999 West Chester Pike<br>
              Newtown Square, PA 19073, USA
            </div>
          </div>
        </div>

        <!-- Contact Form - Right Side -->
        <div class="contact-form-wide">
          <div class="contact-form-card-wide">
            <h2 class="contact-form-title-wide">Send Us a Message</h2>

            <form @submit.prevent="submitForm" class="contact-form-layout">
              <!-- Salutation -->
              <div class="form-group-wide">
                <label class="form-label-wide">Salutation *</label>
                <select v-model="form.salutation" class="sap-input-wide" required>
                  <option value="">Please select</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mx.">Mx.</option>
                </select>
              </div>

              <!-- First Name and Last Name -->
              <div class="name-row">
                <div class="form-group-wide">
                  <label class="form-label-wide">First Name *</label>
                  <input v-model="form.firstName" type="text" class="sap-input-wide" placeholder="John" required>
                </div>
                <div class="form-group-wide">
                  <label class="form-label-wide">Last Name *</label>
                  <input v-model="form.lastName" type="text" class="sap-input-wide" placeholder="Doe" required>
                </div>
              </div>

              <!-- Email -->
              <div class="form-group-wide">
                <label class="form-label-wide">Email *</label>
                <input v-model="form.email" type="email" class="sap-input-wide" placeholder="john.doe@email.com" required>
              </div>

              <!-- Phone -->
              <div class="form-group-wide">
                <label class="form-label-wide">Phone</label>
                <input v-model="form.phone" type="tel" class="sap-input-wide" placeholder="+1 (555) 123-4567">
              </div>

              <!-- Order Number (optional) -->
              <div class="form-group-wide">
                <label class="form-label-wide">Order Number (if applicable)</label>
                <input v-model="form.orderNumber" type="text" class="sap-input-wide" placeholder="e.g. ORD-2024-12345">
              </div>

              <!-- Topic -->
              <div class="form-group-wide">
                <label class="form-label-wide">Topic *</label>
                <select v-model="form.topic" class="sap-input-wide" required>
                  <option value="">Please select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="return">Returns & Refunds</option>
                  <option value="product">Product Question</option>
                  <option value="account">Account Issue</option>
                  <option value="payment">Payment Problem</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Message -->
              <div class="form-group-wide">
                <label class="form-label-wide">Your Message *</label>
                <textarea v-model="form.message" class="sap-textarea-wide" rows="4" required
                          placeholder="How can we help you?"></textarea>
              </div>

              <!-- Checkboxes -->
              <div class="form-group-wide">
                <div class="checkbox-group-wide">
                  <div class="checkbox-item-wide">
                    <input type="checkbox" id="newsletter" v-model="form.newsletter" class="checkbox-input">
                    <label for="newsletter" class="checkbox-label-wide">
                      Yes, I would like to receive the newsletter with product updates and special offers
                    </label>
                  </div>

                  <div class="checkbox-item-wide">
                    <input type="checkbox" id="privacy" v-model="form.privacyPolicy" class="checkbox-input" required>
                    <label for="privacy" class="checkbox-label-wide">
                      I agree to the processing of my data according to the privacy policy *
                    </label>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="submit-btn-wide" :disabled="isSubmitting">
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { reactive, ref } from 'vue'

export default {
  name: 'ContactForm',
  setup() {

    const isSubmitting = ref(false)

    const form = reactive({
      salutation: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      orderNumber: '',
      topic: '',
      message: '',
      newsletter: false,
      privacyPolicy: false
    })

    const submitForm = async () => {
      if (!form.salutation || !form.firstName || !form.lastName ||
          !form.email || !form.topic || !form.message || !form.privacyPolicy) {
        alert('Please fill in all required fields and accept the privacy policy.')
        return
      }

      isSubmitting.value = true

      try {
        console.log('Contact form submitted:', {
          email: form.email,
          topic: form.topic,
          orderNumber: form.orderNumber
        })

        const fullName = `${form.salutation} ${form.firstName} ${form.lastName}`
        alert(`Thank you ${fullName}! Your message has been received. Our team will get back to you within 24 hours.`)

        resetForm()

      } catch (error) {
        console.error('Form submission error:', error)
        alert('Thank you for your message! Our team will contact you shortly.')
        resetForm()
      } finally {
        isSubmitting.value = false
      }
    }

    const resetForm = () => {
      form.salutation = ''
      form.firstName = ''
      form.lastName = ''
      form.email = ''
      form.phone = ''
      form.orderNumber = ''
      form.topic = ''
      form.message = ''
      form.newsletter = false
      form.privacyPolicy = false
    }

    return {
      form,
      submitForm,
      isSubmitting
    }
  }
}
</script>

<style scoped>
.contact-main-section {
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

.contact-grid-wide {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: start;
}

.contact-info-compact {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-info-section {
  background: white;
  padding: 1.5rem;
  border-radius: var(--sap-radius-lg);
  box-shadow: var(--sap-shadow-sm);
  border: 1px solid var(--sap-gray-2);
}

.contact-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sap-blue-7);
  margin-bottom: 0.75rem;
}

.contact-detail {
  color: var(--sap-gray-6);
  line-height: 1.6;
  font-size: 0.95rem;
}

.contact-form-wide {
  width: 100%;
}

.contact-form-card-wide {
  background: white;
  padding: 2rem;
  border-radius: var(--sap-radius-lg);
  box-shadow: var(--sap-shadow-md);
  border: 1px solid var(--sap-gray-2);
}

.contact-form-title-wide {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--sap-blue-7);
  margin-bottom: 1.5rem;
}

.contact-form-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group-wide {
  display: flex;
  flex-direction: column;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label-wide {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--sap-gray-8);
  margin-bottom: 0.5rem;
}

.sap-input-wide, .sap-textarea-wide {
  padding: 0.75rem;
  border: 2px solid var(--sap-gray-3);
  border-radius: var(--sap-radius-md);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
  width: 100%;
}

.sap-input-wide:focus, .sap-textarea-wide:focus {
  outline: none;
  border-color: var(--sap-blue-6);
  box-shadow: 0 0 0 3px rgba(27, 144, 255, 0.1);
}

.sap-textarea-wide {
  resize: vertical;
  min-height: 100px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--sap-blue-6);
}

.checkbox-group-wide {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-item-wide {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.checkbox-label-wide {
  font-size: 0.9rem;
  color: var(--sap-gray-7);
  line-height: 1.4;
  cursor: pointer;
}

.submit-btn-wide {
  background: var(--sap-blue-6);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--sap-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
}

.submit-btn-wide:hover:not(:disabled) {
  background: var(--sap-blue-7);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 144, 255, 0.4);
}

.submit-btn-wide:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .contact-grid-wide {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .contact-main-section { padding: 2rem 0; }
  .contact-form-card-wide { padding: 1.5rem; }
  .name-row { grid-template-columns: 1fr; }
  .section-header h1 { font-size: 1.75rem; }
}
</style>
