import _ from "lodash";
import { Model } from "./Model";
import { IAppState, IProduct, IOrder, IOrderForm, FormErrors } from "../../types";

export class AppData extends Model<IAppState> {
    basket: IProduct[] = [];
    catalog: IProduct[];
    order: IOrderForm = {
        email: '',
        phone: '',
        address: '',
        payment: ''
    };
    preview: string | null;
    formErrors: FormErrors = {};


    isInBasket(item: IProduct): boolean {
        return this.basket.includes(item);
    }

    toggleBasketItem(item: IProduct, added: boolean) {
        if (added) {
            this.basket = _.uniq([...this.basket, item]);
        } else {
            this.basket = _.without(this.basket, item);
        }
        this.events.emit('basket:changed');
    }

    clearBasket() {
        this.basket = [];
    }

    resetOrderForm() {
        this.order = {
            email: '',
            phone: '', 
            address: '', 
            payment: '', 
        };
        this.events.emit('formErrors:change', {}); 
    }

    getTotal() {
        return this.basket.reduce((sum, item) => sum + item.price, 0);
    }


    setCatalog(items: IProduct[]) {
        this.catalog = items;
        this.emitChanges('catalog:changed', { catalog: this.catalog });
    }

    setPreview(item: IProduct) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        if (this.validateOrder() && this.validateContacts()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder(): boolean {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContacts(): boolean {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

}
