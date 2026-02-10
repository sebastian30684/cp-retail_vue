// src/utils/tracking-service.js
// SAP CDP + GTM Integration for B2C Consumer Products & Retail

// Capitalize tier for CDP (bronze → Bronze, silver → Silver, etc.)
const capitalizeTier = (tier) => {
  if (!tier) return 'Bronze';
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
};

class TrackingService {
  constructor() {
    this.cookieConsent = false;
    this.cookieId = '';
    this.cdcUid = ''; // SAP CDC User ID (Gigya UID)
    this.userEmail = '';
    this.cdpReady = false;
    this.gtmReady = false;
    this.eventQueue = [];
    this.initialPageViewSent = false; // NEU: Verhindert doppelte initiale PageViews

    this.setupEventListeners();
    this.checkExistingConsent();
    this.waitForGTM();
    this.waitForCDP();
  }

  // Set user identity (called after login)
  setUser(cdcUid, email) {
    this.cdcUid = cdcUid || '';
    this.userEmail = email || '';
    console.log('👤 [Tracking] User set:', { cdcUid: this.cdcUid, email: this.userEmail });
  }

  // Clear user identity (called on logout)
  clearUser() {
    this.cdcUid = '';
    this.userEmail = '';
    console.log('👤 [Tracking] User cleared');
  }

  // NEU: Check localStorage für bereits gegebenen Consent
  checkExistingConsent() {
    try {
      // Check both cookie-consent (detailed) and tracking-consent (simple flag)
      const consentData = localStorage.getItem('cookie-consent');
      const trackingConsent = localStorage.getItem('tracking-consent');

      if (consentData) {
        const savedSettings = JSON.parse(consentData);
        if (savedSettings.analytics || savedSettings.marketing) {
          console.log('✅ Existing cookie consent found in localStorage - activating tracking');
          this.cookieConsent = true;
          this.cookieId = this.generateOrGetCookieId();
          console.log('🔄 Cookie ID generated:', this.cookieId);
        }
      } else if (trackingConsent === 'true') {
        // Fallback: simple tracking-consent flag (like b2b-shop)
        console.log('✅ Tracking consent flag found - activating tracking');
        this.cookieConsent = true;
        this.cookieId = this.generateOrGetCookieId();
        console.log('🔄 Cookie ID generated:', this.cookieId);
      }
    } catch (error) {
      console.error('❌ Error checking existing consent:', error);
    }
  }

  setupEventListeners() {
    document.addEventListener('cookie-consent-granted', (event) => {
      this.cookieConsent = true;
      this.cookieId = this.generateOrGetCookieId();
      console.log('✅ Cookie Consent gewährt, Cookie ID:', this.cookieId);
      this.startCDPTracking();
    });
  }

