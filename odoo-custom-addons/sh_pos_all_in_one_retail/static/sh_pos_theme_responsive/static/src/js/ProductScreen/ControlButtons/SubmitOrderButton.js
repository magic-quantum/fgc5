
odoo.define('sh_pos_theme_responsive.CustomSubmitOrderButton', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');

    class CustomSubmitOrderButton extends PosComponent {
        setup() {
            super.setup();
            this.clicked = false;
        }

        async _onClick() {
            if (!this.clicked) {
                try {
                    this.clicked = true;
                    const order = this.env.pos.get_order();
                    if (order.hasChangesToPrint()) {
                        const isPrintSuccessful = await order.printChangess(false);  // <-- هنا التعديل
                        if (isPrintSuccessful) {
                            order.updatePrintedResume();
                        } else {
                            this.showPopup('ErrorPopup', {
                                title: this.env._t('Printing failed'),
                                body: this.env._t('Failed in printing the changes in the order'),
                            });
                        }
                    }
                } finally {
                    this.clicked = false;
                }
            }
        }

        get currentOrder() {
            return this.env.pos.get_order();
        }

        get addedClasses() {
            if (!this.currentOrder) return {};
            const hasChanges = this.currentOrder.hasChangesToPrint();
            const skipped = hasChanges ? false : this.currentOrder.hasSkippedChanges();
            return {
                highlight: hasChanges,
                altlight: skipped,
            };
        }
    }

    CustomSubmitOrderButton.template = 'SubmitOrderButton';

    ProductScreen.addControlButton({
        component: CustomSubmitOrderButton,
        condition: function () {
            return this.env.pos.config.module_pos_restaurant && this.env.pos.unwatched.printers.length && this.env.pos.config.enable_print_order_button;
        },
        position: ['replace', 'SubmitOrderButton'],
    });

    Registries.Component.add(CustomSubmitOrderButton);

    return CustomSubmitOrderButton;
});
