/**
 * @file app.js
 * @description This script implements a Monte Carlo simulation for employment and mental well-being,
 *              comparing a "Current Model" (Nykymalli) with a "Common Good Sandbox" (CG Sandbox) model.
 *              It simulates the financial and psychological impact of different social policy approaches
 *              on a population of unemployed individuals over time.
 *              The simulation tracks costs, KEDS (exhaustion/burnout) levels, and critical life events.
 * @author [Your Name/Organization Here]
 * @version 1.0.0
 * @license MIT (or appropriate license)
 */

/**
 * Executes once the DOM is fully loaded.
 * Initializes UI components and triggers the initial simulation run.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set up interactive slider elements and display their current values.
    setupSliders();

    // Run the simulation immediately upon page load to provide initial data.
    runSimulation();

    // Attach event listeners to primary action buttons.
    document.getElementById('run-simulation-btn')?.addEventListener('click', runSimulation);
    document.getElementById('inspect-agent-btn')?.addEventListener('click', updateInspectorWithNewAgent);

    // Initialize and manage the "Manifesti" modal dialog.
    const modal = document.getElementById('manifesti-modal');
    const openBtn = document.getElementById('open-manifesti-btn');
    const closeBtn = document.getElementById('close-manifesti-btn');

    // Ensure all modal elements exist before attaching listeners.
    if (modal && openBtn && closeBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex'; // Display modal using flexbox for centering.
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none'; // Hide modal.
        });

        // Close modal if user clicks outside of its content area.
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});

/**
 * Configures and binds input sliders to their respective display readouts.
 * This function ensures that as a user adjusts a slider, its current value
 * is immediately reflected in an associated text element, with optional formatting.
 */
function setupSliders() {
    /**
     * Defines the configuration for each slider.
     * @typedef {Object} SliderConfig
     * @property {string} id - The DOM ID of the slider input element.
     * @property {string} [suffix] - Optional text suffix to append to the displayed value (e.g., ' €', ' %').
     * @property {function(string): string} [formatter] - Optional custom formatting function for the slider's value.
     */
    const sliders = [
        { id: 'pop-size', suffix: '' },
        { id: 'sim-months', suffix: ' kk' },
        { id: 'sanction-rate', suffix: '%' },
        { id: 'bureaucracy-cost', suffix: ' €' },
        {
            id: 'suojaosa-removed',
            formatter: (v) => {
                switch (v) {
                    case '1': return 'Mieto (20%)';
                    case '2': return 'Keskiverto (40%)';
                    case '3': return 'Erittäin korkea (60%)';
                    default: return 'Tuntematon';
                }
            }
        },
        { id: 'match-rate', suffix: '%' },
        { id: 'reward-level', suffix: ' €' },
        { id: 'crisis-cost-heavy', suffix: ' €', formatter: (v) => Number(v).toLocaleString('fi-FI') + ' €' },
        { id: 'housing-crisis-cost', suffix: ' €', formatter: (v) => Number(v).toLocaleString('fi-FI') + ' €' }
    ];

    sliders.forEach(slider => {
        const sliderElement = document.getElementById(slider.id);
        const valueDisplayElement = document.getElementById(`${slider.id}-val`);

        // Ensure both the slider and its display element exist.
        if (sliderElement instanceof HTMLInputElement && valueDisplayElement) {
            /**
             * Updates the text content of the value display element based on the slider's current value.
             * Applies custom formatting or suffix if defined.
             */
            const updateDisplay = () => {
                if (slider.formatter) {
                    valueDisplayElement.textContent = slider.formatter(sliderElement.value);
                } else {
                    valueDisplayElement.textContent = sliderElement.value + (slider.suffix || '');
                }
            };

            // Attach the update function to the 'input' event for real-time feedback.
            sliderElement.addEventListener('input', updateDisplay);
            // Call once initially to set the correct value on page load.
            updateDisplay();
        }
    });
}

// Global variables to hold Chart.js instances for later destruction and re-rendering.
let costChartInstance = null;
let kedsChartInstance = null;

