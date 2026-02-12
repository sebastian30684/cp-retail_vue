<template>
  <div class="cookie-debug-container">
    <!-- Floating Cookie Button -->
    <button @click="togglePanel" class="cookie-debug-btn" :class="{ active: isPanelOpen }" title="Cookie & Tracking Debug">
      <span class="cookie-icon">&#x1F36A;</span>
    </button>

    <!-- Debug Panel -->
    <div v-if="isPanelOpen" class="cookie-debug-panel">
      <div class="debug-panel-header">
        <h3>Cookie & Tracking Debug</h3>
        <button @click="refreshData" class="header-action-btn" title="Refresh">&#x21BB;</button>
        <button @click="togglePanel" class="header-action-btn" title="Close">&times;</button>
      </div>

      <div class="debug-panel-body">
        <!-- Cookie Consent -->
        <div class="debug-section">
          <h4>Cookie Consent</h4>
          <div class="debug-row">
            <span class="status-dot" :class="consentStatus.given ? 'green' : 'red'"></span>
            <span>Consent Given: {{ consentStatus.given ? 'Yes' : 'No' }}</span>
          </div>
          <template v-if="consentStatus.details">
            <div class="debug-row sub">Necessary: {{ consentStatus.details.necessary ? 'Yes' : 'No' }}</div>
            <div class="debug-row sub">Analytics: {{ consentStatus.details.analytics ? 'Yes' : 'No' }}</div>
            <div class="debug-row sub">Marketing: {{ consentStatus.details.marketing ? 'Yes' : 'No' }}</div>
            <div class="debug-row sub">Timestamp: {{ consentStatus.details.timestamp || 'N/A' }}</div>
          </template>
        </div>

        <!-- Tracking Service (CDP/GTM) -->
        <div class="debug-section">
          <h4>Tracking Service (CDP / GTM)</h4>
          <div class="debug-row">
            <span class="status-dot" :class="trackingData.cdpReady ? 'green' : 'red'"></span>
            CDP Ready: {{ trackingData.cdpReady }}
          </div>
          <div class="debug-row">
            <span class="status-dot" :class="trackingData.gtmReady ? 'green' : 'red'"></span>
            GTM Ready: {{ trackingData.gtmReady }}
          </div>
          <div class="debug-row">
            <span class="status-dot" :class="trackingData.cookieConsent ? 'green' : 'red'"></span>
            Cookie Consent: {{ trackingData.cookieConsent }}
          </div>
          <div class="debug-row">Cookie ID: <code>{{ trackingData.cookieId || 'none' }}</code></div>
          <div class="debug-row">CDC UID: <code>{{ trackingData.cdcUid || 'none' }}</code></div>
          <div class="debug-row">User Email: <code>{{ trackingData.userEmail || 'none' }}</code></div>
          <div class="debug-row">Initial PageView: {{ trackingData.initialPageViewSent }}</div>
          <div class="debug-row">Event Queue: {{ trackingData.eventQueueLength }} items</div>
        </div>

        <!-- Emarsys -->
        <div class="debug-section">
          <h4>Emarsys (Scarab)</h4>
          <div class="debug-row">
            <span class="status-dot" :class="emarsysData.scarabReady ? 'green' : 'red'"></span>
            Scarab Ready: {{ emarsysData.scarabReady }}
          </div>
          <div class="debug-row">
            <span class="status-dot" :class="emarsysData.cookieConsent ? 'green' : 'red'"></span>
            Cookie Consent: {{ emarsysData.cookieConsent }}
          </div>
          <div class="debug-row">Customer Email: <code>{{ emarsysData.currentEmail || 'none' }}</code></div>
          <div class="debug-row">Event Queue: {{ emarsysData.eventQueueLength }} items</div>
        </div>

        <!-- SDK Globals -->
        <div class="debug-section">
          <h4>SDK Globals</h4>
          <div class="debug-row">
            <span class="status-dot" :class="sdkStatus.gigya ? 'green' : 'red'"></span>
            window.gigya: {{ sdkStatus.gigya ? 'loaded' : 'missing' }}
          </div>
          <div class="debug-row">
            <span class="status-dot" :class="sdkStatus.cdp ? 'green' : 'red'"></span>
            window.CDP: {{ sdkStatus.cdp ? 'loaded' : 'missing' }}
          </div>
          <div class="debug-row">
            <span class="status-dot" :class="sdkStatus.dataLayer ? 'green' : 'red'"></span>
            window.dataLayer: {{ sdkStatus.dataLayerInfo }}
          </div>
          <div class="debug-row">
            <span class="status-dot" :class="sdkStatus.scarabQueue ? 'green' : 'red'"></span>
            window.ScarabQueue: {{ sdkStatus.scarabQueueInfo }}
          </div>
        </div>

        <!-- Configuration IDs -->
        <div class="debug-section">
          <h4>Configuration</h4>
          <div class="debug-row sub">GTM: <code>GTM-KLF9JSGG</code></div>
          <div class="debug-row sub">CDP BU: <code>4_GJZtcJvXbmKrbEyYcnj4DQ</code></div>
          <div class="debug-row sub">CDP App: <code>HKWXOd7mUFGlSqEKU-kWVw</code></div>
          <div class="debug-row sub">Emarsys: <code>19DAA9D2B302671B</code></div>
          <div class="debug-row sub">Gigya: <code>4_e4HCkwemTAq9W_zLl4EZZw</code></div>
        </div>

        <!-- localStorage -->
        <div class="debug-section">
          <h4>localStorage</h4>
          <div class="debug-row">cookie-consent: <code>{{ localStorageData.cookieConsent || 'not set' }}</code></div>
          <div class="debug-row">tracking-consent: <code>{{ localStorageData.trackingConsent || 'not set' }}</code></div>
          <div class="debug-row">sap_visitor_id: <code>{{ localStorageData.visitorId || 'not set' }}</code></div>
          <div class="debug-row">cdp_profile_cache: <code>{{ localStorageData.cdpProfile || 'not set' }}</code></div>
        </div>
      </div>

      <div class="debug-panel-footer">
        <span>Last refresh: {{ lastRefreshTime }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import trackingService from '../utils/tracking-service.js'
import emarsysTracker from '../utils/emarsys-tracking.js'

export default {
  name: 'CookieDebugOverlay',
  setup() {
    const isPanelOpen = ref(false)
    const lastRefreshTime = ref('')
    const consentStatus = ref({})
    const trackingData = ref({})
    const emarsysData = ref({})
    const sdkStatus = ref({})
    const localStorageData = ref({})

    let refreshInterval = null

    const togglePanel = () => {
      isPanelOpen.value = !isPanelOpen.value
      if (isPanelOpen.value) {
        refreshData()
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }
    }

    const refreshData = () => {
      // Snapshot trackingService
      trackingData.value = {
        cookieConsent: trackingService.cookieConsent,
        cookieId: trackingService.cookieId,
        cdcUid: trackingService.cdcUid,
        userEmail: trackingService.userEmail,
        cdpReady: trackingService.cdpReady,
        gtmReady: trackingService.gtmReady,
        initialPageViewSent: trackingService.initialPageViewSent,
        eventQueueLength: trackingService.eventQueue?.length || 0
      }

      // Snapshot emarsysTracker
      emarsysData.value = {
        cookieConsent: emarsysTracker.cookieConsent,
        scarabReady: emarsysTracker.scarabReady,
        currentEmail: emarsysTracker.currentEmail,
        eventQueueLength: emarsysTracker.eventQueue?.length || 0
      }

      // Snapshot window globals
      sdkStatus.value = {
        gigya: !!window.gigya,
        cdp: !!window.CDP,
        dataLayer: !!window.dataLayer,
        dataLayerInfo: window.dataLayer ? `${window.dataLayer.length} entries` : 'missing',
        scarabQueue: !!(window.ScarabQueue && typeof window.ScarabQueue.push === 'function'),
        scarabQueueInfo: window.ScarabQueue
          ? (typeof window.ScarabQueue.length === 'number' ? `${window.ScarabQueue.length} entries` : 'active')
          : 'missing'
      }

      // Snapshot localStorage
      let parsedConsent = null
      try {
        const raw = localStorage.getItem('cookie-consent')
        if (raw) parsedConsent = JSON.parse(raw)
      } catch (e) { /* ignore */ }

      consentStatus.value = {
        given: !!parsedConsent,
        details: parsedConsent
      }

      localStorageData.value = {
        cookieConsent: parsedConsent
          ? `analytics: ${parsedConsent.analytics}, marketing: ${parsedConsent.marketing}`
          : null,
        trackingConsent: localStorage.getItem('tracking-consent'),
        visitorId: localStorage.getItem('sap_visitor_id') || getCookieValue('sap_visitor_id'),
        cdpProfile: localStorage.getItem('cdp_profile_cache') ? 'cached' : null
      }

      lastRefreshTime.value = new Date().toLocaleTimeString()
    }

    const getCookieValue = (name) => {
      try {
        const match = document.cookie.split('; ').find(c => c.startsWith(name + '='))
        return match ? match.split('=')[1] : null
      } catch (e) { return null }
    }

    const startAutoRefresh = () => {
      refreshInterval = setInterval(refreshData, 2000)
    }

    const stopAutoRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }

    const handleClickOutside = (event) => {
      if (!isPanelOpen.value) return
      if (!event.target.closest('.cookie-debug-container')) {
        isPanelOpen.value = false
        stopAutoRefresh()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      stopAutoRefresh()
    })

    return {
      isPanelOpen,
      lastRefreshTime,
      consentStatus,
      trackingData,
      emarsysData,
      sdkStatus,
      localStorageData,
      togglePanel,
      refreshData
    }
  }
}
</script>

