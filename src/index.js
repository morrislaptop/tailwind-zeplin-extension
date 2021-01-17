import s from 'string'
import _ from 'lodash'
import {
    readTailwindConfig,
    fontAndTextClasses,
    textLayerToCode,
    shapeLayerToCode,
} from './helpers';

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

function screen(context, selectedVersion, selectedScreen) {}
function component(context, selectedVersion, selectedComponent) {}
function colors(context) {}
function textStyles(context) {}
function spacing(context) {}
function exportColors(context) {}
function exportTextStyles(context) {}
function exportSpacing(context) {}

/**
 * The following functions will be deprecated. Your extensions can export them to support old versions of Zeplin's macOS app.
 * See Zeplin Extensions migration guide for details:
 * https://zpl.io/shared-styleguides-extensions-migration-guide
 */

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

function comment(context, text) {
    return `/* ${text} */`;
}

export default {
    layer,
    screen,
    component,
    colors,
    textStyles,
    spacing,
    exportColors,
    exportTextStyles,
    exportSpacing,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles,
    comment
};
