import { BaseModule } from './baseModule';

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

export class NavigationModule extends BaseModule {
  private selectedContentEntry: HTMLElement | null = null;
  private selectedPost: HTMLElement | null = null;
  private boundHandleKeyPress: (event: KeyboardEvent) => void;

  constructor() {
    super();
    this.boundHandleKeyPress = this.handleKeyPress.bind(this);
  }

  onDocumentReady() {
    document.addEventListener('keypress', this.boundHandleKeyPress);
  }

  onMutation(mutation: MutationRecord) {
    if (!mutation.addedNodes.length) {
      return;
    }

    this.preventFocusCapture();
  }

  private handleKeyPress(event: KeyboardEvent) {
    // if focused element is inside .comment-form — exit early
    if (document.activeElement?.closest('.comment-form')
      || document.activeElement?.closest('input')) {
      return;
    }

    if (!this.selectedContentEntry) {
      this.initializeVisiblePost();

      // We selected the closest NEXT Post/Content. No need to navigate further.
      if ([KEY_BINDING.CONTENT_NEXT, KEY_BINDING.POST_NEXT].includes(event.code as KEY_BINDING)) {
        return;
      }
    }

    switch (event.code) {
      case KEY_BINDING.CONTENT_PREVIOUS:
        this.handleContentPrevious();
        break;
      case KEY_BINDING.CONTENT_NEXT:
        this.handleContentNext();
        break;
      case KEY_BINDING.CONTENT_PLAY_TOGGLE:
        this.handleContentPlayToggle();
        break;
      case KEY_BINDING.POST_PREVIOUS:
        this.handlePostPrevious();
        break;
      case KEY_BINDING.POST_NEXT:
        this.handlePostNext();
        break;
      case KEY_BINDING.PAGE_NEXT:
        this.handlePageNext();
        break;
      case KEY_BINDING.PAGE_PREVIOUS:
        this.handlePagePrevious();
        break;
      case KEY_BINDING.PAGE_REFRESH:
        this.handlePageRefresh();
        break;
      case KEY_BINDING.POST_UPVOTE:
        this.handlePostUpvote();
        break;
      case KEY_BINDING.POST_DOWNVOTE:
        this.handlePostDownvote();
        break;
      case KEY_BINDING.POST_ADD_TO_FAVOURITE:
        this.handlePostAddToFavourite();
        break;
      case KEY_BINDING.POST_TOGGLE_COMMENTS:
        this.toggleComments();
        break;
    }
  }

  private handleContentPrevious() {
    this.navigateContent(-1);
  }

  private handleContentNext() {
    this.navigateContent(1);
  }

