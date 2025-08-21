import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { WebLarekAPI } from './components/base/ApiWebLarek';
import { AppData } from './components/base/AppData';
import { Page } from './components/common/Page';
import { Card } from './components/common/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { IOrder, IOrderForm, IProduct } from './types';
import { Basket } from './components/common/Basket';
import { Order } from './components/common/Order';
import { Contacts } from './components/common/Contacts';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const appData = new AppData({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
    onClick: () => {
        modal.close();
    }
});


events.on('catalog:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () =>
                 events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category,
            id: item.id
        });
    });
});


events.on('card:select', (item: IProduct) => appData.setPreview(item));


events.on('preview:changed', (item: IProduct) => {
    const isInBasket = appData.isInBasket(item);

    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (isInBasket) {
                events.emit('basket:remove', item); 
            } else {
                events.emit('basket:add', item); 
            }
            page.counter = appData.basket.length;
            modal.close();
        }
    });

    card.updateButton(isInBasket);

    modal.render({
        content: card.render({
            title: item.title,
            image: item.image,
            description: item.description,
            price: item.price,
            category: item.category
    })
})
});

events.on('basket:add', (item: IProduct) => {
    appData.toggleBasketItem(item, true);
    page.counter = appData.basket.length;
});


events.on('basket:remove', (item: IProduct) => {
    appData.toggleBasketItem(item, false);
    page.counter = appData.basket.length;
    events.emit('basket:open');
});


events.on('basket:open', () => {
    const basketItems = appData.basket.map((item) => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                events.emit('basket:remove', item); 
            }
        });
        return card.render({
            title: item.title,
            price: item.price
        });
    });

    modal.render({
        content: basket.render({
            list: basketItems,
            total: appData.getTotal()
        })
    });
});


events.on('order:open', () => {
    appData.resetOrderForm();
    modal.render({
        content: order.render({
            payment: '',
            address: '',
            valid: false,
            errors: []
        })
    });
});

events.on('order:submit', () => {
    modal.render({
        content: contacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

events.on('contacts:submit', () => {
    const orderData: IOrder = {
        ...appData.order,
        items: appData.basket.map(item => item.id),
        total: appData.getTotal()
    };
    api.orderProducts(orderData)
        .then((result) => {
            appData.clearBasket();
            page.counter = 0;
            modal.render({
                content: success.render({
                    total: result.total
                })
            });
        })
        .catch(err => {
            console.error(err);
        });

    })


events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { email, phone, address, payment } = errors;
    order.valid = !address && !payment;
    order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

events.on(/^(order|contacts)\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});


events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});


api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });