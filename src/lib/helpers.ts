import { Environment } from './environment';
import { EvaluationError } from './error';
import {
  FilthBasicValue,
  FilthBuiltinFunction,
  FilthExpr,
  FilthFunction,
  FilthJSON,
  FilthJSONArray,
  FilthJSONObject,
  FilthList,
  FilthNil,
  FilthQuotedExpr,
  FilthRange,
  FilthRegex,
  FilthValue
} from './types';

export const createFilthList = (elements: FilthExpr[]): FilthList => ({
  elements,
  type: 'list'
});

export const getFilthType = (expr: FilthExpr): string => {
  if (isFilthBasicValue(expr)) {
    return typeof expr;
  }
  return typeof expr === 'object' && 'type' in expr ? expr.type : typeof expr;
};

export const isFilthEnv = (expr: unknown): expr is Environment =>
  // eslint-disable-next-line @nkzw/no-instanceof
  expr instanceof Environment;

export const isPromise = (expr: unknown): boolean =>
  expr !== null &&
  typeof expr === 'object' &&
  'then' in expr &&
  typeof expr.then === 'function';

export const isFilthString = (expr: unknown): expr is string =>
  typeof expr === 'string';

export const isFilthNil = (expr: unknown): expr is FilthNil =>
  expr === null ||
  expr === undefined ||
  (typeof expr === 'object' && 'type' in expr && expr.type === 'nil');

export const isFilthList = (expr: unknown): expr is FilthList =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'list';

export const isFilthFunction = (expr: unknown): expr is FilthFunction =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'function';

export const isFilthQuotedExpr = (expr: unknown): expr is FilthQuotedExpr =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'quoted';

export const isFilthRange = (expr: unknown): expr is FilthRange =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'range';

export const isFilthRegex = (expr: unknown): expr is FilthRegex =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'regex';

export const isFilthJSON = (expr: unknown): expr is FilthJSON =>
  expr !== null &&
  typeof expr === 'object' &&
  'type' in expr &&
  expr.type === 'json';

export const isFilthJSONObject = (expr: unknown): expr is FilthJSONObject =>
  expr !== null && typeof expr === 'object';

export const isFilthJSONArray = (expr: unknown): expr is FilthJSONArray =>
  expr !== null && typeof expr === 'object' && Array.isArray(expr);

export const isFilthBasicValue = (expr: unknown): expr is FilthBasicValue =>
  expr === null || typeof expr === 'number' || typeof expr === 'boolean';

export const isFilthNumber = (expr: unknown): expr is number =>
  typeof expr === 'number';

export const isFilthValue = (expr: unknown): expr is FilthValue =>
  typeof expr === 'number' ||
  typeof expr === 'string' ||
  typeof expr === 'boolean';

export const removeQuotes = (expr: string) => {
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1);
  }
  return expr;
};

export const isFilthBuiltinFunction = (
  expr: unknown
): expr is FilthBuiltinFunction => typeof expr === 'function'; // && 'type' in expr && expr.type === 'builtin';

export const isFilthExpr = (expr: unknown): expr is FilthExpr =>
  isFilthBasicValue(expr) ||
  isFilthValue(expr) ||
  isFilthList(expr) ||
  isFilthBuiltinFunction(expr) ||
  isFilthFunction(expr) ||
  isFilthQuotedExpr(expr) ||
  isFilthRange(expr);

export const isTruthy = (
  value: null | false | undefined | string | FilthExpr
) =>
  value !== null &&
  value !== false &&
  value !== undefined &&
  isFilthValue(value) &&
  value !== 'false';

export const isFalsey = (
  value: null | false | undefined | string | FilthExpr
) =>
  value === null || value === false || value === undefined || value === 'false';

export const checkRestParams = (params: FilthExpr[]) => {
  const parameters: string[] = [];
  let hasRest = false;
  let restParam = '';

  for (let ii = 0; ii < params.length; ii++) {
    const param = params[ii];
    if (param === '.' || param === '@rest' || param === '...') {
      hasRest = true;
      if (ii + 1 >= params.length) {
        throw new EvaluationError('rest parameter missing');
      }
      const nextParam = params[ii + 1];
      if (!isFilthString(nextParam)) {
        throw new EvaluationError('rest parameter must be a symbol');
      }
      restParam = nextParam;
      break;
    }
    if (!isFilthString(param)) {
      throw new EvaluationError('parameter must be a symbol');
    }
    parameters.push(param);
  }

  return { hasRest, parameters, restParam };
};

export const listExprToString = (expr: unknown): string => {
  if (isFilthValue(expr)) {
    return expr + '';
  }
  if (isFilthNil(expr)) {
    return 'nil';
  }
  if (isFilthList(expr)) {
    return `( ${expr.elements.map(listExprToString).join(' ')} )`;
  }
  if (isFilthFunction(expr)) {
    return `( lambda (${expr.params.map(param => param).join(' ')}) ${listExprToString(expr.body)} )`;
  }
  if (isFilthBuiltinFunction(expr)) {
    return `#<builtin ${expr.name}>`;
  }
  if (isFilthQuotedExpr(expr)) {
    return `'${listExprToString(expr.expr)}`;
  }
  if (isFilthRange(expr)) {
    return `${expr.elements.join('..')}${expr.step ? `//${expr.step}` : ''}`;
  }
  if (isFilthJSON(expr)) {
    return JSON.stringify(expr.json);
  }

  return JSON.stringify(expr);
};
