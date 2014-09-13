
# setup project

 * define canny-mods in use cases
 * define less files for modules
 * add style guide to each less module

```css
  // c-panel
  //
  // define c-panel style
  //
  // Markup:
  // <div canny-mod="c-panel" class="c-panel">default markup</div>
  //
  // Styleguide 1.2
```

## content definition

 * no page design -> design system of components
 * atomic design: atoms -> molecules -> organism -> templates -> pages
   * atoms: HTML tags like input button link headline - things which can break in smaller pieces
   * molecules: like form: input field + label + button <- can have first design
   * organism: like header: with menu, with form for login
   * templates for bundle of organism: header, footer, content, slider, carousel - summarize and organize organism
   * pages: summarize templates
 * split design and layout


## canny advantages
 * good for test environments: canny has no dom dependencies
   * only if a dom element is detected canny will parse and
 initialize it. Is there no dom canny-mods will be not activated