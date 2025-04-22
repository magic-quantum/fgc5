odoo.define('custom_receipts_for_pos.receipt',function(require){
    "use strict"
    var models=require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');
    var PosDB = require("point_of_sale.DB");
    const OrderReceipt = require('point_of_sale.OrderReceipt');
    const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');
    var SuperOrder = models.Order;
    const{onMounted}=owl;

    PosDB.include({
        init:function(options)
        {
            var self=this;
            this._super(options);
            this.receipt_design=null;
        },
    })

    const PosResOrderReceipt = OrderReceipt =>
        class extends OrderReceipt {
            setup(){
                super.setup();
                onMounted(()=>{
                    var self=this;
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
                    const formattedDate = `${hours}:${formattedMinute} ${ampm} ${day}-${month}-${year}`;
                    let subtotalBeforeDiscount = 0;

                    if(self.env.pos.config.is_custom_receipt){
                        var receipt_design=self.env.pos.config.design_receipt
                        var order=self._receiptEnv.order;
                        
                        order.get_orderlines().forEach(line => {
                            subtotalBeforeDiscount += line.quantity * line.price; // Using the original price
                        });
                        
                        console.log("sub total : ",String( subtotalBeforeDiscount));
                        const order_name = order.name; 
                        order.name =  order.old_pos_reference?order.old_pos_reference:order_name;
                        
                        var data={
                            widget:self.env,
                            pos:order.pos,
                            order:order,
                            receipt:order.export_for_printing(),
                            orderlines:order.get_orderlines(),
                            paymentlines:order.get_paymentlines(),
                            moment:moment,
                            formattedDate:formattedDate,
                            subTotal:subtotalBeforeDiscount,
                            };
                            console.log(data, "Data passed to QWeb");
                        var parser=new DOMParser();
                        var xmlDoc=parser.parseFromString(receipt_design,"text/xml");
                        var s=new XMLSerializer();
                        var newXmlStr=s.serializeToString(xmlDoc);
                        var qweb=new QWeb2.Engine();
                        console.log('receipt', self._receiptEnv)
                        qweb.add_template('<templates><t t-name="receipt_design">'+newXmlStr+'</t></templates>');
                        var receipt=qweb.render('receipt_design',data);$('div.pos-receipt').replaceWith(receipt);
                        console.log(receipt, 'ooooo')
                        order.name = order_name;
                        console.log("formmated date",receipt.formattedDate)
                        }
                    })
                }
            }
    Registries.Component.extend(OrderReceipt, PosResOrderReceipt)
});
