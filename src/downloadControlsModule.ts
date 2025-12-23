import { BaseModule } from './baseModule';

const DOWNLOAD_STYLE_ID = 'reactor-ux-download-styles';
const DOWNLOAD_HOST_CLASS = 'reactor-ux-download-host';
const DOWNLOAD_BUTTON_CLASS = 'reactor-ux-download-button';
const DOWNLOAD_DATA = 'reactorUxDownload';
const DOWNLOAD_URL_DATA = 'reactorUxDownloadUrl';
const DOWNLOAD_MESSAGE = 'reactorUxDownloadRequest';

export class DownloadControlsModule extends BaseModule {
  private boundHandleClick: (event: MouseEvent) => void;
  private cachedGifButtonClass: string | null = null;

  constructor() {
    super();
    this.boundHandleClick = this.handleDocumentClick.bind(this);
  }

  onDocumentReady() {
    this.ensureStyles();
    this.applyEnhancements(document);
    document.addEventListener('click', this.boundHandleClick, true);
  }

  onMutation(mutation: MutationRecord) {
    if (!mutation.addedNodes.length) {
      return;
    }

    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        this.applyEnhancements(node);
      }
    });
  }

  private ensureStyles() {
    if (document.getElementById(DOWNLOAD_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = DOWNLOAD_STYLE_ID;
    style.textContent = `
      .${DOWNLOAD_HOST_CLASS} {
        position: relative;
      }
      .${DOWNLOAD_BUTTON_CLASS} {
        position: absolute;
        right: 8px;
        bottom: 8px;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.15s ease;
        z-index: 2;
        display: inline-flex;
        gap: 6px;
      }
      .${DOWNLOAD_BUTTON_CLASS}.gifbuttons {
        align-items: center;
      }
      .${DOWNLOAD_HOST_CLASS}:hover > .${DOWNLOAD_BUTTON_CLASS},
      .${DOWNLOAD_HOST_CLASS}:focus-within > .${DOWNLOAD_BUTTON_CLASS} {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      @media (hover: none) {
        .${DOWNLOAD_BUTTON_CLASS} {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  private applyEnhancements(root: ParentNode) {
    this.addImageDownloadButtons(root);
  }

  private addImageDownloadButtons(root: ParentNode) {
    const contentRoots: Element[] = [];
    if (root instanceof Element && root.matches('.post-content')) {
      contentRoots.push(root);
    }
    contentRoots.push(...Array.from(root.querySelectorAll('.post-content')));

    contentRoots.forEach((contentRoot) => {
      const images = Array.from(contentRoot.querySelectorAll('img')) as HTMLImageElement[];
      images.forEach((image) => {
        if (image.dataset[DOWNLOAD_DATA] === '1') {
          return;
        }

        const downloadUrl = this.getImageDownloadUrl(image);
        if (!downloadUrl) {
          return;
        }

        const host = image.closest('.image') || image.closest('.video') || image.parentElement;
        if (!host) {
          return;
        }

        if (!host.classList.contains(DOWNLOAD_HOST_CLASS)) {
          host.classList.add(DOWNLOAD_HOST_CLASS);
        }
        if (host.querySelector(`.${DOWNLOAD_BUTTON_CLASS}`)) {
          image.dataset[DOWNLOAD_DATA] = '1';
          return;
        }

        const downloadWrap = document.createElement('div');
        downloadWrap.classList.add('gifbuttons', 'h-7', DOWNLOAD_BUTTON_CLASS);

        const downloadLink = document.createElement('a');
        downloadLink.className = this.getGifButtonLinkClass();
        downloadLink.href = downloadUrl;
        downloadLink.textContent = '⬇';
        downloadLink.setAttribute('aria-label', 'Download image');
        downloadLink.dataset[DOWNLOAD_URL_DATA] = downloadUrl;

        downloadWrap.append(downloadLink);
        host.append(downloadWrap);
        image.dataset[DOWNLOAD_DATA] = '1';
      });
    });
  }

  private handleDocumentClick(event: MouseEvent) {
    if (event.defaultPrevented) {
      return;
    }
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest('a') as HTMLAnchorElement | null;
    if (!link) {
      return;
    }

    const customUrl = link.dataset[DOWNLOAD_URL_DATA];
    const inGifButtons = Boolean(link.closest('.gifbuttons'));
    const downloadUrl = customUrl || (inGifButtons ? link.href : null);
    if (!downloadUrl) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    const filename = this.getFilename(downloadUrl);
    this.requestDownload(downloadUrl, filename, window.location.href);
  }

  private requestDownload(url: string, filename: string | null, referrer: string) {
    const runtimes = this.getRuntimes();
    const payload = { type: DOWNLOAD_MESSAGE, url, filename, referrer };

    if (runtimes.browserRuntime?.sendMessage) {
      const request = runtimes.browserRuntime.sendMessage(payload);
      if (request && typeof request.then === 'function') {
        request.then((response: { ok?: boolean } | undefined) => {
          if (!response?.ok) {
            window.open(url, '_blank', 'noopener');
          }
        }).catch(() => {
          window.open(url, '_blank', 'noopener');
        });
        return;
      }
    }

    if (runtimes.chromeRuntime?.sendMessage) {
      runtimes.chromeRuntime.sendMessage(payload, (response: { ok?: boolean } | undefined) => {
        if (runtimes.chromeRuntime?.lastError || !response?.ok) {
          window.open(url, '_blank', 'noopener');
        }
      });
      return;
    }

    window.open(url, '_blank', 'noopener');
  }

  private getRuntimes() {
    const anyGlobal = globalThis as {
      browser?: { runtime?: { sendMessage: Function } };
      chrome?: { runtime?: { sendMessage: Function; lastError?: { message?: string } } };
    };
    return {
      browserRuntime: anyGlobal.browser?.runtime,
      chromeRuntime: anyGlobal.chrome?.runtime,
    };
  }

  private getGifButtonLinkClass() {
    if (this.cachedGifButtonClass !== null) {
      return this.cachedGifButtonClass;
    }
    const sample = document.querySelector('.gifbuttons a') as HTMLAnchorElement | null;
    this.cachedGifButtonClass = sample?.className || 'ant-btn ant-btn-link text-sm';
    return this.cachedGifButtonClass;
  }

  private getImageDownloadUrl(image: HTMLImageElement) {
    const anchor = image.closest('a[href]') as HTMLAnchorElement | null;
    const rawUrl = anchor?.getAttribute('href')
      || image.getAttribute('data-src')
      || image.getAttribute('data-original')
      || image.currentSrc
      || image.src
      || '';
    if (!rawUrl) {
      return '';
    }
    try {
      return new URL(rawUrl, window.location.href).toString();
    } catch (error) {
      return rawUrl;
    }
  }

  private getFilename(url: string) {
    try {
      const parsed = new URL(url);
      const raw = parsed.pathname.split('/').pop();
      if (raw) {
        return decodeURIComponent(raw);
      }
    } catch (error) {
      return null;
    }
    return null;
  }
}
