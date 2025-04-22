odoo.define("sh_pos_order_list.db", function (require) {
    "use strict";

    var DB = require("point_of_sale.DB");
    DB.include({
        init: function (options) {
            this._super(options);
            this.all_order = [];
            this.all_order_temp = [];
            this.all_display_order = [];
            this.temp_order_by_id = {};
            this.order_by_id = {};
            this.order_line_by_id = {};
            this.all_session = [];
            this.order_by_uid = {};
            this.order_line_by_uid = {};
            this.new_order;
        },
        all_sessions: function (all_session) {
            this.all_session = all_session;
        },
        all_orders: function (all_order) {
            for (var i = 0, len = all_order.length; i < len; i++) {
                var each_order = all_order[i];
                if (!this.temp_order_by_id[each_order.id]) {
                    this.all_order.push(each_order);
                    this.all_order_temp.push(each_order);
                    this.order_by_id[each_order.id] = each_order;
                    this.order_by_uid[each_order.sh_uid] = each_order;
                }
            }
        },
        all_orders_line: function (all_order_line) {
            for (var i = 0, len = all_order_line.length; i < len; i++) {
                var each_order_line = all_order_line[i];
                this.order_line_by_id[each_order_line.id] = each_order_line;
                this.order_line_by_uid[each_order_line.sh_line_id] = each_order_line;
            }
        },
        add_order: function(order){
            var order_id = order.uid;
            var orders  = this.load('orders',[]);

            // if the order was already stored, we overwrite its data
            for(var i = 0, len = orders.length; i < len; i++){
                if(orders[i].id === order_id){
                    orders[i].data = order;
                    this.save('orders',orders);
                    return order_id;
                }
            }

            // Only necessary when we store a new, validated order. Orders
            // that where already stored should already have been removed.
            this.remove_unpaid_order(order);

            orders.push({id: order_id, data: order});
            this.save('orders',orders);
            return order_id;
        },
        remove_order: function(order_id){
            var orders = this.load('orders',[]);
            orders = _.filter(orders, function(order){
                return order.id !== order_id;
            });
            this.save('orders',orders);
        },
        cancel_remove_order: function(order_id){
            var orders = this.load('orders',[]);
            orders = _.filter(orders, function(order){
                return order.id !== order_id;
            });
            this.save('orders',orders);
        },
    });
});
