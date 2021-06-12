import { convertHtmlToTree } from 'src/services/html_converter/html_tree_converter.service.js'

describe('html_tree_converter', () => {
  describe('convertHtmlToTree', () => {
    it('converts html into a tree structure', () => {
      const input = '1 <p>2</p> <b>3<img src="a">4</b>5'
      expect(convertHtmlToTree(input)).to.eql([
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
      expect(convertHtmlToTree(input)).to.eql([
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
      expect(convertHtmlToTree(input)).to.eql([
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
      expect(convertHtmlToTree(input)).to.eql([
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
      expect(convertHtmlToTree(inputOutput)).to.eql([
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
})
