const s = require('string')
const _ = require('lodash')
const REM = 16

function classesToElement(el, classes, content) {
    return `<${el} class="${classes.join(' ')}">${content}</${el}>`
}

function classesToCode(screens, el, classes, content = '') {
    let html = classesToElement(el, classes, content)

    html = Object.keys(screens).reduce((html, screen) => {
        let prefixed = classes.map(className => screen + ':' + className)
        
        html += `\n\n<!-- ${screen} -->\n` + classesToElement(el, prefixed, content)

        return html
    }, html)

    return html
}

function dropTheRem(obj) {
    return _.mapValues(obj, size => parseFloat(size))
}

function borderRadiusToClass(tailwind, radius) {
    let ratio = radius / REM
    let sizes = dropTheRem(tailwind.borderRadius)
    let size = closestKey(sizes, ratio)

    if (size === 'none') return null

    return 'rounded-' + size
}

function opacityToClass(tailwind, opacity) {
    let key = closestKey(tailwind.opacity, opacity)

    if (key === '100') return null

    return 'opacity-' + key
}

/**
 {
    "type": "outer",
    "offsetX": 0,
    "offsetY": 2,
    "blurRadius": 4,
    "spread": 6,
    "color": {
        "r": 0,
        "g": 0,
        "b": 0,
        "a": 0.5
    }
  }
 */
function shadowsToClass(tailwind, layerShadows) {
    // return if no shadows
    if (! layerShadows[0]) return null
    let layerShadow = layerShadows[0]

    // only get the relevant shadows
    let innerShouldBe = layerShadow.type === 'inner'
    let shadows = _.pick(tailwind.shadows, css => {
        let inner = css.includes('inset')
        return inner === innerShouldBe
    })

    // Grab the blurs
    let blurs = _.mapValues(tailwind.shadows, shadow => {
        let parts = shadow.split(' ')
        let idx = parts[0] === 'inset' ? 3 : 2

        return parts[idx] ? parseInt(parts[idx]) : null
    })

    // business as usual
    let key = closestKey(blurs, layerShadow.blurRadius)

    if (key === 'none') return null

    return key === 'default' ? 'shadow' : 'shadow-' + key
}

function backgroundClass(context, tailwind, fills) {
    if (!fills[0] || fills[0].type !== 'color') return null
    let fill = fills[0]

    return colorToClass(context, fill.color, 'bg-')
}

function borderClass(tailwind, borders) {
    if (!borders[0]) return null
    let border = borders[0]

    let sizes = dropTheRem(tailwind.borderWidths)
    let key = closestKey(sizes, border.thickness)

    if (key === 'default') return null

    return 'border-' + key
}

function borderColor(context, tailwind, borders) {
    if (!borders[0] || !borders[0].fill.color) return null
    let border = borders[0]

    return colorToClass(context, border.fill.color, 'border-')
}

function maxWidthClass(tailwind, { width }) {
    let ratio = width / REM
    let widths = dropTheRem(tailwind.maxWidth)
    let key = closestKey(widths, ratio)

    return 'max-w-' + key
}

function minHeightClass(tailwind, { height }) {
    let ratio = height / REM
    let heights = dropTheRem(tailwind.minHeight)
    let key = closestKey(heights, ratio)

    if (key === '0') return null

    return 'min-h-' + key
}

function shapeLayerToCode(tailwind, context, layer) {
    let classes = [
        borderRadiusToClass(tailwind, layer.borderRadius),
        opacityToClass(tailwind, layer.opacity),
        shadowsToClass(tailwind, layer.shadows),
        backgroundClass(context, tailwind, layer.fills),
        borderClass(tailwind, layer.borders),
        borderColor(context, tailwind, layer.borders),
        maxWidthClass(tailwind, layer.rect),
        minHeightClass(tailwind, layer.rect),
    ]

    return classesToCode(tailwind.screens, 'div', classes.filter(n => n))
}

function combineTextLayersWithTheSameClasses(tailwind, context, textStyles)
{
    return Object.values(textStyles.reduce((obj, style) => {
        let classes = fontAndTextClasses(tailwind, context, style.textStyle).join(' ')

        if (obj[classes]) {
            obj[classes].range.end = style.range.end
        }
        else {
            obj[classes] = style
        }

        return obj
    }, {}))
}

function textLayerToCode(tailwind, context, layer) {    
    let textStyles = combineTextLayersWithTheSameClasses(tailwind, context, layer.textStyles)

    let tags = textStyles.map(style => textStyleToCode(tailwind, context, layer, style))

    return tags.join("\n")
}

function contentToTransformClass(content) {
    if (content !== content.toUpperCase()) return null

    return 'uppercase'
}

function contentToTruncateClass(content) {
    if (!content.includes('...') && !content.includes('…')) return null

    return 'truncate'
}

function textStyleToCode(tailwind, context, layer, style) {
    let projectStyle = context.project.findTextStyleEqual(style.textStyle)
    let classes = projectStyle ? [s(projectStyle.name).slugify().s] : fontAndTextClasses(tailwind, context, style.textStyle)
    let content = layer.content.substring(style.range.start, style.range.end)

    // Add some extra classes based on the content
    classes = classes.concat([
        contentToTransformClass(content),
        contentToTruncateClass(content)
    ]).filter(n => n)
    
    return classesToCode({}, 'p', classes, content)
}

