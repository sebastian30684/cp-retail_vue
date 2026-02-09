<template>
  <section class="about-section">
    <div class="sap-container">
      <!-- Hero -->
      <div class="about-hero">
        <div class="hero-content">
          <h1>About Us</h1>
          <p class="hero-subtitle">
            Your trusted partner for premium bikes and cycling accessories since 2010
          </p>
        </div>
      </div>

      <!-- Our Story -->
      <div class="story-section">
        <div class="story-content">
          <h2>Our Story</h2>
          <p>
            What started as a small retail operation has grown into a leading
            consumer products and retail solution provider. Our passion for customer experience
            drives everything we do, from curating the finest product selection to providing
            exceptional service.
          </p>
          <p>
            We believe that retail is more than just transactions - it's about creating meaningful
            connections between brands and consumers. That's why we're committed to helping
            every business deliver exceptional experiences across all channels.
          </p>
        </div>
        <div class="story-image">
          <div class="image-placeholder">
            <img src="/images/301697_Consumer_Products_R.png" alt="Consumer Products" class="story-pictogram" />
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-number">15+</span>
          <span class="stat-label">Years of Experience</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">50,000+</span>
          <span class="stat-label">Happy Customers</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">200+</span>
          <span class="stat-label">Brands</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">98%</span>
          <span class="stat-label">Satisfaction Rate</span>
        </div>
      </div>

      <!-- Values -->
      <div class="values-section">
        <h2>Our Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <img src="/images/301553_User_Experience_R.png" alt="Quality" class="value-pictogram" />
            <h3>Quality</h3>
            <p>We only partner with brands we believe in and would recommend ourselves.</p>
          </div>
          <div class="value-card">
            <img src="/images/301464_Customer_R.png" alt="Trust" class="value-pictogram" />
            <h3>Trust</h3>
            <p>Building lasting relationships through honest advice and exceptional service.</p>
          </div>
          <div class="value-card">
            <img src="/images/299612_Shopping_R.png" alt="Innovation" class="value-pictogram" />
            <h3>Innovation</h3>
            <p>Staying ahead with the latest retail technology and consumer trends.</p>
          </div>
          <div class="value-card">
            <img src="/images/306336_Warehouse_R.png" alt="Sustainability" class="value-pictogram" />
            <h3>Sustainability</h3>
            <p>Promoting responsible retail practices for a better future.</p>
          </div>
        </div>
      </div>

      <!-- Team -->
      <div class="team-section">
        <h2>Meet Our Team</h2>
        <p class="team-intro">
          Our expert team combines decades of retail experience with a genuine passion for customer success.
        </p>
        <div class="team-grid">
          <div v-for="member in teamMembers" :key="member.id" class="team-card">
            <div class="member-avatar" :style="{ background: member.gradient }">
              <span>{{ member.initials }}</span>
            </div>
            <h3>{{ member.name }}</h3>
            <span class="member-role">{{ member.role }}</span>
            <p class="member-bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>

      <!-- Location -->
      <div class="location-section">
        <div class="location-info">
          <h2>Visit Our Store</h2>
          <p>Experience our full range of bikes and accessories in person.</p>
          <div class="address">
            <div class="address-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>3999 West Chester Pike, Newtown Square, PA 19073</span>
            </div>
            <div class="address-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>+1 (800) 123-4567</span>
            </div>
            <div class="address-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>info@sap-cx-retail.com</span>
            </div>
          </div>
          <h3>Opening Hours</h3>
          <div class="hours">
            <div class="hours-row">
              <span>Monday - Friday</span>
              <span>9:00 - 19:00</span>
            </div>
            <div class="hours-row">
              <span>Saturday</span>
              <span>10:00 - 18:00</span>
            </div>
            <div class="hours-row">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
          </div>
          <button class="sap-btn sap-btn-primary" @click="$emit('navigate', 'contact')">
            Contact Us
          </button>
        </div>
        <div class="location-map">
          <div class="map-placeholder">
            <span>🗺️</span>
            <p>Map View</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AboutSection',
  emits: ['navigate'],
  setup() {
    const teamMembers = ref([
      {
        id: 1,
        name: 'Michael Schmidt',
        role: 'Founder & CEO',
        bio: 'Retail industry veteran with 20+ years of experience.',
        initials: 'MS',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 2,
        name: 'Sarah Weber',
        role: 'Head of Sales',
        bio: 'Passionate about connecting brands with customers.',
        initials: 'SW',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        id: 3,
        name: 'Thomas Miller',
        role: 'Operations Manager',
        bio: 'Expert in supply chain and fulfillment optimization.',
        initials: 'TM',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
      },
      {
        id: 4,
        name: 'Lisa Bauer',
        role: 'Customer Success',
        bio: 'Dedicated to ensuring every customer has a great experience.',
        initials: 'LB',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      }
    ])

    return {
      teamMembers
    }
  }
}
</script>

