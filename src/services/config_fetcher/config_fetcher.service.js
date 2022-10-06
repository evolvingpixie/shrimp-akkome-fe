import { promiseInterval } from '../promise_interval/promise_interval.js'

const startFetching = ({ credentials, store }) => {
  const boundFetchAndUpdate = () => store.dispatch('getSettingsProfile')
  boundFetchAndUpdate()
  return promiseInterval(boundFetchAndUpdate, 5 * 60000)
}

const configFetcher = {
  startFetching
}

export default configFetcher
