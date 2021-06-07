import { convertHtml, processTextForEmoji } from 'src/services/mini_html_converter/mini_html_converter.service.js'

describe('MiniHtmlConverter', () => {
  describe('convertHtml', () => {
    it('converts html into a tree structure', () => {
      const inputOutput = '1 <p>2</p> <b>3<img src="a">4</b>5'
      expect(convertHtml(inputOutput)).to.eql([
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
      const inputOutput = '1 <p >2</p><b >3<img   src="a">4</b>5'
      expect(convertHtml(inputOutput)).to.eql([
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
      const inputOutput = '1 <br> 2 <p> 42'
      expect(convertHtml(inputOutput)).to.eql([
        '1 ',
        ['<br>'],
        ' 2 ',
        [
          '<p>',
          [' 42']
        ]
      ])
    })
    it('realistic case', () => {
      const inputOutput = '<p><span class="h-card"><a class="u-url mention" data-user="9wRC6T2ZZiKWJ0vUi8" href="https://cawfee.club/users/benis" rel="ugc">@<span>benis</span></a></span> <span class="h-card"><a class="u-url mention" data-user="194" href="https://shigusegubu.club/users/hj" rel="ugc">@<span>hj</span></a></span> nice</p>'
      expect(convertHtml(inputOutput)).to.eql([
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
  })
  describe('processTextForEmoji', () => {
    it('processes all emoji in text', () => {
      const inputOutput = 'Hello from finland! :lol: We have best water! :lmao:'
      const emojis = [
        { shortcode: 'lol', src: 'LOL' },
        { shortcode: 'lmao', src: 'LMAO' }
      ]
      const processor = ({ shortcode, src }) => ({ shortcode, src })
      expect(processTextForEmoji(inputOutput, emojis, processor)).to.eql([
        'Hello from finland! ',
        { shortcode: 'lol', src: 'LOL' },
        ' We have best water! ',
        { shortcode: 'lmao', src: 'LMAO' }
      ])
    })
  })
})
