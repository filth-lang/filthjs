import { createLog } from '@helpers/log';
import { type Environment } from '../environment';
import { EvaluationError } from '../error';
import { isFilthBasicValue, isFilthList, isString } from '../helpers';
import { FilthExpr } from '../types';
import { evalList } from './list';

const log = createLog('filth/eval');

/**
 * Evaluate a Filth expression
 * @param expr - The Filth expression to evaluate
 * @param env - The environment to evaluate the expression in
 * @returns The evaluated Filth expression
 */
export const evaluate = async (
  env: Environment,
  expr: FilthExpr
): Promise<FilthExpr> => {
  if (isFilthBasicValue(expr)) {
    // a number, boolean, or null
    return expr;
  }

  if (isString(expr)) {
    // If the string is already a string value (not a symbol), return it as is
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }
    // Otherwise, it's a symbol that needs to be looked up
    const { value } = env.lookup(expr);

    if (isString(value)) {
      // If the value is another symbol, look it up recursively
      return evaluate(env, value);
    }
    return value;
  }

  // log.debug('[evaluate]', expr);

  if ('type' in expr) {
    if (expr.type === 'quoted') {
      if (isFilthList(expr.expr)) {
        const result = await Promise.all(
          expr.expr.elements.map(async e => await evaluate(env, e))
        );
        return {
          elements: result,
          type: 'list'
        };
      }
      return expr.expr;
    }

    if (expr.type === 'list') {
      // log.debug('[evaluate] list', expr);
      return evalList(env, expr);
    }

    if (expr.type === 'range') {
      return expr;
    }
  }

  throw new EvaluationError(
    `Cannot evaluate expression: ${JSON.stringify(expr)}`
  );
};
