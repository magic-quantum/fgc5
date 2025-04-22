odoo.define("sh_pos_order_list.action_button", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ProductScreen = require("point_of_sale.ProductScreen");

    class ProductInfoButton extends PosComponent {
        setup() {
            super.setup();
        }

        Deliviry() {
            this.showTempScreen("TicketScreen_x");
        }
    }

    // Link template to the component
    ProductInfoButton.template = "ProductInfoButton";

    // Add the button to the ProductScreen control buttons
    ProductScreen.addControlButton({
        component: ProductInfoButton,
        condition: function () {
            return this.env.pos.config.sh_enable_order_list;
        },
    });

    // Register the component
    Registries.Component.add(ProductInfoButton);

    return ProductInfoButton;
});
