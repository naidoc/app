import { writable } from 'svelte/store';

const alertData = writable(null);

const showAlert = (title, text) => {
  if(!text) {
    text = title;
    title = 'Информация';
  }
  alertData.set({ title, text });
};

export {
  alertData,
  showAlert
};