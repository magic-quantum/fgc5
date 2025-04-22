odoo.define('sh_pos_theme_responsive.ActionPad_extension', function(require) {
    'use strict';
    const ActionpadWidget = require('point_of_sale.ActionpadWidget');
    const Registries = require('point_of_sale.Registries');
    const { Gui } = require('point_of_sale.Gui');
    const ConfirmPopup = require('point_of_sale.ConfirmPopup');
    const TextInputPopup = require('point_of_sale.TextInputPopup');
    const { OrderSender } = require('sh__return_exchange.TicketScreen_x');
    const rpc = require('web.rpc');

    const ActionpadWidgetAccessRight = ActionpadWidget => class extends ActionpadWidget {
        /**
         * Disable payment on the POS
         */

        // async _onValidateAndClick() {
        //     if (this._isDeliveryEnabled()) {
        //         if (!this._isPartnerSelected()) {
        //             return;
        //         }
        //         await this._Print_To_kitchen();
        //         await this._onCustomValidateOrder();
        //     } else {
        //         this.trigger('click-pay');
        //     }
        // }


/** totar logic */    
async openOrderNumberPopup() {
    const { confirmed, payload } = await Gui.showPopup('TextInputPopup', {
        title: 'إدخال رقم الطلب',
        body: 'يرجى إدخال رقم الطلب في الأسفل:',
        confirmText: 'تأكيد',
        cancelText: 'إلغاء',
        startingValue: '',
    });

    if (confirmed && payload) {
        console.log("Order Number entered:", payload);
        await this._onValidateAndClickToInvoiced(payload);
    }
}

async _onValidateAndClickToInvoiced(orderNumber) {
    if (this._isDeliveryEnabled()) {
        await this._Print_To_kitchen();
        console.log("Order Number entered:", this.env.pos.config);
        console.log("Order Number entered:", this.env.pos.config.sh_totar_id);
        await this._onCustomValidateOrderInvoiced(orderNumber);
    } else {
        this.trigger('click-pay');
    }

};

async _onCustomValidateOrderInvoiced(orderNumber) {
    const currentOrder = this.env.pos.get_order();
    if (!currentOrder) {
        console.error("No order found.");
        return;
    }
    const ordername = currentOrder.name;
    console.log("orderUidorderUidorderUidorderUid", ordername);
    
    if (!ordername) {
        console.error("No order name found.");
        return;
    }
    
    
    try {
        const duplicateOrders = await rpc.query({
            model: 'pos.order',
            method: 'search_read',
            args: [[['company_order_id', '=', orderNumber]], ['id']],
        });
    
        if (duplicateOrders.length > 0) {
            await Gui.showPopup('ErrorPopup', {
                title: 'رقم الطلب مكرر',
                body: `رقم الطلب "${orderNumber}" تم استخدامه مسبقًا. الرجاء إدخال رقم فريد.`,
            });
            return;
        } else {
            await this._onCustomValidateOrder();
            this._backToProductScreen();
            const orders = await rpc.query({
                model: 'pos.order',
                method: 'search_read',
                args: [[['pos_reference', '=', ordername]]]
            });
            console.log("company_order_id company_order_id", orderNumber);
            orders[0].company_order_id = orderNumber
            console.log("company_order_id company_order_id", orders);
            
            
            if (orders.length === 0) {
                await Gui.showPopup('ErrorPopup', {
                    title: 'طلب غير موجود',
                    body: 'لم يتم العثور على الطلب الحالي في قاعدة البيانات.',
                });
                return;
            }
            
            const orderId = orders[0].id;
            console.log("orderId orderId orderId", orderId);
            // // تمرير `orderId` إلى `OrderSender.send_with_company`
            // // await OrderSender.send_with_company(orderId);
            await OrderSender.send_with_company(this.env, this.env.pos, orderId, orderNumber, currentOrder, this.env.pos.config.sh_totar_id, true)
    }
        } catch (error) {
        console.error("Error fetching order ID:", error);
        await Gui.showPopup('ErrorPopup', {
            title: 'خطأ في العملية',
            body: 'حدث خطأ أثناء التحقق أو الإرسال، يرجى المحاولة مرة أخرى.',
        });
    }}


async _onValidateAndClick() {
    if (this._isDeliveryEnabled()) {
        if (!this._isPartnerSelected()) {
            return;
        }
        await this._Print_To_kitchen();
        await this._onCustomValidateOrder();
    } else {
        this.trigger('click-pay');
    }
}

        // async _onCustomValidateOrder() {
            
        //     const currentOrder = this.env.pos.get_order();
        //     console.log("const currentOrder = this.env.pos.get_order();", this.env.pos.get_order())

        //     const updateOrder = this.env.pos.get_order();
        //     if (!this._isPartnerSelected()) {
        //         return;
        //     }

        //     if (currentOrder) {
        //         if (!currentOrder.is_to_invoice()) {
        //             this.env.pos.add_new_order();
        //             console.log("!currentOrder.is_to_invoice()", this.env.pos.get_order())
        //             await this._finalizeOrder(currentOrder); 
        //             this._backToProductScreen(); 
        //         } else {
        //             console.log("The order is invoiced");
        //         }
        //     }
        // }



        async _onCustomValidateOrder() {
            const currentOrder = this.env.pos.get_order();
            // if (!this._isPartnerSelected()) {
            //     return;
            // }
        
            if (currentOrder) {
                if (!currentOrder.is_to_invoice()) {
                    if (currentOrder.is_edited_order) {
                        await this._finalizeOrder(currentOrder);
                        this._backToProductScreen();
                        currentOrder.is_edited_order = false
                        this.env.pos.set_start_order();
                    } else {
                        this.env.pos.add_new_order();
                        console.log("from deleivery screen")
                        await this._finalizeOrder(currentOrder);
                        this._backToProductScreen();
                    }
                } else {
                    console.log("The order is invoiced");
                }
            }
        }
        
        
        

        
        async _Print_To_kitchen() {
            if (!this.clicked) {
                // if (!this._isPartnerSelected()) {
                //     return;
                // }
                try {
                    this.clicked = true;
                    const order = this.env.pos.get_order();
                    console.log("The order is clicked");
                    console.log("The order is clicked", order.hasChangesToPrint());
                    if (order.hasChangesToPrint()) {
                        const isPrintSuccessful = await order.printChanges();
                        console.log("The order has changes to print");
                        if (isPrintSuccessful) {
                            order.updatePrintedResume();
                            console.log("The order is printed");
                        } else {
                            this.showPopup('ErrorPopup', {
                                title: this.env._t('Printing failed'),
                                body: this.env._t('Failed in printing the changes in the order'),
                            });
                        }
                    } else {
                        console.log("The order does not have changes to print");
                    }
                } finally {
                    this.clicked = false;
                    console.log("The order is finally");
                }
            }
        }

        _isPartnerSelected() {
            const currentOrder = this.env.pos.get_order();
            if (!currentOrder || !currentOrder.get_partner()) {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Customer Not Selected'),
                    body: this.env._t('Please select a customer before proceeding.'),
                });
                return false;
            }
            return true;
        }
//  we use finalize to save order.
        async _finalizeOrder(order) {
            try {
                await this.env.pos.push_single_order(order);
                } catch (error) {
                console.error("Error finalizing order:", error);
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Order Validation Failed'),
                    body: this.env._t('Failed to save the order. Please try again.'),
                });
            }
        }
        
        _backToProductScreen() {
            this.showScreen('ProductScreen');
            console.log("Navigated back to the Product Screen");
        }

        _isDeliveryEnabled() {
            return this.env.pos.config.sh_enable_order_delivery_list;
        }
    };
    
    Registries.Component.extend(ActionpadWidget, ActionpadWidgetAccessRight);
    return ActionpadWidget;
});
