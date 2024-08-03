import statusPoster from '../../services/status_poster/status_poster.service.js'
import MediaUpload from '../media_upload/media_upload.vue'
import ScopeSelector from '../scope_selector/scope_selector.vue'
import EmojiInput from '../emoji_input/emoji_input.vue'
import PollForm from '../poll/poll_form.vue'
import Attachment from '../attachment/attachment.vue'
import Gallery from 'src/components/gallery/gallery.vue'
import StatusContent from '../status_content/status_content.vue'
import fileTypeService from '../../services/file_type/file_type.service.js'
import { findOffset } from '../../services/offset_finder/offset_finder.service.js'
import { reject, map, uniqBy, debounce } from 'lodash'
import { usePostLanguageOptions } from 'src/lib/post_language'
import suggestor from '../emoji_input/suggestor.js'
import { mapGetters, mapState } from 'vuex'
import Checkbox from '../checkbox/checkbox.vue'
import Select from '../select/select.vue'


import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSmileBeam,
  faPollH,
  faUpload,
  faBan,
  faTimes,
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faSmileBeam,
  faPollH,
  faUpload,
  faBan,
  faTimes,
  faCircleNotch
)

const buildMentionsString = ({ user, attentions = [] }, currentUser) => {
  let allAttentions = [...attentions]

  allAttentions.unshift(user)

  allAttentions = uniqBy(allAttentions, 'id')
  allAttentions = reject(allAttentions, { id: currentUser.id })

  let mentions = map(allAttentions, (attention) => {
    return `@${attention.screen_name}`
  })

  return mentions.length > 0 ? mentions.join(' ') + ' ' : ''
}

// Converts a string with px to a number like '2px' -> 2
const pxStringToNumber = (str) => {
  return Number(str.substring(0, str.length - 2))
}

const deleteDraft = (draftKey) => {
	const draftData = JSON.parse(localStorage.getItem('drafts') || '{}');

	delete draftData[draftKey];

	localStorage.setItem('drafts', JSON.stringify(draftData));
}

const interfaceToISOLanguage = (ilang) => {
    const sep = ilang.indexOf("_");
    return sep < 0 ?
        ilang :
        ilang.substr(0, sep);
}

