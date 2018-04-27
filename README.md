# Tailwind Zeplin Extension

Utilities to generate Tailwind Config and classes for your design.

Sample colors output:
```js
const colors = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  yellow: "#ffff00",
  black: "#000000",
  black50: "rgba(0, 0, 0, 0.5)",
  white: "#ffffff"
};
```

Sample component (text style) output:
```css
.sample-text-style {
  @apply .text-xl .font-sfprotext;
}
.sample-text-style-with-color {
  @apply .text-xl .font-sfprotext .text-red;
}
```

Sample text layer output:

```html
<p class="large-blue">Get paid for business introductions!</p>
<p class="text-4xl font-ubuntu leading-normal font-medium text-greyish-brown">Receive loads of high-level business introductions to new clients, investors and job candidates!</p>
```

Sample shape layer output:

```html
<div class="rounded-default shadow bg-white max-w-2xl min-h-xs"></div>
<!-- sm -->
<div class="sm:rounded-default sm:shadow sm:bg-white sm:max-w-2xl sm:min-h-xs"></div>
<!-- md -->
<div class="md:rounded-default md:shadow md:bg-white md:max-w-2xl md:min-h-xs"></div>
<!-- lg -->
<div class="lg:rounded-default lg:shadow lg:bg-white lg:max-w-2xl lg:min-h-xs"></div>
<!-- xl -->
<div class="xl:rounded-default xl:shadow xl:bg-white xl:max-w-2xl xl:min-h-xs"></div>
```

## Options

### Tailwind Config

If this isn't supplied, the default Tailwind config will be used. If you've customised the config you can import it to generate appropriate classes for your project. 

To export your current config, add the following lines to the bottom of your `tailwind-config.js`:

```js
console.log(JSON.stringify(module.exports))
```

Then copy and paste the JSON into the settings area, you can then delete the above line.

### Default Font

Specify your default font here and it will be excluded from the generated classes. 

### Default Colour

Specify your default colour here and it will be excluded from the generated classes.

## Usage

If you have node >= 5.2.0, use `npx`:

    npx tailwind-zeplin-extension start

Otherwise:

    git clone https://github.com/morrislaptop/tailwind-zeplin-extension.git
    cd tailwind-zeplin-extension
    yarn # or npm install
    yarn start

You can add them to your Zeplin projects locally from their Extensions window.

On Mac, Windows or Web apps, holding down the Option key will enable the “Add Local Extension” option on the title bar:

![Add local extension](https://raw.githubusercontent.com/zeplin/zeplin-extension-documentation/master/img/addLocalExtension.png)

After running the script, enter http://localhost:7070/manifest.json as the URL and click Add.

That's pretty much it. Go ahead, click a layer!

![Hello Layer](https://raw.githubusercontent.com/zeplin/zeplin-extension-documentation/master/img/codeSnippet.png)

## Development

See [#1](https://github.com/morrislaptop/tailwind-zeplin-extension/issues/1) for the list of Tailwind classes supported. 

Tailwind Zeplin Extension is developed using [zem](https://github.com/zeplin/zem), Zeplin Extension Manager. zem is a command line tool that lets you quickly create and test extensions.

To learn more about zem, [see documentation](https://github.com/zeplin/zem).
