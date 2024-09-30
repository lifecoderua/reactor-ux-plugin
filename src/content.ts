export const SELECTORS = {
  hiddenPostsBox: ".content-container > .post-menu-button",
  unhideSinglePostButton: ".post-tags + button",
}

export const COMBINED_CONTENT_SELECTOR = `${SELECTORS.hiddenPostsBox}, ${SELECTORS.unhideSinglePostButton}`;

export function isHiddenPostsBox(element: HTMLElement) {
  return element.tagName.toLowerCase() === 'button' 
    && element.classList.contains('post-menu-button');
}

export function isCollapsedPost(element: HTMLElement) {
  return element.querySelector(SELECTORS.unhideSinglePostButton);
}