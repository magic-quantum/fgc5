# -*- coding: utf-8 -*-
"""
Odoo Proprietary License v1.0.

see License:
https://www.odoo.com/documentation/user/16.0/legal/licenses/licenses.html#odoo-apps
# Copyright ©2023 Bernard K. Too<bernard.too@optima.co.ke>
"""

from odoo import models


class RestaurantIPPrinter(models.Model):
    """Add session fields."""

    _inherit = "pos.session"

    def _loader_params_restaurant_printer(self):
        """Add ip address field to session printer params."""
        result = super()._loader_params_restaurant_printer()
        if result.get("search_params").get("fields"):
            result["search_params"]["fields"].append("restaurant_escpos_printer_ip")
        return result
