import { type Writable } from 'svelte/store';

import { writable } from 'svelte/store';

const alertData: Writable<{ title: string, text: string } | null> = writable(null);

const showAlert = (title: string, text?: string): void => {
  if(text === undefined) {
    text = title;
    title = 'Информация';
  }
  alertData.set({ title, text });
};

export {
  alertData,
  showAlert
};