import { describe, expect, it, test } from 'vitest';

import { exprToJson } from '@filth/__test__/helpers';
import { ParseError } from '@filth/error';
import { createFilthPointer } from '@filth/fns/pointer';
import { createFilthList } from '@filth/helpers';
import { FilthJSON, FilthPointer, FilthRange, FilthRegex } from '@filth/types';
import { createLog } from '@helpers/log';

import { parse } from '..';

const log = createLog('filth:parser:test');

describe('Filth', () => {
  describe('Parser', () => {
    describe('Atoms', () => {
      test.each([
        ['123', 123],
        ['-10', -10],
        ['+10', 10],
        ['15.234', 15.234],
        ['abc', 'abc'],
        ['nil', null],
        ['true', true],
        ['false', false],
        ['"Hello, world!"', '"Hello, world!"'],
        [`"Hello, \nworld!"`, '"Hello, world!"']
      ])(`should parse atom %s`, (input, expected) => {
        expect(parse(input)).toBe(expected);
      });
    });

    describe('Lists', () => {
      test.each([
        ['(1 2 3)', [1, 2, 3]],

        ['(1 "hello" 3)', [1, '"hello"', 3]],

        ['(1\n2\n3)', [1, 2, 3]],

        ['(1 (2 3) 4)', [1, [2, 3], 4]],

        [
          '(1 2 3 )  ( 4 5 6)',
          [
            [1, 2, 3],
            [4, 5, 6]
          ]
        ]
      ])('should parse list %s', (input, expected) => {
        expect(exprToJson(parse(input))).toEqual(expected as unknown as JSON);
      });
    });

    describe('Quoted', () => {
      it('should parse quoted expressions', () => {
        expect(parse("'(1 2 3)")).toEqual({
          expr: {
            elements: [1, 2, 3],
            type: 'list'
          },
          type: 'quoted'
        });
      });
    });

    describe('Comments', () => {
      it('should handle comments', () => {
        const input = `
      ; This is a comment
      (1 2 3) ; also a comment
      `;
        const result = parse(input);
        expect(result).toEqual({
          elements: [1, 2, 3],
          type: 'list'
        });
      });
    });

    describe('Ranges', () => {
      test.each([
        ['1..10', { elements: [1, 10], type: 'range' }],
        ['1..10..5', { elements: [1, 10, 5], type: 'range' }],
        ['1..10..5..2', { elements: [1, 10, 5, 2], type: 'range' }],
        ['1..10//2', { elements: [1, 10], step: 2, type: 'range' }],
        ['10..1//-2', { elements: [10, 1], step: -2, type: 'range' }],
        ['-10..-1//2', { elements: [-10, -1], step: 2, type: 'range' }]
      ])('should handle range %s', (input, expected) => {
        const result = parse(input);
        expect(result).toEqual(expected as FilthRange);
      });
    });

    describe('Regex', () => {
      test.each([
        ['/hello/', { hasNamedGroups: false, regex: /hello/, type: 'regex' }],
        ['/hello/i', { hasNamedGroups: false, regex: /hello/i, type: 'regex' }],
        [
          '/door:(?<state>open|closed|locked)/',
          {
            hasNamedGroups: true,
            regex: /door:(?<state>open|closed|locked)/,
            type: 'regex'
          }
        ]
      ])('should handle regex %s', (input, expected) => {
        expect(parse(input)).toEqual(expected as FilthRegex);
      });
    });

    describe('JSON', () => {
      test.each([
        [`{}`, { json: {}, type: 'json' }],
        [`[]`, { json: [], type: 'json' }],
        [`[null, null, null]`, { json: [null, null, null], type: 'json' }],
        [
          `[ 1, 2, three, null, true, true, false ]`,
          { json: [1, 2, 'three', null, true, true, false], type: 'json' }
        ],
        [`[ hello, world ]`, { json: ['hello', 'world'], type: 'json' }],
        [
          `[ "one", "two", 3, 4 ]`,
          { json: ['one', 'two', 3, 4], type: 'json' }
        ],
        [
          `{ values: [ { state: open }, { state: "closed" } ] }`,
          {
            json: { values: [{ state: 'open' }, { state: 'closed' }] },
            type: 'json'
          }
        ],
        [
          '{name: "John", "age": 30}',
          { json: { age: 30, name: 'John' }, type: 'json' }
        ],
        [
          `{
          full-name: "John", age: 30
          }`,
          { json: { age: 30, 'full-name': 'John' }, type: 'json' }
        ]
      ])('should handle JSON %s', (input, expected) => {
        const result = parse(input);
        expect(result).toEqual(expected as unknown as FilthJSON);
      });
      test('it should fail to parse invalid JSON', () => {
        expect(() =>
          parse(`{
          full name: "John", age: 30
          }`)
        ).toThrow(new ParseError('Expected ":" or whitespace but "n" found.'));
      });
    });

    describe('Pointer', () => {
      test.each([
        ['//path/to/key', { path: '/path/to/key', type: 'pointer' }],
        ['//path', { path: '/path', type: 'pointer' }],
        ['//1', { path: '/1', type: 'pointer' }],
        ['//1/two/0', { path: '/1/two/0', type: 'pointer' }]
      ])('should handle pointer %s', (input, expected) => {
        expect(parse(input)).toEqual(expected as FilthPointer);
      });

      test('parse pointer with a list', () => {
        expect(parse('//1 (a b c)')).toEqual(
          createFilthList([
            createFilthPointer('/1'),
            createFilthList(['a', 'b', 'c'])
          ])
        );
      });
    });
  });
});
