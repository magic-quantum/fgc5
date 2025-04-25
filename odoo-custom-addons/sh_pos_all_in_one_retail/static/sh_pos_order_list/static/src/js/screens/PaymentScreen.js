odoo.define("sh_pos_order_list.PaymentScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const PaymentScreen = require("point_of_sale.PaymentScreen");

    const PosReturnPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            // async _finalizeValidation() {
            //     super._finalizeValidation();
            //     this.env.pos.order_length = this.env.pos.order_length + 1;
            // }
            async _finalizeValidation() {
                
                this._Print_To_kitchen();
                if ((this.currentOrder.is_paid_with_cash() || this.currentOrder.get_change()) && this.env.pos.config.iface_cashdrawer && this.env.proxy && this.env.proxy.printer) {
                    this.env.proxy.printer.open_cashbox();
                }
    
                this.currentOrder.initialize_validation_date();
                for (let line of this.paymentLines) {
                    if (!line.amount === 0) {
                         this.currentOrder.remove_paymentline(line);
                    }
                }
                this.currentOrder.finalized = true;
                let syncOrderResult, hasError;
    
                try {
                    this.env.services.ui.block()
                    // 1. Save order to server.
                    syncOrderResult = await this.env.pos.push_single_order(this.currentOrder);
    
                    // 2. Invoice.
                    if (this.shouldDownloadInvoice() && this.currentOrder.is_to_invoice()) {
                        if (syncOrderResult.length) {
                            await this.env.legacyActionManager.do_action(this.env.pos.invoiceReportAction, {
                                additional_context: {
                                    active_ids: [syncOrderResult[0].account_move],
                                },
                            });
                        } else {
                            throw { code: 401, message: 'Backend Invoice', data: { order: this.currentOrder } };
                        }
                    }
    
                    // 3. Post process.
                    if (syncOrderResult.length && this.currentOrder.wait_for_push_order()) {
                        const postPushResult = await this._postPushOrderResolve(
                            this.currentOrder,
                            syncOrderResult.map((res) => res.id)
                        );
                        if (!postPushResult) {
                            this.showPopup('ErrorPopup', {
                                title: this.env._t('Error: no internet connection.'),
                                body: this.env._t('Some, if not all, post-processing after syncing order failed.'),
                            });
                        }
                    }
                } catch (error) {
                    // unblock the UI before showing the error popup
                    this.env.services.ui.unblock();
                    if (error.code == 700 || error.code == 701)
                        this.error = true;
    
                    if ('code' in error) {
                        // We started putting `code` in the rejected object for invoicing error.
                        // We can continue with that convention such that when the error has `code`,
                        // then it is an error when invoicing. Besides, _handlePushOrderError was
                        // introduce to handle invoicing error logic.
                        await this._handlePushOrderError(error);
                    } else {
                        // We don't block for connection error. But we rethrow for any other errors.
                        if (isConnectionError(error)) {
                            this.showPopup('OfflineErrorPopup', {
                                title: this.env._t('Connection Error'),
                                body: this.env._t('Order is not synced. Check your internet connection'),
                            });
                        } else {
                            throw error;
                        }
                    }
                } finally {
                    this.env.services.ui.unblock()
                    // Always show the next screen regardless of error since pos has to
                    // continue working even offline.
                    this.showScreen(this.nextScreen);
                    // Remove the order from the local storage so that when we refresh the page, the order
                    // won't be there
                    
                    this.env.pos.db.remove_unpaid_order(this.currentOrder);
                    this.env.pos.db.cancel_remove_order(this.currentOrder.uid);
    
                }
                this.env.pos.order_length = this.env.pos.order_length + 1;
            }

            async _Print_To_kitchen() {
                let x = 0;
                if (!this.clicked) {
                    try {
                        this.clicked = true;
                        const order = this.env.pos.get_order();
                        console.log("The order is clicked");
                        console.log("The order is clicked", order.hasChangesToPrint(x));
                        if (order.hasChangesToPrint()) {
                            let is_cancel=false
                            const isPrintSuccessful = await order.printChangess(is_cancel=false);
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
        };
    Registries.Component.extend(PaymentScreen, PosReturnPaymentScreen);

});