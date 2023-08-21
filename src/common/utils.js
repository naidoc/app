import { showAlert } from './ui.js';

const readFile = async file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', err => {
      reject(err);
    });
    reader.readAsArrayBuffer(file);
  });
};

const displayError = (title, err) => {
  console.error(err);
  return showAlert(title, err.stack);
};

export {
  readFile,
  displayError
};