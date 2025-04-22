# -*- coding: utf-8 -*-
"""
Odoo Proprietary License v1.0.

see License:
https://www.odoo.com/documentation/user/16.0/legal/licenses/licenses.html#odoo-apps
# Copyright ©2023 Bernard K. Too<bernard.too@optima.co.ke>
"""

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_network_printer_ip_address = fields.Char(
        related="pos_config_id.iface_network_printer_ip_address",
        string="Esc/POS Printer IP Address",
        size=45,
        store=True,
        readonly=False,
    )
