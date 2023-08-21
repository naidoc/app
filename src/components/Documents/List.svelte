<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { liveQuery } from 'dexie';
  import db from '../../common/db.js';
  import { displayError } from '../../common/utils.js';

  const dispatch = createEventDispatcher();

  let documents = liveQuery(
    () => db.documents.orderBy('creationDate').reverse().toArray()
  );

  let templates = {};

  onMount(async () => {
    let templatesList;

    try {
      templatesList = await db.templates.orderBy('name').toArray();
    } catch(err) {
      return displayError('Ошибка чтения таблицы шаблонов', err);
    }

    templatesList.forEach(template => {
      templates[template.id] = template;
    });
  });

  const openEdit = id => {
    dispatch('edit', id);
  };

  const deleteDocument = async id => {
    if(!confirm('Это действие удалит документ, его восстановление будет невозможно.\nТочно удалить документ?')) return;

    try {
      await db.documents.delete(id);
    } catch(err) {
      return displayError('Ошибка удаления из таблицы шаблонов', err);
    }
  };
</script>

{#if $documents}
  {#if $documents.length > 0}
    {#each $documents as document}
      <div class="box">
        <div class="columns is-vcentered">
          <div class="column has-text-weight-semibold is-text-overflowed">{ document.name }</div>
          <div class="column is-text-overflowed">{ templates[document.templateId]?.name }</div>
          <div class="column is-text-overflowed">{ document.creationDate }</div>
          <div class="column is-narrow">
            <div class="field is-grouped">
              <div class="control">
                <button class="button is-ghost" on:click={ () => openEdit(document.id) }>
                  Редактировать
                </button>
              </div>
              <div class="control">
                <button class="button is-ghost has-text-danger"
                        on:click={ () => deleteDocument(document.id) }>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <div class="notification is-warning">
      У вас не создано ни одного документа
    </div>
  {/if}
{/if}