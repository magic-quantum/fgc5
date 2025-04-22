odoo.define('sh_pos_theme_responsive.SplitBillButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const SplitBillButton = require('pos_restaurant.SplitBillButton');

    ProductScreen.addControlButton({
        component: SplitBillButton,
        condition: function () {
            return  this.env.pos.config.enable_split_bill_button && this.env.pos.config.iface_splitbill;
        },
        position: ['replace', 'SplitBillButton'],
    });
});