// Stores the simulated agent data for detailed inspection.
let simulatedAgents = { m1: [], m2: [] };

// Tracks the index of the last agent selected for inspection.
let lastSelectedAgentIndex = 0;

/**
 * Defines the archetypal profiles for agents in the simulation.
 * Each profile includes base attributes and a description, with a ratio
 * determining its prevalence in the generated population.
 * @constant {Array<Object>} AGENT_PROFILES
 */
const AGENT_PROFILES = [
    {
        type: 'Standardi työtön',
        ratio: 0.50, // 50% of the population
        baseHealth: 80, // Initial physical/mental health (0-100)
        baseKeds: 12,   // Initial KEDS (burnout/exhaustion) score (0-54, higher is worse)
        baseSkills: 50, // Initial general skill level (0-100)
        skillsList: ['Varastotyö', 'Asiakaspalvelu', 'Kuljetus', 'IT-perusteet'],
        description: 'Perusterve ja työkykyinen henkilö, mutta pitkittyvä työttömyys ja byrokratia altistavat stressille.'
    },
    {
        type: 'Nuori työtön (syrjäytymisvaara)',
        ratio: 0.15, // 15% of the population
        baseHealth: 75,
        baseKeds: 15,
        baseSkills: 40,
        skillsList: ['Sosiaalinen media', 'Videomuokkaus', 'Peli-suunnittelu', 'Matematiikka'],
        description: 'Alle 30-vuotias nuori, vailla ammatillista tutkintoa. Korkea riski pudota pysyvästi turvaverkkojen ulkopuolelle.'
    },
    {
        type: 'Osatyökykyinen / Kuntoutuja',
        ratio: 0.15, // 15% of the population
        baseHealth: 45,
        baseKeds: 24,
        baseSkills: 70,
        skillsList: ['Puutyöt', 'Käsityöt', 'Kirjanpito', 'Pedagogia'],
        description: 'Yksilö, jolla on pitkäaikaissairaus tai neuropsykiatrisia haasteita. Korkea osaamispotentiaali, mutta matala virallinen jaksaminen.'
    },
    {
        type: 'Yksinhuoltaja / Perheellinen',
        ratio: 0.20, // 20% of the population
        baseHealth: 70,
        baseKeds: 18,
        baseSkills: 60,
        skillsList: ['Kotitalous', 'Logistiikka', 'Hoiva', 'Organisointi'],
        description: 'Perheellinen työtön, jonka arkea sitovat tiukat aikarajat ja taloudellinen stressi leikkauksista.'
    }
];

/**
 * Generates an initial population of agents based on predefined profiles and a specified size.
 * Each agent receives individualized attributes with slight random variance from their profile's base values.
 * @param {number} size - The total number of agents to generate for the population.
 * @returns {Array<Object>} An array of agent objects, each representing an individual in the simulation.
 */
function generatePopulation(size) {
    const population = [];
    for (let i = 0; i < size; i++) {
        // Randomly select an agent profile based on defined ratios.
        const randomRatioSelector = Math.random();
        let cumulativeRatio = 0;
        let selectedProfile = AGENT_PROFILES[0]; // Default to the first profile

        for (const profile of AGENT_PROFILES) {
            cumulativeRatio += profile.ratio;
            if (randomRatioSelector <= cumulativeRatio) {
                selectedProfile = profile;
                break;
            }
        }

        // Create a new agent, applying individual variance to base attributes.
        population.push({
            id: i + 1,
            type: selectedProfile.type,
            skillsList: [...selectedProfile.skillsList], // Clone array to prevent shared references
            description: selectedProfile.description,
            // Apply +/- 10 variance to base health, clamped between 10 and 100.
            health: Math.min(100, Math.max(10, selectedProfile.baseHealth + (Math.random() * 20 - 10))),
            // Apply +/- 4 variance to base KEDS, clamped between 0 and 54 (max KEDS).
            keds: Math.min(54, Math.max(0, selectedProfile.baseKeds + (Math.random() * 8 - 4))),
            // Apply +/- 10 variance to base skills, clamped between 10 and 100.
            skills: Math.min(100, Math.max(10, selectedProfile.baseSkills + (Math.random() * 20 - 10))),
            income: 1300, // Placeholder for starting average equivalent gross income
            savings: Math.max(0, 1000 - Math.random() * 1000), // Random initial savings, min 0
            sanctionsCount: 0, // Tracks cumulative sanctions in Model 1
            hasWork: false, // Boolean indicating if the agent is currently employed
            logsM1: [], // Stores monthly event logs for Model 1
            logsM2: []  // Stores monthly event logs for Model 2
        });
    }
    return population;
}

