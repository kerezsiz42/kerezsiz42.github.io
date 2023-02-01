// @ts-ignore
const sw: ServiceWorkerGlobalScope = self;

sw.addEventListener("notificationclick", async (e) => {
  e.notification.close();
  sw.clients.openWindow(e.notification.data);
});
