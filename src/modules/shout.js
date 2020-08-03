const shout = {
  state: {
    messages: [],
    channel: { state: '' }
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
    }
  },
  actions: {
    initializeShout (store, socket) {
      const channel = socket.channel('shout:public')
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
