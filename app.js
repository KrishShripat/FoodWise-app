/**
 * Love Food — Interactive Application Controller
 * AI for Business & Commerce Hackathon Prototype
 */

// Application State
const AppState = {
  activeTab: 'dashboard',
  stats: {
    wasteReducedKg: 847,
    costSavingsInr: 2340,
    ngoPartners: 12,
    carbonFootprintTons: 1.2
  },
  surplusItems: [
    { id: 1, name: 'Fresh Vegetables', quantity: '45 kg', expiry: '2 days', status: 'ready', category: 'Produce' },
    { id: 2, name: 'Bread & Pastries', quantity: '23 units', expiry: '1 day', status: 'urgent', category: 'Bakery' },
    { id: 3, name: 'Dairy Products', quantity: '18 kg', expiry: '3 days', status: 'ready', category: 'Dairy' },
    { id: 4, name: 'Fresh Vegetables', quantity: '32 portions', expiry: '4 hours', status: 'urgent', category: 'Prepared' }
  ],
  redistributions: [
    { id: 1, ngo: 'Food Bank Central', location: 'Noida Sec 63', status: 'in-transit', statusText: 'In Transit', time: '2 hours ago' },
    { id: 2, ngo: 'Food Bank Central', location: 'Mayur Vihar Phase 3', status: 'delivered', statusText: '✓ Delivered', time: '4 hours ago' },
    { id: 3, ngo: 'Homeless Shelter', location: 'West Side', status: 'scheduled', statusText: '⚠ Scheduled', time: 'Tomorrow 9 AM' }
  ],
  pptSlide: 0
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModals();
  setupRescuePlanner();
  setupAiForecaster();
  setupWasteScanner();
  setupPptDeck();
  renderSurplusList();
  renderRedistributions();
});

// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `<span style="color:#22c55e; font-weight:700;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navigation between Tabs
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-tab]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Action Buttons on Hero
  const manageInvBtn = document.getElementById('heroManageInvBtn');
  if (manageInvBtn) {
    manageInvBtn.addEventListener('click', () => switchTab('surplus'));
  }

  const viewAnalyticsBtn = document.getElementById('heroViewAnalyticsBtn');
  if (viewAnalyticsBtn) {
    viewAnalyticsBtn.addEventListener('click', () => switchTab('analytics'));
  }

  // Quick Action Buttons
  const qaAddSurplus = document.getElementById('qaAddSurplus');
  if (qaAddSurplus) qaAddSurplus.addEventListener('click', () => openModal('addSurplusModal'));

  const qaContactNgo = document.getElementById('qaContactNgo');
  if (qaContactNgo) qaContactNgo.addEventListener('click', () => openModal('contactNgoModal'));

  const qaViewReports = document.getElementById('qaViewReports');
  if (qaViewReports) qaViewReports.addEventListener('click', () => switchTab('reports'));

  const qaImpactAnalysis = document.getElementById('qaImpactAnalysis');
  if (qaImpactAnalysis) qaImpactAnalysis.addEventListener('click', () => switchTab('analytics'));

  // Frame Toggle
  const toggleFrameBtn = document.getElementById('toggleFrameBtn');
  if (toggleFrameBtn) {
    toggleFrameBtn.addEventListener('click', () => {
      const frameWrapper = document.querySelector('.device-frame-wrapper');
      const notchBar = document.querySelector('.screen-notch-bar');
      if (frameWrapper) {
        frameWrapper.classList.toggle('borderless-view');
        if (frameWrapper.classList.contains('borderless-view')) {
          frameWrapper.style.padding = '0';
          frameWrapper.style.background = 'none';
          document.querySelector('.device-frame').style.borderRadius = '0';
          document.querySelector('.device-frame').style.boxShadow = 'none';
          if (notchBar) notchBar.style.display = 'none';
          toggleFrameBtn.innerHTML = '💻 Show Device Frame';
        } else {
          frameWrapper.style.padding = '16px';
          frameWrapper.style.background = 'radial-gradient(circle at 90% 10%, #dcfce7 0%, #f1f5f9 45%, #e2e8f0 100%)';
          document.querySelector('.device-frame').style.borderRadius = '24px';
          document.querySelector('.device-frame').style.boxShadow = '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 10px #1e293b, 0 0 0 12px #334155';
          if (notchBar) notchBar.style.display = 'flex';
          toggleFrameBtn.innerHTML = '🖥️ Fullscreen View';
        }
      }
    });
  }
}

