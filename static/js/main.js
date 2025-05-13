/**
 * Main Application Entry Point - Fixed Version
 * Added defensive coding to work around toLocaleString errors
 */

// Import model modules and other components
import { 
    DEFAULT_TIER_REVENUES,
    DEFAULT_MARKETING_BUDGET,
    DEFAULT_COST_PER_LEAD,
    DEFAULT_CONVERSION_RATE,
    DEFAULT_MONTHLY_CHURN_RATE,
    DEFAULT_WACC,
    DEFAULT_INITIAL_CAC_SMB,
    DEFAULT_PROJECTION_MONTHS,
    FIELD_DESCRIPTIONS
} from './model/constants.js';
import { runSubscriptionModel } from './model/subscription.js';
import { calculateFinancialMetrics } from './model/finance.js';

// Import export utility functions
import {
    exportMetricsAsCSV,
    exportInputsAsCSV,
    exportProjectionsAsCSV,
    exportChartAsImage,
    exportDashboardChart,
    exportAllChartsAsZip,
    formatCurrency as formatCurrencyUtil,
    formatNumber as formatNumberUtil
} from './export-utils.js';
import { setupAccordions } from './components/inputs/accordion-manager.js';
import { collectFormData, setupTooltips } from './components/inputs/form-validator.js';
import { initializeCharts, updateCharts, BRAND_COLORS } from './chart-manager.js'; // BRAND_COLORS imported as per user request

// Default values for form initialization
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
    initial_investment: 50000,
    operating_expense_rate: 40,
    fixed_costs: 2000,
    co2_unit_cost: 25,
    co2_emissions_per_customer: 0.1,
    customer_service_cost: 5
};

// Add debug script
document.addEventListener('DOMContentLoaded', function() {
    const debugScript = document.createElement('script');
    debugScript.src = '/static/js/debug.js';
    document.head.appendChild(debugScript);
});

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive cards (New version from User Request C.1.a)
    document.querySelectorAll('.interactive-card .card-header').forEach(h=>{
      h.addEventListener('click',()=>{
        const card=h.parentElement;
        card.classList.toggle('active');
        // localStorage.setItem(card.id, card.classList.contains('active')); // Original persistence removed as per plan
      });
    });
    // Removed localStorage load for 'active' state

    // Initialize stepper buttons
    const stepperBtns = document.querySelectorAll('.stepper-btn');
    stepperBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const targetId = btn.dataset.target;
        const step = parseFloat(btn.dataset.step);
        const input = document.getElementById(targetId);
        
        if (input) { // Ensure input exists
          const val = parseFloat(input.value || 0);
          input.value = (action === 'increment' 
            ? val + step 
            : Math.max(val - step, 0)
          ).toFixed(step % 1 ? 1 : 0);
          
          // Trigger input event for real-time updates (User Request C.1.b)
          input.dispatchEvent(new Event('input',{bubbles:true}));
        } else {
          console.warn('Stepper target input not found:', targetId);
        }
      });
    });

    // Initialize slider-input sync
    const linkSlider = (sliderElement, inputId, displayIdSuffix = '_display') => {
      const inp = document.getElementById(inputId);
      const disp = document.getElementById(`${inputId}${displayIdSuffix}`); // Adjusted to use suffix
      
      if (!sliderElement || !inp || !disp) {
        // console.warn(`Slider link failed for ${inputId}: Missing elements. Slider: ${!!sliderElement}, Input: ${!!inp}, Display: ${!!disp}`);
        return;
      }

      const sync = () => {
        if (inp.value !== sliderElement.value) sliderElement.value = inp.value; // Sync slider to input
        disp.textContent = `${inp.value}%`;
      };

      sliderElement.oninput = e => {
        inp.value = e.target.value;
        disp.textContent = `${e.target.value}%`;
        inp.dispatchEvent(new Event('input',{bubbles:true})); // Trigger input event (User Request C.1.b)
      };
      
      inp.onchange = sync; // When input changes (e.g. steppers, direct edit)
      inp.addEventListener('input', sync); // For immediate sync if value changes programmatically or by typing
      
      sync(); // Initial sync
    };

    // Attempt to link sliders, checking if elements exist
    const churnRateSmbSlider = document.getElementById('churn_rate_smb_slider');
    if (churnRateSmbSlider) linkSlider(churnRateSmbSlider, 'churn_rate_smb');

    const conversionRateSlider = document.getElementById('conversion_rate_slider');
    if (conversionRateSlider) linkSlider(conversionRateSlider, 'conversion_rate');

    const waccSlider = document.getElementById('wacc_slider');
    if (waccSlider) linkSlider(waccSlider, 'wacc');

    // Chart.js is now loaded via <script type="module"> in index.html
    try {
        // Initialize basic components
        initializeBasicComponents();
        
        // Perform initial calculations
        runModelCalculations();
    } catch (error) {
        console.error("Error during application startup:", error);
        alert("Error during application startup: " + error.message);
    }
});

