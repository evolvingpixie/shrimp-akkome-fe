import { extractTagFromUrl } from 'src/services/matcher/matcher.service.js'

const HashtagLink = {
  name: 'HashtagLink',
  props: {
    url: {
      required: true,
      type: String
    },
    content: {
      required: true,
      type: String
    },
    tag: {
      required: false,
      type: String,
      default: ''
    }
  },
  methods: {
    onClick () {
      const tag = this.tag || extractTagFromUrl(this.url)
      if (tag) {
        const link = this.generateTagLink(tag)
        this.$router.push(link)
      } else {
        window.open(this.url, '_blank')
      }
    },
    generateTagLink (tag) {
      return `/tag/${tag}`
    }
  }
}

export default HashtagLink
