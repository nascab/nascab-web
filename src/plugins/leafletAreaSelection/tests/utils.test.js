import { toCamelCase } from '../utils';

describe('utils', () => {
  it('should compose a camel-case class name', () => {
    expect(toCamelCase('foo-bar-baz')).toBe('fooBarBaz');
  });
});
