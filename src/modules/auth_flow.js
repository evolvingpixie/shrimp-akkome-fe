const PASSWORD_STRATEGY = 'password'
const TOKEN_STRATEGY = 'token'

// MFA strategies
const TOTP_STRATEGY = 'totp'
const RECOVERY_STRATEGY = 'recovery'

// initial state
const state = {
  settings: {},
  strategy: PASSWORD_STRATEGY,
  initStrategy: PASSWORD_STRATEGY // default strategy from config
}

const resetState = (state) => {
  state.strategy = state.initStrategy
  state.settings = {}
}

// getters
const getters = {
  settings: (state, getters) => {
    return state.settings
  },
  requiredPassword: (state, getters, rootState) => {
    return state.strategy === PASSWORD_STRATEGY
  },
  requiredToken: (state, getters, rootState) => {
    return state.strategy === TOKEN_STRATEGY
  },
  requiredTOTP: (state, getters, rootState) => {
    return state.strategy === TOTP_STRATEGY
  },
  requiredRecovery: (state, getters, rootState) => {
    return state.strategy === RECOVERY_STRATEGY
  }
}

// mutations
const mutations = {
  setInitialStrategy (state, strategy) {
    if (strategy) {
      state.initStrategy = strategy
      state.strategy = strategy
    }
  },
  requirePassword (state) {
    state.strategy = PASSWORD_STRATEGY
  },
  requireToken (state) {
    state.strategy = TOKEN_STRATEGY
  },
  requireMFA (state, { settings }) {
    state.settings = settings
    state.strategy = TOTP_STRATEGY // default strategy of MFA
  },
  requireRecovery (state) {
    state.strategy = RECOVERY_STRATEGY
  },
  requireTOTP (state) {
    state.strategy = TOTP_STRATEGY
  },
  abortMFA (state) {
    resetState(state)
  }
}

// actions
const actions = {
   
  async login ({ state, dispatch, commit }, { access_token }) {
    commit('setToken', access_token, { root: true })
    await dispatch('loginUser', access_token, { root: true })
    resetState(state)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
