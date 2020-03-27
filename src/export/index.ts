import { Router } from "express";
import products from './products'
import users from './users'
import categories from './categories'
import orders from './orders'

export default function (app: Router) {
    app.get('/api/export/products', products);
    app.get('/api/export/users', users);
    app.get('/api/export/categories', categories);
    app.get('/api/export/orders', orders);
}