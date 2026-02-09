<template>
  <section class="tracking-main-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Track Your Order</h1>
        <p>Follow the status of your order in real-time</p>
      </div>

      <!-- Tracking Input -->
      <div class="tracking-search-card">
        <div class="tracking-input-group">
          <label for="tracking-number">Order Number or Tracking Code</label>
          <div class="input-with-button">
            <input
              id="tracking-number"
              v-model="trackingNumber"
              type="text"
              class="sap-input"
              placeholder="e.g. ORD-2024-12345 or DHL-123456789"
              @keyup.enter="searchTracking"
            />
            <button @click="searchTracking" class="sap-btn sap-btn-primary" :disabled="isLoading">
              <span v-if="isLoading">Searching...</span>
              <span v-else>Search</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="tracking-error">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>

      <!-- Tracking Result -->
      <div v-if="trackingResult" class="tracking-result-card">
        <div class="tracking-header">
          <div class="order-info">
            <h2>Order {{ trackingResult.orderId }}</h2>
            <span class="order-date">Ordered on {{ formatDate(trackingResult.orderDate) }}</span>
          </div>
          <div class="status-badge" :class="'status-' + trackingResult.status">
            {{ getStatusText(trackingResult.status) }}
          </div>
        </div>

        <!-- Progress Timeline -->
        <div class="tracking-timeline">
          <div
            v-for="(step, index) in trackingSteps"
            :key="step.id"
            class="timeline-step"
            :class="{
              'completed': isStepCompleted(step.id, trackingResult.status),
              'active': isStepActive(step.id, trackingResult.status)
            }"
          >
            <div class="step-icon">
              <span v-if="isStepCompleted(step.id, trackingResult.status)">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
              <span v-if="getStepDate(step.id, trackingResult)" class="step-date">
                {{ getStepDate(step.id, trackingResult) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="delivery-details">
          <h3>Delivery Details</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Shipping Method</span>
              <span class="detail-value">{{ trackingResult.shippingMethod }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Carrier</span>
              <span class="detail-value">{{ trackingResult.carrier }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tracking No.</span>
              <span class="detail-value">{{ trackingResult.carrierTrackingId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Estimated Delivery</span>
              <span class="detail-value highlight">{{ formatDate(trackingResult.estimatedDelivery) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="delivery-address">
          <h3>Delivery Address</h3>
          <p>{{ trackingResult.deliveryAddress.name }}</p>
          <p>{{ trackingResult.deliveryAddress.street }}</p>
          <p>{{ trackingResult.deliveryAddress.zip }} {{ trackingResult.deliveryAddress.city }}</p>
        </div>
      </div>

      <!-- Demo Hint -->
      <div class="demo-hint">
        <p><strong>Demo order numbers for testing:</strong></p>
        <div class="demo-codes">
          <button @click="setDemoCode('ORD-2024-001')" class="demo-code-btn">ORD-2024-001</button>
          <button @click="setDemoCode('ORD-2024-002')" class="demo-code-btn">ORD-2024-002</button>
          <button @click="setDemoCode('ORD-2024-003')" class="demo-code-btn">ORD-2024-003</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TrackingSection',
  setup() {
    const trackingNumber = ref('')
    const trackingResult = ref(null)
    const isLoading = ref(false)
    const error = ref('')

    const trackingSteps = [
      { id: 'ordered', title: 'Ordered', description: 'Order received' },
      { id: 'processing', title: 'Processing', description: 'Being prepared for shipping' },
      { id: 'shipped', title: 'Shipped', description: 'Package is on its way' },
      { id: 'out_for_delivery', title: 'Out for Delivery', description: 'Will be delivered today' },
      { id: 'delivered', title: 'Delivered', description: 'Successfully delivered' }
    ]

    // Demo tracking data
    const demoTrackings = {
      'ORD-2024-001': {
        orderId: 'ORD-2024-001',
        orderDate: '2024-12-28T10:30:00Z',
        status: 'shipped',
        shippingMethod: 'Express',
        carrier: 'DHL',
        carrierTrackingId: 'DHL-JJD000390007123456',
        estimatedDelivery: '2025-01-04T18:00:00Z',
        deliveryAddress: {
          name: 'John Doe',
          street: '123 Main Street',
          zip: '10001',
          city: 'New York'
        },
        events: {
          ordered: '2024-12-28T10:30:00Z',
          processing: '2024-12-28T14:00:00Z',
          shipped: '2024-12-30T09:15:00Z'
        }
      },
      'ORD-2024-002': {
        orderId: 'ORD-2024-002',
        orderDate: '2024-12-30T14:22:00Z',
        status: 'processing',
        shippingMethod: 'Standard',
        carrier: 'DPD',
        carrierTrackingId: 'To be assigned...',
        estimatedDelivery: '2025-01-06T18:00:00Z',
        deliveryAddress: {
          name: 'Jane Smith',
          street: '45 Oak Avenue',
          zip: '90210',
          city: 'Los Angeles'
        },
        events: {
          ordered: '2024-12-30T14:22:00Z',
          processing: '2024-12-31T08:00:00Z'
        }
      },
      'ORD-2024-003': {
        orderId: 'ORD-2024-003',
        orderDate: '2024-12-20T09:00:00Z',
        status: 'delivered',
        shippingMethod: 'Express',
        carrier: 'UPS',
        carrierTrackingId: 'UPS-1Z999AA10123456784',
        estimatedDelivery: '2024-12-23T14:00:00Z',
        deliveryAddress: {
          name: 'Robert Wilson',
          street: '7 Elm Drive',
          zip: '60601',
          city: 'Chicago'
        },
        events: {
          ordered: '2024-12-20T09:00:00Z',
          processing: '2024-12-20T11:30:00Z',
          shipped: '2024-12-21T08:00:00Z',
          out_for_delivery: '2024-12-23T07:00:00Z',
          delivered: '2024-12-23T13:45:00Z'
        }
      }
    }

    const searchTracking = async () => {
      if (!trackingNumber.value.trim()) {
        error.value = 'Please enter an order number.'
        return
      }

      isLoading.value = true
      error.value = ''
      trackingResult.value = null

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const result = demoTrackings[trackingNumber.value.trim().toUpperCase()]

      if (result) {
        trackingResult.value = result
      } else {
        error.value = 'No shipment found with this number. Please check your input.'
      }

      isLoading.value = false
    }

    const setDemoCode = (code) => {
      trackingNumber.value = code
      searchTracking()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const getStatusText = (status) => {
      const statusMap = {
        ordered: 'Ordered',
        processing: 'Processing',
        shipped: 'Shipped',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered'
      }
      return statusMap[status] || status
    }

    const isStepCompleted = (stepId, currentStatus) => {
      const order = ['ordered', 'processing', 'shipped', 'out_for_delivery', 'delivered']
      const stepIndex = order.indexOf(stepId)
      const currentIndex = order.indexOf(currentStatus)
      return stepIndex < currentIndex
    }

    const isStepActive = (stepId, currentStatus) => {
      return stepId === currentStatus
    }

    const getStepDate = (stepId, tracking) => {
      if (tracking.events && tracking.events[stepId]) {
        const date = new Date(tracking.events[stepId])
        return date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      return null
    }

    return {
      trackingNumber,
      trackingResult,
      isLoading,
      error,
      trackingSteps,
      searchTracking,
      setDemoCode,
      formatDate,
      getStatusText,
      isStepCompleted,
      isStepActive,
      getStepDate
    }
  }
}
</script>

<style scoped>
.tracking-main-section {
  padding: 4rem 0;
  min-height: 80vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h1 {
  font-size: 2.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.tracking-search-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.tracking-input-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.input-with-button {
  display: flex;
  gap: 1rem;
}

.input-with-button .sap-input {
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.input-with-button .sap-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-with-button .sap-btn {
  padding: 0.875rem 2rem;
  white-space: nowrap;
}

.tracking-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 700px;
  margin: 0 auto 2rem;
}

.tracking-result-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 0 auto 2rem;
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-info h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.order-date {
  color: #6b7280;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-ordered { background: #e0e7ff; color: #4338ca; }
.status-processing { background: #fef3c7; color: #d97706; }
.status-shipped { background: #dbeafe; color: #2563eb; }
.status-out_for_delivery { background: #d1fae5; color: #059669; }
.status-delivered { background: #dcfce7; color: #16a34a; }

.tracking-timeline {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  position: relative;
}

.tracking-timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 3px;
  background: #e5e7eb;
  z-index: 0;
}

.timeline-step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.timeline-step.completed .step-icon {
  background: #16a34a;
  color: white;
}

.timeline-step.active .step-icon {
  background: #3b82f6;
  color: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.step-content h4 {
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
}

.step-content p {
  font-size: 0.75rem;
  color: #9ca3af;
  display: none;
}

.step-date {
  font-size: 0.7rem;
  color: #6b7280;
  display: block;
  margin-top: 0.5rem;
}

.delivery-details, .delivery-address {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.delivery-details h3, .delivery-address h3 {
  font-size: 1.1rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

.detail-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 600;
  color: #1f2937;
}

.detail-value.highlight {
  color: #16a34a;
}

.delivery-address p {
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.demo-hint {
  text-align: center;
  margin-top: 3rem;
  padding: 1.5rem;
  background: #eff6ff;
  border-radius: 12px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.demo-hint p {
  color: #1e40af;
  margin-bottom: 1rem;
}

.demo-codes {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.demo-code-btn {
  background: white;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: monospace;
  transition: all 0.2s;
}

.demo-code-btn:hover {
  background: #3b82f6;
  color: white;
}

@media (max-width: 768px) {
  .tracking-timeline {
    flex-direction: column;
    gap: 1rem;
  }

  .tracking-timeline::before {
    display: none;
  }

  .timeline-step {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 1rem;
  }

  .step-icon {
    margin: 0;
    flex-shrink: 0;
  }

  .step-content p {
    display: block;
  }

  .input-with-button {
    flex-direction: column;
  }

  .tracking-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