<style scoped>
.about-section {
  padding: 0;
  background: #fafafa;
}

/* Hero */
.about-hero {
  background: linear-gradient(135deg, var(--sap-blue-6) 0%, var(--sap-blue-8) 100%);
  padding: 6rem 2rem;
  text-align: center;
  color: white;
  margin-bottom: 4rem;
}

.about-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* Story Section */
.story-section {
  display: flex;
  gap: 4rem;
  align-items: center;
  margin-bottom: 4rem;
  padding: 0 2rem;
}

.story-content {
  flex: 1;
}

.story-content h2 {
  color: var(--sap-blue-7);
  margin-bottom: 1.5rem;
}

.story-content p {
  color: var(--sap-gray-6);
  line-height: 1.8;
  margin-bottom: 1rem;
}

.story-image {
  flex: 0 0 400px;
}

.image-placeholder {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder span {
  font-size: 6rem;
}

.story-pictogram {
  width: 120px;
  height: auto;
}

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 0 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--sap-blue-7);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--sap-gray-6);
  font-size: 0.875rem;
}

/* Values */
.values-section {
  margin-bottom: 4rem;
  padding: 0 2rem;
}

.values-section h2 {
  text-align: center;
  color: var(--sap-blue-7);
  margin-bottom: 2rem;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.value-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.value-pictogram {
  width: 60px;
  height: auto;
  margin-bottom: 1rem;
}

.value-card h3 {
  color: var(--sap-gray-8);
  margin-bottom: 0.75rem;
}

.value-card p {
  color: var(--sap-gray-6);
  font-size: 0.9375rem;
  line-height: 1.6;
}

/* Team */
.team-section {
  margin-bottom: 4rem;
  padding: 0 2rem;
}

.team-section h2 {
  text-align: center;
  color: var(--sap-blue-7);
  margin-bottom: 0.75rem;
}

.team-intro {
  text-align: center;
  color: var(--sap-gray-6);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.team-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.member-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.team-card h3 {
  color: var(--sap-gray-8);
  margin-bottom: 0.25rem;
}

.member-role {
  color: var(--sap-blue-6);
  font-weight: 600;
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.75rem;
}

.member-bio {
  color: var(--sap-gray-6);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Location */
.location-section {
  display: flex;
  gap: 4rem;
  background: white;
  padding: 4rem;
  margin: 0 2rem 4rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.location-info {
  flex: 1;
}

.location-info h2 {
  color: var(--sap-blue-7);
  margin-bottom: 0.75rem;
}

.location-info > p {
  color: var(--sap-gray-6);
  margin-bottom: 1.5rem;
}

.address {
  margin-bottom: 2rem;
}

.address-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--sap-gray-7);
  margin-bottom: 0.75rem;
}

.address-item svg {
  color: var(--sap-blue-6);
  flex-shrink: 0;
}

.location-info h3 {
  color: var(--sap-gray-8);
  margin-bottom: 1rem;
}

.hours {
  margin-bottom: 2rem;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--sap-gray-2);
  color: var(--sap-gray-6);
}

.location-map {
  flex: 0 0 400px;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--sap-gray-5);
}

.map-placeholder span {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 1024px) {
  .story-section {
    flex-direction: column;
  }

  .story-image {
    width: 100%;
  }

  .stats-section,
  .values-grid,
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .location-section {
    flex-direction: column;
  }

  .location-map {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .about-hero h1 {
    font-size: 2rem;
  }

  .stats-section,
  .values-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }

  .location-section {
    margin: 0 1rem 2rem;
    padding: 2rem;
  }
}
</style>
