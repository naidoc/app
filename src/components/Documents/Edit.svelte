<script>
  import { onMount } from 'svelte';
  import { PatchType, TextRun, patchDocument } from 'docx';
  import db from '../../common/db.js';
  import { displayError } from '../../common/utils';

  export let id;

  let previewContainer = null;
  let document = null;
  let template = null;

  let generateTimeout = 0;

  $: if(document) {
    clearTimeout(generateTimeout);
    generateTimeout = setTimeout(async () => {
      const patches = {};

      for(let field of template.fields) {
        patches[field.pattern] = {
          type: PatchType.PARAGRAPH,
          children: [new TextRun(document.data[field.pattern] || '')]
        };
      }

      try {
        await db.documents.update(document.id, {
          data: document.data
        });
      } catch(err) {
        return displayError('Ошибка сохранения документа', err);
      }

      const docx = await patchDocument(template.content, { patches });

      await window.docx.renderAsync(docx, previewContainer);
    }, 1000);
  }

  const download = async () => {
    const patches = {};

    for(let field of template.fields) {
      patches[field.pattern] = {
        type: PatchType.PARAGRAPH,
        children: [new TextRun(document.data[field.pattern] || '')]
      };
    }

    try {
      await db.documents.update(document.id, {
        data: document.data
      });
    } catch(err) {
      return displayError('Ошибка сохранения документа', err);
    }

    const docx = await patchDocument(template.content, { patches });

    const blob = new Blob([docx], {
      type: 'application/octet-stream'
    });
    const url = window.URL.createObjectURL(blob);

    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.name}.docx`;
    a.style.display = 'none';
    window.document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  onMount(async () => {
    try {
      document = await db.documents.get(id);
    } catch(err) {
      return displayError('Ошибка чтения таблицы документов', err);
    }

    try {
      template = await db.templates.get(document.templateId);
    } catch(err) {
      return displayError('Ошибка чтения таблицы шаблонов', err);
    }
  });
</script>

{#if document && template}
  <div class="box">
    <div class="title is-4">Редактирование документа "{ document.name }"</div>
    {#each template.fields as field}
      <div class="field">
        <label class="label">
          { field.name } <span class="has-text-grey-light">{`{{${field.pattern}}}`}</span>
        </label>
        <div class="control">
          <textarea class="textarea" autocomplete="off" rows="2"
                    bind:value={ document.data[field.pattern] }></textarea>
        </div>
      </div>
    {/each}
    <div class="field">
      <button class="button is-success" on:click={ download }>Скачать</button>
    </div>
  </div>
  <div bind:this={ previewContainer }></div>
{/if}