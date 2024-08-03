import backendInteractorService from "../services/backend_interactor_service/backend_interactor_service.js";
import { WSConnectionStatus } from "../services/api/api.service.js";
import { map } from "lodash";

const retryTimeout = (multiplier) => 1000 * multiplier;

const isVisible = (store, message, visibility) => {
  if (visibility == "all") {
    return true;
  }

  if (visibility == "following") {
    if (message.in_reply_to_user_id === null) {
      return true;
    } else {
      return store.getters.relationship(message.in_reply_to_user_id).following;
    }
  }

  if (visibility == "self") {
    return message.in_reply_to_user_id === store.rootState.users.currentUser.id;
  }

  return false;
};

const api = {
  state: {
    retryMultiplier: 1,
    backendInteractor: backendInteractorService(),
    fetchers: {},
    socket: null,
    mastoUserSocket: null,
    mastoUserSocketStatus: null,
    followRequests: [],
  },
  mutations: {
    setBackendInteractor(state, backendInteractor) {
      state.backendInteractor = backendInteractor;
    },
    addFetcher(state, { fetcherName, fetcher }) {
      state.fetchers[fetcherName] = fetcher;
    },
    removeFetcher(state, { fetcherName, fetcher }) {
      state.fetchers[fetcherName].stop();
      delete state.fetchers[fetcherName];
    },
    setWsToken(state, token) {
      state.wsToken = token;
    },
    setSocket(state, socket) {
      state.socket = socket;
    },
    setMastoUserSocketStatus(state, value) {
      state.mastoUserSocketStatus = value;
    },
    incrementRetryMultiplier(state) {
      state.retryMultiplier = Math.max(++state.retryMultiplier, 3);
    },
    resetRetryMultiplier(state) {
      state.retryMultiplier = 1;
    },
    setFollowRequests(state, value) {
      state.followRequests = [...value];
    },
    saveFollowRequests(state, requests) {
      state.followRequests = [...state.followRequests, ...requests];
    },
    saveFollowRequestPagination(state, pagination) {
      state.followRequestsPagination = pagination;
    },
  },
  actions: {
    /**
     * Global MastoAPI socket control, in future should disable ALL sockets/(re)start relevant sockets
     *
     * @param {Boolean} [initial] - whether this enabling happened at boot time or not
     */
    enableMastoSockets(store, initial) {
      const { state, dispatch, commit } = store;
      // Do not initialize unless nonexistent or closed
      if (
        state.mastoUserSocket &&
        ![WebSocket.CLOSED, WebSocket.CLOSING].includes(
          state.mastoUserSocket.getState(),
        )
      ) {
        return;
      }
      if (initial) {
        commit("setMastoUserSocketStatus", WSConnectionStatus.STARTING_INITIAL);
      } else {
        commit("setMastoUserSocketStatus", WSConnectionStatus.STARTING);
      }
      return dispatch("startMastoUserSocket");
    },
    disableMastoSockets(store) {
      const { state, dispatch, commit } = store;
      if (!state.mastoUserSocket) return;
      commit("setMastoUserSocketStatus", WSConnectionStatus.DISABLED);
      return dispatch("stopMastoUserSocket");
    },

    // MastoAPI 'User' sockets
    startMastoUserSocket(store) {
      return new Promise((resolve, reject) => {
        try {
          const { state, commit, dispatch, rootState } = store;
          const timelineData = rootState.statuses.timelines.friends;
          state.mastoUserSocket = state.backendInteractor.startUserSocket({
            store,
          });
          state.mastoUserSocket.addEventListener(
            "message",
            ({ detail: message }) => {
              const replyVisibility = rootState.config.replyVisibility;
              if (!message) return; // pings
              if (message.event === "notification") {
                dispatch("addNewNotifications", {
                  notifications: [message.notification],
                  older: false,
                });
              } else if (
                message.event === "update" &&
                isVisible(store, message.status, replyVisibility)
              ) {
                dispatch("addNewStatuses", {
                  statuses: [message.status],
                  userId: false,
                  showImmediately: timelineData.visibleStatuses.length === 0,
                  timeline: "friends",
                });
              } else if (
                message.event === "status.update" &&
                isVisible(store, message.status, replyVisibility)
              ) {
                dispatch("addNewStatuses", {
                  statuses: [message.status],
                  userId: false,
                  showImmediately:
                    message.status.id in timelineData.visibleStatusesObject,
                  timeline: "friends",
                });
              } else if (message.event === "delete") {
                dispatch("deleteStatusById", message.id);
              }
            },
          );
          state.mastoUserSocket.addEventListener("open", () => {
            // Do not show notification when we just opened up the page
            if (
              state.mastoUserSocketStatus !==
              WSConnectionStatus.STARTING_INITIAL
            ) {
              dispatch("pushGlobalNotice", {
                level: "success",
                messageKey: "timeline.socket_reconnected",
                timeout: 5000,
              });
            }
            // Stop polling if we were errored or disabled
            if (
              new Set([
                WSConnectionStatus.ERROR,
                WSConnectionStatus.DISABLED,
              ]).has(state.mastoUserSocketStatus)
            ) {
              dispatch("stopFetchingTimeline", { timeline: "friends" });
              dispatch("stopFetchingNotifications");
            }
            commit("resetRetryMultiplier");
            commit("setMastoUserSocketStatus", WSConnectionStatus.JOINED);
          });
          state.mastoUserSocket.addEventListener(
            "error",
            ({ detail: error }) => {
              console.error("Error in MastoAPI websocket:", error);
            },
          );
          state.mastoUserSocket.addEventListener(
            "close",
            ({ detail: closeEvent }) => {
              const ignoreCodes = new Set([
                1000, // Normal (intended) closure
                1001, // Going away
              ]);
              const { code } = closeEvent;
              if (ignoreCodes.has(code)) {
                console.debug(
                  `Not restarting socket becasue of closure code ${code} is in ignore list`,
                );
                commit("setMastoUserSocketStatus", WSConnectionStatus.CLOSED);
              } else {
                console.warn(
                  `MastoAPI websocket disconnected, restarting. CloseEvent code: ${code}`,
                );
                setTimeout(() => {
                  dispatch("startMastoUserSocket");
                }, retryTimeout(state.retryMultiplier));
                commit("incrementRetryMultiplier");
                if (state.mastoUserSocketStatus !== WSConnectionStatus.ERROR) {
                  dispatch("startFetchingTimeline", { timeline: "friends" });
                  dispatch("startFetchingNotifications");
                  dispatch("startFetchingAnnouncements");
                  dispatch("startFetchingReports");
                  dispatch("pushGlobalNotice", {
                    level: "error",
                    messageKey: "timeline.socket_broke",
                    messageArgs: [code],
                    timeout: 5000,
                  });
                }
                commit("setMastoUserSocketStatus", WSConnectionStatus.ERROR);
              }
            },
          );
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    },
    stopMastoUserSocket({ state, dispatch }) {
      dispatch("startFetchingTimeline", { timeline: "friends" });
      dispatch("startFetchingNotifications");
      state.mastoUserSocket.close();
    },

    // Timelines
    startFetchingTimeline(
      store,
      { timeline = "friends", tag = false, userId = false, listId = false },
    ) {
      if (store.state.fetchers[timeline]) return;

      const fetcher = store.state.backendInteractor.startFetchingTimeline({
        timeline,
        store,
        userId,
        listId,
        tag,
      });
      store.commit("addFetcher", { fetcherName: timeline, fetcher });
    },
    stopFetchingTimeline(store, timeline) {
      const fetcher = store.state.fetchers[timeline];
      if (!fetcher) return;
      store.commit("removeFetcher", { fetcherName: timeline, fetcher });
    },
    fetchTimeline(store, timeline, opts = {}) {
      store.state.backendInteractor.fetchTimeline({
        store,
        timeline,
        ...opts,
      });
    },
    startFetchingConfig(store) {
      if (store.state.fetchers.config) return;

      const fetcher = store.state.backendInteractor.startFetchingConfig({
        store,
      });
      store.commit("addFetcher", { fetcherName: "config", fetcher });
    },
    stopFetchingConfig(store) {
      const fetcher = store.state.fetchers.config;
      if (!fetcher) return;
      store.commit("removeFetcher", { fetcherName: "config", fetcher });
    },
    // Notifications
    startFetchingNotifications(store) {
      if (store.state.fetchers.notifications) return;
      const fetcher = store.state.backendInteractor.startFetchingNotifications({
        store,
      });
      store.commit("addFetcher", { fetcherName: "notifications", fetcher });
    },
    stopFetchingNotifications(store) {
      const fetcher = store.state.fetchers.notifications;
      if (!fetcher) return;
      store.commit("removeFetcher", { fetcherName: "notifications", fetcher });
    },
    fetchNotifications(store, { ...rest }) {
      store.state.backendInteractor.fetchNotifications({
        store,
        ...rest,
      });
    },
    removeFollowRequest(store, request) {
      let requests = [...store.state.followRequests].filter(
        (it) => it.id !== request.id,
      );
      store.commit("setFollowRequests", requests);
    },
    fetchFollowRequests({ rootState, commit }) {
      const pagination = rootState.api.followRequestsPagination;
      return rootState.api.backendInteractor
        .getFollowRequests({ pagination })
        .then((requests) => {
          if (requests.data.length > 0) {
            commit("addNewUsers", requests.data);
            commit("saveFollowRequests", requests.data);
            commit("saveFollowRequestPagination", requests.pagination);
          }
          return requests;
        });
    },
    // Lists
    startFetchingLists(store) {
      if (store.state.fetchers["lists"]) return;
      const fetcher = store.state.backendInteractor.startFetchingLists({
        store,
      });
      store.commit("addFetcher", { fetcherName: "lists", fetcher });
    },
    stopFetchingLists(store) {
      const fetcher = store.state.fetchers.lists;
      if (!fetcher) return;
      store.commit("removeFetcher", { fetcherName: "lists", fetcher });
    },

    // Lists
    startFetchingAnnouncements(store) {
      if (store.state.fetchers["announcements"]) return;
      const fetcher = store.state.backendInteractor.startFetchingAnnouncements({
        store,
      });
      store.commit("addFetcher", { fetcherName: "announcements", fetcher });
    },
    stopFetchingAnnouncements(store) {
      const fetcher = store.state.fetchers.announcements;
      if (!fetcher) return;
      store.commit("removeFetcher", { fetcherName: "announcements", fetcher });
    },

    // Reports
    startFetchingReports(store) {
      if (store.state.fetchers["reports"]) return;
      const fetcher = store.state.backendInteractor.startFetchingReports({
        store,
      });
      store.commit("addFetcher", { fetcherName: "reports", fetcher });
    },
    stopFetchingReports(store) {
      const fetcher = store.state.fetchers.reports;
      if (!fetcher) return;
      store.commit("removeFetcher", { fetcherName: "reports", fetcher });
    },

    getSupportedTranslationlanguages(store) {
      store.state.backendInteractor
        .getSupportedTranslationlanguages({ store })
        .then((data) => {
          store.dispatch("setInstanceOption", {
            name: "supportedTranslationLanguages",
            value: data,
          });
        });
    },
    listSettingsProfiles(store) {
      store.state.backendInteractor
        .listSettingsProfiles({ store })
        .then((data) => {
          store.commit("setInstanceOption", {
            name: "settingsProfiles",
            value: data,
          });
        });
    },
    // Pleroma websocket
    setWsToken(store, token) {
      store.commit("setWsToken", token);
    },
    disconnectFromSocket({ commit, state }) {
      state.socket && state.socket.disconnect();
      commit("setSocket", null);
    },
  },
};

export default api;
