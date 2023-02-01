// @ts-check
/// <reference no-default-lib="false"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
const sw = self;

sw.addEventListener("notificationclick", (e) => {
  e.notification.close();
  sw.clients.openWindow(e.notification.data);
});
