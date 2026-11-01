/**
 * CalorieTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * 100% Client-Side with Persistent LocalStorage
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY = 'calorietrack_store_v1';

  // Default Quick Food Presets
  const FOOD_PRESETS = [
    { name: '🍳 2 Scrambled Eggs', meal: 'Breakfast', serving: '2 large eggs', cals: 180, p: 12, c: 1, f: 14 },
    { name: '🥣 Oatmeal with Berries', meal: 'Breakfast', serving: '1 bowl (40g oats)', cals: 260, p: 8, c: 48, f: 4 },
    { name: '🥑 Avocado Toast', meal: 'Breakfast', serving: '1 slice sourdough', cals: 240, p: 5, c: 24, f: 14 },
    { name: '🍗 Grilled Chicken Breast', meal: 'Lunch', serving: '150g breast', cals: 245, p: 46, c: 0, f: 5 },
    { name: '🥗 Caesar Salad with Chicken', meal: 'Lunch', serving: '1 bowl', cals: 380, p: 26, c: 14, f: 24 },
    { name: '🥪 Turkey & Cheese Sandwich', meal: 'Lunch', serving: '1 sandwich', cals: 410, p: 28, c: 42, f: 14 },
    { name: '🥩 Steak & Sweet Potato', meal: 'Dinner', serving: '180g sirloin + potato', cals: 580, p: 48, c: 44, f: 18 },
    { name: '🐟 Baked Salmon & Asparagus', meal: 'Dinner', serving: '1 fillet (170g)', cals: 420, p: 38, c: 6, f: 26 },
    { name: '🍚 White / Brown Rice', meal: 'Dinner', serving: '1 cup cooked', cals: 210, p: 4.5, c: 45, f: 1 },
    { name: '🍌 Fresh Banana', meal: 'Snacks', serving: '1 medium (118g)', cals: 105, p: 1.3, c: 27, f: 0.3 },
    { name: '🍎 Apple with Peanut Butter', meal: 'Snacks', serving: '1 apple + 1 tbsp PB', cals: 190, p: 4.5, c: 28, f: 8 },
    { name: '🥛 Greek Yogurt (0% Fat)', meal: 'Snacks', serving: '1 cup (170g)', cals: 100, p: 17, c: 6, f: 0 },
    { name: '🍫 Whey Protein Shake', meal: 'Snacks', serving: '1 scoop with water', cals: 130, p: 25, c: 3, f: 1.5 }
  ];

  // Default Initial State
  const DEFAULT_STATE = {
    goals: {
      calories: 2000,
      protein: 130,
      carbs: 220,
      fat: 65,
      water: 8 // glasses
    },
    days: {}
  };

  // Application State
  let appState = null;
  let currentDate = new Date();

  // DOM Elements Cache
  const elements = {
    // Header & Date Controls
    prevDayBtn: document.getElementById('prevDayBtn'),
    nextDayBtn: document.getElementById('nextDayBtn'),
    todayQuickBtn: document.getElementById('todayQuickBtn'),
    dateDisplayBtn: document.getElementById('dateDisplayBtn'),
    dateDisplayLabel: document.getElementById('dateDisplayLabel'),
    datePickerInput: document.getElementById('datePickerInput'),

    // Calorie Overview
    budgetStatusPill: document.getElementById('budgetStatusPill'),
    metricGoal: document.getElementById('metricGoal'),
    metricConsumed: document.getElementById('metricConsumed'),
    metricRemaining: document.getElementById('metricRemaining'),
    remainingLabel: document.getElementById('remainingLabel'),
    calorieProgressBar: document.getElementById('calorieProgressBar'),
    percentConsumedText: document.getElementById('percentConsumedText'),
    overUnderText: document.getElementById('overUnderText'),

    // Macros
    macroCaloriesSum: document.getElementById('macroCaloriesSum'),
    proteinCurrent: document.getElementById('proteinCurrent'),
    proteinGoal: document.getElementById('proteinGoal'),
    proteinPercent: document.getElementById('proteinPercent'),
    proteinBar: document.getElementById('proteinBar'),
    carbsCurrent: document.getElementById('carbsCurrent'),
    carbsGoal: document.getElementById('carbsGoal'),
    carbsPercent: document.getElementById('carbsPercent'),
    carbsBar: document.getElementById('carbsBar'),
    fatCurrent: document.getElementById('fatCurrent'),
    fatGoal: document.getElementById('fatGoal'),
    fatPercent: document.getElementById('fatPercent'),
    fatBar: document.getElementById('fatBar'),

    // Water Tracker
    waterText: document.getElementById('waterText'),
    waterCupsContainer: document.getElementById('waterCupsContainer'),
    addWaterBtn: document.getElementById('addWaterBtn'),
    subWaterBtn: document.getElementById('subWaterBtn'),

    // Meals Subtotals & Lists
    mealLists: {
      Breakfast: document.getElementById('list-Breakfast'),
      Lunch: document.getElementById('list-Lunch'),
      Dinner: document.getElementById('list-Dinner'),
      Snacks: document.getElementById('list-Snacks')
    },
    mealSubtotals: {
      Breakfast: document.getElementById('subtotal-Breakfast'),
      Lunch: document.getElementById('subtotal-Lunch'),
      Dinner: document.getElementById('subtotal-Dinner'),
      Snacks: document.getElementById('subtotal-Snacks')
    },

    // Chart & Weekly Stats
    weeklyCanvas: document.getElementById('weeklyCanvas'),
    weeklyAvgVal: document.getElementById('weeklyAvgVal'),
    weeklySuccessDays: document.getElementById('weeklySuccessDays'),
    totalLoggedItems: document.getElementById('totalLoggedItems'),

    // Modals & Buttons
    openAddFoodModalBtn: document.getElementById('openAddFoodModalBtn'),
    foodModal: document.getElementById('foodModal'),
    foodForm: document.getElementById('foodForm'),
    foodModalTitle: document.getElementById('foodModalTitle'),
    closeFoodModalBtn: document.getElementById('closeFoodModalBtn'),
    cancelFoodModalBtn: document.getElementById('cancelFoodModalBtn'),
    presetPillsContainer: document.getElementById('presetPillsContainer'),
    editFoodId: document.getElementById('editFoodId'),
    foodNameInput: document.getElementById('foodNameInput'),
    foodMealSelect: document.getElementById('foodMealSelect'),
    foodServingInput: document.getElementById('foodServingInput'),
    foodCaloriesInput: document.getElementById('foodCaloriesInput'),
    foodProteinInput: document.getElementById('foodProteinInput'),
    foodCarbsInput: document.getElementById('foodCarbsInput'),
    foodFatInput: document.getElementById('foodFatInput'),

    // Goals Modal
    openGoalsBtn: document.getElementById('openGoalsBtn'),
    goalsModal: document.getElementById('goalsModal'),
    goalsForm: document.getElementById('goalsForm'),
    closeGoalsModalBtn: document.getElementById('closeGoalsModalBtn'),
    cancelGoalsModalBtn: document.getElementById('cancelGoalsModalBtn'),
    goalCaloriesInput: document.getElementById('goalCaloriesInput'),
    goalProteinInput: document.getElementById('goalProteinInput'),
    goalCarbsInput: document.getElementById('goalCarbsInput'),
    goalFatInput: document.getElementById('goalFatInput'),
    goalWaterInput: document.getElementById('goalWaterInput'),

    // Data Management Modal
    openDataBtn: document.getElementById('openDataBtn'),
    dataModal: document.getElementById('dataModal'),
    closeDataModalBtn: document.getElementById('closeDataModalBtn'),
    closeDataModalFooterBtn: document.getElementById('closeDataModalFooterBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importFileInput: document.getElementById('importFileInput'),
    resetAllDataBtn: document.getElementById('resetAllDataBtn'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  /* ============================================================
     Initialization & Storage Helpers
     ============================================================ */

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        appState = JSON.parse(raw);
        // Ensure structure validity
        if (!appState.goals) appState.goals = { ...DEFAULT_STATE.goals };
        if (!appState.days) appState.days = {};
        return;
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }

    // Seed default starter data
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    seedSampleData();
    saveState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
      showToast('Storage error: browser storage might be full.', 'danger');
    }
  }

  function seedSampleData() {
    const todayKey = formatDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoKey = formatDateKey(twoDaysAgo);

    // Starter foods for today
    appState.days[todayKey] = {
      water: 4,
      foods: [
        {
          id: 'sample-1',
          name: 'Scrambled Eggs with Avocado Toast',
          meal: 'Breakfast',
          serving: '2 eggs + 1 slice sourdough',
          calories: 420,
          protein: 17,
          carbs: 25,
          fat: 28,
          timestamp: Date.now() - 1000 * 60 * 240
        },
        {
          id: 'sample-2',
          name: 'Grilled Chicken Caesar Salad',
          meal: 'Lunch',
          serving: '1 bowl with dressing',
          calories: 520,
          protein: 42,
          carbs: 18,
          fat: 31,
          timestamp: Date.now() - 1000 * 60 * 90
        },
        {
          id: 'sample-3',
          name: 'Greek Yogurt with Blueberries & Honey',
          meal: 'Snacks',
          serving: '1 cup (170g)',
          calories: 165,
          protein: 18,
          carbs: 22,
          fat: 1.5,
          timestamp: Date.now() - 1000 * 60 * 30
        }
      ]
    };

    // Starter foods for yesterday
    appState.days[yesterdayKey] = {
      water: 7,
      foods: [
        {
          id: 'sample-y1',
          name: 'Oatmeal with Sliced Banana',
          meal: 'Breakfast',
          serving: '1 bowl',
          calories: 360,
          protein: 9,
          carbs: 68,
          fat: 5,
          timestamp: Date.now() - 1000 * 60 * 60 * 26
        },
        {
          id: 'sample-y2',
          name: 'Turkey Club Sandwich',
          meal: 'Lunch',
          serving: 'Whole sandwich',
          calories: 610,
          protein: 36,
          carbs: 52,
          fat: 26,
          timestamp: Date.now() - 1000 * 60 * 60 * 21
        },
        {
          id: 'sample-y3',
          name: 'Salmon Fillet with Rice and Broccoli',
          meal: 'Dinner',
          serving: '1 plate',
          calories: 680,
          protein: 45,
          carbs: 55,
          fat: 24,
          timestamp: Date.now() - 1000 * 60 * 60 * 15
        },
        {
          id: 'sample-y4',
          name: 'Almonds',
          meal: 'Snacks',
          serving: 'Handful (28g)',
          calories: 160,
          protein: 6,
          carbs: 6,
          fat: 14,
          timestamp: Date.now() - 1000 * 60 * 60 * 18
        }
      ]
    };

    // Starter foods for 2 days ago
    appState.days[twoDaysAgoKey] = {
      water: 8,
      foods: [
        {
          id: 'sample-2d1',
          name: 'Breakfast Burrito',
          meal: 'Breakfast',
          serving: '1 wrap',
          calories: 550,
          protein: 26,
          carbs: 45,
          fat: 28,
          timestamp: Date.now() - 1000 * 60 * 60 * 50
        },
        {
          id: 'sample-2d2',
          name: 'Tuna Salad Bowl',
          meal: 'Lunch',
          serving: '1 large bowl',
          calories: 490,
          protein: 38,
          carbs: 20,
          fat: 26,
          timestamp: Date.now() - 1000 * 60 * 60 * 45
        },
        {
          id: 'sample-2d3',
          name: 'Chicken Stir-Fry with Noodles',
          meal: 'Dinner',
          serving: '1 plate',
          calories: 720,
          protein: 48,
          carbs: 76,
          fat: 22,
          timestamp: Date.now() - 1000 * 60 * 60 * 39
        }
      ]
    };
  }

  /* ============================================================
     Date Utilities & Formatting
     ============================================================ */

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateKey(key) {
    const parts = key.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function getDayData(dateKey, autoCreate = true) {
    if (!appState.days[dateKey] && autoCreate) {
      appState.days[dateKey] = {
        water: 0,
        foods: []
      };
    }
    return appState.days[dateKey] || { water: 0, foods: [] };
  }

  function formatDisplayDateLabel(date) {
    const today = new Date();
    const isToday = (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = date.toLocaleDateString(undefined, options);

    if (isToday) return `Today, ${dateStr}`;
    if (isYesterday) return `Yesterday, ${dateStr}`;
    if (isTomorrow) return `Tomorrow, ${dateStr}`;
    return dateStr;
  }

  /* ============================================================
     Render Engine
     ============================================================ */

  function renderDashboard() {
    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey, false);
    const goals = appState.goals;

    // 1. Update Date UI
    elements.dateDisplayLabel.textContent = formatDisplayDateLabel(currentDate);
    elements.datePickerInput.value = dateKey;

    // 2. Calculate Totals
    let totalCals = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    const mealTotals = {
      Breakfast: { cals: 0, p: 0, c: 0, f: 0, count: 0 },
      Lunch: { cals: 0, p: 0, c: 0, f: 0, count: 0 },
      Dinner: { cals: 0, p: 0, c: 0, f: 0, count: 0 },
      Snacks: { cals: 0, p: 0, c: 0, f: 0, count: 0 }
    };

    if (dayData && dayData.foods) {
      dayData.foods.forEach(item => {
        const cals = Number(item.calories) || 0;
        const p = Number(item.protein) || 0;
        const c = Number(item.carbs) || 0;
        const f = Number(item.fat) || 0;

        totalCals += cals;
        totalP += p;
        totalC += c;
        totalF += f;

        const meal = mealTotals[item.meal] ? item.meal : 'Snacks';
        mealTotals[meal].cals += cals;
        mealTotals[meal].p += p;
        mealTotals[meal].c += c;
        mealTotals[meal].f += f;
        mealTotals[meal].count += 1;
      });
    }

    // 3. Update Calorie Overview Metrics
    const remainingCals = goals.calories - totalCals;
    const percentConsumed = Math.round((totalCals / (goals.calories || 1)) * 100);

    elements.metricGoal.textContent = goals.calories.toLocaleString();
    elements.metricConsumed.textContent = totalCals.toLocaleString();

    if (remainingCals >= 0) {
      elements.remainingLabel.textContent = 'Remaining';
      elements.metricRemaining.textContent = remainingCals.toLocaleString();
      elements.metricRemaining.style.color = '#0284c7'; // accent blue
      elements.overUnderText.textContent = `${remainingCals.toLocaleString()} kcal left`;
      elements.calorieProgressBar.classList.remove('over-budget');
      elements.calorieProgressBar.style.width = `${Math.min(percentConsumed, 100)}%`;

      elements.budgetStatusPill.className = 'badge badge-success';
      elements.budgetStatusPill.textContent = percentConsumed > 90 ? 'Near Target' : 'On Track';
    } else {
      elements.remainingLabel.textContent = 'Over Target';
      elements.metricRemaining.textContent = Math.abs(remainingCals).toLocaleString();
      elements.metricRemaining.style.color = '#ef4444'; // red
      elements.overUnderText.textContent = `${Math.abs(remainingCals).toLocaleString()} kcal over budget`;
      elements.calorieProgressBar.classList.add('over-budget');
      elements.calorieProgressBar.style.width = '100%';

      elements.budgetStatusPill.className = 'badge badge-danger';
      elements.budgetStatusPill.textContent = 'Exceeded';
    }

    elements.percentConsumedText.textContent = `${percentConsumed}% of daily target`;

    // 4. Update Macronutrients Cards
    elements.macroCaloriesSum.textContent = `${Math.round(totalP * 4 + totalC * 4 + totalF * 9)} kcal from macros`;

    // Protein
    const proteinPct = Math.round((totalP / (goals.protein || 1)) * 100);
    elements.proteinCurrent.textContent = Math.round(totalP);
    elements.proteinGoal.textContent = goals.protein;
    elements.proteinPercent.textContent = `(${proteinPct}%)`;
    elements.proteinBar.style.width = `${Math.min(proteinPct, 100)}%`;

    // Carbs
    const carbsPct = Math.round((totalC / (goals.carbs || 1)) * 100);
    elements.carbsCurrent.textContent = Math.round(totalC);
    elements.carbsGoal.textContent = goals.carbs;
    elements.carbsPercent.textContent = `(${carbsPct}%)`;
    elements.carbsBar.style.width = `${Math.min(carbsPct, 100)}%`;

    // Fat
    const fatPct = Math.round((totalF / (goals.fat || 1)) * 100);
    elements.fatCurrent.textContent = Math.round(totalF);
    elements.fatGoal.textContent = goals.fat;
    elements.fatPercent.textContent = `(${fatPct}%)`;
    elements.fatBar.style.width = `${Math.min(fatPct, 100)}%`;

    // 5. Update Water Tracker
    renderWaterTracker(dayData ? dayData.water || 0 : 0, goals.water || 8);

    // 6. Update Meal Lists
    renderMealSections(dayData ? dayData.foods || [] : [], mealTotals);

    // 7. Render 7-Day Trend Canvas Chart
    renderWeeklyChart();
  }

  function renderWaterTracker(currentCups, goalCups) {
    elements.waterText.textContent = `${currentCups} / ${goalCups} glasses (${currentCups * 250} ml)`;
    elements.waterCupsContainer.innerHTML = '';

    const displayCount = Math.max(goalCups, currentCups);
    for (let i = 1; i <= displayCount; i++) {
      const cupSpan = document.createElement('span');
      cupSpan.className = `water-cup-icon ${i <= currentCups ? 'filled' : ''}`;
      cupSpan.textContent = '💧';
      cupSpan.title = `Glass ${i} (250ml)`;
      cupSpan.addEventListener('click', () => {
        setWaterIntake(i === currentCups ? i - 1 : i);
      });
      elements.waterCupsContainer.appendChild(cupSpan);
    }
  }

  function renderMealSections(foods, mealTotals) {
    const mealKeys = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

    mealKeys.forEach(meal => {
      const subtotalEl = elements.mealSubtotals[meal];
      const listEl = elements.mealLists[meal];
      const totals = mealTotals[meal];

      // Update subtotal banner
      subtotalEl.innerHTML = `<strong>${totals.cals} kcal</strong> &bull; ${Math.round(totals.p)}g P &bull; ${Math.round(totals.c)}g C &bull; ${Math.round(totals.f)}g F`;

      // Filter foods for this meal
      const mealItems = foods.filter(item => item.meal === meal);

      if (mealItems.length === 0) {
        listEl.innerHTML = `<li class="empty-meal-state">No foods logged for ${meal.toLowerCase()} yet.</li>`;
        return;
      }

      listEl.innerHTML = '';
      mealItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'food-item';

        const p = item.protein !== undefined && item.protein !== '' ? `${item.protein}g P` : '';
        const c = item.carbs !== undefined && item.carbs !== '' ? `${item.carbs}g C` : '';
        const f = item.fat !== undefined && item.fat !== '' ? `${item.fat}g F` : '';
        const macroStrings = [p, c, f].filter(Boolean).join(' &bull; ');

        li.innerHTML = `
          <div class="food-item-info">
            <span class="food-item-title">${escapeHtml(item.name)}</span>
            ${item.serving ? `<span class="food-item-serving">${escapeHtml(item.serving)}</span>` : ''}
            ${macroStrings ? `<span class="food-item-macros">${macroStrings}</span>` : ''}
          </div>
          <div class="food-item-right">
            <span class="food-item-calories">${item.calories} <small>kcal</small></span>
            <div class="food-item-actions">
              <button class="item-action-btn edit-btn" title="Edit food" data-action="edit" data-id="${item.id}">✏️</button>
              <button class="item-action-btn delete-btn" title="Delete food" data-action="delete" data-id="${item.id}">🗑️</button>
            </div>
          </div>
        `;

        listEl.appendChild(li);
      });
    });
  }

  /* ============================================================
     Weekly Canvas Chart Renderer
     ============================================================ */

  function renderWeeklyChart() {
    const canvas = elements.weeklyCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // High DPI Canvas Scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = 220;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    // Calculate past 7 days up to currently selected day
    const daysData = [];
    let total7DayCalories = 0;
    let daysUnderGoalCount = 0;
    let totalLoggedItemsCount = 0;

    const baseDate = new Date(currentDate);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const dayRecord = appState.days[key];

      let dayCals = 0;
      let itemCount = 0;
      if (dayRecord && Array.isArray(dayRecord.foods)) {
        dayRecord.foods.forEach(f => {
          dayCals += Number(f.calories) || 0;
          itemCount++;
        });
      }

      total7DayCalories += dayCals;
      totalLoggedItemsCount += itemCount;
      if (dayCals > 0 && dayCals <= appState.goals.calories) {
        daysUnderGoalCount++;
      }

      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.getDate();
      daysData.push({
        key,
        label: `${dayName} ${dayNum}`,
        calories: dayCals,
        isCurrent: key === formatDateKey(currentDate)
      });
    }

    // Update 7-Day Stats Bar
    const avg7Day = Math.round(total7DayCalories / 7);
    elements.weeklyAvgVal.textContent = `${avg7Day.toLocaleString()} kcal/day`;
    elements.weeklySuccessDays.textContent = `${daysUnderGoalCount} / 7`;
    elements.totalLoggedItems.textContent = totalLoggedItemsCount;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Padding & Dimensions
    const padding = { top: 35, right: 30, bottom: 40, left: 55 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const goalCals = appState.goals.calories || 2000;
    const maxDataCals = Math.max(...daysData.map(d => d.calories), goalCals * 1.15, 1500);
    const maxY = Math.ceil(maxDataCals / 500) * 500;

    // Draw Background Gridlines & Y-Axis Labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxY / ySteps) * i);
      const yPos = padding.top + chartHeight - (val / maxY) * chartHeight;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillText(`${val}`, padding.left - 8, yPos + 4);
    }

    // Draw Goal Target Line (Dashed Red Line)
    const goalY = padding.top + chartHeight - (goalCals / maxY) * chartHeight;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.moveTo(padding.left, goalY);
    ctx.lineTo(width - padding.right, goalY);
    ctx.stroke();

    // Goal tag
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target (${goalCals})`, width - padding.right - 70, goalY - 6);
    ctx.restore();

    // Draw Bars
    const barCount = daysData.length;
    const slotWidth = chartWidth / barCount;
    const barWidth = Math.min(36, slotWidth * 0.55);

    daysData.forEach((day, idx) => {
      const xCenter = padding.left + idx * slotWidth + slotWidth / 2;
      const barX = xCenter - barWidth / 2;
      const barH = (day.calories / maxY) * chartHeight;
      const barY = padding.top + chartHeight - barH;

      // Highlight selected day with subtle background column
      if (day.isCurrent) {
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        roundRect(ctx, barX - 6, padding.top, barWidth + 12, chartHeight, 6);
        ctx.fill();
      }

      // Bar color
      const isOver = day.calories > goalCals;
      if (day.calories === 0) {
        // Empty placeholder
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(barX, padding.top + chartHeight - 2, barWidth, 2);
      } else {
        ctx.fillStyle = isOver ? '#ef4444' : '#10b981';
        ctx.beginPath();
        roundRect(ctx, barX, barY, barWidth, Math.max(barH, 4), 6, true);
        ctx.fill();

        // Calorie number label above bar
        ctx.fillStyle = isOver ? '#b91c1c' : '#047857';
        ctx.font = 'bold 10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${day.calories}`, xCenter, barY - 6);
      }

      // X-Axis Date Label
      ctx.fillStyle = day.isCurrent ? '#0f172a' : '#64748b';
      ctx.font = day.isCurrent ? 'bold 11px -apple-system, sans-serif' : '11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day.label, xCenter, height - padding.bottom + 18);
    });
  }

  // Rounded Rectangle Canvas Helper
  function roundRect(ctx, x, y, width, height, radius, topOnly = false) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    if (topOnly) {
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
    } else {
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
    }
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  /* ============================================================
     Food Actions: Add, Edit, Delete, Quick Add
     ============================================================ */

  function openFoodModal(editItem = null, defaultMeal = 'Breakfast') {
    elements.foodForm.reset();
    populatePresets();

    if (editItem) {
      elements.foodModalTitle.textContent = 'Edit Food Item';
      elements.editFoodId.value = editItem.id;
      elements.foodNameInput.value = editItem.name || '';
      elements.foodMealSelect.value = editItem.meal || defaultMeal;
      elements.foodServingInput.value = editItem.serving || '';
      elements.foodCaloriesInput.value = editItem.calories || '';
      elements.foodProteinInput.value = editItem.protein !== undefined ? editItem.protein : '';
      elements.foodCarbsInput.value = editItem.carbs !== undefined ? editItem.carbs : '';
      elements.foodFatInput.value = editItem.fat !== undefined ? editItem.fat : '';
    } else {
      elements.foodModalTitle.textContent = 'Log Food Item';
      elements.editFoodId.value = '';
      elements.foodMealSelect.value = defaultMeal;
    }

    elements.foodModal.classList.add('active');
    setTimeout(() => elements.foodNameInput.focus(), 50);
  }

  function closeFoodModal() {
    elements.foodModal.classList.remove('active');
    elements.foodForm.reset();
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const name = elements.foodNameInput.value.trim();
    const cals = parseInt(elements.foodCaloriesInput.value, 10);
    const meal = elements.foodMealSelect.value;
    const serving = elements.foodServingInput.value.trim();
    const protein = elements.foodProteinInput.value !== '' ? parseFloat(elements.foodProteinInput.value) : 0;
    const carbs = elements.foodCarbsInput.value !== '' ? parseFloat(elements.foodCarbsInput.value) : 0;
    const fat = elements.foodFatInput.value !== '' ? parseFloat(elements.foodFatInput.value) : 0;
    const editId = elements.editFoodId.value;

    if (!name || isNaN(cals) || cals < 0) {
      showToast('Please enter a valid food name and positive calorie amount.', 'danger');
      return;
    }

    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey, true);

    if (editId) {
      // Update existing item
      const index = dayData.foods.findIndex(f => f.id === editId);
      if (index !== -1) {
        dayData.foods[index] = {
          ...dayData.foods[index],
          name,
          meal,
          serving,
          calories: cals,
          protein: Math.max(0, protein),
          carbs: Math.max(0, carbs),
          fat: Math.max(0, fat)
        };
        showToast(`Updated "${name}"`, 'success');
      }
    } else {
      // Add new item
      const newItem = {
        id: 'food_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        meal,
        serving,
        calories: cals,
        protein: Math.max(0, protein),
        carbs: Math.max(0, carbs),
        fat: Math.max(0, fat),
        timestamp: Date.now()
      };
      dayData.foods.push(newItem);
      showToast(`Logged "${name}" (${cals} kcal)`, 'success');
    }

    saveState();
    closeFoodModal();
    renderDashboard();
  }

  function deleteFoodItem(foodId) {
    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey, false);
    if (!dayData || !dayData.foods) return;

    const item = dayData.foods.find(f => f.id === foodId);
    const name = item ? item.name : 'Food item';

    dayData.foods = dayData.foods.filter(f => f.id !== foodId);
    saveState();
    renderDashboard();
    showToast(`Removed "${name}"`, 'info');
  }

  function quickAddCalories(amount) {
    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey, true);

    const newItem = {
      id: 'quick_' + Date.now(),
      name: `Quick Calorie Entry (+${amount})`,
      meal: 'Snacks',
      serving: 'Quick entry',
      calories: amount,
      protein: 0,
      carbs: 0,
      fat: 0,
      timestamp: Date.now()
    };

    dayData.foods.push(newItem);
    saveState();
    renderDashboard();
    showToast(`+${amount} kcal added to Snacks!`, 'success');
  }

  function setWaterIntake(cups) {
    const dateKey = formatDateKey(currentDate);
    const dayData = getDayData(dateKey, true);
    dayData.water = Math.max(0, cups);
    saveState();
    renderDashboard();
  }

  /* ============================================================
     Food Presets Quick Filler
     ============================================================ */

  function populatePresets() {
    elements.presetPillsContainer.innerHTML = '';
    FOOD_PRESETS.forEach(item => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'preset-pill';
      pill.textContent = `${item.name} (${item.cals} kcal)`;
      pill.addEventListener('click', () => {
        elements.foodNameInput.value = item.name.replace(/^[^\w\s]+\s*/, ''); // strip leading emoji
        elements.foodMealSelect.value = item.meal;
        elements.foodServingInput.value = item.serving;
        elements.foodCaloriesInput.value = item.cals;
        elements.foodProteinInput.value = item.p;
        elements.foodCarbsInput.value = item.c;
        elements.foodFatInput.value = item.f;
      });
      elements.presetPillsContainer.appendChild(pill);
    });
  }

  /* ============================================================
     Goals & Settings Modal
     ============================================================ */

  function openGoalsModal() {
    elements.goalCaloriesInput.value = appState.goals.calories;
    elements.goalProteinInput.value = appState.goals.protein;
    elements.goalCarbsInput.value = appState.goals.carbs;
    elements.goalFatInput.value = appState.goals.fat;
    elements.goalWaterInput.value = appState.goals.water || 8;
    elements.goalsModal.classList.add('active');
  }

  function closeGoalsModal() {
    elements.goalsModal.classList.remove('active');
  }

  function handleGoalsSubmit(e) {
    e.preventDefault();
    const cals = parseInt(elements.goalCaloriesInput.value, 10);
    const protein = parseInt(elements.goalProteinInput.value, 10) || 0;
    const carbs = parseInt(elements.goalCarbsInput.value, 10) || 0;
    const fat = parseInt(elements.goalFatInput.value, 10) || 0;
    const water = parseInt(elements.goalWaterInput.value, 10) || 8;

    if (isNaN(cals) || cals < 500) {
      showToast('Daily calorie goal should be at least 500 kcal.', 'danger');
      return;
    }

    appState.goals = {
      calories: cals,
      protein,
      carbs,
      fat,
      water
    };

    saveState();
    closeGoalsModal();
    renderDashboard();
    showToast('Nutrition targets updated!', 'success');
  }

  /* ============================================================
     Data Management: Export, Import, Reset
     ============================================================ */

  function openDataModal() {
    elements.dataModal.classList.add('active');
  }

  function closeDataModal() {
    elements.dataModal.classList.remove('active');
  }

  function exportData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    const today = formatDateKey(new Date());
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calorietrack-backup-${today}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Export file downloaded successfully.', 'success');
  }

  function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported || typeof imported !== 'object' || !imported.goals) {
          throw new Error('Invalid format');
        }

        appState = imported;
        saveState();
        renderDashboard();
        closeDataModal();
        showToast('Data imported successfully!', 'success');
      } catch (err) {
        showToast('Error reading JSON backup. File format is invalid.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (confirm('Are you sure you want to delete ALL logged foods, macros, and history? This action cannot be undone.')) {
      appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      renderDashboard();
      closeDataModal();
      showToast('All calorie data has been reset.', 'info');
    }
  }

  /* ============================================================
     UI Feedback: Toast Notification System
     ============================================================ */

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ============================================================
     Event Listeners Setup
     ============================================================ */

  function setupEventListeners() {
    // Date Navigation
    elements.prevDayBtn.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 1);
      renderDashboard();
    });

    elements.nextDayBtn.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 1);
      renderDashboard();
    });

    elements.todayQuickBtn.addEventListener('click', () => {
      currentDate = new Date();
      renderDashboard();
    });

    elements.dateDisplayBtn.addEventListener('click', () => {
      try {
        if (typeof elements.datePickerInput.showPicker === 'function') {
          elements.datePickerInput.showPicker();
        } else {
          elements.datePickerInput.focus();
        }
      } catch (err) {
        // Ignored if user click already triggered native input
      }
    });

    elements.datePickerInput.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = parseDateKey(e.target.value);
        renderDashboard();
      }
    });

    // Water Quick buttons
    elements.addWaterBtn.addEventListener('click', () => {
      const dateKey = formatDateKey(currentDate);
      const dayData = getDayData(dateKey, true);
      setWaterIntake((dayData.water || 0) + 1);
    });

    elements.subWaterBtn.addEventListener('click', () => {
      const dateKey = formatDateKey(currentDate);
      const dayData = getDayData(dateKey, true);
      setWaterIntake(Math.max(0, (dayData.water || 0) - 1));
    });

    // Quick Calorie Add Buttons
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cals = parseInt(btn.getAttribute('data-cals'), 10);
        if (cals) quickAddCalories(cals);
      });
    });

    // Modal: Open Add Food
    elements.openAddFoodModalBtn.addEventListener('click', () => {
      openFoodModal(null, 'Breakfast');
    });

    // Modal: Category "+ Add" buttons
    document.querySelectorAll('.log-meal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const meal = btn.getAttribute('data-meal') || 'Breakfast';
        openFoodModal(null, meal);
      });
    });

    // Modal: Close Food Modal
    elements.closeFoodModalBtn.addEventListener('click', closeFoodModal);
    elements.cancelFoodModalBtn.addEventListener('click', closeFoodModal);
    elements.foodForm.addEventListener('submit', handleFoodFormSubmit);

    // Food Items List Clicks (Edit / Delete delegation)
    document.querySelector('.meals-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('.item-action-btn');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const foodId = btn.getAttribute('data-id');

      if (action === 'delete') {
        deleteFoodItem(foodId);
      } else if (action === 'edit') {
        const dateKey = formatDateKey(currentDate);
        const dayData = getDayData(dateKey, false);
        const item = dayData?.foods?.find(f => f.id === foodId);
        if (item) {
          openFoodModal(item, item.meal);
        }
      }
    });

    // Goals Modal
    elements.openGoalsBtn.addEventListener('click', openGoalsModal);
    elements.closeGoalsModalBtn.addEventListener('click', closeGoalsModal);
    elements.cancelGoalsModalBtn.addEventListener('click', closeGoalsModal);
    elements.goalsForm.addEventListener('submit', handleGoalsSubmit);

    // Data Modal
    elements.openDataBtn.addEventListener('click', openDataModal);
    elements.closeDataModalBtn.addEventListener('click', closeDataModal);
    elements.closeDataModalFooterBtn.addEventListener('click', closeDataModal);
    elements.exportDataBtn.addEventListener('click', exportData);
    elements.importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importData(e.target.files[0]);
        e.target.value = '';
      }
    });
    elements.resetAllDataBtn.addEventListener('click', resetAllData);

    // Close modals on backdrop click
    [elements.foodModal, elements.goalsModal, elements.dataModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Keyboard shortcut: Escape closes active modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.foodModal.classList.remove('active');
        elements.goalsModal.classList.remove('active');
        elements.dataModal.classList.remove('active');
      }
    });

    // Re-render chart on window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderWeeklyChart(), 120);
    });
  }

  /* ============================================================
     Bootstrap Application
     ============================================================ */

  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
    renderDashboard();
  });

})();
