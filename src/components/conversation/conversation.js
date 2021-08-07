import { reduce, filter, findIndex, clone, get } from 'lodash'
import Status from '../status/status.vue'
import ThreadTree from '../thread_tree/thread_tree.vue'

const debug = console.log

const sortById = (a, b) => {
  const idA = a.type === 'retweet' ? a.retweeted_status.id : a.id
  const idB = b.type === 'retweet' ? b.retweeted_status.id : b.id
  const seqA = Number(idA)
  const seqB = Number(idB)
  const isSeqA = !Number.isNaN(seqA)
  const isSeqB = !Number.isNaN(seqB)
  if (isSeqA && isSeqB) {
    return seqA < seqB ? -1 : 1
  } else if (isSeqA && !isSeqB) {
    return -1
  } else if (!isSeqA && isSeqB) {
    return 1
  } else {
    return idA < idB ? -1 : 1
  }
}

const sortAndFilterConversation = (conversation, statusoid) => {
  if (statusoid.type === 'retweet') {
    conversation = filter(
      conversation,
      (status) => (status.type === 'retweet' || status.id !== statusoid.retweeted_status.id)
    )
  } else {
    conversation = filter(conversation, (status) => status.type !== 'retweet')
  }
  return conversation.filter(_ => _).sort(sortById)
}

const conversation = {
  data () {
    return {
      highlight: null,
      expanded: false
    }
  },
  props: [
    'statusId',
    'collapsable',
    'isPage',
    'pinnedStatusIdsObject',
    'inProfile',
    'profileUserId',
    'virtualHidden'
  ],
  created () {
    if (this.isPage) {
      this.fetchConversation()
    }
  },
  computed: {
    displayStyle () {
      return this.$store.state.config.conversationDisplay
    },
    isTreeView () {
      return this.displayStyle === 'tree'
    },
    isLinearView () {
      return this.displayStyle === 'linear'
    },
    hideStatus () {
      if (this.$refs.statusComponent && this.$refs.statusComponent[0]) {
        return this.virtualHidden && this.$refs.statusComponent[0].suspendable
      } else {
        return this.virtualHidden
      }
    },
    status () {
      return this.$store.state.statuses.allStatusesObject[this.statusId]
    },
    originalStatusId () {
      if (this.status.retweeted_status) {
        return this.status.retweeted_status.id
      } else {
        return this.statusId
      }
    },
    conversationId () {
      return this.getConversationId(this.statusId)
    },
    conversation () {
      if (!this.status) {
        return []
      }

      if (!this.isExpanded) {
        return [this.status]
      }

      const conversation = clone(this.$store.state.statuses.conversationsObject[this.conversationId])
      const statusIndex = findIndex(conversation, { id: this.originalStatusId })
      if (statusIndex !== -1) {
        conversation[statusIndex] = this.status
      }

      return sortAndFilterConversation(conversation, this.status)
    },
    threadTree () {
      const reverseLookupTable = this.conversation.reduce((table, status, index) => {
        table[status.id] = index
        return table
      }, {})

      const threads = this.conversation.reduce((a, cur) => {
        const id = cur.id
        a.forest[id] = this.getReplies(id)
          .map(s => s.id)
          .sort((a, b) => reverseLookupTable[a] - reverseLookupTable[b])

        a.topLevel = a.topLevel.filter(k => a.forest[id].contains(k))
        return a
      }, {
        forest: {},
        topLevel: this.conversation.map(s => s.id)
      })

      const walk = (forest, topLevel, depth = 0, processed = {}) => topLevel.map(id => {
        if (processed[id]) {
          return []
        }

        processed[id] = true
        return [{
          status: this.conversation[reverseLookupTable[id]],
          id,
          depth
        }, walk(forest, forest[child], depth + 1, processed)].reduce((a, b) => a.concat(b), [])
      }).reduce((a, b) => a.concat(b), [])

      const linearized = walk(threads.forest, threads.topLevel)

      return linearized
    },
    topLevel () {
      const topLevel = this.conversation.reduce((tl, cur) =>
        tl.filter(k => this.getReplies(cur.id).map(v => v.id).indexOf(k.id) === -1), this.conversation)
      debug("toplevel =", topLevel)
      debug("toplevel =", topLevel)
      return topLevel
    },
    replies () {
      let i = 1
      // eslint-disable-next-line camelcase
      return reduce(this.conversation, (result, { id, in_reply_to_status_id }) => {
        /* eslint-disable camelcase */
        const irid = in_reply_to_status_id
        /* eslint-enable camelcase */
        if (irid) {
          result[irid] = result[irid] || []
          result[irid].push({
            name: `#${i}`,
            id: id
          })
        }
        i++
        return result
      }, {})
    },
    isExpanded () {
      return !!(this.expanded || this.isPage)
    },
    hiddenStyle () {
      const height = (this.status && this.status.virtualHeight) || '120px'
      return this.virtualHidden ? { height } : {}
    }
  },
  components: {
    Status,
    ThreadTree
  },
  watch: {
    statusId (newVal, oldVal) {
      const newConversationId = this.getConversationId(newVal)
      const oldConversationId = this.getConversationId(oldVal)
      if (newConversationId && oldConversationId && newConversationId === oldConversationId) {
        this.setHighlight(this.originalStatusId)
      } else {
        this.fetchConversation()
      }
    },
    expanded (value) {
      if (value) {
        this.fetchConversation()
      }
    },
    virtualHidden (value) {
      this.$store.dispatch(
        'setVirtualHeight',
        { statusId: this.statusId, height: `${this.$el.clientHeight}px` }
      )
    }
  },
  methods: {
    fetchConversation () {
      if (this.status) {
        this.$store.state.api.backendInteractor.fetchConversation({ id: this.statusId })
          .then(({ ancestors, descendants }) => {
            this.$store.dispatch('addNewStatuses', { statuses: ancestors })
            this.$store.dispatch('addNewStatuses', { statuses: descendants })
            this.setHighlight(this.originalStatusId)
          })
      } else {
        this.$store.state.api.backendInteractor.fetchStatus({ id: this.statusId })
          .then((status) => {
            this.$store.dispatch('addNewStatuses', { statuses: [status] })
            this.fetchConversation()
          })
      }
    },
    getReplies (id) {
      return this.replies[id] || []
    },
    focused (id) {
      return (this.isExpanded) && id === this.statusId
    },
    setHighlight (id) {
      if (!id) return
      this.highlight = id
      this.$store.dispatch('fetchFavsAndRepeats', id)
      this.$store.dispatch('fetchEmojiReactionsBy', id)
    },
    getHighlight () {
      return this.isExpanded ? this.highlight : null
    },
    toggleExpanded () {
      this.expanded = !this.expanded
    },
    getConversationId (statusId) {
      const status = this.$store.state.statuses.allStatusesObject[statusId]
      return get(status, 'retweeted_status.statusnet_conversation_id', get(status, 'statusnet_conversation_id'))
    }
  }
}

export default conversation
