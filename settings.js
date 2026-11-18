const settingsKey = "filters";

const defaultFilters = Object.freeze({
  watchEnabled: true,
  lower: 25,
  upper: 75,
  ageEnabled: true,
  ageYears: 2,
});

function normalizeFilters(saved) {
  const filters = { ...defaultFilters, ...saved };
  const validRange = Number.isFinite(filters.lower) && Number.isFinite(filters.upper)
    && filters.lower >= 0 && filters.upper <= 100 && filters.lower <= filters.upper;
  if (!validRange) {
    filters.lower = defaultFilters.lower;
    filters.upper = defaultFilters.upper;
  }
  if (!Number.isInteger(filters.ageYears) || filters.ageYears < 1) {
    filters.ageYears = defaultFilters.ageYears;
  }

  return filters;
}

async function loadFilters() {
  const stored = await browser.storage.local.get(settingsKey);
  return normalizeFilters(stored[settingsKey]);
}