  // NEU: Warten auf GTM
  waitForGTM() {
    const checkGTM = () => {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        this.gtmReady = true;
        console.log('✅ GTM ready');
      } else {
        setTimeout(checkGTM, 100);
      }
    };
    checkGTM();
  }

  // Warten auf CDP SDK
  waitForCDP() {
    let attempts = 0;
    const maxAttempts = 40; // 20 Sekunden maximum

    const checkCDP = () => {
      attempts++;

      if (window.CDP && typeof window.CDP.report === 'function') {
        this.cdpReady = true;
        console.log('✅ SAP CDP ready nach', attempts, 'Versuchen');

        // Track CDP Init Event
        this.trackCDPInit();

        // Process queued events
        this.processEventQueue();
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ CDP Timeout nach', attempts, 'Versuchen - Events werden nur an GTM gesendet');
        this.processEventQueue(); // Process queue anyway, nur GTM
      } else {
        setTimeout(checkCDP, 500);
      }
    };
    checkCDP();
  }

  // Track CDP Initialization
  trackCDPInit() {
    console.log('📡 Tracking CDP Init Event');

    this.sendToGTM('cdp_initialized', {
      cdp_ready: true,
      timestamp: new Date().toISOString()
    });

    // Wenn bereits Cookie Consent vorhanden, starte Tracking
    if (this.cookieConsent) {
      this.startCDPTracking();
    }
  }

  // NEU: Event Queue verarbeiten
  processEventQueue() {
    if (this.eventQueue.length > 0) {
      console.log('📦 Verarbeite', this.eventQueue.length, 'queued events');

      this.eventQueue.forEach(queuedEvent => {
        const { method, args } = queuedEvent;
        this[method](...args);
      });

      this.eventQueue = [];
    }
  }

  generateOrGetCookieId() {
    let cookieId = this.getGACookieId();
    if (!cookieId) {
      cookieId = this.generateUniqueId();
      this.setCookie('sap_visitor_id', cookieId, 365);
    }
    return cookieId;
  }

  getGACookieId() {
    try {
      const cookies = document.cookie.split('; ');
      const gaCookie = cookies.find(cookie => cookie.indexOf('_ga=') === 0);
      return gaCookie ? gaCookie.split('=')[1] : '';
    } catch (e) {
      return '';
    }
  }

  generateUniqueId() {
    return 'sap_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  startCDPTracking() {
    if (!this.cookieConsent) {
      console.log('⏳ Kein Cookie Consent - warte...');
      return;
    }

    // Verhindere doppelte initiale PageViews
    if (this.initialPageViewSent) {
      console.log('📋 Initial PageView bereits gesendet - überspringe');
      return;
    }

    console.log('🚀 CDP Tracking startet jetzt!');
    this.initialPageViewSent = true;

    // WICHTIG: Automatischer PageView nach Consent
    // trackPageView hat bereits Queue-Logik falls CDP noch nicht ready ist
    this.trackPageView('consent_granted');
  }

  shouldTrack() {
    const canTrack = this.cookieConsent && this.cookieId;

    if (!canTrack) {
      console.log('⏸️ Tracking gesperrt:', {
        cookieConsent: this.cookieConsent,
        cookieId: !!this.cookieId,
        cdpReady: this.cdpReady,
        gtmReady: this.gtmReady
      });
    }

    return canTrack;
  }

  // TRACKING METHODS
  trackPageView(pageName = 'unknown') {
    if (!this.shouldTrack()) {
      console.log('⏸️ Page View gesperrt - kein Cookie Consent');
      return;
    }

    // NEU: Wenn CDP nicht ready, queuen
    if (!this.cdpReady && this.eventQueue.length < 10) {
      console.log('📋 CDP nicht ready - Event wird gequeuet:', pageName);
      this.eventQueue.push({
        method: 'trackPageView',
        args: [pageName]
      });
      return;
    }

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      "pageType": this.getPageType(),
      "pageTitle": document.title,
      "referrer": document.referrer || ''
      // "organizationId": "sap-cx-retail"
    };

    this.sendToCDP('PageView', cdpData);
    this.sendToGTM('page_view', {
      page_name: pageName,
      page_title: document.title,
      page_location: window.location.href
    });
  }

  trackProductView(product) {
    if (!this.shouldTrack()) return;

    // Queue if CDP not ready
    if (!this.cdpReady && this.eventQueue.length < 10) {
      this.eventQueue.push({
        method: 'trackProductView',
        args: [product]
      });
      return;
    }

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "products": [{
        "productId": product.id,
        "productName": product.productName,
        "productCategory": product.category,
        "productPrice": product.price
      }]
    };

    this.sendToCDP('ProductView', cdpData);
    this.sendToGTM('view_item', {
      currency: 'EUR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.productName,
        category: product.category,
        price: product.price
      }]
    });
  }

  trackAddToCart(product, quantity, cartItems) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "products": [{
        "productId": product.id,
        "productName": product.productName,
        "productCategory": product.category,
        "productPrice": product.price,
        "quantity": quantity
      }]
    };

    this.sendToCDP('AddToCart', cdpData);
    this.sendToGTM('add_to_cart', {
      currency: 'EUR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.productName,
        category: product.category,
        quantity: quantity,
        price: product.price
      }]
    });
  }

  trackAddToWishlist(product) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "products": [{
        "productId": product.id,
        "productName": product.productName,
        "productCategory": product.category,
        "productPrice": product.price
      }]
    };

    this.sendToCDP('AddToWishlist', cdpData);
    this.sendToGTM('add_to_wishlist', {
      currency: 'EUR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.productName,
        category: product.category,
        price: product.price
      }]
    });
  }

  trackCartView(cartItems) {
    if (!this.shouldTrack()) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const products = cartItems.map(item => ({
      "productId": item.id,
      "productName": item.productName,
      "productCategory": item.category,
      "productPrice": item.price,
      "quantity": item.quantity
    }));

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "products": products,
      "cartTotal": cartTotal,
      "cartItemCount": cartItemCount
    };

    this.sendToCDP('ViewCart', cdpData);
    this.sendToGTM('view_cart', {
      currency: 'EUR',
      value: cartTotal,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.productName,
        category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }

  trackCartAbandon(cartItems, timeSinceCreation = 0) {
    if (!this.shouldTrack()) return;
    if (!cartItems || cartItems.length === 0) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const products = cartItems.map(item => ({
      "productId": item.id,
      "productName": item.productName,
      "productCategory": item.category,
      "productAmount": item.price * item.quantity,
      "productPrice": item.price,
      "quantity": item.quantity
    }));

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "pageUrl": window.location.href,
      "cartTotal": cartTotal,
      "cartItemCount": cartItemCount,
      "timeSinceCreation": timeSinceCreation,
      // "organizationId": "sap-cx-retail",
      "products": products
    };

    this.sendToCDP('CartAbandon', cdpData);
    this.sendToGTM('cart_abandon', {
      currency: 'EUR',
      value: cartTotal,
      items_count: cartItemCount,
      time_since_creation: timeSinceCreation
    });

    console.log('🛒❌ Cart Abandon tracked after', timeSinceCreation, 'seconds');
  }

  trackFormSubmission(formData) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "formType": formData.formType || 'contact'
    };

    this.sendToCDP('FormSubmit', cdpData);
    this.sendToGTM('form_submit', {
      form_type: formData.formType || 'contact',
      company: formData.company || '',
      industry: formData.industry || ''
    });
  }

  trackServiceTicket(ticketData) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "primaryEmail": ticketData.email || this.userEmail || "",
      "ticketId": ticketData.ticketId,
      "category": ticketData.category,
      "priority": ticketData.priority,
      "subject": ticketData.subject || "",
      "description": ticketData.description || "",
      "bikeId": ticketData.bike_id || "",
      "bikeName": ticketData.bikeName || "",
      "ticketStatus": ticketData.status || "open"
    };

    // Add additional PII fields only for non-logged-in users (no cdcUid)
    if (!this.cdcUid) {
      cdpData.firstName = ticketData.firstName || "";
      cdpData.lastName = ticketData.lastName || "";
      cdpData.phone = ticketData.phone || "";
    }

    this.sendToCDP('Service Ticket', cdpData);
    this.sendToGTM('service_ticket_submitted', {
      ticket_id: ticketData.ticketId,
      category: ticketData.category,
      priority: ticketData.priority,
      has_bike: !!ticketData.bike_id
    });
  }

  trackSearch(query, resultsCount) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "searchQuery": query,
      "searchResultsCount": resultsCount
    };

    this.sendToCDP('Search', cdpData);
    this.sendToGTM('search', {
      search_term: query,
      results_count: resultsCount
    });
  }

  trackCheckout(step, option, cartItems) {
    if (!this.shouldTrack()) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const products = cartItems.map(item => ({
      "productId": item.id,
      "productName": item.productName,
      "productCategory": item.category,
      "productPrice": item.price,
      "quantity": item.quantity
    }));

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "checkoutStep": step,
      "checkoutOption": option,
      "products": products,
      "cartTotal": cartTotal
    };

    this.sendToCDP('CheckOut', cdpData);
    this.sendToGTM('begin_checkout', {
      currency: 'EUR',
      value: cartTotal,
      checkout_step: step,
      checkout_option: option,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.productName,
        category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }

  trackRemoveFromCart(product, quantity, cartItems) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "products": [{
        "productId": product.id,
        "productName": product.productName,
        "productCategory": product.category,
        "productPrice": product.price,
        "quantity": quantity
      }]
    };

    this.sendToCDP('RemoveFromCart', cdpData);
    this.sendToGTM('remove_from_cart', {
      currency: 'EUR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.productName,
        category: product.category,
        quantity: quantity,
        price: product.price
      }]
    });
  }

  trackLoyaltyActivity(activityType, pointsAmount, pointsBalance, options = {}) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      // "organizationId": "sap-cx-retail",
      "loyaltyActivity": {
        "activityType": activityType,
        "pointsAmount": pointsAmount,
        "pointsBalance": pointsBalance,
        "loyaltyTier": capitalizeTier(options.tier)
      },
      "loyaltyId": this.cdcUid
    };

    this.sendToCDP('LoyaltyActivity', cdpData);
    this.sendToGTM('loyalty_activity', {
      activity_type: activityType,
      points_amount: pointsAmount,
      points_balance: pointsBalance,
      loyalty_tier: capitalizeTier(options.tier)
    });
  }

  trackPurchase(orderData) {
    if (!this.shouldTrack()) return;

    const products = orderData.items.map(item => ({
      "productId": item.id,
      "productName": item.productName,
      "productCategory": item.category,
      "productPrice": item.price,
      "quantity": item.quantity
    }));

    // Extract bikes from products (bike categories: Road, Mountain, E-Bike, Gravel, Urban, etc.)
    const bikeCategories = ['road', 'mountain', 'e-bike', 'ebike', 'gravel', 'urban', 'city', 'touring', 'hybrid', 'bmx', 'cyclocross', 'triathlon', 'bike', 'mtb']
    const bike360 = orderData.items
      .filter(item => {
        const cat = item.category?.toLowerCase() || ''
        const productType = item.productType?.toLowerCase() || ''
        return bikeCategories.some(bc => cat.includes(bc)) || productType === 'bike'
      })
      .map(item => ({
        "bikeId": this.generateFrameNumber(item.brand, item.category),
        "bikeName": item.productName,
        "brand": item.brand || "Canyon",
        "category": item.category,
        "color": item.selectedColor || (item.colors?.split(',')[0]) || "",
        "year_of_manufacture": new Date().getFullYear(),
        "purchase_price": item.price,
        "warranty_status": "active",
        "warranty_end_date": this.calculateWarrantyEnd(2),
        "bike_status": "active",
        "groupset": item.groupset || "",
        "brakes": item.brakes || "",
        "frameMaterial": item.frameMaterial || "",
        "wheelSize": item.wheelSize || "",
        "suspension": item.suspension || "None",
        "weight": Number(item.weight) || 0,
        "size": item.selectedSize || (item.sizes?.split(',')[2]) || "M"
      }));

    // Loyalty data is now sent separately via LoyaltyActivity events (earnPoints/redeemPoints)
    const cdpData = {
      "cookieId": this.cookieId,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString(),
      "pageUrl": window.location.href,
      // "organizationId": "sap-cx-retail",
      "orderId": orderData.orderId || `ORD-${Date.now()}`,
      "amount": orderData.totalValue,
      "currency": orderData.currency || 'EUR',
      "products": products,
      "bike360": bike360
    };

    this.sendToCDP('Orders', cdpData);
    this.sendToGTM('purchase', {
      transaction_id: orderData.orderId,
      value: orderData.totalValue,
      currency: 'EUR',
      tax: orderData.tax || 0,
      items: orderData.items.map(item => ({
        item_id: item.id,
        item_name: item.productName,
        category: item.category,
        quantity: item.quantity,
        price: item.price
      })),
      bikes_purchased: bike360.length
    });
  }

  trackBikeMileage(bikeId, bikeName, totalKm) {
    if (!this.shouldTrack()) return;

    const cdpData = {
      "bikeId": bikeId,
      "bikeName": bikeName,
      "source": "strava",
      "total_mileage": Math.round(totalKm * 10) / 10,
      "cdcUid": this.cdcUid,
      "timestamp": new Date().toISOString()
    };

    this.sendToCDP('BikeMileageUpdate', cdpData);
    this.sendToGTM('bike_mileage_update', {
      bike_id: bikeId,
      bike_name: bikeName,
      total_mileage: Math.round(totalKm * 10) / 10,
      source: 'strava'
    });
  }

  calculateWarrantyEnd(years) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString();
  }

  // Generate unique frame number (Rahmennummer)
  // Format: BRAND-YEAR-RANDOM (e.g., CYN-26-A7X9K2)
  generateFrameNumber(brand, category) {
    const brandCode = (brand || 'UNK').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${brandCode}-${year}-${random}`;
  }

  // UTILITY METHODS
  sendToCDP(eventName, data) {
    if (!this.cdpReady) {
      console.log(`⏸️ CDP nicht ready - ${eventName} wird nur an GTM gesendet`);
      return;
    }

    try {
      console.log(`📤 CDP ${eventName}:`, data);
      window.CDP.report(eventName, data)
        .then(response => console.log(`✅ CDP ${eventName} Success:`, response))
        .catch(error => console.error(`❌ CDP ${eventName} Error:`, error));
    } catch (error) {
      console.error(`❌ CDP ${eventName} Exception:`, error);
    }
  }

  sendToGTM(eventName, data) {
    if (!this.gtmReady) {
      console.log(`⏸️ GTM nicht ready - ${eventName} wird nicht gesendet`);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...data,
      cookieId: this.cookieId,
      timestamp: new Date().toISOString()
    });
    console.log(`📤 GTM ${eventName}:`, data);
  }

  getPageType() {
    const url = window.location.pathname;
    if (url === '/' || url === '') return 'homepage';
    if (url.includes('/shop') || url.includes('shop')) return 'shop';
    if (url.includes('/product/')) return 'product';
    if (url.includes('/cart')) return 'cart';
    if (url.includes('/checkout')) return 'checkout';
    if (url.includes('/account')) return 'account';
    if (url.includes('/search')) return 'search';
    return 'other';
  }

}

const trackingService = new TrackingService();
export default trackingService;
