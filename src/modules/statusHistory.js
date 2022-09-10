const statusHistory = {
  state: {
    params: {},
    modalActivated: false
  },
  mutations: {
    openStatusHistoryModal (state, params) {
      state.params = params
      state.modalActivated = true
    },
    closeStatusHistoryModal (state) {
      state.modalActivated = false
    }
  },
  actions: {
    openStatusHistoryModal ({ commit }, params) {
      commit('openStatusHistoryModal', params)
    },
    closeStatusHistoryModal ({ commit }) {
      commit('closeStatusHistoryModal')
    }
  }
}

export default statusHistory
