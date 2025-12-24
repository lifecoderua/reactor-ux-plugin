A Firefox plugin to improve the modern Reactor navigation and UX.

- works on https://safereactor.cc, https://joyreactor.cc and https://reactor.cc
- provides keyboard navigation
  - r - refresh feed (page)
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

> $ npm ci

Build the dist code

> $ npm run build

Build and watch for changes

> $ npm run watch

Build and package the addon

> $ npm run build:extension

# Plugin Install

In Firefox visit `about:debugging` > This Firefox > Load Temporary Add-on > select any file in the folder, e.g. manifest.json

Once installed, the addon could be updated with "Reload Add-on" under the addon entry on the same page.
