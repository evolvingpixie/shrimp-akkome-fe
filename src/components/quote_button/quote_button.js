import { library } from '@fortawesome/fontawesome-svg-core'
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons'

library.add(faQuoteLeft)

const QuoteButton = {
  name: 'QuoteButton',
  props: ['status', 'quoting', 'visibility'],
  computed: {
    loggedIn () {
      return !!this.$store.state.users.currentUser
    }
  }
}

export default QuoteButton
