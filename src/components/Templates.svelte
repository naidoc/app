<script>
  import { liveQuery } from 'dexie';
  import { v4 as uuid } from 'uuid';
  import db from '../common/db.js';
  import { showAlert } from '../common/ui';
  import { readFile, displayError } from '../common/utils';

  let isModificationOpen = false;
  let data = {};

  $: if(data.files) {
    data.filename = data.files[0].name;
  }

  let templates = liveQuery(
    () => db.templates.orderBy('name').toArray()
  );

  const openCreate = () => {
    if(Object.keys(data).length > 0 && !data.id) {
      if(!confirm('Восстановить данные заполнения формы?')) data = {};
    } else {
      data = {};
    }

    isModificationOpen = true;
  };

  const openEdit = template => {
    if(Object.keys(data).length > 0 && template.id === data.id) {
      if(!confirm('Восстановить данные заполнения формы?')) data = {...template};
    } else {
      data = {...template};
    }

    isModificationOpen = true;
  };

  const duplicate = async template => {
    const id = uuid();
    const unixtime = Math.floor(Date.now() / 1000);

    try {
      await db.templates.add({
        id,
        name: `Дубликат "${template.name}"`,
        creationDate: unixtime,
        modificationDate: unixtime,
        fields: template.fields,
        filename: template.filename,
        content: template.content
      });
    } catch(err) {
      return displayError('Ошибка сохранения шаблона', err);
    }

    showAlert('Дубликат шаблона успешно создан');

    let templateDuplicate;

    try {
      templateDuplicate = await db.templates.get(id);
    } catch(err) {
      return displayError('Ошибка чтения таблицы шаблонов', err);
    }

    openEdit(templateDuplicate);
  };

  const closeModification = () => {
    isModificationOpen = false;
  };

  const addField = () => {
    if(!data.fields) data.fields = [];
    data.fields = [...data.fields, { name: '', pattern: '' }];
  };

  const removeField = indexToRemove => {
    data.fields = data.fields.filter((_, index) => index !== indexToRemove);
  };

  const save = async () => {
    let errors = [];

    if(!data.name) errors.push('Название шаблона обязательно к заполнению');
    if(!data.id && (!data.files || data.files.length === 0)) {
      errors.push('Файл шаблона обязателен к загрузке');
    } else if(data.filename.split('.').at(-1) !== 'docx') {
      errors.push('Поддерживаются только файлы формата docx');
    }

    const fields = (data.fields || []).map(element => {
      return { name: element.name.trim(), pattern: element.pattern.trim() };
    }).filter(element => {
      return element.name && element.pattern;
    });

    if(!fields || fields.length === 0) {
      errors.push('Необходимо создать хотя бы одно поле');
    }

    if(errors.length) {
      return showAlert('Ошибка заполнения формы', `- ${errors.join(';\n- ')}.`);
    }

    if(data.id) {
      let content;

      if(data.files && data.files.length) {
        try {
          content = await readFile(data.files[0]);
        } catch(err) {
          return displayError('Ошибка чтения файла', err);
        }
      } else {
        content = data.content;
      }

      try {
        await db.templates.update(data.id, {
          name: data.name,
          modificationDate: Math.floor(Date.now() / 1000),
          fields: fields,
          filename: data.filename,
          content: content
        });
      } catch(err) {
        return displayError('Ошибка сохранения шаблона', err);
      }
    } else {
      let content;

      try {
        content = await readFile(data.files[0]);
      } catch(err) {
        return displayError('Ошибка чтения файла', err);
      }

      const unixtime = Math.floor(Date.now() / 1000);

      try {
        await db.templates.add({
          id: uuid(),
          name: data.name,
          creationDate: unixtime,
          modificationDate: unixtime,
          fields: fields,
          filename: data.filename,
          content: content
        });
      } catch(err) {
        return displayError('Ошибка сохранения шаблона', err);
      }
    }

    showAlert(`Шаблон успешно ${data.id ? 'сохранен' : 'создан'}`);

    data = {};
    isModificationOpen = false;
  };

  const deleteTemplate = async id => {
    let documentsCount;

    try {
      documentsCount = await db.documents.where('templateId').equals(id).count();
    } catch(err) {
      return displayError('Ошибка чтения таблицы документов', err);
    }

    let confirmText = 'Это действие удалит шаблон, его восстановление будет невозможно.';
    if(documentsCount > 0) {
      confirmText += `\nТакже будут удалены все документы (${documentsCount} шт.), созданные на его основе.`;
    }

    if(!confirm(`${confirmText}\nТочно удалить шаблон?`)) return;

    try {
      await db.documents.where('templateId').equals(id).delete();
    } catch(err) {
      return displayError('Ошибка удаления из таблицы документов', err);
    }

    try {
      await db.templates.delete(id);
    } catch(err) {
      return displayError('Ошибка удаления из таблицы шаблонов', err);
    }
  };