/**
 * Initialize only the basic components to ensure the app works
 */
function initializeBasicComponents() {
    try {
        // Initialize form
        initializeForm();
        
        // Setup accordion functionality
        setupAccordions();
        
        // Initialize charts
        initializeCharts();
        
        // Set up tooltips
        setupTooltips();

        // Add event listeners
        setupEventListeners();
        
        // Setup export functionality
        setupExportFunctionality();
        
        console.log("Basic components initialized successfully");
    } catch (error) {
        console.error("Error initializing basic components:", error);
        throw error;
    }
}

/**
 * Initialize form with default values
 */
function initializeForm() {
    for (const [fieldName, value] of Object.entries(defaultFormValues)) {
        const field = document.getElementById(fieldName);
        if (field) {
            field.value = value;
        }
    }
}

/**
 * Set up event listeners for user interactions
 */
function setupEventListeners() {
    // Set up event listeners for input fields for real-time updates
    const inputFields = document.querySelectorAll("#assumptionsForm input[type=\"number\"]");
    inputFields.forEach(input => {
        input.addEventListener("change", function() {
            // Only update if the field is valid
            if (!this.classList.contains("input-error")) {
                runModelCalculations();
            }
        });
        
        // Add input event for real-time updates with debouncing
        let debounceTimer;
        input.addEventListener("input", function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (!this.classList.contains("input-error")) {
                    runModelCalculations();
                }
            }, 300); // 300ms debounce delay
        });
    });
    
    // Set up event listener for Update button
    const updateButton = document.querySelector('button[onclick="updateProjections()"]');
    if (updateButton) {
        updateButton.removeAttribute('onclick');
        updateButton.addEventListener('click', runModelCalculations);
    }
}

/**
 * Run model calculations based on form input
 */
