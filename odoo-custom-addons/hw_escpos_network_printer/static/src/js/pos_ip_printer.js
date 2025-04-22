odoo.define('hw_escpos_network_printer.pos_ip_printer', function (require) {
  'use strict'

  var { PosGlobalState } = require('point_of_sale.models')
  var IPPrinter = require('hw_escpos_network_printer.IPPrinter')
  const Registries = require('point_of_sale.Registries')

  const IPPosGlobalState = (PosGlobalState) => class IPPosGlobalState extends PosGlobalState {
    after_load_server_data () {
      var self = this
      return super.after_load_server_data(...arguments).then(function () {
        if (!self.config.other_devices && self.config.iface_network_printer_ip_address && !self.config.epson_printer_ip) {
          self.env.proxy.printer = new IPPrinter(self.config.iface_network_printer_ip_address, self)
        }
      })
    }
  }
  Registries.Model.extend(PosGlobalState, IPPosGlobalState)
})
