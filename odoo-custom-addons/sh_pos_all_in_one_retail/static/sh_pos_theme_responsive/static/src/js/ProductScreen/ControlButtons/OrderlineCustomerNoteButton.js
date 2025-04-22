odoo.define('sh_pos_theme_responsive.OrderlineCustomerNoteButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const OrderlineCustomerNoteButton = require('point_of_sale.OrderlineCustomerNoteButton');

    ProductScreen.addControlButton({
        component: OrderlineCustomerNoteButton,
        condition: function () {
            return  this.env.pos.config.enable_customer_note;
        },
        position: ['replace', 'OrderlineCustomerNoteButton'],
    });
});
