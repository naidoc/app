<script>
  import { version } from '../../package.json';

  import { exportDB, importInto } from 'dexie-export-import';

  import { fade, fly } from 'svelte/transition';
  import db from '../common/db.js';
  import { alertData, showAlert } from '../common/ui.js';
  import { readFile, displayError } from '../common/utils.js';

  import Documents from './Documents/Layout.svelte';
  import Templates from './Templates.svelte';

  const SECTION_DOCUMENTS = 0;
  const SECTION_TEMPLATES = 1;

  let activeSection = SECTION_DOCUMENTS;

  const setSection = section => {
    activeSection = section;
  };

  const importFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async e => {
      const data = await readFile(e.target.files[0]);

      try {
        await importInto(db, new Blob([data]), { overwriteValues: true });
      } catch(err) {
        return displayError('Ошибка импорта базы данных', err);
      }

      showAlert('База данных успешно испортирована');
    };

    input.click();
  };

  const exportToFile = async () => {
    let blob;

    try {
      blob = await exportDB(db);
    } catch(err) {
      return displayError('Ошибка чтения базы данных', err);
    }

    let handle;

    try {
      handle = await showSaveFilePicker({
        id: 'naidoc',
        startIn: 'desktop',
        suggestedName: 'naidoc.json',
        types: [{
          accept: { 'text/json': ['.json'] },
        }]
      });
    } catch {
      return;
    }

    try {
      const writableStream = await handle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
    } catch(err) {
      return displayError('Ошибка записи файла', err);
    }

    showAlert('База данных успешно сохранена');
  };
</script>

<svelte:window on:beforeunload|preventDefault/>

<div class="navbar is-light">
  <div class="container">
    <div class="navbar-brand">
      <div class="navbar-item">
        <img src="logo.svg" width="124" height="24">
      </div>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <a class="navbar-item" class:is-active={ activeSection === SECTION_DOCUMENTS }
           on:click|preventDefault={ () => setSection(SECTION_DOCUMENTS) }>
          Документы
        </a>
        <a class="navbar-item" class:is-active={ activeSection === SECTION_TEMPLATES }
           on:click|preventDefault={ () => setSection(SECTION_TEMPLATES) }>
          Шаблоны
        </a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Меню</a>
          <div class="navbar-dropdown is-right">
            <a class="navbar-item" on:click|preventDefault={ exportToFile }>Экспорт в файл</a>
            <a class="navbar-item" on:click|preventDefault={ importFromFile }>Импорт из файла</a>
            <a href="https://github.com/naidoc/naidoc/blob/main/docs/ru/changelog.md" class="navbar-item" target="_blank">
              История изменений
            </a>
            <div class="navbar-item">Версия { version }</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container mt-5">
  {#if activeSection === SECTION_DOCUMENTS}
    <Documents/>
  {/if}
  {#if activeSection === SECTION_TEMPLATES}
    <Templates/>
  {/if}
</div>

{#if $alertData}
  <div class="modal is-active">
    <div class="modal-background" transition:fade></div>
    <div class="modal-card" transition:fly={{ y: -100 }}>
      <div class="modal-card-head">
        <div class="modal-card-title">{ $alertData.title }</div>
      </div>
      <div class="modal-card-body">
        <div class="info-block">{ $alertData.text }</div>
      </div>
      <div class="modal-card-foot">
        <button class="button is-info" on:click={ () => $alertData = null }>
          OK
        </button>
      </div>
    </div>
  </div>
{/if}