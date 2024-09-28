console.log('Background script loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    // Set an alarm for 1 minute (60 seconds)
    chrome.alarms.create("oneMinuteTimer", { delayInMinutes: 1 });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "oneMinuteTimer") {
    // Show a notification when the timer goes off
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png", // Make sure to have an icon.png file or replace this with an existing image path
      title: "Timer Finished!",
      message: "Your 1-minute timer is done.",
      priority: 2
    });
  }
});
