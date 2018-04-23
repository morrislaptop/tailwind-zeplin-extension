const ext = require('../src/lib')
const data = require('zem/src/sample-data')
const s = require('string')
const { Context, Layer, Project } = require('@zeplin/extension-model')

function expectExactClasses(received, expected) {
  expect(received.sort()).toEqual(expected.sort())
}

function ExpectEmptyTest(context, layer) {
  let css = ext.layer(context, layer)

  expectExactClasses(css.classes, [])
}

let tests = {
  SampleScreen: ExpectEmptyTest,

  TextLayerWithMultipleStyles(context, layer) {
    let css = ext.layer(context, layer)

    expectExactClasses(css.classes, ['text-xl', 'font-medium'])
  },

  TextLayer(context, layer) {
    let css = ext.layer(context, layer)

    expectExactClasses(css.classes, ['text-xl'])
  },

  LayerWithBlur: ExpectEmptyTest,
  ExportableLayer: ExpectEmptyTest,

  LayerWithBorderRadius(context, layer) {
    let css = ext.layer(context, layer)

    expectExactClasses(css.classes, ['rounded-lg'])
  },

  RotatedLayer: ExpectEmptyTest,

  TransparentLayerWithBlendMode(context, layer) {
    let css = ext.layer(context, layer)

    expectExactClasses(css.classes, ['opacity-25'])
  }
}

/**
 * Setup our project
 */
let project = new Project(data.project)
let context = new Context({ project, options: { font: 'SFProText', color: 'black' }})

/**
 * Runs through each sample layer and calls the function to test it
 */
data.layers.forEach(layer => {
  let fn = s(layer.name).camelize().s
  
  tests[fn] ? test(layer.name, () => tests[fn](context, new Layer(layer))) : xtest(layer.name)
})