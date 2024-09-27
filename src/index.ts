console.log('ReactorUX loaded');
document.body.style.border = "5px solid red";

// TODO: support caps
// TODO: support cyrillic / charkey
enum KEY_BINDING {
  CONTENT_PREVIOUS = 'w',
  CONTENT_NEXT = 's',
  POST_PREVIOUS = 'a',
  POST_NEXT = 'd',
  PAGE_NEXT = 'c',
}

let selectedContentEntry: HTMLElement | null = null;
let selectedPost: HTMLElement | null = null;

// Function to handle keypress events
function handleKeyPress(event: KeyboardEvent) {
  console.log(`Key pressed: ${event.key}`, event);

  switch (event.key) {
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

function handlePageNext() {
  const nextPageLink = document.querySelector('.min-h-pagination a:last-child') as HTMLAnchorElement;
  if (nextPageLink) {
    nextPageLink.click();
  }
}

function navigateContent(direction: number) {
  const contentEntries = document.querySelectorAll('.content-card .post-content > div');
  if (contentEntries.length === 0) return;

  let currentIndex = selectedContentEntry ? Array.from(contentEntries).indexOf(selectedContentEntry) : -1;
  currentIndex = (currentIndex + direction + contentEntries.length) % contentEntries.length;

  setSelectedContentEntry(contentEntries[currentIndex] as HTMLElement);
}

function navigatePost(direction: number) {
  const posts = document.querySelectorAll('.content-card');
  if (posts.length === 0) return;

  let currentIndex = selectedPost ? Array.from(posts).indexOf(selectedPost) : -1;
  currentIndex = (currentIndex + direction + posts.length) % posts.length;

  const newPost = posts[currentIndex] as HTMLElement;
  const firstContentEntry = newPost.querySelector('.post-content > div') as HTMLElement;
  setSelectedContentEntry(firstContentEntry);
}

function setSelectedContentEntry(entry: HTMLElement) {
  if (selectedContentEntry) {
    selectedContentEntry.style.border = '';
  }
  selectedContentEntry = entry;
  selectedContentEntry.style.border = '5px solid orange';
  selectedContentEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const newPost = selectedContentEntry.closest('.content-card') as HTMLElement;
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

// Function to initialize the visible content entry
function initializeVisibleContent() {
  const contentEntries = document.querySelectorAll('.content-card .post-content > div');
  for (const entry of Array.from(contentEntries)) {
    const rect = entry.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
      setSelectedContentEntry(entry as HTMLElement);
      break;
    }
  }
}

// Initialize the visible content entry on page load
window.addEventListener('load', initializeVisibleContent);

// Add event listener for keypress events
document.addEventListener('keypress', handleKeyPress);