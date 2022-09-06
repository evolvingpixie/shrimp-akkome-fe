const editStatus = {
  state: {
    params: null,
    modalActivated: false
  },
  mutations: {
    openEditStatusModal (state, params) {
      state.params = params
      state.modalActivated = true
    },
    closeEditStatusModal (state) {
      state.modalActivated = false
    }
  },
  actions: {
    openEditStatusModal ({ commit }, params) {
      commit('openEditStatusModal', params)
    },
    closeEditStatusModal ({ commit }) {
      commit('closeEditStatusModal')
    }
  }
}

export default editStatus
