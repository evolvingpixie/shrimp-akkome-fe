import { get, set } from 'lodash'

const defaultApi = ({ rootState, commit }, { path, value }) => {
  const params = {}
  set(params, path, value)
  return rootState
    .api
    .backendInteractor
    .updateProfile({ params })
    .then(result => {
      commit('addNewUsers', [result])
      commit('setCurrentUser', result)
    })
}

const notificationsApi = ({ rootState, commit }, { path, value, oldValue }) => {
  const settings = {}
  set(settings, path, value)
  return rootState
    .api
    .backendInteractor
    .updateNotificationSettings({ settings })
    .then(result => {
      if (result.status === 'success') {
        commit('confirmServerSideOption', { name, value })
      } else {
        commit('confirmServerSideOption', { name, value: oldValue })
      }
    })
}

/**
 * Map that stores relation between path for reading (from user profile),
 * for writing (into API) an what API to use.
 *
 * Shorthand - instead of { get, set, api? } object it's possible to use string
 * in case default api is used and get = set
 *
 * If no api is specified, defaultApi is used (see above)
 */
export const settingsMap = {
  'defaultScope': 'source.privacy',
  'defaultNSFW': 'source.sensitive', // BROKEN: pleroma/pleroma#2837
  'stripRichContent': {
    get: 'source.pleroma.no_rich_text',
    set: 'no_rich_text'
  },
  // Privacy
  'locked': 'locked',
  'acceptChatMessages': {
    get: 'pleroma.accepts_chat_messages',
    set: 'accepts_chat_messages'
  },
  'allowFollowingMove': {
    get: 'pleroma.allow_following_move',
    set: 'allow_following_move'
  },
  'discoverable': {
    get: 'source.pleroma.discoverable',
    set: 'discoverable'
  },
  'hideFavorites': {
    get: 'pleroma.hide_favorites',
    set: 'hide_favorites'
  },
  'hideFollowers': {
    get: 'pleroma.hide_followers',
    set: 'hide_followers'
  },
  'hideFollows': {
    get: 'pleroma.hide_follows',
    set: 'hide_follows'
  },
  'hideFollowersCount': {
    get: 'pleroma.hide_followers_count',
    set: 'hide_followers_count'
  },
  'hideFollowsCount': {
    get: 'pleroma.hide_follows_count',
    set: 'hide_follows_count'
  },
  // NotificationSettingsAPIs
  'webPushHideContents': {
    get: 'pleroma.notification_settings.hide_notification_contents',
    set: 'hide_notification_contents',
    api: notificationsApi
  },
  'blockNotificationsFromStrangers': {
    get: 'pleroma.notification_settings.block_from_strangers',
    set: 'block_from_strangers',
    api: notificationsApi
  }
}

export const defaultState = Object.fromEntries(Object.keys(settingsMap).map(key => [key, null]))

const serverSideConfig = {
  state: { ...defaultState },
  mutations: {
    confirmServerSideOption (state, { name, value }) {
      set(state, name, value)
    },
    wipeServerSideOption (state, { name }) {
      set(state, name, null)
    },
    wipeAllServerSideOptions (state) {
      Object.keys(settingsMap).forEach(key => {
        set(state, key, null)
      })
    },
    // Set the settings based on their path location
    setCurrentUser (state, user) {
      Object.entries(settingsMap).forEach((map) => {
        const [name, value] = map
        const { get: path = value } = value
        set(state, name, get(user._original, path))
      })
    }
  },
  actions: {
    setServerSideOption ({ rootState, state, commit, dispatch }, { name, value }) {
      const oldValue = get(state, name)
      const map = settingsMap[name]
      if (!map) throw new Error('Invalid server-side setting')
      const { set: path = map, api = defaultApi } = map
      commit('wipeServerSideOption', { name })

      api({ rootState, commit }, { path, value, oldValue })
        .catch((e) => {
          console.warn('Error setting server-side option:', e)
          commit('confirmServerSideOption', { name, value: oldValue })
        })
    },
    logout ({ commit }) {
      commit('wipeAllServerSideOptions')
    }
  }
}

export default serverSideConfig
