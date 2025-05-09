import { Environment } from '@filth/env/env';
import { evaluate } from '@filth/eval/evaluate';
import {
  createFilthList,
  isFilthJSON,
  isFilthJSONArray,
  isFilthJSONObject,
  isFilthString,
  removeQuotes
} from '@filth/helpers';
import { FilthExpr, FilthJSON, FilthJSONArray } from '@filth/types';
import { createLog } from '@helpers/log';
import JSONPointer from 'json-pointer';

const log = createLog('eval/range');

export const evalJSON = async (
  env: Environment,
  expr: FilthJSON,
  args: FilthExpr[]
): Promise<FilthExpr> => {
  const evaluatedArgs = await Promise.all(
    args.map(async arg => await evaluate(env, arg))
  );

  const isObj = isFilthJSONObject(expr.json);
  const isArr = isFilthJSONArray(expr.json);

  // log.debug('[evalJSON] expr', expr, evaluatedArgs);

  const result: FilthExpr[] = [];

  for (const arg of evaluatedArgs) {
    if (isFilthString(arg)) {
      const dequotedArg = removeQuotes(arg);
      const ptr = dequotedArg.startsWith('/') ? dequotedArg : `/${dequotedArg}`;
      const pointerResult = JSONPointer.get(expr.json, ptr);
      result.push(pointerResult);
    }

    if (isFilthJSON(arg)) {
      if (isFilthJSONObject(arg.json)) {
        if (isObj) {
          expr.json = { ...expr.json, ...arg.json };
        }
      }
      if (isFilthJSONArray(arg.json)) {
        if (isArr) {
          expr.json = [...(expr.json as FilthJSONArray), ...arg.json];
        }
      }
    }
  }

  return result.length > 0 ? createFilthList(result) : expr;
};
