odoo.define('sh_pos_theme_responsive.TableGuestsButton', function (require) {
    'use strict';

    const ProductScreen = require('point_of_sale.ProductScreen');
    const TableGuestsButton = require('pos_restaurant.TableGuestsButton');

    ProductScreen.addControlButton({
        component: TableGuestsButton,
        condition: function () {
            return  this.env.pos.config.enable_guest_control_button;
        },
        position: ['replace', 'TableGuestsButton'],
    });
});
