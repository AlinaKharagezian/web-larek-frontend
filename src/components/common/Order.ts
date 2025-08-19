import { Form } from "../common/Form";
import { IOrderForm } from "../../types";
import { IEvents } from "../base/events";

export class Order extends Form<IOrderForm> {
    protected _paymentBtn: HTMLButtonElement[];

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._paymentBtn = Array.from(container.querySelectorAll('.button_alt'));
        this._paymentBtn.forEach(button => {
            button.addEventListener('click', () => {
                this.payment = button.name;
                events.emit('order.payment:change', { field: 'payment', value: button.name });
            });
        });
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(name: string) {
        this._paymentBtn.forEach(button => {
            this.toggleClass(button, 'button_alt-active', button.name === name);
        });
    }
}