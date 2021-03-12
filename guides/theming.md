# Theming your Angular Material app

## What is theming?

Angular Material's theming system lets you customize color and typography styles for components
in your application. The theming system is based on Google's
[Material Design][material-design-theming] specification.

This document describes the concepts and APIs for customizing colors. For typography customization,
see [Angular Material Typograpy][mat-typography]. For guidance on building components to be
customizable with this system, see [Theming your own components][theme-your-own].

[material-design-theming]: https://material.io/design/material-theming/overview.html
[mat-typography]: https://material.angular.io/guide/typography
[theme-your-own]: https://material.angular.io/guide/theming-your-components

### Sass

Angular Material's theming APIs are built with [Sass](https://sass-lang.com). This document assumes
familiary with CSS and Sass basics, including variables, functions, and mixins. 

You can use Angular Material without Sass by using a pre-built theme, described in
[Using a pre-built theme]() below. However, using the library's Sass API directly will give you the
most control over the styles in your application.

## Palettes

A **palette** is a collection of colors representing a portion of color space. Each value in this
collection is called a **hue**. In Material Design, the hues in a palette are numbered from zero
to 900, lightest to darkest.

Angular Material represents a palette as a [Sass map][sass-maps]. This map contains the
palette's hues and another nested map of contrast colors for each of the hues. The contrast colors
serve as text color when using a hue as a background color. The example below demonstrates the
structure of a palette.

```scss
$indigo: (
  50: #e8eaf6,
  100: #c5cae9,
  200: #9fa8da,
  300: #7986cb,
  // ... continues to 900
  contrast: (
    50: rgba(black, 0.87),
    100: rgba(black, 0.87),
    200: rgba(black, 0.87),
    300: white,
    // ... continues to 900
  )
);
```

[sass-maps]: https://sass-lang.com/documentation/values/maps

### Predefined palettes

Angular Material offers 19 predefined palettes based on the 2014 version of the Material Design
spec. See the [Material Design 2014 color palettes][2014-palettes] for a full list.

In addition to hues numbered from zero to 900, the 2014 Material Design palettes each include
distinct _accent_ hues numbered as `A100`, `A200`, `A400`, and `A700`.

```scss
@use '~@angular/material' as mat;

$my-palette: mat.$indigo-palette;
```

[2014-palettes]: https://material.io/archive/guidelines/style/color.html#color-color-palette


## Themes

A **theme** is a collection of color and typography options. Each theme includes three palettes that
determine component colors: 

* A "primary" palette for the color that appears most frequently throughout your application
* An "accent", or _secondary_, palette used to selectively highlight key parts of your UI
* A "warn" palette used for warnings and error states

You can include the CSS styles for a theme in your application in one of two ways: by defining a
custom theme with Sass, or by importing a pre-built theme CSS file.

### Custom themes with Sass

A **theme file** is a Sass file that calls Angular Material Sass mixins to output color and
typography CSS styles.  

#### The `core` mixin

Angular Material defines a mixin named `core` that includes prerequisite styles for common
features used by multiple components, such as ripples. The `core` mixin must be included exactly
once for your application, even if you define multiple themes.

```scss
@use '~@angular/material' as mat;

@include mat.core();
``` 

#### Defining a theme

Angular Material represents a theme as a Sass map that contains your color and typography
choices. For more about typography customization, see [Angular Material Typograpy][mat-typography].

Constructing the theme first requires defining your primary and accent palletes, with an optional
warn palette. The `define-palette` Sass function accepts a color palette, described in the
[Palette]() section above, as well as four optional hue numbers. These four hues represent, in
order: the "default" hue, a "lighter" hue, a "darker" hue, and a "text" hue. Components will use
these hues to choose the most appropriate color for different parts of themselves. 

```scss
@use '~@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-warn: mat.define-palette(mat.$red-palette);
```

You can construct a theme by calling either `define-light-theme` or `define-dark-theme` with
the result from `define-palette`. The choice of a light versus a dark theme will determine
background and foreground colors used throughout the components.

```scss
@use '~@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

// The "warn" palette is optional and defaults to red if not specified.
$my-accent: mat.define-palette(mat.$red-palette);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  )
));
```

#### Applying a theme to components

The `core-theme` Sass mixin emits prerequisite styles for common features used by multiple
components. This mixin must be included once per theme.

Each Angular Material component has a "color" mixin that emits the component's color styles and
a "typography" mixin that emits the component's typography styles. 

