from app.optimization.models import OptimizationRequest, ScoredOption


def select_optimal_option(options: list[ScoredOption], request: OptimizationRequest) -> tuple[ScoredOption, str]:
    try:
        from ortools.sat.python import cp_model
    except Exception:
        return max(options, key=lambda option: option.score), "deterministic-fallback"

    model = cp_model.CpModel()
    chosen = [model.NewBoolVar(f"choose_{option.option}") for option in options]
    model.Add(sum(chosen) == 1)

    for index, option in enumerate(options):
        if option.refineryBufferDays < request.refinery.minimumBufferDays:
            model.Add(chosen[index] == 0)

    objective_terms = []
    for index, option in enumerate(options):
        scaled_objective = int(round(option.objectiveValue * 100))
        stability_bonus = int(round(option.etaConfidence * 400))
        objective_terms.append(chosen[index] * (scaled_objective - stability_bonus))
    model.Minimize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 0.25
    solver.parameters.num_search_workers = 1
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return max(options, key=lambda option: option.score), "ortools-fallback"

    for index, option in enumerate(options):
        if solver.Value(chosen[index]):
            return option, "ortools-cp-sat"
    return max(options, key=lambda option: option.score), "ortools-fallback"
