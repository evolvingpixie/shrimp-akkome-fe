import { defineAsyncComponent, shallowReactive, h } from 'vue'

/* By default async components don't have any way to recover, if component is
 * failed, it is failed forever. This helper tries to remedy that by recreating
 * async component when retry is requested (by user). You need to emit the
 * `resetAsyncComponent` event from child to reset the component. Generally,
 * this should be done from error component but could be done from loading or
 * actual target component itself if needs to be.
 */
function getResettableAsyncComponent (asyncComponent, options) {
  const asyncComponentFactory = () => () => defineAsyncComponent({
    loader: asyncComponent,
    ...options
  })

  const observe = shallowReactive({ c: asyncComponentFactory() })

  return {
    render () {
      //  emit event resetAsyncComponent to reloading
      return h(observe.c(), {
        onResetAsyncComponent () {
          observe.c = asyncComponentFactory()
        }
      })
    }
  }
}

export default getResettableAsyncComponent
