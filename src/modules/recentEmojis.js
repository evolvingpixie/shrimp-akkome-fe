// each row is 7 emojis, 6 rows chosen arbitrarily. i don't think more than
// that are going to be useful.
const RECENT_MAX = 7 * 6

const defaultState = {
  emojis: [],
}

const recentEmojis = {
  state: defaultState,

  mutations: {
    emojiUsed ({ emojis }, emoji) {
      if (emoji.displayText === undefined || emoji.displayText === null) {
        console.error('emojiUsed was called with a bad emoji object: ', emoji)
        return
      } else if (emoji.displayText.includes('@')) {
        console.error('emojiUsed was called with a remote emoji: ', emoji)
        return
      }

      const i = emojis.indexOf(emoji.displayText)

      if (i === -1) {
        // not in `emojis` yet, insert and truncate if necessary
        const newLength = emojis.unshift(emoji.displayText)
        if (newLength > RECENT_MAX) {
          emojis.pop()
        }
      } else if (i !== 0) {
        // emoji is already in `emojis` but needs to be bumped to the top
        emojis.splice(i, 1)
        emojis.unshift(emoji.displayText)
      }
    },
  },

  getters: {
    recentEmojis: (state, getters, rootState) => state.emojis.reduce((objects, displayText) => {
      const allEmojis = rootState.instance.emoji.concat(rootState.instance.customEmoji)
      let emojiObject = allEmojis.find(emoji => emoji.displayText === displayText)
      if (emojiObject !== undefined) {
        objects.push(emojiObject)
      }
      return objects
    }, []),
  },
}

export default recentEmojis
