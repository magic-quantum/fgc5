odoo.define("sh_pos_fronted_cancel.OrderListScreen", function (require) {
    "use strict";

    const Registries = require("point_of_sale.Registries");
    const OrderListScreen = require('sh_pos_order_list.OrderListScreen')
    const PosOrderListScreen = (OrderListScreen) =>
        class extends OrderListScreen {
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
            click_cancel(event) {
                event.stopPropagation();
                var self = this;
                var order_id = $(event.currentTarget.closest("tr")).data('order-id');
            
                // Show a confirmation pop-up
                var confirmation = confirm("Are you sure you want to cancel this order?");
                
                // If the user confirms, proceed with the cancellation
                if (confirmation) {
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
            click_paid(event) {
                event.stopPropagation();
                var self = this;
                var order_id = $(event.currentTarget.closest("tr")).data('order-id');

                return new Promise((resolve, reject) => {
                    self.env.services.rpc({
                        model: "pos.order",
                        method: "sh_fronted_mark_paid",
                        args: [[order_id]],
                    }).then(return_order_data => {
                        if (return_order_data) {
                            self.update_order_list(return_order_data);
                        }
                    }).catch(error => {
                        console.error("Error in click_draft:", error);
                        reject(error);
                    });
                });
            }
            update_order_list(return_order_data) {
                const self = this;

                const updateOrders = (orders, return_data) => {
                    return_data.forEach(update_order => {
                        orders.forEach((val, i) => {
                            if ((val.id && update_order.order_id && val.id === update_order.order_id) || 
                                (val.sh_uid && update_order.sh_uid && val.sh_uid === update_order.sh_uid)) {
                                
                                if (update_order.cancel_draft) {
                                    val.state = "draft"; // Update state to draft
                                    // val.x_delivery_status = "notsend"; // Update state to paid
                                    // val.x_delivery_person_id = " "; // Update state to paid
                                }
                                if (update_order.cancel_order) {
                                    val.state = "cancel"; // Update state to draft
                                    // val.x_delivery_status = "notsend"; // Update state to paid
                                    // val.x_delivery_person_id = " "; // Update state to paid
                                }
                                if (update_order.cancel_delete) {
                                    orders.splice(i, 1); // Remove order
                                }
                                if (update_order.paid) {
                                    val.state = "paid"; // Update state to paid
                                    // val.x_delivery_status = "delivered"; // Update state to paid
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
    Registries.Component.extend(OrderListScreen, PosOrderListScreen);
});