function runModelCalculations() {
    try {
        // Collect form data
        const formData = collectFormData();
        console.log('DEBUGGING - Form data collected:', formData);
        
        // Prepare tier revenues array
        const modelInput = {
            tier_revenues: [
                Number(formData.tier1_revenue),
                Number(formData.tier2_revenue),
                Number(formData.tier3_revenue),
                Number(formData.tier4_revenue)
            ],
            marketing_budget: Number(formData.marketing_budget),
            cpl: Number(formData.cpl),
            conversion_rate: Number(formData.conversion_rate),
            churn_rate_smb: Number(formData.churn_rate_smb),
            wacc: Number(formData.wacc),
            initial_cac_smb: Number(formData.initial_cac_smb),
            projection_months: Number(formData.projection_months),
            // Assuming these are also from formData and numeric
            operating_expense_rate: Number(formData.operating_expense_rate),
            fixed_costs: Number(formData.fixed_costs),
            co2_unit_cost: Number(formData.co2_unit_cost),
            co2_emissions_per_customer: Number(formData.co2_emissions_per_customer),
            customer_service_cost_per_customer: Number(formData.customer_service_cost)
        };
        
        // Prepare expense configuration (using already Number-parsed values from modelInput where applicable)
        const expenses = {
            operatingExpenseRate: modelInput.operating_expense_rate || 40,
            fixedCosts: modelInput.fixed_costs || 2000,
            co2UnitCost: modelInput.co2_unit_cost || 25,
            co2EmissionsPerCustomer: modelInput.co2_emissions_per_customer || 0.1,
            customerServiceCostPerCustomer: modelInput.customer_service_cost_per_customer || 5
        };
        
        // Run subscription model
        console.log('DEBUGGING - Before runSubscriptionModel with inputs:', modelInput);
        const modelResults = runSubscriptionModel(modelInput);
        console.log('DEBUGGING - After runSubscriptionModel, results:', modelResults);

        // Add NaN detection for core model metrics
        if (modelResults && modelResults.metrics && typeof modelResults.metrics === 'object' && Object.values(modelResults.metrics).some(v => isNaN(v))) {
          console.warn('NaN detected in calculated metrics from runSubscriptionModel:', modelResults.metrics);
        }
        
        // Calculate financial metrics
        const financialMetrics = calculateFinancialMetrics(
            modelResults,
            Number(formData.initial_investment) || 50000, // Ensure initial_investment is a number
            expenses,
            modelInput.wacc // Use the Number-parsed wacc from modelInput
        );
        console.log('DEBUGGING - After calculateFinancialMetrics, results:', financialMetrics);
        
        // Combine results
        const combinedResults = {
            ...modelResults,
            financialMetrics
        };
        
        // Store results
        window.lastCalculationResults = combinedResults;
        
        // Update UI with results
        updateUI(combinedResults, formData);
        
        console.log("Calculations completed successfully");
    } catch (error) {
        console.error('Error calculating model:', error);
        alert('An error occurred while calculating: ' + error.message);
    }
}

/**
 * Update UI with model results
 */
function updateUI(results, formData) {
    try {
        // Add calculating state
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('calculating');
        });
        
        // Update metrics display
        if (results.metrics) {
            console.log('DEBUGGING - Before updateMetrics, data:', results.metrics);
            updateMetrics(results.metrics); // This now calls the local updateMetrics function
        }
        
        // Update financial metrics
        if (results.financialMetrics) {
            updateBasicFinancialMetrics(results.financialMetrics);
        }
        
        // Update charts (using new chart-manager.js)
        if (results.projections) {
            console.log("DEBUGGING - Before updateCharts (new), detailed data:", {
                projections: results.projections
            });
            updateCharts({ projections: results.projections });
        }

        // Update sparklines (User Request C.3)
        if (results.projections && results.projections.mrr_by_month && results.projections.customers_by_month) { // Check if data exists
            // Assuming sparkline data comes from these main projection arrays for simplicity
            // In a real scenario, specific downsampled data might be prepared for sparklines
            updateSparkline('sparkline_total_mrr', results.projections.mrr_by_month);
            updateSparkline('sparkline_active_customers', results.projections.customers_by_month);
            // Add other sparkline updates here if data is available in results.projections
            // For example, if annual_revenue_by_month or ltv_by_month exists:
            // updateSparkline('sparkline_annual_revenue', results.projections.annual_revenue_by_month);
            // updateSparkline('sparkline_ltv_smb', results.projections.ltv_by_month);
            // updateSparkline('sparkline_new_smb_customers_monthly', results.projections.new_customers_monthly_series); // hypothetical
        }
        
        // Remove calculating state after brief delay
        setTimeout(() => {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('calculating');
            });
        }, 300);
        
        console.log("UI updated successfully");
    } catch (error) {
        console.error('Error updating UI:', error);
        // Remove calculating state in case of error
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('calculating');
        });
    }
}

/**
 * Update financial metrics in the UI (simplified)
 */
