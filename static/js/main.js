import { buildArea, buildPie, palette } from "./chart-manager.js";

// Imports for business logic - from previous main.js (lines 7-19 of provided file)
import { 
    DEFAULT_TIER_REVENUES,
    DEFAULT_MARKETING_BUDGET,
    DEFAULT_COST_PER_LEAD,
    DEFAULT_CONVERSION_RATE,
    DEFAULT_MONTHLY_CHURN_RATE,
    DEFAULT_WACC,
    DEFAULT_INITIAL_CAC_SMB,
    DEFAULT_PROJECTION_MONTHS
    // FIELD_DESCRIPTIONS is not used in this Playbook version of main.js
} from './model/constants.js'; 
import { runSubscriptionModel } from './model/subscription.js';
import { calculateFinancialMetrics } from './model/finance.js';

const form = document.getElementById("assumptionsForm");
const charts = {}; // To store chart instances

// Default values for form initialization, including those needed for calc()
// that might not be in the new form.
const defaultFormValues = {
    tier1_revenue: DEFAULT_TIER_REVENUES[0],
    tier2_revenue: DEFAULT_TIER_REVENUES[1],
    tier3_revenue: DEFAULT_TIER_REVENUES[2],
    tier4_revenue: DEFAULT_TIER_REVENUES[3],
    marketing_budget: DEFAULT_MARKETING_BUDGET,
    cpl: DEFAULT_COST_PER_LEAD,
    conversion_rate: DEFAULT_CONVERSION_RATE,
    churn_rate_smb: DEFAULT_MONTHLY_CHURN_RATE,
    wacc: DEFAULT_WACC,
    initial_cac_smb: DEFAULT_INITIAL_CAC_SMB,
    projection_months: DEFAULT_PROJECTION_MONTHS,
    // These are needed for calc() and taken from the previous main.js defaultFormValues (lines 49-54 of provided file)
    initial_investment: 50000, 
    operating_expense_rate: 40, 
    fixed_costs: 2000,          
    co2_unit_cost: 25,          
    co2_emissions_per_customer: 0.1, 
    customer_service_cost: 5 // This will be mapped to customer_service_cost_per_customer in calc
};

function initializeDefaultFormValues() {
   if (!form) {
       console.warn("initializeDefaultFormValues: Assumptions form not found.");
       return;
   }
   for (const [fieldName, value] of Object.entries(defaultFormValues)) {
       const field = form.elements[fieldName];
       if (field) {
           field.value = value;
           // For sliders, also update their visual display
           if (field.classList.contains('slider-input') || (field.type === 'number' && document.getElementById(field.id + '_slider'))) {
               const slider = field.classList.contains('slider-input') ? field : document.getElementById(field.id + '_slider');
               const displayId = slider.id.replace('_slider', '_display').replace('slider', 'display'); // Try both conventions
               const disp = document.getElementById(displayId);
               if (slider) slider.value = value; // Sync slider itself
               if (disp) disp.textContent = value + (fieldName.includes('rate') || fieldName.includes('wacc') ? '%' : '');
           }
       }
   }
}

function collectInputs() {
  if (!form) { console.error("collectInputs: Assumptions form not found"); return {}; }
  const f = new FormData(form);
  const data = { ...defaultFormValues }; // Start with defaults for fields not in form

  for (const [key, value] of f.entries()) {
      const numValue = parseFloat(value);
      data[key] = isNaN(numValue) ? (value === '' ? undefined : value) : numValue; 
  }
  return data;
}

function calc(formData) { 
  const modelInput = {
      tier_revenues: [
          formData.tier1_revenue, formData.tier2_revenue,
          formData.tier3_revenue, formData.tier4_revenue
      ].map(v => typeof v === 'number' ? v : 0),
      marketing_budget: typeof formData.marketing_budget === 'number' ? formData.marketing_budget : 0,
      cpl: typeof formData.cpl === 'number' ? formData.cpl : 0,
      conversion_rate: typeof formData.conversion_rate === 'number' ? formData.conversion_rate : 0,
      churn_rate_smb: typeof formData.churn_rate_smb === 'number' ? formData.churn_rate_smb : 0,
      wacc: typeof formData.wacc === 'number' ? formData.wacc : 0,
      initial_cac_smb: typeof formData.initial_cac_smb === 'number' ? formData.initial_cac_smb : 0,
      projection_months: typeof formData.projection_months === 'number' ? formData.projection_months : 12,
      operating_expense_rate: typeof formData.operating_expense_rate === 'number' ? formData.operating_expense_rate : 0,
      fixed_costs: typeof formData.fixed_costs === 'number' ? formData.fixed_costs : 0,
      co2_unit_cost: typeof formData.co2_unit_cost === 'number' ? formData.co2_unit_cost : 0,
      co2_emissions_per_customer: typeof formData.co2_emissions_per_customer === 'number' ? formData.co2_emissions_per_customer : 0,
      customer_service_cost_per_customer: typeof formData.customer_service_cost === 'number' ? formData.customer_service_cost : 0
  };

  const expenses = { 
      operatingExpenseRate: modelInput.operating_expense_rate,
      fixedCosts: modelInput.fixed_costs,
      co2UnitCost: modelInput.co2_unit_cost,
      co2EmissionsPerCustomer: modelInput.co2_emissions_per_customer,
      customerServiceCostPerCustomer: modelInput.customer_service_cost_per_customer
  };
  
  const modelResults = runSubscriptionModel(modelInput);
  const financialMetricsData = calculateFinancialMetrics(
      modelResults,
      typeof formData.initial_investment === 'number' ? formData.initial_investment : 0,
      expenses,
      modelInput.wacc
  );
  
  const combinedResults = { ...modelResults, financialMetrics: financialMetricsData };

  return {
      labels: combinedResults.projections?.monthLabels || [],
      mrrArr: combinedResults.projections?.mrr_by_month || [],
      custArr: combinedResults.projections?.customers_by_month || [],
      tierArr: combinedResults.projections?.tier_revenues_end || [],
      metrics: {
          total_mrr: combinedResults.metrics?.total_mrr || 0,
          total_subscribers: combinedResults.metrics?.total_subscribers || 0,
          annual_revenue: combinedResults.metrics?.annual_revenue || 0,
          subscriber_ltv: combinedResults.metrics?.subscriber_ltv || 0,
          new_sub_month: combinedResults.metrics?.new_subscribers_monthly || 0
      }
  };
}

