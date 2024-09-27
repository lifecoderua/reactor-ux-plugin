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
  const contentEntries = document.querySelectorAll('.content-card .post-content .image');
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

  setSelectedPost(posts[currentIndex] as HTMLElement);
}

function setSelectedContentEntry(entry: HTMLElement) {
  if (selectedContentEntry) {
    selectedContentEntry.style.border = '';
  }
  selectedContentEntry = entry;
  selectedContentEntry.style.border = '5px solid orange';
  selectedContentEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setSelectedPost(post: HTMLElement) {
  if (selectedPost) {
    selectedPost.style.border = '';
    const expandWrapper = selectedPost.querySelector('.expand-wrapper') as HTMLElement;
    if (expandWrapper) {
      expandWrapper.style.maxHeight = '1000px';
      expandWrapper.style.overflow = 'hidden';
    }
  }
  selectedPost = post;
  selectedPost.style.border = '5px solid orange';
  const expandWrapper = selectedPost.querySelector('.expand-wrapper') as HTMLElement;
  if (expandWrapper) {
    expandWrapper.style.maxHeight = '100%';
    expandWrapper.style.overflow = 'clip';
  }
  selectedPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add event listener for keypress events
document.addEventListener('keypress', handleKeyPress);