# Copyright (C) Softhealer Technologies.
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    enable_internal_note = fields.Boolean(
        "Enable Internal Note", default=False)
    enable_screen_note = fields.Boolean(
        "Enable Scree Note", default=True)
    enable_orderline_note = fields.Boolean(
        "Enable OrderLine Note", default=True)
    enable_order_note = fields.Boolean(
        "Enable Global Note", default=True)
    enable_customer_note = fields.Boolean(string = 
        "Enable Customer Note", default=True)
    display_orderline_note_receipt = fields.Boolean(
        "Display Line Note in Receipt", default=True)
    display_order_note_receipt = fields.Boolean(
        "Display Global Note in Receipt", default=True)
    display_order_note_payment = fields.Boolean(
        "Display Global Note in Payment")
    hide_extra_note_checkbox = fields.Boolean(string = "Hide Store Extra Note")
