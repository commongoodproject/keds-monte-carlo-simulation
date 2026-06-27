# Dynamic Monte Carlo Simulation of Finnish Social Policy Reforms (HE 108/2025)

This repository contains a stochastic Monte Carlo simulation framework (N=1,000 agents, 12–24 month tracking period) developed to evaluate the systemic cumulative costs and KEDS (Karolinska Exhaustion Disorder Scale) cognitive friction of modern Finnish employment service reforms.

## Abstract & The Core Anomaly

During initial runs modeling the standard sanction-based activation model (HE 108/2025), the simulation revealed an unexpected mathematical divergence: **while the model successfully generates direct fiscal savings via basic social assistance reductions (20–50%), the cumulative system costs spike exponentially at Month 4.**

This appears to occur because standard macroeconomic models assume linear human elasticity. When the simulation introduces cognitive load variables (KEDS score $\ge$ 19, biological threat-system activation), synchronous application quotas (4/month) under financial stress cease to produce matching employment. Instead, they trigger secondary acute crisis costs (evictions, acute psychiatric hospitalisations: avg. €18,000 / event) shifted to municipal and healthcare budgets.

* Total simulated 12-month net cost (Sanction Model): **~€27.7M** (778 severe crisis events)
* Total simulated 12-month net cost (Option B / Common Good Sandbox): **~€4.5M** (0 severe crisis events)

## Option B: The "Common Good" Comparative Benchmark

To verify whether the anomaly was a bug in the code logic, an alternative benchmark ("Option B") was constructed using identical baseline populations. Option B replaces synchronous compliance tracking with asynchronous skills-matching and direct need-based credit incentives, eliminating administrative lag and threat-state cognitive paralysis.

In this benchmark model, parameters remain mathematically stable across the 24-month lifecycle, and the net fiscal outcome aligns positively with public finance sustainability goals.

## Request for Peer Review

The simulation logic, statistical baseline parameters, and raw data outputs are published here for open scrutiny. **If there is a logical flaw in the KEDS load-resistance assumptions or the Python execution pipeline, peer feedback and pull requests are highly welcomed.**

---
*Data sources: THL, Kela statistical yearbooks, SOSTE, Karolinska Institutet KEDS validation studies, Finnish Government Proposal HE 108/2025.*
