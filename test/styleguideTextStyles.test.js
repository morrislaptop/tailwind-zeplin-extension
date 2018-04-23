const ext = require('../src/lib')
const data = require('zem/src/sample-data')
const { Context, TextStyle, Project } = require('@zeplin/extension-model')

const project = new Project(data.project)
const context = new Context({ project })

test('exports Tailwind components for text styles', () => {
  let css = ext.styleguideTextStyles(context, data.project.textStyles.map(data => new TextStyle(data)))

  let expected = `.sample-text-style {
  @apply .text-xl .font-sfprotext .text-black
}
.sample-text-style-with-color {
  @apply .text-xl .font-sfprotext .text-red
}
`

    expect(css.code).toBe(expected)
});