import apiService, { getMastodonSocketURI, ProcessedWS } from '../api/api.service.js'
import timelineFetcher from '../timeline_fetcher/timeline_fetcher.service.js'
import notificationsFetcher from '../notifications_fetcher/notifications_fetcher.service.js'
import followRequestFetcher from '../../services/follow_request_fetcher/follow_request_fetcher.service'
import listsFetcher from '../../services/lists_fetcher/lists_fetcher.service.js'
import announcementsFetcher from '../../services/announcements_fetcher/announcements_fetcher.service.js'
import configFetcher from '../config_fetcher/config_fetcher.service.js'
import reportsFetcher from '../reports_fetcher/reports_fetcher.service.js'

const backendInteractorService = credentials => ({
  startFetchingTimeline ({ timeline, store, userId = false, listId = false, tag }) {
    return timelineFetcher.startFetching({ timeline, store, credentials, userId, listId, tag })
  },

  fetchTimeline (args) {
    return timelineFetcher.fetchAndUpdate({ ...args, credentials })
  },

  startFetchingNotifications ({ store }) {
    return notificationsFetcher.startFetching({ store, credentials })
  },

  startFetchingConfig ({ store }) {
    return configFetcher.startFetching({ store, credentials })
  },

  fetchNotifications (args) {
    return notificationsFetcher.fetchAndUpdate({ ...args, credentials })
  },

  startFetchingFollowRequests ({ store }) {
    return followRequestFetcher.startFetching({ store, credentials })
  },

  startFetchingLists ({ store }) {
    return listsFetcher.startFetching({ store, credentials })
  },

  startFetchingAnnouncements ({ store }) {
    return announcementsFetcher.startFetching({ store, credentials })
  },

  startFetchingReports ({ store, state, limit, page, pageSize }) {
    return reportsFetcher.startFetching({ store, credentials, state, limit, page, pageSize })
  },

  startUserSocket ({ store }) {
    const serv = store.rootState.instance.server.replace('http', 'ws')
    const url = serv + getMastodonSocketURI({ credentials, stream: 'user' })
    return ProcessedWS({ url, id: 'User' })
  },

  getSupportedTranslationlanguages ({ store }) {
    return apiService.getSupportedTranslationlanguages({ store, credentials })
  },

  ...Object.entries(apiService).reduce((acc, [key, func]) => {
    return {
      ...acc,
      [key]: (args) => func({ credentials, ...args })
    }
  }, {}),

  verifyCredentials: apiService.verifyCredentials
})

export default backendInteractorService
