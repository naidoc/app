<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { alertData } from '../common/ui';

  import Documents from './Documents/Layout.svelte';
  import Templates from './Templates.svelte';

  enum Section {
    Documents,
    Templates
  };

  let activeSection: Section = Section.Documents;

  const setSection = (section: Section) => {
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
        <a class="navbar-item" class:is-active={ activeSection === Section.Documents }
           on:click|preventDefault={ () => setSection(Section.Documents) }>
          Документы
        </a>
        <a class="navbar-item" class:is-active={ activeSection === Section.Templates }
           on:click|preventDefault={ () => setSection(Section.Templates) }>
          Шаблоны
        </a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Меню</a>
          <div class="navbar-dropdown is-right">
            <a href="https://github.com/naidoc/app/blob/main/changelog.md" class="navbar-item" target="_blank">
              История изменений
            </a>
            <div class="navbar-item">Версия { '__NAIDOC_VERSION' }</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container mt-5">
  {#if activeSection === Section.Documents}
    <Documents/>
  {/if}
  {#if activeSection === Section.Templates}
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