function render(result) {
  const { metrics } = result;
  if (metrics) {
      for (const [id, val] of Object.entries(metrics)) { // val is a number from calc
          const el = document.getElementById(`metric_${id}`);
          if (el) {
              const prev = parseFloat(el.dataset.prev) || 0;
              const displayValue = id.includes("mrr") || id.includes("revenue") || id.includes("ltv") 
                  ? "$" + val.toLocaleString(undefined, {maximumFractionDigits: 0}) 
                  : val.toLocaleString(undefined, {maximumFractionDigits: 0});
              el.textContent = displayValue;
              el.style.color = val >= prev ? "var(--cat-success)" : "var(--cat-error)";
              el.dataset.prev = val;
          } else {
              // console.warn(`KPI element not found: metric_${id}`);
          }
      }
  }

  try {
    const mrrCtx = document.getElementById("mrrChart")?.getContext("2d");
    if (mrrCtx) {
        if (!charts.mrr) charts.mrr = buildArea(mrrCtx, result.labels, result.mrrArr, palette[0]);
        else { charts.mrr.data.labels = result.labels; charts.mrr.data.datasets[0].data = result.mrrArr; charts.mrr.update(); }
    }

    const custCtx = document.getElementById("customersChart")?.getContext("2d");
    if (custCtx) {
        if (!charts.cust) charts.cust = buildArea(custCtx, result.labels, result.custArr, palette[1]);
        else { charts.cust.data.labels = result.labels; charts.cust.data.datasets[0].data = result.custArr; charts.cust.update(); }
    }

    const tierCtx = document.getElementById("tierRevenueChart")?.getContext("2d");
    if (tierCtx) {
        const tierLabels = ["Tier 1", "Tier 2", "Tier 3", "Tier 4"];
        if (!charts.tier) charts.tier = buildPie(tierCtx, tierLabels, result.tierArr, palette.slice(0,4));
        else { charts.tier.data.datasets[0].data = result.tierArr; charts.tier.update(); }
    }
  } catch (e) {
      console.error("Error rendering charts:", e);
  }
}

const debouncedRender = (() => {
  let timer;
  return () => { 
    clearTimeout(timer);
    timer = setTimeout(() => {
        const currentFormData = collectInputs();
        if (Object.keys(currentFormData).length > 0) { // Ensure data was collected
            render(calc(currentFormData));
        }
    }, 300);
  };
})();

if (form) {
   form.addEventListener("input", debouncedRender);
} else {
   console.error("Form with ID 'assumptionsForm' not found. Calculations will not run on input.");
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDefaultFormValues(); 

  document.querySelectorAll(".stepper-btn").forEach(btn => {
    btn.onclick = () => {
      const inputId = btn.dataset.target;
      const inp = document.getElementById(inputId);
      if (inp) {
        const step = parseFloat(btn.dataset.step) || 1;
        const currentValue = parseFloat(inp.value) || 0;
        const precision = (String(step).split('.')[1] || '').length;
        let newValue = btn.dataset.action === "increment" ? currentValue + step : currentValue - step;
        // Ensure value doesn't go below zero for most inputs, or min if specified
        const minVal = inp.min ? parseFloat(inp.min) : 0;
        newValue = Math.max(newValue, minVal);
        inp.value = newValue.toFixed(precision);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
  });

  document.querySelectorAll(".slider-input").forEach(sl => {
    const inputId = sl.id.replace("_slider", "");
    const inp = document.getElementById(inputId);
    const dispId = sl.id.replace("slider", "display"); 
    const disp = document.getElementById(dispId);

    if (inp && disp) {
      const syncSliderDisplayFromInput = () => {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) {
            sl.value = val;
            disp.textContent = val + (sl.id.includes('rate') || sl.id.includes('wacc') ? '%' : '');
        }
      };
      const syncInputFromSlider = () => {
        inp.value = sl.value;
        disp.textContent = sl.value + (sl.id.includes('rate') || sl.id.includes('wacc') ? '%' : '');
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      };

      sl.oninput = syncInputFromSlider;
      inp.addEventListener('change', syncSliderDisplayFromInput); // Update slider if input changes via stepper
      
      // Initial sync
      syncSliderDisplayFromInput();

    } else {
        // console.warn("Missing elements for slider setup:", sl.id, inputId, dispId);
    }
  });
  
  document.querySelectorAll(".interactive-card > .card-header").forEach(h => {
    h.onclick = () => {
      const card = h.parentElement;
      card.classList.toggle("open");
    };
  });

  if (form) {
    const initialData = collectInputs();
    if (Object.keys(initialData).length > 0) {
        render(calc(initialData)); // Initial render
    }
  }
});
