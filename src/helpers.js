import s from 'string'
import _ from 'lodash'
import rgbHex from 'rgb-hex'
import nearestColor from 'nearest-color'
import {
    borderRadiusToClass,
    opacityToClass,
    shadowsToClass,
    backgroundClass,
    borderClass,
    borderColor,
    maxWidthClass,
    minHeightClass,
    fontSizeToClass,
    fontStyleToClass,
    fontFamilyToClass,
    lineHeightToClass,
    textAlignToClass,
    letterSpacingToClass,
    fontWeightTextToClass,
    contentToTruncateClass,
    contentToTransformClass,
} from './tailwind-classes'

/**
 *  HELPERS
 */
export function classesToElement(el, classes, content) {
    return `<${el} class="${classes.join(' ')}">${content}</${el}>`
}

export function classesToCode(screens, el, classes, content = '') {
    let html = classesToElement(el, classes, content)

    html = Object.keys(screens).reduce((html, screen) => {
        let prefixed = classes.map(className => screen + ':' + className)

        html += `\n\n<!-- ${screen} -->\n` + classesToElement(el, prefixed, content)

        return html
    }, html)

    return html
}

export function dropTheRem(obj) {
    return _.mapValues(obj, size => parseFloat(size))
}

export function shapeLayerToCode(tailwind, context, layer) {
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

export function combineTextLayersWithTheSameClasses(tailwind, context, textStyles) {
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

export function textLayerToCode(tailwind, context, layer) {
    let textStyles = combineTextLayersWithTheSameClasses(tailwind, context, layer.textStyles)

    let tags = textStyles.map(style => textStyleToCode(tailwind, context, layer, style))

    return tags.join("\n")
}

export function textStyleToCode(tailwind, context, layer, style) {
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

export function closest(array, x) {
    return array.sort((a, b) => Math.abs(x - a) - Math.abs(x - b))[0];
}

export function closestKey(obj, x) {
    let close = closest(Object.values(obj), x)

    return _.findKey(obj, val => close === val)
}

export function findClosestColour(context, color) {
    if (!color) return
    // return color && context.project.findColorEqual(color)

    // Convert to object the nearestColor library understands
    let colors = context.project.colors.reduce((obj, color) => {
        obj[color.name] = '#' + rgbHex(color.r, color.g, color.b)
        return obj
    }, {})

    // Find the closest
    let closest = nearestColor.from(colors)('#' + rgbHex(color.r, color.g, color.b))

    // Return if it's too far away...
    let max = context.getOption('maxColorDistance') || 0
    if (!closest || closest.distance > max) return

    // Find the original project colour
    let rgb = closest.rgb
    let projectColour = context.project.colors.find(color => color.r == rgb.r && color.g == rgb.g && color.b == rgb.b)

    return projectColour
}

export function readTailwindConfig(context) {
    let js = context.getOption('tailwind')
    return js ? JSON.parse(js) : require('./tailwind-config.json')
}

export function colorToClass(context, color, prefix) {
    let projectColor = findClosestColour(context, color)

    if (!projectColor || projectColor.name.toLowerCase() === context.getOption('color').toLowerCase()) return null

    return prefix + projectColor.name
}

export function fontAndTextClasses(tailwind, context, style) {
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
