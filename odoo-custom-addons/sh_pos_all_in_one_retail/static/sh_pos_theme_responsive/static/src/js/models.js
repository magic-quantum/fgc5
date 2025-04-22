odoo.define("sh_pos_theme_responsive.models", function (require) {

    var { PosGlobalState,Orderline } = require('point_of_sale.models');
    const models = require('point_of_sale.models');
    const Order = models.Order;
    const { uuidv4 } = require('point_of_sale.utils');
    const core = require('web.core');
    const Printer = require('point_of_sale.Printer').Printer;
    const { batched } = require('point_of_sale.utils')
    const QWeb = core.qweb;
    const Registries = require('point_of_sale.Registries');


    const ShPosThemeSettingdPosGlobalState = (PosGlobalState) => class ShPosThemeSettingdPosGlobalState extends PosGlobalState {
        async _processData(loadedData) {
            await super._processData(...arguments);
            this.pos_theme_settings_data = loadedData['sh.pos.theme.settings'] || [];
            this.pos_theme_settings_data_by_theme_id = loadedData['pos_theme_settings_data_by_theme_id'] || [];
        }
        async after_load_server_data() {
            await super.after_load_server_data(...arguments);
            if (this.config.module_sh_pos_theme_settings) {
                this.hasLoggedIn = !this.config.module_sh_pos_theme_settings;
            }
            
        }


        // get_cashier_user_id() {
        //     return this.user.id || false;
        // }
    }

    Registries.Model.extend(PosGlobalState, ShPosThemeSettingdPosGlobalState);

    const ShOrderline = (Orderline) => class ShOrderline extends Orderline {
        set_quantity(quantity, keep_price) {
            let res = super.set_quantity(...arguments);
            let self = this;
            if (this.pos && this.pos.pos_theme_settings_data && this.pos.pos_theme_settings_data[0].display_product_cart_qty) {
                let orderlines = Object.values(this.order.get_orderlines())
                let other_line_with_same_product = orderlines.filter((x) => (x.product.id == self.product.id && x != self))

                if (other_line_with_same_product.length > 0) {
                    let total_qty = 0
                    other_line_with_same_product.map((x) => total_qty += x.quantity)
                    total_qty += self.quantity
                    if (this.order.product_with_qty) {
                        this.order.product_with_qty[this.product.id] = total_qty != 0 ? total_qty : false ;
                    } else {
                        this.order.product_with_qty = {}
                        this.order.product_with_qty[this.product.id] = total_qty != 0 ? total_qty : false ;
                    }
                    this.order['product_with_qty']
                } else {
                    if (this.order.product_with_qty) {
                        this.order.product_with_qty[this.product.id] = this.quantity != 0 ? this.quantity : false ;
                    } else {
                        this.order.product_with_qty = {};
                        this.order.product_with_qty[this.product.id] = this.quantity != 0 ? this.quantity : false ;
                    }
                }
            }
            return res
        };
    };
    Registries.Model.extend(Orderline, ShOrderline);


    const CustomOrder = Order => class extends Order {
        // async printChanges() {
        //     // const isDeliveryEnabled = this.pos.config.sh_enable_order_delivery_list;
        //     // console.log("is Delivery enabel :",isDeliveryEnabled);
        //     let isPrintSuccessful = true;
        //     const d = new Date();
        //     let hours = d.getHours();
        //     hours = hours % 12 || 12;
        //     let minutes = '' + d.getMinutes();
        //     minutes = minutes.length < 2 ? ('0' + minutes) : minutes;
        //     const ampm = hours>=12?'Pm':'Am';
        //     const formattedMinute = minutes.toString().padStart(2,'0');
        //     const day = d.getDate();
        //     const month = d.getMonth()+1;
        //     const year = d.getFullYear();
        //     const delim= '-';
        //     const note = this.note;
        //     const formattedDate = `${hours}:${formattedMinute} ${ampm} ${day}-${month}-${year}`;
        //     const name_pos =  this.pos.config.name;
        //     console.log("cusrrent object before printing",this);
        //     const orderLinesWithNotes = this.orderlines.map(orderline => ({
        //         product_name: orderline.product.display_name || "Unknown",
        //         quantity: orderline.quantity || 0,
        //         price: orderline.price || 0,
        //         note: orderline.line_note,  // Extract the line note
        //     }));
            
        //     console.log("Order lines with notes:", orderLinesWithNotes);
            
        //     console.log("name pos: ", this.pos.config.name)

        //     console.log("const d = new Date();", d);
            
        //     if (!this.pos.unwatched.printers || this.pos.unwatched.printers.length === 0) {
        //         console.log("No printers found.");
        //         return false;
        //     }
        
        //     if (!this.printingChanges) {
        //         this.printingChanges = { new: [], cancelled: [] };
        //     }
        
        //     const uniqueNewChanges = new Set(this.printingChanges.new.map(change => change.product_id));
        //     const uniqueCancelledChanges = new Set(this.printingChanges.cancelled.map(change => change.product_id));
        //     for (const printer of this.pos.unwatched.printers) {
        //         const changes = this._getPrintingCategoriesChanges(printer.config.product_categories_ids);
        //         // Add only unique items to the new and cancelled arrays
        //         changes['new'].forEach(change => {
        //             if (!uniqueNewChanges.has(change.product_id)) {
        //                 uniqueNewChanges.add(change.product_id);
        //                 this.printingChanges.new.push(change);
        //             }
        //         });
        
        //         changes['cancelled'].forEach(change => {
        //             if (!uniqueCancelledChanges.has(change.product_id)) {
        //                 uniqueCancelledChanges.add(change.product_id);
        //                 this.printingChanges.cancelled.push(change);
        //             }
        //         });


                           
                


        //         if (changes['new'].length > 0 || changes['cancelled'].length > 0) {
        //             console.log("Updated printing changes:", this.printingChanges);
        
        //             const printingChanges = {
        //                 new: this.printingChanges.new,
        //                 cancelled: this.printingChanges.cancelled,
        //                 table_name: this.pos.config.iface_floorplan ? this.getTable().name : false,
        //                 floor_name: this.pos.config.iface_floorplan ? this.getTable().floor.name : false,
        //                 name: this.name || 'unknown order',
        //                 time: {
        //                     hours,
        //                     minutes,
        //                     formattedDate,
        //                 },
        //                 name_pos : name_pos,
        //                 order_lines:orderLinesWithNotes
        //             };
                    
        
        //             const receipt = QWeb.render('OrderChangeReceipt', { changes: printingChanges });
        //             console.log("object changes : ",changes);
        //             // console.log("delivery _value : ",printingChanges.isDeliveryEnabled);
        //             console.log("printingChanges:",printingChanges.name_pos);
        
        //             console.log("Generated Receipt for Order Changes:");
        
        //             console.log("receipt receipt receipt ", receipt)
        //             const result = await printer.print_receipt(receipt);
        //             if (!result.successful) {
        //                 isPrintSuccessful = false;
        //             }
        //         }
        //     }
        
        //     // Clear printing changes after printing
        //     this.printingChanges = { new: [], cancelled: [] };
        
        //     return isPrintSuccessful;
        // }

        async printChanges() {
            // const isDeliveryEnabled = this.pos.config.sh_enable_order_delivery_list;
            // console.log("is Delivery enabel :",isDeliveryEnabled);
            let isPrintSuccessful = true;
            const d = new Date();
            let hours = d.getHours();
            hours = hours % 12 || 12;
            let minutes = '' + d.getMinutes();
            minutes = minutes.length < 2 ? ('0' + minutes) : minutes;
            const ampm = hours>=12?'Pm':'Am';
            const formattedMinute = minutes.toString().padStart(2,'0');
            const day = d.getDate();
            const month = d.getMonth()+1;
            const year = d.getFullYear();
            const delim= '-';
            const note = this.note;
            const formattedDate = `${hours}:${formattedMinute} ${ampm} ${day}-${month}-${year}`;
            const name_pos =  this.pos.config.name;
            console.log("cusrrent object before printing",this);
            const orderLinesWithNotes = this.orderlines.map(orderline => ({
                product_name: orderline.product.display_name || "Unknown",
                quantity: orderline.quantity || 0,
                price: orderline.price || 0,
                note: orderline.line_note,  // Extract the line note
            }));
            
            console.log("Order lines with notes:", orderLinesWithNotes);
            
            console.log("name pos: ", this.pos.config.name)

            console.log("const d = new Date();", d);
            
            if (!this.pos.unwatched.printers || this.pos.unwatched.printers.length === 0) {
                console.log("No printers found.");
                return false;
            }
        
            if (!this.printingChanges) {
                this.printingChanges = { new: [], cancelled: [] };
            }
        
            const uniqueNewChanges = new Set(this.printingChanges.new.map(change => change.product_id));
            const uniqueCancelledChanges = new Set(this.printingChanges.cancelled.map(change => change.product_id));
            for (const printer of this.pos.unwatched.printers) {
                const changes = this._getPrintingCategoriesChanges(printer.config.product_categories_ids);
                // Enrich 'new' changes with notes
                changes['new'].forEach(change => {
                    const line = this.orderlines.find(l => l.product.id === change.product_id);
                    change.note = line ? (line.line_note || '') : '';
                });

                // Enrich 'cancelled' changes with notes
                changes['cancelled'].forEach(change => {
                    const line = this.orderlines.find(l => l.product.id === change.product_id);
                    change.note = line ? (line.line_note || '') : '';
                });         

                // Add only unique items to the new and cancelled arrays
                changes['new'].forEach(change => {
                    if (!uniqueNewChanges.has(change.product_id)) {
                        uniqueNewChanges.add(change.product_id);
                        this.printingChanges.new.push(change);
                    }
                });
        
                changes['cancelled'].forEach(change => {
                    if (!uniqueCancelledChanges.has(change.product_id)) {
                        uniqueCancelledChanges.add(change.product_id);
                        this.printingChanges.cancelled.push(change);
                    }
                });


                           
                


                if (changes['new'].length > 0 || changes['cancelled'].length > 0) {
                    console.log("Updated printing changes:", this.printingChanges);
        
                    const printingChanges = {
                        new: this.printingChanges.new,
                        cancelled: this.printingChanges.cancelled,
                        table_name: this.pos.config.iface_floorplan ? this.getTable().name : false,
                        floor_name: this.pos.config.iface_floorplan ? this.getTable().floor.name : false,
                        name: this.name || 'unknown order',
                        time: {
                            hours,
                            minutes,
                            formattedDate,
                        },
                        name_pos : name_pos,
                        order_lines:orderLinesWithNotes
                    };
                    
        
                    const receipt = QWeb.render('OrderChangeReceipt', { changes: printingChanges });
                    console.log("object changes : ",changes);
                    // console.log("delivery _value : ",printingChanges.isDeliveryEnabled);
                    console.log("printingChanges:",printingChanges);
        
                    console.log("Generated Receipt for Order Changes:");
        
                    console.log("receipt receipt receipt ", receipt)
                    const result = await printer.print_receipt(receipt);
                    if (!result.successful) {
                        isPrintSuccessful = false;
                    }
                }
            }
        
            // Clear printing changes after printing
            this.printingChanges = { new: [], cancelled: [] };
        
            return isPrintSuccessful;
        }
    };
        Registries.Model.extend(Order, CustomOrder);});
