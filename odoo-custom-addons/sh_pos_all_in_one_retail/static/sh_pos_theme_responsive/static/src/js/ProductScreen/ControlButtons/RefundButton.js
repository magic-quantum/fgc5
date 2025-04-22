odoo.define('sh_pos_theme_responsive.RefundButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const RefundButton = require('point_of_sale.RefundButton');

    ProductScreen.addControlButton({
        component: RefundButton,
        condition: function () {
            return  this.env.pos.config.enable_refund_control_button;
        },
        position: ['replace', 'RefundButton'],
    });
});
