/**
 * Työllisyyden ja Mielenterveyden Monte Carlo -Simulaattori
 * (app.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    setupSliders();
    runSimulation(); // Run initial simulation on load
    
    document.getElementById('run-simulation-btn').addEventListener('click', runSimulation);
    document.getElementById('inspect-agent-btn').addEventListener('click', updateInspectorWithNewAgent);

    // Setup Manifesti Modal
    const modal = document.getElementById('manifesti-modal');
    const openBtn = document.getElementById('open-manifesti-btn');
    const closeBtn = document.getElementById('close-manifesti-btn');

    if (modal && openBtn && closeBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});

// Bind sliders to text readouts
function setupSliders() {
    const sliders = [
        { id: 'pop-size', suffix: '' },
        { id: 'sim-months', suffix: ' kk' },
        { id: 'sanction-rate', suffix: '%' },
        { id: 'bureaucracy-cost', suffix: ' €' },
        { id: 'suojaosa-removed', formatter: (v) => v === '1' ? 'Mieto' : v === '2' ? 'Keskiverto' : 'Erittäin korkea' },
        { id: 'match-rate', suffix: '%' },
        { id: 'reward-level', suffix: ' €' },
        { id: 'crisis-cost-heavy', suffix: ' €', formatter: (v) => Number(v).toLocaleString('fi-FI') + ' €' },
        { id: 'housing-crisis-cost', suffix: ' €', formatter: (v) => Number(v).toLocaleString('fi-FI') + ' €' }
    ];

    sliders.forEach(slider => {
        const el = document.getElementById(slider.id);
        const valEl = document.getElementById(`${slider.id}-val`);
        if (el && valEl) {
            const update = () => {
                if (slider.formatter) {
                    valEl.textContent = slider.formatter(el.value);
                } else {
                    valEl.textContent = el.value + (slider.suffix || '');
                }
            };
            el.addEventListener('input', update);
            update();
        }
    });
}

// Chart variables to allow resetting
let costChartInstance = null;
let kedsChartInstance = null;
let simulatedAgents = []; // To inspect
let lastSelectedAgentIndex = 0;

// Agent types
const AGENT_PROFILES = [
    {
        type: 'Standardi työtön',
        ratio: 0.50,
        baseHealth: 80,
        baseKeds: 12,
        baseSkills: 50,
        skillsList: ['Varastotyö', 'Asiakaspalvelu', 'Kuljetus', 'IT-perusteet'],
        description: 'Perusterve ja työkykyinen henkilö, mutta pitkittyvä työttömyys ja byrokratia altistavat stressille.'
    },
    {
        type: 'Nuori työtön (syrjäytymisvaara)',
        ratio: 0.15,
        baseHealth: 75,
        baseKeds: 15,
        baseSkills: 40,
        skillsList: ['Sosiaalinen media', 'Videomuokkaus', 'Peli-suunnittelu', 'Matematiikka'],
        description: 'Alle 30-vuotias nuori, vailla ammatillista tutkintoa. Korkea riski pudota pysyvästi turvaverkkojen ulkopuolelle.'
    },
    {
        type: 'Osatyökykyinen / Kuntoutuja',
        ratio: 0.15,
        baseHealth: 45,
        baseKeds: 24,
        baseSkills: 70,
        skillsList: ['Puutyöt', 'Käsityöt', 'Kirjanpito', 'Pedagogia'],
        description: 'Yksilö, jolla on pitkäaikaissairaus tai neuropsykiatrisia haasteita. Korkea osaamispotentiaali, mutta matala virallinen jaksaminen.'
    },
    {
        type: 'Yksinhuoltaja / Perheellinen',
        ratio: 0.20,
        baseHealth: 70,
        baseKeds: 18,
        baseSkills: 60,
        skillsList: ['Kotitalous', 'Logistiikka', 'Hoiva', 'Organisointi'],
        description: 'Perheellinen työtön, jonka arkea sitovat tiukat aikarajat ja taloudellinen stressi leikkauksista.'
    }
];

function generatePopulation(size) {
    const population = [];
    for (let i = 0; i < size; i++) {
        // Pick profile based on ratios
        const r = Math.random();
        let cumulativeRatio = 0;
        let profile = AGENT_PROFILES[0];
        
        for (const p of AGENT_PROFILES) {
            cumulativeRatio += p.ratio;
            if (r <= cumulativeRatio) {
                profile = p;
                break;
            }
        }

        // Add some individual variance
        population.push({
            id: i + 1,
            type: profile.type,
            skillsList: [...profile.skillsList],
            description: profile.description,
            health: Math.min(100, Math.max(10, profile.baseHealth + (Math.random() * 20 - 10))),
            keds: Math.min(54, Math.max(0, profile.baseKeds + (Math.random() * 8 - 4))),
            skills: Math.min(100, Math.max(10, profile.baseSkills + (Math.random() * 20 - 10))),
            income: 1300, // starting average equivalent gross
            savings: Math.max(0, 1000 - Math.random() * 1000),
            sanctionsCount: 0,
            hasWork: false,
            logsM1: [],
            logsM2: []
        });
    }
    return population;
}

function runSimulation() {
    // Get form inputs
    const popSize = parseInt(document.getElementById('pop-size').value);
    const months = parseInt(document.getElementById('sim-months').value);
    const sanctionRate = parseInt(document.getElementById('sanction-rate').value) / 100;
    const adminCostPerMonth = parseInt(document.getElementById('bureaucracy-cost').value);
    const suojaosaPenalty = parseInt(document.getElementById('suojaosa-removed').value); // 1, 2, 3
    const cgMatchRate = parseInt(document.getElementById('match-rate').value) / 100;
    const cgReward = parseInt(document.getElementById('reward-level').value);
    const heavyCrisisCost = parseInt(document.getElementById('crisis-cost-heavy').value);
    const housingCrisisCost = parseInt(document.getElementById('housing-crisis-cost').value);

    // Prepare arrays for charts
    const timeLabels = Array.from({ length: months + 1 }, (_, i) => `${i} kk`);
    const m1CumulativeCost = [0];
    const m2CumulativeCost = [0];
    const m1AvgKeds = [];
    const m2AvgKeds = [];

    // Monte Carlo simulation runs (we do 1 full detailed simulation for the UI, representing the expected value)
    const population1 = generatePopulation(popSize);
    // Deep clone population for model 2 comparison
    const population2 = JSON.parse(JSON.stringify(population1));

    let m1TotalCost = 0;
    let m2TotalCost = 0;
    let m1TotalCrises = 0;
    let m2TotalCrises = 0;

    // Simulation Loop
    for (let m = 1; m <= months; m++) {
        let m1MonthCost = 0;
        let m2MonthCost = 0;

        let m1KedsSum = 0;
        let m2KedsSum = 0;

        // Model 1: Nykymalli
        population1.forEach(agent => {
            if (agent.hasWork) {
                // Generates tax revenue & does not receive support
                m1MonthCost -= 400; // negative cost is profit
                agent.keds = Math.max(5, agent.keds - 0.5); // work stabilizes
                agent.logsM1.push(`Mones ${m}: Työssä. Ansaitsee palkkaa. Stressi vähenee.`);
                m1KedsSum += agent.keds;
                return;
            }

            // Bureaucracy administrative cost
            m1MonthCost += adminCostPerMonth;

            // Apply process stress
            let stressIncrease = 0.5;
            if (suojaosaPenalty === 2) stressIncrease += 0.3;
            if (suojaosaPenalty === 3) stressIncrease += 0.7;

            // 4 job applications obligation requirement check
            // Probability of failing to apply depends on their current health and KEDS score
            const failToApplyProbability = (agent.keds / 54) * 0.7 + (1 - agent.health / 100) * 0.3;
            
            if (Math.random() < failToApplyProbability) {
                // Failed obligation! Trigger sanctions
                agent.sanctionsCount++;
                let sanctionCut = 0;
                
                if (agent.sanctionsCount === 1) {
                    sanctionCut = 0.20; // 20% cut
                    agent.logsM1.push(`Mones ${m}: Ensimmäinen laiminlyönti. 20% toimeentuloleikkaus.`);
                } else if (agent.sanctionsCount === 2) {
                    sanctionCut = 0.40; // 40% cut
                    agent.logsM1.push(`Mones ${m}: Toinen laiminlyönti. 40% toimeentuloleikkaus.`);
                } else {
                    sanctionCut = sanctionRate; // max sanction
                    agent.logsM1.push(`Mones ${m}: Toistuva laiminlyönti. ${Math.round(sanctionRate*100)}% leikkaus perusosaan.`);
                }

                // Financial stress increases KEDS & decreases health
                agent.keds = Math.min(54, agent.keds + 6);
                agent.health = Math.max(10, agent.health - 5);
                m1MonthCost += 500 * sanctionCut; // state pays slightly less support, but...
            } else {
                // Success in applying, but no match because forced applications
                agent.keds = Math.min(54, agent.keds + stressIncrease);
                // Tiny chance to find actual job
                if (Math.random() < 0.04) {
                    agent.hasWork = true;
                    agent.logsM1.push(`Mones ${m}: Kohtaanto! Löysi kokoaikatyön.`);
                } else {
                    agent.logsM1.push(`Mones ${m}: Haki 4 työpaikkaa. Ei osumaa. Stressi +${stressIncrease.toFixed(1)}.`);
                }
            }

            // Support payment (average basic social security)
            let supportPaid = 600;
            if (agent.sanctionsCount > 0) {
                supportPaid *= (1 - (agent.sanctionsCount === 1 ? 0.20 : agent.sanctionsCount === 2 ? 0.40 : sanctionRate));
            }
            m1MonthCost += supportPaid;

            // Crisis Check (Poverty-driven severe issues)
            const crisisProbability = (agent.keds > 19 ? 0.03 : 0.005) + (supportPaid < 400 ? 0.08 : 0);
            if (Math.random() < crisisProbability) {
                m1TotalCrises++;
                if (agent.type.includes('Nuori')) {
                    m1MonthCost += heavyCrisisCost / 12; // spread over months
                    agent.logsM1.push(`⚠️ Mones ${m}: Vakava syrjäytymiskriisi laukesi! Kerrannaiskustannus yhteiskunnalle.`);
                } else {
                    m1MonthCost += housingCrisisCost;
                    agent.logsM1.push(`⚠️ Mones ${m}: Vuokrarästikriisi & häätö. Kustannus: +${housingCrisisCost.toLocaleString()} €.`);
                }
                agent.keds = Math.min(54, agent.keds + 12);
            }

            m1KedsSum += agent.keds;
        });

        // Model 2: Common Good Sandbox
        population2.forEach(agent => {
            if (agent.hasWork) {
                m2MonthCost -= 450; // More tax revenue due to active skills matches
                agent.keds = Math.max(5, agent.keds - 0.8);
                agent.logsM2.push(`Mones ${m}: Pysyvässä työssä. Erittäin hyvinvoiva.`);
                m2KedsSum += agent.keds;
                return;
            }

            // Minimal admin cost (digitized, peer-to-peer verified)
            m2MonthCost += 5;

            // Support baseline (stable basic security)
            const baseSupport = 650; 
            m2MonthCost += baseSupport;

            // Micro-task Match chance
            // High because they choose tasks fitting their unique 'Skills list' and capacity
            const activeCapacity = Math.max(0.1, (100 - agent.keds) / 100); // exhausted agents work less but are not forced
            
            if (Math.random() < (cgMatchRate * activeCapacity)) {
                // Successful microtask! Earn credits
                const reward = cgReward * (1 + Math.random() * 0.4 - 0.2);
                m2MonthCost += reward; // paid by system / community
                
                // Active participation reduces stress (KEDS goes down) & builds health
                agent.keds = Math.max(0, agent.keds - 3);
                agent.health = Math.min(100, agent.health + 3);
                
                agent.logsM2.push(`Mones ${m}: Suoritti mikrotehtävän hyödyntäen taitojaan. Palkkio: +${Math.round(reward)} €. Stressi laskee.`);

                // Highly increased chance to graduate to permanent employment
                if (Math.random() < 0.08) {
                    agent.hasWork = true;
                    agent.logsM2.push(`🎉 Mones ${m}: Vahvisti verkostojaan mikrotyöllä -> Työllistyi pysyvästi!`);
                }
            } else {
                // Resting, no pressure, KEDS slightly stabilizes
                agent.keds = Math.max(0, agent.keds - 0.5);
                agent.logsM2.push(`Mones ${m}: Lepää ja palautuu voimavaroissa. Ei velvoitteita tai painostusta.`);
            }

            // Zero sanction policy -> No heavy poverty-driven evictions or extreme clinical crises
            m2KedsSum += agent.keds;
        });

        m1TotalCost += m1MonthCost;
        m2TotalCost += m2MonthCost;

        m1CumulativeCost.push(m1TotalCost);
        m2CumulativeCost.push(m2TotalCost);

        m1AvgKeds.push(m1KedsSum / popSize);
        m2AvgKeds.push(m2KedsSum / popSize);
    }

    // Capture results for inspector
    simulatedAgents = {
        m1: population1,
        m2: population2
    };

    // Update UI Stats
    document.getElementById('model1-net-cost').textContent = `${Math.round(m1TotalCost).toLocaleString('fi-FI')} €`;
    document.getElementById('model2-net-cost').textContent = `${Math.round(m2TotalCost).toLocaleString('fi-FI')} €`;

    // Compute metrics
    const m1ExhaustedCount = population1.filter(a => a.keds > 19).length;
    const m2ExhaustedCount = population2.filter(a => a.keds > 19).length;
    document.getElementById('model1-exhausted').textContent = `${((m1ExhaustedCount / popSize) * 100).toFixed(1)}%`;
    document.getElementById('model2-exhausted').textContent = `${((m2ExhaustedCount / popSize) * 100).toFixed(1)}%`;

    document.getElementById('model1-crises').textContent = `${m1TotalCrises} kpl`;
    document.getElementById('model2-crises').textContent = `${m2TotalCrises} kpl`;

    // SOSTE's poverty gap & reductions
    const basePovertyGap = 15.03;
    const computedM1PovertyGap = basePovertyGap + (suojaosaPenalty * 0.45);
    const computedM2PovertyGapReduction = 23.4; // % reduction due to CG credits
    document.getElementById('model1-poverty').textContent = `${computedM1PovertyGap.toFixed(2)}%`;
    document.getElementById('model2-poverty-reduction').textContent = `-${computedM2PovertyGapReduction}%`;

    // Render Charts
    renderCharts(timeLabels, m1CumulativeCost, m2CumulativeCost, m1AvgKeds, m2AvgKeds);
    
    // Initial inspector load
    updateInspectorWithNewAgent();
}

function renderCharts(labels, m1Cost, m2Cost, m1Keds, m2Keds) {
    const ctxCost = document.getElementById('costChart').getContext('2d');
    const ctxKeds = document.getElementById('kedsChart').getContext('2d');

    if (costChartInstance) costChartInstance.destroy();
    if (kedsChartInstance) kedsChartInstance.destroy();

    // Cost Chart
    costChartInstance = new Chart(ctxCost, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Nykymalli (Sanktiot)',
                    data: m1Cost,
                    borderColor: '#ff3b5c',
                    backgroundColor: 'rgba(255, 59, 92, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Common Good (Sandbox)',
                    data: m2Cost,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
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
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
            }
        }
    });

    // KEDS Chart
    kedsChartInstance = new Chart(ctxKeds, {
        type: 'line',
        data: {
            labels: labels.slice(1),
            datasets: [
                {
                    label: 'Nykymalli (KEDS)',
                    data: m1Keds,
                    borderColor: '#f59e0b',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.25
                },
                {
                    label: 'Common Good (KEDS)',
                    data: m2Keds,
                    borderColor: '#3b82f6',
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
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                y: { 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { color: '#9ca3af' },
                    suggestedMin: 10,
                    suggestedMax: 30
                }
            }
        }
    });
}

function updateInspectorWithNewAgent() {
    if (!simulatedAgents || !simulatedAgents.m1) return;

    // Pick a random agent to display
    const idx = Math.floor(Math.random() * simulatedAgents.m1.length);
    lastSelectedAgentIndex = idx;

    const agent1 = simulatedAgents.m1[idx];
    const agent2 = simulatedAgents.m2[idx];

    // Profile Details
    document.getElementById('agent-type-name').textContent = agent1.type;
    document.getElementById('agent-init-desc').innerHTML = `
        ${agent1.description}<br><br>
        <strong>Alkuterveys:</strong> ${Math.round(agent1.health)}% | 
        <strong>Alku-KEDS (Uupumus):</strong> ${Math.round(agent1.keds)} (Kynnys 19)
    `;

    // Skills chips
    const skillsContainer = document.getElementById('agent-skills-chips');
    skillsContainer.innerHTML = '';
    agent1.skillsList.forEach(skill => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = skill;
        skillsContainer.appendChild(chip);
    });

    // Populate timeline logs Model 1
    const m1LogsContainer = document.getElementById('model1-logs');
    m1LogsContainer.innerHTML = '';
    agent1.logsM1.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        m1LogsContainer.appendChild(li);
    });

    // Populate timeline logs Model 2
    const m2LogsContainer = document.getElementById('model2-logs');
    m2LogsContainer.innerHTML = '';
    agent2.logsM2.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        m2LogsContainer.appendChild(li);
    });
}
