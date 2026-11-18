# Metis for YouTube

A Firefox extension that filters videos on YouTube by age and watch progress.

## Installation

1. Clone this repository or download and extract the ZIP.
2. In Firefox, open `about:debugging` and choose **This Firefox**.
3. Click **Load Temporary Add-on** and select `manifest.json`.
4. Refresh YouTube.

Load the add-on again after restarting Firefox.

## Usage

Metis hides videos older than two years. By default, it also hides videos you've started if you stopped before 25% or after 75%. Unwatched videos are exempt from the watch filter.

Open **Metis for YouTube** from the Extensions menu to change the range or turn off either filter. Click **Apply filters** to save.

The watch filter skips thumbnails without a progress bar. The age filter reads dates and English or Portuguese age labels. A label of "2 years ago" meets the cutoff.

## Development

After editing the source, click **Reload** next to Metis in `about:debugging`, then refresh YouTube.
