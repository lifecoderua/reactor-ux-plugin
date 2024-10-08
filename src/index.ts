enum KEY_BINDING {
  CONTENT_PREVIOUS = 'KeyW',
  CONTENT_NEXT = 'KeyS',
  CONTENT_PLAY_TOGGLE = 'KeyP',
  POST_PREVIOUS = 'KeyA',
  POST_NEXT = 'KeyD',
  PAGE_PREVIOUS = 'KeyZ',
  PAGE_NEXT = 'KeyC',
  PAGE_REFRESH = 'KeyR',
  POST_TOGGLE_COMMENTS = 'KeyE',
  POST_UPVOTE = 'KeyY',
  POST_DOWNVOTE = 'KeyN',
  POST_ADD_TO_FAVOURITE = 'KeyF',
}

let selectedContentEntry: HTMLElement | null = null;
let selectedPost: HTMLElement | null = null;

// Handle keypress events
function handleKeyPress(event: KeyboardEvent) {
  // if focused element is inside .comment-form — exit early
  if (document.activeElement?.closest('.comment-form') 
    || document.activeElement?.closest('input')) {
    return;
  }

  if (!selectedContentEntry) {
    initializeVisiblePost();

    // We selected the closest NEXT Post/Content. No need to navigate further.
    if ([KEY_BINDING.CONTENT_NEXT, KEY_BINDING.POST_NEXT].includes(event.code as KEY_BINDING)) {
      return;
    }
  }

  switch (event.code) {
    case KEY_BINDING.CONTENT_PREVIOUS:
      handleContentPrevious();
      break;
    case KEY_BINDING.CONTENT_NEXT:
      handleContentNext();
      break;
    case KEY_BINDING.CONTENT_PLAY_TOGGLE:
      handleContentPlayToggle();
      break;
    case KEY_BINDING.POST_PREVIOUS:
      handlePostPrevious();
      break;
    case KEY_BINDING.POST_NEXT:
      handlePostNext();
      break;
    case KEY_BINDING.PAGE_NEXT:
      handlePageNext();
      break;
    case KEY_BINDING.PAGE_PREVIOUS:
      handlePagePrevious();
      break;
    case KEY_BINDING.PAGE_REFRESH:
      handlePageRefresh();
      break;
    case KEY_BINDING.POST_UPVOTE:
      handlePostUpvote();
      break;
    case KEY_BINDING.POST_DOWNVOTE:
      handlePostDownvote();
      break;
    case KEY_BINDING.POST_ADD_TO_FAVOURITE:
      handlePostAddToFavourite();
      break;
    case KEY_BINDING.POST_TOGGLE_COMMENTS:
      toggleComments();
      break;
  }
}

function handleContentPrevious() {
  navigateContent(-1);
}

function handleContentNext() {
  navigateContent(1);
}

