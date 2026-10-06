import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Головна сторінка',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Верх сторінки', default: true},
    {name: 'features', title: 'Переваги і стрічка'},
    {name: 'hits', title: 'Хіти'},
    {name: 'delivery', title: 'Доставка'},
    {name: 'order', title: 'Замовлення'},
  ],
  fields: [
    defineField({name: 'heroEyebrow', title: 'Маленький підпис', type: 'string', group: 'hero'}),
    defineField({
      name: 'heroTitle',
      title: 'Головний заголовок',
      type: 'string',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'heroText', title: 'Підзаголовок', type: 'text', rows: 3, group: 'hero'}),
    defineField({
      name: 'heroImage',
      title: 'Головне фото',
      type: 'image',
      group: 'hero',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Опис фото', type: 'string'})],
    }),
    defineField({
      name: 'tags',
      title: 'Теги під заголовком',
      description: 'Короткі слова, наприклад: # Вареники. Показуються по три в рядку.',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(6),
    }),

    defineField({
      name: 'features',
      title: 'Три переваги',
      type: 'array',
      group: 'features',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'text', title: 'Текст', type: 'text', rows: 2, validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'ticker',
      title: 'Бігуча стрічка',
      description: 'Кожен рядок — окреме повідомлення (можна з емодзі).',
      type: 'array',
      group: 'features',
      of: [defineArrayMember({type: 'string'})],
    }),

    defineField({
      name: 'hitsEyebrow',
      title: 'Підпис над заголовком',
      type: 'string',
      group: 'hits',
      initialValue: 'Хіти продажів',
    }),
    defineField({
      name: 'hitsTitle',
      title: 'Заголовок блоку',
      type: 'string',
      group: 'hits',
      initialValue: 'З чого почати',
    }),
    defineField({
      name: 'hits',
      title: 'Хіти на головній',
      description: 'Товари в порядку показу. Рекомендовано 8.',
      type: 'array',
      group: 'hits',
      of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})],
      validation: (rule) => rule.unique().max(12),
    }),

    defineField({
      name: 'deliveryTitle',
      title: 'Заголовок блоку доставки',
      type: 'string',
      group: 'delivery',
      initialValue: 'Як відбувається доставка ?',
    }),
    defineField({
      name: 'deliverySteps',
      title: 'Кроки доставки',
      type: 'array',
      group: 'delivery',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'text', title: 'Текст', type: 'text', rows: 3, validation: (r) => r.required()}),
            defineField({name: 'image', title: 'Фото', type: 'image', options: {hotspot: true}}),
          ],
          preview: {select: {title: 'title', subtitle: 'text', media: 'image'}},
        }),
      ],
      validation: (rule) => rule.max(3),
    }),

    defineField({name: 'orderEyebrow', title: 'Маленький підпис', type: 'string', group: 'order'}),
    defineField({name: 'orderTitle', title: 'Заголовок', type: 'string', group: 'order'}),
    defineField({name: 'orderText', title: 'Текст', type: 'text', rows: 4, group: 'order'}),
    defineField({
      name: 'orderImage',
      title: 'Фото',
      type: 'image',
      group: 'order',
      options: {hotspot: true},
    }),
  ],
  preview: {prepare: () => ({title: 'Головна сторінка'})},
})
