const ALLOWED_HOSTS = ['joyreactor.cc', 'safereactor.cc'];
const DOWNLOAD_MESSAGE = 'reactorUxDownloadRequest';

function isAllowedUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return ALLOWED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch (error) {
    return false;
  }
}

function sanitizeFilename(name) {
  return name.replace(/[\\/]+/g, '_').trim();
}

function getFilenameFromDisposition(value) {
  if (!value) {
    return null;
  }
  const utfMatch = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }
  const nameMatch = value.match(/filename="([^"]+)"/i) || value.match(/filename=([^;]+)/i);
  return nameMatch?.[1]?.trim() || null;
}

const hasBrowser = typeof browser !== 'undefined';
const runtime = hasBrowser ? browser.runtime : chrome.runtime;
const downloads = hasBrowser ? browser.downloads : chrome.downloads;

function downloadFromUrl(options) {
  if (hasBrowser) {
    return downloads.download(options);
  }
  return new Promise((resolve, reject) => {
    downloads.download(options, (downloadId) => {
      if (runtime.lastError || !downloadId) {
        reject(runtime.lastError);
        return;
      }
      resolve(downloadId);
    });
  });
}

async function handleDownloadRequest(message) {
  if (!message || message.type !== DOWNLOAD_MESSAGE || !message.url) {
    return { ok: false };
  }
  if (!isAllowedUrl(message.url)) {
    return { ok: false, error: 'disallowed-url' };
  }

  const directFilename = sanitizeFilename(message.filename || 'download');
  const directOptions = {
    url: message.url,
    filename: directFilename,
    conflictAction: 'uniquify',
    saveAs: false,
  };

  if (!hasBrowser && message.referrer) {
    directOptions.headers = [{ name: 'Referer', value: message.referrer }];
  }

  try {
    const downloadId = await downloadFromUrl(directOptions);
    return { ok: true, id: downloadId };
  } catch (error) {
    // Fall back to background fetch for browsers that reject direct downloads.
  }

  let response;
  try {
    response = await fetch(message.url, {
      credentials: 'include',
      referrer: message.referrer || undefined,
      referrerPolicy: 'unsafe-url',
    });
  } catch (error) {
    return { ok: false, error: 'fetch-failed' };
  }

  if (!response.ok) {
    return { ok: false, error: 'fetch-failed' };
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const headerName = getFilenameFromDisposition(response.headers.get('content-disposition'));
  const filename = sanitizeFilename(message.filename || headerName || 'download');

  try {
    const downloadId = await downloadFromUrl({
      url: blobUrl,
      filename,
      conflictAction: 'uniquify',
      saveAs: false,
    });
    return { ok: true, id: downloadId };
  } catch (error) {
    return { ok: false, error: 'download-failed' };
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  }
}

if (hasBrowser) {
  runtime.onMessage.addListener((message) => {
    return handleDownloadRequest(message);
  });
} else {
  runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleDownloadRequest(message)
      .then((response) => sendResponse(response))
      .catch(() => sendResponse({ ok: false, error: 'download-failed' }));
    return true;
  });
}