/**
 * Executes the main Monte Carlo simulation, comparing two policy models over a specified duration.
 * It calculates cumulative costs, average KEDS levels, and critical events for each model.
 * Finally, it updates the UI with simulation results and renders comparison charts.
 */
function runSimulation() {
    // Retrieve simulation parameters from UI input elements.
    const popSize = parseInt(document.getElementById('pop-size')?.value || '1000', 10);
    const months = parseInt(document.getElementById('sim-months')?.value || '12', 10);
    const sanctionRate = parseInt(document.getElementById('sanction-rate')?.value || '100', 10) / 100; // Max sanction percentage
    const adminCostPerMonth = parseInt(document.getElementById('bureaucracy-cost')?.value || '100', 10); // Administrative cost per agent per month in Model 1
    const suojaosaPenaltyLevel = parseInt(document.getElementById('suojaosa-removed')?.value || '1', 10); // Level of "suojaosa" penalty (1, 2, or 3)
    const cgMatchRate = parseInt(document.getElementById('match-rate')?.value || '20', 10) / 100; // Probability of finding a micro-task in Model 2
    const cgReward = parseInt(document.getElementById('reward-level')?.value || '50', 10); // Reward for completing a micro-task in Model 2
    const heavyCrisisCost = parseInt(document.getElementById('crisis-cost-heavy')?.value || '50000', 10); // Cost of a severe crisis (e.g., long-term exclusion)
    const housingCrisisCost = parseInt(document.getElementById('housing-crisis-cost')?.value || '5000', 10); // Cost of a housing crisis (e.g., eviction, homelessness)

    // Prepare arrays to store data for charting.
    const timeLabels = Array.from({ length: months + 1 }, (_, i) => `${i} kk`); // Labels for the X-axis (months)
    const m1CumulativeCost = [0]; // Cumulative cost for Model 1, starting at 0
    const m2CumulativeCost = [0]; // Cumulative cost for Model 2, starting at 0
    const m1AvgKeds = []; // Average KEDS score for Model 1 per month
    const m2AvgKeds = []; // Average KEDS score for Model 2 per month

    // Generate initial populations for both models.
    // Model 1 represents the "Current Model" (Nykymalli).
    const population1 = generatePopulation(popSize);
    // Model 2 represents the "Common Good Sandbox". Deep clone population1 to ensure
    // both models start with identical agent characteristics for a fair comparison.
    const population2 = JSON.parse(JSON.stringify(population1));

    let m1TotalCost = 0;      // Overall cumulative cost for Model 1
    let m2TotalCost = 0;      // Overall cumulative cost for Model 2
    let m1TotalCrises = 0;    // Count of severe crises in Model 1
    let m2TotalCrises = 0;    // Count of severe crises in Model 2 (expected to be lower)

    // --- Main Simulation Loop ---
    for (let currentMonth = 1; currentMonth <= months; currentMonth++) {
        let m1MonthCost = 0; // Total cost for Model 1 in the current month
        let m2MonthCost = 0; // Total cost for Model 2 in the current month

        let m1KedsSum = 0;   // Sum of KEDS scores for Model 1 agents in the current month
        let m2KedsSum = 0;   // Sum of KEDS scores for Model 2 agents in the current month

        // --- Model 1: Current Model (Nykymalli) Simulation Logic ---
        population1.forEach(agent => {
            // If agent is employed, they generate tax revenue and do not incur support costs.
            if (agent.hasWork) {
                m1MonthCost -= 400; // Represents net tax revenue/reduced costs.
                agent.keds = Math.max(5, agent.keds - 0.5); // Work provides stability, slightly reducing KEDS.
                agent.logsM1.push(`Mones ${currentMonth}: Työssä. Ansaitsee palkkaa ja edistää taloutta. Stressi vähenee.`);
                m1KedsSum += agent.keds;
                return; // Skip to the next agent
            }

            // Unemployed agents incur administrative costs due to bureaucracy.
            m1MonthCost += adminCostPerMonth;

            // Calculate stress increase from bureaucratic processes and "suojaosa" removal.
            let processStressIncrease = 0.5;
            if (suojaosaPenaltyLevel === 2) processStressIncrease += 0.3; // Moderate penalty adds more stress
            if (suojaosaPenaltyLevel === 3) processStressIncrease += 0.7; // High penalty adds significant stress

            // Agents are typically required to apply for 4 jobs per month.
            // Probability of failing this obligation increases with KEDS (exhaustion) and poor health.
            const failToApplyProbability = (agent.keds / 54) * 0.7 + (1 - agent.health / 100) * 0.3;

            if (Math.random() < failToApplyProbability) {
                // Agent failed to meet job application obligations, triggering sanctions.
                agent.sanctionsCount++;
                let sanctionCutPercentage = 0;

                // Sanction severity increases with repeated failures.
                if (agent.sanctionsCount === 1) {
                    sanctionCutPercentage = 0.20; // 20% cut for the first sanction
                    agent.logsM1.push(`Mones ${currentMonth}: Ensimmäinen laiminlyönti. 20% toimeentuloleikkaus.`);
                } else if (agent.sanctionsCount === 2) {
                    sanctionCutPercentage = 0.40; // 40% cut for the second sanction
                    agent.logsM1.push(`Mones ${currentMonth}: Toinen laiminlyönti. 40% toimeentuloleikkaus.`);
                } else {
                    sanctionCutPercentage = sanctionRate; // Maximum configured sanction rate for subsequent failures
                    agent.logsM1.push(`Mones ${currentMonth}: Toistuva laiminlyönti. ${Math.round(sanctionRate * 100)}% leikkaus perusosaan.`);
                }

                // Financial stress from sanctions significantly increases KEDS and degrades health.
                agent.keds = Math.min(54, agent.keds + 6);
                agent.health = Math.max(10, agent.health - 5);
                // While support payment is reduced, there are hidden societal costs associated with sanctions.
                m1MonthCost += 500 * sanctionCutPercentage; // Represents indirect costs of increased hardship.
            } else {
                // Agent successfully met application obligations, but often without finding a suitable job.
                // This still contributes to stress.
                agent.keds = Math.min(54, agent.keds + processStressIncrease);
                // Small chance of finding actual employment, even with forced applications.
                if (Math.random() < 0.04) {
                    agent.hasWork = true;
                    agent.logsM1.push(`Mones ${currentMonth}: Kohtaanto! Löysi kokoaikatyön.`);
                } else {
                    agent.logsM1.push(`Mones ${currentMonth}: Haki 4 työpaikkaa. Ei osumaa. Stressi +${processStressIncrease.toFixed(1)}.`);
                }
            }

            // Calculate the support payment received by the agent.
            let supportPaid = 600; // Base average social security payment
            if (agent.sanctionsCount > 0) {
                // Apply cumulative sanction cuts to the support payment.
                const currentSanctionCut = (agent.sanctionsCount === 1 ? 0.20 : agent.sanctionsCount === 2 ? 0.40 : sanctionRate);
                supportPaid *= (1 - currentSanctionCut);
            }
            m1MonthCost += supportPaid; // Add the support payment to the model's monthly cost.

            // Crisis Check: High KEDS and low support payments increase the risk of severe crises.
            const crisisProbability = (agent.keds > 19 ? 0.03 : 0.005) + (supportPaid < 400 ? 0.08 : 0);
            if (Math.random() < crisisProbability) {
                m1TotalCrises++; // Increment the total crisis count for Model 1.
                if (agent.type.includes('Nuori')) {
                    // Young people face higher long-term costs if they fall into severe crisis.
                    m1MonthCost += heavyCrisisCost / 12; // Spread heavy crisis cost over a year for simulation.
                    agent.logsM1.push(`⚠️ Mones ${currentMonth}: Vakava syrjäytymiskriisi laukesi! Kerrannaiskustannus yhteiskunnalle.`);
                } else {
                    // Other agents might face housing crises.
                    m1MonthCost += housingCrisisCost;
                    agent.logsM1.push(`⚠️ Mones ${currentMonth}: Vuokrarästikriisi & häätö. Kustannus: +${housingCrisisCost.toLocaleString('fi-FI')} €.`);
                }
                // Crises severely impact KEDS.
                agent.keds = Math.min(54, agent.keds + 12);
            }

            m1KedsSum += agent.keds; // Add agent's current KEDS to the monthly sum.
        });

        // --- Model 2: Common Good Sandbox Simulation Logic ---
        population2.forEach(agent => {
            // If agent is employed, they generate higher tax revenue due to better skill matching.
            if (agent.hasWork) {
                m2MonthCost -= 450; // Represents higher net tax revenue/reduced costs.
                agent.keds = Math.max(5, agent.keds - 0.8); // Work is more fulfilling, reducing KEDS more effectively.
                agent.logsM2.push(`Mones ${currentMonth}: Pysyvässä työssä. Erittäin hyvinvoiva.`);
                m2KedsSum += agent.keds;
                return; // Skip to the next agent
            }

            // Minimal administrative cost due to streamlined, digitized, and community-verified processes.
            m2MonthCost += 5;

            // Stable basic security payment, without punitive sanctions.
            const baseSupport = 650;
            m2MonthCost += baseSupport;

            // Micro-task Match Chance: Agents can choose tasks that fit their skills and current capacity.
            // Active capacity is inversely related to KEDS (exhaustion).
            const activeCapacity = Math.max(0.1, (100 - agent.keds) / 100); // Exhausted agents have lower capacity but are not forced.

            if (Math.random() < (cgMatchRate * activeCapacity)) {
                // Agent successfully completed a micro-task.
                const reward = cgReward * (1 + Math.random() * 0.4 - 0.2); // Reward varies slightly.
                m2MonthCost += reward; // This reward is a system/community cost.

                // Active participation and meaningful contribution reduce KEDS and improve health.
                agent.keds = Math.max(0, agent.keds - 3);
                agent.health = Math.min(100, agent.health + 3);

                agent.logsM2.push(`Mones ${currentMonth}: Suoritti mikrotehtävän hyödyntäen taitojaan. Palkkio: +${Math.round(reward)} €. Stressi laskee.`);

                // Micro-tasks provide networking and skill-building opportunities, leading to a higher chance of permanent employment.
                if (Math.random() < 0.08) {
                    agent.hasWork = true;
                    agent.logsM2.push(`🎉 Mones ${currentMonth}: Vahvisti verkostojaan mikrotyöllä -> Työllistyi pysyvästi!`);
                }
            } else {
                // Agent chose not to participate in a micro-task or no suitable task was available.
                // Without pressure, KEDS slightly stabilizes or improves from rest.
                agent.keds = Math.max(0, agent.keds - 0.5);
                agent.logsM2.push(`Mones ${currentMonth}: Lepää ja palautuu voimavaroissa. Ei velvoitteita tai painostusta.`);
            }

            // Model 2 assumes a "zero sanction policy," which prevents severe poverty-driven crises.
            // Therefore, m2TotalCrises remains 0 or very low (not explicitly modeled as a separate cost here).

            m2KedsSum += agent.keds; // Add agent's current KEDS to the monthly sum.
        });

        // Accumulate monthly costs into total cumulative costs.
        m1TotalCost += m1MonthCost;
        m2TotalCost += m2MonthCost;

        // Store cumulative costs for charting.
        m1CumulativeCost.push(m1TotalCost);
        m2CumulativeCost.push(m2TotalCost);

        // Calculate and store average KEDS for the month.
        m1AvgKeds.push(m1KedsSum / popSize);
        m2AvgKeds.push(m2KedsSum / popSize);
    }

    // Store the final state of simulated agents for detailed inspection in the UI.
    simulatedAgents = {
        m1: population1,
        m2: population2
    };

    // --- Update UI Statistics ---
    document.getElementById('model1-net-cost')?.textContent = `${Math.round(m1TotalCost).toLocaleString('fi-FI')} €`;
    document.getElementById('model2-net-cost')?.textContent = `${Math.round(m2TotalCost).toLocaleString('fi-FI')} €`;

    // Compute and display the percentage of agents with high KEDS (exhausted).
    const m1ExhaustedCount = population1.filter(a => a.keds > 19).length; // KEDS > 19 is considered exhausted
    const m2ExhaustedCount = population2.filter(a => a.keds > 19).length;
    document.getElementById('model1-exhausted')?.textContent = `${((m1ExhaustedCount / popSize) * 100).toFixed(1)}%`;
    document.getElementById('model2-exhausted')?.textContent = `${((m2ExhaustedCount / popSize) * 100).toFixed(1)}%`;

    // Display the total count of severe crises for each model.
    document.getElementById('model1-crises')?.textContent = `${m1TotalCrises} kpl`;
    document.getElementById('model2-crises')?.textContent = `${m2TotalCrises} kpl`;

    // SOSTE's poverty gap & reductions (simulated values based on policy impact).
    const basePovertyGap = 15.03; // Baseline poverty gap percentage
    // Model 1's poverty gap increases with "suojaosa" penalty.
    const computedM1PovertyGap = basePovertyGap + (suojaosaPenaltyLevel * 0.45);
    const computedM2PovertyGapReduction = 23.4; // Assumed reduction due to CG credits and stable support.
    document.getElementById('model1-poverty')?.textContent = `${computedM1PovertyGap.toFixed(2)}%`;
    document.getElementById('model2-poverty-reduction')?.textContent = `-${computedM2PovertyGapReduction}%`;

    // Render the cost and KEDS comparison charts.
    renderCharts(timeLabels, m1CumulativeCost, m2CumulativeCost, m1AvgKeds, m2AvgKeds);

    // Update the agent inspector with a new, randomly selected agent's details.
    updateInspectorWithNewAgent();
}

