import escape from 'escape-html'
import parseLinkHeader from 'parse-link-header'
import { isStatusNotification } from '../notification_utils/notification_utils.js'
import punycode from 'punycode.js'

/** NOTICE! **
 * Do not initialize UI-generated data here.
 * It will override existing data.
 *
 * i.e. user.pinnedStatusIds was set to [] here
 * UI code would update it with data but upon next user fetch
 * it would be reverted back to []
 */

const qvitterStatusType = (status) => {
  if (status.is_post_verb) {
    return 'status'
  }

  if (status.retweeted_status) {
    return 'retweet'
  }

  if ((typeof status.uri === 'string' && status.uri.match(/(fave|objectType=Favourite)/)) ||
      (typeof status.text === 'string' && status.text.match(/favorited/))) {
    return 'favorite'
  }

  if (status.text.match(/deleted notice {{tag/) || status.qvitter_delete_notice) {
    return 'deletion'
  }

  if (status.text.match(/started following/) || status.activity_type === 'follow') {
    return 'follow'
  }

  return 'unknown'
}

export const parseUser = (data) => {
  const output = {}
  const masto = data.hasOwnProperty('acct')
  // case for users in "mentions" property for statuses in MastoAPI
  const mastoShort = masto && !data.hasOwnProperty('avatar')

  output.id = String(data.id)
  output._original = data // used for server-side settings

  if (masto) {
    output.screen_name = data.acct
    output.statusnet_profile_url = data.url

    // There's nothing else to get
    if (mastoShort) {
      return output
    }

    output.emoji = data.emojis
    output.name = escape(data.display_name)
    output.name_html = output.name
    output.name_unescaped = data.display_name

    output.description = data.note
    // TODO cleanup this shit, output.description is overriden with source data
    output.description_html = data.note

    output.fields = data.fields
    output.fields_html = data.fields.map(field => {
      return {
        name: escape(field.name),
        value: field.value,
        verified_at: field.verified_at
      }
    })
    output.fields_text = data.fields.map(field => {
      return {
        name: unescape(field.name.replace(/<[^>]*>/g, '')),
        value: unescape(field.value.replace(/<[^>]*>/g, '')),
        verified_at: field.verified_at
      }
    })

    // Utilize avatar_static for gif avatars?
    output.profile_image_url = data.avatar
    output.profile_image_url_original = data.avatar

    // Same, utilize header_static?
    output.cover_photo = data.header

    output.friends_count = data.following_count

    output.bot = data.bot
    output.accepts_direct_messages_from = data.accepts_direct_messages_from
    output.follow_requests_count = data.follow_requests_count
    if (data.akkoma) {
      output.instance = data.akkoma.instance
      output.status_ttl_days = data.akkoma.status_ttl_days
      output.permit_followback = data.akkoma.permit_followback
    }

    if (data.pleroma) {
      const relationship = data.pleroma.relationship

      output.background_image = data.pleroma.background_image
      output.favicon = data.pleroma.favicon

      if (relationship) {
        output.relationship = relationship
      }

      output.allow_following_move = data.pleroma.allow_following_move

      output.hide_follows = data.pleroma.hide_follows
      output.hide_followers = data.pleroma.hide_followers
      output.hide_follows_count = data.pleroma.hide_follows_count
      output.hide_followers_count = data.pleroma.hide_followers_count

      output.rights = {
        moderator: data.pleroma.is_moderator,
        admin: data.pleroma.is_admin
      }
      // TODO: Clean up in UI? This is duplication from what BE does for qvitterapi
      if (output.rights.admin) {
        output.role = 'admin'
      } else if (output.rights.moderator) {
        output.role = 'moderator'
      } else {
        output.role = 'member'
      }
    } else {
      output.relationship = {
        muting: [],
        blocking: [],
        followed_by: [],
        following: []
      }

      output.rights = {
        moderator: false,
        admin: false
      }

      // todo: find a better way to map masto roles to akkoma roles
      const roles = data.roles
      if (roles) {
        if (!roles[0]) {
          output.role = 'member'
        } else if (roles[0].id === "1") {
          output.role = 'moderator'
          output.rights.moderator = true
        } else if (roles[0].id === "2" || roles[0].id === "3") {
          output.role = 'admin'
          output.rights.admin = true
        } else {
          output.role = 'member'
        }
      }
    }

    if (data.source) {
      output.description = data.source.note
      output.default_scope = data.source.privacy
      output.fields = data.source.fields
      if (data.source.pleroma) {
        output.no_rich_text = data.source.pleroma.no_rich_text
        output.show_role = data.source.pleroma.show_role
        output.discoverable = data.source.pleroma.discoverable
      }
    }

    // TODO: handle is_local
    output.is_local = !output.screen_name.includes('@')
  } else {
    output.screen_name = data.screen_name

    output.name = data.name
    output.name_html = data.name_html

    output.description = data.description
    output.description_html = data.description_html

    output.profile_image_url = data.profile_image_url
    output.profile_image_url_original = data.profile_image_url_original

    output.cover_photo = data.cover_photo

    output.friends_count = data.friends_count

    // output.bot = ??? missing

    output.statusnet_profile_url = data.statusnet_profile_url

    output.is_local = data.is_local
    output.role = data.role
    output.show_role = data.show_role

    if (data.rights) {
      output.rights = {
        moderator: data.rights.delete_others_notice,
        admin: data.rights.admin
      }
    }
    output.no_rich_text = data.no_rich_text
    output.default_scope = data.default_scope
    output.hide_follows = data.hide_follows
    output.hide_followers = data.hide_followers
    output.hide_follows_count = data.hide_follows_count
    output.hide_followers_count = data.hide_followers_count
    output.background_image = data.background_image
    // Websocket token
    output.token = data.token

    // Convert relationsip data to expected format
    output.relationship = {
      muting: data.muted,
      blocking: data.statusnet_blocking,
      followed_by: data.follows_you,
      following: data.following
    }
  }

  output.created_at = new Date(data.created_at)
  output.locked = data.locked
  output.followers_count = data.followers_count
  output.statuses_count = data.statuses_count

  if (data.pleroma) {
    output.follow_request_count = data.pleroma.follow_request_count

    output.tags = data.pleroma.tags

    // deactivated was changed to is_active in Pleroma 2.3.0
    // so check if is_active is present
    output.deactivated = typeof data.pleroma.is_active !== 'undefined'
      ? !data.pleroma.is_active // new backend
      : data.pleroma.deactivated // old backend

    output.notification_settings = data.pleroma.notification_settings
  }

  output.tags = output.tags || []
  output.rights = output.rights || {}
  output.notification_settings = output.notification_settings || {}

  // Convert punycode to unicode for UI
  output.screen_name_ui = output.screen_name
  if (output.screen_name && output.screen_name.includes('@')) {
    const parts = output.screen_name.split('@')
    let unicodeDomain = punycode.toUnicode(parts[1])
    if (unicodeDomain !== parts[1]) {
      // Add some identifier so users can potentially spot spoofing attempts:
      // lain.com and xn--lin-6cd.com would appear identical otherwise.
      unicodeDomain = '🌏' + unicodeDomain
      output.screen_name_ui = [parts[0], unicodeDomain].join('@')
    }
  }

  return output
}

export const parseAttachment = (data) => {
  const output = {}
  const masto = !data.hasOwnProperty('oembed')

  if (masto) {
    // Not exactly same...
    output.mimetype = data.pleroma ? data.pleroma.mime_type : data.type
    output.meta = data.meta
    output.id = data.id
  } else {
    output.mimetype = data.mimetype
    // output.meta = ??? missing
  }

  output.blurhash = data.blurhash
  output.url = data.url
  output.large_thumb_url = data.preview_url
  output.description = data.description

  return output
}

export const parseSource = (data) => {
  const output = {}

  output.text = data.text
  output.spoiler_text = data.spoiler_text
  output.content_type = data.content_type

  return output
}

export const parseStatus = (data) => {
  const output = {}
  const masto = data.hasOwnProperty('account')

  if (masto) {
    output.favorited = data.favourited
    output.fave_num = data.favourites_count

    output.repeated = data.reblogged
    output.repeat_num = data.reblogs_count

    output.bookmarked = data.bookmarked

    output.type = data.reblog ? 'retweet' : 'status'
    output.nsfw = data.sensitive

    output.raw_html = data.content
    output.emojis = data.emojis

    output.tags = data.tags

    output.edited_at = data.edited_at

    if (data.pleroma) {
      const { pleroma } = data
      output.text = pleroma.content ? data.pleroma.content['text/plain'] : data.content
      output.summary = pleroma.spoiler_text ? data.pleroma.spoiler_text['text/plain'] : data.spoiler_text
      output.statusnet_conversation_id = data.pleroma.conversation_id
      output.is_local = pleroma.local
      output.in_reply_to_screen_name = data.pleroma.in_reply_to_account_acct
      output.thread_muted = pleroma.thread_muted
      output.emoji_reactions = pleroma.emoji_reactions
      output.parent_visible = pleroma.parent_visible === undefined ? true : pleroma.parent_visible
    } else {
      output.text = data.content
      output.summary = data.spoiler_text
      output.emoji_reactions = data.reactions
      output.statusnet_conversation_id = data.conversation_id
      // todo: properly check if post is visible
      output.parent_visible = true
    }

    if (data.akkoma) {
      const { akkoma } = data
      if (akkoma && akkoma.source) {
        output.media_type = akkoma.source.mediaType
      }
    }

    output.in_reply_to_status_id = data.in_reply_to_id
    output.in_reply_to_user_id = data.in_reply_to_account_id
    output.replies_count = data.replies_count

    if (output.type === 'retweet') {
      output.retweeted_status = parseStatus(data.reblog)
    }

    output.summary_raw_html = escape(data.spoiler_text)
    output.external_url = data.url
    output.poll = data.poll
    if (output.poll) {
      output.poll.options = (output.poll.options || []).map(field => ({
        ...field,
        title_html: escape(field.title)
      }))
    }
    output.pinned = data.pinned
    output.muted = data.muted
  } else {
    output.favorited = data.favorited
    output.fave_num = data.fave_num

    output.repeated = data.repeated
    output.repeat_num = data.repeat_num

    // catchall, temporary
    // Object.assign(output, data)

    output.type = qvitterStatusType(data)

    if (data.nsfw === undefined) {
      output.nsfw = isNsfw(data)
      if (data.retweeted_status) {
        output.nsfw = data.retweeted_status.nsfw
      }
    } else {
      output.nsfw = data.nsfw
    }

    output.raw_html = data.statusnet_html
    output.text = data.text

    output.in_reply_to_status_id = data.in_reply_to_status_id
    output.in_reply_to_user_id = data.in_reply_to_user_id
    output.in_reply_to_screen_name = data.in_reply_to_screen_name
    output.statusnet_conversation_id = data.statusnet_conversation_id

    if (output.type === 'retweet') {
      output.retweeted_status = parseStatus(data.retweeted_status)
    }

    output.summary = data.summary
    output.summary_html = data.summary_html
    output.external_url = data.external_url
    output.is_local = data.is_local
  }

  output.id = String(data.id)
  output.visibility = data.visibility
  output.card = data.card
  output.created_at = new Date(data.created_at)
  if (data.quote) {
    output.quote = parseStatus(data.quote)
  }

  // Converting to string, the right way.
  output.in_reply_to_status_id = output.in_reply_to_status_id
    ? String(output.in_reply_to_status_id)
    : null
  output.in_reply_to_user_id = output.in_reply_to_user_id
    ? String(output.in_reply_to_user_id)
    : null

  output.user = parseUser(masto ? data.account : data.user)

  output.attentions = ((masto ? data.mentions : data.attentions) || []).map(parseUser)

  output.attachments = ((masto ? data.media_attachments : data.attachments) || [])
    .map(parseAttachment)

  const retweetedStatus = masto ? data.reblog : data.retweeted_status
  if (retweetedStatus) {
    output.retweeted_status = parseStatus(retweetedStatus)
  }

  output.favoritedBy = []
  output.rebloggedBy = []

  if (data.hasOwnProperty('originalStatus')) {
    Object.assign(output, data.originalStatus)
  }

  return output
}

export const parseNotification = (data) => {
  const mastoDict = {
    'favourite': 'like',
    'reblog': 'repeat',
    'reaction': 'pleroma:emoji_reaction'
  }
  const masto = !data.hasOwnProperty('ntype')
  const output = {}

  if (masto) {
    output.type = mastoDict[data.type] || data.type
    // todo: figure out how to tell if a notification has been seen or not
    output.seen = data.last_read && data.id <= data.last_read
    if (data.status) {
      output.status = isStatusNotification(output.type) ? parseStatus(data.status) : null
      output.action = output.status // TODO: Refactor, this is unneeded
    }
    output.target = output.type !== 'move'
      ? null
      : parseUser(data.target)
    output.from_profile = parseUser(data.account)
    output.emoji = data.emoji
    output.emoji_url = data.emoji_url
  } else {
    const parsedNotice = parseStatus(data.notice)
    output.type = data.ntype
    output.seen = Boolean(data.is_seen)
    output.status = output.type === 'like'
      ? parseStatus(data.notice.favorited_status)
      : parsedNotice
    output.action = parsedNotice
    output.from_profile = parseUser(data.from_profile)
  }

  output.created_at = new Date(data.created_at)
  output.id = parseInt(data.id)

  return output
}

export const parseReport = (data) => {
  const report = {}

  report.account = parseUser(data.target_account.account)
  report.actor = parseUser(data.account.account)
  report.statuses = data.statuses.map(parseStatus)
  report.notes = []
  report.state = data.action_taken ? "closed" : "open"
  report.content = data.comment
  report.created_at = data.created_at
  report.id = data.id

  return report
}

const isNsfw = (status) => {
  const nsfwRegex = /#nsfw/i
  return (status.tags || []).includes('nsfw') || !!(status.text || '').match(nsfwRegex)
}

export const parseLinkHeaderPagination = (linkHeader, opts = {}) => {
  const flakeId = opts.flakeId
  const parsedLinkHeader = parseLinkHeader(linkHeader)
  if (!parsedLinkHeader) return
  const maxId = parsedLinkHeader.next.max_id
  const minId = parsedLinkHeader.prev.min_id

  return {
    maxId: flakeId ? maxId : parseInt(maxId, 10),
    minId: flakeId ? minId : parseInt(minId, 10)
  }
}
