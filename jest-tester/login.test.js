import {
  showForm, showSelection, resetForms, showSuccessMessage, changeAccountType
} from '../login.js';
let selectionBox, loginForm, signupForm, form, errorDiv, successBox, accountType;
beforeEach(() => {
  document.body.innerHTML = `
      <div id="selectionBox" style="display: block;"></div>
      <div id="loginForm" style="display: none;"></div>
      <div id="signupForm" style="display: none;"></div>
      <div id="extraFields"></div>
      <div id="selectionBox" style="display: block;"></div>
      <select id="accountType">
      <option value="pro">Pro</option>
      <option value="business">Business</option>
      <option value="ngo">NGO</option>
    </select>
    <div id="extraFields"></div>
    `;
  selectionBox = document.getElementById('selectionBox');
  loginForm = document.getElementById('loginForm');
  signupForm = document.getElementById('signupForm');
  successBox = document.createElement('div');
  accountType = document.getElementById('selectionBox');
  jest.useFakeTimers();
  global.FormData = class {
    constructor(form) {
      this.form = form;
      this.entries = [['username', 'testuser'], ['password', 'pleaseWork']];
    }
  }
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
test('showForm', () => {
  showForm('login');
  expect(selectionBox.style.display).toBe('none');
  expect(loginForm.style.display).toBe('block');
  expect(signupForm.style.display).toBe('none');
  showForm('signup');
  expect(loginForm.style.display).toBe('none');
  expect(signupForm.style.display).toBe('block');
});

test('showSelection', () => {
  showSelection();
  expect(document.getElementById('selectionBox').style.display).toBe('block');
  expect(document.getElementById('loginForm').style.display).toBe('none');
  expect(document.getElementById('signupForm').style.display).toBe('none');
})

test('resetForms', () => {
  document.body.innerHTML = `
  <form id="signupForm">
        <input value="Aimee" style="border: 2px solid red;" />
        <select><option value="1" selected>One</option></select>
        <textarea>Some text</textarea>
      </form>
      <form id="loginForm">
        <input value="hello@example.com" style="border: 2px solid red;" />
      </form>
      <div class="errorMessage" style="display: block;">Required</div>
      <div id="extraFields">Some dynamic stuff</div>
    `;
  resetForms();
  const signupInputs = document.querySelectorAll('#signupForm input, #signupForm select, #signupForm textarea');
  const loginInputs = document.querySelectorAll('#loginForm input');

  [...signupInputs, ...loginInputs].forEach(input => {
    expect(input.value).toBe('');
  });

  const errorMessages = document.querySelectorAll('.errorMessage');
  errorMessages.forEach(error => {
    expect(error.innerHTML).toBe('');
    expect(error.style.display).toBe('none');
  });
  const extraFields = document.getElementById('extraFields');
  expect(extraFields.innerHTML).toBe('');
})

test('showSuccessMessage', () => {
  const callbackMock = jest.fn();
  showSuccessMessage('Success! Operation completed.', callbackMock);
  const successBox = document.querySelector('.success-box');
  expect(successBox).toBeTruthy();
  expect(successBox.innerHTML).toBe('Success! Operation completed.');
  jest.advanceTimersByTime(2000);
  expect(callbackMock).toHaveBeenCalledTimes(1);
})

test('changeAccountType', () => {
  changeAccountType();
  const select = document.getElementById('accountType');
  select.value = 'pro';
  select.dispatchEvent(new Event('change'));
  const extraFields = document.getElementById('extraFields');
  expect(extraFields.innerHTML).toContain('id="years-experience"');
  select.value = 'business';
  select.dispatchEvent(new Event('change'));
  expect(extraFields.innerHTML).toContain('id="product-category"');
  select.value = 'ngo';
  select.dispatchEvent(new Event('change'));
  expect(extraFields.innerHTML).toContain('id="ngo-description"');
})