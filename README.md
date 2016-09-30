# widjet-json-form [![Build Status](https://travis-ci.org/abe33/widjet-json-form.svg?branch=master)](https://travis-ci.org/abe33/widjet-json-form) [![codecov](https://codecov.io/gh/abe33/widjet-json-form/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-json-form)

A widget to generate forms using a json object descriptor

## Install

```sh
npm install --save widjet-json-form
```

## Usage

The `json-form` widget generates a form in the target element by reading a json schema. Values can be specified for the form to populate the fields.

Two preferred ways are available to define the schema and values for a field:

### Using Script Tags

```js
import widgets from 'widjet'
import 'widjet-json-form'

widgets('json-form', '[data-schema-source]', {on: 'load'})
```

```html
<script id='schema' type='application/json'>
  {
    "title": "string",
    "content": "markdown",
    "publishedAt": "datetime"
  }
</script>
<script id='values' type='application/json'>
  {
    "title": "Here's a title",
    "content": "Then some content",
    "publishedAt": "2016-09-08T20:35:54.855Z"
  }
</script>
<div data-schema-source='schema'
     data-values-source='values'
     data-id='news-form'>
</div>
```

### Using Data Attributes

```js
import widgets from 'widjet'
import 'widjet-json-form'

widgets('json-form', '[data-schema]', {on: 'load'})
```

```html
<div data-schema='{"title": "string", "content": "markdown", "publishedAt": "datetime"}'
     data-values='{"title": "Here&quo;s a title", "content": "Then some content", publishedAt: "2016-09-08T20:35:54.855Z"}'
     data-id='news-form'>
</div>
```

## Form Schema

A form schema is an object whose keys represent the field names and values the field descriptors.

```js
{
  "property": "type",

  "otherProperty": {
    "type": "type",
    "fieldSetting": "whatever"
  }
}
```

The simplest ways to define a field is to create a pair `"property": "type"`. In that case no other configuration will be available in the field template.

The other way is to define a pair `"property": object` where the `object` has a mandatory `type` key. Every other properties of that object will be passed to the field's template as its `parameters`, allowing for a finer setup of the field.

Here's an example of a more complete setup for a field of type `integer`:

```js
{
  "integerField": {
    "type": "integer",
    "hint": "Hint for input of type `integer`. Hints support markdown.",
    "placeholder": "12345",
    "min": 0,
    "max": 1000,
    "step": 10,
    "default": 100,
    "required": true
  }
}
```

It's up to you to support any parameters in your field's input template.

For instance, here's what a Twig template for the field describe above would look like:

```html
<label for='{{ id }}'>{{ attribute }}{% if not parameters.required %} <em> - Optional</em>{% endif %}</label>

{% if parameters.hint %}{% markdown %}{{ parameters.hint }}{% endmarkdown %}{% endif %}

<input type='number'
       id='{{ id }}'
       step='{{ parameters.step|default(1) }}'
       {% if parameters.min %}min='{{ parameters.min }}'{% endif %}
       {% if parameters.max %}max='{{ parameters.max }}'{% endif %}
       value='{{ value|default(parameters.default)|default }}'
       {% if parameters.placeholder %}placeholder="{{ parameters.placeholder }}"{% endif %}
       name='{{ name }}'
       {% if parameters.required %}required{% endif %}>
</input>
```

## Templates

By default the widget will look for templates in the `window.JST` object, all templates being named such as `templates/form/<template-name>`. As with most JS templates, a function that takes a parameters object and returns a HTML string is expected.

Note that the default field's template will look for a template according to the field's type. That means that if the type of the field is `boolean`, the field template will try to render the `templates/form/boolean` with the parameters it received. That means concretely that you just have to create a template to allow a new type of input in the form without any other setup

The default template names being used by the widget are the following:

Name|Path|Description
---|---|---
`form`|`templates/form/form`|The wrapper of the whole form, will receive its content through the `content` parameter. It also receives an `id` that corresponds to the `data-id` defined on the target element.
`field`|`templates/form/field`|The wrapper for a form's field, will receive its content through the `content` parameter as well as the parameters passed to the input (`id`, `name`, `type`, `value`, `attribute`, `attributePath` and `parameters`, see below for a details of what each parameter contains).
`object`|`templates/form/object`|If the field's type is `object` this template will be used as a wrapper for the whole sub-form instead of the `field` one. It receives the exact same parameters that `field`.
`array`|`templates/form/array`|If the field's type is `array` this template will be used as a wrapper for all the items in the array. It receives the same parameters as the `field` and `object` templates.
`arrayItem`|`templates/form/arrayItem`|If the field's type is `array`, the sub-form for each item will be wrapped using this template. The template will receive its `content` and `index` as parameters.