function updateBasicFinancialMetrics(financialMetrics) {
    if (!financialMetrics) return;
    
    // Update NPV
    updateMetricDisplay('npv', formatCurrency(financialMetrics.npv));
    
    // Update IRR
    const irr = financialMetrics.irr !== null ? `${financialMetrics.irr.toFixed(1)}%` : 'N/A';
    updateMetricDisplay('irr', irr);
    
    // Update Payback Period
    const paybackPeriod = financialMetrics.paybackPeriod !== Infinity 
        ? `${financialMetrics.paybackPeriod} months`
        : 'Not reached';
    updateMetricDisplay('payback_period', paybackPeriod);
}

/**
 * Helper to update a single metric display element
 */
function updateMetricDisplay(metricId, value) {
    const element = document.getElementById(`metric_${metricId}`);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Format a number as currency
 */
function formatCurrency(value) {
    if (value === undefined || value === null) return "$0";
    return formatCurrencyUtil(value);
}

/**
 * Set up export functionality for metrics and charts
 */
function setupExportFunctionality() {
    // Export CSV button for metrics
    const exportMetricsBtn = document.getElementById('exportMetricsBtn');
    if (exportMetricsBtn) {
        exportMetricsBtn.addEventListener('click', function() {
            if (!window.lastCalculationResults) {
                alert('No data to export. Please run calculations first.');
                return;
            }
            exportMetricsAsCSV(
                window.lastCalculationResults.metrics, 
                window.lastCalculationResults.financialMetrics,
                'catona_financial_metrics.csv'
            );
        });
    }
    
    // Export all data as CSV button in dropdown
    const exportAllCsvBtn = document.getElementById('exportAllCsv');
    if (exportAllCsvBtn) {
        exportAllCsvBtn.addEventListener('click', exportAllDataAsCSV);
    }
    
    // Export all charts button in dropdown (using ZIP functionality)
    const exportAllChartsBtn = document.getElementById('exportAllCharts');
    if (exportAllChartsBtn) {
        exportAllChartsBtn.addEventListener('click', function() {
            if (!window.lastCalculationResults) {
                alert('No data to export. Please run calculations first.');
                return;
            }
            
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingIndicator.style.color = 'white';
            loadingIndicator.style.padding = '20px';
            loadingIndicator.style.borderRadius = '10px';
            loadingIndicator.style.zIndex = '9999';
            loadingIndicator.textContent = 'Creating ZIP file with all charts...';
            document.body.appendChild(loadingIndicator);
            
            exportAllChartsAsZip('catona_charts.zip')
                .then(success => {
                    if (success) {
                        console.log('All charts exported successfully as ZIP');
                    }
                })
                .catch(error => {
                    console.error('Error exporting all charts:', error);
                    alert('Error exporting charts. See console for details.');
                })
                .finally(() => {
                    // Remove loading indicator when done
                    if (document.body.contains(loadingIndicator)) {
                        document.body.removeChild(loadingIndicator);
                    }
                });
        });
    }
    
    // Generate Full Report button in dropdown (combines multiple exports)
    const exportFullReportBtn = document.getElementById('exportFullReport');
    if (exportFullReportBtn) {
        exportFullReportBtn.addEventListener('click', generateFullReport);
    }
    
    // Individual chart export buttons
    const chartExportBtns = document.querySelectorAll('.export-chart-btn');
    chartExportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const chartId = btn.getAttribute('data-chart');
            exportChart(chartId);
        });
    });
}

/**
 * Export all model data as a CSV file
 */
function exportAllDataAsCSV() {
    if (!window.lastCalculationResults) {
        alert('No data to export. Please run calculations first.');
        return;
    }
    
    try {
        const results = window.lastCalculationResults;
        
        // Export projections data
        exportProjectionsAsCSV(results.projections, 'catona_full_projections.csv');
        
        // Also export inputs as a separate file
        setTimeout(() => {
            exportInputsAsCSV('catona_model_inputs.csv');
        }, 500);
        
    } catch (error) {
        console.error('Error exporting all data as CSV:', error);
        alert('Error exporting data. See console for details.');
    }
}

