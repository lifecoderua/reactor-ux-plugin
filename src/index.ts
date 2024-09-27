enum KEY_BINDING {
  CONTENT_PREVIOUS = 'KeyW',
  CONTENT_NEXT = 'KeyS',
  POST_PREVIOUS = 'KeyA',
  POST_NEXT = 'KeyD',
  PAGE_NEXT = 'KeyC',
  TOGGLE_COMMENTS = 'KeyE',
}

let selectedContentEntry: HTMLElement | null = null;
let selectedPost: HTMLElement | null = null;

// Handle keypress events
function handleKeyPress(event: KeyboardEvent) {
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
    case KEY_BINDING.POST_PREVIOUS:
      handlePostPrevious();
      break;
    case KEY_BINDING.POST_NEXT:
      handlePostNext();
      break;
    case KEY_BINDING.PAGE_NEXT:
      handlePageNext();
      break;
    case KEY_BINDING.TOGGLE_COMMENTS:
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

function navigateContent(direction: number) {
  const contentEntries = document.querySelectorAll('.post-card .post-content > div');
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
  const firstContentEntry = newPost.querySelector('.post-content > div') as HTMLElement;
  setSelectedContentEntry(firstContentEntry);
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

function setSelectedPost(post: HTMLElement) {
  if (selectedPost) {
    selectedPost.style.border = '';
  }
  selectedPost = post;
  selectedPost.style.border = '5px solid orange';
  const expandWrapper = selectedPost.querySelector('.expand-wrapper') as HTMLElement;
  if (expandWrapper) {
    expandWrapper.style.maxHeight = '100%';
    expandWrapper.style.overflow = 'clip';
  }
}

// Determine the visible post on first navigation
function initializeVisiblePost() {
  const posts = document.querySelectorAll('.post-card');
  for (const post of Array.from(posts)) {
    const rect = post.getBoundingClientRect();
    if (rect.top >= 0) {
      const firstContentEntry = post.querySelector('.post-content > div') as HTMLElement;
      setSelectedContentEntry(firstContentEntry);
      break;
    }
  }
}

// Add event listener for keypress events
document.addEventListener('keypress', handleKeyPress);