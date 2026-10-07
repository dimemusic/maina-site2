import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Maina-site',

  projectId: 'x57ts4vi',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },

  // Замовлення створює лише сервер: прибираємо їх зі списку «Новий документ» і дублювання
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'order'),
    actions: (prev, {schemaType}) =>
      schemaType === 'order' ? prev.filter(({action}) => action !== 'duplicate') : prev,
  },
})
