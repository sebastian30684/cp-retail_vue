<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="order-success-modal" @click.stop>
      <div class="modal-header">
        <div class="success-icon">🎉</div>
        <h2>Order Placed Successfully!</h2>
        <button @click="$emit('close')" class="modal-close">×</button>
      </div>
      
      <div class="modal-body">
        <div class="order-summary">
          <h3>Order Details</h3>
          <div class="order-info-grid">
            <div class="info-item">
              <span class="label">Order ID:</span>
              <span class="value">{{ orderData.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Order Date:</span>
              <span class="value">{{ formatDate(orderData.timestamp) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Partnership Tier:</span>
              <span class="value partnership-tier" :class="`tier-${orderData.tier}`">
                {{ getTierLabel(orderData.tier) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Payment Terms:</span>
              <span class="value">Net {{ orderData.paymentTerms }} days</span>
            </div>
          </div>
        </div>
        
        <div class="pricing-summary">
          <h3>Pricing Summary</h3>
          <div class="pricing-grid">
            <div class="pricing-row">
              <span>Subtotal (List Price):</span>
              <span>{{ (orderData.subtotal + (orderData.discountTotal || 0)).toLocaleString() }}€</span>
            </div>
            <div v-if="orderData.discountTotal > 0" class="pricing-row discount-row">
              <span>Partnership Discount:</span>
              <span class="discount-amount">-{{ orderData.discountTotal.toLocaleString() }}€</span>
            </div>
            <div class="pricing-row">
              <span>Net Amount:</span>
              <span>{{ orderData.subtotal.toLocaleString() }}€</span>
            </div>
            <div class="pricing-row">
              <span>Tax (19%):</span>
              <span>{{ orderData.tax.toLocaleString() }}€</span>
            </div>
            <div class="pricing-row total-row">
              <span>Total Amount:</span>
              <span class="total-amount">{{ orderData.total.toLocaleString() }}€</span>
            </div>
          </div>
          
          <div v-if="orderData.discountTotal > 0" class="savings-highlight">
            <div class="savings-badge">
              💰 You saved {{ orderData.discountTotal.toLocaleString() }}€ with your partnership benefits!
            </div>
          </div>
        </div>
        
        <div class="order-items">
          <h3>Items Ordered ({{ orderData.items?.length || 0 }})</h3>
          <div class="items-list">
            <div v-for="item in orderData.items" :key="item.id" class="item-row">
              <div class="item-info">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-category">{{ item.category }}</span>
              </div>
              <div class="item-pricing">
                <span class="quantity">Qty: {{ item.quantity }}</span>
                <span v-if="item.finalPrice && item.finalPrice < item.price" class="price-with-discount">
                  {{ item.finalPrice.toLocaleString() }}€ 
                  <small class="original-price">(was {{ item.price.toLocaleString() }}€)</small>
                </span>
                <span v-else class="price-normal">
                  {{ item.price.toLocaleString() }}€
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="next-steps">
          <h3>What's Next?</h3>
          <div class="steps-list">
            <div class="step-item">
              <span class="step-icon">📧</span>
              <span>Order confirmation will be sent to your email</span>
            </div>
            <div class="step-item">
              <span class="step-icon">📦</span>
              <span>Processing will begin within 1 business day</span>
            </div>
            <div class="step-item">
              <span class="step-icon">💳</span>
              <span>Invoice due: Net {{ orderData.paymentTerms }} days from delivery</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="sap-btn sap-btn-primary">
          Continue Shopping
        </button>
        <button @click="printOrder" class="sap-btn sap-btn-secondary">
          🖨️ Print Order
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderSuccessModal',
  props: {
    orderData: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const getTierLabel = (tier) => {
      switch (tier) {
        case 'starter': return 'Business Starter'
        case 'partner': return 'Business Partner'
        case 'premium': return 'Premium Partner'
        case 'enterprise': return 'Enterprise Partner'
        default: return 'Business Customer'
      }
    }
    
    const printOrder = () => {
      const printWindow = window.open('', '_blank')
      const orderHtml = `
        <html>
          <head>
            <title>Order ${props.orderData.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .order-info { margin-bottom: 20px; }
              .total { font-weight: bold; font-size: 1.2em; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Order Confirmation</h1>
              <p>Order ID: ${props.orderData.id}</p>
              <p>Date: ${formatDate(props.orderData.timestamp)}</p>
            </div>
            <div class="order-info">
              <h3>Items:</h3>
              ${props.orderData.items?.map(item => `
                <p>${item.productName} - Qty: ${item.quantity} - ${(item.finalPrice || item.price).toLocaleString()}€</p>
              `).join('') || ''}
              <div class="total">
                <p>Total: ${props.orderData.total.toLocaleString()}€</p>
              </div>
            </div>
          </body>
        </html>
      `
      
      printWindow.document.write(orderHtml)
      printWindow.document.close()
      printWindow.print()
    }
    
    return {
      formatDate,
      getTierLabel,
      printOrder
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.order-success-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  text-align: center;
  position: relative;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
}

.order-summary {
  grid-column: 1;
}

.pricing-summary {
  grid-column: 2;
}

.order-items {
  grid-column: 1 / -1;
}

.next-steps {
  grid-column: 1 / -1;
}

.modal-body h3 {
  margin: 0 0 1rem 0;
  color: var(--sap-gray-8);
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--sap-gray-2);
}

.order-info-grid,
.pricing-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item,
.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.label {
  font-weight: 500;
  color: var(--sap-gray-6);
}

.value {
  font-weight: 600;
  color: var(--sap-gray-8);
}

.partnership-tier {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.tier-starter { background: #22c55e; color: white; }
.tier-partner { background: #3b82f6; color: white; }
.tier-premium { background: #8b5cf6; color: white; }
.tier-enterprise { background: #f59e0b; color: white; }

.discount-row {
  color: var(--sap-green-6);
  font-weight: 600;
}

.discount-amount {
  color: var(--sap-green-6);
}

.total-row {
  border-top: 2px solid var(--sap-gray-2);
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.total-amount {
  color: var(--sap-blue-7);
  font-size: 1.2rem;
}

.savings-highlight {
  margin-top: 1rem;
  text-align: center;
}

.savings-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
}

.items-list {
  display: grid;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--sap-gray-1);
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 600;
  color: var(--sap-gray-8);
}

.item-category {
  font-size: 0.875rem;
  color: var(--sap-gray-5);
}

.item-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.quantity {
  font-size: 0.875rem;
  color: var(--sap-gray-6);
}

.price-with-discount {
  font-weight: 600;
  color: var(--sap-blue-7);
}

.original-price {
  text-decoration: line-through;
  color: var(--sap-gray-5);
}

.price-normal {
  font-weight: 600;
  color: var(--sap-gray-7);
}

.steps-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--sap-blue-1);
  border-radius: 8px;
  font-size: 0.875rem;
}

.step-icon {
  font-size: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--sap-gray-2);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .order-summary,
  .pricing-summary,
  .order-items,
  .next-steps {
    grid-column: 1;
  }

  .steps-list {
    grid-template-columns: 1fr;
  }

  .step-item {
    flex-direction: row;
    text-align: left;
  }

  .modal-footer {
    flex-direction: column;
  }

  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-pricing {
    align-items: flex-start;
  }
}
</style>