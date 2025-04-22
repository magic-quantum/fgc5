odoo.define('sh_pos_theme_responsive.OrderlineNoteButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const OrderlineNoteButton = require('pos_restaurant.OrderlineNoteButton');

    ProductScreen.addControlButton({
        component: OrderlineNoteButton,
        condition: function () {
            return  this.env.pos.config.enable_internal_note;
        },
        position: ['replace', 'OrderlineNoteButton'],
    });
});
