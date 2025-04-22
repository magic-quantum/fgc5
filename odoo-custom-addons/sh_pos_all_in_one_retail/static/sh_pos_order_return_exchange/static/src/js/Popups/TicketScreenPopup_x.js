odoo.define("sh_pos_order_return_exchange.popup_x", function (require) {
    "use strict";

    const AbstractAwaitablePopup = require("point_of_sale.AbstractAwaitablePopup");
    const CustomPrinter = require("sh_pos_order_return_exchange.custom_printer");
    const Registries = require('point_of_sale.Registries');  // Import Registries
    const rpc = require('web.rpc');

    class TicketScreenPopup_x extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            this.orderReceipt = this.props.bilal.orderReceipt || null;
        }
        async _printOrderReceipt(orderId) {
            if (!this.orderReceipt) {
                console.error('Order receipt is undefined.');
                return;
            }
            console.log("isssss", orderId);
            console.log("isssss", this.orderReceipt);

            try {
                console.log(this.orderReceipt);
        
                // Try using this.env.pos to get the POS instance
                const posInstance = this.env.pos;
                const envInstance = this.env;
        
                if (!posInstance) {
                    console.error('POS instance is not available.');
                    return;
                }
                console.log(posInstance);
                console.log('the result is:');

                const orderes = await rpc.query({
                    model: 'pos.order',
                    method: 'getorder',
                    args: [orderId],
                });
                
                // Print result to see what fields are being returned
                console.log('Result from getorder:', orderes);
                
                // Pass the POS instance to the CustomPrinter
                const printResult = await CustomPrinter.print_receipt(this.orderReceipt, posInstance, orderes, envInstance);
        
                if (printResult) {
                    console.log('Receipt printed successfully.');
                } else {
                    console.error('Failed to print receipt.');
                }
            } catch (error) {
                console.error('Error during receipt printing:', error);
            }
        }
        
// Print logic
// _printOrderReceipt(orderId) {
//     const order_data = this.env.pos.db.order_by_id[orderId];
//     const current_order = this.env.pos.get_order();
//     if (!order_data || !current_order) {
//         console.error('No order data found for printing.');
//         return;
//     }

//     current_order.name = order_data.pos_reference;
//     current_order.assigned_config = order_data.assigned_config;
//     current_order.payment_data = order_data.payment_data;
//     current_order.amount_return = order_data.amount_return;
//     current_order.is_reprint = true;

//     // التحقق من وجود partner
//     current_order.partner = order_data.partner || { name: 'Unknown Customer' };

//     _.each(order_data.lines, (line_id) => {
//         const line_data = this.env.pos.db.order_line_by_id[line_id];
//         const product = this.env.pos.db.get_product_by_id(line_data.product_id[0]);
//         if (product) {
//             current_order.add_product(product, {
//                 quantity: line_data.qty,
//                 price: line_data.price_unit,
//                 discount: line_data.discount,
//             });
//         }
//     });

//     console.log('Printing order receipt.');
//     this.showScreen("ReceiptScreen"); // Show the receipt screen
// }
      


        // async assignDeliveryPerson(event) {
        //     try {
        //         const personInfo = event.target.getAttribute('data-person-info');
        //         const [fullName, orderId] = personInfo.split('+');  
        
        //         const order = this.env.pos.get_order();
        //         if (!order) {
        //             console.error('No order found.');
        //             return;
        //         }
        //         console.log('Order is found.', order);
        //         var currentSessionId = this.env.pos.config.current_session_id[0];
        
        //         // Call the backend method to assign the delivery person and return the result
        //         await rpc.query({
        //             model: 'pos.order',
        //             method: 'action_assign_delivery_person',
        //             args: [fullName, orderId, currentSessionId],
        //         }).then(return_order_data => {
        //             console.log('Delivery person assigned successfully.', return_order_data);

        //             if (return_order_data[0].success) {
        //                 console.log('Delivery person assigned successfully.', return_order_data[0]);
                        
        //                 // Update the order object on the client side
        //                 order.x_delivery_person_name = fullName;  // Assuming x_delivery_person_name is the field you're displaying

                        
        //                 console.log('Order synchronized with the backend and front-end updated.');
        //                  this.update_order_list(return_order_data, order);
    
        //                  this._printOrderReceipt(orderId);
            
        //                 if (return_order_data[0].is_company) {
        //                     const paymentMethod = return_order_data[0].payment_method_id;
        //                     const paymentMethodObj = this.env.pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
                            
        //                     if (paymentMethodObj) {
        //                         order.add_paymentline(paymentMethodObj);
        //                         console.log(`Payment method ${paymentMethod} added to the order.`);
        //                     } else {
        //                         console.error(`Payment method ${paymentMethod} not found.`);
        //                     }
 
        //                     // i commount out download pdf file invoice.
        //                     // if (return_order_data[0].account_move_id) {
        //                     //      this.env.legacyActionManager.do_action(this.env.pos.invoiceReportAction, {
        //                     //         additional_context: {
        //                     //             active_ids: [return_order_data[0].account_move_id], 
        //                     //         },
        //                     //     });
        //                     //     console.log('Invoice generated successfully.');
        //                     // } else {
        //                     //     console.error('Failed to generate invoice: No account_move_id returned.');
        //                     // }
        //                 }

        //             } else if (return_order_data[0].error) {
        //                 console.error('Failed to assign delivery person:', return_order_data[0].error);
        //                 alert(return_order_data[0].error);
        //             }
        //             this.render();  
        //             this.cancel();  
        //         })
        //         // if (result) {
        //         //     console.log('Order found and delivery person assigned:', result);
        
        //         //     // Pass the result and the current order to the update_order_list method
        //         //     await this.update_order_list(result, order);
        //         // }
                

        
        //     } catch (error) {
        //         console.error('Error in assigning delivery person or printing receipt:', error);
        //         alert('An error occurred while assigning the delivery person. Please try again.');
        //     }

        // }
        
        async assignDeliveryPerson(event) {
            try {
                const personInfo = event.target.getAttribute('data-person-info');
                console.log('Delivery person', personInfo);
                const [fullName, orderId] = personInfo.split('+');  
        
                const order = this.env.pos.get_order();
                if (!order) {
                    console.error('No order found.');
                    return;
                }
                console.log('Order is found.', order);
                var currentSessionId = this.env.pos.config.current_session_id[0];
                
                const order_data = await rpc.query({
                    model: 'pos.order',
                    method: 'search_read',
                    args: [[['id', '=', orderId]], ['x_delivery_person_name', 'state']],
                    context: this.env.session.user_context,
                });

                if (order_data.length > 0) {
                    if (order_data[0].state === 'invoiced') {
                        this.showPopup('ErrorPopup', {
                            title: this.env._t('sending order'),
                            body: this.env._t('The order has been sent'),
                        });
                        return;
                    }
                    if (order_data[0].state === 'cancel') {
                        this.showPopup('ErrorPopup', {
                            title: this.env._t('cancel order'),
                            body: this.env._t('the order has been cancelled'),
                        });
                        return;
                    }
                }

                // Call the backend method to assign the delivery person and return the result
                await rpc.query({
                    model: 'pos.order',
                    method: 'action_assign_delivery_person',
                    args: [fullName, orderId, currentSessionId],
                }).then(return_order_data => {
                    console.log('Delivery person assigned successfully.', return_order_data);

                    if (return_order_data[0].success) {
                        console.log('Delivery person assigned successfully.', return_order_data[0]);
                        
                        // Update the order object on the client side
                        order.x_delivery_person_name = fullName;  // Assuming x_delivery_person_name is the field you're displaying

                        
                        console.log('Order synchronized with the backend and front-end updated.');
                         this.update_order_list(return_order_data, order);
    
                         this._printOrderReceipt(orderId);
            
                        if (return_order_data[0].is_company) {
                            const paymentMethod = return_order_data[0].payment_method_id;
                            const paymentMethodObj = this.env.pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
                            
                            if (paymentMethodObj) {
                                order.add_paymentline(paymentMethodObj);
                                console.log(`Payment method ${paymentMethod} added to the order.`);
                            } else {
                                console.error(`Payment method ${paymentMethod} not found.`);
                            }
            
                            // if (return_order_data[0].account_move_id) {
                            //      this.env.legacyActionManager.do_action(this.env.pos.invoiceReportAction, {
                            //         additional_context: {
                            //             active_ids: [return_order_data[0].account_move_id], 
                            //         },
                            //     });
                            //     console.log('Invoice generated successfully.');
                            // } else {
                            //     console.error('Failed to generate invoice: No account_move_id returned.');
                            // }
                            this.env.pos.add_new_order();
                            
                        }

                    } else if (return_order_data[0].error) {
                        console.error('Failed to assign delivery person:', return_order_data[0].error);
                        alert(return_order_data[0].error);
                    }
                    
                    this.render();  
                    this.cancel();
                     
                })
                // if (result) {
                //     console.log('Order found and delivery person assigned:', result);
        
                //     // Pass the result and the current order to the update_order_list method
                //     await this.update_order_list(result, order);
                // }
                

        
            } catch (error) {
                console.error('Error in assigning delivery person or printing receipt:', error);
                console.error("------------------------------------------");
                alert('An error occurred while assigning the delivery person. Please try again.');
            }
        }
        
        
        
        

        async update_order_list(return_order_data) {
            const self = this;
            console.log('Order is:', return_order_data);
        
            const updateOrders = (orders, return_order_data) => {
                console.log('Order iedgrsdfghrfsdhdfhs:', return_order_data);
                console.log('Order iedgrsdfghrfsdhuiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiidfhs:', orders);
                return_order_data.forEach(update_order => {
                    console.log('Order is:', return_order_data);
                    console.log('Order is:', update_order);

                orders.forEach((val, i) => {
                    console.log('Order isbi;aaaaaaaaaaaaaa;:', val);
                    console.log('Order isbi;aaaaaaaaaaaaaabbbbbbbbbbbbbbbbb;:', update_order.order_id);

                    if ((val.id && update_order.order_id && val.id == update_order.order_id)) {
                        console.log('bi;alal', val.id);
                        console.log('smmsss', update_order.order_id);
                        if (update_order.success) {
                            val.state = update_order.state; // Update delivery status
                            val.x_delivery_status = update_order.delivery_status; // Update delivery status
                            val.x_delivery_person_name = update_order.delivery_person; // Update delivery person
                        }
                    }
                });
            });
            };
        
            // Call `updateOrders` for each order list
            updateOrders(self.env.pos.db.all_display_order, return_order_data);
            updateOrders(self.env.pos.db.all_order, return_order_data);
        
            self.render(); // Re-render the UI to reflect changes
        }
        
        
    }

    TicketScreenPopup_x.template = 'TicketScreenPopup_x';  // Ensure template is set
    Registries.Component.add(TicketScreenPopup_x);  // Register the component with Registries

    return TicketScreenPopup_x;
});