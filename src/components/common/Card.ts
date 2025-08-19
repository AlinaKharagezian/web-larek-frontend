import { Component } from "../base/Component";
import { IProduct } from "../../types";
import { ensureElement } from "../../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
    protected _categoryСolor: Record<string, string> = {
        'софт-скил': 'soft',
        'другое': 'other',
        'хард-скил': 'hard',
        'дополнительное': 'additional',
        'кнопка': 'button'
    };
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _price: HTMLElement;
    protected _category?: HTMLElement;
    protected blockName = 'card';

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);
        this._title = ensureElement<HTMLElement>(`.${this.blockName}__title`, container);
        this._image = container.querySelector(`.${this.blockName}__image`);
        this._button = container.querySelector(`.${this.blockName}__button`);
        this._description = container.querySelector(`.${this.blockName}__text`);
        this._price = ensureElement<HTMLElement>(`.${this.blockName}__price`, container);
        this._category = container.querySelector(`.${this.blockName}__category`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }


    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string) { 
        this.setText(this._description, value)
    }

    set category(value: string) {
        this.setText(this._category, value);
        const color = this._categoryСolor[value];
        const allClasses = Object.values(this._categoryСolor).map(color => `card__category_${color}`);
        this._category.classList.remove(...allClasses);
        this._category.classList.add(`card__category_${color}`);
    }

    set price(value: number | null) {
        this.setText(this._price, value === null ? 'Бесценно' : `${value} синапсов`);
        if (value === null) {
            this.setDisabled(this._button, true);
            this.setText(this._button, 'Недоступно');
        };
    };

    updateButton(isInBasket: boolean) {
        if (this._button && this.price !== 0) {
            this.setText(this._button, isInBasket ? 'Удалить из корзины' : 'В корзину');
        }
    }
}