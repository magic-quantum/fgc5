odoo.define('sh_pos_theme_responsive.PrintBillButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const PrintBillButton = require('pos_restaurant.PrintBillButton');

    ProductScreen.addControlButton({
        component: PrintBillButton,
        condition: function () {
            return  this.env.pos.config.enable_bill_control_button;
        },
        position: ['replace', 'PrintBillButton'],
    });
});
