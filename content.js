const richItemSelector = "ytd-rich-item-renderer";
const cardSelector = [
  richItemSelector,
  "ytd-rich-grid-media",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-playlist-video-renderer",
  "yt-lockup-view-model",
].join(", ");

const videoLinkSelector = [
  "a#thumbnail[href]",
  "a#video-title[href]",
  "a#video-title-link[href]",
  "a.ytLockupViewModelContentImage[href]",
  "a.ytLockupMetadataViewModelTitle[href]",
].join(", ");

const resumeOverlaySelector = [
  "ytd-thumbnail-overlay-resume-playback-renderer",
  "ytw-thumbnail-overlay-resume-playback-renderer",
  "yt-thumbnail-overlay-progress-bar-view-model",
].join(", ");

const progressFillSelector = [
  "ytd-thumbnail-overlay-resume-playback-renderer #progress",
  "ytw-thumbnail-overlay-resume-playback-renderer .ytwThumbnailOverlayResumePlaybackRendererThumbnailOverlayResumePlaybackProgress",
  "yt-thumbnail-overlay-progress-bar-view-model .ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment",
].join(", ");

const publishedDateSelector = [
  "[itemprop='datePublished'][content]",
  "[itemprop='uploadDate'][content]",
  "time[datetime]",
].join(", ");

const ageLabelSelector = [
  "#metadata-line > span",
  "#video-info > span",
  "yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow:last-child > .ytContentMetadataViewModelMetadataText",
].join(", ");

const pendingCards = new Set();
let filters;
let scheduled = false;

function hasVideoLink(card) {
  for (const link of card.querySelectorAll(videoLinkSelector)) {
    if (link.origin !== location.origin) continue;
    if ((link.pathname === "/watch" && new URLSearchParams(link.search).has("v"))
      || link.pathname.startsWith("/shorts/")) {
      return true;
    }
  }
  return false;
}

function readProgress(card) {
  for (const fill of card.querySelectorAll(progressFillSelector)) {
    const overlay = fill.closest(resumeOverlaySelector);
    if (overlay.hidden || overlay.style.display === "none") continue;

    const width = fill.style.width;
    if (!width.endsWith("%")) continue;
    const progress = Number.parseFloat(width);
    if (progress >= 0 && progress <= 100) return progress;
  }
  return null;
}

function isOutsideWatchRange(card) {
  const progress = readProgress(card);
  return progress !== null && progress > 0
    && (progress < filters.lower || progress > filters.upper);
}

function twoYearsBefore(now) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 2);
  // Keep the cutoff in February when the current date is February 29.
  if (cutoff.getMonth() !== now.getMonth()) cutoff.setDate(0);
  return cutoff;
}

function isOldAgeLabel(label) {
  if (!label) return false;
  const text = label.trim();
  const years = text.match(/\b(\d+)\s*(?:y|yrs?|years?)\s+ago$/i)
    ?? text.match(/\bhá\s+(\d+)\s+anos?$/i);
  if (years) return Number(years[1]) >= 2;

  const months = text.match(/\b(\d+)\s*(?:mos?|months?)\s+ago$/i)
    ?? text.match(/\bhá\s+(\d+)\s+(?:mês|meses)$/i);
  return months !== null && Number(months[1]) >= 24;
}

function isOlderThanTwoYears(card, cutoff) {
  for (const date of card.querySelectorAll(publishedDateSelector)) {
    const value = date.getAttribute("datetime") ?? date.getAttribute("content");
    if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) continue;
    const dateOnly = value.length === 10;
    const published = Date.parse(dateOnly ? `${value}T00:00:00` : value);
    if (Number.isFinite(published)) {
      const limit = dateOnly ? new Date(cutoff).setHours(0, 0, 0, 0) : cutoff.getTime();
      return published < limit;
    }
  }

  return Array.from(card.querySelectorAll(ageLabelSelector)).some((label) => (
    !label.hidden && (isOldAgeLabel(label.getAttribute("aria-label")) || isOldAgeLabel(label.textContent))
  ));
}

function flushCards() {
  scheduled = false;
  const cutoff = twoYearsBefore(new Date());
  for (const card of pendingCards) {
    if (!card.isConnected) continue;
    const hide = hasVideoLink(card) && (
      (filters.watchEnabled && isOutsideWatchRange(card))
      || (filters.ageEnabled && isOlderThanTwoYears(card, cutoff))
    );
    card.toggleAttribute("data-metis-hidden", hide);
  }
  pendingCards.clear();
}

function scheduleUpdate() {
  if (!scheduled && pendingCards.size > 0) {
    scheduled = true;
    requestAnimationFrame(flushCards);
  }
}

function queueCard(card) {
  // Hide the grid item itself so a filtered recommendation leaves no blank slot.
  pendingCards.add(card.closest(richItemSelector) ?? card);
}

function queueWithin(root) {
  if (root.matches(cardSelector)) queueCard(root);
  for (const card of root.querySelectorAll(cardSelector)) queueCard(card);
}

function scanPage() {
  queueWithin(document.body);
  scheduleUpdate();
}

function onPageMutations(mutations) {
  for (const mutation of mutations) {
    const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
    if (!target) continue;
    if (mutation.attributeName === "style" && !target.matches(progressFillSelector)
      && !target.matches(resumeOverlaySelector)) continue;

    const card = target.closest(cardSelector);
    if (card) {
      queueCard(card);
    } else {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) queueWithin(node);
      }
    }
  }
  scheduleUpdate();
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[settingsKey]) {
    filters = normalizeFilters(changes[settingsKey].newValue);
    scanPage();
  }
});

async function startFiltering() {
  try {
    const saved = await loadFilters();
    filters ??= saved;
  } catch (error) {
    filters ??= defaultFilters;
    console.error("Metis could not load filter settings.", error);
  }

  new MutationObserver(onPageMutations).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributeFilter: ["aria-label", "content", "datetime", "hidden", "href", "style"],
  });
  document.addEventListener("yt-navigate-finish", scanPage);
  scanPage();
}

startFiltering();
