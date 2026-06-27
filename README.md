Common Good Paradigm: Dynamic Monte Carlo Simulation
This repository contains a stochastic Monte Carlo simulation framework (N=1,000 agents, 12–24 month tracking period) developed to evaluate the systemic cumulative costs and KEDS (Karolinska Exhaustion Disorder Scale) cognitive friction of modern Finnish employment service reforms.

🚀 Access the Simulator
The interactive simulation dashboard is live and accessible in your browser:
👉 https://commongoodproject.github.io/keds-monte-carlo-simulation/

Abstract & The Core Anomaly
During initial runs modeling the standard sanction-based activation model (HE 108/2025), the simulation revealed an unexpected mathematical divergence: while the model generates direct fiscal savings via basic social assistance reductions (20–50%), the cumulative system costs spike exponentially at Month 4.

This occurs because standard macroeconomic models assume linear human elasticity. When the simulation introduces cognitive load variables (KEDS score ≥ 19, biological threat-system activation), synchronous application quotas under financial stress cease to produce employment. Instead, they trigger secondary acute crisis costs (evictions, acute psychiatric hospitalisations: avg. €18,000 / event) shifted to municipal and healthcare budgets.

Total simulated 12-month net cost (Sanction Model): ~€27.7M (778 severe crisis events)

Total simulated 12-month net cost (Option B / Common Good): ~€4.5M (0 severe crisis events)

Engine & Infrastructure
The simulation engine is built to be transparent and reproducible:

Monte Carlo Engine (app.js): A custom JS-based stochastic model that executes 1,000 iterations per scenario. It handles the probability of "crisis events" based on individual KEDS-load thresholds.

Data Pipeline: The simulation pulls parameters from /data/simulation_parameters.csv. You can fork this repo and modify the CSV to test your own hypotheses regarding KEDS-load impact.

Hosting: The engine is deployed via GitHub Pages, ensuring that the logic is always accessible for real-time verification without requiring local environment setup.

Option B: The "Common Good" Comparative Benchmark
Option B replaces synchronous compliance tracking with asynchronous skills-matching and direct need-based credit incentives. This eliminates administrative lag and threat-state cognitive paralysis, keeping parameters mathematically stable across the 24-month lifecycle.

Peer Review Request
The simulation logic, statistical baseline parameters, and raw data are published here for open scrutiny. If you identify logical errors, wish to calibrate parameters, or propose alternative models, pull requests and issue reports are highly encouraged.

Data sources: THL, Kela statistical yearbooks, SOSTE, Karolinska Institutet KEDS validation studies, Finnish Government Proposal HE 108/2025.
This project is part of the "Common Good Project" infrastructure.