</script>

<div class="block">
  <button class="button is-info" on:click={ openCreate }>Создать новый шаблон</button>
</div>

{#if $templates}
  {#if $templates.length > 0}
    {#each $templates as template}
      <div class="box">
        <div class="columns is-vcentered">
          <div class="column has-text-weight-semibold is-text-overflowed">{ template.name }</div>
          <div class="column is-text-overflowed">{ template.filename }</div>
          <div class="column is-narrow">
            <div class="dropdown is-right is-hoverable">
              <div class="dropdown-trigger">
                <button class="button">Действия</button>
              </div>
              <div class="dropdown-menu">
                <div class="dropdown-content">
                  <a class="dropdown-item"
                     on:click|preventDefault={ () => openEdit(template) }>
                    Редактировать
                  </a>
                  <a class="dropdown-item"
                     on:click|preventDefault={ () => duplicate(template) }>
                    Дублировать
                  </a>
                  <a class="dropdown-item has-text-danger"
                     on:click|preventDefault={ () => deleteTemplate(template.id) }>
                    Удалить
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  {:else}
    <div class="notification is-warning">
      У вас не создано ни одного шаблона
    </div>
  {/if}
{/if}

{#if isModificationOpen}
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <div class="modal-card-head">
        <div class="modal-card-title">
          { data.id ? 'Редактирование' : 'Создание нового' } шаблона
        </div>
        <button class="delete" on:click={ closeModification }></button>
      </div>
      <div class="modal-card-body">
        <div class="field">
          <label class="label">Название</label>
          <div class="control">
            <input type="text" class="input" placeholder="Отображаемое название шаблона"
                   autocomplete="off" bind:value={ data.name }>
          </div>
        </div>
        <div class="field">
          <label class="label">Файл</label>
          <div class="control">
            <div class="file has-name is-fullwidth">
              <label class="file-label">
                <input type="file" class="file-input" accept=".docx" bind:files={ data.files }>
                <div class="file-cta">
                  <div class="file-label">
                    Выберите файл...
                  </div>
                </div>
                <div class="file-name">{ data.filename || 'Файл не выбран' }</div>
              </label>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Заполняемые поля</label>
          {#if !data.fields || data.fields.length === 0}
            <div class="field">
              <div class="notification is-warning">
                У вас не добавлено ни одного поля шаблона
              </div>
            </div>
          {:else}
            {#each data.fields as field, index}
              <div class="field has-addons">
                <div class="control is-expanded">
                  {#if index === 0}
                    <div class="help mb-1 mt-0">Название отображаемое в интерфейсе</div>
                  {/if}
                  <input type="text" class="input" placeholder="Название поля"
                         autocomplete="off" bind:value={ field.name }>
                </div>
                <div class="control is-expanded">
                  {#if index === 0}
                    <div class="help mb-1 mt-0">
                      Паттерн замены <b>{'{{pattern}}'}</b> (без скобок)
                    </div>
                  {/if}
                  <input type="text" class="input" placeholder="Паттерн замены"
                         autocomplete="off" bind:value={ field.pattern }>
                </div>
                <div class="control">
                  {#if index === 0}
                    <div class="help mb-1 mt-0">&nbsp;</div>
                  {/if}
                  <button class="button is-warning" on:click={ () => removeField(index) }>
                    Удалить
                  </button>
                </div>
              </div>
            {/each}
          {/if}
          <div class="field">
            <button class="button is-small" on:click={ addField }>Добавить поле</button>
          </div>
        </div>
      </div>
      <div class="modal-card-foot">
        <div class="level">
          <div class="level-left">
            <button class="button is-success" on:click={ save }>
              { data.id ? 'Сохранить' : 'Создать' }
            </button>
          </div>
          <div class="level-right">
            <button class="button" on:click={ closeModification }>Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}