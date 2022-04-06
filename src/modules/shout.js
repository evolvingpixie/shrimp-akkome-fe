const shout = {
  state: {
    messages: [],
    channel: { state: '' },
    joined: false
  },
  mutations: {
    setChannel (state, channel) {
      state.channel = channel
    },
    addMessage (state, message) {
      state.messages.push(message)
      state.messages = state.messages.slice(-19, 20)
    },
    setMessages (state, messages) {
      state.messages = messages.slice(-19, 20)
    },
    setJoined (state, joined) {
      state.joined = joined
    }
  },
  actions: {
    initializeShout (store, socket) {
      const channel = socket.channel('chat:public')
      channel.joinPush.receive('ok', () => {
        store.commit('setJoined', true)
      })
      channel.onClose(() => {
        store.commit('setJoined', false)
      })
      channel.onError(() => {
        store.commit('setJoined', false)
      })
      channel.on('new_msg', (msg) => {
        store.commit('addMessage', msg)
      })
      channel.on('messages', ({ messages }) => {
        store.commit('setMessages', messages)
      })
      channel.join()
      store.commit('setChannel', channel)
    }
  }
}

export default shout
