import { get, set } from 'lodash'

export const settingsMapGet = {
  'defaultScope': 'source.privacy',
  'defaultNSFW': 'source.sensitive', // BROKEN: pleroma/pleroma#2837
  'stripRichContent': 'source.pleroma.no_rich_text',
  // Privacy
  'locked': 'locked',
  'acceptChatMessages': 'pleroma.accepts_chat_messages',
  'allowFollowingMove': 'pleroma.allow_following_move',
  'discoverable': 'source.discoverable',
  'hideFavorites': 'pleroma.hide_favorites',
  'hideFollowers': 'pleroma.hide_followers',
  'hideFollows': 'pleroma.hide_follows',
  'hideFollowersCount': 'pleroma.hide_followers_count',
  'hideFollowsCount': 'pleroma.hide_follows_count',
  // NotificationSettingsAPIs
  'webPushHideContents': 'pleroma.notification_settings.hide_notification_contents',
  'blockNotificationsFromStrangers': 'pleroma.notification_settings.block_from_strangers'
}

export const settingsMapSet = {
  'defaultScope': 'source.privacy',
  'defaultNSFW': 'source.sensitive',
  'stripRichContent': 'no_rich_text',
  // Privacy
  'locked': 'locked',
  'acceptChatMessages': 'accepts_chat_messages',
  'allowFollowingMove': 'allow_following_move',
  'discoverable': 'source.discoverable',
  'hideFavorites': 'hide_favorites',
  'hideFollowers': 'hide_followers',
  'hideFollows': 'hide_follows',
  'hideFollowersCount': 'hide_followers_count',
  'hideFollowsCount': 'hide_follows_count',
  // NotificationSettingsAPIs
  'webPushHideContents': 'hide_notification_contents',
  'blockNotificationsFromStrangers': 'block_from_strangers'
}

export const customAPIs = {
  __defaultApi: 'updateProfile',
  'webPushHideContents': 'updateNotificationSettings',
  'blockNotificationsFromStrangers': 'updateNotificationSettings'
}

export const defaultState = Object.fromEntries(Object.keys(settingsMapGet).map(key => [key, null]))

const serverSideConfig = {
  state: { ...defaultState },
  mutations: {
    confirmServerSideOption (state, { name, value }) {
      set(state, name, value)
    },
    wipeServerSideOption (state, { name }) {
      set(state, name, null)
    },
    // Set the settings based on their path location
    setCurrentUser (state, user) {
      Object.entries(settingsMapGet).forEach(([name, path]) => {
        set(state, name, get(user._original, path))
      })
    }
  },
  actions: {
    setServerSideOption ({ rootState, state, commit, dispatch }, { name, value }) {
      const oldValue = get(state, name)
      const params = {}
      const path = settingsMapSet[name]
      if (!path) throw new Error('Invalid server-side setting')
      commit('wipeServerSideOption', { name })
      const customAPIName = customAPIs[name] || customAPIs.__defaultApi
      const api = rootState.api.backendInteractor[customAPIName]
      let prefix = ''
      switch (customAPIName) {
        case 'updateNotificationSettings':
          prefix = 'settings.'
          break
        default:
          prefix = 'params.'
          break
      }

      set(params, prefix + path, value)
      api(params)
        .then((result) => {
          switch (customAPIName) {
            case 'updateNotificationSettings':
              console.log(result)
              if (result.status === 'success') {
                commit('confirmServerSideOption', { name, value })
              } else {
                commit('confirmServerSideOption', { name, value: oldValue })
              }
              break
            default:
              commit('addNewUsers', [result])
              commit('setCurrentUser', result)
              break
          }
          console.log(state)
        })
        .catch((e) => {
          console.warn('Error setting server-side option:', e)
          commit('confirmServerSideOption', { name, value: oldValue })
        })
    }
  }
}

export default serverSideConfig
