const FETCH_ANNOUNCEMENT_INTERVAL_MS = 1000 * 60 * 5

export const defaultState = {
  announcements: [],
  fetchAnnouncementsTimer: undefined
}

export const mutations = {
  setAnnouncements (state, announcements) {
    state.announcements = announcements
  },
  setAnnouncementRead (state, { id, read }) {
    const index = state.announcements.findIndex(a => a.id === id)

    if (index < 0) {
      return
    }

    state.announcements[index].read = read
  },
  setFetchAnnouncementsTimer (state, timer) {
    state.fetchAnnouncementsTimer = timer
  }
}

export const getters = {
  unreadAnnouncementCount (state, _getters, rootState) {
    if (!rootState.users.currentUser) {
      return 0
    }

    const unread = state.announcements.filter(announcement => !(announcement.inactive || announcement.read))
    return unread.length
  }
}

const announcements = {
  state: defaultState,
  mutations,
  getters,
  actions: {
    fetchAnnouncements (store) {
      const currentUser = store.rootState.users.currentUser
      const isAdmin = currentUser && currentUser.role === 'admin'

      const getAnnouncements = async () => {
        if (!isAdmin) {
          return store.rootState.api.backendInteractor.fetchAnnouncements()
        }

        const all = await store.rootState.api.backendInteractor.adminFetchAnnouncements()
        const visible = await store.rootState.api.backendInteractor.fetchAnnouncements()
        const visibleObject = visible.reduce((a, c) => {
          a[c.id] = c
          return a
        }, {})
        const getWithinVisible = announcement => visibleObject[announcement.id]

        all.forEach(announcement => {
          const visibleAnnouncement = getWithinVisible(announcement)
          if (!visibleAnnouncement) {
            announcement.inactive = true
          } else {
            announcement.read = visibleAnnouncement.read
          }
        })

        return all
      }

      return getAnnouncements()
        .then(announcements => {
          store.commit('setAnnouncements', announcements)
        })
    },
    markAnnouncementAsRead (store, id) {
      return store.rootState.api.backendInteractor.dismissAnnouncement({ id })
        .then(() => {
          store.commit('setAnnouncementRead', { id, read: true })
        })
    },
    startFetchingAnnouncements (store) {
      if (store.state.fetchAnnouncementsTimer) {
        return
      }

      const interval = setInterval(() => store.dispatch('fetchAnnouncements'), FETCH_ANNOUNCEMENT_INTERVAL_MS)
      store.commit('setFetchAnnouncementsTimer', interval)

      return store.dispatch('fetchAnnouncements')
    },
    stopFetchingAnnouncements (store) {
      const interval = store.state.fetchAnnouncementsTimer
      store.commit('setFetchAnnouncementsTimer', undefined)
      clearInterval(interval)
    },
    postAnnouncement (store, { content, startsAt, endsAt, allDay }) {
      return store.rootState.api.backendInteractor.postAnnouncement({ content, startsAt, endsAt, allDay })
        .then(() => {
          return store.dispatch('fetchAnnouncements')
        })
    },
    editAnnouncement (store, { id, content, startsAt, endsAt, allDay }) {
      return store.rootState.api.backendInteractor.editAnnouncement({ id, content, startsAt, endsAt, allDay })
        .then(() => {
          return store.dispatch('fetchAnnouncements')
        })
    },
    deleteAnnouncement (store, id) {
      return store.rootState.api.backendInteractor.deleteAnnouncement({ id })
        .then(() => {
          return store.dispatch('fetchAnnouncements')
        })
    }
  }
}

export default announcements
