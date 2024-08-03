import { createStore } from 'vuex'

import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'

import interfaceModule from './modules/interface.js'
import instanceModule from './modules/instance.js'
import statusesModule from './modules/statuses.js'
import listsModule from './modules/lists.js'
import usersModule from './modules/users.js'
import apiModule from './modules/api.js'
import configModule from './modules/config.js'
import serverSideConfigModule from './modules/serverSideConfig.js'
import oauthModule from './modules/oauth.js'
import authFlowModule from './modules/auth_flow.js'
import mediaViewerModule from './modules/media_viewer.js'
import oauthTokensModule from './modules/oauth_tokens.js'
import reportsModule from './modules/reports.js'
import pollsModule from './modules/polls.js'
import postStatusModule from './modules/postStatus.js'
import announcementsModule from './modules/announcements.js'
import editStatusModule from './modules/editStatus.js'
import statusHistoryModule from './modules/statusHistory.js'
import tagModule from './modules/tags.js'
import recentEmojisModule from './modules/recentEmojis.js'

import { createI18n } from 'vue-i18n'

import createPersistedState from './lib/persisted_state.js'
import pushNotifications from './lib/push_notifications_plugin.js'

import messages from './i18n/messages.js'

import afterStoreSetup from './boot/after_store.js'

const currentLocale = (window.navigator.language || 'en').split('-')[0]

const i18n = createI18n({
  // By default, use the browser locale, we will update it if neccessary
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages.default
})

messages.setLanguage(i18n, currentLocale)

const persistedStateOptions = {
  paths: [
    'config',
    'users.lastLoginName',
    'oauth',
    'recentEmojis.emojis',
  ]
};

(async () => {
  if ('serviceWorker' in navigator) {
    // declaring scope manually
    navigator.serviceWorker.register('/sw-pleroma.js', {scope: '/'}).then((registration) => {
      console.log('Service worker registration succeeded:', registration);
    }, /*catch*/ (error) => {
      console.error(`Service worker registration failed: ${error}`);
    });
  } else {
    console.error('Service workers are not supported.');
  }

  let storageError = false
  const plugins = [pushNotifications]
  try {
    const persistedState = await createPersistedState(persistedStateOptions)
    plugins.push(persistedState)
  } catch (e) {
    console.error(e)
    storageError = true
  }
  const store = createStore({
    modules: {
      i18n: {
        getters: {
          i18n: () => i18n.global
        }
      },
      interface: interfaceModule,
      instance: instanceModule,
      // TODO refactor users/statuses modules, they depend on each other
      users: usersModule,
      statuses: statusesModule,
      lists: listsModule,
      api: apiModule,
      config: configModule,
      serverSideConfig: serverSideConfigModule,
      oauth: oauthModule,
      authFlow: authFlowModule,
      mediaViewer: mediaViewerModule,
      oauthTokens: oauthTokensModule,
      reports: reportsModule,
      polls: pollsModule,
      postStatus: postStatusModule,
      announcements: announcementsModule,
      editStatus: editStatusModule,
      statusHistory: statusHistoryModule,
      tags: tagModule,
      recentEmojis: recentEmojisModule,
    },
    plugins,
    strict: false // Socket modifies itself, let's ignore this for now.
    // strict: process.env.NODE_ENV !== 'production'
  })
  if (storageError) {
    store.dispatch('pushGlobalNotice', { messageKey: 'errors.storage_unavailable', level: 'error' })
  }
  afterStoreSetup({ store, i18n })
})()

// These are inlined by webpack's DefinePlugin
 
window.___pleromafe_mode = process.env
window.___pleromafe_commit_hash = COMMIT_HASH
window.___pleromafe_dev_overrides = DEV_OVERRIDES
