const s = require('string')
const tailwind = require('./tailwind-config')
const _ = require('lodash')
const REM = 16

/**
 * Export functions you want to work with, see documentation for details:
 * https://github.com/zeplin/zeplin-extension-documentation
 */

function layer(context, selectedLayer) {

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

function fontFamilyToClass(family) {
    return '.font-' + s(family).slugify().s
}

function fontSizeToClass(fontSize) {
    let ratio = fontSize / REM
    let sizes = _.mapValues(tailwind.textSizes, size => parseFloat(size))
    let size = closestKey(sizes, ratio)

    if (size === 'base') return null

    return '.text-' + size
}

function fontWeightToClass(weight) {
    if (weight === 'normal') return null

    return '.font-' + weight
}

function fontStyleToClass(style) {
    if (style === 'normal') return null

    return '.font-' + weight
}

function closest(array, x) {
    return array.sort( (a, b) => Math.abs(x - a) - Math.abs(x - b) )[0];
}

function closestKey(obj, x) {
    let close = closest(Object.values(obj), x)

    return _.findKey(obj, val => close === val)
}

function lineHeightToClass(size, height) {
    let ratio = height / size
    let leading = closestKey(tailwind.leading, ratio)

    if (leading === 'none') return null

    return '.leading-' + leading
}

function textAlignToClass(align) {
    if (align === 'left') return null

    return '.font-' + align
}

function letterSpacingToClass(size, spacing) {
    let ratio = spacing / size
    let trackings = _.mapValues(tailwind.tracking, size => parseFloat(size))
    let tracking = closestKey(trackings, ratio)

    if (tracking === 'normal') return null    

    console.log({ size, spacing, ratio, tailwind: tailwind.tracking, tracking })

    return '.tracking-' + tracking
}

function fontWeightTextToClass(weight) {
    if (weight === 'regular') return null

    return '.font-' + weight
}

function colorToClass(project, color) {
    let projectColor = project.findColorEqual(color)
    
    if (! projectColor) return null

    return '.text-' + projectColor.name
}

/**
 * .fontFace : String N/A
 * .fontSize : Number
 * .fontWeight : Number N/A See weightText
 * .fontStyle : String
 * .fontFamily : String font-x
 * .fontStretch : String N/A
 * .lineHeight : Number
 * .textAlign : String
 * .letterSpacing : Number
 * .color : Color
 * .weightText : String
 * @param {*} context 
 * @param {*} styles 
 */
function styleguideTextStyles(context, styles) {
    let components = styles.map(style => {
        let className = '.' + s(style.name).slugify().s
        
        let classes = [
            fontSizeToClass(style.fontSize),
            fontStyleToClass(style.fontStyle),
            fontFamilyToClass(style.fontFamily),
            lineHeightToClass(style.fontSize, style.lineHeight || style.fontSize),
            textAlignToClass(style.textAlign),
            letterSpacingToClass(style.fontSize, style.letterSpacing || 0),
            fontWeightTextToClass(style.weightText),
            colorToClass(context.project, style.color)
        ]
        
        return { className, classes: classes.filter(n => n) }
    }, {})

    let css = components.reduce((css, component) => {
        css += component.className + " {\n  @apply "
        css += component.classes.join(' ')
        css += "\n}\n";

        return css
    }, '')

    return { 
        code: css,
        language: 'css'
    }
}



function exportStyleguideColors(context, colors) {

}

function exportStyleguideTextStyles(context, colors) {

}

function comment(context, text) {

}

module.exports = {
    layer,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles,
    comment
};