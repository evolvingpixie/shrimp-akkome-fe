import StillImage from '../still-image/still-image.vue'
import VideoAttachment from '../video_attachment/video_attachment.vue'
import Modal from '../modal/modal.vue'
import fileTypeService from '../../services/file_type/file_type.service.js'
import GestureService from '../../services/gesture_service/gesture_service'
import Flash from 'src/components/flash/flash.vue'
import Vuex from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronLeft,
  faChevronRight,
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronLeft,
  faChevronRight,
  faCircleNotch
)

const onlyXAxis = ([x, y]) => [x, 0]

const MediaModal = {
  components: {
    StillImage,
    VideoAttachment,
    Modal,
    Flash
  },
  data () {
    return {
      loading: false
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
    },
    scaling () {
      return this.$store.state.mediaViewer.swipeScaler.scaling
    },
    offsets () {
      return this.$store.state.mediaViewer.swipeScaler.offsets
    },
    transform () {
      return `scale(${this.scaling}, ${this.scaling}) translate(${this.offsets[0]}px, ${this.offsets[1]}px)`
    }
  },
  created () {
    this.mediaGesture = new GestureService.SwipeAndScaleGesture({
      direction: GestureService.DIRECTION_LEFT,
      callbackPositive: this.goNext,
      callbackNegative: this.goPrev,
      swipePreviewCallback: this.handleSwipePreview,
      swipeEndCallback: this.handleSwipeEnd,
      threshold: 50
    })
  },
  methods: {
    getType (media) {
      return fileTypeService.fileType(media.mimetype)
    },
    mediaTouchStart (e) {
      this.mediaGesture.start(e)
    },
    mediaTouchMove (e) {
      this.mediaGesture.move(e)
    },
    mediaTouchEnd (e) {
      this.mediaGesture.end(e)
    },
    hide () {
      this.$store.dispatch('closeMediaViewer')
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
      this.$store.dispatch('swipeScaler/apply', { offsets: onlyXAxis(offsets) })
    },
    handleSwipeEnd (sign) {
      if (sign === 0) {
        this.$store.dispatch('swipeScaler/revert')
      } else if (sign > 0) {
        this.goNext()
      } else {
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
