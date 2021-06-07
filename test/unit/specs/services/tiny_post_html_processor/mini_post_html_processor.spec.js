import { convertHtml, processTextForEmoji, getAttrs } from 'src/services/mini_html_converter/mini_html_converter.service.js'

describe('MiniHtmlConverter', () => {
  describe('convertHtml', () => {
    it('converts html into a tree structure', () => {
      const input = '1 <p>2</p> <b>3<img src="a">4</b>5'
      expect(convertHtml(input)).to.eql([
        '1 ',
        [
          '<p>',
          ['2'],
          '</p>'
        ],
        ' ',
        [
          '<b>',
          [
            '3',
            ['<img src="a">'],
            '4'
          ],
          '</b>'
        ],
        '5'
      ])
    })
    it('converts html to tree while preserving tag formatting', () => {
      const input = '1 <p >2</p><b >3<img   src="a">4</b>5'
      expect(convertHtml(input)).to.eql([
        '1 ',
        [
          '<p >',
          ['2'],
          '</p>'
        ],
        [
          '<b >',
          [
            '3',
            ['<img   src="a">'],
            '4'
          ],
          '</b>'
        ],
        '5'
      ])
    })
    it('converts semi-broken html', () => {
      const input = '1 <br> 2 <p> 42'
      expect(convertHtml(input)).to.eql([
        '1 ',
        ['<br>'],
        ' 2 ',
        [
          '<p>',
          [' 42']
        ]
      ])
    })
    it('realistic case 1', () => {
      const input = '<p><span class="h-card"><a class="u-url mention" data-user="9wRC6T2ZZiKWJ0vUi8" href="https://cawfee.club/users/benis" rel="ugc">@<span>benis</span></a></span> <span class="h-card"><a class="u-url mention" data-user="194" href="https://shigusegubu.club/users/hj" rel="ugc">@<span>hj</span></a></span> nice</p>'
      expect(convertHtml(input)).to.eql([
        [
          '<p>',
          [
            [
              '<span class="h-card">',
              [
                [
                  '<a class="u-url mention" data-user="9wRC6T2ZZiKWJ0vUi8" href="https://cawfee.club/users/benis" rel="ugc">',
                  [
                    '@',
                    [
                      '<span>',
                      [
                        'benis'
                      ],
                      '</span>'
                    ]
                  ],
                  '</a>'
                ]
              ],
              '</span>'
            ],
            ' ',
            [
              '<span class="h-card">',
              [
                [
                  '<a class="u-url mention" data-user="194" href="https://shigusegubu.club/users/hj" rel="ugc">',
                  [
                    '@',
                    [
                      '<span>',
                      [
                        'hj'
                      ],
                      '</span>'
                    ]
                  ],
                  '</a>'
                ]
              ],
              '</span>'
            ],
            ' nice'
          ],
          '</p>'
        ]
      ])
    })
    it('realistic case 2', () => {
      const inputOutput = 'Country improv: give me a city<br/>Audience: Memphis<br/>Improv troupe: come on, a better one<br/>Audience: el paso'
      expect(convertHtml(inputOutput)).to.eql([
        'Country improv: give me a city',
        [
          '<br/>'
        ],
        'Audience: Memphis',
        [
          '<br/>'
        ],
        'Improv troupe: come on, a better one',
        [
          '<br/>'
        ],
        'Audience: el paso'
      ])
    })
  })

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
