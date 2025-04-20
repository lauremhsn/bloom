import { editButton, saveButton, exitButton, changes, postRelated, postSubmission, setNewPfp, getNewPfp } from "../businessProfile";

let editBtn, saveBtn, editBox, closeEB, nameFr, number, sidebarPfp, pfpMain, profilePicInput, fileInput, editNameInput, editNumberInput, nameLimit, addPostBtn, postModal, closePostModal, submitPost, postText, postMedia, postList, newPfp;

beforeEach(() => {
  editBtn = document.createElement('button');
  editNameInput = document.createElement('input');
  profilePicInput = document.createElement('img');
  pfpMain = document.createElement('img');
  nameFr = document.createElement('h1');
  editBox = document.createElement('div');
  nameLimit = document.createElement('p');
  number = document.createElement('p');
  saveBtn = document.createElement('button');
  editNumberInput = document.createElement('input');
  sidebarPfp = document.createElement('img');
  closeEB = document.createElement('span');
  fileInput = document.createElement('input');
  addPostBtn = document.createElement('button');
  postModal = document.createElement('div');
  closePostModal = document.createElement('span');
  submitPost = document.createElement('button');
  postMedia = document.createElement('input');
  postText = document.createElement('textarea');
  postList = document.createElement('div');
  fileInput.type = 'file';
  newPfp = document.createElement('img');
  nameFr.textContent = 'Paul';
  pfpMain.src = 'pic.jpg';
  number.textContent = '1';
  sidebarPfp.src = 'pic.jpg';
  editBox.style.display = 'none';
  postMedia.type = 'file';
}
)
test('editButton', () => {
  editButton(editBtn, editNameInput, profilePicInput, pfpMain, nameFr, editBox, nameLimit);
  editBtn.click();
  expect(editNameInput.value).toBe('Paul');
  expect(profilePicInput.src).toBe(pfpMain.src);
  expect(nameLimit.textContent).toBe(`${editNameInput.value.length}/50`);
  expect(editBox.style.display).toBe('flex');
  editNameInput.value = 'reduce number';
  editNameInput.dispatchEvent(new Event('input'));
  expect(nameLimit.textContent).toBe('13/50')
})

test('saveButton', () => {
  saveButton(saveBtn, editNameInput, number, nameFr, pfpMain, sidebarPfp, editBox, editNumberInput)
  editNameInput.value = 'Aimee';
  editNumberInput.value = '483257';
  setNewPfp('pic2.jpg');
  saveBtn.click();
  expect(nameFr.textContent).toBe('Aimee');
  expect(number.textContent).toBe('🌱 To contact call: 483257');
  expect(editBox.style.display).toBe('none');
  expect(sidebarPfp.src).toContain('pic2.jpg');
  expect(pfpMain.src).toContain('pic2.jpg');
})

test('exitButton', () => {
  exitButton(closeEB, editBox);
  expect(editBox.style.display).toBe('none');
})

test('changes', () => {
  const fakeFile = new Blob(['file contents'], { type: 'image/png' });
  const fakeResult = 'test';
  const fakeFileReaderInstance = {
    readAsDataURL: jest.fn(),
    onload: null,
  };
  global.FileReader = jest.fn(() => fakeFileReaderInstance);
  changes(fileInput, profilePicInput);
  const event = new Event('change');
  Object.defineProperty(event, 'target', {
    writable: false,
    value: { files: [fakeFile] },
  });
  fileInput.dispatchEvent(event);
  const fakeEvent = { target: { result: fakeResult } };
  fakeFileReaderInstance.onload(fakeEvent);
  expect(profilePicInput.src).toContain(fakeResult);
  expect(getNewPfp()).toContain(fakeResult);
})

test('postRelated', () => {
  postModal.style.display = 'none';
  postRelated(addPostBtn, postModal, closePostModal);
  addPostBtn.click();
  expect(postModal.style.display).toBe('flex');
  closePostModal.click();
  expect(postModal.style.display).toBe('none');
})

test('postSubmission', () => {
  postSubmission(submitPost, postMedia, postText, postList, postModal);
  postText.value = 'text only test';
  submitPost.click();
  const post = postList.querySelector('.update');
  expect(post.textContent).toBe('text only test');
  expect(postModal.style.display).toBe('none');
  postText.value = null;

  const fakeFile = new Blob(['file contents'], { type: 'image/png' });
  const fakeResult = 'test';
  const fakeFileReaderInstance = {
    readAsDataURL: jest.fn(),
    onload: null,
  };
  global.FileReader = jest.fn(() => fakeFileReaderInstance);
  postSubmission(submitPost, postMedia, postText, postList, postModal);
  Object.defineProperty(postMedia, 'files', {
    value: [fakeFile],
  });
  submitPost.click();
  const post2 = postList.querySelector('.update');
  const fakeEvent = { target: { result: fakeResult } };
  fakeFileReaderInstance.onload(fakeEvent);
  const img = post2.querySelector('img');
  expect(img.src).toContain(fakeResult);

  postText.value = 'test2';
  postSubmission(submitPost, postMedia, postText, postList, postModal);
  expect(post.textContent).toBe('text only test');
  expect(postModal.style.display).toBe('none');
})