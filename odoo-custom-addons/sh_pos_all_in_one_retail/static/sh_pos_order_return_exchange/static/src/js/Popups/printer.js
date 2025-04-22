odoo.define("sh_pos_order_return_exchange.custom_printer", function (require) {
    "use strict";

    const Printer = require('point_of_sale.Printer').Printer;
    const QWeb = require('web.core').qweb;
    const rpc = require('web.rpc');

    const CustomPrinter = {
        async print_receipt(order, posInstance, orderes, envInstance) { // Ensure you pass posInstance here
            try {

                console.log('POS instance',orderes);
                console.log('POS instanceinstanceinstanceinstance',posInstance);
                console.log('header : ',posInstance.config.receipt_header);

                if (!envInstance || !envInstance.proxy || !envInstance.proxy.printer) {
                    console.error('POS instance or printers not available.');
                    return false;
                }

                const printer = envInstance.proxy.printer;
                const companyLogo = posInstance.company_logo_base64 || null;
                const customLogo = posInstance.custom_logo_base64 || null;
                const logoToUse = customLogo || companyLogo;
                const header = posInstance.config.receipt_header;
                const footer = posInstance.config.receipt_footer;
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
                const company_order_id = orderes.company_order_id
                console.log('company_order_id company_order_id company_order_id ',company_order_id);
                const receipt = QWeb.render('OrderReceipt', {

                    order: {
                        ...orderes,
                        company: {
                            ...orderes.company,
                            logo: logoToUse || null,
                            name: posInstance.company.name || "Company Name Missing",
                        },
                        company_order_id:company_order_id,
                        header:header,
                        footer:footer,
                        formatted_date:formattedDate
                    },
                });
                    
                    
                    // Printing receipt
                    console.log("Receipt Object: ", receipt);
                    const result = await printer.print_receipt(receipt)
                    if (!result.successful) {
                        console.error('Failed to print receipt on printer:', printer);
                        return false;
                    }
                

                console.log('Receipt printed successfully.');
                return true;
            } catch (error) {
                console.error('Error in custom print logic:', error);
                return false;
            }
        }  
    };

    return CustomPrinter;
});