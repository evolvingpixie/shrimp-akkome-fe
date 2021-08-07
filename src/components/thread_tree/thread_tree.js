import Status from '../status/status.vue'

const debug = console.log

const ThreadTree = {
  components: {
    Status
  },
  name: 'ThreadTree',
  props: {
    depth: Number,
    status: Object,
    inProfile: Boolean,
    conversation: Array,
    collapsable: Boolean,
    isExpanded: Boolean,
    pinnedStatusIdsObject: Object,
    profileUserId: String,

    focused: Function,
    getHighlight: Function,
    getReplies: Function,
    setHighlight: Function,
    toggleExpanded: Function,

    // to control display of the whole thread forest
    toggleThreadDisplay: Function,
    threadDisplayStatus: Object,
    showThreadRecursively: Function,
    totalReplyCount: Object,
    totalReplyDepth: Object,
    statusContentProperties: Object,
    setStatusContentProperty: Function,
    toggleStatusContentProperty: Function,
    dive: Function
  },
  computed: {
    reverseLookupTable () {
      return this.conversation.reduce((table, status, index) => {
        table[status.id] = index
        return table
      }, {})
    },
    currentReplies () {
      debug('status:', this.status)
      debug('getReplies:', this.getReplies(this.status.id))
      return this.getReplies(this.status.id).map(({ id }) => this.statusById(id))
    },
    threadShowing () {
      return this.threadDisplayStatus[this.status.id] === 'showing'
    },
    currentProp () {
      return this.statusContentProperties[this.status.id]
    }
  },
  methods: {
    statusById (id) {
      return this.conversation[this.reverseLookupTable[id]]
    },
    collapseThread () {
    },
    showThread () {
    },
    showAllSubthreads () {
    },
    toggleCurrentProp (name) {
      this.toggleStatusContentProperty(this.status.id, name)
    }
  }
}

export default ThreadTree