const PostStatusForm = {
  props: [
    'statusId',
    'statusText',
    'statusIsSensitive',
    'statusPoll',
    'statusFiles',
    'statusMediaDescriptions',
    'statusScope',
    'statusContentType',
    'statusLanguage',
    'replyTo',
    'quoteId',
    'repliedUser',
    'attentions',
    'copyMessageScope',
    'subject',
    'disableSubject',
    'disableScopeSelector',
    'disableVisibilitySelector',
    'disableNotice',
    'disableLockWarning',
    'disablePolls',
    'disableSensitivityCheckbox',
    'disableSubmit',
    'disablePreview',
    'placeholder',
    'maxHeight',
    'postHandler',
    'preserveFocus',
    'autoFocus',
    'fileLimit',
    'submitOnEnter',
    'emojiPickerPlacement',
    'optimisticPosting',
    'isRedraft'
  ],
  emits: [
    'posted',
    'resize',
    'mediaplay',
    'mediapause'
  ],
  components: {
    MediaUpload,
    EmojiInput,
    PollForm,
    ScopeSelector,
    Checkbox,
    Select,
    Attachment,
    StatusContent,
    Gallery
  },
  mounted () {
    this.updateIdempotencyKey()
    this.resize(this.$refs.textarea)

    if (this.replyTo || this.quoteId) {
      const textLength = this.$refs.textarea.value.length
      this.$refs.textarea.setSelectionRange(textLength, textLength)
    }

    if (this.replyTo || this.quoteId || this.autoFocus) {
      this.$refs.textarea.focus()
    }
  },
  setup() {
    const {postLanguageOptions} = usePostLanguageOptions()

    return {
      postLanguageOptions,
    }
  },
  data () {
    const preset = this.$route.query.message
    let statusText = preset || ''

    if (this.replyTo || this.quoteId) {
      const currentUser = this.$store.state.users.currentUser
      statusText = buildMentionsString({ user: this.repliedUser, attentions: this.attentions }, currentUser)
    }

    const { postContentType: contentType, postLanguage: defaultPostLanguage, sensitiveByDefault, sensitiveIfSubject, interfaceLanguage, alwaysShowSubjectInput } = this.$store.getters.mergedConfig
    const postLanguage = defaultPostLanguage || interfaceToISOLanguage(interfaceLanguage)

    let statusParams = {
      spoilerText: this.subject || '',
      status: statusText,
      sensitiveByDefault,
      nsfw: !!sensitiveByDefault,
      files: [],
      poll: {},
      mediaDescriptions: {},
      visibility: this.suggestedVisibility(),
      language: postLanguage,
      contentType
    }

    if (this.statusId || this.isRedraft) {
      const statusContentType = this.statusContentType || contentType
      statusParams = {
        spoilerText: this.subject || '',
        status: this.statusText || '',
        sensitiveIfSubject,
        nsfw: this.statusIsSensitive || (sensitiveIfSubject && this.subject) || !!sensitiveByDefault,
        files: this.statusFiles || [],
        poll: this.statusPoll || {},
        mediaDescriptions: this.statusMediaDescriptions || {},
        visibility: this.statusScope || this.suggestedVisibility(),
        language: this.statusLanguage || postLanguage,
        contentType: statusContentType
      }
    }

    if (!this.statusId) {
      let draftKey = 'status';
      if (this.replyTo) {
        draftKey = 'reply:' + this.replyTo;
      } else if (this.quoteId) {
        draftKey = 'quote:' + this.quoteId;
      }

      const draft = JSON.parse(localStorage.getItem('drafts') || '{}')[draftKey];

      if (draft) {
        statusParams = {
          spoilerText: draft.data.spoilerText,
          status: draft.data.status,
          sensitiveIfSubject,
          nsfw: draft.data.nsfw,
          files: draft.data.files,
          poll: draft.data.poll,
          mediaDescriptions: draft.data.mediaDescriptions,
          visibility: draft.data.visibility,
          language: draft.data.language,
          contentType: draft.data.contentType
        }

        if (draft.data.poll) {
          this.togglePollForm();
        }
      }
    }

    // When first loading the form, hide the subject (CW) field if it's disabled or doesn't have a starting value.
    // "disableSubject" seems to take priority over "alwaysShowSubjectInput".
    const showSubject = !this.disableSubject && (statusParams.spoilerText || alwaysShowSubjectInput)

    return {
      dropFiles: [],
      uploadingFiles: false,
      error: null,
      posting: false,
      highlighted: 0,
      newStatus: statusParams,
      caret: 0,
      pollFormVisible: false,
      showDropIcon: 'hide',
      dropStopTimeout: null,
      preview: null,
      previewLoading: false,
      emojiInputShown: false,
      idempotencyKey: '',
      activeEmojiInput: undefined,
      activeTextInput: undefined,
      subjectVisible: showSubject
    }
  },
  computed: {
    users () {
      return this.$store.state.users.users
    },
    userDefaultScope () {
      return this.$store.state.users.currentUser.default_scope
    },
    emojiUserSuggestor () {
      return suggestor({
        emoji: [
          ...this.$store.state.instance.emoji,
          ...this.$store.state.instance.customEmoji
        ],
        store: this.$store
      })
    },
    emojiSuggestor () {
      return suggestor({
        emoji: [
          ...this.$store.state.instance.emoji,
          ...this.$store.state.instance.customEmoji
        ]
      })
    },
    emoji () {
      return this.$store.state.instance.emoji || []
    },
    customEmoji () {
      return this.$store.state.instance.customEmoji || []
    },
    statusLength () {
      return this.newStatus.status.length
    },
    spoilerTextLength () {
      return this.newStatus.spoilerText.length
    },
    statusLengthLimit () {
      return this.$store.state.instance.textlimit
    },
    hasStatusLengthLimit () {
      return this.statusLengthLimit > 0
    },
    charactersLeft () {
      return this.statusLengthLimit - (this.statusLength + this.spoilerTextLength)
    },
    isOverLengthLimit () {
      return this.hasStatusLengthLimit && (this.charactersLeft < 0)
    },
    alwaysShowSubject () {
      return this.mergedConfig.alwaysShowSubjectInput
    },
    postFormats () {
      return this.$store.state.instance.postFormats || []
    },
    safeDMEnabled () {
      return this.$store.state.instance.safeDM
    },
    pollsAvailable () {
      return this.$store.state.instance.pollsAvailable &&
        this.$store.state.instance.pollLimits.max_options >= 2 &&
        this.disablePolls !== true
    },
    hideScopeNotice () {
      return this.disableNotice || this.$store.getters.mergedConfig.hideScopeNotice
    },
    pollContentError () {
      return this.pollFormVisible &&
        this.newStatus.poll &&
        this.newStatus.poll.error
    },
    showPreview () {
      return !this.disablePreview && (!!this.preview || this.previewLoading)
    },
    emptyStatus () {
      return this.newStatus.status.trim() === '' && this.newStatus.files.length === 0
    },
    uploadFileLimitReached () {
      return this.newStatus.files.length >= this.fileLimit
    },
    isEdit () {
      return typeof this.statusId !== 'undefined' && this.statusId.trim() !== '' && !this.isRedraft
    },
    ...mapGetters(['mergedConfig']),
    ...mapState({
      mobileLayout: state => state.interface.mobileLayout
    }),
  },
  watch: {
    'newStatus': {
      deep: true,
      handler () {
        this.statusChanged()
      }
    }
  },
  methods: {
    statusChanged () {
      this.autoPreview()
      this.updateIdempotencyKey()
      this.saveDraft()
    },
    clearStatus () {
      const newStatus = this.newStatus
      this.newStatus = {
        status: '',
        spoilerText: '',
        files: [],
        visibility: newStatus.visibility,
        contentType: newStatus.contentType,
        language: newStatus.language,
        poll: {},
        mediaDescriptions: {}
      }
      this.pollFormVisible = false
      this.$refs.mediaUpload && this.$refs.mediaUpload.clearFile()
      this.clearPollForm()
      if (this.preserveFocus) {
        this.$nextTick(() => {
          this.$refs.textarea.focus()
        })
      }
      let el = this.$el.querySelector('textarea')
      el.style.height = 'auto'
      el.style.height = undefined
      this.error = null
      if (this.preview) this.previewStatus()
    },
    async postStatus (event, newStatus, opts = {}) {
      if (this.posting && !this.optimisticPosting) { return }
      if (this.disableSubmit) { return }
      if (this.emojiInputShown) { return }
      if (this.submitOnEnter) {
        event.stopPropagation()
        event.preventDefault()
      }

      if (this.optimisticPosting && (this.emptyStatus || this.isOverLengthLimit)) { return }

      if (this.emptyStatus) {
        this.error = this.$t('post_status.empty_status_error')
        return
      }

      const poll = this.pollFormVisible ? this.newStatus.poll : {}
      if (this.pollContentError) {
        this.error = this.pollContentError
        return
      }

      this.posting = true

      try {
        await this.setAllMediaDescriptions()
      } catch (e) {
        this.error = this.$t('post_status.media_description_error')
        this.posting = false
        return
      }

      const postingOptions = {
        status: newStatus.status,
        spoilerText: newStatus.spoilerText || null,
        visibility: newStatus.visibility,
        sensitive: newStatus.nsfw,
        media: newStatus.files,
        store: this.$store,
        inReplyToStatusId: this.replyTo,
        quoteId: this.quoteId,
        contentType: newStatus.contentType,
        language: newStatus.language,
        poll,
        idempotencyKey: this.idempotencyKey
      }

      const postHandler = this.postHandler ? this.postHandler : statusPoster.postStatus

      postHandler(postingOptions).then((data) => {
        if (!data.error) {
          this.clearStatus()
          this.$emit('posted', data)
        } else {
          this.error = data.error
        }
        this.posting = false
      })
    },
    previewStatus () {
      if (this.emptyStatus && this.newStatus.spoilerText.trim() === '') {
        this.preview = { error: this.$t('post_status.preview_empty') }
        this.previewLoading = false
        return
      }
      const newStatus = this.newStatus
      this.previewLoading = true
      statusPoster.postStatus({
        status: newStatus.status,
        spoilerText: newStatus.spoilerText || null,
        visibility: newStatus.visibility,
        sensitive: newStatus.nsfw,
        media: [],
        store: this.$store,
        inReplyToStatusId: this.replyTo,
        quoteId: this.quoteId,
        contentType: newStatus.contentType,
        language: newStatus.language,
        poll: {},
        preview: true
      }).then((data) => {
        // Don't apply preview if not loading, because it means
        // user has closed the preview manually.
        if (!this.previewLoading) return
        if (!data.error) {
          this.preview = data
        } else {
          this.preview = { error: data.error }
        }
      }).catch((error) => {
        this.preview = { error }
      }).finally(() => {
        this.previewLoading = false
      })

      let draftKey = 'status';
      if (this.replyTo) {
        draftKey = 'reply:' + this.replyTo;
      } else if (this.quoteId) {
        draftKey = 'quote:' + this.quoteId;
      }
      deleteDraft(draftKey)
    },
    debouncePreviewStatus: debounce(function () { this.previewStatus() }, 500),
    saveDraft() {
      const draftData = JSON.parse(localStorage.getItem('drafts') || '{}');

      let draftKey = 'status';
      if (this.replyTo) {
        draftKey = 'reply:' + this.replyTo;
      } else if (this.quoteId) {
        draftKey = 'quote:' + this.quoteId;
      }

      if (this.newStatus.status || this.newStatus.spoilerText || this.newStatus.files.length > 0 || this.newStatus.poll.length > 0) {
          draftData[draftKey] = {
          updatedAt: new Date(),
          data: this.newStatus,
        };

        localStorage.setItem('drafts', JSON.stringify(draftData));

      } else {
        deleteDraft(draftKey);
      }
    },
    autoPreview () {
      if (!this.preview) return
      this.previewLoading = true
      this.debouncePreviewStatus()
    },
    closePreview () {
      this.preview = null
      this.previewLoading = false
    },
    togglePreview () {
      if (this.showPreview) {
        this.closePreview()
      } else {
        this.previewStatus()
      }
    },
    addMediaFile (fileInfo) {
      this.newStatus.files.push(fileInfo)

      if (this.$store.getters.mergedConfig.sensitiveIfSubject && this.newStatus.spoilerText !== '') {
        this.newStatus.nsfw = true
      }
      this.$emit('resize', { delayed: true })
    },
    removeMediaFile (fileInfo) {
      let index = this.newStatus.files.indexOf(fileInfo)
      this.newStatus.files.splice(index, 1)
      this.$emit('resize')
    },
    editAttachment (fileInfo, newText) {
      this.newStatus.mediaDescriptions[fileInfo.id] = newText
    },
    shiftUpMediaFile (fileInfo) {
      const { files } = this.newStatus
      const index = this.newStatus.files.indexOf(fileInfo)
      files.splice(index, 1)
      files.splice(index - 1, 0, fileInfo)
    },
    shiftDnMediaFile (fileInfo) {
      const { files } = this.newStatus
      const index = this.newStatus.files.indexOf(fileInfo)
      files.splice(index, 1)
      files.splice(index + 1, 0, fileInfo)
    },
    uploadFailed (errString, templateArgs) {
      templateArgs = templateArgs || {}
      this.error = this.$t('upload.error.base') + ' ' + this.$t('upload.error.' + errString, templateArgs)
    },
    startedUploadingFiles () {
      this.uploadingFiles = true
    },
    finishedUploadingFiles () {
      this.$emit('resize')
      this.uploadingFiles = false
    },
    type (fileInfo) {
      return fileTypeService.fileType(fileInfo.mimetype)
    },
    paste (e) {
      this.autoPreview()
      this.resize(e)
      if (e.clipboardData.files.length > 0) {
        // prevent pasting of file as text
        e.preventDefault()
        // Strangely, files property gets emptied after event propagation
        // Trying to wrap it in array doesn't work. Plus I doubt it's possible
        // to hold more than one file in clipboard.
        this.dropFiles = [e.clipboardData.files[0]]
      }
    },
    fileDrop (e) {
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        e.preventDefault() // allow dropping text like before
        this.dropFiles = e.dataTransfer.files
        clearTimeout(this.dropStopTimeout)
        this.showDropIcon = 'hide'
      }
    },
    fileDragStop (e) {
      // The false-setting is done with delay because just using leave-events
      // directly caused unwanted flickering, this is not perfect either but
      // much less noticable.
      clearTimeout(this.dropStopTimeout)
      this.showDropIcon = 'fade'
      this.dropStopTimeout = setTimeout(() => (this.showDropIcon = 'hide'), 500)
    },
    fileDrag (e) {
      e.dataTransfer.dropEffect = this.uploadFileLimitReached ? 'none' : 'copy'
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        clearTimeout(this.dropStopTimeout)
        this.showDropIcon = 'show'
      }
    },
    onEmojiInputInput (e) {
      this.$nextTick(() => {
        this.resize(this.$refs['textarea'])
      })
    },
    onSubjectInput (e) {
      if (this.$store.getters.mergedConfig.sensitiveIfSubject) {
        this.newStatus.nsfw = true
      }
    },
    resize (e) {
      const target = e.target || e
      if (!(target instanceof window.Element)) { return }

      // Reset to default height for empty form, nothing else to do here.
      if (target.value === '') {
        target.style.height = null
        this.$emit('resize')
        this.$refs['emoji-input'].resize()
        return
      }

      const formRef = this.$refs['form']
      const bottomRef = this.$refs['bottom']
      /* Scroller is either `window` (replies in TL), sidebar (main post form,
       * replies in notifs) or mobile post form. Note that getting and setting
       * scroll is different for `Window` and `Element`s
       */
      const bottomBottomPaddingStr = window.getComputedStyle(bottomRef)['padding-bottom']
      const bottomBottomPadding = pxStringToNumber(bottomBottomPaddingStr)

      const scrollerRef = this.$el.closest('.column.-scrollable') ||
            this.$el.closest('.post-form-modal-view') ||
            window

      // Getting info about padding we have to account for, removing 'px' part
      const topPaddingStr = window.getComputedStyle(target)['padding-top']
      const bottomPaddingStr = window.getComputedStyle(target)['padding-bottom']
      const topPadding = pxStringToNumber(topPaddingStr)
      const bottomPadding = pxStringToNumber(bottomPaddingStr)
      const vertPadding = topPadding + bottomPadding

      const oldHeight = pxStringToNumber(target.style.height)

      /* Explanation:
       *
       * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
       * scrollHeight returns element's scrollable content height, i.e. visible
       * element + overscrolled parts of it. We use it to determine when text
       * inside the textarea exceeded its height, so we can set height to prevent
       * overscroll, i.e. make textarea grow with the text. HOWEVER, since we
       * explicitly set new height, scrollHeight won't go below that, so we can't
       * SHRINK the textarea when there's extra space. To workaround that we set
       * height to 'auto' which makes textarea tiny again, so that scrollHeight
       * will match text height again. HOWEVER, shrinking textarea can screw with
       * the scroll since there might be not enough padding around form-bottom to even
       * warrant a scroll, so it will jump to 0 and refuse to move anywhere,
       * so we check current scroll position before shrinking and then restore it
       * with needed delta.
       */

      // this part has to be BEFORE the content size update
      const currentScroll = scrollerRef === window
        ? scrollerRef.scrollY
        : scrollerRef.scrollTop
      const scrollerHeight = scrollerRef === window
        ? scrollerRef.innerHeight
        : scrollerRef.offsetHeight
      const scrollerBottomBorder = currentScroll + scrollerHeight

      // BEGIN content size update
      target.style.height = 'auto'
      const heightWithoutPadding = Math.floor(target.scrollHeight - vertPadding)
      let newHeight = this.maxHeight ? Math.min(heightWithoutPadding, this.maxHeight) : heightWithoutPadding
      // This is a bit of a hack to combat target.scrollHeight being different on every other input
      // on some browsers for whatever reason. Don't change the height if difference is 1px or less.
      if (Math.abs(newHeight - oldHeight) <= 1) {
        newHeight = oldHeight
      }
      target.style.height = `${newHeight}px`
      this.$emit('resize', newHeight)
      // END content size update

      // We check where the bottom border of form-bottom element is, this uses findOffset
      // to find offset relative to scrollable container (scroller)
      const bottomBottomBorder = bottomRef.offsetHeight + findOffset(bottomRef, scrollerRef).top + bottomBottomPadding

      const isBottomObstructed = scrollerBottomBorder < bottomBottomBorder
      const isFormBiggerThanScroller = scrollerHeight < formRef.offsetHeight
      const bottomChangeDelta = bottomBottomBorder - scrollerBottomBorder
      // The intention is basically this;
      // Keep form-bottom always visible so that submit button is in view EXCEPT
      // if form element bigger than scroller and caret isn't at the end, so that
      // if you scroll up and edit middle of text you won't get scrolled back to bottom
      const shouldScrollToBottom = isBottomObstructed &&
            !(isFormBiggerThanScroller &&
              this.$refs.textarea.selectionStart !== this.$refs.textarea.value.length)
      const totalDelta = shouldScrollToBottom ? bottomChangeDelta : 0
      const targetScroll = Math.round(currentScroll + totalDelta)

      if (scrollerRef === window) {
        scrollerRef.scroll(0, targetScroll)
      } else {
        scrollerRef.scrollTop = targetScroll
      }

      this.$refs['emoji-input'].resize()
    },
    showEmojiPicker () {
      if (!this.activeEmojiInput || !this.activeTextInput)
        this.focusStatusInput()

      this.$refs[this.activeTextInput].focus()
      this.$refs[this.activeEmojiInput].triggerShowPicker()
    },
    focusStatusInput() {
      this.activeEmojiInput = 'emoji-input'
      this.activeTextInput = 'textarea'
    },
    focusSubjectInput() {
      this.activeEmojiInput = 'subject-emoji-input'
      this.activeTextInput = 'subject-input'
    },
    toggleSubjectVisible() {
      // If hiding CW, then we need to clear the subject and reset focus
      if (this.subjectVisible)
      {
        this.focusStatusInput()

        // "nsfw" property is normally set by the @change listener, but this bypasses it.
        // We need to clear it manually instead.
        this.newStatus.spoilerText = ''
        this.newStatus.nsfw = false
      }

      this.subjectVisible = !this.subjectVisible
    },
    clearError () {
      this.error = null
    },
    changeVis (visibility) {
      this.newStatus.visibility = visibility
    },
    togglePollForm () {
      this.pollFormVisible = !this.pollFormVisible
    },
    setPoll (poll) {
      this.newStatus.poll = poll
    },
    clearPollForm () {
      if (this.$refs.pollForm) {
        this.$refs.pollForm.clear()
      }
    },
    dismissScopeNotice () {
      this.$store.dispatch('setOption', { name: 'hideScopeNotice', value: true })
    },
    setMediaDescription (id) {
      const description = this.newStatus.mediaDescriptions[id]
      if (!description || description.trim() === '') return
      return statusPoster.setMediaDescription({ store: this.$store, id, description })
    },
    setAllMediaDescriptions () {
      const ids = this.newStatus.files.map(file => file.id)
      return Promise.all(ids.map(id => this.setMediaDescription(id)))
    },
    handleEmojiInputShow (value) {
      this.emojiInputShown = value
    },
    updateIdempotencyKey () {
      this.idempotencyKey = Date.now().toString()
    },
    openProfileTab () {
      this.$store.dispatch('openSettingsModalTab', 'profile')
    },
    suggestedVisibility () {
      if (this.copyMessageScope) {
        if (this.copyMessageScope === 'direct') {
          return this.copyMessageScope
        }
        if (this.copyMessageScope !== 'public' && this.$store.state.users.currentUser.default_scope !== 'private') {
          return this.copyMessageScope
        }
      }
      return this.$store.state.users.currentUser.default_scope
    }
  }
}

export default PostStatusForm
