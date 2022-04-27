import {curry2, curry3, curry4, curryN, merge, inputName, apply} from 'widjet-utils';
import {asTuple, getTypeAndParameters} from './utils';

const defaultFieldId = (id, path) => [id].concat(path).join('-');

export const typeIs = curry2((type, opts) => opts.type === type);
export const typeIsComposite = (opts) =>
  typeof opts.type == 'object' && Array.isArray(opts.type);

export const objectRenderer = ({id: fid, renderField, fieldName, fieldId, rootAttributePath}) => {
  fieldName = fieldName || apply(inputName());
  fieldId = fieldId || defaultFieldId;

  return (schema = {}, values = {}, objectName = []) =>
    asTuple(schema)
      .map(([key, value]) => {
        const attributePath = rootAttributePath.concat(objectName.concat(key));
        const name = fieldName(attributePath);
        const id = fieldId(fid, attributePath);
        const [type, parameters] = getTypeAndParameters(value);

        if (!type) { throw new Error(`Field '${key}' is missing a 'type' key`); }

        return {
          id, type, parameters, name, attributePath,
          attribute: key,
          value: values[key],
        };
      })
      .map(params => renderField(params))
      .reduce((memo, str) => memo + str, '');
};

export const renderObjectField = curry3((tpl, renderObject, opts) =>
  tpl(merge(opts, {
    content: renderObject(opts.parameters.properties, opts.value, opts.attributePath),
  }))
);

export const renderArrayField = curry4((tplUl, tplLi, renderObject, opts) => {
  const itemsType = opts.parameters.items;

  const render = i => renderObject({ [i]: itemsType }, opts.value, opts.attributePath);

  const renderItems = (value, i) => tplLi({ content: render(i), index: i });

  return tplUl(merge(opts, { content: (opts.value || []).map(renderItems).join('') }));
});

export const renderCompositeField = curryN(5, (tplUl, tplLi, renderField, rO, opts) => {
  const types = opts.type;

  const render = type => renderField(rO, {
    type,
    value: opts.value,
    name: opts.name,
  });

  const renderTypes = (type, i) => tplLi({ content: render(type), index: i });

  return tplUl(merge(opts, { content: types.map(renderTypes).join('') }));
});

export const renderDefaultField = curry4((tplWrapper, tplField, rO, opts) =>
  tplWrapper(merge(opts, { content: tplField(opts.type)(opts) }))
);
