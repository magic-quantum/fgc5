from odoo import api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_custom_logo_type = fields.Selection(related='pos_config_id.custom_logo_type', readonly=False)
    pos_custom_logo = fields.Image(compute='_compute_pos_custom_logo', readonly=False, store=True)
    pos_custom_text = fields.Text(compute='_compute_pos_custom_text', readonly=False, store=True)

    @api.depends('pos_custom_logo_type', 'pos_config_id')
    def _compute_pos_custom_logo(self):
        for r in self:
            if r.pos_custom_logo_type == 'logo':
                r.pos_custom_logo = r.pos_config_id.custom_logo
            else:
                r.pos_custom_logo = False

    @api.depends('pos_custom_logo_type', 'pos_config_id')
    def _compute_pos_custom_text(self):
        for r in self:
            if r.pos_custom_logo_type == 'text':
                r.pos_custom_text = r.pos_config_id.custom_text
            else:
                r.pos_custom_text = False
