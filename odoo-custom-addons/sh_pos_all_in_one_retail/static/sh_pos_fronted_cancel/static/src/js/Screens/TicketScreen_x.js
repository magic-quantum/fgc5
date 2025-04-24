odoo.define("sh_pos_fronted_cancel.TicketScreen_x", function (require) {
    "use strict";
    const core = require('web.core');
    const { Order } = require('point_of_sale.models');
    const QWeb = core.qweb;
    const rpc = require('web.rpc');
    const Registries = require("point_of_sale.Registries");
    const TicketScreen_x = require('sh_pos_order_list.TicketScreen_x')
    const PosTicketScreen_x = (TicketScreen_x) =>
        class extends TicketScreen_x {
            constructor() {
                super(...arguments);
            }
            click_draft(event) {
                event.stopPropagation();
                var self = this;
                self.env.pos.db.save("removed_orders", []);
                var order_id = $(event.currentTarget.closest("tr")).data('order-id')
                return new Promise(function (resolve, reject) {
                    try {
                        self.env.services.rpc({
                            model: "pos.order",
                            method: "sh_fronted_cancel_draft",
                            args: [[order_id]],
                        }).then(function (return_order_data) {
                            if (return_order_data) {
                                self.env.pos.db.save("removed_draft_orders", []);
                                self.update_order_list(return_order_data);
                            }
                        }).catch(function (error) {
                        });
                    } catch (error) {}
                });
            }
            // click_cancel(event) {
            //     event.stopPropagation();
            //     var self = this;
            //     var order_id = $(event.currentTarget.closest("tr")).data('order-id');
            
            //     // Show a confirmation pop-up
            //     var confirmation = confirm("Are you sure you want to cancel this order?");
            //     console.log("confirmation confirmation confirmation confirmation ", confirmation)
            //     // If the user confirms, proceed with the cancellation
            //     if (confirmation) {
            //         return new Promise((resolve, reject) => {
            //             self.env.services.rpc({
            //                 model: "pos.order",
            //                 method: "sh_fronted_mark_cancel",
            //                 args: [[order_id]],
            //             }).then(return_order_data => {
            //                 if (return_order_data) {
            //                     self.update_order_list(return_order_data);
            //                 }
            //             }).catch(error => {
            //                 console.error("Error in click_cancel:", error);
            //                 reject(error);
            //             });
            //         });
            //     }
            // }
// async click_cancel(event) {
//     event.stopPropagation();
//     var self = this;
//     var order_id = $(event.currentTarget.closest("tr")).data('order-id');

//     // عرض نافذة تأكيد للمستخدم
//     var confirmation = confirm("Are you sure you want to cancel this order?");
//     if (confirmation) {
//         try {
//             // استدعاء RPC لإلغاء الطلب
//             await self.env.services.rpc({
//                 model: "pos.order",
//                 method: "sh_fronted_mark_cancel",
//                 args: [[order_id]],
//             });
            
//             console.log("before _print_cancel_receipt")
//             await self._print_cancel_receipt(order_id);
//             console.log("after _print_cancel_receipt", )
//         } catch (error) {
//             console.error("Error canceling order:", error);
//         }
//     }
// }
// async _print_cancel_receipt(order_id) {
//     if (!this.env.pos) {
//         console.error("POS is not initialized.");
//         return;
//     }

//     const order = this.env.pos.get_order();

//     if (!order) {
//         console.error("Order not found.");
//         return;
//     }

//     // تحقق من وجود طابعة المطبخ
//     if (this.env.pos.unwatched.printers.length > 0) {
//         try {
//             const d = new Date();
//             let hours = '' + d.getHours();
//             hours = hours.length < 2 ? ('0' + hours) : hours;
//             let minutes = '' + d.getMinutes();
//             minutes = minutes.length < 2 ? ('0' + minutes) : minutes;

//             for (const printer of this.env.pos.unwatched.printers) {
//                 const printingChanges = {
//                     new: [], // طلبات جديدة (فارغة لأن الطلب ملغي بالكامل)
//                     cancelled: order.orderlines.map(line => ({
//                         product_id: line.product.id,
//                         quantity: line.quantity,
//                         name: line.product.display_name,
//                         note: line.get_note() || '', // إضافة الملاحظات إذا كانت موجودة
//                     })),
//                     table_name: this.env.pos.config.iface_floorplan ? this.getTable()?.name : false,
//                     floor_name: this.env.pos.config.iface_floorplan ? this.getTable()?.floor?.name : false,
//                     name: 'Cancelled Order',
//                     time: {
//                         hours,
//                         minutes,
//                     },
//                 };

//                 // التحقق من تحميل QWeb والقالب
//                 if (!QWeb) {
//                     console.error("QWeb is not defined.");
//                     return;
//                 }

//                 console.error("OrderChangeReceipt OrderChangeReceipt OrderChangeReceipt");
//                 const receipt = QWeb.render('OrderChangeReceipt', { changes: printingChanges });
//                 console.error("receipt receipt receipt receipt", receipt);
//                 const result = await printer.print_receipt(receipt);
//                 if (!result.successful) {
//                     console.error("Printing failed");
//                 }
//             }
//         } catch (error) {
//             console.error("Error printing cancel receipt:", error);
//         }
//     } else {
//         console.log("No kitchen printer found.");
//     }
// }
// async _print_cancel_receipt(order_id) {
//     if (!this.env.pos) {
//         console.error("POS is not initialized.");
//         return;
//     }

//     const order = this.env.pos.get_order();

//     if (!order) {
//         console.error("Order not found.");
//         return;
//     }

//     const d = new Date();
//     let hours = '' + d.getHours();
//     hours = hours.length < 2 ? ('0' + hours) : hours;
//     let minutes = '' + d.getMinutes();
//     minutes = minutes.length < 2 ? ('0' + minutes) : minutes;

//     const printingChanges = {
//         new: [],
//         cancelled: order.orderlines.map(line => ({
//             product_id: line.product.id,
//             quantity: line.quantity,
//             name: line.product.display_name,
//             note: line.get_note() || '',
//         })),
//         table_name: this.env.pos.config.iface_floorplan ? this.getTable()?.name : false,
//         floor_name: this.env.pos.config.iface_floorplan ? this.getTable()?.floor?.name : false,
//         name: 'Cancelled Order',
//         time: {
//             hours,
//             minutes,
//         },
//     };

//     if (!QWeb) {
//         console.error("QWeb is not defined.");
//         return;
//     }

//     const receipt = QWeb.render('OrderChangeReceipt', { changes: printingChanges });

//     // عرض الإيصال في نافذة جديدة
//     console.log("receipt receiptreceipt receipt receipt", receipt)
//     const receiptWindow = window.open("", "Receipt", "width=800,height=600");
//     receiptWindow.document.write(receipt);
//     receiptWindow.document.close();
// }


/*
async click_print_line(event) {
    var self = this;

    // الحصول على معرف الطلب
    var order_id = $(event.currentTarget.closest("tr")).data('order-id');
    console.log("Order ID passed from HTML:", order_id);

    var order_data = self.env.pos.db.order_by_id[order_id];

    if (order_data) {
        console.log("Order found:", order_data);
        console.log("Order Lines before removal:", order_data.lines);

        // استخراج الخطوط ومعالجتها
        for (let pos_order_line of order_data.lines) {
            var line = self.env.pos.db.order_line_by_id[pos_order_line];
            console.log("Order Line ID:", pos_order_line);
            console.log("Line Data:", line);

            if (line && line.product_id) {
                const product_id = line.product_id[0]; // استخراج معرف المنتج
                const quantity = line.qty; // الكمية المطلوبة

                if (self.env.pos.db.quant_by_product_id[product_id]) {
                    const actual_quantity = self.env.pos.db.quant_by_product_id[product_id][self.env.pos.config.sh_pos_location[0]];
                    const newQty = actual_quantity + quantity;

                    var dic = {
                        'product_id': product_id,
                        'location_id': self.env.pos.config.sh_pos_location[0],
                        'quantity': newQty,
                        'other_session_qty': quantity,
                        'manual_update': false
                    };

                    // تحديث الكمية في قاعدة البيانات
                    try {
                        await self.rpc({
                            model: 'sh.stock.update',
                            method: 'sh_update_manual_qty',
                            args: [self.env.pos.pos_session.id, dic]
                        });
                        console.log(`Stock updated successfully for product ID: ${product_id}`);
                    } catch (error) {
                        console.error(`Error updating stock for product ID: ${product_id}`, error);
                    }
                }

                // إزالة الخط
                self.env.pos.get_order().remove_orderline(self.env.pos.get_order().get_selected_orderline());
            } else {
                console.log("Product is undefined or invalid for line", pos_order_line);
            }
        }

        // طباعة الحالة النهائية بعد الإزالة
        const remaining_lines = self.env.pos.get_order().get_orderlines();
        console.log("Order Lines after removal:", remaining_lines);

        // تحديث الشارات بعد الإزالة
        self.env.pos.get_order().product_with_qty = {};
        _.each(self.env.pos.get_order().get_orderlines(), (line) => {
            line.set_quantity(line.quantity);
        });

    } else {
        console.log("Order not found in db.");
    }
}
*/




async _Print_To_kitchen(order_name) {
    try {
        this.clicked = true;
        const order = this.env.pos.get_order();
        const tempOrderName = order.name;
        order.name = order_name;
        order_name =  "";
        // console.log("The order is clicked");
        // console.log("The order has changes to print", order.hasChangesToPrint());
        if (order.hasChangesToPrint()) {
            let is_cancel =true
            const isPrintSuccessful = await order.printChanges(is_cancel=true);
            // console.log("The order has changes to print");
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
        order.name = tempOrderName;
    } finally {
        this.clicked = false;
        console.log("The order is finally");
    }
}


async click_cancel1(order_id, currentOrder) {
    console.log("Order ID is missing or undefined", currentOrder);
    const self = this;
    self.env.pos.db.cancel_remove_order(currentOrder.uid);
    self.env.pos.removeOrder(currentOrder);
    if (!order_id) {
        console.error("Order ID is missing or undefined");
        return;
    }

    return new Promise((resolve, reject) => {
        self.env.services.rpc({
            model: "pos.order",
            method: "sh_fronted_mark_cancel",
            args: [[order_id]],
        }).then(return_order_data => {
            if (return_order_data) {
                self.update_order_list(return_order_data);
            }
        }).catch(error => {
            console.error("Error in click_cancel:", error);
            reject(error);
        });
    });
}


async click_print_line(event) {
    event.stopPropagation();
    var self = this;

    var current_order;
    var order_id = $(event.currentTarget.closest("tr")).data('order-id');
    var order_data = self.env.pos.db.order_by_id[order_id];
    console.log("Order ID passed from HTML:", order_id);

    try {
        const order_status = await self.rpc({
            model: 'pos.order',
            method: 'search_read',
            args: [[['id', '=', order_id]], ['state', 'x_delivery_status']],
            context: self.env.session.user_context,
        });

        if (order_status.length > 0 ){
            if (order_status[0].state === 'cancel') {
                self.showPopup('ErrorPopup', {
                    title: self.env._t('cancel order'),
                    body: self.env._t('the order has been cancelled'),
                });
                return;
            }
            if (order_status[0].x_delivery_status === 'delivered') {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('sending order'),
                    body: this.env._t('The order has been sent'),
                });
                return;
            }
        }
    } catch (error) {
        console.error("------------------------------------------");
        return;
    }

    const { confirmed } = await this.showPopup('ConfirmPopup', {
        title: this.env._t('إلغاء الطلب'),
        body: this.env._t('.هل أنت متأكد أنك تريد إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء'),
        confirmText: this.env._t('نعم، إلغاء'),
        cancelText: this.env._t('لا، احتفظ بالطلب'),
    });
    if (confirmed)  {
        if (order_id) {
            if (!self.env.pos.orders.find(order => order.name === order_data.pos_reference)){
                const fetchedOrders = await self.rpc({
                    model: 'pos.order',
                    method: 'export_for_ui',
                    args: [order_id],
                    context: self.env.session.user_context,
                });
                await self.env.pos._loadMissingProducts(fetchedOrders);
                await self.env.pos._loadMissingPartners(fetchedOrders);
                fetchedOrders.forEach((order) => {
                    self._state.syncedOrders.cache[order.id] = Order.create({}, { pos: self.env.pos, json: order });
                    
                    
                });
                current_order = self._state.syncedOrders.cache[order_id];
                console.log("current_order = self._state.syncedOrders.cache[order_id];", current_order);
            } else {
                current_order = self.env.pos.orders.find(order => order.name === order_data.pos_reference)
            }
        }
        console.log("the products in Current Order", current_order.orderlines);


        if (order_data) {
            console.log("Order found:", order_data);
            // console.log("Order Lines before removal:", order_data.lines);




            const cancelledLines = [];
            for (let pos_order_line of order_data.lines) {
                var line = self.env.pos.db.order_line_by_id[pos_order_line];
                // console.log("Order Line ID:", pos_order_line);
                console.log("Line Data:", line);

                if (line && line.product_id) {
                    const product_id = line.product_id[0]; 
                    const name = line.product_id[1];
                    const quantity = line.qty;
                    const orderline_obj = current_order.orderlines.find(l => 
                        l.product.id === line.product_id[0] && l.quantity === line.qty
                    );
                    const pos_categ_id = orderline_obj?.product?.pos_categ_id ? orderline_obj.product.pos_categ_id[0] : null;
                    console.log("orderline_obj orderline_obj orderline_obj", orderline_obj);
                    console.log("pos_categ_id pos_categ_id pos_categ_id:", pos_categ_id);


                    
                    if (self.env.pos.db.quant_by_product_id[product_id]) {
                        const actual_quantity = self.env.pos.db.quant_by_product_id[product_id][self.env.pos.config.sh_pos_location[0]];
                        const newQty = actual_quantity + quantity;

                        var dic = {
                            'product_id': product_id,
                            'location_id': self.env.pos.config.sh_pos_location[0],
                            'quantity': newQty,
                            'other_session_qty': quantity,
                            'manual_update': false
                        };

                        try {
                            await self.rpc({
                                model: 'sh.stock.update',
                                method: 'sh_update_manual_qty',
                                args: [self.env.pos.pos_session.id, dic]
                            });
                            console.log(`Stock updated successfully for product ID: ${product_id}`);
                        } catch (error) {
                            console.error(`Error updating stock for product ID: ${product_id}`, error);
                        }
                    }

                    self.env.pos.get_order().printingChanges['cancelled'].push({
                        product_id: product_id,
                        name: name,
                        quantity: quantity,
                        pos_categ_id:pos_categ_id
                    });
                    self.env.pos.get_order().remove_orderline(self.env.pos.get_order().get_selected_orderline());
                } else {
                    console.log("Product is undefined or invalid for line", pos_order_line);
                }
            }
            console.log("beeeeeef")
            console.log("current_order.name",current_order.name);
            self.click_cancel1(order_id, current_order);
            console.log("aaaaaaaaaf")
            if (self.env.pos.get_order().hasChangesToPrint()) {
                await self._Print_To_kitchen(current_order.name);
            }

            const remaining_lines = self.env.pos.get_order().get_orderlines();
            // console.log("Order Lines after removal:", remaining_lines);

            self.env.pos.get_order().product_with_qty = {};
            _.each(self.env.pos.get_order().get_orderlines(), (line) => {
                line.set_quantity(line.quantity);
            });
        } else {
            console.log("Order not found in db.");
        }
    }
}













async removelineClick(event) {
    var self = this;
    event.stopPropagation();
    event.preventDefault();

    console.log("Removing line:", this.props.line);

    if (this.env.pos.db.quant_by_product_id[this.props.line.product.id]) {
        const actual_quantity = this.env.pos.db.quant_by_product_id[this.props.line.product.id][this.env.pos.config.sh_pos_location[0]];
        var newQty = actual_quantity + this.props.line.quantity;
        var dic = {
            'product_id': this.props.line.product.id,
            'location_id': this.env.pos.config.sh_pos_location[0],
            'quantity': newQty,
            'other_session_qty': this.props.line.quantity,
            'manual_update': false
        };

        console.log("RPC request to update stock:", dic);
        self.rpc({
            model: 'sh.stock.update',
            method: 'sh_update_manual_qty',
            args: [self.env.pos.pos_session.id, dic]
        });
    }

    const order = self.env.pos.get_order();
    console.log("Current orderlines before removing:", order.get_orderlines());

    this.trigger('select-line', { orderline: this.props.line });
    console.log("Selected line to remove:", this.props.line);

    const selectedLine = self.env.pos.get_order().get_selected_orderline();
    console.log("Selected orderline to remove:", selectedLine);

    if (selectedLine) {
        console.log("Removing line:", selectedLine);
        self.env.pos.get_order().remove_orderline(selectedLine);
        console.log("Line removed from order:", selectedLine);
    } else {
        console.log("No line selected for removal.");
    }

    console.log("Orderlines after removal:", self.env.pos.get_order().get_orderlines());

    self.env.pos.get_order().product_with_qty = {};
    _.each(self.env.pos.get_order().get_orderlines(), (line) => { 
        console.log("Updating line quantity:", line);
        line.set_quantity(line.quantity);
    });

    console.log("Updated quantities for all lines.");

    self.env.pos.get_order().trigger('orderlines-changed');
}










                     
            click_delete(event) {
                event.stopPropagation();
                var self = this;
                self.env.pos.db.save("removed_orders", []);
                var order_id = $(event.currentTarget.closest("tr")).data('order-id')

                return new Promise(function (resolve, reject) {
                    try {
                        self.env.services.rpc({
                            model: "pos.order",
                            method: "sh_fronted_cancel_delete",
                            args: [[order_id]],
                        })
                            .then(function (return_order_data) {
                                if (return_order_data) {
                                    self.env.pos.db.save("removed_orders", []);
                                    self.update_order_list(return_order_data);
                                }
                            })
                            .catch(function (error) {
                            });
                    } catch (error) {}
                });
            }
            // click_paid(event) {
            //     event.stopPropagation();
            //     var self = this;
            //     var order_id = $(event.currentTarget.closest("tr")).data('order-id');
            //     var order_data = this.env.pos.db.order_by_id[order_id];
            //     var current_order = this.env.pos.orders.find(order => order.name === order_data.pos_reference);
            //     console.log("Matching order by name (pos_reference):", current_order || "No matching order found");

            //     this.env.pos.db.cancel_remove_order(current_order.uid);
            //     this.env.pos.removeOrder(current_order);
            //     const order = this.env.pos.get_order();
            //     var currentSessionId = this.env.pos.config.current_session_id[0];
            //     console.log("Order iddddddddddddddddddddddddddddd:", currentSessionId);

            //     return new Promise((resolve, reject) => {
            //         console.log("Order iddddddddddddddddddddddddddddd:", currentSessionId);
            //         rpc.query({
            //             model: 'pos.order',
            //             method: 'sh_fronted_mark_paid',
            //             args: [order_id, currentSessionId],
            //         }).then(return_order_data => {
            //             console.log("Order marked as paid:", return_order_data);
            //             if (return_order_data) {
            //                 self.update_order_list(return_order_data);
            
            //                 // Add payment method logic here
            //                 const paymentMethod = return_order_data[0].payment_method_id
            //                 console.log("Order marked as paid:",paymentMethod);

            //                 const paymentMethodObj = this.env.pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
            //                 console.log("Order marked as paid:", paymentMethodObj);

            //                 if (paymentMethodObj) {
            //                     order.add_paymentline(paymentMethodObj);
            //                     console.log(`Payment method ${paymentMethod} added to the order.`);
            //                     console.log("Current payment lines:", order.paymentlines);

            //                 } else {
            //                     console.error(`Payment method ${paymentMethod} not found.`);
            //                 }
            //             }
            //         }).catch(error => {
            //             console.error("Error in click_paid:", error);
            //             reject(error);
            //         });
            //     });
            // }
            

async click_paid(event) {
    event.stopPropagation();
    var self = this;
    var order_id = $(event.currentTarget.closest("tr")).data('order-id');
    var order_data = this.env.pos.db.order_by_id[order_id];

    const order = this.env.pos.get_order();
    var currentSessionId = this.env.pos.config.current_session_id[0];

    console.log("Order ID:", order_id, "Session ID:", currentSessionId);

    const { confirmed } = await this.showPopup('ConfirmPopup', {
        title: this.env._t('تأكيد الدفع'),
        body: this.env._t('هل أنت متأكد أنك تريد وضع علامة "مدفوع" على هذا الطلب؟'),
        confirmText: this.env._t('وضع كمدفوع'),
    });
    


    if (!confirmed) {
        console.log("Payment cancelled by the user.");
        return;
    } else {
        try {
            const order_status = await rpc.query({
                model: 'pos.order',
                method: 'search_read',
                args: [[['id', '=', order_id]], ['state']],
                context: this.env.session.user_context,
            });

            if (order_status.length > 0) {
                console.log("Order Status:", order_status[0].state);
                if (order_status[0].state === 'paid' || order_status[0].state === 'done') {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('Paid order'),
                        body: this.env._t('The order has been paid'),
                    });
                    return;
                }
                if (order_status[0].state === 'cancel') {
                    this.showPopup('ErrorPopup', {
                        title: this.env._t('cancel order'),
                        body: this.env._t('the order has been cancelled'),
                    });
                    return;
                }
            }

            const return_order_data = await rpc.query({
                model: 'pos.order',
                method: 'sh_fronted_mark_paid',
                args: [order_id, currentSessionId],
            });

            console.log("Order marked as paid:", return_order_data);
            if (return_order_data) {
                self.update_order_list(return_order_data);

                const paymentMethod = return_order_data[0].payment_method_id;
                console.log("Payment Method ID:", paymentMethod);

                const paymentMethodObj = this.env.pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
                console.log("Payment Method Object:", paymentMethodObj);

                if (paymentMethodObj) {
                    order.add_paymentline(paymentMethodObj);
                    console.log(`Payment method ${paymentMethod} added to the order.`);
                    console.log("Current payment lines:", order.paymentlines);
                } else {
                    console.error(`Payment method ${paymentMethod} not found.`);
                }
            }

            this.env.pos.add_new_order();

        } catch (error) {
            console.error("Error in click_paid:", error);
            console.error("------------------------------------------");
            alert('An error occurred while marking the order as paid. Please try again.');
        }
    } 
}
            update_order_list(return_order_data) {
                const self = this;

                const updateOrders = (orders, return_data) => {
                    console.log('Order iedgrsdfghrfsdhdfhs:', return_data);
                    return_data.forEach(update_order => {
                        orders.forEach((val, i) => {
                            
                            if ((val.id && update_order.order_id && val.id === update_order.order_id) || 
                                (val.sh_uid && update_order.sh_uid && val.sh_uid === update_order.sh_uid)) {
                                
                                if (update_order.cancel_draft) {
                                    val.state = "draft"; // Update state to draft
                                    val.x_delivery_status = "notsend"; // Update state to paid
                                }
                                if (update_order.cancel_order) {
                                    val.state = "cancel"; // Update state to draft
                                    val.x_delivery_status = "notsend"; // Update state to paid
                                }
                                if (update_order.cancel_delete) {
                                    orders.splice(i, 1); // Remove order
                                }
                                if (update_order.paid) {
                                    val.state = "paid"; // Update state to paid
                                    val.x_delivery_status = "delivered"; // Update state to paid
                                }
                            }
                        });
                    });
                };

                updateOrders(self.env.pos.db.all_display_order, return_order_data);
                updateOrders(self.env.pos.db.all_order, return_order_data);

                self.render(); // Re-render the UI to reflect changes
            }
        };
    Registries.Component.extend(TicketScreen_x, PosTicketScreen_x);
});
