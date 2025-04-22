odoo.define("sh_pos_z_report.screen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const ReceiptScreen = require("point_of_sale.ReceiptScreen");

    const SHReceiptScreen = (ReceiptScreen) =>
        class extends ReceiptScreen {
            orderDone() {
                super.orderDone()
                if (this.env.pos.is_z_report_receipt){
                    this.env.pos.is_z_report_receipt = false;
                    const { name, props } = this.nextScreen;
                    this.showScreen(name, props);
                }
            }
        };
    Registries.Component.extend(ReceiptScreen, SHReceiptScreen);

});
