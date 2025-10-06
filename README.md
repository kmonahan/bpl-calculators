# BPL PSA Calculators

Created for the Boston Public Library Professional Staff Association.

## Adding to the Site
1. Upload `calculators.js` to wherever Squarespace puts custom JS files and add to the site.
```html
<script src="/path/to/file/calculators.js" defer async></script>
```
If you cannot add custom JS files, copy the contents of `calculators.js` and add it to the header or footer with code injection:
```html
<script defer async>
  // Full contents of calculators.js
</script>
```
2. Wherever you want to place the Leave Carryover Calculator, add the following markup in a code block:
```html
<leave-calculator>
  <p>[This will only display while the calculator is loading or if something breaks, so you can put something like "Loading..."]</p>
</leave-calculator>
```
3. Wherever you want to place the Estimated Retirement Payout Calculator, add the following markup in a code block:
```html
<payout-calculator>
  <p>[Same as before; this is your loading message.]</p>
</payout-calculator>
```

### Squarespace References
[Adding custom JavaScript to a template](https://developers.squarespace.com/custom-javascript/) (You will need to be on version 7.0 to access the Squarespace Developer Platform)

[Using code injection](https://support.squarespace.com/hc/en-us/articles/205815908-Using-code-injection)

[Code blocks](https://support.squarespace.com/hc/en-us/articles/206543167-Code-blocks)

## Styling
Calculator styles make use of the CSS variables Squarespace provides. In theory, this means you can add them to either
a default or a themed section, and they'll use the appropriate colors. It also means that if Squarespace ever changes
what it calls the CSS variables, you will need to make updates to the code.

## Making Changes
The top of `calculators.js` includes constants that can be updated pretty easily if any of the values used for calculations change. 
Anything below that, including the styling, may require a developer to update. To keep things as simple as possible, 
code uses plain JavaScript and web components, no npm packages or other dependencies.

## Demo
To see a demo of both calculators, open index.html in any browser. Note that Dapifer, the heading font, is only available
through Adobe Fonts, so you will see a fallback font (Georgia) used on the demo page.