const ext = require('../src/lib')
const data = require('./sample-data')
const { Context, TextStyle, Project } = require('@zeplin/extension-model')

test('exports Tailwind components for text styles', () => {

  // Arrange.
  let textStyles = data.project.textStyles
  
  textStyles.push({"name":"H1","fontFace":"Ubuntu-Light","fontSize":36,"fontWeight":300,"fontStyle":"normal","fontFamily":"Ubuntu","fontStretch":"normal","weightText":"light","color":{"r":77,"g":77,"b":77,"a":1}})
  textStyles.push({"name":"Lead","fontFace":"Ubuntu-Italic","fontSize":18,"fontWeight":400,"fontStyle":"oblique","fontFamily":"Ubuntu","fontStretch":"normal","letterSpacing":0,"weightText":"regular","color":{"r":77,"g":77,"b":77,"a":1}})

  let project = new Project(data.project)
  let context = new Context({ 
    project,
    options: {
      font: 'Ubuntu',
      color: 'black'
    }
  })

  // Act.
  let css = ext.styleguideTextStyles(context, textStyles.map(data => new TextStyle(data)))

  // Assert.
  let expected = `.sample-text-style {
  @apply .text-xl .font-sfprotext;
}
.sample-text-style-with-color {
  @apply .text-xl .font-sfprotext .text-red;
}
.h1 {
  @apply .text-4xl .font-light;
}
.lead {
  @apply .text-lg .font-italic;
}
`

    expect(css.code).toBe(expected)
});

test('reads the Tailwing config for things', () => {

  // Arrange.
  let project = new Project(data.project)
  let tailwind = require('../src/tailwind-config.json')
  tailwind.textSizes.base = "2.25rem"

  let context = new Context({ 
    project,
    options: {
      font: 'Ubuntu',
      color: 'black',
      tailwind: JSON.stringify(tailwind)
    }
  })
  let textStyles = [{"name":"H1","fontFace":"Ubuntu-Light","fontSize":36,"color":{"r":77,"g":77,"b":77,"a":1}}]

  // Act.
  let css = ext.styleguideTextStyles(context, textStyles.map(data => new TextStyle(data)))

  // Assert.
  let expected = `.h1 {
  @apply .font-light;
}
`

    expect(css.code).toBe(expected)
});