# Metis for YouTube

A Firefox extension that hides video cards on desktop YouTube. The filters work on Home, search results, channel videos, and related recommendations as they load.

- **Watch progress.** By default, 0% and 25% through 75% stay visible under this rule. Videos with progress above 0% and below 25%, or above 75%, are hidden.
- **Age.** Videos older than two years are hidden at any watch progress. When YouTube displays a relative age such as “2 years ago,” Metis uses the displayed value.

Use the toolbar popup to change the watch range or turn either filter off. Choose **Apply filters** to update open YouTube tabs.

The watch rule uses the thumbnail resume bars YouTube shows for eligible videos when you’re signed in. The age rule recognizes exact dates when present and relative age labels in English and Portuguese. A rule skips cards that lack the data it needs. Filtering only changes what appears on the page. Settings are stored locally in Firefox. [YouTube’s video progress bar documentation](https://support.google.com/youtube/answer/7174115)

## Try it in Firefox

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on…** and select `manifest.json` from this folder.
3. Open or refresh YouTube. Find **Metis for YouTube** in the Extensions menu to open its popup.

Firefox removes the temporary add-on when it restarts. Permanent installation in standard Firefox requires Mozilla signing. [Firefox installation documentation](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
