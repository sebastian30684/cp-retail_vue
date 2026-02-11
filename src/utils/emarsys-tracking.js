// src/utils/emarsys-tracking.js
// Emarsys Web Extend (Scarab) Integration for SAP CX Retail

class EmarsysTracker {
  constructor() {
    this.cookieConsent = false;
    this.scarabReady = false;
    this.eventQueue = [];
    this.currentEmail = null;

    this.setupEventListeners();
    this.checkExistingConsent();
    this.waitForScarab();
  }

  // Check localStorage for existing consent (same pattern as GTM tracker)
  checkExistingConsent() {
    try {
      const consentData = localStorage.getItem('cookie-consent');
      const trackingConsent = localStorage.getItem('tracking-consent');

      if (consentData) {
        const savedSettings = JSON.parse(consentData);
        if (savedSettings.analytics || savedSettings.marketing) {
          console.log('✅ [Emarsys] Existing cookie consent found');
          this.cookieConsent = true;
        }
      } else if (trackingConsent === 'true') {
        console.log('✅ [Emarsys] Tracking consent flag found');
        this.cookieConsent = true;
      }
    } catch (error) {
      console.error('❌ [Emarsys] Error checking consent:', error);
    }
  }

  setupEventListeners() {
    document.addEventListener('cookie-consent-granted', () => {
      this.cookieConsent = true;
      console.log('✅ [Emarsys] Cookie consent granted');
      this.processEventQueue();
    });
  }

  waitForScarab() {
    let attempts = 0;
    const maxAttempts = 40; // 20 seconds

    const checkScarab = () => {
      attempts++;

      // Check if ScarabQueue exists and has a push method.
      // The SDK replaces the initial array with a custom object that still has push(),
      // so Array.isArray() would fail after SDK loads.
      if (window.ScarabQueue && typeof window.ScarabQueue.push === 'function') {
        this.scarabReady = true;
        console.log('✅ [Emarsys] Scarab SDK ready after', attempts, 'attempts');
        this.processEventQueue();
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ [Emarsys] Scarab SDK timeout');
      } else {
        setTimeout(checkScarab, 500);
      }
    };
    checkScarab();
  }

  processEventQueue() {
    if (!this.canTrack()) return;

    if (this.eventQueue.length > 0) {
      console.log('📦 [Emarsys] Processing', this.eventQueue.length, 'queued events');

      this.eventQueue.forEach(queuedEvent => {
        this.pushToScarab(queuedEvent.command, queuedEvent.data);
      });

      this.eventQueue = [];
    }
  }

  canTrack() {
    return this.cookieConsent && this.scarabReady;
  }

  pushToScarab(command, data) {
    if (!this.scarabReady) {
      console.log('⏸️ [Emarsys] Scarab not ready - queueing:', command);
      this.eventQueue.push({ command, data });
      return;
    }

    if (!this.cookieConsent) {
      console.log('⏸️ [Emarsys] No consent - queueing:', command);
      this.eventQueue.push({ command, data });
      return;
    }

    try {
      if (data !== undefined) {
        window.ScarabQueue.push([command, data]);
      } else {
        window.ScarabQueue.push([command]);
      }
      console.log('📤 [Emarsys]', command, data || '');
    } catch (error) {
      console.error('❌ [Emarsys] Error pushing to queue:', error);
    }
  }

  // ================== TRACKING METHODS ==================

  // Identify user by email
  setCustomer(email) {
    if (!email) return;

    this.currentEmail = email;
    this.pushToScarab('setEmail', email);
    this.go(); // Commit the identification
  }

  // Clear customer (logout)
  clearCustomer() {
    this.currentEmail = null;
    this.pushToScarab('setEmail', null);
    this.go();
  }

  // Track product view
  trackView(itemId) {
    if (!itemId) return;

    this.pushToScarab('view', String(itemId));
    this.go();
  }

  // Track category browsing
  trackCategory(categoryPath) {
    if (!categoryPath) return;

    this.pushToScarab('category', categoryPath);
    this.go();
  }

  // Track search keyword
  trackSearchTerm(searchTerm) {
    if (!searchTerm) return;

    this.pushToScarab('searchTerm', searchTerm);
    this.go();
  }

  // Sync cart with Emarsys
  // cartItems: array of { id, price, quantity }
  trackCart(cartItems = []) {
    const formattedItems = cartItems.map(item => ({
      item: String(item.id),
      price: item.price,
      quantity: item.quantity
    }));

    this.pushToScarab('cart', formattedItems);
    this.go();
  }

  // Track purchase
  // orderId: string, items: array of { id, price, quantity }
  trackPurchase(orderId, items = []) {
    if (!orderId || items.length === 0) return;

    const formattedItems = items.map(item => ({
      item: String(item.id),
      price: item.price,
      quantity: item.quantity
    }));

    this.pushToScarab('purchase', {
      orderId: String(orderId),
      items: formattedItems
    });
    this.go();
  }

  // Commit queued commands
  go() {
    this.pushToScarab('go');
  }

  // ================== RECOMMENDATIONS ==================

  // Load recommendations
  // logic: string (e.g., 'PERSONAL', 'ALSO_BOUGHT', 'RELATED', 'CATEGORY', 'POPULAR')
  // containerId: DOM element ID where recommendations will be rendered
  // callback: function(SC) called with recommendation data
  recommend(logic, containerId, callback) {
    if (!logic) return;

    const recommendCommand = {
      logic: logic,
      containerId: containerId || undefined,
      success: callback || this.defaultRecommendCallback
    };

    // Filter out undefined values
    Object.keys(recommendCommand).forEach(key => {
      if (recommendCommand[key] === undefined) {
        delete recommendCommand[key];
      }
    });

    this.pushToScarab('recommend', recommendCommand);
  }

  defaultRecommendCallback(SC) {
    console.log('📦 [Emarsys] Recommendations received:', SC.page.products);
  }

  // Convenience method for personal recommendations
  getPersonalRecommendations(callback) {
    this.recommend('PERSONAL', null, callback);
    this.go();
  }

  // Convenience method for "also bought" recommendations
  getAlsoBoughtRecommendations(callback) {
    this.recommend('ALSO_BOUGHT', null, callback);
    this.go();
  }

  // Convenience method for related products
  getRelatedRecommendations(callback) {
    this.recommend('RELATED', null, callback);
    this.go();
  }

  // Convenience method for popular products
  getPopularRecommendations(callback) {
    this.recommend('POPULAR', null, callback);
    this.go();
  }

  // Convenience method for category-based recommendations
  getCategoryRecommendations(callback) {
    this.recommend('CATEGORY', null, callback);
    this.go();
  }
}

const emarsysTracker = new EmarsysTracker();
export default emarsysTracker;