### Templates parameters

Templates that render field wrappers and inputs receive a bunch of parameters depending on the context.

Name|Description
---|---
`id`|The id of the element, the id for a field is generated automatically using the id of its parent form and the attribute path. By default the id for a property `age` of the second item of a `users` array in a form with id `company` would be `company-users-1-age`. This can be changed through widget settings.
`type`|The type of the field as defined in the schema.
`attribute`|The name of the current attribute.
`attributePath`|An array with every component that form the path to the attribute starting from the schema root. For instance, for the property `age` of the second item of the `users` array, the attribute path is `['users', 1, 'age']`
`name`|The input name as generated by the `fieldName` function using the attribute path. By default the name for a property `age` of the second item of a `users` array would be `users[1][age]`. This can be changed through widget settings.
`value`|The value of the field as provided in the `data-values` attribute.
`parameters`|An object with the parameters of the field as defined in the schema.
`content`|Wrapper templates will receive the HTML content to wrap in that parameter.

## Configuration

The widget accepts the following options:

Name|Type|Description
---|---|---
`findTemplate`|`function`|A function that takes the name of a template such as `form` or `array` and must returns a function taking a parameters object and that returns a HTML string.
`fieldId`|`function`|A function that takes the id of the form and an attribute path and that must returns the string id for it.
`fieldName`|`function`|A function that takes an attribute path and that must returns the string name for its input.
`schemaSourceAttribute`|`string`|The attribute to use to look for the schema script source. Defaults to `data-schema-source`.
`schemaAttribute`|`string`|The attribute to use to look for the schema on the target element. Defaults to `data-schema`.
`valueSourceAttribute`|`string`|The attribute to use to look for the values script source. Defaults to `data-values-source`.
`valueAttribute`|`string`|The attribute to use to look for the values on the target element. Defaults to `data-values`.
`idAttribute`|`string`|The attribute to use to look for the form's id on the target element. Defaults to `data-id`.
`renderers`|`array`|An array of custom renderers to be applied before the default ones. See more below about custom renderers.

It's also possible to specify a template for a specific key without specifying a custom template finder function. The default `findTemplate` implementation will look for a property named `<name>Template` on the options object before looking in `window.JST`.

For instance if you just want to use a different template for the form while keeping using the default you can just do:

```js
widgets('json-form', '[data-schema]', {
  on: 'load',
  formTemplate: ({content, id}) =>
    `<div class='form' id='${id}'>${content}</div>`
})
```

### Custom Renderers

A renderer is defined using two functions in an array. The first function is the predicate that defines whether the renderer applies to the passed-in `type`. The second function is a function returning function or a curried function that takes a `renderObject` function and the field's parameters and returns the field's HTML string.

The `renderObject` that is passed to the rendered is so that you can write renderers that are able to include nested forms (as the default object and array renderers do)

When rendering a field, the render engine will loop through all the renderers and call their predicate function with the field's type as argument. The first renderer's predicate to return true with be used and its render function will then be called with the field's parameters object (containing the `id`, `name`, `type`, `value`, `attribute`, `attributePath` and `parameters`).

#### Using a Function Returning Function

```js
const dummyRenderer = [
  type => type === 'boolean',
  renderObject => parameters =>
    `<input type="checkbox"
            name="${parameters.name}"
            id="${parameters.id}"
            ${parameters.value ? 'checked' : ''}>`
]

widgets('json-form', '[data-schema]', {
  on: 'load',
  renderers: [dummyRenderer]
})
```

#### Using a Curried Function

```js
const dummyRenderer = [
  type => type === 'boolean',
  curry2((renderObject, parameters) => {
    return `<input type="checkbox"
                   name="${parameters.name}"
                   id="${parameters.id}"
                   ${parameters.value ? 'checked' : ''}>`
  })
]

widgets('json-form', '[data-schema]', {
  on: 'load',
  renderers: [dummyRenderer]
})
```