function handleContentPlayToggle() {
  if (!selectedPost || !selectedContentEntry) { return; }

  const videoElement = selectedContentEntry.querySelector('video') as HTMLVideoElement
    || selectedPost.querySelector('video') as HTMLVideoElement

  if (videoElement) {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
}

function handlePostPrevious() {
  navigatePost(-1);
}

function handlePostNext() {
  navigatePost(1);
}

function toggleComments() {
  if (!selectedPost) { return; }

  const commentButton = selectedPost.querySelector('.comment-button') as HTMLElement;
  if (commentButton) {
    commentButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentButton.click();
  }
}

function handlePageNext() {
  const nextPageLink = document.querySelector('.min-h-pagination a:last-child') as HTMLAnchorElement;
  if (nextPageLink) {
    nextPageLink.click();
  }
}

function handlePagePrevious() {
  const previousPageLink = document.querySelector('.min-h-pagination a:first-child') as HTMLAnchorElement;
  if (previousPageLink) {
    previousPageLink.click();
  }
}

function handlePageRefresh() {
  const refreshButton = document.querySelector('.secondary-menu .ant-btn-primary') as HTMLButtonElement;
  if (refreshButton) {
    unsetSelectedPost();
    selectedContentEntry = null;
    refreshButton.click();
    window.scrollTo(0, 0);
  }
}

function navigateContent(direction: number) {
  const contentEntries = document.querySelectorAll('.post-card .post-header, .post-content > div[class]:not(:first-of-type)');
  if (contentEntries.length === 0) return;

  let currentIndex = selectedContentEntry ? Array.from(contentEntries).indexOf(selectedContentEntry) : -1;
  currentIndex += direction;

  if (currentIndex < 0) {
    currentIndex = 0;
  } else if (currentIndex >= contentEntries.length) {
    handlePageNext();
    return;
  }

  setSelectedContentEntry(contentEntries[currentIndex] as HTMLElement);
}

function navigatePost(direction: number) {
  const posts = document.querySelectorAll('.post-card');
  if (posts.length === 0) return;

  let currentIndex = selectedPost ? Array.from(posts).indexOf(selectedPost) : -1;
  currentIndex += direction;

  if (currentIndex < 0) {
    currentIndex = 0;
  } else if (currentIndex >= posts.length) {
    handlePageNext();
    return;
  }

  const newPost = posts[currentIndex] as HTMLElement;
  const firstContentEntry = newPost.querySelector('.post-header, .post-content > div[class]:not(:first-of-type)') as HTMLElement;
  setSelectedContentEntry(firstContentEntry);
}

function handlePostUpvote() {
  if (!selectedPost) { return; }

  const upvoteButton = selectedPost.querySelector('[aria-label="Upvote"]') as HTMLElement;
  if (upvoteButton) {
    upvoteButton.click();
  }
}

function handlePostDownvote() {
  if (!selectedPost) { return; }

  const downvoteButton = selectedPost.querySelector('[aria-label="Downvote"]') as HTMLElement;
  if (downvoteButton) {
    downvoteButton.click();
  }
}

function handlePostAddToFavourite() {
  if (!selectedPost) { return; }

  const favouriteButton = selectedPost.querySelector('[aria-label="star"]') as HTMLElement;
  if (favouriteButton) {
    favouriteButton.click();
  }
}

function setSelectedContentEntry(entry: HTMLElement) {
  if (selectedContentEntry) {
    selectedContentEntry.style.borderLeft = '';
  }
  selectedContentEntry = entry;
  // Borders doesn't play well with the content, causing a slight but irritating shift.
  // Maybe omit those entirely, or add some off-grid or overlay indication.
  selectedContentEntry.style.borderLeft = '0 solid orange';
  selectedContentEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const newPost = selectedContentEntry.closest('.post-card') as HTMLElement;
  if (newPost !== selectedPost) {
    setSelectedPost(newPost);
  }
}

function unsetSelectedPost() {
  if (selectedPost) {
    selectedPost.style.border = '';
  }
  selectedPost = null;
}

function setSelectedPost(post: HTMLElement) {
  unsetSelectedPost();
  selectedPost = post;
  selectedPost.style.border = '5px solid orange';
  const expandWrapper = selectedPost.querySelector('.expand-wrapper') as HTMLElement;
  if (expandWrapper) {
    expandWrapper.style.maxHeight = '100%';
    expandWrapper.style.overflow = 'clip';
    const expandableContentBlock = selectedPost.querySelector('.expandable-post-content');
    if (expandableContentBlock) {
      expandableContentBlock.remove();
    }
  }
}

// Determine the visible post on first navigation
function initializeVisiblePost() {
  const posts = document.querySelectorAll('.post-card');
  for (const post of Array.from(posts)) {
    const rect = post.getBoundingClientRect();
    if (rect.top >= 0) {
      const firstContentEntry = post.querySelector('.post-header, .post-content > div[class]:not(:first-of-type)') as HTMLElement;
      setSelectedContentEntry(firstContentEntry);
      break;
    }
  }
}

/**
 * Prevents controls from seizing focus, and re-trigger on Space press.
 * Allows navigation with Space
 */
function preventFocusCapture() {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        this.blur();
    });
  }); 
}

/**
 * Handle the events for the dynamically loading content
 */
function setContentChangeObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        preventFocusCapture();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}


/**
 * Entry point
 */
function init() {
  setContentChangeObserver();

  // Add event listener for keypress events
  document.addEventListener('keypress', handleKeyPress);
}

init();