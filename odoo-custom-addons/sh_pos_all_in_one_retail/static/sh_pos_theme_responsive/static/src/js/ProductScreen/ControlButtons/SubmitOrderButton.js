odoo.define('sh_pos_theme_responsive.SubmitOrderButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const SubmitOrderButton = require('pos_restaurant.SubmitOrderButton');

    ProductScreen.addControlButton({
        component: SubmitOrderButton,
        condition: function () {
            return  this.env.pos.config.module_pos_restaurant && this.env.pos.unwatched.printers.length && this.env.pos.config.enable_print_order_button;
        },
        position: ['replace', 'SubmitOrderButton'],
    });
});
