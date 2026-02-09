<template>
  <section class="categories-main-section">
    <div class="sap-container">
      <div class="section-header">
        <h1>Our Categories</h1>
        <p>
          Explore our product worlds
        </p>
      </div>

      <div class="sap-grid sap-grid-cols-3 categories-grid">
        <div v-for="category in categories" :key="category.id" class="sap-card category-card hover-lift" @click="showModal(category)">
          <div class="card-content">
            <div class="category-icon-wrapper" :class="'icon-' + category.id">
              <span class="category-emoji">{{ category.emoji }}</span>
            </div>

            <h3 class="category-title">{{ category.title }}</h3>
            <p class="category-description">{{ category.description }}</p>

            <a href="#" @click.prevent="showModal(category)" class="category-link">
              Learn more →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CategoriesSection',
  emits: ['show-modal'],
  setup(props, { emit }) {
    const categories = [
      {
        id: 1,
        title: 'Road Bikes',
        emoji: '🚴',
        description: 'Peak performance on the road',
        fullDescription: 'Aerodynamic road bikes for ambitious riders - from beginners to pros.',
        solutions: [
          { title: 'Aero Bikes', description: 'Maximum speed through aerodynamics' },
          { title: 'Climbing Bikes', description: 'Ultra-light for steep climbs' },
          { title: 'Endurance Bikes', description: 'Comfort on long distances' }
        ],
        projects: 45
      },
      {
        id: 2,
        title: 'Mountain Bikes',
        emoji: '🏔️',
        description: 'Adventure off-road',
        fullDescription: 'Robust MTBs for trails, enduro, and downhill - ready for any terrain.',
        solutions: [
          { title: 'Trail Bikes', description: 'Versatile for flowy trails' },
          { title: 'Enduro Bikes', description: 'For demanding descents' },
          { title: 'Downhill Bikes', description: 'Maximum downhill performance' }
        ],
        projects: 38
      },
      {
        id: 3,
        title: 'Gravel Bikes',
        emoji: '🛤️',
        description: 'Freedom on any surface',
        fullDescription: 'The perfect mix of road bike and off-road capability for adventurers.',
        solutions: [
          { title: 'All-Road Bikes', description: 'Versatile for road and gravel' },
          { title: 'Bikepacking Bikes', description: 'Optimized for long tours' },
          { title: 'Race Gravel', description: 'Fast even off the beaten path' }
        ],
        projects: 28
      },
      {
        id: 4,
        title: 'E-Bikes',
        emoji: '⚡',
        description: 'Electrifying riding fun',
        fullDescription: 'Cutting-edge e-bike technology for city, touring, and off-road.',
        solutions: [
          { title: 'E-MTB', description: 'Electric assistance off-road' },
          { title: 'E-Trekking', description: 'Comfortable on long tours' },
          { title: 'E-City', description: 'Practical for everyday use' }
        ],
        projects: 52
      },
      {
        id: 5,
        title: 'Accessories',
        emoji: '🎒',
        description: 'Everything for your bike',
        fullDescription: 'Premium accessories from helmets to pedals - for safety and performance.',
        solutions: [
          { title: 'Helmets & Protection', description: 'Safety first' },
          { title: 'Apparel', description: 'Functional and stylish' },
          { title: 'Components', description: 'Upgrades for your bike' }
        ],
        projects: 120
      },
      {
        id: 6,
        title: 'Service',
        emoji: '🔧',
        description: 'Workshop & Maintenance',
        fullDescription: 'Professional service, maintenance, and repair for all brands.',
        solutions: [
          { title: 'Inspection', description: 'Regular safety checks' },
          { title: 'Repair', description: 'Quick help with problems' },
          { title: 'Bike Fitting', description: 'Perfect riding position for you' }
        ],
        projects: 85
      }
    ]

    const showModal = (category) => {
      emit('show-modal', category)
    }

    return {
      categories,
      showModal
    }
  }
}
</script>

<style scoped>
.categories-main-section {
  padding: 4rem 0;
  background: #f8f9fa;
}

.categories-grid {
  margin-top: 3rem;
  gap: 2rem;
}

.category-card {
  cursor: pointer;
  text-align: center;
  padding: 2rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.category-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto 2rem;
  border-radius: 20px;
}

.icon-1 { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.icon-2 { background: linear-gradient(135deg, #dbeafe, #93c5fd); }
.icon-3 { background: linear-gradient(135deg, #fce7f3, #f9a8d4); }
.icon-4 { background: linear-gradient(135deg, #d1fae5, #6ee7b7); }
.icon-5 { background: linear-gradient(135deg, #e0e7ff, #a5b4fc); }
.icon-6 { background: linear-gradient(135deg, #ffe4e6, #fda4af); }

.category-emoji {
  font-size: 2.5rem;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.category-description {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.category-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.category-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-card {
    padding: 1.5rem 1rem;
  }
}
</style>
