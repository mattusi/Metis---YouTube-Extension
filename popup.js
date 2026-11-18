const form = document.querySelector("#filters");
const filterSettings = document.querySelector("#filter-settings");
const watchSettings = document.querySelector("#watch-settings");
const ageSettings = document.querySelector("#age-settings");
const statusMessage = document.querySelector("#status");
const { watchEnabled, lower, upper, ageEnabled, ageYears } = form.elements;

async function initializePopup() {
  try {
    const filters = await loadFilters();
    watchEnabled.checked = filters.watchEnabled;
    lower.value = filters.lower;
    upper.value = filters.upper;
    ageEnabled.checked = filters.ageEnabled;
    ageYears.value = filters.ageYears;
    watchSettings.disabled = !watchEnabled.checked;
    ageSettings.disabled = !ageEnabled.checked;
    filterSettings.disabled = false;
  } catch (error) {
    statusMessage.textContent = "Could not load filter settings.";
    console.error(error);
  }
}

form.addEventListener("input", () => {
  statusMessage.textContent = "";
  upper.setCustomValidity("");
  watchSettings.disabled = !watchEnabled.checked;
  ageSettings.disabled = !ageEnabled.checked;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (watchEnabled.checked && lower.valueAsNumber > upper.valueAsNumber) {
    upper.setCustomValidity("The upper limit must be at least the lower limit.");
    upper.reportValidity();
    return;
  }

  const filters = normalizeFilters({
    watchEnabled: watchEnabled.checked,
    lower: lower.valueAsNumber,
    upper: upper.valueAsNumber,
    ageEnabled: ageEnabled.checked,
    ageYears: ageYears.valueAsNumber,
  });

  filterSettings.disabled = true;
  try {
    await browser.storage.local.set({ [settingsKey]: filters });
    lower.value = filters.lower;
    upper.value = filters.upper;
    ageYears.value = filters.ageYears;
    statusMessage.textContent = "Filters applied.";
  } catch (error) {
    statusMessage.textContent = "Could not save filter settings.";
    console.error(error);
  } finally {
    filterSettings.disabled = false;
  }
});

initializePopup();
