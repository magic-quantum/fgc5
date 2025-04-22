# Copyright (C) Softhealer Technologies.
# Part of Softhealer Technologies.

from odoo import fields, models

class ShHrEmployee(models.Model):
    _inherit = 'hr.employee'

    sh_enbale_product_create = fields.Boolean(string="Allow to Create Product ?")
    sh_enbale_cancel = fields.Boolean(string="Can Cancel ?")

class ShHrEmployeePublic(models.Model):
    _inherit = "hr.employee.public"

    sh_enbale_product_create = fields.Boolean(related='employee_id.sh_enbale_product_create')
    sh_enbale_cancel = fields.Boolean(related='employee_id.sh_enbale_cancel')