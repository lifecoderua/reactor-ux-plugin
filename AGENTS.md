# About

Reactor-UX is a web extension providing an improved UX for https://safereactor imageboard 
and clones sharing the same content engine.

# Workflow and Tooling

- use `Playwright MCP` to validate page structure and test scripts
  - on start, check if the Playwright's browser is already open. If yes - reopen it.
- use `tsc` for lint

# Data fetching

- when navigated past the last post using `s` key, the new data get loaded without the page reload.
- the same happens on the web-ext `c`, `z`, and native navigation by page links (`Лента`, `Новое`, `Хорошее` etc)
- occasionally extra posts get loaded without navigation due to content filters and user preferences
- behaviour modification should account for this specifics and apply to the freshly loaded posts

# Media Types

- As an imageboard, the primary media is a Post, containing one or multiple child elements. 
- Children types are Image, Video or Text. 
- The Post's HTML structure is dictated by WYSIWYG and could be inconsistent.

# Example pages

- https://safereactor.cc/post/6227169 - mixed text and image Post
- https://safereactor.cc/post/6173338 - mixed text and image Post with an alternative HTML structure
- https://safereactor.cc/post/5771376 - another complex irregular structure, multiple image wrapper types
- https://safereactor.cc/post/5616581 - multiple video Post
- 
