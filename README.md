# widjet-json-form [![Build Status](https://travis-ci.org/abe33/widjet-json-form.svg?branch=master)](https://travis-ci.org/abe33/widjet-json-form) [![codecov](https://codecov.io/gh/abe33/widjet-json-form/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-json-form)

A widget to generate forms using a json object descriptor

## Install

```sh
npm install --save widjet-json-form
```

## Usage

The `json-form` widget generates form fields in the target element by reading a json schema. Values can be specified for the form to populate the fields.

Two preferred ways are available to define the schema and values for a field:

### Using Script Tags

Using script tags for schema and values offer the advantages of removing the characters escaping contraints of attributes and readability of indented code at the cost of a heavier markup and the need to have unique ids for every tags.

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

Data attributes offers an easier setup for small forms that doesn't have a lot of settings or complex strings with special characters to escape. It's also more convenient when many forms are to generate on a single space as it doesn't require to inject scripts with unique ids for each forms.

```js
import widgets from 'widjet'
import 'widjet-json-form'

widgets('json-form', '[data-schema]', {on: 'load'})
```

```html
<div data-schema='{"title": "string", "content": "markdown", "publishedAt": "datetime"}'
     data-values='{"title": "Here&quo;s a title", "content": "Then some content", "publishedAt": "2016-09-08T20:35:54.855Z"}'
     data-id='news-form'>
</div>
```

## Form Schema

A form schema is an object whose keys represent the field names, and its values the field descriptors.

```js
{
  "property": "type",

  "otherProperty": {
    "type": "type",
    "fieldSetting": "whatever"
  }
}
```

The simplest way to define a field is to create a pair `"property": "type"`. In that case no other configuration will be available in the field template.

The other way is to define a pair `"property": {object}` where the `object` has a mandatory `type` key. Every other properties of that object will be passed to the field's template as its `parameters`, allowing for a finer setup of the field.

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

It's up to you to decide which parameters your field's input template will support. The only requirement is that the field config contains a `type` key.

For instance, here's what a [Twig](https://github.com/twigjs/twig.js) template for the field described above look like:

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

By default the widget will look for templates in the `window.JST` object, as it's one of the most common places to store javascript templates. All the templates are retrieved using a name such as `json-form/<name>`.

As with most JS templating engine, a template is expected to be a function that takes a parameters object and that returns a HTML string.

Note that the default field's renderer will look for a template according to the field's type. That means that if the type of the field is `boolean`, the field renderer will try to render the `json-form/boolean` with the parameters it received and then pass the result as the `content` parameter to the field template. Concretely, it means that you just have to create a template to allow a new type of input in the form without any other setup

The default template names being used by the widget are the following:

Name|Path|Description
---|---|---
`form`|`json-form/form`|<p>The wrapper of the whole form.</p><p>Parameters: `content`, `id`</p>
`field`|`json-form/field`|<p>The wrapper for a form's field.</p><p>Parameters: `content`, `id`, `name`, `type`, `value`, `attribute`, `attributePath`, `parameters`</p>.
`object`|`json-form/object`|<p>If the field's type is `object` this template will be used as a wrapper for the whole sub-form instead of the `field` one.</p><p>Parameters: `content`, `id`, `name`, `type`, `value`, `attribute`, `attributePath`, `parameters`</p>.
`array`|`json-form/array`|<p>If the field's type is `array` this template will be used as a wrapper for all the items in the array instead of the `field` one.</p><p>Parameters: `content`, `id`, `name`, `type`, `value`, `attribute`, `attributePath`, `parameters`</p>.
`arrayItem`|`json-form/arrayItem`|<p>If the field's type is `array`, the sub-form for each item will be wrapped using this template.</p><p>Parameters: `content`, `id`, `name`, `type`, `value`, `attribute`, `attributePath`, `parameters`</p>.
`<type>`|`json-form/<type>`|<p>Each field types must have their own template.</p><p>Parameters: `id`, `name`, `type`, `value`, `attribute`, `attributePath`, `parameters`</p>.

