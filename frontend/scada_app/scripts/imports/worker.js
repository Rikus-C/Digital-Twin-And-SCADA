self.importScripts("/scripts/web.js");
self.addEventListener('message', function(e) {
    self.postMessage(e.data);
    console.log(e.data);
    Web.App.GetEvents(e.data);
}, false);