function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Update nav links active class
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update tab views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active-tab');
  });

  const activeView = document.getElementById(`tab-${tabId}`);
  if (activeView) {
    activeView.classList.add('active-tab');
  }

  // Scroll to top of main content
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.scrollTop = 0;

  // Auto-resize iframe for seamless display
  setTimeout(notifyHeight, 60);
}

// Render Surplus Inventory Rows on Dashboard
function renderSurplusList() {
  const container = document.getElementById('surplusItemsList');
  if (!container) return;

  container.innerHTML = AppState.surplusItems.map(item => `
    <div class="surplus-item-row" data-id="${item.id}">
      <div class="item-left-info">
        <span class="item-name">${item.name}</span>
        <span class="item-qty">Quantity: ${item.quantity}</span>
      </div>
      <div class="item-right-status">
        <span class="item-time">🕒 ${item.expiry}</span>
        <span class="status-pill ${item.status}">${item.status === 'urgent' ? 'Urgent' : 'Ready'}</span>
      </div>
    </div>
  `).join('');
}

// Render Active Redistributions on Dashboard
function renderRedistributions() {
  const container = document.getElementById('redistributionList');
  if (!container) return;

  container.innerHTML = AppState.redistributions.map(item => `
    <div class="redistribution-card" data-id="${item.id}">
      <span class="ngo-title">${item.ngo}</span>
      <span class="ngo-location">📍 ${item.location}</span>
      <div class="redistribution-bottom-row">
        <span class="status-pill ${item.status}">${item.statusText}</span>
        <span class="redistribution-time">${item.time}</span>
      </div>
    </div>
  `).join('');
}

