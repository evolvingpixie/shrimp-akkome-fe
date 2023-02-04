import get from 'lodash/get'
import UserCard from '../user_card/user_card.vue'
import FollowCard from '../follow_card/follow_card.vue'
import Timeline from '../timeline/timeline.vue'
import Conversation from '../conversation/conversation.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import List from '../list/list.vue'
import withLoadMore from '../../hocs/with_load_more/with_load_more'
import { debounce } from 'lodash'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCircleNotch,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons'
import FollowedTagCard from '../followed_tag_card/FollowedTagCard.vue'

library.add(
  faCircleNotch,
  faCircleCheck
)

const FollowerList = withLoadMore({
  fetch: (props, $store) => $store.dispatch('fetchFollowers', props.userId),
  select: (props, $store) => get($store.getters.findUser(props.userId), 'followerIds', []).map(id => $store.getters.findUser(id)),
  destroy: (props, $store) => $store.dispatch('clearFollowers', props.userId),
  childPropName: 'items',
  additionalPropNames: ['userId']
})(List)

const FriendList = withLoadMore({
  fetch: (props, $store) => $store.dispatch('fetchFriends', props.userId),
  select: (props, $store) => get($store.getters.findUser(props.userId), 'friendIds', []).map(id => $store.getters.findUser(id)),
  destroy: (props, $store) => $store.dispatch('clearFriends', props.userId),
  childPropName: 'items',
  additionalPropNames: ['userId']
})(List)

const FollowedTagList = withLoadMore({
  fetch: (props, $store) => $store.dispatch('fetchFollowedTags', props.userId),
  select: (props, $store) => get($store.getters.findUser(props.userId), 'followedTagIds', []).map(id => $store.getters.findTag(id)),
  destroy: (props, $store) => $store.dispatch('clearFollowedTags', props.userId),
  childPropName: 'items',
  additionalPropNames: ['userId']
})(List)

const isUserPage = ({ name }) => name === 'user-profile' || name === 'external-user-profile'

const UserProfile = {
  data () {
    return {
      error: false,
      userId: null,
      tab: 'statuses',
      followsTab: 'users',
      footerRef: null,
      note: null,
      noteLoading: false
    }
  },
  created () {
    const defaultTabKey = this.defaultTabKey
    const routeParams = this.$route.params
    const hash = (get(this.$route, 'hash') || defaultTabKey).replace(/^#/, '')
    if (hash !== '') this.tab = hash
    this.load(routeParams.name || routeParams.id)
  },
  unmounted () {
    this.stopFetching()
  },
  computed: {
    timeline () {
      return this.$store.state.statuses.timelines.user
    },
    replies () {
      return this.$store.state.statuses.timelines.replies
    },
    favorites () {
      return this.$store.state.statuses.timelines.favorites
    },
    media () {
      return this.$store.state.statuses.timelines.media
    },
    isUs () {
      return this.userId && this.$store.state.users.currentUser.id &&
        this.userId === this.$store.state.users.currentUser.id
    },
    user () {
      return this.$store.getters.findUser(this.userId)
    },
    isExternal () {
      return this.$route.name === 'external-user-profile'
    },
    followsTabVisible () {
      return this.isUs || !this.user.hide_follows
    },
    followersTabVisible () {
      return this.isUs || !this.user.hide_followers
    },
    currentUser () {
      return this.$store.state.users.currentUser
    },
    defaultTabKey () {
      return this.$store.getters.mergedConfig.userProfileDefaultTab || 'statuses'
    }
  },
  methods: {
    setFooterRef (el) {
      this.footerRef = el
    },
    onRouteChange (previousTab, nextTab) {
      const timelineTabMap = {
        statuses: 'user',
        replies: 'replies',
        media: 'media'
      }
      // only we can see our own favourites
      if (this.isUs) timelineTabMap['favorites'] = 'favorites'

      const timeline = timelineTabMap[nextTab]

      if (timeline) {
        this.stopFetching()
        this.$store.dispatch('startFetchingTimeline', { timeline: timeline, userId: this.userId })
      }
    },
    load (userNameOrId) {
      const loadById = (userId) => {
        this.userId = userId
        const timelines = ['user', 'favorites', 'replies', 'media']
        timelines.forEach((timeline) => {
          this.$store.commit('clearTimeline', { timeline: timeline })
        })
        this.onRouteChange(null, this.tab)
        // Fetch all pinned statuses immediately
        this.$store.dispatch('fetchPinnedStatuses', userId)
      }

      // Reset view
      this.userId = null
      this.error = false

      // Check if user data is already loaded in store
      const user = this.$store.getters.findUser(userNameOrId)
      if (user) {
        loadById(user.id)
        this.note = user.relationship.note
      } else {
        this.$store.dispatch('fetchUser', userNameOrId)
          .then(({ id, relationship }) => {
            this.note = relationship.note
            return loadById(id)
          })
          .catch((reason) => {
            const errorMessage = get(reason, 'error.error')
            if (errorMessage === 'No user with such user_id') { // Known error
              this.error = this.$t('user_profile.profile_does_not_exist')
            } else if (errorMessage) {
              this.error = errorMessage
            } else {
              this.error = this.$t('user_profile.profile_loading_error')
            }
          })
      }
    },
    stopFetching () {
      this.$store.dispatch('stopFetchingTimeline', 'user')
      this.$store.dispatch('stopFetchingTimeline', 'replies')
      this.$store.dispatch('stopFetchingTimeline', 'favorites')
      this.$store.dispatch('stopFetchingTimeline', 'media')
    },
    switchUser (userNameOrId) {
      this.stopFetching()
      this.load(userNameOrId)
    },
    onTabSwitch (tab) {
      this.tab = tab
      this.$router.replace({ hash: `#${tab}` })
    },
    onFollowsTabSwitch (tab) {
      this.followsTab = tab
    },
    linkClicked ({ target }) {
      if (target.tagName === 'SPAN') {
        target = target.parentNode
      }
      if (target.tagName === 'A') {
        window.open(target.href, '_blank')
      }
    },
    setNote () {
      this.noteLoading = true
      this.debounceSetNote()
    },
    debounceSetNote: debounce(function () {
      this.$store.dispatch('setNote', { id: this.userId, note: this.note })
      this.noteLoading = false
    }, 1500)
  },
  watch: {
    '$route.params.id': function (newVal) {
      if (isUserPage(this.$route) && newVal) {
        this.switchUser(newVal)
      }
    },
    '$route.params.name': function (newVal) {
      if (isUserPage(this.$route) && newVal) {
        this.switchUser(newVal)
      }
    },
    '$route.hash': function (newVal) {
      const oldTab = this.tab
      this.tab = newVal.replace(/^#/, '') || this.defaultTabKey
      this.onRouteChange(oldTab, this.tab)
    }
  },
  components: {
    FollowedTagCard,
    UserCard,
    Timeline,
    FollowerList,
    FriendList,
    FollowCard,
    TabSwitcher,
    Conversation,
    RichContent,
    FollowedTagList
  }
}

export default UserProfile
