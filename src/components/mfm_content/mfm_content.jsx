import { defineComponent, h } from 'vue'
import * as mfm from 'mfm-js'
import MentionLink from '../mention_link/mention_link.vue'
import mention_link from '../mention_link/mention_link'

function concat (xss) {
  return ([]).concat(...xss)
}

export const MFM_TAGS = ['tada', 'jelly', 'twitch', 'shake', 'spin', 'jump', 'bounce', 'flip', 'x2', 'x3', 'x4', 'font', 'blur', 'rainbow', 'sparkle', 'rotate']

export default defineComponent({
  props: {
    status: {
      type: Object,
      required: true
    }
  },

  render () {
    if (!this.status) return null
    const ast = mfm.parse(this.status.mfm_content, { fnNameList: MFM_TAGS })
    const validTime = (t) => {
      if (t == null) return null
      return t.match(/^[0-9.]+s$/) ? t : null
    }

    const genEl = (ast) => concat(ast.map((token) => {
      switch (token.type) {
        case 'text': {
          const text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n')

          const res = []
          for (const t of text.split('\n')) {
            res.push(h('br'))
            res.push(t)
          }
          res.shift()
          return res
        }

        case 'bold': {
          return [h('b', genEl(token.children))]
        }

        case 'strike': {
          return [h('del', genEl(token.children))]
        }

        case 'italic': {
          return h('i', {
            style: 'font-style: oblique;'
          }, genEl(token.children))
        }

        case 'fn': {
          // TODO: CSSを文字列で組み立てていくと token.props.args.~~~ 経由でCSSインジェクションできるのでよしなにやる
          let style
          switch (token.props.name) {
            case 'tada': {
              style = `font-size: 150%;` + 'animation: tada 1s linear infinite both;'
              break
            }
            case 'jelly': {
              const speed = validTime(token.props.args.speed) || '1s'
              style = `animation: mfm-rubberBand ${speed} linear infinite both;`
              break
            }
            case 'twitch': {
              const speed = validTime(token.props.args.speed) || '0.5s'
              style = `animation: mfm-twitch ${speed} ease infinite;`
              break
            }
            case 'shake': {
              const speed = validTime(token.props.args.speed) || '0.5s'
              style = `animation: mfm-shake ${speed} ease infinite;`
              break
            }
            case 'spin': {
              const direction =
                token.props.args.left ? 'reverse'
                  : token.props.args.alternate ? 'alternate'
                    : 'normal'
              const anime =
                token.props.args.x ? 'mfm-spinX'
                  : token.props.args.y ? 'mfm-spinY'
                    : 'mfm-spin'
              const speed = validTime(token.props.args.speed) || '1.5s'
              style = `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction};`
              break
            }
            case 'jump': {
              style = 'animation: mfm-jump 0.75s linear infinite;'
              break
            }
            case 'bounce': {
              style = 'animation: mfm-bounce 0.75s linear infinite; transform-origin: center bottom;'
              break
            }
            case 'flip': {
              const transform =
                (token.props.args.h && token.props.args.v) ? 'scale(-1, -1)'
                  : token.props.args.v ? 'scaleY(-1)'
                    : 'scaleX(-1)'
              style = `transform: ${transform};`
              break
            }
            case 'x2': {
              style = `font-size: 200%;`
              break
            }
            case 'x3': {
              style = `font-size: 400%;`
              break
            }
            case 'x4': {
              style = `font-size: 600%;`
              break
            }
            case 'font': {
              const family =
                token.props.args.serif ? 'serif'
                  : token.props.args.monospace ? 'monospace'
                    : token.props.args.cursive ? 'cursive'
                      : token.props.args.fantasy ? 'fantasy'
                        : token.props.args.emoji ? 'emoji'
                          : token.props.args.math ? 'math'
                            : null
              if (family) style = `font-family: ${family};`
              break
            }
            case 'blur': {
              return h('span', {
                class: '_mfm_blur_'
              }, genEl(token.children))
            }
            case 'rainbow': {
              style = 'animation: mfm-rainbow 1s linear infinite;'
              break
            }
            case 'sparkle': {
              return h(MkSparkle, {}, genEl(token.children))
            }
            case 'rotate': {
              const degrees = parseInt(token.props.args.deg) || '90'
              style = `transform: rotate(${degrees}deg); transform-origin: center center;`
              break
            }
          }
          if (style == null) {
            return h('span', {}, ['$[', token.props.name, ' ', ...genEl(token.children), ']'])
          } else {
            return h('span', {
              style: 'display: inline-block;' + style
            }, genEl(token.children))
          }
        }

        case 'small': {
          return [h('small', {
            style: 'opacity: 0.7;'
          }, genEl(token.children))]
        }

        case 'center': {
          return [h('div', {
            style: 'text-align:center;'
          }, genEl(token.children))]
        }

        case 'url': {
          return [h('a', {
            key: Math.random(),
            href: token.props.url,
            rel: 'nofollow noopener'
          }, token.props.url)]
        }

        case 'link': {
          console.log(token.props)
          return [h('a', {
            key: Math.random(),
            href: token.props.url,
            rel: 'nofollow noopener'
          }, genEl(token.children))]
        }

        case 'mention': {
          const user = this.status.attentions.find((mention) => `@${mention.screen_name}` === token.props.acct || mention.screen_name === token.props.username)
          if (user) {
            return [h(MentionLink, {
              url: user.statusnet_profile_url,
              content: token.props.acct,
              userScreenName: token.props.acct
            })]
          }
          return null
        }

        case 'hashtag': {
          return [h('a', {
            rel: 'noopener noreferrer',
            target: '_blank',
            key: token.props.hashtag,
            href: this.status.tags.find((hash) => hash.name === token.props.hashtag).url
          }, `#${token.props.hashtag}`)]
        }

        case 'blockCode': {
          return [h('pre', {
            key: Math.random(),
            lang: token.props.lang
          }, token.props.code)]
        }

        case 'inlineCode': {
          return [h('pre', {
            key: Math.random(),
            code: token.props.code,
            inline: true
          })]
        }

        case 'quote': {
          if (!this.nowrap) {
            return [h('div', {
              class: 'quote'
            }, genEl(token.children))]
          } else {
            return [h('span', {
              class: 'quote'
            }, genEl(token.children))]
          }
        }

        case 'emojiCode': {
          return [h('div', {
            class: 'still-image emoji img'
          },
          [h('img', {
            key: Math.random(),
            title: token.props.name,
            alt: token.props.name,
            src: this.status.emojis.find((emoji) => emoji.shortcode === token.props.name).static_url
          })]
          )]
        }

        case 'unicodeEmoji': {
          return token.props.emoji
        }

        case 'math': {
          return [h('pre', {
            key: Math.random(),
            code: token.props.code
          })]
        }

        case 'mathInline': {
          return [h('pre', {
            key: Math.random(),
            code: token.props.code,
            inline: true
          })]
        }

        default: {
          console.error('unrecognized ast type:', token.type)

          return []
        }
      }
    }))

    // Parse ast to DOM
    return h('span', genEl(ast))
  }
})
