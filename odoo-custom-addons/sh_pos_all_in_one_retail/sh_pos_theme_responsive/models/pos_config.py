# -*- coding: utf-8 -*-
# Copyright (C) Softhealer Technologies.

from odoo import fields, models


class ShPosConfig(models.Model):
    _inherit = 'pos.config'

    sh_pos_night_mode = fields.Boolean(string="Enable Night Mode")
    enable_info_control_button = fields.Boolean(
        "Enable Info control Buton", default=False)
    enable_orderhistory_control_button = fields.Boolean(
        "Enable Order History control Buton", default=False)
    enable_refund_control_button = fields.Boolean(
        "Enable Refund control Buton", default=False)
    enable_UOM_control_button = fields.Boolean(
        "Enable UOM control Buton", default=False)
    enable_bill_control_button = fields.Boolean(
        "Enable Bill control Buton", default=False)
    enable_guest_control_button = fields.Boolean(
        "Enable Guest control Buton", default=False)
    enable_print_order_button = fields.Boolean(
        "Enable Print Order control Buton", default=False)
    enable_split_bill_button = fields.Boolean(
        "Enable Split Bill control Buton", default=False)
    enable_transfer_order_button = fields.Boolean(
        "Enable Transfer Order control Buton", default=False)