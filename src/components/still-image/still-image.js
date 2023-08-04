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
      stopGifs: this.$store.getters.mergedConfig.stopGifs || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isAnimated: false,
    }
  },
  computed: {
    animated () {
      return this.stopGifs && this.isAnimated
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
      this.detectAnimation(image)
      this.drawThumbnail()
    },
    onError () {
      this.imageLoadError && this.imageLoadError()
    },
    detectAnimation (image) {
      // If there are no file extensions, the mimetype isn't set, and no mediaproxy is available, we can't figure out
      // the mimetype of the image.
      const hasFileExtension = this.src.split('/').pop().includes('.') // TODO: Better check?
      const mediaProxyAvailable = this.$store.state.instance.mediaProxyAvailable
      if (!hasFileExtension && this.mimetype === undefined && !mediaProxyAvailable) {
        // It's a bit aggressive to assume all images we can't find the mimetype of is animated, but necessary for
        // people in need of reduced motion accessibility. As such, we'll consider those images animated if the user
        // agent is set to prefer reduced motion. Otherwise, it'll just be used as an early exit.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
          this.isAnimated = true
        return
      }

      if (this.mimetype === 'image/gif' || this.src.endsWith('.gif')) {
        this.isAnimated = true
        return
      }
      // harmless CORS errors without-- clean console with
      if (!mediaProxyAvailable) return
      // Animated JPEGs?
      if (!(this.src.endsWith('.webp') || this.src.endsWith('.png'))) return
      // Browser Cache should ensure image doesn't get loaded twice if cache exists
      fetch(image.src, {
        referrerPolicy: 'same-origin'
      })
        .then(data => {
          // We don't need to read the whole file so only call it once
          data.body.getReader().read()
            .then(reader => {
              if (this.src.endsWith('.webp') && this.isAnimatedWEBP(reader.value)) {
                this.isAnimated = true
                return
              }
              if (this.src.endsWith('.png') && this.isAnimatedPNG(reader.value)) {
                this.isAnimated = true
              }
            })
        })
        .catch(() => {
          // this.imageLoadError && this.imageLoadError()
        })
    },
    isAnimatedWEBP (data) {
      /**
       * WEBP HEADER CHUNK
       * === START HEADER ===
       *  82 73 70 70 ("RIFF")
       *  xx xx xx xx (SIZE)
       *  87 69 66 80 ("WEBP")
       * === END OF HEADER ===
       *  86 80 56 88 ("VP8X") ← Extended VP8X
       *  xx xx xx xx (VP8X)
       *  [++] ← RSVILEX(A)R (1 byte)
       *  A → Animated bit
       */
      // Relevant bytes
      const segment = data.slice(4 * 3, (4 * 5) + 1)
      // Check for VP8X string
      if (segment.join('').includes(['86805688'])) {
        // Check for Animation bit
        return !!((segment[8] >> 1) & 1)
      }
      // No VP8X = Not Animated (X is for Extended)
      return false
    },
    isAnimatedPNG (data) {
      // Find acTL before IDAT in PNG; if found it is animated
      const segment = []
      for (let i = 0; i < data.length; i++) {
        segment.push(String.fromCharCode(data[i]))
      }
      const str = segment.join('')
      const idatPos = str.indexOf('IDAT')
      return (str.substring(0, idatPos > 0 ? idatPos : 0).indexOf('acTL') > 0)
    },
    drawThumbnail () {
      const canvas = this.$refs.canvas
      if (!this.$refs.canvas) return
      const image = this.$refs.src
      const width = image.naturalWidth
      const height = image.naturalHeight
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    }
  },
  updated () {
    // On computed animated change
    this.drawThumbnail()
  }
}

export default StillImage