// Modals Handling
function setupModals() {
  // Close buttons
  document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('open'));
    });
  });

  // Close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Add Surplus Form Submission
  const addSurplusForm = document.getElementById('addSurplusForm');
  if (addSurplusForm) {
    addSurplusForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('surplusName').value;
      const quantity = document.getElementById('surplusQuantity').value;
      const expiry = document.getElementById('surplusExpiry').value;
      const status = document.getElementById('surplusUrgency').value;
      const category = document.getElementById('surplusCategory').value;

      const newItem = {
        id: Date.now(),
        name,
        quantity,
        expiry,
        status,
        category
      };

      AppState.surplusItems.unshift(newItem);
      renderSurplusList();
      closeModal('addSurplusModal');
      showToast(`Added ${name} (${quantity}) to Surplus Inventory!`);
      addSurplusForm.reset();
    });
  }

  // Contact NGO Form Submission
  const contactNgoForm = document.getElementById('contactNgoForm');
  if (contactNgoForm) {
    contactNgoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ngo = document.getElementById('ngoSelect').value;
      const items = document.getElementById('ngoItemSelect').value;
      const pickupTime = document.getElementById('ngoPickupTime').value;

      AppState.redistributions.unshift({
        id: Date.now(),
        ngo: ngo.split(' - ')[0],
        location: ngo.split(' - ')[1] || 'Assigned Center',
        status: 'scheduled',
        statusText: '⚠️ Scheduled',
        time: pickupTime || 'In 1 hour'
      });

      renderRedistributions();
      closeModal('contactNgoModal');
      showToast(`Redistribution scheduled with ${ngo.split(' - ')[0]}!`);
      contactNgoForm.reset();
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Smart Surplus Rescue Planner Logic (Bakery & Food Service)
function setupRescuePlanner() {
  const itemsInput = document.getElementById('plannerItems');
  const priceInput = document.getElementById('plannerPrice');
  const discountInput = document.getElementById('plannerDiscount');
  const sellThroughInput = document.getElementById('plannerSellThrough');

  const discountVal = document.getElementById('plannerDiscountVal');
  const sellThroughVal = document.getElementById('plannerSellThroughVal');

  const metricDiscPrice = document.getElementById('metricDiscPrice');
  const metricRevenueRec = document.getElementById('metricRevenueRec');
  const metricItemsLeft = document.getElementById('metricItemsLeft');
  const rescueSummaryText = document.getElementById('rescueSummaryText');

  function calculateRescue() {
    if (!itemsInput || !priceInput || !discountInput || !sellThroughInput) return;

    const items = parseInt(itemsInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const discount = parseInt(discountInput.value) || 0;
    const sellThrough = parseInt(sellThroughInput.value) || 0;

    if (discountVal) discountVal.textContent = `${discount}%`;
    if (sellThroughVal) sellThroughVal.textContent = `${sellThrough}%`;

    const discountedPrice = price * (1 - discount / 100);
    const itemsSold = Math.round(items * sellThrough / 100);
    const itemsLeft = Math.max(0, items - itemsSold);
    const revenueRecovered = itemsSold * discountedPrice;

    if (metricDiscPrice) metricDiscPrice.textContent = `₹${discountedPrice.toFixed(2)}`;
    if (metricRevenueRec) metricRevenueRec.textContent = `₹${revenueRecovered.toFixed(2)}`;
    if (metricItemsLeft) metricItemsLeft.textContent = itemsLeft.toString();

    if (rescueSummaryText) {
      rescueSummaryText.innerHTML = `
        <strong>Rescue Strategy:</strong> Offer <strong>${items}</strong> items at 
        <strong>₹${discountedPrice.toFixed(2)}</strong> (${discount}% off). Estimated 
        <strong>${itemsSold}</strong> items sold recovering <strong>₹${revenueRecovered.toFixed(2)}</strong>. 
        Remaining <strong>${itemsLeft}</strong> items can be safely dispatched to <em>Food Bank Central</em>.
      `;
    }
  }

  [itemsInput, priceInput, discountInput, sellThroughInput].forEach(elem => {
    if (elem) elem.addEventListener('input', calculateRescue);
  });

  const runRescueBtn = document.getElementById('runRescueBtn');
  if (runRescueBtn) {
    runRescueBtn.addEventListener('click', (e) => {
      e.preventDefault();
      calculateRescue();
      showToast('Rescue plan generated & saved to inventory!');
    });
  }

  calculateRescue();
}

// AI Demand Forecaster & Recommendation Engine
function setupAiForecaster() {
  const runForecastBtn = document.getElementById('runForecastBtn');
  if (!runForecastBtn) return;

  runForecastBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const store = document.getElementById('fcStore').value;
    const weather = document.getElementById('fcWeather').value;
    const orderPlan = document.getElementById('fcOrder').value;

    // Simulate ML model execution based on features
    let predictedSalesZ = 0.12;
    if (weather.includes('Rainy')) predictedSalesZ -= 0.65;
    if (weather.includes('Sunny')) predictedSalesZ += 0.45;
    if (store === 'store_0' || store === 'store_4') predictedSalesZ += 0.25;

    // Surplus Risk calculation
    const orderZMap = { 'Much lower': -1.5, 'Lower': -0.75, 'About average': 0.0, 'Higher': 0.75, 'Much higher': 1.5, 'Skip': 0.0 };
    const orderZ = orderZMap[orderPlan] || 0.0;
    const surplusGap = orderZ - predictedSalesZ;

    let surplusRisk = 'Low';
    let riskColor = '#16a34a';
    if (surplusGap > 0.4) {
      surplusRisk = 'High';
      riskColor = '#ef4444';
    } else if (surplusGap > 0.1) {
      surplusRisk = 'Moderate';
      riskColor = '#ea580c';
    }

    // AI Generated Text (mimicking FLAN-T5 fine-tuned model)
    let aiAdvice = '';
    if (surplusRisk === 'High') {
      aiAdvice = `AI Recommendation: Predicted footfall for ${store} is subdued due to forecasted weather conditions. Recommend trimming fresh baked goods and perishable prep by 22% to avoid surplus waste.`;
    } else if (surplusRisk === 'Moderate') {
      aiAdvice = `AI Recommendation: Demand is tracking near baseline for ${store}. Maintain core batch sizes but schedule an afternoon flash discount if sell-through lags past 3 PM.`;
    } else {
      aiAdvice = `AI Recommendation: Strong demand signal projected (+${(predictedSalesZ * 15).toFixed(1)}% above average). Stock levels are optimal; high probability of full inventory clearance.`;
    }

    const resultBox = document.getElementById('forecastResultBox');
    if (resultBox) {
      resultBox.style.display = 'block';
      document.getElementById('fcScoreMetric').textContent = predictedSalesZ.toFixed(3);
      const riskBadge = document.getElementById('fcRiskMetric');
      riskBadge.textContent = surplusRisk;
      riskBadge.style.color = riskColor;
      document.getElementById('fcAdviceText').textContent = aiAdvice;
      resultBox.scrollIntoView({ behavior: 'smooth' });
    }

    showToast('AI Demand Forecast generated successfully!');
  });
}

