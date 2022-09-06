import PostStatusForm from '../post_status_form/post_status_form.vue'
import Modal from '../modal/modal.vue'
import statusPosterService from '../../services/status_poster/status_poster.service.js'
import get from 'lodash/get'

const EditStatusModal = {
  components: {
    PostStatusForm,
    Modal
  },
  data () {
    return {
      resettingForm: false
    }
  },
  computed: {
    isLoggedIn () {
      return !!this.$store.state.users.currentUser
    },
    modalActivated () {
      return this.$store.state.editStatus.modalActivated
    },
    isFormVisible () {
      return this.isLoggedIn && !this.resettingForm && this.modalActivated
    },
    params () {
      return this.$store.state.editStatus.params || {}
    }
  },
  watch: {
    params (newVal, oldVal) {
      if (get(newVal, 'statusId') !== get(oldVal, 'statusId')) {
        this.resettingForm = true
        this.$nextTick(() => {
          this.resettingForm = false
        })
      }
    },
    isFormVisible (val) {
      if (val) {
        this.$nextTick(() => this.$el && this.$el.querySelector('textarea').focus())
      }
    }
  },
  methods: {
    doEditStatus ({ status, spoilerText, sensitive, media, contentType, poll }) {
      const params = {
        store: this.$store,
        statusId: this.$store.state.editStatus.params.statusId,
        status,
        spoilerText,
        sensitive,
        poll,
        media,
        contentType
      }

      return statusPosterService.editStatus(params)
        .then((data) => {
          return data
        })
        .catch((err) => {
          console.error('Error editing status', err)
          return {
            error: err.message
          }
        })
    },
    closeModal () {
      this.$store.dispatch('closeEditStatusModal')
    }
  }
}

export default EditStatusModal
