from base64 import b64encode

from odoo import fields, models
from odoo.tools import file_open


class PosConfig(models.Model):
    _inherit = 'pos.config'

    def _default_custom_logo(self):
        company = self.env['res.company'].search([('id', '=', self.env.company.id)])
        return company.logo if company.logo else self._get_default_custom_logo()

    custom_logo_type = fields.Selection(string='Print custom Logo or Text', default='logo',
                                       selection=[('logo', 'Print Custom Logo in Bill'), ('text', 'Print Text in Bill')],
                                       help="When you choose any option,"
                                       " the logo or text will be displayed on the header of the retail invoice")
    custom_logo = fields.Image(default=_default_custom_logo, string='Custom Logo', max_width=1920, max_height=1920)
    custom_text = fields.Text(string='Custom Text')

    def _get_default_custom_logo(self):
        return b64encode(file_open('web/static/img/placeholder.png', 'rb').read())
