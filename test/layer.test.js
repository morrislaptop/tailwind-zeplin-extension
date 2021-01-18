import ext from '../src/index'
import data from './sample-data'
import s from 'string'
import { Context, Layer, Project } from "@zeplin/extension-model";

function ExpectEmptyTest(context, layer) {
  let css = ext.layer(context, layer)

  expect(css.code).toBe('<div class=""></div>')
}

let tests = {
  SampleScreen(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe('<div class="max-w-xs"></div>')
  },

  TextLayerWithMultipleStyles(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<p class="text-xl font-medium">Type</p>
<p class="text-xl text-center text-green">something</p>
<p class="text-xl text-right text-red uppercase">RED</p>`)
  },

  TextLayerWithMultipleStylesThatAreTheSame(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<p class="text-xl font-medium">Type something RED</p>`)
  },

  TextLayer(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<p class="sample-text-style truncate">Type something...</p>`)
  },

  LayerWithBlur(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="max-w-xs"></div>`)
  },

  ExportableLayer(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-yellow max-w-xs"></div>`)
  },

  LayerWithLargeBorderRadius(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="rounded-lg bg-red max-w-xs"></div>`)
  },

  LayerWithDefaultBorderRadius(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="rounded bg-red max-w-xs"></div>`)
  },

  RotatedLayer(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-green max-w-xs -rotate-45"></div>`)
  },

  TransparentLayerWithBlendMode(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="opacity-25 bg-green max-w-xs"></div>`)
  },

  LayerWithShadow(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="shadow max-w-xs"></div>`)
  },

  LayerWithGradientFill(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="max-w-xs bg-gradient-to-t from-white"></div>`)
  },

  LayerWithFill(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-blue max-w-xs"></div>`)
  },

  LayerWithGradientBorder(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="border-4 max-w-xs"></div>`)
  },

  LayerWithBorder(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="border-2 border-green max-w-xs"></div>`)
  },

  LayerWithSlightlyDifferentColour(context, layer) {
    let css = ext.layer(context, layer)

    expect(css.code).toBe(`<div class="bg-yellow max-w-xs"></div>`)
  }
}

describe('Sample Data Tests', () => {

  /**
   * Setup our project
   */
  let tailwind = require('../src/tailwind-config.json')
  tailwind.theme.screens = {}
  let project = new Project(data.project)
  let context = new Context({ project, options: { font: 'SFProText', color: 'black', maxColorDistance: '50', tailwind: JSON.stringify(tailwind) }})

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
  tailwind.theme.screens = { 'sm': '640px' }
  let project = new Project(data.project)
  let context = new Context({ project, options: { tailwind: JSON.stringify(tailwind) }})

  // Act.
  let layer = new Layer({ type: 'shape', rect: { width: 320, height: 768 }, borders: [], fills: [], shadows: [], assets: [] })
  let css = ext.layer(context, layer)

  // Assert.
  expect(css.code).toContain('sm:')
})
