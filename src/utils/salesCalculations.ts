
interface AverageSale {
  monthly: { [machineId: string]: number };
  annual: { [machineId: string]: number };
  selected: { [machineId: string]: number };
}

export const calculateAverages = (avgSales: AverageSale) => {
  const defaultAverage = { monthly: 0, annual: 0, selected: 0 };

  if (!avgSales || !avgSales.monthly || !avgSales.annual) {
    return defaultAverage;
  }

  try {
    let monthlyAvg = 0;
    let annualAvg = 0;
    let selectedAvg = 0;

    for (var id in avgSales.monthly) {
        monthlyAvg += avgSales.monthly[id];
    }
    for (var id in avgSales.annual) {
        annualAvg += avgSales.annual[id];
    }
    for (var id in avgSales.selected) {
        selectedAvg += avgSales.selected[id];
    }

    monthlyAvg = monthlyAvg / Object.keys(avgSales.monthly).length;
    annualAvg = annualAvg / Object.keys(avgSales.annual).length;
    selectedAvg = selectedAvg / Object.keys(avgSales.selected).length;

    return { monthly: monthlyAvg, annual: annualAvg, selected: selectedAvg };
  } catch (error) {
    console.error("Error calculating averages:", error);
    return defaultAverage;
  }
};
