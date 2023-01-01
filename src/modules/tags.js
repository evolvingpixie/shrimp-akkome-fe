import { merge } from 'lodash'

const tags = {
  state: {
    // Contains key = name, value = tag json
    tags: {}
  },
  getters: {
    findTag: state => query => {
      const result = state.tags[query]
      return result
    },
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
    followTag ({ rootState, commit }, tagName) {
      return rootState.api.backendInteractor.followHashtag({ tag: tagName })
        .then((resp) => {
          commit('setTag', { name: tagName, data: resp })
          return resp
        })
    },
    unfollowTag ({ rootState, commit }, tagName) {
      return rootState.api.backendInteractor.unfollowHashtag({ tag: tagName })
        .then((resp) => {
          commit('setTag', { name: tagName, data: resp })
          return resp
        })
    }
  }
}

export default tags
