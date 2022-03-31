import router from "./router.js";
import './geocoding.js'

addEventListener("fetch", (event) => {
    globalThis.event = event
    event.respondWith(router.handle(event.request))
});
