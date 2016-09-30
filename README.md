# widjet-json-form [![Build Status](https://travis-ci.org/abe33/widjet-json-form.svg?branch=master)](https://travis-ci.org/abe33/widjet-json-form) [![codecov](https://codecov.io/gh/abe33/widjet-json-form/branch/master/graph/badge.svg)](https://codecov.io/gh/abe33/widjet-json-form)

A widget to generate forms using a json object descriptor

## Install

```sh
npm install --save widjet-json-form
```

## Usage

The `json-form` widget generates a form in the target element by reading a json schema. Values can be specified for the form to populate the fields.

Two preferred ways are available to define the schema and values for a field:

#### Using Script Tags

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

#### Using Data Attributes

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

### Form Schema

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

### Templates

By default the widget will look for templates in the `window.JST` object, all templates being named such as `templates/form/<template-name>`.

The default template names being used by the widget are the following:

- `form`: The wrapper of the whole form, will receive its content through the `content` parameter. It also receives an `id` that corresponds to the `data-id` defined on the target element.
- `field`: The wrapper for a form's field, will receive its content through the `content` parameter as well as the parameters passed to the input (`id`, `name`, `type`, `value`, `attribute`, `attributePath` and `parameters`, see below for a details of what each parameter contains).
- `object`: If the field's type is `object` this template will be used as a wrapper for the whole sub-form instead of the `field` one. It receives the exact same parameters that `field`.
- `array`: If the field's type is `array` this template will be used as a wrapper for all the items in the array. It receives the same parameters as the `field` and `object` templates.
- `arrayItem`: If the field's type is `array`, the sub-form for each item will be wrapped using this template. The template will receive its `content` and `index` as parameters.

#### Templates parameters

Templates that render field wrappers and inputs receive a bunch of parameters depending on the context.

- `id`: The id of the element, the id for a field is generated automatically using the id of its parent form and the attribute path.
- `type`: The type of the field as defined in the schema.
- `attribute`: The name of the current attribute.
- `attributePath`: An array with every component that form the path to the attribute starting from the schema root.
- `name`: The input name as generated by the `fieldName` function using the attribute path.
- `value`: The value of the field as provided in the `data-values` attribute.
- `parameters`: An object with the parameters of the field as defined in the schema.
- `content`: Wrapper templates will receive the HTML content to wrap in that parameter.
