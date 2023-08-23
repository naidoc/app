<script>
  import { version } from '../../package.json';

  import { fade, fly } from 'svelte/transition';
  import { alertData } from '../common/ui.js';

  import Documents from './Documents/Layout.svelte';
  import Templates from './Templates.svelte';

  const SECTION_DOCUMENTS = 0;
  const SECTION_TEMPLATES = 1;

  let activeSection = SECTION_DOCUMENTS;

  const setSection = section => {
    activeSection = section;
  };
</script>

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