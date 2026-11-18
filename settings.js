const settingsKey = "filters";

const defaultFilters = Object.freeze({
  watchEnabled: true,
  lower: 25,
  upper: 75,
  ageEnabled: true,
});

function normalizeFilters(saved) {
  const filters = { ...defaultFilters, ...saved };
  const validRange = Number.isFinite(filters.lower) && Number.isFinite(filters.upper)
    && filters.lower >= 0 && filters.upper <= 100 && filters.lower <= filters.upper;
  if (!validRange) {
    return { ...filters, lower: defaultFilters.lower, upper: defaultFilters.upper };
  }

  return filters;
}

async function loadFilters() {
  const stored = await browser.storage.local.get(settingsKey);
  return normalizeFilters(stored[settingsKey]);
}
