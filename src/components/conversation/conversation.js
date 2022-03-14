import { reduce, filter, findIndex, clone, get } from 'lodash'
import Status from '../status/status.vue'
import ThreadTree from '../thread_tree/thread_tree.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDoubleDown,
  faAngleDoubleLeft,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faAngleDoubleDown,
  faAngleDoubleLeft,
  faChevronLeft
)

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
      threadDisplayStatusObject: {}, // id => 'showing' | 'hidden'
      statusContentPropertiesObject: {},
      inlineDivePosition: null
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
      // maxDepthInThread = max number of depths that is *visible*
      // since our depth starts with 0 and "showing" means "showing children"
      // there is a -2 here
      const maxDepth = this.$store.getters.mergedConfig.maxDepthInThread - 2
      return maxDepth >= 1 ? maxDepth : 1
    },
    displayStyle () {
      return this.$store.getters.mergedConfig.conversationDisplay
    },
    isTreeView () {
      return !this.isLinearView
    },
    treeViewIsSimple () {
      return !this.$store.getters.mergedConfig.conversationTreeAdvanced
    },
    isLinearView () {
      return this.displayStyle === 'linear'
    },
    shouldFadeAncestors () {
      return this.$store.getters.mergedConfig.conversationTreeFadeAncestors
    },
    otherRepliesButtonPosition () {
      return this.$store.getters.mergedConfig.conversationOtherRepliesButton
    },
    showOtherRepliesButtonBelowStatus () {
      return this.otherRepliesButtonPosition === 'below'
    },
    showOtherRepliesButtonInsideStatus () {
      return this.otherRepliesButtonPosition === 'inside'
    },
    suspendable () {
      if (this.isTreeView) {
        return Object.entries(this.statusContentProperties)
          .every(([k, prop]) => !prop.replying && prop.mediaPlaying.length === 0)
      }
      if (this.$refs.statusComponent && this.$refs.statusComponent[0]) {
        return this.$refs.statusComponent.every(s => s.suspendable)
      } else {
        return true
      }
    },
    hideStatus () {
      return this.virtualHidden && this.suspendable
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
    statusMap () {
      return this.conversation.reduce((res, s) => {
        res[s.id] = s
        return res
      }, {})
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
        forest: {}
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
      const sizes = {}
      const subTreeSizeFor = (id) => {
        if (sizes[id]) {
          return sizes[id]
        }
        sizes[id] = 1 + this.replyIds[id].map(cid => subTreeSizeFor(cid)).reduce((a, b) => a + b, 0)
        return sizes[id]
      }
      this.conversation.map(k => k.id).map(subTreeSizeFor)
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
      return this.threadTree.reduce((a, k) => {
        a[k.id] = k.depth
        return a
      }, {})
    },
    topLevel () {
      const topLevel = this.conversation.reduce((tl, cur) =>
        tl.filter(k => this.getReplies(cur.id).map(v => v.id).indexOf(k.id) === -1), this.conversation)
      return topLevel
    },
    otherTopLevelCount () {
      return this.topLevel.length - 1
    },
    showingTopLevel () {
      if (this.canDive && this.diveRoot) {
        return [this.statusMap[this.diveRoot]]
      }
      return this.topLevel
    },
    diveRoot () {
      const statusId = this.inlineDivePosition || this.statusId
      const isTopLevel = !this.parentOf(statusId)
      return isTopLevel ? null : statusId
    },
    diveDepth () {
      return this.canDive && this.diveRoot ? this.depths[this.diveRoot] : 0
    },
    diveMode () {
      return this.canDive && !!this.diveRoot
    },
    shouldShowAllConversationButton () {
      // The "show all conversation" button tells the user that there exist
      // other toplevel statuses, so do not show it if there is only a single root
      return this.isTreeView && this.isExpanded && this.diveMode && this.topLevel.length > 1
    },
    shouldShowAncestors () {
      return this.isTreeView && this.isExpanded && this.ancestorsOf(this.diveRoot).length
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
          if ((depth - this.diveDepth) <= this.maxDepthToShowByDefault) {
            return 'showing'
          } else {
            return 'hidden'
          }
        })()

        a[id] = status
        return a
      }, {})
    },
    statusContentProperties () {
      return this.conversation.reduce((a, k) => {
        const id = k.id
        const props = (() => {
          const def = {
            showingTall: false,
            expandingSubject: false,
            showingLongSubject: false,
            isReplying: false,
            mediaPlaying: []
          }

          if (this.statusContentPropertiesObject[id]) {
            return {
              ...def,
              ...this.statusContentPropertiesObject[id]
            }
          }
          return def
        })()

        a[id] = props
        return a
      }, {})
    },
    canDive () {
      return this.isTreeView && this.isExpanded
    },
    focused () {
      return (id) => {
        return (this.isExpanded) && id === this.highlight
      }
    },
    maybeHighlight () {
      return this.isExpanded ? this.highlight : null
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
      } else {
        this.resetDisplayState()
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
    getHighlight () {
      return this.isExpanded ? this.highlight : null
    },
    setHighlight (id) {
      if (!id) return
      this.highlight = id
      this.$store.dispatch('fetchFavsAndRepeats', id)
      this.$store.dispatch('fetchEmojiReactionsBy', id)
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
      const curStatus = this.threadDisplayStatus[id]
      const nextStatus = curStatus === 'showing' ? 'hidden' : 'showing'
      this.setThreadDisplay(id, nextStatus)
    },
    setThreadDisplayRecursively (id, nextStatus) {
      this.setThreadDisplay(id, nextStatus)
      this.getReplies(id).map(k => k.id).map(id => this.setThreadDisplayRecursively(id, nextStatus))
    },
    showThreadRecursively (id) {
      this.setThreadDisplayRecursively(id, 'showing')
    },
    setStatusContentProperty (id, name, value) {
      this.statusContentPropertiesObject = {
        ...this.statusContentPropertiesObject,
        [id]: {
          ...this.statusContentPropertiesObject[id],
          [name]: value
        }
      }
    },
    toggleStatusContentProperty (id, name) {
      this.setStatusContentProperty(id, name, !this.statusContentProperties[id][name])
    },
    leastVisibleAncestor (id) {
      let cur = id
      let parent = this.parentOf(cur)
      while (cur) {
        // if the parent is showing it means cur is visible
        if (this.threadDisplayStatus[parent] === 'showing') {
          return cur
        }
        parent = this.parentOf(parent)
        cur = this.parentOf(cur)
      }
      // nothing found, fall back to toplevel
      return this.topLevel[0] ? this.topLevel[0].id : undefined
    },
    diveIntoStatus (id, preventScroll) {
      this.tryScrollTo(id)
    },
    diveToTopLevel () {
      this.tryScrollTo(this.topLevelAncestorOrSelfId(this.diveRoot) || this.topLevel[0].id)
    },
    // only used when we are not on a page
    undive () {
      this.inlineDivePosition = null
      this.setHighlight(this.statusId)
    },
    tryScrollTo (id) {
      if (!id) {
        return
      }
      if (this.isPage) {
        // set statusId
        this.$router.push({ name: 'conversation', params: { id } })
      } else {
        this.inlineDivePosition = id
      }
      // Because the conversation can be unmounted when out of sight
      // and mounted again when it comes into sight,
      // the `mounted` or `created` function in `status` should not
      // contain scrolling calls, as we do not want the page to jump
      // when we scroll with an expanded conversation.
      //
      // Now the method is to rely solely on the `highlight` watcher
      // in `status` components.
      // In linear views, all statuses are rendered at all times, but
      // in tree views, it is possible that a change in active status
      // removes and adds status components (e.g. an originally child
      // status becomes an ancestor status, and thus they will be
      // different).
      // Here, let the components be rendered first, in order to trigger
      // the `highlight` watcher.
      this.$nextTick(() => {
        this.setHighlight(id)
      })
    },
    goToCurrent () {
      this.tryScrollTo(this.diveRoot || this.topLevel[0].id)
    },
    statusById (id) {
      return this.statusMap[id]
    },
    parentOf (id) {
      const status = this.statusById(id)
      if (!status) {
        return undefined
      }
      const { in_reply_to_status_id: parentId } = status
      if (!this.statusMap[parentId]) {
        return undefined
      }
      return parentId
    },
    parentOrSelf (id) {
      return this.parentOf(id) || id
    },
    // Ancestors of some status, from top to bottom
    ancestorsOf (id) {
      const ancestors = []
      let cur = this.parentOf(id)
      while (cur) {
        ancestors.unshift(this.statusMap[cur])
        cur = this.parentOf(cur)
      }
      return ancestors
    },
    topLevelAncestorOrSelfId (id) {
      let cur = id
      let parent = this.parentOf(id)
      while (parent) {
        cur = this.parentOf(cur)
        parent = this.parentOf(parent)
      }
      return cur
    },
    resetDisplayState () {
      this.undive()
      this.threadDisplayStatusObject = {}
    }
  }
}

export default conversation
