// odoo.define('sh_pos_theme_responsive.ProductInfoButton', function (require) {
//     'use strict';

//     const ProductScreen = require('point_of_sale.ProductScreen');
//     const ProductInfoButton = require('point_of_sale.ProductInfoButton');

//     ProductScreen.addControlButton({
//         component: ProductInfoButton,
//         condition: function () {
//             return  this.env.pos.config.enable_info_control_button;
//         },
//         position: ['replace', 'ProductInfoButton'],
//     });
// });



odoo.define('sh_pos_theme_responsive.ProductInfoButton', function (require) {
    'use strict';

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ProductScreen = require("point_of_sale.ProductScreen");
    const { useListener } = require("@web/core/utils/hooks");
    const { isConnectionError } = require('point_of_sale.utils');

    class ProductInfoButton1 extends PosComponent {
        setup() {
            super.setup();
            useListener('click', this.onClick);
        }
        async onClick() {
            const orderline = this.env.pos.get_order().get_selected_orderline();
            if (orderline) {
                const product = orderline.get_product();
                const quantity = orderline.get_quantity();
                try {
                    const info = await this.env.pos.getProductInfo(product, quantity);
                    this.showPopup('ProductInfoPopup', { info: info , product: product });
                } catch (e) {
                    if (isConnectionError(e)) {
                        this.showPopup('OfflineErrorPopup', {
                            title: this.env._t('Network Error'),
                            body: this.env._t('Cannot access product information screen if offline.'),
                        });
                    } else {
                        this.showPopup('ErrorPopup', {
                            title: this.env._t('Unknown error'),
                            body: this.env._t('An unknown error prevents us from loading product information.'),
                        });
                    }
                }
            }
        }
    }

    // Link template to the component
    ProductInfoButton1.template = "ProductInfoButton";

    // Add the button to the ProductScreen control buttons
    ProductScreen.addControlButton({
        component: ProductInfoButton1,
        condition: function () {
            return this.env.pos.config.sh_enable_order_list && this.env.pos.config.enable_info_control_button;
        },
    });

    // Register the component
    Registries.Component.add(ProductInfoButton1);

    return ProductInfoButton1;
});
