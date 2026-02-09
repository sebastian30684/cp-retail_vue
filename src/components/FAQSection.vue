<template>
  <section class="faq-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about our products and services</p>
      </div>

      <!-- Search -->
      <div class="faq-search">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search for answers..."
          class="sap-input search-input"
        >
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Category Tabs -->
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['category-tab', { active: activeCategory === category.id }]"
          @click="activeCategory = category.id"
        >
          <img :src="category.image" :alt="category.name" class="tab-pictogram" />
          <span class="tab-name">{{ category.name }}</span>
        </button>
      </div>

      <!-- FAQ List -->
      <div class="faq-list">
        <div
          v-for="faq in filteredFaqs"
          :key="faq.id"
          class="faq-item"
          :class="{ expanded: expandedFaq === faq.id }"
        >
          <button class="faq-question" @click="toggleFaq(faq.id)">
            <span class="question-text">{{ faq.question }}</span>
            <svg class="expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="faq-answer" v-if="expandedFaq === faq.id">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredFaqs.length === 0" class="no-results">
        <img src="/images/300927_Question_Answer_R.png" alt="No results" class="no-results-pictogram" />
        <h3>No results found</h3>
        <p>Try a different search term or browse by category</p>
      </div>

      <!-- Contact CTA -->
      <div class="contact-cta">
        <div class="cta-content">
          <h2>Still have questions?</h2>
          <p>Our team is here to help you with any inquiries</p>
          <div class="cta-buttons">
            <button class="sap-btn sap-btn-primary" @click="$emit('navigate', 'contact')">
              Contact Support
            </button>
            <button class="sap-btn sap-btn-secondary" @click="$emit('navigate', 'tracking')">
              Track Your Order
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <h2>Quick Links</h2>
        <div class="links-grid">
          <a href="#" @click.prevent="$emit('navigate', 'shop')" class="quick-link">
            <img src="/images/299612_Shopping_R.png" alt="Shop" class="link-pictogram" />
            <span class="link-text">Shop Products</span>
          </a>
          <a href="#" @click.prevent="$emit('navigate', 'tracking')" class="quick-link">
            <img src="/images/301466_Wholesale_Package_R.png" alt="Track" class="link-pictogram" />
            <span class="link-text">Track Order</span>
          </a>
          <a href="#" @click.prevent="$emit('navigate', 'contact')" class="quick-link">
            <img src="/images/301464_Customer_R.png" alt="Contact" class="link-pictogram" />
            <span class="link-text">Contact Us</span>
          </a>
          <a href="#" @click.prevent="$emit('navigate', 'about')" class="quick-link">
            <img src="/images/301553_User_Experience_R.png" alt="About" class="link-pictogram" />
            <span class="link-text">About Us</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'FAQSection',
  emits: ['navigate'],
  setup() {
    const searchQuery = ref('')
    const activeCategory = ref('all')
    const expandedFaq = ref(null)

    const categories = ref([
      { id: 'all', name: 'All', image: '/images/299612_Shopping_R.png' },
      { id: 'orders', name: 'Orders', image: '/images/301466_Wholesale_Package_R.png' },
      { id: 'shipping', name: 'Shipping', image: '/images/306336_Warehouse_R.png' },
      { id: 'returns', name: 'Returns', image: '/images/301466_Wholesale_Package_R.png' },
      { id: 'products', name: 'Products', image: '/images/301697_Consumer_Products_R.png' },
      { id: 'payment', name: 'Payment', image: '/images/301464_Customer_R.png' }
    ])

    const allFaqs = ref([
      {
        id: 1,
        category: 'orders',
        question: 'How do I place an order?',
        answer: 'Simply browse our shop, add items to your cart, and proceed to checkout. You can create an account for faster checkout or continue as a guest. We accept all major payment methods including credit cards, PayPal, and bank transfer.'
      },
      {
        id: 2,
        category: 'orders',
        question: 'Can I modify or cancel my order?',
        answer: 'You can modify or cancel your order within 1 hour of placing it. After that, please contact our customer service team as soon as possible. Once an order has been shipped, it cannot be cancelled but can be returned.'
      },
      {
        id: 3,
        category: 'shipping',
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within Germany. Express shipping (next-day delivery) is available for orders placed before 2 PM. International shipping varies by destination, usually 5-10 business days.'
      },
      {
        id: 4,
        category: 'shipping',
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free standard shipping on all orders over €99 within Germany. For orders under €99, shipping costs €4.95. Express shipping is €9.95 regardless of order value.'
      },
      {
        id: 5,
        category: 'shipping',
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive an email with a tracking number. You can also track your order by visiting our Track Order page and entering your order number or tracking code.'
      },
      {
        id: 6,
        category: 'returns',
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all unused items in their original packaging. Simply initiate a return through your account or contact our customer service. Refunds are processed within 5-7 business days after we receive the item.'
      },
      {
        id: 7,
        category: 'returns',
        question: 'How do I return a bike?',
        answer: 'For bike returns, please contact our customer service to arrange pickup. We will send a courier to collect the bike at no additional cost. Please ensure the bike is in its original condition with all accessories and packaging.'
      },
      {
        id: 8,
        category: 'products',
        question: 'How do I find the right product for my needs?',
        answer: 'We provide detailed product descriptions and specifications on each product page. You can also use our filters to narrow down options by category, brand, price, and features. If you need assistance, our customer service team is happy to provide personalized recommendations.'
      },
      {
        id: 9,
        category: 'products',
        question: 'Are all products in stock?',
        answer: 'Product availability is shown on each product page. If an item is temporarily out of stock, you can sign up for notifications to be alerted when it becomes available. Our inventory is updated in real-time to ensure accuracy.'
      },
      {
        id: 10,
        category: 'products',
        question: 'What warranty do you offer?',
        answer: 'All products come with a manufacturer warranty. The duration varies by product category - typically 1-2 years for electronics, 1 year for accessories, and varies for other categories. Details are provided on each product page.'
      },
      {
        id: 11,
        category: 'payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and bank transfer. For purchases over €500, we also offer 0% financing options through our partner Klarna.'
      },
      {
        id: 12,
        category: 'payment',
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use industry-standard SSL encryption to protect your data. We are PCI DSS compliant and never store your full credit card details on our servers. All transactions are processed through secure payment gateways.'
      }
    ])

    const filteredFaqs = computed(() => {
      let result = allFaqs.value

      if (activeCategory.value !== 'all') {
        result = result.filter(faq => faq.category === activeCategory.value)
      }

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
        )
      }

      return result
    })

    const toggleFaq = (id) => {
      expandedFaq.value = expandedFaq.value === id ? null : id
    }

    return {
      searchQuery,
      activeCategory,
      expandedFaq,
      categories,
      filteredFaqs,
      toggleFaq
    }
  }
}
</script>

