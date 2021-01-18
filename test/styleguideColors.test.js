import ext from '../src/index'
import data from './sample-data'
import { Color } from "@zeplin/extension-model";


test('exports JS to set the colors array', () => {
  let js = ext.styleguideColors({}, data.project.colors.map(data => new Color(data)))

  let expected = `let colors = {
  "red": "#ff0000",
  "green": "#00ff00",
  "blue": "#0000ff",
  "yellow": "#ffff00",
  "black": "#000000",
  "black50": "#000000",
  "white": "#ffffff"
}`

    expect(js.code).toBe(expected)
});
