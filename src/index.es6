import widgets from 'widjet';
import {getNode, curry2, when, always} from 'widjet-utils';
import {typeIs, objectRenderer, renderObjectField, renderArrayField, renderDefaultField} from './renderers';
import {getNextID} from './utils';

const textContent = (n) => n.innerText || n.textContent;
const jsonAttribute = (node, attr) => JSON.parse(node.getAttribute(attr));
const jsonSourceAttribute = (node, attr) =>
  JSON.parse(textContent(document.getElementById(node.getAttribute(attr))));

const jsonData = (node, attr, sourceAttr) =>
  (node.hasAttribute(sourceAttr)
    ? jsonSourceAttribute(node, sourceAttr)
    : jsonAttribute(node, attr)) || {};

export const formRenderer = curry2((options, data) => {
  const {schema, values} = data;
  const id = data.id || getNextID();
  const rootAttributePath = data.rootAttributePath || [];

  const renderers = options.renderers.map(([p, r]) => [
    p, r((a, b, c, d) => renderObject(a, b, c, d)),
  ]);

  const renderObject = objectRenderer({
    id,
    fieldId: options.fieldId,
    fieldName: options.fieldName,
    renderField: when(renderers),
  });

  return options.formTemplate({ id, content: renderObject(schema, values, rootAttributePath) });
});

widgets.define('json-form', (options) => {
  const tpl = options.findTemplate || (s =>
    options[`${s}Template`] || window.JST[`json-form/${s}`]
  );
  const schemaSourceAttribute = options.schemaSourceAttribute || 'data-schema-source';
  const schemaAttribute = options.schemaAttribute || 'data-schema';
  const valueSourceAttribute = options.valueSourceAttribute || 'data-values-source';
  const valueAttribute = options.valueAttribute || 'data-values';
  const idAttribute = options.idAttribute || 'data-id';

  const DEFAULT_RENDERERS = [
    [typeIs('object'), renderObjectField(tpl('object'))],
    [typeIs('array'), renderArrayField(tpl('array'), tpl('arrayItem'))],
    [always, renderDefaultField(tpl('field'), t => tpl(t))],
  ];

  const render = formRenderer({
    formTemplate: tpl('form'),
    fieldId: options.fieldId,
    fieldName: options.fieldName,
    renderers: (options.renderers || []).concat(DEFAULT_RENDERERS),
  });

  return (container) => {
    const id = container.getAttribute(idAttribute);
    const schema = jsonData(container, schemaAttribute, schemaSourceAttribute);
    const values = jsonData(container, valueAttribute, valueSourceAttribute);
    const rootAttributePath = container.dataset.rootAttributePath
      ? container.dataset.rootAttributePath.split(',')
      : [];

    container.appendChild(getNode(render({schema, values, id, rootAttributePath})));

    window.requestAnimationFrame(() =>
      widgets.dispatch(container, 'json-form:ready')
    );
  };
});