/**
 * Export a specific chart as a PNG image
 */
function exportChart(chartId) {
    if (!window.lastCalculationResults) {
        alert('No data to export. Please run calculations first.');
        return;
    }
    
    try {
        const chartName = chartId.replace('Chart', '').toLowerCase();
        exportDashboardChart(chartId, `catona_${chartName}_chart.png`, {
            backgroundColor: 'white',
            quality: 0.95
        });
    } catch (error) {
        console.error('Error exporting chart:', error);
        alert('Error exporting chart. See console for details.');
    }
}

/**
 * Export all charts as PNG images using ZIP functionality
 */
function exportAllCharts() {
    if (!window.lastCalculationResults) {
        alert('No data to export. Please run calculations first.');
        return;
    }
    
    try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '10px';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.textContent = 'Creating ZIP file with all charts...';
        document.body.appendChild(loadingIndicator);
        
        exportAllChartsAsZip('catona_charts.zip')
            .then(success => {
                if (success) {
                    console.log('All charts exported successfully as ZIP');
                }
            })
            .catch(error => {
                console.error('Error exporting all charts:', error);
                alert('Error exporting charts. See console for details.');
            })
            .finally(() => {
                // Remove loading indicator when done
                if (document.body.contains(loadingIndicator)) {
                    document.body.removeChild(loadingIndicator);
                }
            });
    } catch (error) {
        console.error('Error exporting all charts:', error);
        alert('Error exporting charts. See console for details.');
    }
}

/**
 * Format a number with separators
 */
function formatNumber(value) {
    if (value === undefined || value === null) return "0";
    try {
        return Math.round(value).toLocaleString();
    } catch (error) {
        console.error("Error formatting number:", error);
        return "0";
    }
}

/**
 * Generate a full report with all data and charts
 */
