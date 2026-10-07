import type {StructureResolver} from 'sanity/structure'

// Ці два документи існують у єдиному екземплярі, тому відкриваються окремими сторінками, а не списками
const SINGLETONS = ['siteSettings', 'homePage']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Сайт Maina')
    .items([
      S.listItem()
        .title('Головна сторінка')
        .child(S.document().schemaType('homePage').documentId('homePage').title('Головна сторінка')),
      S.listItem()
        .title('Контакти та налаштування')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Контакти та налаштування'),
        ),
      S.divider(),
      S.documentTypeListItem('product').title('Товари'),
      S.documentTypeListItem('category').title('Категорії'),
      S.divider(),
      // Замовлення створює сервер, тож кнопки «створити» тут немає, а список іде від новіших до старіших
      S.listItem()
        .title('Замовлення')
        .schemaType('order')
        .child(
          S.documentTypeList('order')
            .title('Замовлення')
            .defaultOrdering([{field: 'number', direction: 'desc'}])
            .initialValueTemplates([]),
        ),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() as string
        return !SINGLETONS.includes(id) && !['product', 'category', 'order'].includes(id)
      }),
    ])
