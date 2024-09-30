A Firefox plugin to improve the modern Reactor navigation and UX.

- works on https://m.joyreactor.cc
- provides keyboard navigation
  - w/s — Content back/forward (per image/video)
  - a/d - Post back/forward (per post)
  - z - previous page
  - c - next page
  - e - toggle comments
  - f - star post
  - y/n - upvote / downvote
  - p - run/pause video

# Build

Install dependencies

$ npm ci

Build the dist code

$ npm run build

# Plugin Install

In Firefox visit `about:debugging` > This Firefox > Load Temporary Add-on > select any file in the folder, e.g. manifest.json

Once installed, the addon could be updated with "Reload Add-on" under the addon entry on the same page.