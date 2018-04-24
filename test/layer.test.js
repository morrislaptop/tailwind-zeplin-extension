const ext = require('../src/lib')
const data = require('./sample-data')
const s = require('string')
const { Context, Layer, Project } = require('@zeplin/extension-model')

function ExpectEmptyTest(context, layer) {
  let css = ext.layer(context, layer)

  expect(css.code).toBe('<div class=""></div>')
}

let tests = {
  SampleScreen: ExpectEmptyTest,

  TextLayerWithMultipleStyles(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<p class="text-xl font-medium">Type</p>
<p class="text-xl text-green">something</p>
<p class="sample-text-style-with-color">red</p>`)
  },

  TextLayer(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<p class="sample-text-style">Type something</p>`)
  },

  LayerWithBlur: ExpectEmptyTest,

  ExportableLayer(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-yellow"></div>`)
  },

  LayerWithBorderRadius(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="rounded-lg bg-red"></div>`)
  },

  RotatedLayer(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-green"></div>`)
  },

  TransparentLayerWithBlendMode(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="opacity-25 bg-green"></div>`)
  },

  LayerWithShadow(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="shadow"></div>`)
  },

  LayerWithGradientFill: ExpectEmptyTest,

  LayerWithFill(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-blue"></div>`)
  },

  LayerWithGradientBorder: ExpectEmptyTest,
  
  LayerWithBorder(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="border border-green"></div>`)
  },
}

describe('Sample Data Tests', () => {
  /**
   * Setup our project
   */
  let tailwind = require('../src/tailwind-config.json')
  tailwind.screens = { }
  let project = new Project(data.project)
  let context = new Context({ project, options: { font: 'SFProText', color: 'black', tailwind: JSON.stringify(tailwind) }})

  /**
   * Runs through each sample layer and calls the function to test it
   */
  data.layers.forEach(layer => {
    let fn = s(layer.name).camelize().s
    
    tests[fn] ? test(layer.name, () => tests[fn](context, new Layer(layer))) : xtest(layer.name)
  })
})

test('outputs responsive classes as well for shape elements', () => {
  // Arrange.
  let tailwind = require('../src/tailwind-config.json')
  tailwind.screens = { "sm": "576px" }
  let project = new Project(data.project)
  let context = new Context({ project, options: { tailwind: JSON.stringify(tailwind) }})

  // Act.
  let layer = new Layer({ type: "shape", rect: { width: 320, height: 768 }, borders: [], fills: [], shadows: [] })
  let css = ext.layer(context, layer)

  // Assert.
  expect(css.code).toContain('sm:')
})

// test('outputs a p without widths for text layers', () => {
//   // Arrange.
//   let context = new Context({ project, options: { font: 'sfprotext', color: 'black' }})
  
//   let layer = new Layer({ type: "text", content: "Type something red", borders: [], fills: [], shadows: [], textStyles: [
//     { range: { location: 0, length: 4 }, style: { fontFace: "SFProText-Medium", "fontSize": 20, "color": {r: 0, g: 0, b: 0, a: 1 } }},
//     { range: { location: 5, length: 9 }, style: { fontFace: "SFProText-Regular", "fontSize": 20, "color": {r: 0, g: 255, b: 0, a: 1 } }},
//     { range: { location: 15, length: 3 }, style: { fontFace: "SFProText-Regular", "fontSize": 20, "color": {r: 255, g: 0, b: 0, a: 1 } }},
//   ]})

//   // Act.
//   let css = ext.layer(context, layer)

//   // Assert.
//   expect(css.code).toBe(`<p class="text-xl font-medium">Type</p>
// <p class="text-xl text-green">Something</p>
// <p class=".sample-text-style-with-color">red</p>`)
// })