Defining the templates in the `window.JST` object, or in another object, is up to you. The `json-form` widget doesn't provide any template to let you keep the full control of how forms are rendered.

### Templates parameters

Name|Description
---|---
`id`|<p>The id of the element.</p><p>For a `form` template, the id is either the value provided in the `data-id` or an auto-incremented number id.</p><p>For field-related templates, the id is generated automatically using the id of its parent form and the attribute path. By default the id for a property `age` of the second item of a `users` array in a form with id `company` would be `company-users-1-age`. This can be changed through the `fieldId` widget setting.
`type`|The type of the field as defined in the schema.
`attribute`|The name of the current attribute.
`attributePath`|An array with every components that form the path to the attribute, starting from the schema root. As an example, for the property `age` of the second item of the `users` array, the attribute path is `['users', 1, 'age']`
`name`|The input name, as generated by the `fieldName` function using the attribute path. By default the name for a property `age` of the second item of a `users` array would be `users[1][age]`. This can be changed through the `fieldName` widget setting.
`value`|The value of the field, as provided in the `data-values` attribute.
`parameters`|An object with the parameters of the field, as defined in the schema.
`content`|Wrapper templates will receive the HTML content to include in that parameter.

## Configuration

The widget accepts the following options:

Name|Type|Description
---|---|---
`findTemplate`|`function`|A function that takes the name of a template such as `form` or `array` and must returns a template function taking a parameters object and returning a HTML string.
`fieldId`|`function`|A function that takes the id of the form and an attribute path and that must returns the string id for the field.
`fieldName`|`function`|A function that takes an attribute path and that must returns the string name for its input.
`schemaSourceAttribute`|`string`|The attribute to use when looking for the schema script source. Defaults to `data-schema-source`. The value of the attribute should always be the id of a script tag
`schemaAttribute`|`string`|The attribute to use when looking for the schema on the target element. Defaults to `data-schema`.
`valueSourceAttribute`|`string`|The attribute to use when looking for the values script source. Defaults to `data-values-source`. The value of the attribute should always be the id of a script tag
`valueAttribute`|`string`|The attribute to use when looking for the values on the target element. Defaults to `data-values`.
`idAttribute`|`string`|The attribute to use when looking for the form's id on the target element. Defaults to `data-id`.
`renderers`|`array`|An array of custom renderers to be applied before the default ones. See more below about custom renderers.

The default renderers include renderers for `object`, `array` and the generic `field` renderer.

It's also possible to specify a template for a specific key without specifying a custom template finder function. The default `findTemplate` implementation will look for a property named `<name>Template` on the options object before looking in `window.JST`.

For instance if you just want to use a different template for the form while keeping using the defaults one for the other templates you can just do:

```js
widgets('json-form', '[data-schema]', {
  on: 'load',
  formTemplate: ({content, id}) =>
    `<div class='form' id='${id}'>${content}</div>`
})
```

### Custom Renderers

A renderer is defined using two functions in an array.
The first function is the predicate that defines whether the renderer applies to the passed-in `type`.
The second function is a function returning function or a curried function that takes a `renderObject` function and the field's parameters and returns the field's HTML string.

The `renderObject` function that is passed to the render function is here so that you can write renderers that are able to include nested forms (as the default `object` and `array` renderers do).

When rendering a field, the render engine will loop through all the renderers and call their predicate function with the field's type as argument. The first renderer whose predicate function returns true will be used and its render function will then be called with the field's parameters object (containing the `id`, `name`, `type`, `value`, `attribute`, `attributePath` and `parameters`).

#### Using a Function Returning Function

```js
const dummyRenderer = [
  type => type === 'boolean',
  renderObject => parameters =>
    `<input type="checkbox"
            value="1"
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
                   value="1"
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
