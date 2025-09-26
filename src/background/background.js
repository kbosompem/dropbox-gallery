chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openGallery') {
    chrome.storage.local.set({
      galleryImages: request.images,
      folderName: request.folderName
    }, () => {
      chrome.action.openPopup();
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('dropbox.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'getImages' }, (response) => {
      if (response && response.images && response.images.length > 0) {
        chrome.storage.local.set({
          galleryImages: response.images,
          folderName: tab.title
        });
      }
    });
  }
});