import { merge } from 'lodash'

const tags = {
  state: {
    // Contains key = id, value = number of trackers for this poll
    tags: {}
  },
  mutations: {
    setTag (state, { name, data }) {
      state.tags[name] = data
    }
  },
  actions: {
    getTag ({ rootState, commit }, tagName) {
      return rootState.api.backendInteractor.getHashtag({ tag: tagName }).then(tag => {
        commit('setTag', { name: tagName, data: tag })
        return tag
      })
    },
    followTag (store, tagName) {
      return store.rootState.api.backendInteractor.followHashtag({ tag: tagName })
        .then((resp) => {
          store.commit('setTag', { name: tagName, data: resp })
          return resp
        })
    },
    unfollowTag ({ rootState, commit }, tag) {
      return rootState.api.backendInteractor.unfollowHashtag({ tag })
        .then((resp) => {
          commit('setTag', { name: tag, data: resp })
          return resp
        })
    }
  }
}

export default tags
