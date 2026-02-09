<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="closeModal" v-if="industry">
      <div class="sap-modal sap-modal-medium" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header gradient-bg">
          <div class="modal-header-content">
            <div class="industry-header-info">
              <div class="industry-icon-large">
                <img :src="getIndustryIcon(industry.title)" :alt="industry.title" class="industry-pictogram">
              </div>
              <div class="industry-title-section">
                <h2 class="sap-text-3xl sap-font-bold">{{ industry.title }}</h2>
                <span class="sap-badge badge-industry">
                  Industry Focus
                </span>
              </div>
            </div>
            <button @click="closeModal" class="modal-close">✕</button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div class="modal-body">
          <div class="industry-content">
            <!-- Main Description -->
            <div class="industry-description">
              <h3 class="sap-text-xl sap-font-semibold">Industry Overview</h3>
              <p class="industry-full-description">{{ industry.fullDescription }}</p>
            </div>
            
            <!-- Key Solutions (Top 3 only) -->
            <div class="industry-solutions">
              <h3 class="sap-text-xl sap-font-semibold">Key Solutions</h3>
              <div class="solutions-compact">
                <div v-for="solution in industry.solutions.slice(0, 3)" :key="solution.title" class="solution-compact">
                  <div class="solution-icon">
                    <!-- SAP Logo als Icon - wie bei den Produkten im Shop -->
                    <img src="/images/sap_logo.png" :alt="solution.title" class="solution-pictogram">
                  </div>
                  <div class="solution-info">
                    <h4>{{ solution.title }}</h4>
                    <p>{{ solution.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Success Metrics (2x2 Grid) -->
            <div class="industry-metrics">
              <h3 class="sap-text-xl sap-font-semibold">Success Metrics</h3>
              <div class="metrics-compact">
                <div v-for="metric in industryMetrics.slice(0, 2)" :key="metric.id" class="metric-compact">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                </div>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div class="industry-cta">
              <div class="cta-content">
                <h3 class="sap-text-xl sap-font-semibold">Get Started Today</h3>
                <p>Contact our {{ industry.title.toLowerCase() }} specialists for a free consultation.</p>
                <div class="cta-buttons">
                  <button @click="requestConsultation" class="sap-btn sap-btn-primary">
                    Free Consultation
                  </button>
                  <button @click="downloadCaseStudy" class="sap-btn sap-btn-secondary">
                    Success Stories
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed, Teleport } from 'vue'

export default {
  name: 'CategoryModal',
  components: {
    Teleport
  },
  props: {
    industry: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('close')
    }
    
    const getIndustryIcon = (industry) => {
      const iconMap = {
        'Manufacturing': '/images/sap_pictogram_manufacturing.png',
        'Healthcare': '/images/sap_pictogram_healthcare.png',
        'Finance': '/images/sap_pictogram_finance.png',
        'Retail': '/images/sap_pictogram_retail.png',
        'Technology': '/images/sap_pictogram_technology.png',
        'Education': '/images/sap_pictogram_education.png'
      }
      return iconMap[industry] || '/images/sap_logo.png'
    }
    
    // Industry-specific metrics (simplified for compact view)
    const industryMetrics = computed(() => {
      if (!props.industry) return []
      
      const metricsMap = {
        'Manufacturing': [
          { id: 1, value: '45%', label: 'Efficiency Boost' },
          { id: 2, value: '30%', label: 'Cost Reduction' },
          { id: 3, value: '99.2%', label: 'Quality Rate' },
          { id: 4, value: '24/7', label: 'Monitoring' }
        ],
        'Healthcare': [
          { id: 1, value: '40%', label: 'Faster Processing' },
          { id: 2, value: '60%', label: 'Less Paperwork' },
          { id: 3, value: '99.9%', label: 'Data Security' },
          { id: 4, value: '24/7', label: 'Availability' }
        ],
        'Finance': [
          { id: 1, value: '75%', label: 'Faster Processing' },
          { id: 2, value: '100%', label: 'Compliance' },
          { id: 3, value: '50%', label: 'Risk Reduction' },
          { id: 4, value: '99.99%', label: 'Security' }
        ],
        'Retail': [
          { id: 1, value: '35%', label: 'Sales Growth' },
          { id: 2, value: '25%', label: 'Inventory Optimization' },
          { id: 3, value: '90%', label: 'Customer Satisfaction' },
          { id: 4, value: '365', label: 'Days Support' }
        ],
        'Technology': [
          { id: 1, value: '55%', label: 'Development Speed' },
          { id: 2, value: '80%', label: 'Scalability' },
          { id: 3, value: '99.5%', label: 'Uptime' },
          { id: 4, value: '3x', label: 'Performance' }
        ],
        'Education': [
          { id: 1, value: '50%', label: 'Engagement' },
          { id: 2, value: '40%', label: 'Admin Efficiency' },
          { id: 3, value: '95%', label: 'Digital Adoption' },
          { id: 4, value: '24/7', label: 'Learning Access' }
        ]
      }
      
      return metricsMap[props.industry.title] || [
        { id: 1, value: '50%', label: 'Improvement' },
        { id: 2, value: '30%', label: 'Efficiency' },
        { id: 3, value: '95%', label: 'Satisfaction' },
        { id: 4, value: '24/7', label: 'Support' }
      ]
    })
    
    // Action handlers
    const requestConsultation = () => {
      alert(`Free consultation request for ${props.industry.title} solutions submitted! We will contact you within 24 hours.`)
      closeModal()
    }
    
    const downloadCaseStudy = () => {
      alert(`Downloading ${props.industry.title} success stories and case studies...`)
    }
    
    return {
      closeModal,
      getIndustryIcon,
      industryMetrics,
      requestConsultation,
      downloadCaseStudy
    }
  }
}
</script>

<style scoped>
/* Modal-spezifische kompakte Styles */
.sap-modal-compact {
  max-width: 900px;
  max-height: 80vh;
  width: 95%;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.modal-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-right {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.modal-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sap-blue-10);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--sap-blue-2);
  padding-bottom: 0.5rem;
}

.industry-cta-compact .cta-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Header Styles */
.industry-header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.industry-icon-large {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.industry-pictogram {
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

/* SAP Logo als Solution Icon - wie bei den Produkten im Shop */
.solution-pictogram {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.solution-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--sap-blue-6), var(--sap-blue-7));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Solutions List */
.solutions-compact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.solution-compact {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid var(--sap-gray-3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.solution-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 112, 242, 0.1);
  border-color: var(--sap-blue-6);
}

.solution-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sap-blue-10);
  margin: 0 0 0.5rem 0;
}

.solution-info p {
  color: var(--sap-gray-7);
  margin: 0;
  line-height: 1.5;
}

/* Metrics Grid */
.metrics-compact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-compact {
  background: linear-gradient(135deg, 
    rgba(27, 144, 255, 0.08), 
    rgba(139, 92, 246, 0.08)
  );
  border: 1px solid var(--sap-blue-2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--sap-blue-6), var(--sap-blue-7));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sap-blue-10);
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Badge */
.badge-industry {
  background: rgba(54, 164, 29, 0.9);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .sap-modal-compact {
    max-height: 90vh;
    margin: 5vh auto;
  }
  
  .industry-header-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>