odoo.define("sh_pos_order_list.action_button_x", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ProductScreen = require("point_of_sale.ProductScreen");

    class TicketScreenbutton_x extends PosComponent {
        // Inherit setup method if additional setup is needed
        setup() {
            super.setup();
        }

        // Handles click for Bilal screen button
        Deliviry() {
            this.showTempScreen("TicketScreen_x");
            // this.showTempScreen("OrderListScreen");
        }
    }

    // Link template to the component
    TicketScreenbutton_x.template = "TicketScreenbutton_x";

    // Add the button to the ProductScreen control buttons
    ProductScreen.addControlButton({
        component: TicketScreenbutton_x,
        condition: function () {
            return this.env.pos.config.sh_enable_order_delivery_list;
        },
    });

    // Register the component
    Registries.Component.add(TicketScreenbutton_x);

    return TicketScreenbutton_x;
});
