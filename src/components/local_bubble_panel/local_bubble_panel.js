import { mapState } from 'vuex'
import { get } from 'lodash'

const LocalBubblePanel = {
  computed: {
    ...mapState({
      bubbleInstances: state => get(state, 'instance.localBubbleInstances')
    })
  }
}

export default LocalBubblePanel