  private handleContentPlayToggle() {
    if (!this.selectedPost || !this.selectedContentEntry) { return; }

    const videoElement = this.selectedContentEntry.querySelector('video') as HTMLVideoElement
      || this.selectedPost.querySelector('video') as HTMLVideoElement

    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    }
  }

  private handlePostPrevious() {
    this.navigatePost(-1);
  }

  private handlePostNext() {
    this.navigatePost(1);
  }

  private toggleComments() {
    if (!this.selectedPost) { return; }

    const commentButton = this.selectedPost.querySelector('.comment-button') as HTMLElement;
    if (commentButton) {
      commentButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentButton.click();
    }
  }

  private handlePageNext() {
    const nextPageLink = document.querySelector('.min-h-pagination a:last-child') as HTMLAnchorElement;
    if (nextPageLink) {
      nextPageLink.click();
    }
  }

  private handlePagePrevious() {
    const previousPageLink = document.querySelector('.min-h-pagination a:first-child') as HTMLAnchorElement;
    if (previousPageLink) {
      previousPageLink.click();
    }
  }

  private handlePageRefresh() {
    const refreshButton = document.querySelector('.secondary-menu .ant-btn-primary') as HTMLButtonElement;
    if (refreshButton) {
      this.unsetSelectedPost();
      this.selectedContentEntry = null;
      refreshButton.click();
      window.scrollTo(0, 0);
    }
  }

  private getPostContentEntries(post: Element) {
    const entries: HTMLElement[] = [];
    const header = post.querySelector('.post-header') as HTMLElement;
    if (header) {
      entries.push(header);
    }
    const contentRoot = post.querySelector('.post-content');
    if (!contentRoot) {
      return entries;
    }

    const mediaBlocks = Array.from(contentRoot.children).filter((child) =>
      child.matches('img, video, iframe, picture')
      || child.querySelector('img, video, iframe, picture')
    ) as HTMLElement[];

    if (mediaBlocks.length ?? mediaBlocks.length > 1) {
      entries.push(...mediaBlocks.slice(1));

      return entries;
    }

    const standardBlocks = Array.from(
      contentRoot.querySelectorAll(':scope > div[class]:not(:first-of-type)')
    ) as HTMLElement[];
    if (standardBlocks.length) {
      entries.push(...standardBlocks);
      return entries;
    }

    const fallbackBlocks = Array.from(contentRoot.children).filter((child) =>
      child.querySelector('img, video, iframe')
    ) as HTMLElement[];

    if (fallbackBlocks.length > 1) {
      entries.push(...fallbackBlocks.slice(1));
    }

    return entries;
  }

  private getContentEntries() {
    const posts = Array.from(document.querySelectorAll('.post-card'));
    if (posts.length === 0) {
      const fallbackPost = document.querySelector('.post') || document.body;
      return this.getPostContentEntries(fallbackPost);
    }

    return posts.flatMap((post) => this.getPostContentEntries(post));
  }

  private navigateContent(direction: number) {
    const contentEntries = this.getContentEntries();
    if (contentEntries.length === 0) return;

    let currentIndex = this.selectedContentEntry ? contentEntries.indexOf(this.selectedContentEntry) : -1;
    currentIndex += direction;

    if (currentIndex < 0) {
      currentIndex = 0;
    } else if (currentIndex >= contentEntries.length) {
      this.handlePageNext();
      return;
    }

    this.setSelectedContentEntry(contentEntries[currentIndex]);
  }

  private navigatePost(direction: number) {
    const posts = document.querySelectorAll('.post-card');
    if (posts.length === 0) return;

    let currentIndex = this.selectedPost ? Array.from(posts).indexOf(this.selectedPost) : -1;
    currentIndex += direction;

    if (currentIndex < 0) {
      currentIndex = 0;
    } else if (currentIndex >= posts.length) {
      this.handlePageNext();
      return;
    }

    const newPost = posts[currentIndex] as HTMLElement;
    const contentEntries = this.getPostContentEntries(newPost);
    if (contentEntries[0]) {
      this.setSelectedContentEntry(contentEntries[0]);
    }
  }

  private handlePostUpvote() {
    if (!this.selectedPost) { return; }

    const upvoteButton = this.selectedPost.querySelector('[aria-label="Upvote"]') as HTMLElement;
    if (upvoteButton) {
      upvoteButton.click();
    }
  }

  private handlePostDownvote() {
    if (!this.selectedPost) { return; }

    const downvoteButton = this.selectedPost.querySelector('[aria-label="Downvote"]') as HTMLElement;
    if (downvoteButton) {
      downvoteButton.click();
    }
  }

  private handlePostAddToFavourite() {
    if (!this.selectedPost) { return; }

    const favouriteButton = this.selectedPost.querySelector('[aria-label="star"]') as HTMLElement;
    if (favouriteButton) {
      favouriteButton.click();
    }
  }

  private setSelectedContentEntry(entry: HTMLElement) {
    if (this.selectedContentEntry) {
      this.selectedContentEntry.style.borderLeft = '';
    }
    this.selectedContentEntry = entry;
    // Borders doesn't play well with the content, causing a slight but irritating shift.
    // Maybe omit those entirely, or add some off-grid or overlay indication.
    this.selectedContentEntry.style.borderLeft = '0 solid orange';
    this.selectedContentEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const newPost = this.selectedContentEntry.closest('.post-card') as HTMLElement;
    if (newPost !== this.selectedPost) {
      this.setSelectedPost(newPost);
    }
  }

  private unsetSelectedPost() {
    if (this.selectedPost) {
      this.selectedPost.style.border = '';
    }
    this.selectedPost = null;
  }

  private setSelectedPost(post: HTMLElement) {
    this.unsetSelectedPost();
    this.selectedPost = post;
    this.selectedPost.style.border = '5px solid orange';
    const expandWrapper = this.selectedPost.querySelector('.expand-wrapper') as HTMLElement;
    if (expandWrapper) {
      expandWrapper.style.maxHeight = '100%';
      expandWrapper.style.overflow = 'clip';
      const expandableContentBlock = this.selectedPost.querySelector('.expandable-post-content');
      if (expandableContentBlock) {
        expandableContentBlock.remove();
      }
    }
  }

  // Determine the visible post on first navigation
  private initializeVisiblePost() {
    const posts = document.querySelectorAll('.post-card');
    for (const post of Array.from(posts)) {
      const rect = post.getBoundingClientRect();
      if (rect.top >= 0) {
        const contentEntries = this.getPostContentEntries(post);
        if (contentEntries[0]) {
          this.setSelectedContentEntry(contentEntries[0]);
        }
        break;
      }
    }
  }

  /**
   * Prevents controls from seizing focus, and re-trigger on Space press.
   * Allows navigation with Space
   */
  private preventFocusCapture() {
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', function() {
          this.blur();
      });
    });
  }
}