// AI Computer Vision Waste Scanner Simulation
function setupWasteScanner() {
  const scanTrigger = document.getElementById('triggerScanBtn');
  if (!scanTrigger) return;

  scanTrigger.addEventListener('click', () => {
    const scannerLoading = document.getElementById('scannerLoading');
    const scannerResult = document.getElementById('scannerResult');
    if (scannerLoading) scannerLoading.style.display = 'block';
    if (scannerResult) scannerResult.style.display = 'none';

    setTimeout(() => {
      if (scannerLoading) scannerLoading.style.display = 'none';
      if (scannerResult) {
        scannerResult.style.display = 'block';
        showToast('AI Waste Scanner: 3 food categories detected!');
      }
    }, 1200);
  });
}

// Hackathon PPT Pitch Deck Presentation Mode
const PPT_SLIDES = [
  {
    tag: 'Slide 1 / 5 • The Problem',
    title: 'The Multi-Billion Dollar Food Waste Dilemma in Retail & Food Service',
    content: `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:20px;">
        <div style="background:#1f2937; padding:20px; border-radius:12px; border-left:4px solid #ef4444;">
          <h4 style="color:#ef4444; font-size:16px; margin-bottom:8px;">Operational Inefficiencies</h4>
          <p style="font-size:14px; color:#cbd5e1; line-height:1.6;">
            • Retailers & restaurants discard up to <strong>15–30% of daily inventory</strong> due to unpredictable weather, footfall swings, and static ordering.
          </p>
          <p style="font-size:14px; color:#cbd5e1; line-height:1.6; margin-top:8px;">
            • Financial loss of ₹2.5 Lakhs+ per store annually in preventable shrink.
          </p>
        </div>
        <div style="background:#1f2937; padding:20px; border-radius:12px; border-left:4px solid #ea580c;">
          <h4 style="color:#ea580c; font-size:16px; margin-bottom:8px;">Environmental & Social Crisis</h4>
          <p style="font-size:14px; color:#cbd5e1; line-height:1.6;">
            • Food rotting in landfills accounts for <strong>8-10% of global greenhouse gases</strong>.
          </p>
          <p style="font-size:14px; color:#cbd5e1; line-height:1.6; margin-top:8px;">
            • Meanwhile, local communities and shelters face daily meal deficits within a 5km radius.
          </p>
        </div>
      </div>
    `
  },
  {
    tag: 'Slide 2 / 5 • The Solution',
    title: 'Love Food Intelligence: Closed-Loop AI Food Optimization',
    content: `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-top:20px;">
        <div style="background:#1f2937; padding:20px; border-radius:12px; border-top:4px solid #16a34a;">
          <h4 style="color:#22c55e; font-size:15px; margin-bottom:8px;">1. AI Demand Forecasting</h4>
          <p style="font-size:13px; color:#94a3b8; line-height:1.5;">
            Gradient Boosting models predict store-level demand using historical sales, hyper-local weather, and calendar events.
          </p>
        </div>
        <div style="background:#1f2937; padding:20px; border-radius:12px; border-top:4px solid #0284c7;">
          <h4 style="color:#38bdf8; font-size:15px; margin-bottom:8px;">2. Dynamic Surplus Rescue</h4>
          <p style="font-size:13px; color:#94a3b8; line-height:1.5;">
            Automated pricing algorithm converts impending perishables into discounted customer deals before expiry.
          </p>
        </div>
        <div style="background:#1f2937; padding:20px; border-radius:12px; border-top:4px solid #a855f7;">
          <h4 style="color:#c084fc; font-size:15px; margin-bottom:8px;">3. Instant NGO Routing</h4>
          <p style="font-size:13px; color:#94a3b8; line-height:1.5;">
            One-click logistics routing dispatches unsold edible food to verified NGOs (Noida, Delhi NCR) in real time.
          </p>
        </div>
      </div>
    `
  },
  {
    tag: 'Slide 3 / 5 • AI / ML Architecture',
    title: 'Machine Learning Pipeline & Generative Recommendations',
    content: `
      <div style="background:#1f2937; padding:24px; border-radius:14px; margin-top:20px;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div>
            <h4 style="color:#f8fafc; font-size:15px; margin-bottom:10px;">Predictive Core (Scikit-Learn)</h4>
            <ul style="font-size:13.5px; color:#94a3b8; line-height:1.7; padding-left:18px;">
              <li><strong>Algorithm:</strong> Gradient Boosting Regressor (R² = 0.83, RMSE = 0.34)</li>
              <li><strong>Features:</strong> Temperature (min/max/mean), Sunshine sum, Rain, Holidays, Day of Week</li>
              <li><strong>Leakage-free:</strong> Preprocessed without target leakage</li>
            </ul>
          </div>
          <div>
            <h4 style="color:#f8fafc; font-size:15px; margin-bottom:10px;">Generative AI (FLAN-T5 Base)</h4>
            <ul style="font-size:13.5px; color:#94a3b8; line-height:1.7; padding-left:18px;">
              <li><strong>Offline Inference:</strong> Local CPU execution without paid APIs</li>
              <li><strong>Manager Advice:</strong> Translates mathematical z-scores into actionable ordering guidance</li>
              <li><strong>Surplus Risk:</strong> Real-time Low / Moderate / High classification</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    tag: 'Slide 4 / 5 • Business & Environmental Impact',
    title: 'Quantified ROI & ESG Sustainability Metrics',
    content: `
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-top:24px;">
        <div style="background:#1f2937; padding:20px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#22c55e;">847 kg</div>
          <div style="font-size:13px; color:#94a3b8; margin-top:4px;">Food Waste Reduced</div>
        </div>
        <div style="background:#1f2937; padding:20px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#f59e0b;">₹2,340 / wk</div>
          <div style="font-size:13px; color:#94a3b8; margin-top:4px;">Direct Cost Recovered</div>
        </div>
        <div style="background:#1f2937; padding:20px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#38bdf8;">12 NGOs</div>
          <div style="font-size:13px; color:#94a3b8; margin-top:4px;">Active Partnerships</div>
        </div>
        <div style="background:#1f2937; padding:20px; border-radius:12px; text-align:center;">
          <div style="font-size:28px; font-weight:800; color:#f43f5e;">1.2 Tons</div>
          <div style="font-size:13px; color:#94a3b8; margin-top:4px;">CO2 Equivalent Prevented</div>
        </div>
      </div>
    `
  },
  {
    tag: 'Slide 5 / 5 • Market Opportunity & Roadmap',
    title: 'Scalability Across Food Service & Retail Chains',
    content: `
      <div style="background:#1f2937; padding:24px; border-radius:14px; margin-top:20px;">
        <h4 style="color:#22c55e; font-size:16px; margin-bottom:12px;">Go-To-Market & Scalability Vectors</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:13.5px; color:#cbd5e1; line-height:1.6;">
          <div>
            <strong>Phase 1: Quick-Service Restaurants & Bakeries</strong><br>
            Deploy demand forecasting to optimize short-shelf-life goods with 90%+ sell-through.
          </div>
          <div>
            <strong>Phase 2: Supermarket Retail Chains</strong><br>
            Integrate with POS inventory systems for automated dynamic discounting & tax-deductible donation receipts.
          </div>
        </div>
      </div>
    `
  }
];

function setupPptDeck() {
  const openPptBtn = document.getElementById('openPptBtn');
  const closePptBtn = document.getElementById('closePptBtn');
  const overlay = document.getElementById('pptOverlay');
  const prevBtn = document.getElementById('pptPrevBtn');
  const nextBtn = document.getElementById('pptNextBtn');

  if (openPptBtn && overlay) {
    openPptBtn.addEventListener('click', () => {
      overlay.classList.add('open');
      renderSlide();
    });
  }

  if (closePptBtn && overlay) {
    closePptBtn.addEventListener('click', () => overlay.classList.remove('open'));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (AppState.pptSlide > 0) {
        AppState.pptSlide--;
        renderSlide();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (AppState.pptSlide < PPT_SLIDES.length - 1) {
        AppState.pptSlide++;
        renderSlide();
      }
    });
  }
}

function renderSlide() {
  const current = PPT_SLIDES[AppState.pptSlide];
  const slideTag = document.getElementById('pptSlideTag');
  const slideTitle = document.getElementById('pptSlideTitle');
  const slideContent = document.getElementById('pptSlideContent');
  const slideCounter = document.getElementById('pptSlideCounter');

  if (slideTag) slideTag.textContent = current.tag;
  if (slideTitle) slideTitle.textContent = current.title;
  if (slideContent) slideContent.innerHTML = current.content;
  if (slideCounter) slideCounter.textContent = `${AppState.pptSlide + 1} / ${PPT_SLIDES.length}`;
}

// Auto-adjust Streamlit iframe height
function notifyHeight() {
  try {
    const mainContent = document.querySelector('.main-content');
    const scrollH = document.documentElement.scrollHeight || document.body.scrollHeight;
    const contentH = mainContent ? mainContent.scrollHeight + 80 : 880;
    const targetH = Math.max(scrollH, contentH, 880);
    window.parent.postMessage({ type: 'streamlit:setFrameHeight', height: targetH }, '*');
  } catch (e) {}
}

window.addEventListener('load', () => setTimeout(notifyHeight, 100));
window.addEventListener('resize', () => setTimeout(notifyHeight, 100));
