odoo.define('hw_restaurant_ip_printer.multiprint', function (require) {
  'use strict'

  const { PosGlobalState } = require('point_of_sale.models')
  var IPPrinter = require('hw_escpos_network_printer.IPPrinter')
  const Registries = require('point_of_sale.Registries')
  console.log(IPPrinter)

  const PosIPRestaurantPosGlobalState = (PosGlobalState) => class PosIPRestaurantPosGlobalState extends PosGlobalState {
    create_printer (config) {
      /* console.log(config) */
      if (config.printer_type === 'escpos_ip_printer') {
        return new IPPrinter(config.restaurant_escpos_printer_ip, this)
      } else {
        return super.create_printer.apply(this, arguments)
      }
    }
  }
  Registries.Model.extend(PosGlobalState, PosIPRestaurantPosGlobalState)
})
