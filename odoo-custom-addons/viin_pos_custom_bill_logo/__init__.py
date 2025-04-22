from . import models

from odoo import api, SUPERUSER_ID


def _pos_config_post_init(cr, registry):
    env = api.Environment(cr, SUPERUSER_ID, {})
    _set_default_logo_image(env)


def _set_default_logo_image(env):
    """The function support assigning a default logo to a point of sale when installation this module"""
    companies = env['res.company'].with_context(active_test=False).search([])
    pos_configs = env['pos.config'].with_context(active_test=False).search([('company_id', 'in', companies.ids)])
    for pos_config in pos_configs:
        pos_config.custom_logo = pos_config.company_id.logo if pos_config.company_id.logo else pos_config._get_default_custom_logo()
