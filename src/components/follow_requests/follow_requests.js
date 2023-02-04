import FollowRequestCard from '../follow_request_card/follow_request_card.vue'
import withLoadMore from '../../hocs/with_load_more/with_load_more'
import List from '../list/list.vue'
import get from 'lodash/get'

const FollowRequestList = withLoadMore({
  fetch: (props, $store) => $store.dispatch('fetchFollowRequests'),
  select: (props, $store) => get($store.state.api, 'followRequests', []).map(req => $store.getters.findUser(req.id)),
  destroy: (props, $store) => $store.dispatch('clearFollowRequests'),
  childPropName: 'items',
  additionalPropNames: ['userId']
})(List);


const FollowRequests = {
  components: {
    FollowRequestCard,
    FollowRequestList
  },
  computed: {
    userId () {
      return this.$store.state.users.currentUser.id
    },
    requests () {
      return this.$store.state.api.followRequests
    }
  }
}

export default FollowRequests
