import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Категорія',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Назва',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Адреса (slug)',
      description: 'Натисніть «Generate». Використовується сайтом для іконки категорії.',
      type: 'slug',
      options: {source: 'title', maxLength: 60},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок у меню',
      description: 'Менше число — вище в списку.',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.required().integer(),
    }),
  ],
  orderings: [
    {title: 'Порядок у меню', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'order'}},
})
