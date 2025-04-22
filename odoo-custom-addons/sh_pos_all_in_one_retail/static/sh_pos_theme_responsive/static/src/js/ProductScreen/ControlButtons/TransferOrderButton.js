odoo.define('sh_pos_theme_responsive.TransferOrderButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const TransferOrderButton = require('pos_restaurant.TransferOrderButton');

    ProductScreen.addControlButton({
        component: TransferOrderButton,
        condition: function () {
            return  this.env.pos.config.iface_floorplan && this.env.pos.config.enable_transfer_order_button;
        },
        position: ['replace', 'TransferOrderButton'],
    });
});