<style scoped>
.faq-section {
  padding: 4rem 0;
  background: #fafafa;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h1 {
  font-size: 2.5rem;
  color: var(--sap-blue-7);
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--sap-gray-6);
  font-size: 1.125rem;
}

/* Search */
.faq-search {
  position: relative;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  border-radius: 50px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--sap-gray-5);
}

/* Category Tabs */
.category-tabs {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid var(--sap-gray-3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-tab:hover {
  border-color: var(--sap-blue-6);
}

.category-tab.active {
  background: var(--sap-blue-6);
  border-color: var(--sap-blue-6);
  color: white;
}

.tab-icon {
  font-size: 1.125rem;
}

.tab-pictogram {
  width: 24px;
  height: auto;
}

.tab-name {
  font-weight: 600;
  font-size: 0.875rem;
}

/* FAQ List */
.faq-list {
  max-width: 800px;
  margin: 0 auto 3rem;
}

.faq-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.faq-item.expanded {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.question-text {
  font-weight: 600;
  color: var(--sap-gray-8);
  font-size: 1rem;
  flex: 1;
  padding-right: 1rem;
}

.expand-icon {
  color: var(--sap-blue-6);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.faq-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  color: var(--sap-gray-6);
  line-height: 1.7;
  border-top: 1px solid var(--sap-gray-2);
  margin-top: -0.5rem;
  padding-top: 1rem;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.no-results-pictogram {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

.no-results h3 {
  color: var(--sap-gray-7);
  margin-bottom: 0.5rem;
}

.no-results p {
  color: var(--sap-gray-5);
}

/* Contact CTA */
.contact-cta {
  background: linear-gradient(135deg, var(--sap-blue-6) 0%, var(--sap-blue-8) 100%);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  color: white;
  margin-bottom: 4rem;
}

.cta-content h2 {
  margin-bottom: 0.5rem;
}

.cta-content p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-buttons .sap-btn-primary {
  background: white;
  color: var(--sap-blue-7);
}

.cta-buttons .sap-btn-secondary {
  border-color: white;
  color: white;
}

/* Quick Links */
.quick-links {
  text-align: center;
}

.quick-links h2 {
  color: var(--sap-blue-7);
  margin-bottom: 2rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}

.quick-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.link-icon {
  font-size: 2rem;
}

.link-pictogram {
  width: 48px;
  height: auto;
}

.link-text {
  color: var(--sap-gray-7);
  font-weight: 600;
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cta-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .links-grid {
    grid-template-columns: 1fr;
  }

  .category-tabs {
    gap: 0.5rem;
  }

  .category-tab {
    padding: 0.5rem 1rem;
  }
}
</style>
