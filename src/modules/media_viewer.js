import fileTypeService from '../services/file_type/file_type.service.js'
const supportedTypes = new Set(['image', 'video', 'audio', 'flash'])

const mediaViewer = {
  state: {
    media: [],
    currentIndex: 0,
    activated: false
  },
  mutations: {
    setMedia (state, media) {
      state.media = media
    },
    setCurrentMedia (state, index) {
      state.activated = true
      state.currentIndex = index
    },
    close (state) {
      state.activated = false
    }
  },
  actions: {
    setMedia ({ commit, dispatch }, attachments) {
      const media = attachments.filter(attachment => {
        const type = fileTypeService.fileType(attachment.mimetype)
        return supportedTypes.has(type)
      })
      commit('setMedia', media)
      dispatch('swipeScaler/reset')
    },
    setCurrentMedia ({ commit, state }, current) {
      const index = state.media.indexOf(current)
      commit('setCurrentMedia', index || 0)
      dispatch('swipeScaler/reset')
    },
    closeMediaViewer ({ commit, dispatch }) {
      commit('close')
      dispatch('swipeScaler/reset')
    }
  },
  modules: {
    swipeScaler: {
      namespaced: true,

      state: {
        origOffsets: [0, 0],
        offsets: [0, 0],
        origScaling: 1,
        scaling: 1
      },

      mutations: {
        reset (state) {
          state.origOffsets = [0, 0]
          state.offsets = [0, 0]
          state.origScaling = 1
          state.scaling = 1
        },
        applyOffsets (state, { offsets }) {
          state.offsets = state.origOffsets.map((k, n) => k + offsets[n])
        },
        applyScaling (state, { scaling }) {
          state.scaling = state.origScaling * scaling
        },
        finish (state) {
          state.origOffsets = [...state.offsets]
          state.origScaling = state.scaling
        },
        revert (state) {
          state.offsets = [...state.origOffsets]
          state.scaling = state.origScaling
        }
      },

      actions: {
        reset ({ commit }) {
          commit('reset')
        },
        apply ({ commit }, { offsets, scaling = 1 }) {
          commit('applyOffsets', { offsets })
          commit('applyScaling', { scaling })
        },
        finish ({ commit }) {
          commit('finish')
        },
        revert ({ commit }) {
          commit('revert')
        }
      }
    }
  }
}

export default mediaViewer