Additionally, each component has a "theme" mixin that emits styles for both color and typography if
they are specified in the theme defined by `define-light-theme` or `define-dark-theme`. Apply the
styles for each of the components used in your application by including each of their theme Sass
mixins.

```scss
@use '~@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
  )
));

// Emit theme-dependent styles for common features used across multiple components.  
@include mat.core-theme($my-theme);

// Emit styles for MatButton based on `$my-theme`. Because the configuration
// passed to `define-light-theme` omits typography, `button-theme` will not
// emit any typography styles.
@include mat.button-theme($my-theme);

// Include the theme mixins for other components you use here.
```

As an alternative to listing every component that your application uses, Angular Material offers
Sass mixins that includes styles for all components in the library: `all-component-colors`,
`all-component-typographies`, and `all-component-themes`. These mixins behave the same as individual
component mixins, except they emit styles for `core-theme` and _all_ 35+ components in Angular
Material. Unless your application uses every single component, this will produce unecessary CSS.

```scss
@use '~@angular/material' as mat;

$my-primary: mat.define-palette(mat.$indigo-palette, 500);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
  )
));

@include mat.all-component-themes($my-theme);
```

To include the emitted styles in your application, [add your theme file to the `styles` array of
your project's `angular.json` file][adding-styles].

<!-- TODO: example here -->

[adding-styles]: https://angular.io/guide/workspace-config#styles-and-scripts-configuration

### Using a pre-built theme

Angular Material includes four pre-built theme CSS files, each with different palettes selected.
You can use one of these pre-built themes if you don't want to define a custom theme with Sass.

| Theme                  | Light or dark? | Palettes (primary, accent, warn) |
|------------------------|----------------|----------------------------------|
| `deeppurple-amber.css` | Dark           | deep-purple, amber, red          |
| `indigo-pink.css`      | Light          | indigo, pink, red                |
| `pink-bluegray.css`    | Dark           | pink, bluegray, red              |
| `purple-green.css`     | Light          | purple, green, red               |


These files include the CSS for every component in the library. To include only the CSS for a subset
of components, you must use the Sass API detailed in [Defining a theme ]() above.

You can find the pre-built theme files in the "prebuilt-themes" directory of Angular Material's
npm package (`@angular/material/prebuilt-themes`). To include the pre-built theme in your
application, [add your chosen CSS file to the `styles` array of your project's `angular.json`
file][adding-styles]. 

<!-- TODO: example here -->

### Defining multiple themes

Using the Sass API described in [Defining a theme](), you can also define _multiple_ themes by
repeating the API calls multiple times. You can do this either in the same theme file or in separate
theme files.

#### Multiple themes in one file

Defining multiple themes in a single file allows you to support mutliple themes without having to
manage loading of multiple CSS assets. The downside, however, is that your CSS will include more
styles than will be applied at any given time.

To control which theme applies when, `@include` the mixins only within a context specified via
CSS rule declaration. See the [documentation for Sass mixins][sass-mixins] for further background.

[sass-mixins]: https://sass-lang.com/documentation/at-rules/mixin

```scss
@use '~@angular/material' as mat;

// Define a light theme
$light-primary: mat.define-palette(mat.$indigo-palette);
$light-accent: mat.define-palette(mat.$pink-palette);
$light-theme: mat.define-light-theme((
  color: (
    primary: $light-primary,
    accent: $light-accent,
  )
));

// Define a dark theme
$dark-primary: mat.define-palette(mat.$pink-palette);
$dark-accent: mat.define-palette(mat.$bluegray-palette);
$dark-theme: mat.define-dark-theme((
  color: (
    primary: $dark-primary,
    accent: $dark-accent,
  )
));

// Apply the dark theme by default
@include mat.core-theme($dark-theme);
@include mat.button-theme($dark-theme);

// Apply the light theme only when the `.my-light-theme` CSS class is applied
// to an ancestor element of the components (such as `body`).
.my-light-theme {
  @include mat.core-theme($light-theme);
  @include mat.button-theme($light-theme);
}
```

#### Multiple themes across separate files

You can define multiple themes in seprate files by creating multiple theme files per
[Defining a theme](), adding each of the files to the `styles` of your `angular.json`. However, you
should additionally set the `inject` option for each of these files to `false` in order to prevent
all the theme files from being loaded at the same time. When setting this property to `false`,
your application becomes responsible for manually loading the desired file. The approach for this
loading will depend on your application.
