import PublicTimeline from 'components/public_timeline/public_timeline.vue'
import PublicAndExternalTimeline from 'components/public_and_external_timeline/public_and_external_timeline.vue'
import FriendsTimeline from 'components/friends_timeline/friends_timeline.vue'
import TagTimeline from 'components/tag_timeline/tag_timeline.vue'
import BubbleTimeline from 'components/bubble_timeline/bubble_timeline.vue'
import BookmarkTimeline from 'components/bookmark_timeline/bookmark_timeline.vue'
import ConversationPage from 'components/conversation-page/conversation-page.vue'
import Interactions from 'components/interactions/interactions.vue'
import DMs from 'components/dm_timeline/dm_timeline.vue'
import UserProfile from 'components/user_profile/user_profile.vue'
import Search from 'components/search/search.vue'
import Registration from 'components/registration/registration.vue'
import PasswordReset from 'components/password_reset/password_reset.vue'
import FollowRequests from 'components/follow_requests/follow_requests.vue'
import OAuthCallback from 'components/oauth_callback/oauth_callback.vue'
import Notifications from 'components/notifications/notifications.vue'
import AuthForm from 'components/auth_form/auth_form.js'
import WhoToFollow from 'components/who_to_follow/who_to_follow.vue'
import About from 'components/about/about.vue'
import RemoteUserResolver from 'components/remote_user_resolver/remote_user_resolver.vue'
import Lists from 'components/lists/lists.vue'
import ListTimeline from 'components/list_timeline/list_timeline.vue'
import ListEdit from 'components/list_edit/list_edit.vue'
import AnnouncementsPage from 'components/announcements_page/announcements_page.vue'
import RegistrationRequestSent from 'components/registration_request_sent/registration_request_sent.vue'
import AwaitingEmailConfirmation from 'components/awaiting_email_confirmation/awaiting_email_confirmation.vue'

export default (store) => {
  const validateAuthenticatedRoute = (to, from, next) => {
    if (store.state.users.currentUser) {
      next()
    } else {
      next(store.state.instance.redirectRootNoLogin || '/main/all')
    }
  }

  let routes = [
    { name: 'root',
      path: '/',
      redirect: _to => {
        return (store.state.users.currentUser
          ? store.state.instance.redirectRootLogin
          : store.state.instance.redirectRootNoLogin) || '/main/all'
      }
    },
    { name: 'public-external-timeline', path: '/main/all', component: PublicAndExternalTimeline },
    { name: 'public-timeline', path: '/main/public', component: PublicTimeline },
    { name: 'bubble-timeline', path: '/main/bubble', component: BubbleTimeline },
    { name: 'friends', path: '/main/friends', component: FriendsTimeline, beforeEnter: validateAuthenticatedRoute },
    { name: 'tag-timeline', path: '/tag/:tag', component: TagTimeline },
    { name: 'bookmarks', path: '/bookmarks', component: BookmarkTimeline },
    { name: 'conversation', path: '/notice/:id', component: ConversationPage, meta: { dontScroll: true } },
    { name: 'remote-user-profile-acct',
      path: '/remote-users/:_(@)?:username([^/@]+)@:hostname([^/@]+)',
      component: RemoteUserResolver,
      beforeEnter: validateAuthenticatedRoute
    },
    { name: 'remote-user-profile',
      path: '/remote-users/:hostname/:username',
      component: RemoteUserResolver,
      beforeEnter: validateAuthenticatedRoute
    },
    { name: 'external-user-profile', path: '/users/:id', component: UserProfile, meta: { dontScroll: true } },
    { name: 'interactions', path: '/users/:username/interactions', component: Interactions, beforeEnter: validateAuthenticatedRoute },
    { name: 'dms', path: '/users/:username/dms', component: DMs, beforeEnter: validateAuthenticatedRoute },
    { name: 'registration', path: '/registration', component: Registration },
    { name: 'registration-request-sent', path: '/registration-request-sent', component: RegistrationRequestSent },
    { name: 'awaiting-email-confirmation', path: '/awaiting-email-confirmation', component: AwaitingEmailConfirmation },
    { name: 'password-reset', path: '/password-reset', component: PasswordReset, props: true },
    { name: 'registration-token', path: '/registration/:token', component: Registration },
    { name: 'friend-requests', path: '/friend-requests', component: FollowRequests, beforeEnter: validateAuthenticatedRoute },
    { name: 'notifications', path: '/:username/notifications', component: Notifications, props: () => ({ disableTeleport: true }), beforeEnter: validateAuthenticatedRoute },
    { name: 'login', path: '/login', component: AuthForm },
    { name: 'oauth-callback', path: '/oauth-callback', component: OAuthCallback, props: (route) => ({ code: route.query.code }) },
    { name: 'search', path: '/search', component: Search, props: (route) => ({ query: route.query.query }) },
    { name: 'who-to-follow', path: '/who-to-follow', component: WhoToFollow, beforeEnter: validateAuthenticatedRoute },
    { name: 'about', path: '/about', component: About },
    { name: 'lists', path: '/lists', component: Lists },
    { name: 'list-timeline', path: '/lists/:id', component: ListTimeline },
    { name: 'list-edit', path: '/lists/:id/edit', component: ListEdit },
    { name: 'announcements', path: '/announcements', component: AnnouncementsPage },
    { name: 'user-profile', path: '/:_(users)?/:name', component: UserProfile, meta: { dontScroll: true } }
  ]

  return routes
}
