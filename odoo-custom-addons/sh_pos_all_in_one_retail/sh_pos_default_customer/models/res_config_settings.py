# Part of Softhealer Technologies.
# Copyright (C) Softhealer Technologies.

from odoo import models, fields


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_sh_enable_default_customer = fields.Boolean(
        related="pos_config_id.sh_enable_default_customer", string="Enable POS Default Customer", readonly=False)
    pos_sh_default_customer_id = fields.Many2one(
        related="pos_config_id.sh_default_customer_id", string="Default Customer", readonly=False)

    pos_sh_enable_totar = fields.Boolean(
        related="pos_config_id.sh_enable_totar", string="Enable Company Delivery", readonly=False)
    pos_sh_totar = fields.Many2one(
        related="pos_config_id.sh_totar_id", string="", readonly=False)
    
    pos_sh_enable_send_invoiced = fields.Boolean(
        related="pos_config_id.sh_enable_send_invoiced", string="Enable Send Invoiced Button", readonly=False)

    pos_sh_enable_send_order = fields.Boolean(
        related="pos_config_id.sh_enable_send_order", string="Enable Send Order Button", readonly=False)