function generateFullReport() {
    if (!window.lastCalculationResults) {
        alert('No data to export. Please run calculations first.');
        return;
    }
    
    try {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '10px';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.textContent = 'Generating full report...';
        document.body.appendChild(loadingIndicator);
        
        // Create a new JSZip instance for the comprehensive report
        const mainZip = new JSZip();
        
        // Track files for final bundling
        const filePromises = [];
        
        // 1. Create metrics CSV
        loadingIndicator.textContent = 'Generating metrics data...';
        const metricsData = generateMetricsCSV(
            window.lastCalculationResults.metrics,
            window.lastCalculationResults.financialMetrics
        );
        mainZip.file('catona_financial_metrics.csv', metricsData);
        
        // 2. Create projections CSV
        loadingIndicator.textContent = 'Generating projection data...';
        const projectionsData = generateProjectionsCSV(
            window.lastCalculationResults.projections
        );
        mainZip.file('catona_full_projections.csv', projectionsData);
        
        // 3. Create inputs CSV
        loadingIndicator.textContent = 'Generating model inputs...';
        const inputsData = generateInputsCSV();
        mainZip.file('catona_model_inputs.csv', inputsData);
        
        // 4. Create README file with explanations
        loadingIndicator.textContent = 'Creating documentation...';
        const readmeContent = `# Catona Climate Subscription Model Report

This report contains a comprehensive analysis of the subscription model for Catona Climate's SMB offering.

## Files Included:
- catona_financial_metrics.csv: Key financial metrics including MRR, ARR, LTV, CAC, etc.
- catona_full_projections.csv: Monthly projections of customers, revenue, and cash flow
- catona_model_inputs.csv: All inputs used to generate this model
- charts/: Directory containing visualizations of key metrics

Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
`;
        mainZip.file('README.txt', readmeContent);
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report: ' + (error.message || 'Unknown error'));
        
        // Remove the loading indicator in case of error
        const loadingIndicator = document.querySelector('div[style*="position: fixed"][style*="z-index: 9999"]');
        if (loadingIndicator && document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
    }
}

/**
 * Generate metrics CSV data string (for use in ZIP file)
 */
function generateMetricsCSV(metrics, financialMetrics) {
    if (!metrics) {
        return 'No metrics data available';
    }
    
    // Format metrics for CSV
    const metricsData = [
        { 'Metric': 'Total MRR', 'Value': formatCurrency(metrics.total_mrr) },
        { 'Metric': 'Annual Revenue', 'Value': formatCurrency(metrics.annual_revenue) },
        { 'Metric': 'Active Customers', 'Value': formatNumber(metrics.total_customers) },
        { 'Metric': 'New Customers/Month', 'Value': formatNumber(metrics.new_customers_monthly) },
        { 'Metric': 'Customer LTV', 'Value': formatCurrency(metrics.customer_ltv) }
    ];
    
    // Add CAC and LTV:CAC ratio if available
    if (metrics.cac) {
        metricsData.push({ 'Metric': 'CAC', 'Value': formatCurrency(metrics.cac) });
    }
    
    if (metrics.ltv_cac_ratio) {
        metricsData.push({ 'Metric': 'LTV:CAC Ratio', 'Value': `${metrics.ltv_cac_ratio.toFixed(2)}` });
    }
    
    // Add financial metrics if available
    if (financialMetrics) {
        if (financialMetrics.npv !== undefined) {
            metricsData.push({ 'Metric': 'Net Present Value (NPV)', 'Value': formatCurrency(financialMetrics.npv) });
        }
        
        if (financialMetrics.irr !== undefined && financialMetrics.irr !== null) {
            metricsData.push({ 'Metric': 'Internal Rate of Return (IRR)', 'Value': `${(financialMetrics.irr * 100).toFixed(1)}%` });
        }
        
        if (financialMetrics.paybackPeriod !== undefined) {
            const paybackValue = financialMetrics.paybackPeriod !== Infinity 
                ? `${financialMetrics.paybackPeriod} months` 
                : 'Not reached within projection period';
            metricsData.push({ 'Metric': 'Payback Period', 'Value': paybackValue });
        }
    }
    
    // Convert to CSV format
    let csvContent = 'Metric,Value\n';
    metricsData.forEach(row => {
        csvContent += `"${row.Metric}","${row.Value}"\n`;
    });
    
    return csvContent;
}

/**
 * Generate projections CSV data string (for use in ZIP file)
 */
function generateProjectionsCSV(projections) {
    if (!projections || !Array.isArray(projections) || projections.length === 0) {
        return 'No projection data available';
    }
    
    // Create headers based on the first projection entry
    const firstEntry = projections[0];
    const headers = ['Month'];
    
    // Add all available metrics to headers
    for (const key in firstEntry) {
        if (key !== 'month' && key !== 'month_name') {
            headers.push(key);
        }
    }
    
    // Generate CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    projections.forEach(month => {
        const row = [month.month];
        
        // Add each metric in the header order
        for (let i = 1; i < headers.length; i++) {
            const key = headers[i];
            let value = month[key];
            
            // Format the value appropriately
            if (typeof value === 'number') {
                // Convert numbers to strings without localization (avoid commas causing CSV issues)
                value = value.toString();
            } else if (value === undefined || value === null) {
                value = '';
            }
            
            row.push(value);
        }
        
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

/**
 * Generate inputs CSV data string (for use in ZIP file)
 */
function generateInputsCSV() {
    // Get form inputs
    const formData = collectFormData();
    
    // Create CSV structure
    const inputRows = [
        { 'Parameter': 'Marketing Budget', 'Value': formData.marketing_budget, 'Description': FIELD_DESCRIPTIONS.marketing_budget || '' },
        { 'Parameter': 'Cost Per Lead', 'Value': formData.cpl, 'Description': FIELD_DESCRIPTIONS.cpl || '' },
        { 'Parameter': 'Conversion Rate (%)', 'Value': formData.conversion_rate, 'Description': FIELD_DESCRIPTIONS.conversion_rate || '' },
        { 'Parameter': 'Monthly Churn Rate (%)', 'Value': formData.churn_rate_smb, 'Description': FIELD_DESCRIPTIONS.churn_rate_smb || '' },
        { 'Parameter': 'WACC (%)', 'Value': formData.wacc, 'Description': FIELD_DESCRIPTIONS.wacc || '' },
        { 'Parameter': 'Baseline CAC', 'Value': formData.initial_cac_smb, 'Description': FIELD_DESCRIPTIONS.initial_cac_smb || '' },
        { 'Parameter': 'Projection Months', 'Value': formData.projection_months, 'Description': FIELD_DESCRIPTIONS.projection_months || '' },
        { 'Parameter': 'Initial Investment', 'Value': formData.initial_investment, 'Description': FIELD_DESCRIPTIONS.initial_investment || '' },
        { 'Parameter': 'Operating Expense Rate (%)', 'Value': formData.operating_expense_rate, 'Description': FIELD_DESCRIPTIONS.operating_expense_rate || '' },
        { 'Parameter': 'Fixed Costs', 'Value': formData.fixed_costs, 'Description': FIELD_DESCRIPTIONS.fixed_costs || '' }
    ];
    
    // Add tier information
    for (let i = 1; i <= 4; i++) {
        inputRows.push({ 
            'Parameter': `Tier ${i} Revenue`, 
            'Value': formData[`tier${i}_revenue`], 
            'Description': `Monthly revenue for subscription tier ${i}` 
        });
    }
    
    // Generate CSV content
    let csvContent = 'Parameter,Value,Description\n';
    inputRows.forEach(row => {
        csvContent += `"${row.Parameter}","${row.Value}","${row.Description}"\n`;
    });
    
    return csvContent;
}

/* ------------------------------------------------------------------ */
/* Calculate CAC payback period (months) & final UI update helpers    */
/* ------------------------------------------------------------------ */
function updateFinancialDetails(financialMetrics) {
    if (!financialMetrics) return;

    // Cash Flow Summary
    const initialInvestment = Math.abs(financialMetrics.cashFlows[0]);
    document.getElementById('detail_initial_investment').textContent =
        formatCurrency(initialInvestment);

    const operatingCashFlow = financialMetrics.cashFlows
        .slice(1)
        .reduce((sum, cf) => sum + cf, 0);
    document.getElementById('detail_operating_cash_flow').textContent =
        formatCurrency(operatingCashFlow);

    const netCashFlow = financialMetrics.cashFlows
        .reduce((sum, cf) => sum + cf, 0);
    document.getElementById('detail_net_cash_flow').textContent =
        formatCurrency(netCashFlow);

    // Margin Analysis
    const avgMargin = financialMetrics.profitMargins?.averageMargin || 0;
    document.getElementById('detail_avg_margin').textContent =
        `${avgMargin.toFixed(1)}%`;

    const finalMargin = financialMetrics.profitMargins?.finalMargin || 0;
    document.getElementById('detail_final_margin').textContent =
        `${finalMargin.toFixed(1)}%`;

    // Customer Metrics
    document.getElementById('detail_effective_cac').textContent =
        formatCurrency(financialMetrics.effectiveCAC);
    document.getElementById('detail_customer_ltv').textContent =
        formatCurrency(financialMetrics.ltv);

    /* CAC payback (months) */
    let cacPayback = 'N/A';
    if (financialMetrics.effectiveCAC > 0 && avgMargin > 0) {
        const monthlyProfit = (avgMargin / 100) * financialMetrics.arpu;
        cacPayback = Math.ceil(financialMetrics.effectiveCAC / monthlyProfit);
    }
    document.getElementById('detail_cac_payback').textContent =
        cacPayback === 'N/A' ? 'N/A' : `${cacPayback} mo`;
}

/* Export */
window.updateProjections = runModelCalculations;

// Definition for updateMetrics, moved from the old chart-manager.js concept
// This function is responsible for updating the Key Financial Metrics display in index.html
function updateMetrics(metrics) {
    if (!metrics) return;

    // Helper to safely format currency, defaulting to $0.00 if value is problematic
    const safeFormatCurrency = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '$0.00';
        return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    // Helper to safely format numbers, defaulting to 0 if value is problematic
    const safeFormatNumber = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        return Math.round(num).toLocaleString('en-US');
    };

    const updateElementText = (metricId, valueStr, trendIndicatorId = null, trendIsPositive = null) => {
        const el = document.getElementById(metricId);
        if (el) {
            el.textContent = valueStr;
            // Basic positive/negative class based on if the value contains '-'
            // This is a simplification; more robust parsing might be needed for complex formats.
            const isNegative = valueStr.startsWith('-');
            el.classList.remove('positive', 'negative'); // Reset
            if (valueStr !== '$0' && valueStr !== '0') { // Don't color zero values
                 el.classList.add(isNegative ? 'negative' : 'positive');
            }
        }
        if (trendIndicatorId && typeof trendIsPositive === 'boolean') {
            const trendEl = document.getElementById(trendIndicatorId);
            if (trendEl) {
                trendEl.textContent = trendIsPositive ? '▲' : '▼';
                trendEl.className = 'trend-indicator'; // Reset classes
                trendEl.classList.add(trendIsPositive ? 'text-brand-green' : 'text-brand-red'); // Using new utility classes
             }
        }
    };

    // Assuming `metrics` object has keys like:
    // total_mrr, total_mrr_trend_is_positive,
    // total_customers, active_customers_trend_is_positive,
    // annual_revenue, annual_revenue_trend_is_positive,
    // customer_ltv, ltv_smb_trend_is_positive,
    // new_customers_monthly, new_customers_monthly_trend_is_positive

    updateElementText('metric_total_mrr', safeFormatCurrency(metrics.total_mrr), 'trend_total_mrr', metrics.total_mrr_trend_is_positive);
    updateElementText('metric_active_customers', safeFormatNumber(metrics.total_customers), 'trend_active_customers', metrics.active_customers_trend_is_positive);
    updateElementText('metric_annual_revenue', safeFormatCurrency(metrics.annual_revenue), 'trend_annual_revenue', metrics.annual_revenue_trend_is_positive);
    updateElementText('metric_ltv_smb', safeFormatCurrency(metrics.customer_ltv), 'trend_ltv_smb', metrics.ltv_smb_trend_is_positive);
    updateElementText('metric_new_smb_customers_monthly', safeFormatNumber(metrics.new_customers_monthly), 'trend_new_smb_customers_monthly', metrics.new_customers_monthly_trend_is_positive);
}

// Sparkline drawing function (User Request C.3)
function updateSparkline(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length < 2) return;

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    let range = maxVal - minVal;
    if (range === 0) { // Handle flat data case
        range = 1; // Avoid division by zero, effectively drawing a line in the middle
        // Adjust minVal so that flat data is drawn in the middle of the canvas vertically
        // This is a stylistic choice for flat lines.
        const flatValue = data[0];
        const halfRange = flatValue * 0.1 || 1; // Create a small artificial range
        // minVal = flatValue - halfRange;
        // range = halfRange * 2;
    }


    const strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--clr-driftwood').trim() || '#CAC8C5';
    const fillColor = '#3A66FF'; // Brand blue from User Request C.3

    ctx.beginPath();
    // For flat data, ensure it's drawn in the vertical middle if range was 0
    const getY = value => height - (((value - minVal) / range) * height * 0.8 + height * 0.1); // Scale to 80% of height, center

    ctx.moveTo(0, getY(data[0]));
    for (let i = 1; i < data.length; i++) {
        ctx.lineTo((i / (data.length - 1)) * width, getY(data[i]));
    }
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5; // Thinner line for sparklines
    ctx.stroke();

    // Fill area below line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.1; // Light fill
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

/* ------------------------------------------------------------------ */
