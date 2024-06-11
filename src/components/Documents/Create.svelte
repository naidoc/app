<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { v4 as uuid } from 'uuid';
  import db from '../../common/db.js';
  import { showAlert } from '../../common/ui';
  import { displayError } from '../../common/utils';

  const dispatch = createEventDispatcher();

  let name = '';
  let template = '';

  let templates = [];

  onMount(async () => {
    try {
      templates = await db.templates.orderBy('name').toArray();
    } catch(err) {
      return displayError('Ошибка чтения таблицы шаблонов', err);
    }
  });

  const create = async () => {
    let errors = [];

    if(!name) errors.push('Название документа обязательно к заполнению');
    if(!template) errors.push('Необходимо выбрать шаблон');

    if(errors.length) {
      return showAlert('Ошибка заполнения формы', `- ${errors.join(';\n- ')}.`);
    }

    const id = uuid();
    const unixtime = Math.floor(Date.now() / 1000);

    try {
      await db.documents.add({
        id,
        templateId: template,
        name: name,
        creationDate: unixtime,
        modificationDate: unixtime,
        data: {}
      });
    } catch(err) {
      return displayError('Ошибка сохранения документа', err);
    }

    name = '';
    template = '';

    showAlert('Документ успешно создан');

    dispatch('created', id);
  };
</script>

<div class="columns">
  <div class="column is-6 is-offset-3">
    <div class="box">
      <div class="title is-4">Создание документа</div>
      <div class="field">
        <label class="label">Название</label>
        <div class="control">
          <input type="text" class="input" placeholder="Отображаемое название документа"
                 autocomplete="off" bind:value={ name }>
        </div>
      </div>
      <div class="field">
        <label class="label">Шаблон</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select bind:value={ template }>
              <option value="">Выберите шаблон</option>
              {#each templates as template}
                <option value={ template.id }>{ template.name }</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <button class="button is-success" on:click={ create }>Создать</button>
      </div>
    </div>
  </div>
</div>