/**
 * Renders or re-renders the cost and KEDS comparison charts using Chart.js.
 * Destroys existing chart instances before creating new ones to prevent memory leaks and display issues.
 * @param {Array<string>} labels - X-axis labels (e.g., month numbers).
 * @param {Array<number>} m1Cost - Cumulative cost data for Model 1.
 * @param {Array<number>} m2Cost - Cumulative cost data for Model 2.
 * @param {Array<number>} m1Keds - Average KEDS data for Model 1.
 * @param {Array<number>} m2Keds - Average KEDS data for Model 2.
 */
function renderCharts(labels, m1Cost, m2Cost, m1Keds, m2Keds) {
    const ctxCost = document.getElementById('costChart')?.getContext('2d');
    const ctxKeds = document.getElementById('kedsChart')?.getContext('2d');

    // Destroy any existing chart instances to ensure clean re-rendering.
    if (costChartInstance) costChartInstance.destroy();
    if (kedsChartInstance) kedsChartInstance.destroy();

    // Ensure chart contexts are available before attempting to render.
    if (!ctxCost || !ctxKeds) {
        console.error('Chart canvas context not found. Cannot render charts.');
        return;
    }

    // --- Cost Chart Configuration ---
    costChartInstance = new Chart(ctxCost, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Nykymalli (Sanktiot)',
                    data: m1Cost,
                    borderColor: '#ff3b5c', // Red tone for Model 1 (current, often negative)
                    backgroundColor: 'rgba(255, 59, 92, 0.1)',
                    borderWidth: 3,
                    fill: true, // Fill area under the line
                    tension: 0.3 // Smooth curves
                },
                {
                    label: 'Common Good (Sandbox)',
                    data: m2Cost,
                    borderColor: '#10b981', // Green tone for Model 2 (positive alternative)
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill its container
            plugins: {
                legend: { labels: { color: '#f3f4f6' } } // Light text for dark background
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' }, // Subtle grid lines
                    ticks: { color: '#9ca3af' } // Axis tick labels color
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) { // Format Y-axis labels as currency
                            return value.toLocaleString('fi-FI') + ' €';
                        }
                    }
                }
            }
        }
    });

    // --- KEDS Chart Configuration ---
    kedsChartInstance = new Chart(ctxKeds, {
        type: 'line',
        data: {
            labels: labels.slice(1), // Exclude initial '0 kk' as KEDS starts from month 1
            datasets: [
                {
                    label: 'Nykymalli (KEDS)',
                    data: m1Keds,
                    borderColor: '#f59e0b', // Orange tone for Model 1 KEDS (often higher)
                    borderWidth: 2.5,
                    fill: false, // No fill for KEDS chart
                    tension: 0.25
                },
                {
                    label: 'Common Good (KEDS)',
                    data: m2Keds,
                    borderColor: '#3b82f6', // Blue tone for Model 2 KEDS (often lower)
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f3f4f6' } }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#9ca3af' },
                    suggestedMin: 10, // Set a reasonable minimum for KEDS scale
                    suggestedMax: 30  // Set a reasonable maximum for KEDS scale
                }
            }
        }
    });
}

