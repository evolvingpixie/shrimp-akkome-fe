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
      imageTypeLabel: ''
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
      const mediaProxyAvailable = this.$store.state.instance.mediaProxyAvailable

      if (!mediaProxyAvailable) {
        // It's a bit aggressive to assume all images we can't find the mimetype of is animated, but necessary for
        // people in need of reduced motion accessibility. As such, we'll consider those images animated if the user
        // agent is set to prefer reduced motion. Otherwise, it'll just be used as an early exit.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          // Since the canvas and images are not pixel-perfect matching (due to scaling),
          // It makes the images jiggle on hover, which is not ideal for accessibility, methinks
          this.isAnimated = true
          return
        }
        this.detectWithoutMediaProxy(image)
      } else {
        this.detectWithMediaProxy(image)
      }
    },
    detectAnimationWithFetch (image) {
      // Browser Cache should ensure image doesn't get loaded twice if cache exists
      fetch(image.src, {
        referrerPolicy: 'same-origin'
      })
        .then(data => {
          // We don't need to read the whole file so only call it once
          data.body.getReader().read()
            .then(reader => {
              // Ordered from least to most intensive
              if (this.isGIF(reader.value)) {
                this.isAnimated = true
                this.setLabel('GIF')
                return
              }
              if (this.isAnimatedWEBP(reader.value)) {
                this.isAnimated = true
                this.setLabel('WEBP')
                return
              }
              if (this.isAnimatedPNG(reader.value)) {
                this.isAnimated = true
                this.setLabel('APNG')
              }
            })
        })
        .catch(() => {
          // this.imageLoadError && this.imageLoadError()
        })
    },
    detectWithMediaProxy (image) {
      this.detectAnimationWithFetch(image)
    },
    detectWithoutMediaProxy (image) {
      // We'll just assume that gifs and webp are animated
      const extension = image.src.split('.').pop().toLowerCase()

      if (extension === 'gif') {
        this.isAnimated = true
        this.setLabel('GIF')
        return
      }
      if (extension === 'webp') {
        this.isAnimated = true
        this.setLabel('WEBP')
        return
      }
      // Beware the apng! use this if ye dare
      // if (extension === 'png') {
      //  this.isAnimated = true
      //  this.setLabel('PNG')
      //  return
      // }
      
      // Hail mary for extensionless
      if (extension.includes('/')) {
        // Don't mind the CORS error barrage
        this.detectAnimationWithFetch(image)
      }
    },
    setLabel (name) {
      this.imageTypeLabel = name;
    },
    isGIF (data) {
      // I am a perfectly sane individual
      //
      // GIF HEADER CHUNK
      // === START HEADER ===
      // 47 49 46 38 ("GIF8")
      const gifHeader = [0x47, 0x49, 0x46];
      for (let i = 0; i < 3; i++) {
        if (data[i] !== gifHeader[i]) {
          return false;
        }
      }
      return true
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
    drawThumbnail() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
    
      const context = canvas.getContext('2d');
      const image = this.$refs.src;
      const parentElement = canvas.parentElement;
    
      // Draw the quick, unscaled version first
      context.drawImage(image, 0, 0, parentElement.clientWidth, parentElement.clientHeight);
    
      // Use requestAnimationFrame to schedule the scaling to the next frame
      requestAnimationFrame(() => {
        // Compute scaling ratio between the natural dimensions of the image and its display dimensions
        const scalingRatioWidth = parentElement.clientWidth / image.naturalWidth;
        const scalingRatioHeight = parentElement.clientHeight / image.naturalHeight;

        // Adjust for high-DPI displays
        const ratio = window.devicePixelRatio || 1;
        canvas.width = image.naturalWidth * scalingRatioWidth * ratio;
        canvas.height = image.naturalHeight * scalingRatioHeight * ratio;
        canvas.style.width = `${parentElement.clientWidth}px`;
        canvas.style.height = `${parentElement.clientHeight}px`;
        context.scale(ratio, ratio);
    
        // Maintain the aspect ratio of the image
        const imgAspectRatio = image.naturalWidth / image.naturalHeight;
        const canvasAspectRatio = parentElement.clientWidth / parentElement.clientHeight;
    
        let drawWidth, drawHeight;
    
        if (imgAspectRatio > canvasAspectRatio) {
          drawWidth = parentElement.clientWidth;
          drawHeight = parentElement.clientWidth / imgAspectRatio;
        } else {
          drawHeight = parentElement.clientHeight;
          drawWidth = parentElement.clientHeight * imgAspectRatio;
        }
    
        context.clearRect(0, 0, canvas.width, canvas.height);  // Clear the previous unscaled image
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // Draw the good one for realsies
        const dx = (parentElement.clientWidth - drawWidth) / 2;
        const dy = (parentElement.clientHeight - drawHeight) / 2;
        context.drawImage(image, dx, dy, drawWidth, drawHeight);
      });
    }    
  },
  updated () {
    // On computed animated change
    this.drawThumbnail()
  }
}

export default StillImage
