import {defineArrayMember, defineField, defineType} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Товар',
  type: 'document',
  groups: [
    {name: 'main', title: 'Основне', default: true},
    {name: 'variants', title: 'Ваги та ціни'},
    {name: 'sale', title: 'Акція'},
    {name: 'details', title: 'Сторінка товару'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Назва',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Адреса (slug)',
      description:
        'Унікальний код товару. Не змінюйте його в уже створених товарах: кошики покупців посилаються на нього.',
      type: 'slug',
      group: 'main',
      options: {source: 'title', maxLength: 60},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'Артикул',
      description:
        'Формат MB-001: літери MB, дефіс і щонайменше три цифри. У кожного товару свій артикул, повторювати його не можна. Покупці його не бачать, він потрапляє у повідомлення про замовлення.',
      type: 'string',
      group: 'main',
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          if (!value) return true // «обов’язкове» вже перевіряє required()
          if (!/^MB-\d{3,}$/.test(value)) return 'Формат артикула: MB-001 (MB, дефіс і щонайменше три цифри)'
          const id = (context.document?._id ?? '').replace(/^drafts\./, '')
          const taken = await context
            .getClient({apiVersion: '2025-02-19'})
            .fetch<number>(
              'count(*[_type == "product" && sku == $sku && !(_id in [$id, "drafts." + $id])])',
              {sku: value, id},
            )
          return taken > 0 ? 'Такий артикул уже є в іншому товарі' : true
        }),
    }),
    defineField({
      name: 'category',
      title: 'Категорія',
      type: 'reference',
      group: 'main',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Короткий опис (для картки)',
      description: 'Одне-два речення, показується в списку товарів.',
      type: 'text',
      rows: 3,
      group: 'main',
      validation: (rule) => rule.required().max(200).warning('Краще до 200 символів'),
    }),
    defineField({
      name: 'image',
      title: 'Головне фото',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Опис фото', type: 'string'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Додаткові фото',
      description: 'Необов’язково. Показуються на сторінці товару.',
      type: 'array',
      group: 'main',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'inStock',
      title: 'Є в наявності',
      description: 'Вимкніть, щоб прибрати товар із сайту, не видаляючи його.',
      type: 'boolean',
      group: 'main',
      initialValue: true,
    }),
    defineField({
      name: 'isHit',
      title: 'Хіт продажів',
      description:
        'Працює, лише якщо список «Хіти на головній» у налаштуваннях головної сторінки порожній. Інакше показується той список.',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'isNew',
      title: 'Новинка',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Порядок у меню',
      description: 'Менше число — вище в списку.',
      type: 'number',
      group: 'main',
      initialValue: 100,
      validation: (rule) => rule.required().integer(),
    }),

    defineField({
      name: 'variants',
      title: 'Варіанти ваги / кількості',
      description: 'Перший варіант показується в картці як «від». Порядок можна змінювати.',
      type: 'array',
      group: 'variants',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'variant',
          title: 'Варіант',
          fields: [
            defineField({
              name: 'label',
              title: 'Назва варіанта',
              description: 'Наприклад: 0.5 кг, 1 кг, 4 шт',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Ціна, ₴',
              type: 'number',
              validation: (rule) => rule.required().positive(),
            }),
            defineField({
              name: 'note',
              title: 'Підпис під ціною',
              description: 'Наприклад: за 500 г',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'label', price: 'price', note: 'note'},
            prepare: ({title, price, note}) => ({title, subtitle: `${price} ₴ · ${note}`}),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(4),
    }),

    defineField({
      name: 'sale',
      title: 'Акція',
      type: 'object',
      group: 'sale',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'active',
          title: 'Акція діє',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'badge',
          title: 'Короткий бейдж',
          description: 'Наприклад: 2 + 1 або −50%',
          type: 'string',
          hidden: ({parent}) => !parent?.active,
          validation: (rule) =>
            rule.custom((value, context) =>
              (context.parent as {active?: boolean} | undefined)?.active && !value
                ? 'Вкажіть бейдж'
                : true,
            ),
        }),
        defineField({
          name: 'text',
          title: 'Текст акції',
          description: 'Наприклад: Беріть 2 — третя в подарунок',
          type: 'string',
          hidden: ({parent}) => !parent?.active,
          validation: (rule) =>
            rule.custom((value, context) =>
              (context.parent as {active?: boolean} | undefined)?.active && !value
                ? 'Вкажіть текст акції'
                : true,
            ),
        }),
        defineField({
          name: 'every',
          title: 'Знижка на кожну N-ну штуку',
          description: 'Для «2 + 1» — 3, для «другий за пів ціни» — 2.',
          type: 'number',
          hidden: ({parent}) => !parent?.active,
          validation: (rule) =>
            rule.custom((value, context) => {
              if (!(context.parent as {active?: boolean} | undefined)?.active) return true
              return Number.isInteger(value) && (value as number) >= 2
                ? true
                : 'Ціле число, не менше 2'
            }),
        }),
        defineField({
          name: 'discountPercent',
          title: 'Знижка на цю штуку, %',
          description: '100 — безкоштовно (подарунок), 50 — за пів ціни.',
          type: 'number',
          hidden: ({parent}) => !parent?.active,
          validation: (rule) =>
            rule.custom((value, context) => {
              if (!(context.parent as {active?: boolean} | undefined)?.active) return true
              return typeof value === 'number' && value >= 1 && value <= 100
                ? true
                : 'Від 1 до 100'
            }),
        }),
      ],
    }),

    defineField({
      name: 'details',
      title: 'Деталі для сторінки товару',
      type: 'object',
      group: 'details',
      options: {collapsible: false},
      fields: [
        defineField({
          name: 'lead',
          title: 'Вступ',
          description: 'Кілька речень під назвою на сторінці товару.',
          type: 'text',
          rows: 3,
        }),
        defineField({name: 'composition', title: 'Склад', type: 'text', rows: 4}),
        defineField({name: 'preparation', title: 'Спосіб приготування', type: 'text', rows: 4}),
        defineField({
          name: 'shelfLife',
          title: 'Термін придатності',
          description: 'Наприклад: 180 діб при температурі не вище ніж -18°C',
          type: 'string',
        }),
        defineField({
          name: 'calories',
          title: 'Енергетична цінність',
          description: 'Наприклад: 278,0 ккал/100 г',
          type: 'string',
        }),
        defineField({
          name: 'protein',
          title: 'Білки',
          description: 'Наприклад: 11,6 г/100 г',
          type: 'string',
        }),
        defineField({
          name: 'carbs',
          title: 'Вуглеводи',
          description: 'Наприклад: 34,5 г/100 г',
          type: 'string',
        }),
        defineField({
          name: 'factFormat',
          title: 'Коротко: формат',
          description: 'Наприклад: Заморожені',
          type: 'string',
        }),
        defineField({
          name: 'factCooking',
          title: 'Коротко: приготування',
          description: 'Наприклад: 8-10 хвилин',
          type: 'string',
        }),
        defineField({
          name: 'factStorage',
          title: 'Коротко: зберігання',
          description: 'Наприклад: до 180 днів',
          type: 'string',
        }),
        defineField({
          name: 'related',
          title: 'Вам також сподобається',
          description: 'До 4 товарів.',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})],
          validation: (rule) => rule.max(4).unique(),
        }),
      ],
    }),
  ],
  orderings: [
    {title: 'Порядок у меню', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', sku: 'sku', category: 'category.title', media: 'image'},
    prepare: ({title, sku, category, media}) => ({
      title,
      subtitle: [sku, category].filter(Boolean).join(' · '),
      media,
    }),
  },
})
