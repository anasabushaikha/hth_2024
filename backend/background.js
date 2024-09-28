chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({tasks: []}, function() {
      console.log('Initial tasks array created');
    });
});