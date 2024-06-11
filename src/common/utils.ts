import { showAlert } from './ui';

const readFile = async (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result as ArrayBuffer);
    });
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(file);
  });
};

const displayError = (title: string, err: any) => {
  console.error(title, err);

  let alertText = '';
  if (err instanceof Error) {
    if (err.stack) alertText = err.stack;
    else alertText = err.toString();
  } else {
    alertText = JSON.stringify(err);
  }

  return showAlert(title, alertText);
};

export {
  readFile,
  displayError
};