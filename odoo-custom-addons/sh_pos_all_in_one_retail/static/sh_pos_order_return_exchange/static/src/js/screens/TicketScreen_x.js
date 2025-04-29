odoo.define('sh__return_exchange.TicketScreen_x', function (require, factory) {
    'use strict';

    console.log("TicketScreen_x loaded"); 
    
    const CustomPrinter = require("sh_pos_order_return_exchange.custom_printer");
    const TicketScreen_x = require('sh_pos_order_list.TicketScreen_x')
    const Registries = require("point_of_sale.Registries");
    const rpc = require('web.rpc');
    const Dialog = require('web.Dialog');
    const ShPosTicketScreen_x = (TicketScreen_x) =>
        class extends TicketScreen_x {
            constructor() {
                super(...arguments);
                this.order_no_return = [];
                this.return_filter = false;
            }
            get ordersession(){
                var currentSessionId = this.env.pos.config.current_session_id[0];
                return currentSessionId
            }

            // get posorderdetail() {
            //     var self = this;

            //     var AllIds = _.map(self.env.pos.db.all_display_order, function (display_order) {
            //         return display_order.id
            //     })
            //     var new_orders = self.env.pos.db.all_order.filter(order =>  !AllIds.includes(order.id))
                
            //     if (new_orders && new_orders.length){
            //         for (var neworder of new_orders){
                        
            //             let old_order = self.env.pos.db.all_display_order.filter((n_order) => n_order.pos_reference == neworder.old_pos_reference)
        
            //             if (old_order && old_order.length){
            //                 var order_index =  self.env.pos.db.all_display_order.indexOf(old_order[0])
            //                 self.env.pos.db.all_display_order.splice(order_index, 1)
                            
            //                 var Upodated_order = self.env.pos.db.all_order.filter(order =>  order.id == old_order[0].id)

            //                 if (Upodated_order && Upodated_order.length){
            //                     self.env.pos.db.all_display_order.unshift(Upodated_order[0])
            //                 }
            //             }
            //             self.env.pos.db.all_display_order.unshift(neworder)
            //             if (neworder.is_return_order){
            //                 self.env.pos.db.all_return_order.unshift(neworder);
            //             }else{
            //                 self.env.pos.db.all_non_return_order.unshift(neworder);
            //             }
            //         }
            //     }

            //     if ($('.sh-pos-order-filter') && $('.sh-pos-order-filter').length > 0 && $('.sh-pos-order-filter').val() != "all") {
            //         var value = $('.sh-pos-order-filter').val()
            //         var templates;
            //         if ($(".return_order_button").hasClass("highlight")){
            //             templates = self.env.pos.db.all_display_order.filter((template) => (template.state == value && template.is_return_order))
            //         }else{
            //             templates = self.env.pos.db.all_display_order.filter((template) => template.state == value && !template.is_return_order)
            //         }

                    // if (this.state.query && this.state.query.trim() !== "") {
                    //     var search = this.state.query.trim()
                    //     var templates = _.filter(templates, function (template) {
                    //         if (template.name.indexOf(search) > -1) {
                    //             return true;
                    //         } else if (template["pos_reference"].indexOf(search) > -1) {
                    //             return true;
                    //         } else if (template["partner_id"] && template["partner_id"][1] && template["partner_id"][1].toLowerCase().indexOf(search) > -1) {
                    //             return true;
                    //         } else if (template["date_order_x"] && template["date_order_x"].indexOf(search) > -1) {
                    //             return true;
                    //         } else {
                    //             return false;
                    //         }
                    //     });
            //             $(".sh_pagination").pagination("updateItems", Math.ceil(templates.length / self.env.pos.config.sh_how_many_order_per_page));
            //             var current_page = $(".sh_pagination").find('.active').text();

            //             var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(current_page) - 1);;
            //             var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);
            //             templates = templates.slice(showFrom, showTo);

            //             return templates
            //         } else {
            //             $(".sh_pagination").pagination("updateItems", Math.ceil(templates.length / self.env.pos.config.sh_how_many_order_per_page));
            //             var current_page = $(".sh_pagination").find('.active').text();

            //             var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(current_page) - 1);;
            //             var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);
            //             templates = templates.slice(showFrom, showTo);

            //             return templates
            //         }

            //     } else {
            //         if (this.state.query && this.state.query.trim() !== "") {
            //             var templates = this.get_order_by_name(this.state.query.trim());
            //             $(".sh_pagination").pagination("updateItems", Math.ceil(templates.length / self.env.pos.config.sh_how_many_order_per_page));
            //             var pageNumber = $(".sh_pagination").find('.active').text();
            //             var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(pageNumber) - 1);
            //             var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);
            //             templates = templates.slice(showFrom, showTo);
            //             return templates;
            //         } else {
            //             self.order_no_return = [];
            //             self.return_order = [];
            //             _.each(self.env.pos.db.all_display_order, function (order) {
            //                 if ((order.is_return_order && order.return_status && order.return_status != "nothing_return") || (!order.is_return_order && !order.is_exchange_order)) {
            //                     self.order_no_return.push(order);
            //                 } else {
            //                     self.return_order.push(order);
            //                 }
            //             });

            //             var pageNumber = $(".sh_pagination").find('.active').text();
            //             var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(pageNumber) - 1);
            //             var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);

            //             if (!self.return_filter) {
            //                 self.order_no_return = self.order_no_return.slice(showFrom, showTo);
            //                 if ($(".sh_pagination") && $(".sh_pagination").length) {

            //                     $(".sh_pagination").pagination("updateItems", Math.ceil(self.env.pos.db.all_non_return_order.length / self.env.pos.config.sh_how_many_order_per_page));
            //                 }
            //                 if (this.props.filter_by_partner){
            //                     const partner_filters =  _.filter(self.env.pos.db.all_display_order, function (template) {
            //                         if (template["partner_id"] && template["partner_id"][1] && template["partner_id"][1].toLowerCase().indexOf(self.props.filter_by_partner) > -1) {
            //                             return true;
            //                         } else {
            //                             return false
            //                         }
            //                     });
                                
            //                     return partner_filters
            //                 }else{
            //                     return self.order_no_return;
            //                 }
            //             } else {
            //                 self.return_order = self.return_order.slice(showFrom, showTo);
            //                 if ($(".sh_pagination") && $(".sh_pagination").length) {
            //                     $(".sh_pagination").pagination("updateItems", Math.ceil(self.env.pos.db.all_return_order.length / self.env.pos.config.sh_how_many_order_per_page));
            //                 }
            //                 return self.return_order;
            //             }
            //         }
            //     }

            // }







// get posorderdetail() {
//     var self = this;

//     var AllIds = _.map(self.env.pos.db.all_display_order, function (display_order) {
//         return display_order.id;
//     });
//     console.log("AllIds:", AllIds);
//     var updated_orders = self.env.pos.db.all_order.filter(order => {
//         return AllIds.includes(order.id);
//     });
//     if (updated_orders && updated_orders.length) {
//         console.log("Updated Orders:", updated_orders);
//         for (var updated_order of updated_orders) {
//             let old_order = self.env.pos.db.all_display_order.find(n_order => n_order.id == updated_order.id);
//             if (old_order && ((old_order.state !== updated_order.state) || old_order.x_delivery_status !== updated_order.x_delivery_status)) {
//                 var order_index = self.env.pos.db.all_display_order.indexOf(old_order);
//                 self.env.pos.db.all_display_order.splice(order_index, 1, updated_order);
//                 console.log("Updated Order State:", updated_order);
//             }
//         }
//     }

//     var new_orders = self.env.pos.db.all_order.filter(order => !AllIds.includes(order.id));

//     if (new_orders && new_orders.length) {
//         console.log("New Orders:", new_orders);

//         for (var neworder of new_orders) {
//             let old_order = self.env.pos.db.all_display_order.filter((n_order) => n_order.pos_reference == neworder.old_pos_reference);

//             if (old_order && old_order.length) {
//                 var order_index = self.env.pos.db.all_display_order.indexOf(old_order[0]);
//                 self.env.pos.db.all_display_order.splice(order_index, 1);
//                 console.log("Removed Old Order at index:", order_index);

//                 var Upodated_order = self.env.pos.db.all_order.filter(order => order.id == old_order[0].id);

//                 if (Upodated_order && Upodated_order.length) {
//                     self.env.pos.db.all_display_order.unshift(Upodated_order[0]);
//                     console.log("Updated Order added at the beginning:", Upodated_order[0]);
//                 }
//             }
//             self.env.pos.db.all_display_order.unshift(neworder);
//             console.log("New Order added at the beginning:", neworder);

//             if (neworder.is_return_order) {
//                 self.env.pos.db.all_return_order.unshift(neworder);
//                 console.log("New Return Order added:", neworder);
//             } else {
//                 self.env.pos.db.all_non_return_order.unshift(neworder);
//                 console.log("New Non-Return Order added:", neworder);
//             }
//         }
//     }

//     if (this.state.query && (this.state.query !== "all" && this.state.query.trim() !== "")) {
//         var value = this.state.query;
//         console.log("Filter value applied:", value);

//         var templates = self.env.pos.db.all_display_order.filter((template) => {
//             return template.state == value || template.x_delivery_status == value;
//         });

//         if (this.state.query.trim() !== "") {
//             var search = this.state.query.trim();
//             console.log("Search Query:", search);

//             var templates = _.filter(templates, function (template) {
//                 var templateData = template;

//                 return (
//                     (templateData.name && templateData.name.toLowerCase().includes(search.toLowerCase())) || 
//                     (templateData["pos_reference"] && templateData["pos_reference"].toLowerCase().includes(search.toLowerCase())) || 
//                     (templateData["partner_id"] && templateData["partner_id"][1] && templateData["partner_id"][1].toLowerCase().includes(search.toLowerCase())) || 
//                     (templateData["date_order_x"] && templateData["date_order_x"].includes(search)) ||
//                     (templateData["state"] && templateData["state"].toLowerCase().includes(search.toLowerCase()))||
//                     (templateData["x_delivery_status"] && templateData["x_delivery_status"].toLowerCase().includes(search.toLowerCase()))
//                 );
//             });
            
//             console.log("Templates after Search Filter:", templates);
//         }

//         $(".sh_pagination").pagination("updateItems", Math.ceil(templates.length / self.env.pos.config.sh_how_many_order_per_page));
//         var current_page = $(".sh_pagination").find('.active').text();
//         console.log("Current Page:", current_page);

//         var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(current_page) - 1);
//         var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);
//         templates = templates.slice(showFrom, showTo);

//         console.log("Templates for the current page:", templates);
//         return templates;
//     } else {
//         console.log("No filter applied or 'all' selected, showing all orders.");

//         if (this.state.query && this.state.query.trim() !== "") {
//             var templates = this.get_order_by_name(this.state.query.trim());
//             $(".sh_pagination").pagination("updateItems", Math.ceil(templates.length / self.env.pos.config.sh_how_many_order_per_page));
//             var pageNumber = $(".sh_pagination").find('.active').text();
//             var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(pageNumber) - 1);
//             var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);
//             templates = templates.slice(showFrom, showTo);
//             console.log("Templates after search:", templates);
//             return templates;
//         } else {
//             self.order_no_return = [];
//             self.return_order = [];
//             _.each(self.env.pos.db.all_display_order, function (order) {
//                 if ((order.is_return_order && order.return_status && order.return_status != "nothing_return") || (!order.is_return_order && !order.is_exchange_order)) {
//                     self.order_no_return.push(order);
//                 } else {
//                     self.return_order.push(order);
//                 }
//             });
//             console.log("Orders without returns:", self.order_no_return);
//             console.log("Return orders:", self.return_order);

//             var pageNumber = $(".sh_pagination").find('.active').text();
//             var showFrom = parseInt(self.env.pos.config.sh_how_many_order_per_page) * (parseInt(pageNumber) - 1);
//             var showTo = showFrom + parseInt(self.env.pos.config.sh_how_many_order_per_page);

//             if (!self.return_filter) {
//                 self.order_no_return = self.order_no_return.slice(showFrom, showTo);
//                 if ($(".sh_pagination") && $(".sh_pagination").length) {
//                     $(".sh_pagination").pagination("updateItems", Math.ceil(self.env.pos.db.all_non_return_order.length / self.env.pos.config.sh_how_many_order_per_page));
//                 }
//                 console.log("Returning non-return orders:", self.order_no_return);
//                 return self.order_no_return;
//             } else {
//                 self.return_order = self.return_order.slice(showFrom, showTo);
//                 if ($(".sh_pagination") && $(".sh_pagination").length) {
//                     $(".sh_pagination").pagination("updateItems", Math.ceil(self.env.pos.db.all_return_order.length / self.env.pos.config.sh_how_many_order_per_page));
//                 }
//                 console.log("Returning filtered return orders:", self.return_order);
//                 return self.return_order;
//             }
//         }
//     }
// }



/**   version  2  after repairing the search */
get posorderdetail() {
    var self = this;

    var AllIds = _.map(self.env.pos.db.all_display_order, function (display_order) {
        return display_order.id;
    });
    console.log("AllIds:", AllIds);

    var updated_orders = self.env.pos.db.all_order.filter(order => AllIds.includes(order.id));
    if (updated_orders && updated_orders.length) {
        console.log("Updated Orders:", updated_orders);
        updated_orders.forEach(updated_order => {
            let old_order = self.env.pos.db.all_display_order.find(n_order => n_order.id === updated_order.id);
            if (old_order && (
                    old_order.state !== updated_order.state ||
                    old_order.x_delivery_status !== updated_order.x_delivery_status ||
                    old_order.company_order_id !== updated_order.company_order_id
                )) {
                let order_index = self.env.pos.db.all_display_order.indexOf(old_order);
                self.env.pos.db.all_display_order.splice(order_index, 1, updated_order);
                console.log("Updated Order State:", updated_order);
            }
        });
    }

    var new_orders = self.env.pos.db.all_order.filter(order => !AllIds.includes(order.id));
    if (new_orders && new_orders.length) {
        console.log("New Orders:", new_orders);
        new_orders.forEach(neworder => {
            let old_order = self.env.pos.db.all_display_order.filter(n_order => n_order.pos_reference === neworder.old_pos_reference);
            if (old_order && old_order.length) {
                let order_index = self.env.pos.db.all_display_order.indexOf(old_order[0]);
                self.env.pos.db.all_display_order.splice(order_index, 1);
                console.log("Removed Old Order at index:", order_index);

                let updated_order = self.env.pos.db.all_order.filter(order => order.id === old_order[0].id);
                if (updated_order && updated_order.length) {
                    self.env.pos.db.all_display_order.unshift(updated_order[0]);
                    console.log("Updated Order added at the beginning:", updated_order[0]);
                }
            }
            self.env.pos.db.all_display_order.unshift(neworder);
            console.log("New Order added at the beginning:", neworder);

            if (neworder.is_return_order) {
                self.env.pos.db.all_return_order.unshift(neworder);
                console.log("New Return Order added:", neworder);
            } else {
                self.env.pos.db.all_non_return_order.unshift(neworder);
                console.log("New Non-Return Order added:", neworder);
            }
        });
    }

    var templates = self.env.pos.db.all_display_order;

    if (this.state.query && this.state.query.trim() !== "" && this.state.query.trim().toLowerCase() !== "all") {
        console.log("Filter value applied:", this.state.query);
        var filterValue = this.state.query.trim().toLowerCase();
        if (filterValue === "toters") {
            templates = _.filter(templates, function (template) {
                return template.company_order_id;
            });
        } else if (filterValue === "notsend") {
            templates = _.filter(templates, function (template) {
                return (
                    template.x_delivery_status &&
                    template.x_delivery_status.toLowerCase() === "notsend" &&
                    !template.company_order_id
                );
            });}else {
            templates = _.filter(templates, function (template) {
                return (
                    (template.name && template.name.toLowerCase().includes(filterValue)) ||
                    (template.pos_reference && template.pos_reference.toLowerCase().includes(filterValue)) ||
                    (template.partner_id && template.partner_id[1] && template.partner_id[1].toLowerCase().includes(filterValue)) ||
                    (template.date_order_x && template.date_order_x.includes(filterValue)) ||
                    (template.company_order_id && template.company_order_id.toLowerCase().includes(filterValue)) ||
                    (template.state && template.state.toLowerCase().includes(filterValue)) ||
                    (template.x_delivery_person_name && template.x_delivery_person_name.toLowerCase().includes(filterValue)) ||
                    (template.x_delivery_status && template.x_delivery_status.toLowerCase().includes(filterValue))
                );
            });
        }
        console.log("Templates after Filter:", templates);
    } else {
        console.log("No filter applied or 'all' selected.");
        if (this.state.query && this.state.query.trim() !== "") {
            templates = this.get_order_by_name(this.state.query.trim());
        }
    }

    if (this.state.search && this.state.search.trim() !== "") {
        console.log("Search text applied:", this.state.search);
        var searchText = this.state.search.trim().toLowerCase();
        templates = _.filter(templates, function (template) {
            return (
                (template.name && template.name.toLowerCase().includes(searchText)) ||
                (template.pos_reference && template.pos_reference.toLowerCase().includes(searchText)) ||
                (template.partner_id && template.partner_id[1] && template.partner_id[1].toLowerCase().includes(searchText)) ||
                (template.date_order_x && template.date_order_x.includes(searchText)) ||
                (template.company_order_id && template.company_order_id.toLowerCase().includes(searchText)) ||
                (template.state && (template.state.toLowerCase().includes(searchText) || template.state.toLowerCase() === searchText)) ||
                (template.x_delivery_person_name && template.x_delivery_person_name.toLowerCase().includes(searchText)) ||
                (template.x_delivery_status && template.x_delivery_status.toLowerCase().includes(searchText))
            );
        });
        console.log("Templates after applying search filter:", templates);
    } else {
        console.log("No search text applied.");
    }

    var orders_per_page = parseInt(self.env.pos.config.sh_how_many_order_per_page, 10);
    if (!orders_per_page) {
        orders_per_page = 10;
    }

    if ($(".sh_pagination").length > 0) {
        $(".sh_pagination").pagination("updateItems", Math.ceil(templates.length / orders_per_page));
    }

    var current_page = $(".sh_pagination").find('.active').text();
    console.log("Current Page:", current_page);

    var showFrom = orders_per_page * (parseInt(current_page) - 1);
    var showTo = showFrom + orders_per_page;
    templates = templates.slice(showFrom, showTo);

    console.log("Templates for the current page:", templates);
    return templates;
}

  
            
            
  
            
            
            sh_refresh_order(){
                this.onMounted();
            }
            back() {
                this.trigger("close-temp-screen");
            }




mounted() {
    super.mounted();
    const fetchButton = this.el.querySelector('[data-fetch-delivery-persons="true"]');
    if (fetchButton) {
        fetchButton.addEventListener('click', this.fetchDeliveryPersonsButtonClick);
    }
}

willUnmount() {
    super.willUnmount();
    const fetchButton = this.el.querySelector('[data-fetch-delivery-persons="true"]');
    if (fetchButton) {
        fetchButton.removeEventListener('click', this.fetchDeliveryPersonsButtonClick);
    }
}



            // dileviry_pos_order() {
            //     this.showPopup("TicketScreenPopup_x")

            // }
            async _printOrderReceipt(orderId, orderReceipt) {
                if (!orderReceipt) {
                    console.error('Order receipt is undefined.');
                    return;
                }
                console.log("isssss", orderId);
                console.log("isssss", orderReceipt);
    
                try {
                    console.log(orderReceipt);
            
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
                    const printResult = await CustomPrinter.print_receipt(orderReceipt, posInstance, orderes, envInstance);
            
                    if (printResult) {
                        console.log('Receipt printed successfully.');
                    } else {
                        console.error('Failed to print receipt.');
                    }
                } catch (error) {
                    console.error('Error during receipt printing:', error);
                }
            }

            send_with_company = async (order, is_company = true) => {
                console.log('Order ID:', order); // Log the order ID or any other order-related info
                var order_id = $(event.currentTarget.closest("tr")).data('order-id');

                var current_order = this.env.pos.get_order()
                if (!current_order) {
                    console.error('No order found.');
                    return;
                }
                const { confirmed } = await this.showPopup('ConfirmPopup', {
                    title: this.env._t('تأكيد إرسال الطلب'),
                    body: this.env._t('هل أنت متأكد أنك تريد إرسال هذا الطلب عبر شركة خارجية؟'),
                    confirmText: this.env._t('نعم، إرسال'),
                    cancelText: this.env._t('إلغاء'),
                });
                if (!confirmed) {
                    console.log('تم إلغاء إرسال الطلب.');
                    return;
                }
                var currentSessionId = this.env.pos.config.current_session_id[0];
                try {
                const order_data = await rpc.query({
                    model: 'pos.order',
                    method: 'search_read',
                    args: [[['id', '=', order_id]], ['state']],
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
                    method: 'action_assign_company_delivery',
                    args: [order_id, currentSessionId],
                }).then(return_order_data => {
                    console.log('Delivery person assigned successfully.', return_order_data);

                    if (return_order_data[0].success) {
                        console.log('Order synchronized with the backend and front-end updated.');
                        this.update_order_list(return_order_data, current_order);
                        
                        const orderReceipt = current_order.export_for_printing(); 
                        this._printOrderReceipt(order_id, orderReceipt);
                         if (return_order_data[0].is_company) {
                            const paymentMethod = return_order_data[0].payment_method_id;
                            const paymentMethodObj = this.env.pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
                            
                            if (paymentMethodObj) {
                                current_order.add_paymentline(paymentMethodObj);
                                console.log(`Payment method ${paymentMethod} added to the order.`);
                            } else {
                                console.error(`Payment method ${paymentMethod} not found.`);
                            }
                        //     if (return_order_data[0].account_move_id) {
                        //         this.env.legacyActionManager.do_action(this.env.pos.invoiceReportAction, {
                        //            additional_context: {
                        //                active_ids: [return_order_data[0].account_move_id], 
                        //            },
                        //        });
                        //        console.log('Invoice generated successfully.');
                        //    } else {
                        //        console.error('Failed to generate invoice: No account_move_id returned.');
                        //    }
                           this.env.pos.add_new_order();
                           
                       }
                    } else if (return_order_data[0].error) {
                        console.error('Failed to assign delivery person:', return_order_data[0].error);
                        alert(return_order_data[0].error);
                    }
                     
            
        })
        } catch (error) {
            console.error('Error in assigning delivery person or printing receipt:', error);
            console.error("------------------------------------------");
            console.error("------------------------------------------");
            console.error("------------------------------------------");
            console.error("------------------------------------------");
            alert('An error occurred while assigning the delivery person. Please try again.');
        }
        this.sh_refresh_order();
    }

    after_send_with_company = async (order, is_company = true) => {
        console.log('Order ID:', order); // Log the order ID or any other order-related info
        var order_id = $(event.currentTarget.closest("tr")).data('order-id');

        var current_order = this.env.pos.get_order()
        if (!current_order) {
            console.error('No order found.');
            return;
        }
        const { confirmed } = await this.showPopup('ConfirmPopup', {
            title: this.env._t('تأكيد إرسال الطلب'),
            body: this.env._t('هل أنت متأكد أنك تريد إرسال هذا الطلب عبر شركة خارجية؟'),
            confirmText: this.env._t('نعم، إرسال'),
            cancelText: this.env._t('إلغاء'),
        });
        if (!confirmed) {
            console.log('تم إلغاء إرسال الطلب.');
            return;
        }
        var currentSessionId = this.env.pos.config.current_session_id[0];
        try {
        const order_data = await rpc.query({
            model: 'pos.order',
            method: 'search_read',
            args: [[['id', '=', order_id]], ['state']],
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
            method: 'action_after_assign_company_delivery',
            args: [order_id, currentSessionId],
        }).then(return_data => {
            console.log('Delivery person assigned successfully.', return_data);

            if (return_data[0].success) {
                console.log('Order synchronized with the backend and front-end updated.');
                this.update_order_list(return_data, current_order);
                
                const orderReceipt = current_order.export_for_printing(); 
                this._printOrderReceipt(order_id, orderReceipt);
                 if (return_data[0].is_company) {
                    const paymentMethod = return_data[0].payment_method_id;
                    const paymentMethodObj = this.env.pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
                    
                    if (paymentMethodObj) {
                        current_order.add_paymentline(paymentMethodObj);
                        console.log(`Payment method ${paymentMethod} added to the order.`);
                    } else {
                        console.error(`Payment method ${paymentMethod} not found.`);
                    }
                //     if (return_data[0].account_move_id) {
                //         this.env.legacyActionManager.do_action(this.env.pos.invoiceReportAction, {
                //            additional_context: {
                //                active_ids: [return_data[0].account_move_id], 
                //            },
                //        });
                //        console.log('Invoice generated successfully.');
                //    } else {
                //        console.error('Failed to generate invoice: No account_move_id returned.');
                //    }
                   this.env.pos.add_new_order();
                   
               }
            } else if (return_data[0].error) {
                console.error('Failed to assign delivery person:', return_data[0].error);
                alert(return_data[0].error);
            }
             
    
})
} catch (error) {
    console.error('Error in assigning delivery person or printing receipt:', error);
    console.error("------------------------------------------");
    console.error("------------------------------------------");
    console.error("------------------------------------------");
    console.error("------------------------------------------");
    alert('An error occurred while assigning the delivery person. Please try again.');
}
this.sh_refresh_order();
}

            dileviry_pos_order = async (order) => {
                console.log('Order ID:', order);
                // Ensure 'this.fetchDeliveryOrders' points to the correct instance
                const deliveryOrders = await this.fetchDeliveryOrders();
                // console.log("Delivery Orders:", deliveryOrders);
                // console.log("Type of Delivery Orders:", typeof deliveryOrders); 
                // console.log("Is Array:", Array.isArray(deliveryOrders)); 
                // const ordersArray = deliveryOrders.deliveryOrders || []; 
                const ordersArray = deliveryOrders.individualDeliveryPerson || []; 
                
                // console.log("Is Array:", Array.isArray(ordersArray)); 
                // console.log("Delivery Orders:", ordersArray);
                // if (deliveryOrders && deliveryOrders.length > 0) {
                if (ordersArray.length > 0) {
                    console.log("deliveryOrders.length > 0");
                    const orderReceipt = this.env.pos.get_order().export_for_printing(); 
                    // const bilal = { deliveryOrders, order, orderReceipt };
                    console.log("Delivery Orders Array:", orderReceipt);
                    this.showPopup('TicketScreenPopup_x', { bilal : { deliveryOrders: ordersArray, order, orderReceipt } });

                    // this.showPopup('TicketScreenPopup_x', { bilal: bilal });
                } else {
                    console.warn("No delivery orders found.");
                } 
            }
            

// async fetchDeliveryPersonsButtonClick(event) {
//     try {
//         const orderId = event.target.closest('td').getAttribute('data-order-id');
        
//         if (!orderId) {
//             console.error("Order ID not found.");
//             this.showPopup('ErrorPopup', {
//                 title: 'Order Error',
//                 body: 'Order ID could not be found. Please try again.',
//             });
//             return;
//         }
//         const { deliveryPersons } = await this.fetchDeliveryOrders();
//         console.log("Delivery Persons:", deliveryPersons); 
//         if (deliveryPersons.length > 0) {
//             const options = deliveryPersons.map(person => ({
//                 id: person.name_id,
//                 label: person.name_id || "Unnamed",
//                 item: person,
//             }));

//             const { confirmed, payload } = await this.showPopup('SelectionPopup', {
//                 title: 'Select a Delivery Person',
//                 list: options,
//                 cancelText: 'Cancel',
//             });

//             console.log("Payload received from selection:", payload);

//             if (confirmed && payload) {
//                 const deliveryPersonId = payload.name_id;  
//                 console.log("Selected Delivery Person ID:", deliveryPersonId); 

//                 if (!deliveryPersonId) {
//                     console.error("Delivery Person ID is undefined or not found.");
//                     this.showPopup('ErrorPopup', {
//                         title: 'Error',
//                         body: 'Could not retrieve the selected delivery person ID.',
//                     });
//                     return;
//                 }

//                 const currentSessionId = this.env.pos.pos_session.id;
//                 console.log("Order ID:", orderId);
//                 console.log("Current Session ID:", currentSessionId);

//                 const result = await this.rpc({
//                     model: 'pos.order',
//                     method: 'action_assign_delivery_person',
//                     args: [deliveryPersonId, orderId, currentSessionId],
//                 });


//                 if (result && result[0] && result[0].success) {
//                     this.showPopup('ConfirmPopup', {
//                         title: 'Delivery Person Assigned',
//                         body: `The delivery person ${result[0].delivery_person} has been assigned successfully!`,
//                     });

//                 } else {
//                     const errorMsg = result && result.error ? result.error : 'Unknown error occurred';
//                     this.showPopup('ErrorPopup', {
//                         title: 'Assignment Failed',
//                         body: errorMsg,
//                     });
//                 }
//             } else {
//                 console.log('Selection was cancelled.');
//             }
//         } else {
//             this.showPopup('ErrorPopup', {
//                 title: 'No Delivery Persons Available',
//                 body: 'No delivery persons are available for this order.',
//             });
//         }
//     } catch (error) {
//         console.error("Error fetching delivery persons:", error);
//         this.showPopup('ErrorPopup', {
//             title: 'Error',
//             body: 'An error occurred while fetching delivery persons.',
//         });
//     }
// }



// closePopup() {
//     const popup = document.querySelector('.delivery-person-popup');
//     if (popup) popup.remove();
// }

            fetchDeliveryOrders = async () => {
                try {
                    // const deliveryOrders = await rpc.query({
                    //     model: 'delivery.order',
                    //     method: 'get_delivery_orders',
                    //     args: [,],
                    // });
                    const individualDeliveryPerson = await rpc.query({
                        model: 'delivery.order',
                        method: 'get_individual_delivery_orders',
                        args: [,],
                    });
            
                    // const deliveryPersons = await rpc.query({
                    //     model: 'delivery.order',
                    //     method: 'get_delivery_persons',
                    //     args: [,],
                    // });

                    // console.log("Delivery Orders:", deliveryOrders);
                    // console.log("Delivery Persons:", deliveryPersons);
                    return { individualDeliveryPerson };
                    // return { deliveryOrders, deliveryPersons };
                    // return { deliveryOrders };
                } catch (error) {
                    console.error("Error fetching delivery orders:", error);
                    // return { deliveryOrders: [], deliveryPersons: [] };
                    return { individualDeliveryPerson: [] };
                    // return { deliveryOrders: [] };
                }
            }

            // return_pos_order(event) {
            //     var self = this;
            //     self.env.pos.get_order().is_return = true;
            //     self.env.pos.get_order().is_exchange = false;
            //     var order_line = [];

            //     var order_id = $(event.currentTarget.closest("tr")).attr("data-order-id");
            //     if (order_id) {
            //         order_data = self.env.pos.db.order_by_id[order_id];
            //         if (!order_data) {
            //             order_id = $(event.currentTarget.closest("tr")).attr("data-order");
            //             var order_data = self.env.pos.db.order_by_uid[order_id];
            //         }
                    
            //         if (order_data && order_data.lines) {
            //             _.each(order_data.lines, function (each_order_line) {
            //                 var line_data = self.env.pos.db.sh_get_orderline_by_id(each_order_line);
            //                 var product = self.env.pos.db.get_product_by_id(line_data.product_id)
            //                 if (!product){
            //                     product = self.env.pos.db.get_product_by_id(line_data.product_id[0])
            //                 }
            //                 if (line_data && !product.sh_product_non_returnable) {
            //                     order_line.push(line_data);
            //                 }
            //             });
            //         }
            //     }
            //     this.env.pos.get_order()['is_return'] = true
            //     if (order_line && order_line.length > 0 ){
                    
            //         this.showPopup("ReturnOrderPopup", { lines: order_line, order: order_id });
            //     }else{
            //         self.showPopup('ErrorPopup',{
            //             title: self.env._t('Product !'),
            //             body: self.env._t('Not return order line found !')
            //         })
            //     }
            // }

async return_pos_order(event) {
    var self = this;
    self.env.pos.get_order().is_return = true;
    self.env.pos.get_order().is_exchange = false;
    var order_line = [];

    var order_id = $(event.currentTarget.closest("tr")).attr("data-order-id");
        
    try {  
        const order_status = await rpc.query({
            model: 'pos.order',
            method: 'search_read',
            args: [[['id', '=', order_id]], ['state', 'return_status']],
            context: this.env.session.user_context,
        });
        if (order_status.length > 0) {
            console.log("Order Status:", order_status[0].state);
            if (order_status[0].return_status !== 'nothing_return') {
                this.showPopup('ErrorPopup', {
                    title: this.env._t('Return order'),
                    body: this.env._t('The order has been returned'),
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
    } catch (error) {
        console.error("Error in get order state in return_pos_ofder function:", error);
        console.error("------------------------------------------");
    }



    if (order_id) {
        order_data = self.env.pos.db.order_by_id[order_id];
        if (!order_data) {
            order_id = $(event.currentTarget.closest("tr")).attr("data-order");
            var order_data = self.env.pos.db.order_by_uid[order_id];
        }
        
        if (order_data && order_data.lines) {
            _.each(order_data.lines, function (each_order_line) {
                var line_data = self.env.pos.db.sh_get_orderline_by_id(each_order_line);
                var product = self.env.pos.db.get_product_by_id(line_data.product_id)
                if (!product){
                    product = self.env.pos.db.get_product_by_id(line_data.product_id[0])
                }
                if (line_data && !product.sh_product_non_returnable) {
                    order_line.push(line_data);
                }
            });
        }
    }
    this.env.pos.get_order()['is_return'] = true
    if (order_line && order_line.length > 0 ){
        
        this.showPopup("ReturnOrderPopup", { lines: order_line, order: order_id });
    }else{
        self.showPopup('ErrorPopup',{
            title: self.env._t('Product !'),
            body: self.env._t('Not return order line found !')
        })
    }
}

            return_order_filter() {
                var self = this;

                var previous_order = self.env.pos.db.all_order;
                if (!$(".return_order_button").hasClass("highlight")) {
                    self.order_no_return = [];
                    $(".return_order_button").addClass("highlight");

                    self.return_filter = true;
                    $(".sh_pagination").pagination("updateItems", Math.ceil(self.env.pos.db.all_return_order.length / self.env.pos.config.sh_how_many_order_per_page));
                    $(".sh_pagination").pagination("selectPage", 1);
                } else {
                    self.return_order = [];
                    $(".return_order_button").removeClass("highlight");
                    self.return_filter = false;

                    $(".sh_pagination").pagination("updateItems", Math.ceil(self.env.pos.db.all_non_return_order.length / self.env.pos.config.sh_how_many_order_per_page));
                    $(".sh_pagination").pagination("selectPage", 1);
                }
                self.render();
            }

        };
    Registries.Component.extend(TicketScreen_x, ShPosTicketScreen_x);



    
    class OrderSender {

        static async _printOrderReceipt(env, pos, orderId, orderReceipt) {
            if (!orderReceipt) {
                console.error('Order receipt is undefined.');
                return;
            }
            console.log("isssss", orderId);
            console.log("isssss", orderReceipt);
    
            try {
                console.log(orderReceipt);
        
                // Try using this.env.pos to get the POS instance
                const posInstance = pos;
                const envInstance = env;
        
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
                const printResult = await CustomPrinter.print_receipt(orderReceipt, posInstance, orderes, envInstance);
        
                if (printResult) {
                    console.log('Receipt printed successfully.');
                } else {
                    console.error('Failed to print receipt.');
                }
            } catch (error) {
                console.error('Error during receipt printing:', error);
            }
        }


        static async send_with_company(env, pos, id_order, company_order_id, currentOrder, totar, is_company = true) {
            console.log('Order ID:', id_order);
            console.log('Order currentOrder:', currentOrder);
            
            if (!id_order) {
                console.error('No order ID provided.');
                return;
            }

            var currentSessionId = env.pos.config.current_session_id[0];
            try {
                // const order_data = await rpc.query({
                //     model: 'pos.order',
                //     method: 'search_read',
                //     args: [[['id', '=', id_order]], ['state']],
                //     context: env.session.user_context,
                // });

                // if (order_data.length > 0) {
                //     if (order_data[0].state === 'invoiced') {
                //         console.warn('The order has already been invoiced.');
                //         return;
                //     }
                //     if (order_data[0].state === 'cancel') {
                //         console.warn('The order has been cancelled.');
                //         return;
                //     }
                // }

                await rpc.query({
                    model: 'pos.order',
                    method: 'action_assign_company_delivery',
                    args: [id_order, currentSessionId, company_order_id, totar],
                }).then(return_data => {
                    console.log('Delivery person assigned successfully.', return_data);

                    if (return_data[0].success) {
                        console.log('Order synchronized with the backend and front-end updated.');
                        // this.update_order_list(return_data, current_order);
                        
                        // const orderReceipt = currentOrder.export_for_printing(); 
                        
                        // ✅ استخدام OrderSender مباشرة لاستدعاء الدالة `static`
                        // OrderSender._printOrderReceipt(env, pos, id_order, orderReceipt);

                        if (return_data[0].is_company) {
                            // const paymentMethod = return_data[0].payment_method_id;
                            // const paymentMethodObj = pos.payment_methods.find(pm => pm.id === paymentMethod[0]);
                            
                            // if (paymentMethodObj) {
                            //     currentOrder.add_paymentline(paymentMethodObj);
                            //     console.log(`Payment method ${paymentMethod} added to the order.`);
                            // } else {
                            //     console.error(`Payment method ${paymentMethod} not found.`);
                            // }
                            // pos.add_new_order();
                        }
                    } else if (return_data[0].error) {
                        console.error('Failed to assign delivery person:', return_data[0].error);
                        alert(return_data[0].error);
                    }
                });
            } catch (error) {
                console.error('Error sending order:', error);
            }
        }
        
}
return {OrderSender, TicketScreen_x}
});

