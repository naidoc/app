<script>
  import Create from './Create.svelte';
  import Edit from './Edit.svelte';
  import List from './List.svelte';

  const SECTION_LIST = 0;
  const SECTION_CREATE = 1;
  const SECTION_EDIT = 2;

  let activeSection = SECTION_LIST;
  let editId = '';

  const setSection = section => {
    activeSection = section;
  };

  const openEdit = id => {
    editId = id;
    setSection(SECTION_EDIT);
  };
</script>

<div class="block">
  {#if activeSection === SECTION_LIST}
    <button class="button is-info" on:click={ () => setSection(SECTION_CREATE) }>
      Создать новый документ
    </button>
  {:else}
    <button class="button" on:click={ () => setSection(SECTION_LIST) }>
      Назад
    </button>
  {/if}
</div>

{#if activeSection === SECTION_LIST}
  <List on:edit={ e => openEdit(e.detail) }/>
{/if}
{#if activeSection === SECTION_CREATE}
  <Create on:created={ e => openEdit(e.detail) }/>
{/if}
{#if activeSection === SECTION_EDIT}
  <Edit id={ editId }/>
{/if}