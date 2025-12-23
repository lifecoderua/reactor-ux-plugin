/**
 * Modifies tag cloud behaviour.
 * Adds `m.` subdomain links.
 */


import { BaseModule } from "./baseModule";

const TAG_ORIGINAL_WRAPPER = '.ant-tag.tag-reactor';
const TAG_SPLIT_STYLE_ID = 'reactor-ux-tag-split-styles';
const TAG_SPLIT_DATA = 'reactorUxTagSplit';
const TAG_SPLIT_WRAPPER_CLASS = 'reactor-ux-tag-split';
const TAG_MOBILE_CLASS = 'reactor-ux-tag-mobile';
const TAG_MAIN_CLASS = 'reactor-ux-tag-main';

export class TagLinksModule extends BaseModule {
  onDocumentReady() {
    this.ensureTagStyles();
    this.enhancePostTags();
  }

  onMutation(mutation: MutationRecord) {
    if (!mutation.addedNodes.length) {
      return;
    }

    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        this.enhancePostTags(node);
      }
    });
  }

  private ensureTagStyles() {
    if (document.getElementById(TAG_SPLIT_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = TAG_SPLIT_STYLE_ID;
    style.textContent = `
      ${TAG_ORIGINAL_WRAPPER} {
        padding-left: 0;
        border: 0;
      }
      .${TAG_SPLIT_WRAPPER_CLASS} {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        overflow: hidden;
        margin-right: 6px;
      }
      .post-tags .${TAG_SPLIT_WRAPPER_CLASS} a {
        margin: 0;
      }
      .${TAG_MOBILE_CLASS} {
        background: #93C572;
        border-right: 1px solid #1f6b3c;
        color: #fff;
        font-weight: 600;
        padding: 2px 8px 2px 16px;
        text-decoration: none;
      }
      .${TAG_MAIN_CLASS} {
        padding-left: 6px;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  private enhancePostTags(root: ParentNode = document) {
    const tagContainers: Element[] = [];
    if (root instanceof Element && root.matches('.post-tags')) {
      tagContainers.push(root);
    }
    tagContainers.push(...Array.from(root.querySelectorAll('.post-tags')));

    tagContainers.forEach((container) => {
      const tagLinks = Array.from(container.querySelectorAll('a')) as HTMLAnchorElement[];
      tagLinks.forEach((tagLink) => {
        if (tagLink.classList.contains(TAG_MOBILE_CLASS)) {
          return;
        }
        if (tagLink.dataset[TAG_SPLIT_DATA] === '1') {
          return;
        }
        if (tagLink.closest(`.${TAG_SPLIT_WRAPPER_CLASS}`)) {
          return;
        }

        const mobileLink = document.createElement('a');
        mobileLink.classList.add(TAG_MOBILE_CLASS);
        mobileLink.href = this.getMobileTagHref(tagLink.getAttribute('href') || '');
        mobileLink.textContent = 'm.';
        mobileLink.setAttribute('aria-label', 'Open tag in mobile view');

        const wrapper = document.createElement('span');
        wrapper.classList.add(TAG_SPLIT_WRAPPER_CLASS);
        tagLink.classList.add(TAG_MAIN_CLASS);
        tagLink.dataset[TAG_SPLIT_DATA] = '1';

        tagLink.parentNode?.insertBefore(wrapper, tagLink);
        wrapper.append(mobileLink, tagLink);
      });
    });
  }

  private getMobileHost() {
    const currentHost = window.location.hostname;
    if (currentHost.startsWith('m.')) {
      return currentHost;
    }

    return `m.${currentHost}`;
  }

  private getMobileTagHref(originalHref: string) {
    const url = new URL(originalHref, window.location.origin);
    url.hostname = this.getMobileHost();
    return url.toString();
  }
}
