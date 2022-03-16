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
    setMedia ({ commit }, attachments) {
      const media = attachments.filter(attachment => {
        const type = fileTypeService.fileType(attachment.mimetype)
        return supportedTypes.has(type)
      })
      commit('setMedia', media)
    },
    setCurrentMedia ({ commit, state }, current) {
      const index = state.media.indexOf(current)
      commit('setCurrentMedia', index || 0)
    },
    closeMediaViewer ({ commit }) {
      commit('close')
    }
  }
}

export default mediaViewer
