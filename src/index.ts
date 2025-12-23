import './originalEventsHandling';
import { TagLinksModule } from './tagLinks';
import { NavigationModule } from './navigationModule';

const modules = [new TagLinksModule(), new NavigationModule()];

/**
 * Handle the events for the dynamically loading content
 */
function setContentChangeObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        modules.forEach((module) => {
          module.onMutation(mutation);
        });
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDocumentReady);

    return;
  }

  onDocumentReady();
}

function onDocumentReady() {
  setContentChangeObserver();
  modules.forEach((module) => {
    module.onDocumentReady();
  });
}

init();
