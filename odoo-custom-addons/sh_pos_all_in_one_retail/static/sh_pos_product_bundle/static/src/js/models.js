
odoo.define("sh_pos_all_in_one_retail.sh_pos_product_bundle.screens", function (require) {
    "use strict";

    var utils = require("web.utils");
    var round_di = utils.round_decimals;
    const { PosGlobalState, Orderline , Order} = require('point_of_sale.models');
    const Registries = require("point_of_sale.Registries");

    const shPosAutoLockPoModel = (PosGlobalState) => class shPosAutoLockPoModel extends PosGlobalState {
        async _processData(loadedData) {
            await super._processData(...arguments)
            this.db.add_bundles(loadedData['sh.product.bundle']);
        }
    }

    Registries.Model.extend(PosGlobalState, shPosAutoLockPoModel);


    const shPosorder = (Order) => class shPosorder extends Order {
        set_orderline_options(orderline, options) {
            if(options && options.is_bundled){
                orderline.is_bundled = options.is_bundled ;
            }
            if(options && options.sh_main_product_id){
                orderline.sh_main_product_id = options.sh_main_product_id ;
            }
            super.set_orderline_options(...arguments)
        }
    }

    Registries.Model.extend(Order, shPosorder);

    const shPosProductBundle = (Orderline) => class shPosProductBundle extends Orderline {
        constructor (obj, options) {
            super(...arguments);
            this.is_bundled = false
            this.sh_main_product_id = false;
        }
        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            if(json && json.is_bundled){
                this.is_bundled =  json.is_bundled
            }
            if(json && json.sh_main_product_id){
                this.sh_main_product_id =  json.sh_main_product_id
            }
        }
        merge(orderline){
            this.order.assert_editable();
            if(this.is_bundled){
                this.set_quantity(this.get_quantity() + orderline.quantity);
            }else{
                super.merge(...arguments)
            }
        }
        can_be_merged_with(orderline) {
            if (this.pos.config.enable_product_bundle) {
                if (this.get_product().id !== orderline.get_product().id){
                    return false;
                } else {
                    if(this.is_bundled != orderline.is_bundled){
                        return false
                    } else{
                        return true;
                    }
                }
            } else {
                return super.can_be_merged_with(orderline)

            }
        }
    }

    Registries.Model.extend(Orderline, shPosProductBundle);

});