/**
 * Export functions you want to work with, see documentation for details:
 * https://github.com/zeplin/zeplin-extension-documentation
 */
function layer(context, layer) {
    let tailwind = readTailwindConfig(context)

    // console.log({ layer })
    // console.log(JSON.stringify(layer))

    // Call the relevant function for layer type
    let layerToCode = {
        text: textLayerToCode,
        shape: shapeLayerToCode
    }
    let code = layerToCode[layer.type](tailwind, context, layer)

    return {
        code,
        language: 'html'
    }
}

/**
 * Returns tailwind color configuration
 * let colors = {
 *  'black': '#22292f',
 *  'grey-darkest': '#3d4852',
 * }
 */
function styleguideColors(context, colors) {
    let tailwind = colors.reduce((obj, color) => {
        obj[color.name] = '#' + color.hexBase()
        
        return obj
    }, {})

    let js = 'let colors = '

    js += JSON.stringify(tailwind, null, 2)

    return {
        code: js,
        language: 'js'
    }
}

function fontFamilyToClass(context, family) {
    if (family.toLowerCase() === context.getOption('font').toLowerCase()) return null
    
    return 'font-' + s(family).slugify().s
}

function fontSizeToClass(tailwind, fontSize) {
    let ratio = fontSize / REM
    let sizes = dropTheRem(tailwind.textSizes)
    let size = closestKey(sizes, ratio)

    if (size === 'base') return null

    return 'text-' + size
}

function fontWeightToClass(weight) {
    if (weight === 'normal') return null

    return 'font-' + weight
}

function fontStyleToClass(style) {
    if (style === 'normal') return null

    return 'font-' + style
}

function closest(array, x) {
    return array.sort( (a, b) => Math.abs(x - a) - Math.abs(x - b) )[0];
}

function closestKey(obj, x) {
    let close = closest(Object.values(obj), x)

    return _.findKey(obj, val => close === val)
}

function lineHeightToClass(tailwind, size, height) {
    let ratio = height / size
    let leading = closestKey(tailwind.leading, ratio)

    if (leading === 'none') return null

    return 'leading-' + leading
}

function textAlignToClass(align) {
    if (! align || align === 'left') return null

    return 'font-' + align
}

function letterSpacingToClass(tailwind, size, spacing) {
    let ratio = spacing / size
    let trackings = dropTheRem(tailwind.tracking)
    let tracking = closestKey(trackings, ratio)

    if (tracking === 'normal') return null

    return 'tracking-' + tracking
}

function fontWeightTextToClass(weight) {
    if (weight === 'regular') return null

    return 'font-' + weight
}

function colorToClass(context, color, prefix) {
    let projectColor = color && context.project.findColorEqual(color)
    
    if (!projectColor || projectColor.name.toLowerCase() === context.getOption('color').toLowerCase()) return null

    return prefix + projectColor.name
}

function readTailwindConfig(context) 
{
    let js = context.getOption('tailwind')

    return js ? JSON.parse(js) : require('./tailwind-config.json')
}

function fontAndTextClasses(tailwind, context, style)
{
    let classes = [
        fontSizeToClass(tailwind, style.fontSize),
        fontStyleToClass(style.fontStyle),
        fontFamilyToClass(context, style.fontFamily),
        lineHeightToClass(tailwind, style.fontSize, style.lineHeight || style.fontSize),
        textAlignToClass(style.textAlign),
        letterSpacingToClass(tailwind, style.fontSize, style.letterSpacing || 0),
        fontWeightTextToClass(style.weightText),
        colorToClass(context, style.color, 'text-')
    ]

    return classes.filter(n => n)
}

/**
 * .fontFace : String N/A
 * .fontSize : Number
 * .fontWeight : Number N/A See weightText
 * .fontStyle : String
 * .fontFamily : String
 * .fontStretch : String N/A
 * .lineHeight : Number
 * .textAlign : String
 * .letterSpacing : Number
 * .color : Color
 * .weightText : String
 * 
 * @param {*} context 
 * @param {*} styles 
 */
function styleguideTextStyles(context, styles) {
    let tailwind = readTailwindConfig(context)

    let components = styles.map(style => {
        let className = '.' + s(style.name).slugify().s
        let classes = fontAndTextClasses(tailwind, context, style)
        
        return { className, classes }
    }, {})

    let css = components.reduce((css, component) => {
        css += component.className + " {\n  @apply "
        css += '.' + component.classes.join(' .')
        css += ";\n}\n";

        return css
    }, '')

    return { 
        code: css,
        language: 'css'
    }
}

function comment(context, text) {
    return `/* ${text} */`;
}

function exportStyleguideColors(context, colors) {
    var codeObject = styleguideColors(context, colors);
    var code = codeObject.code;

    return {
        code: code,
        filename: "colors.js",
        language: "javascript"
    };
}

function exportStyleguideTextStyles(context, textstyles) {
    var codeObject = styleguideTextStyles(context, textstyles);
    var code = codeObject.code;

    return {
        code: code,
        filename: "fonts.css",
        language: "css"
    };
}

module.exports = {
    layer,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles,
    comment
};
