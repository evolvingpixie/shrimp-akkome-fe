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
      expanded: false,
      threadDisplayStatusObject: {} // id => 'showing' | 'hidden'
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
    maxDepthToShowByDefault () {
      return 4
    },
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

        return a
      }, {
        forest: {},
      })

      debug('threads = ', threads)

      const walk = (forest, topLevel, depth = 0, processed = {}) => topLevel.map(id => {
        if (processed[id]) {
          return []
        }

        processed[id] = true
        return [{
          status: this.conversation[reverseLookupTable[id]],
          id,
          depth
        }, walk(forest, forest[id], depth + 1, processed)].reduce((a, b) => a.concat(b), [])
      }).reduce((a, b) => a.concat(b), [])

      const linearized = walk(threads.forest, this.topLevel.map(k => k.id))

      return linearized
    },
    replyIds () {
      return this.conversation.map(k => k.id)
        .reduce((res, id) => {
          res[id] = (this.replies[id] || []).map(k => k.id)
          return res
        }, {})
    },
    totalReplyCount () {
      debug('replyIds=', this.replyIds)
      const sizes = {}
      const subTreeSizeFor = (id) => {
        if (sizes[id]) {
          return sizes[id]
        }
        sizes[id] = 1 + this.replyIds[id].map(cid => subTreeSizeFor(cid)).reduce((a, b) => a + b, 0)
        return sizes[id]
      }
      this.conversation.map(k => k.id).map(subTreeSizeFor)
      debug('totalReplyCount=', sizes)
      return Object.keys(sizes).reduce((res, id) => {
        res[id] = sizes[id] - 1 // exclude itself
        return res
      }, {})
    },
    totalReplyDepth () {
      const depths = {}
      const subTreeDepthFor = (id) => {
        if (depths[id]) {
          return depths[id]
        }
        depths[id] = 1 + this.replyIds[id].map(cid => subTreeDepthFor(cid)).reduce((a, b) => a > b ? a : b, 0)
        return depths[id]
      }
      this.conversation.map(k => k.id).map(subTreeDepthFor)
      return Object.keys(depths).reduce((res, id) => {
        res[id] = depths[id] - 1 // exclude itself
        return res
      }, {})
    },
    depths () {
      debug('threadTree', this.threadTree)
      return this.threadTree.reduce((a, k) => {
        a[k.id] = k.depth
        return a
      }, {})
    },
    topLevel () {
      const topLevel = this.conversation.reduce((tl, cur) =>
        tl.filter(k => this.getReplies(cur.id).map(v => v.id).indexOf(k.id) === -1), this.conversation)
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
    },
    threadDisplayStatus () {
      return this.conversation.reduce((a, k) => {
        const id = k.id
        const depth = this.depths[id]
        const status = (() => {
          if (this.threadDisplayStatusObject[id]) {
            return this.threadDisplayStatusObject[id]
          }
          if (depth <= this.maxDepthToShowByDefault) {
            return 'showing'
          } else {
            return 'hidden'
          }
        })()

        a[id] = status
        return a
      }, {})
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
    },
    setThreadDisplay (id, nextStatus) {
      this.threadDisplayStatusObject = {
        ...this.threadDisplayStatusObject,
        [id]: nextStatus
      }
    },
    toggleThreadDisplay (id) {
      const depth = this.depths[id]
      debug('depth = ', depth)
      debug(
        'threadDisplayStatus = ', this.threadDisplayStatus,
        'threadDisplayStatusObject = ', this.threadDisplayStatusObject)
      const curStatus = this.threadDisplayStatus[id]
      const nextStatus = curStatus === 'showing' ? 'hidden' : 'showing'
      debug('toggling', id, 'to', nextStatus)
      this.setThreadDisplay(id, nextStatus)
    },
    setThreadDisplayRecursively (id, nextStatus) {
      this.setThreadDisplay(id, nextStatus)
      this.getReplies(id).map(k => k.id).map(id => this.setThreadDisplayRecursively(id, nextStatus))
    },
    showThreadRecursively (id) {
      this.setThreadDisplayRecursively(id, 'showing')
    }
  }
}

export default conversation
