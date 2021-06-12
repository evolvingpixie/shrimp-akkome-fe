import { processTextForEmoji, getAttrs } from 'src/services/html_converter/utility.service.js'

describe('html_converter utility', () => {
  describe('processTextForEmoji', () => {
    it('processes all emoji in text', () => {
      const input = 'Hello from finland! :lol: We have best water! :lmao:'
      const emojis = [
        { shortcode: 'lol', src: 'LOL' },
        { shortcode: 'lmao', src: 'LMAO' }
      ]
      const processor = ({ shortcode, src }) => ({ shortcode, src })
      expect(processTextForEmoji(input, emojis, processor)).to.eql([
        'Hello from finland! ',
        { shortcode: 'lol', src: 'LOL' },
        ' We have best water! ',
        { shortcode: 'lmao', src: 'LMAO' }
      ])
    })
    it('leaves text as is', () => {
      const input = 'Number one: that\'s terror'
      const emojis = []
      const processor = ({ shortcode, src }) => ({ shortcode, src })
      expect(processTextForEmoji(input, emojis, processor)).to.eql([
        'Number one: that\'s terror'
      ])
    })
  })

  describe('getAttrs', () => {
    it('extracts arguments from tag', () => {
      const input = '<img src="boop" cool ebin=\'true\'>'
      const output = { src: 'boop', cool: true, ebin: 'true' }

      expect(getAttrs(input)).to.eql(output)
    })
  })
})
