import {defineArrayMember, defineField, defineType} from 'sanity'

export const ORDER_STATUSES = [
  {title: 'Нове', value: 'new'},
  {title: 'Підтверджене', value: 'confirmed'},
  {title: 'Виконане', value: 'done'},
  {title: 'Скасоване', value: 'cancelled'},
]

const statusTitle = (value?: string) => ORDER_STATUSES.find((s) => s.value === value)?.title ?? value

// Замовлення створює лише сервер (Сайт/api/order.js). Імені, телефону й адреси тут немає навмисно:
// датасет публічний, тож персональні дані живуть тільки в Telegram.
// Власники редагують лише статус, решта полів readOnly.
export const order = defineType({
  name: 'order',
  title: 'Замовлення',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: 'Номер',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Створено',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Статус',
      type: 'string',
      options: {list: ORDER_STATUSES, layout: 'radio'},
      initialValue: 'new',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Товари',
      type: 'array',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'orderItem',
          title: 'Позиція',
          fields: [
            defineField({name: 'sku', title: 'Артикул', type: 'string', readOnly: true}),
            defineField({name: 'title', title: 'Назва', type: 'string', readOnly: true}),
            defineField({name: 'option', title: 'Варіант', type: 'string', readOnly: true}),
            defineField({name: 'qty', title: 'Кількість', type: 'number', readOnly: true}),
            defineField({name: 'price', title: 'Ціна за одиницю, ₴', type: 'number', readOnly: true}),
            defineField({name: 'sum', title: 'Сума, ₴', type: 'number', readOnly: true}),
          ],
          preview: {
            select: {title: 'title', sku: 'sku', option: 'option', qty: 'qty', sum: 'sum'},
            prepare: ({title, sku, option, qty, sum}) => ({
              title: [sku, title].filter(Boolean).join(' · '),
              subtitle: `${option} × ${qty} = ${sum} ₴`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'total',
      title: 'Разом, ₴',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'discount',
      title: 'Знижка за акціями, ₴',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'telegramSent',
      title: 'Надіслано в Telegram',
      description: 'Якщо вимкнено, повідомлення про це замовлення могло не дійти: перевірте його з клієнтом.',
      type: 'boolean',
      readOnly: true,
      initialValue: false,
    }),
  ],
  orderings: [
    {title: 'Спочатку нові', name: 'numberDesc', by: [{field: 'number', direction: 'desc'}]},
    {title: 'Спочатку старі', name: 'numberAsc', by: [{field: 'number', direction: 'asc'}]},
  ],
  preview: {
    select: {number: 'number', total: 'total', createdAt: 'createdAt', status: 'status'},
    prepare: ({number, total, createdAt, status}) => ({
      title: `№${number} · ${total} ₴`,
      subtitle: [
        createdAt ? new Date(createdAt).toLocaleString('uk-UA', {dateStyle: 'short', timeStyle: 'short'}) : null,
        statusTitle(status),
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
