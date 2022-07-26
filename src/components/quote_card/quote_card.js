import { mapGetters } from 'vuex'
import QuoteCardContent from '../quote_card_content/quote_card_content.vue'

const QuoteCard = {
  name: 'QuoteCard',
  props: [
    'status'
  ],
  data () {
    return {
      imageLoaded: false
    }
  },
  computed: {
    ...mapGetters([
      'mergedConfig'
    ])
  },
  components: {
    QuoteCardContent
  }
}

export default QuoteCard
