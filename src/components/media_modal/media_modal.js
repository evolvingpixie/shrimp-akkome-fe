import StillImage from '../still-image/still-image.vue'
import VideoAttachment from '../video_attachment/video_attachment.vue'
import Modal from '../modal/modal.vue'
import PinchZoom from '../pinch_zoom/pinch_zoom.vue'
import SwipeClick from '../swipe_click/swipe_click.vue'
import GestureService from '../../services/gesture_service/gesture_service'
import Flash from 'src/components/flash/flash.vue'
import fileTypeService from '../../services/file_type/file_type.service.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronLeft,
  faChevronRight,
  faCircleNotch,
  faTimes
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronLeft,
  faChevronRight,
  faCircleNotch,
  faTimes
)

const MediaModal = {
  components: {
    StillImage,
    VideoAttachment,
    PinchZoom,
    SwipeClick,
    Modal,
    Flash
  },
  data () {
    return {
      loading: false,
      swipeDirection: GestureService.DIRECTION_LEFT,
      swipeThreshold: () => {
        const considerableMoveRatio = 1 / 4
        return window.innerWidth * considerableMoveRatio
      },
      pinchZoomMinScale: 1,
      pinchZoomScaleResetLimit: 1.2
    }
  },
  computed: {
    showing () {
      return this.$store.state.mediaViewer.activated
    },
    media () {
      return this.$store.state.mediaViewer.media
    },
    description () {
      return this.currentMedia.description
    },
    currentIndex () {
      return this.$store.state.mediaViewer.currentIndex
    },
    currentMedia () {
      return this.media[this.currentIndex]
    },
    canNavigate () {
      return this.media.length > 1
    },
    type () {
      return this.currentMedia ? this.getType(this.currentMedia) : null
    }
  },
  methods: {
    getType (media) {
      return fileTypeService.fileType(media.mimetype)
    },
    hide () {
      // HACK: Closing immediately via a touch will cause the click
      // to be processed on the content below the overlay
      const transitionTime = 100 // ms
      setTimeout(() => {
        this.$store.dispatch('closeMediaViewer')
      }, transitionTime)
    },
    hideIfNotSwiped (event) {
      // If we have swiped over SwipeClick, do not trigger hide
      const comp = this.$refs.swipeClick
      if (!comp) {
        this.hide()
      } else {
        comp.$gesture.click(event)
      }
    },
    goPrev () {
      if (this.canNavigate) {
        const prevIndex = this.currentIndex === 0 ? this.media.length - 1 : (this.currentIndex - 1)
        const newMedia = this.media[prevIndex]
        if (this.getType(newMedia) === 'image') {
          this.loading = true
        }
        this.$store.dispatch('setCurrentMedia', newMedia)
      }
    },
    goNext () {
      if (this.canNavigate) {
        const nextIndex = this.currentIndex === this.media.length - 1 ? 0 : (this.currentIndex + 1)
        const newMedia = this.media[nextIndex]
        if (this.getType(newMedia) === 'image') {
          this.loading = true
        }
        this.$store.dispatch('setCurrentMedia', newMedia)
      }
    },
    onImageLoaded () {
      this.loading = false
    },
    handleSwipePreview (offsets) {
      this.$refs.pinchZoom.setTransform({ scale: 1, x: offsets[0], y: 0 })
    },
    handleSwipeEnd (sign) {
      this.$refs.pinchZoom.setTransform({ scale: 1, x: 0, y: 0 })
      if (sign > 0) {
        this.goNext()
      } else if (sign < 0) {
        this.goPrev()
      }
    },
    handleKeyupEvent (e) {
      if (this.showing && e.keyCode === 27) { // escape
        this.hide()
      }
    },
    handleKeydownEvent (e) {
      if (!this.showing) {
        return
      }

      if (e.keyCode === 39) { // arrow right
        this.goNext()
      } else if (e.keyCode === 37) { // arrow left
        this.goPrev()
      }
    }
  },
  mounted () {
    window.addEventListener('popstate', this.hide)
    document.addEventListener('keyup', this.handleKeyupEvent)
    document.addEventListener('keydown', this.handleKeydownEvent)
  },
  destroyed () {
    window.removeEventListener('popstate', this.hide)
    document.removeEventListener('keyup', this.handleKeyupEvent)
    document.removeEventListener('keydown', this.handleKeydownEvent)
  }
}

export default MediaModal
