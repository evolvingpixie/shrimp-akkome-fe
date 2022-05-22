import _ from 'lodash'
import { WSConnectionStatus } from '../../services/api/api.service.js'
import { mapGetters, mapState } from 'vuex'
import ChatMessage from '../chat_message/chat_message.vue'
import PostStatusForm from '../post_status_form/post_status_form.vue'
import ChatTitle from '../chat_title/chat_title.vue'
import chatService from '../../services/chat_service/chat_service.js'
import { promiseInterval } from '../../services/promise_interval/promise_interval.js'
import { getScrollPosition, getNewTopPosition, isBottomedOut, isScrollable } from './chat_layout_utils.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronDown,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'
import { buildFakeMessage } from '../../services/chat_utils/chat_utils.js'

library.add(
  faChevronDown,
  faChevronLeft
)

const BOTTOMED_OUT_OFFSET = 10
const JUMP_TO_BOTTOM_BUTTON_VISIBILITY_OFFSET = 10
const SAFE_RESIZE_TIME_OFFSET = 100
const MARK_AS_READ_DELAY = 1500
const MAX_RETRIES = 10

const Chat = {
  components: {
    ChatMessage,
    ChatTitle,
    PostStatusForm
  },
  data () {
    return {
      jumpToBottomButtonVisible: false,
      hoveredMessageChainId: undefined,
      lastScrollPosition: {},
      scrollableContainerHeight: '100%',
      errorLoadingChat: false,
      messageRetriers: {}
    }
  },
  created () {
    this.startFetching()
    window.addEventListener('resize', this.handleResize)
  },
  mounted () {
    window.addEventListener('scroll', this.handleScroll)
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange, false)
    }

    this.$nextTick(() => {
      this.handleResize()
    })
  },
  unmounted () {
    window.removeEventListener('scroll', this.handleScroll)
    if (typeof document.hidden !== 'undefined') document.removeEventListener('visibilitychange', this.handleVisibilityChange, false)
    this.$store.dispatch('clearCurrentChat')
  },
  computed: {
    recipient () {
      return this.currentChat && this.currentChat.account
    },
    recipientId () {
      return this.$route.params.recipient_id
    },
    formPlaceholder () {
      if (this.recipient) {
        return this.$t('chats.message_user', { nickname: this.recipient.screen_name_ui })
      } else {
        return ''
      }
    },
    chatViewItems () {
      return chatService.getView(this.currentChatMessageService)
    },
    newMessageCount () {
      return this.currentChatMessageService && this.currentChatMessageService.newMessageCount
    },
    streamingEnabled () {
      return this.mergedConfig.useStreamingApi && this.mastoUserSocketStatus === WSConnectionStatus.JOINED
    },
    ...mapGetters([
      'currentChat',
      'currentChatMessageService',
      'findOpenedChatByRecipientId',
      'mergedConfig'
    ]),
    ...mapState({
      backendInteractor: state => state.api.backendInteractor,
      mastoUserSocketStatus: state => state.api.mastoUserSocketStatus,
      mobileLayout: state => state.interface.layoutType === 'mobile',
      currentUser: state => state.users.currentUser
    })
  },
  watch: {
    chatViewItems () {
      // We don't want to scroll to the bottom on a new message when the user is viewing older messages.
      // Therefore we need to know whether the scroll position was at the bottom before the DOM update.
      const bottomedOutBeforeUpdate = this.bottomedOut(BOTTOMED_OUT_OFFSET)
      this.$nextTick(() => {
        if (bottomedOutBeforeUpdate) {
          this.scrollDown()
        }
      })
    },
    '$route': function () {
      this.startFetching()
    },
    mastoUserSocketStatus (newValue) {
      if (newValue === WSConnectionStatus.JOINED) {
        this.fetchChat({ isFirstFetch: true })
      }
    }
  },
  methods: {
    // Used to animate the avatar near the first message of the message chain when any message belonging to the chain is hovered
    onMessageHover ({ isHovered, messageChainId }) {
      this.hoveredMessageChainId = isHovered ? messageChainId : undefined
    },
    onFilesDropped () {
      this.$nextTick(() => {
        this.handleResize()
      })
    },
    handleVisibilityChange () {
      this.$nextTick(() => {
        if (!document.hidden && this.bottomedOut(BOTTOMED_OUT_OFFSET)) {
          this.scrollDown({ forceRead: true })
        }
      })
    },
    // "Sticks" scroll to bottom instead of top, helps with OSK resizing the viewport
    handleResize (opts = {}) {
      const { expand = false, delayed = false } = opts

      if (delayed) {
        setTimeout(() => {
          this.handleResize({ ...opts, delayed: false })
        }, SAFE_RESIZE_TIME_OFFSET)
        return
      }

      this.$nextTick(() => {
        const { offsetHeight = undefined } = getScrollPosition()
        const diff = this.lastScrollPosition.offsetHeight - offsetHeight
        if (diff !== 0 || (!this.bottomedOut() && expand)) {
          this.$nextTick(() => {
            window.scrollTo({ top: window.scrollY + diff })
          })
        }
        this.lastScrollPosition = getScrollPosition()
      })
    },
    scrollDown (options = {}) {
      const { behavior = 'auto', forceRead = false } = options
      this.$nextTick(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior })
      })
      if (forceRead) {
        this.readChat()
      }
    },
    readChat () {
      if (!(this.currentChatMessageService && this.currentChatMessageService.maxId)) { return }
      if (document.hidden) { return }
      const lastReadId = this.currentChatMessageService.maxId
      this.$store.dispatch('readChat', {
        id: this.currentChat.id,
        lastReadId
      })
    },
    bottomedOut (offset) {
      return isBottomedOut(offset)
    },
    reachedTop () {
      return window.scrollY <= 0
    },
    cullOlderCheck () {
      window.setTimeout(() => {
        if (this.bottomedOut(JUMP_TO_BOTTOM_BUTTON_VISIBILITY_OFFSET)) {
          this.$store.dispatch('cullOlderMessages', this.currentChatMessageService.chatId)
        }
      }, 5000)
    },
    handleScroll: _.throttle(function () {
      if (!this.currentChat) { return }

      if (this.reachedTop()) {
        this.fetchChat({ maxId: this.currentChatMessageService.minId })
      } else if (this.bottomedOut(JUMP_TO_BOTTOM_BUTTON_VISIBILITY_OFFSET)) {
        this.jumpToBottomButtonVisible = false
        this.cullOlderCheck()
        if (this.newMessageCount > 0) {
          // Use a delay before marking as read to prevent situation where new messages
          // arrive just as you're leaving the view and messages that you didn't actually
          // get to see get marked as read.
          window.setTimeout(() => {
            // Don't mark as read if the element doesn't exist, user has left chat view
            if (this.$el) this.readChat()
          }, MARK_AS_READ_DELAY)
        }
      } else {
        this.jumpToBottomButtonVisible = true
      }
    }, 200),
    handleScrollUp (positionBeforeLoading) {
      const positionAfterLoading = getScrollPosition()
      window.scrollTo({
        top: getNewTopPosition(positionBeforeLoading, positionAfterLoading)
      })
    },
    fetchChat ({ isFirstFetch = false, fetchLatest = false, maxId }) {
      const chatMessageService = this.currentChatMessageService
      if (!chatMessageService) { return }
      if (fetchLatest && this.streamingEnabled) { return }

      const chatId = chatMessageService.chatId
      const fetchOlderMessages = !!maxId
      const sinceId = fetchLatest && chatMessageService.maxId

      return this.backendInteractor.chatMessages({ id: chatId, maxId, sinceId })
        .then((messages) => {
          // Clear the current chat in case we're recovering from a ws connection loss.
          if (isFirstFetch) {
            chatService.clear(chatMessageService)
          }

          const positionBeforeUpdate = getScrollPosition()
          this.$store.dispatch('addChatMessages', { chatId, messages }).then(() => {
            this.$nextTick(() => {
              if (fetchOlderMessages) {
                this.handleScrollUp(positionBeforeUpdate)
              }

              // In vertical screens, the first batch of fetched messages may not always take the
              // full height of the scrollable container.
              // If this is the case, we want to fetch the messages until the scrollable container
              // is fully populated so that the user has the ability to scroll up and load the history.
              if (!isScrollable() && messages.length > 0) {
                this.fetchChat({ maxId: this.currentChatMessageService.minId })
              }
            })
          })
        })
    },
    async startFetching () {
      let chat = this.findOpenedChatByRecipientId(this.recipientId)
      if (!chat) {
        try {
          chat = await this.backendInteractor.getOrCreateChat({ accountId: this.recipientId })
        } catch (e) {
          console.error('Error creating or getting a chat', e)
          this.errorLoadingChat = true
        }
      }
      if (chat) {
        this.$nextTick(() => {
          this.scrollDown({ forceRead: true })
        })
        this.$store.dispatch('addOpenedChat', { chat })
        this.doStartFetching()
      }
    },
    doStartFetching () {
      this.$store.dispatch('startFetchingCurrentChat', {
        fetcher: () => promiseInterval(() => this.fetchChat({ fetchLatest: true }), 5000)
      })
      this.fetchChat({ isFirstFetch: true })
    },
    handleAttachmentPosting () {
      this.$nextTick(() => {
        this.handleResize()
        // When the posting form size changes because of a media attachment, we need an extra resize
        // to account for the potential delay in the DOM update.
        this.scrollDown({ forceRead: true })
      })
    },
    sendMessage ({ status, media, idempotencyKey }) {
      const params = {
        id: this.currentChat.id,
        content: status,
        idempotencyKey
      }

      if (media[0]) {
        params.mediaId = media[0].id
      }

      const fakeMessage = buildFakeMessage({
        attachments: media,
        chatId: this.currentChat.id,
        content: status,
        userId: this.currentUser.id,
        idempotencyKey
      })

      this.$store.dispatch('addChatMessages', {
        chatId: this.currentChat.id,
        messages: [fakeMessage]
      }).then(() => {
        this.handleAttachmentPosting()
      })

      return this.doSendMessage({ params, fakeMessage, retriesLeft: MAX_RETRIES })
    },
    doSendMessage ({ params, fakeMessage, retriesLeft = MAX_RETRIES }) {
      if (retriesLeft <= 0) return

      this.backendInteractor.sendChatMessage(params)
        .then(data => {
          this.$store.dispatch('addChatMessages', {
            chatId: this.currentChat.id,
            updateMaxId: false,
            messages: [{ ...data, fakeId: fakeMessage.id }]
          })

          return data
        })
        .catch(error => {
          console.error('Error sending message', error)
          this.$store.dispatch('handleMessageError', {
            chatId: this.currentChat.id,
            fakeId: fakeMessage.id,
            isRetry: retriesLeft !== MAX_RETRIES
          })
          if ((error.statusCode >= 500 && error.statusCode < 600) || error.message === 'Failed to fetch') {
            this.messageRetriers[fakeMessage.id] = setTimeout(() => {
              this.doSendMessage({ params, fakeMessage, retriesLeft: retriesLeft - 1 })
            }, 1000 * (2 ** (MAX_RETRIES - retriesLeft)))
          }
          return {}
        })

      return Promise.resolve(fakeMessage)
    },
    goBack () {
      this.$router.push({ name: 'chats', params: { username: this.currentUser.screen_name } })
    }
  }
}

export default Chat
