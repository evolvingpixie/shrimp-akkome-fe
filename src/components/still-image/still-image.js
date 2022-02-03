const StillImage = {
  props: [
    'src',
    'referrerpolicy',
    'mimetype',
    'imageLoadError',
    'imageLoadHandler',
    'alt',
    'height',
    'width'
  ],
  data () {
    return {
      stopGifs: this.$store.getters.mergedConfig.stopGifs
    }
  },
  computed: {
    animated () {
      return this.stopGifs && (this.mimetype === 'image/gif' || this.src.endsWith('.gif'))
    },
    style () {
      const appendPx = (str) => /\d$/.test(str) ? str + 'px' : str
      return {
        height: this.height ? appendPx(this.height) : null,
        width: this.width ? appendPx(this.width) : null
      }
    }
  },
  methods: {
    onLoad () {
      const image = this.$refs.src
      if (!image) return
      this.imageLoadHandler && this.imageLoadHandler(image)
      const canvas = this.$refs.canvas
      if (!canvas) return
      const width = image.naturalWidth
      const height = image.naturalHeight
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    },
    onError () {
      this.imageLoadError && this.imageLoadError()
    }
  }
}

export default StillImage
