odoo.define("sh_pos_order_list.action_button", function (require) {
    "use strict";

    const PosComponent = require("point_of_sale.PosComponent");
    const Registries = require("point_of_sale.Registries");
    const ProductScreen = require("point_of_sale.ProductScreen");

    class OrderHistoryButton extends PosComponent {
        // Inherit setup method if additional setup is needed
        setup() {
            super.setup();
        }

        // Handles click for Order History button
        onClick() {
            this.showTempScreen("OrderListScreen");
        }
    }


    
    // Link template to the component
    OrderHistoryButton.template = "OrderHistoryButton";

    // Add the button to the ProductScreen control buttons
    ProductScreen.addControlButton({
        component: OrderHistoryButton,
        condition: function () {
            return this.env.pos.config.sh_enable_order_list && this.env.pos.config.enable_orderhistory_control_button;
        },
    });

    // Register the component
    Registries.Component.add(OrderHistoryButton);

    return OrderHistoryButton;
    
});
