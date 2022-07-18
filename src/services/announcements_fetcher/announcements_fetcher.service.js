import apiService from '../api/api.service.js'
import { promiseInterval } from '../promise_interval/promise_interval.js'

const fetchAndUpdate = ({ store, credentials }) => {
  return apiService.fetchAnnouncements({ credentials })
    .then(announcements => {
      store.commit('setAnnouncements', announcements)
    }, () => {})
    .catch(() => {})
}

const startFetching = ({ credentials, store }) => {
  const boundFetchAndUpdate = () => fetchAndUpdate({ credentials, store })
  boundFetchAndUpdate()
  return promiseInterval(boundFetchAndUpdate, 60000)
}

const announcementsFetcher = {
  startFetching
}

export default announcementsFetcher
