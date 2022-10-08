import { promiseInterval } from '../promise_interval/promise_interval.js'

const startFetching = ({ credentials, store }) => {
  console.log('startFetching: Config')
  const boundFetchAndUpdate = () => store.dispatch('getSettingsProfile')
  boundFetchAndUpdate()
  return promiseInterval(boundFetchAndUpdate, 10 * 60000)
}

const configFetcher = {
  startFetching
}

export default configFetcher
