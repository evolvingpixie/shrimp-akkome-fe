import Modal from 'src/components/modal/modal.vue'
import PanelLoading from 'src/components/panel_loading/panel_loading.vue'
import AsyncComponentError from 'src/components/async_component_error/async_component_error.vue'
import getResettableAsyncComponent from 'src/services/resettable_async_component.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTimes,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import {
  faWindowMinimize
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faTimes,
  faWindowMinimize,
  faChevronDown
)

const ModModal = {
  components: {
    Modal,
    ModModalContent: getResettableAsyncComponent(
      () => import('./mod_modal_content.vue'),
      {
        loadingComponent: PanelLoading,
        errorComponent: AsyncComponentError,
        delay: 0
      }
    )
  },
  methods: {
    closeModal () {
      this.$store.dispatch('closeModModal')
    },
    peekModal () {
      this.$store.dispatch('togglePeekModModal')
    }
  },
  computed: {
    moderator () {
      return this.$store.state.users.currentUser &&
        (this.$store.state.users.currentUser.role === 'admin' ||
         this.$store.state.users.currentUser.role === 'moderator')
    },
    modalActivated () {
      return this.$store.state.interface.modModalState !== 'hidden'
    },
    modalOpenedOnce () {
      return this.$store.state.interface.modModalLoaded
    },
    modalPeeked () {
      return this.$store.state.interface.modModalState === 'minimized'
    }
  }
}

export default ModModal
