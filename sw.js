const n=self;n.addEventListener("notificationclick",async i=>{i.notification.close(),n.clients.openWindow(i.notification.data)});