/**
 * Updates the agent inspection panel with details and simulation logs for a randomly selected agent.
 * This allows users to delve into the individual journey of an agent under both simulation models.
 */
function updateInspectorWithNewAgent() {
    // Ensure simulation data is available.
    if (!simulatedAgents || !simulatedAgents.m1 || simulatedAgents.m1.length === 0) {
        console.warn('No simulated agents available for inspection.');
        return;
    }

    // Select a random agent from the simulated population.
    const randomIndex = Math.floor(Math.random() * simulatedAgents.m1.length);
    lastSelectedAgentIndex = randomIndex; // Store index for potential future use (e.g., 'next agent' button).

    const agent1 = simulatedAgents.m1[randomIndex]; // Agent's journey in Model 1
    const agent2 = simulatedAgents.m2[randomIndex]; // Agent's journey in Model 2 (same initial agent, different path)

    // --- Update Agent Profile Details ---
    const agentTypeNameElement = document.getElementById('agent-type-name');
    if (agentTypeNameElement) {
        agentTypeNameElement.textContent = agent1.type;
    }

    const agentInitDescElement = document.getElementById('agent-init-desc');
    if (agentInitDescElement) {
        agentInitDescElement.innerHTML = `
            ${agent1.description}<br><br>
            <strong>Alkuterveys:</strong> ${Math.round(agent1.health)}% |
            <strong>Alku-KEDS (Uupumus):</strong> ${Math.round(agent1.keds)} (Kynnys 19)
        `;
    }

    // --- Update Agent Skills Chips ---
    const skillsContainer = document.getElementById('agent-skills-chips');
    if (skillsContainer) {
        skillsContainer.innerHTML = ''; // Clear previous skills
        agent1.skillsList.forEach(skill => {
            const chip = document.createElement('span');
            chip.className = 'chip'; // Apply styling for skill chips
            chip.textContent = skill;
            skillsContainer.appendChild(chip);
        });
    }

    // --- Populate Timeline Logs for Model 1 ---
    const m1LogsContainer = document.getElementById('model1-logs');
    if (m1LogsContainer) {
        m1LogsContainer.innerHTML = ''; // Clear previous logs
        agent1.logsM1.forEach(log => {
            const listItem = document.createElement('li');
            listItem.textContent = log;
            m1LogsContainer.appendChild(listItem);
        });
    }

    // --- Populate Timeline Logs for Model 2 ---
    const m2LogsContainer = document.getElementById('model2-logs');
    if (m2LogsContainer) {
        m2LogsContainer.innerHTML = ''; // Clear previous logs
        agent2.logsM2.forEach(log => {
            const listItem = document.createElement('li');
            listItem.textContent = log;
            m2LogsContainer.appendChild(listItem);
        });
    }
}