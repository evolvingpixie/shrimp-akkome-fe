import { get } from 'lodash'
import Modal from '../modal/modal.vue'
import Status from '../status/status.vue'

const StatusHistoryModal = {
  components: {
    Modal,
    Status
  },
  data () {
    return {
      statuses: []
    }
  },
  computed: {
    modalActivated () {
      return this.$store.state.statusHistory.modalActivated
    },
    params () {
      return this.$store.state.statusHistory.params
    },
    statusId () {
      return this.params.id
    },
    historyCount () {
      return this.statuses.length
    },
    history () {
      return this.statuses
    }
  },
  watch: {
    params (newVal, oldVal) {
      const newStatusId = get(newVal, 'id') !== get(oldVal, 'id')
      if (newStatusId) {
        this.resetHistory()
      }

      if (newStatusId || get(newVal, 'edited_at') !== get(oldVal, 'edited_at')) {
        this.fetchStatusHistory()
      }
    }
  },
  methods: {
    resetHistory () {
      this.statuses = []
    },
    fetchStatusHistory () {
      this.$store.dispatch('fetchStatusHistory', this.params)
        .then(data => {
          this.statuses = data
        })
    },
    closeModal () {
      this.$store.dispatch('closeStatusHistoryModal')
    }
  }
}

export default StatusHistoryModal