<style scoped>
.cookie-debug-container {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 900;
  font-family: var(--sap-font, 'SAP 72', Arial, sans-serif);
}

.cookie-debug-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--sap-gray-3, #ccc);
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.cookie-debug-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-color: var(--sap-blue-6, #0070f2);
}

.cookie-debug-btn.active {
  border-color: var(--sap-blue-6, #0070f2);
  background: var(--sap-blue-1, #e8f0fe);
}

.cookie-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.cookie-debug-panel {
  position: absolute;
  bottom: 60px;
  left: 0;
  width: 380px;
  max-height: 70vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--sap-gray-2, #e0e0e0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: debugSlideUp 0.2s ease-out;
}

@keyframes debugSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.debug-panel-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--sap-blue-7, #0054b6), var(--sap-blue-9, #002a86));
  color: white;
  gap: 0.5rem;
}

.debug-panel-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  flex: 1;
}

.header-action-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1;
}

.header-action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.debug-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.debug-section {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--sap-gray-1, #f5f5f5);
  border-radius: 8px;
  border: 1px solid var(--sap-gray-2, #e0e0e0);
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--sap-blue-7, #0054b6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.debug-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--sap-gray-8, #444);
  padding: 0.15rem 0;
  line-height: 1.4;
}

.debug-row.sub {
  padding-left: 1.25rem;
  color: var(--sap-gray-6, #666);
  font-size: 0.75rem;
}

.debug-row code {
  background: var(--sap-gray-2, #e0e0e0);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.72rem;
  font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace;
  color: var(--sap-gray-9, #333);
  word-break: break-all;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.green {
  background: #36a41d;
  box-shadow: 0 0 4px rgba(54, 164, 29, 0.4);
}

.status-dot.red {
  background: #ee3939;
  box-shadow: 0 0 4px rgba(238, 57, 57, 0.4);
}

.debug-panel-footer {
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--sap-gray-2, #e0e0e0);
  font-size: 0.7rem;
  color: var(--sap-gray-5, #888);
  text-align: right;
}

@media (max-width: 480px) {
  .cookie-debug-panel {
    width: calc(100vw - 2rem);
    left: -0.5rem;
    max-height: 60vh;
  }
}
</style>
