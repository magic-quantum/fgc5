# -*- coding: utf-8 -*-
# Copyright (C) Softhealer Technologies.

from odoo import  fields, models


class ShResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    sh_pos_night_mode = fields.Boolean(related='pos_config_id.sh_pos_night_mode', readonly=False)
    pos_enable_info_control_button = fields.Boolean(related="pos_config_id.enable_info_control_button", readonly=False)
    pos_enable_orderhistory_control_button = fields.Boolean(related="pos_config_id.enable_orderhistory_control_button", readonly=False)
    pos_enable_refund_control_button = fields.Boolean(related="pos_config_id.enable_refund_control_button", readonly=False)
    pos_enable_UOM_control_button = fields.Boolean(related="pos_config_id.enable_UOM_control_button", readonly=False)
    pos_enable_bill_control_button = fields.Boolean(related="pos_config_id.enable_bill_control_button", readonly=False)
    pos_enable_guest_control_button = fields.Boolean(related="pos_config_id.enable_guest_control_button", readonly=False)
    pos_enable_print_order_button = fields.Boolean(related="pos_config_id.enable_print_order_button", readonly=False)
    pos_enable_split_bill_button = fields.Boolean(related="pos_config_id.enable_split_bill_button", readonly=False)
    pos_enable_transfer_order_button = fields.Boolean(related="pos_config_id.enable_transfer_order_button", readonly=False)