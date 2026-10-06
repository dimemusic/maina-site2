import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Контакти та налаштування',
  type: 'document',
  fields: [
    defineField({
      name: 'announcement',
      title: 'Смужка зверху сайту',
      type: 'string',
      initialValue: 'Доставка по всій Україні · Нова Пошта та кур’єр',
    }),
    defineField({
      name: 'about',
      title: 'Короткий опис у футері',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'phone',
      title: 'Телефон',
      description: 'Наприклад: +380 67 000 00 00',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Адреса самовивозу',
      description: 'Наприклад: м. Київ, вул. Хрещатик, 1',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workingHours',
      title: 'Години роботи',
      description: 'Наприклад: Пн - Нд | 9:00 - 20:20',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram (посилання)',
      description: 'Наприклад: https://instagram.com/maina.by.rivka',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'telegramUrl',
      title: 'Telegram (посилання)',
      description: 'Наприклад: https://t.me/ваш_нік',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'viberPhone',
      title: 'Viber (номер)',
      description: 'Наприклад: +380 67 000 00 00',
      type: 'string',
    }),
    defineField({
      name: 'whatsappPhone',
      title: 'WhatsApp (номер)',
      description: 'Наприклад: +380 67 000 00 00',
      type: 'string',
    }),
    defineField({
      name: 'freeDeliveryFrom',
      title: 'Безкоштовна доставка від, ₴',
      type: 'number',
      initialValue: 1500,
      validation: (rule) => rule.required().min(0),
    }),
  ],
  preview: {prepare: () => ({title: 'Контакти та налаштування'})},
})
