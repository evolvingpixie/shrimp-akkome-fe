import StillImage from '../still-image/still-image.vue'
import Flash from '../flash/flash.vue'
import VideoAttachment from '../video_attachment/video_attachment.vue'
import nsfwImage from '../../assets/nsfw.png'
import fileTypeService from '../../services/file_type/file_type.service.js'
import { mapGetters } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFile,
  faMusic,
  faImage,
  faVideo,
  faPlayCircle,
  faTimes,
  faStop,
  faSearchPlus,
  faTrashAlt,
  faPencilAlt,
  faAlignRight
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faFile,
  faMusic,
  faImage,
  faVideo,
  faPlayCircle,
  faTimes,
  faStop,
  faSearchPlus,
  faTrashAlt,
  faPencilAlt,
  faAlignRight
)

const Attachment = {
  props: [
    'attachment',
    'description',
    'hideDescription',
    'nsfw',
    'size',
    'setMedia',
    'remove',
    'shiftUp',
    'shiftDn',
    'edit'
  ],
  data () {
    return {
      localDescription: this.description || this.attachment.description,
      nsfwImage: this.$store.state.instance.nsfwCensorImage || nsfwImage,
      hideNsfwLocal: this.$store.getters.mergedConfig.hideNsfw,
      preloadImage: this.$store.getters.mergedConfig.preloadImage,
      loading: false,
      img: fileTypeService.fileType(this.attachment.mimetype) === 'image' && document.createElement('img'),
      modalOpen: false,
      showHidden: false,
      flashLoaded: false,
      showDescription: false
    }
  },
  components: {
    Flash,
    StillImage,
    VideoAttachment
  },
  computed: {
    classNames () {
      return [
        {
          '-loading': this.loading,
          '-nsfw-placeholder': this.hidden,
          '-editable': this.edit !== undefined
        },
        '-type-' + this.type,
        this.size && '-size-' + this.size,
        `-${this.useContainFit ? 'contain' : 'cover'}-fit`
      ]
    },
    usePlaceholder () {
      return this.size === 'hide'
    },
    useContainFit () {
      return this.$store.getters.mergedConfig.useContainFit
    },
    placeholderName () {
      if (this.attachment.description === '' || !this.attachment.description) {
        return this.type.toUpperCase()
      }
      return this.attachment.description
    },
    placeholderIconClass () {
      if (this.type === 'image') return 'image'
      if (this.type === 'video') return 'video'
      if (this.type === 'audio') return 'music'
      return 'file'
    },
    referrerpolicy () {
      return this.$store.state.instance.mediaProxyAvailable ? '' : 'no-referrer'
    },
    type () {
      return fileTypeService.fileType(this.attachment.mimetype)
    },
    hidden () {
      return this.nsfw && this.hideNsfwLocal && !this.showHidden
    },
    isEmpty () {
      return (this.type === 'html' && !this.attachment.oembed)
    },
    useModal () {
      let modalTypes = []
      switch (this.size) {
        case 'hide':
        case 'small':
          modalTypes = ['image', 'video', 'audio', 'flash']
          break
        default:
          modalTypes = this.mergedConfig.playVideosInModal
            ? ['image', 'video', 'flash']
            : ['image']
          break
      }
      return modalTypes.includes(this.type)
    },
    videoTag () {
      return this.useModal ? 'button' : 'span'
    },
    ...mapGetters(['mergedConfig'])
  },
  watch: {
    localDescription (newVal) {
      this.onEdit(newVal)
    }
  },
  methods: {
    linkClicked ({ target }) {
      if (target.tagName === 'A') {
        window.open(target.href, '_blank')
      }
    },
    openModal (event) {
      if (this.useModal) {
        this.$emit('setMedia')
        this.$store.dispatch('setCurrentMedia', this.attachment)
      } else if (this.type === 'unknown') {
        window.open(this.attachment.url)
      }
    },
    openModalForce (event) {
      this.$emit('setMedia')
      this.$store.dispatch('setCurrentMedia', this.attachment)
    },
    onEdit (event) {
      this.edit && this.edit(this.attachment, event)
    },
    onRemove () {
      this.remove && this.remove(this.attachment)
    },
    onShiftUp () {
      this.shiftUp && this.shiftUp(this.attachment)
    },
    onShiftDn () {
      this.shiftDn && this.shiftDn(this.attachment)
    },
    stopFlash () {
      this.$refs.flash.closePlayer()
    },
    setFlashLoaded (event) {
      this.flashLoaded = event
    },
    toggleDescription () {
      this.showDescription = !this.showDescription
    },
    toggleHidden (event) {
      if (
        (this.mergedConfig.useOneClickNsfw && !this.showHidden) &&
        (this.type !== 'video' || this.mergedConfig.playVideosInModal)
      ) {
        this.openModal(event)
        return
      }
      if (this.img && !this.preloadImage) {
        if (this.img.onload) {
          this.img.onload()
        } else {
          this.loading = true
          this.img.src = this.attachment.url
          this.img.onload = () => {
            this.loading = false
            this.showHidden = !this.showHidden
          }
        }
      } else {
        this.showHidden = !this.showHidden
      }
    },
    onImageLoad (image) {
      const width = image.naturalWidth
      const height = image.naturalHeight
      this.$emit('naturalSizeLoad', { id: this.attachment.id, width, height })
    }
  }
}

export default Attachment
