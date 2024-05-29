import EventTargetPolyfill from '@ungap/event-target'

try {
   
  new EventTarget()
   
} catch (e) {
  window.EventTarget = EventTargetPolyfill
}
