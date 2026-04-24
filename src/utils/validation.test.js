import { isEmailValid } from './validation';

test('valid email test', () => {
  expect(isEmailValid('test@gmail.com')).toBe(true);
});

test('invalid email test', () => {
  expect(isEmailValid('testgmail.com')).toBe(false);
});
