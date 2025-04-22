/** @odoo-module **/
import { Order, PosGlobalState } from 'point_of_sale.models';
import Registries from 'point_of_sale.Registries';


const ViinPosCustomBillLogoOrder = (Order) =>
    class ViinPosCustomBillLogoOrder extends Order {

        /**
        * @override
        **/
        export_for_printing() {
            var receipt = super.export_for_printing(...arguments);
            receipt.pos = {};
            receipt.pos.custom_logo_type = this.pos.config.custom_logo_type;
            receipt.pos.custom_text = this.pos.config.custom_text;
            receipt.company.logo = this.pos.custom_logo_base64;
            return receipt;
        };
    };

Registries.Model.extend(Order, ViinPosCustomBillLogoOrder);

const ViinPosCustomBillLogoPosGlobalState = (PosGlobalState) =>
    class ViinPosCustomBillLogoPosGlobalState extends PosGlobalState {

        constructor(obj) {
            super(obj);
            this.custom_logo = null;
            this.custom_logo_base64 = '';
        };

        /**
        * @override
        **/
        async _processData(loadedData) {
            await super._processData(...arguments);
            await this._loadLogoPictures();
        };

        async _loadLogoPictures() {
            this.custom_logo = new Image();
            return new Promise((resolve, reject) => {
                this.custom_logo.onload = () => {
                    let img = this.custom_logo;
                    let ratio = 1;
                    let targetwidth = 300;
                    let maxheight = 150;
                    if (img.width !== targetwidth) {
                        ratio = targetwidth / img.width;
                    }
                    if (img.height * ratio > maxheight) {
                        ratio = maxheight / img.height;
                    }
                    let width  = Math.floor(img.width * ratio);
                    let height = Math.floor(img.height * ratio);
                    let  c = document.createElement('canvas');
                    c.width  = width;
                    c.height = height;
                    let ctx = c.getContext('2d');
                    ctx.drawImage(this.custom_logo,0,0, width, height);
    
                    this.custom_logo_base64 = c.toDataURL();
                    resolve();
                };
                this.custom_logo.onerror = () => {
                    reject();
                };
                this.custom_logo.crossOrigin = "anonymous";
                this.custom_logo.src = `/web/image?model=pos.config&id=${this.config.id}&field=custom_logo`;
            });
        };
    };

Registries.Model.extend(PosGlobalState, ViinPosCustomBillLogoPosGlobalState);
