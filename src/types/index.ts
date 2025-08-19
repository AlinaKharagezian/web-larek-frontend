
export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}


export interface IAppState {
    catalog: IProduct[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}


export interface IOrderForm {
    payment: string;
    email: string;
    phone: string;
    address: string;
}


export interface IOrder extends IOrderForm {
    items: string[];
    total: number;
}


export interface IOrderResult {
    id: string;
    total: number;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;