# -*- coding: utf-8 -*-
# Copyright (C) Softhealer Technologies.

from odoo import fields, models, api, _
import logging
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta, date
from odoo.exceptions import UserError
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT
import pytz
_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = 'pos.order'

    assigned_config = fields.Many2many(
        "pos.config", string=" Sh Assigned Config")
    sequence_number = fields.Integer(
        string='Sequence Number ', help='A session-unique sequence number for the order', default=1)
    sh_uid = fields.Char(string='Number')
    sh_order_line_id = fields.Char(string='Line Number')
    sh_order_date = fields.Char(string="Order Date")
    date_order_x = fields.Datetime(string='Date', readonly=True, index=True, default=fields.Datetime.now)
    date_order_local = fields.Char(string="Date", compute='_compute_local_date_order')
    is_last_session = fields.Boolean(compute='_compute_is_last_session', string='Is Last Session', store=True)
    @api.depends('date_order')
    def _compute_local_date_order(self):
        for order in self:
            if order.date_order_x:
                user_tz = self.env.user.tz or 'Asia/Riyadh' 
                local_tz = pytz.timezone(user_tz)
                utc_dt = fields.Datetime.from_string(order.date_order_x)
                local_dt = pytz.utc.localize(utc_dt).astimezone(local_tz)
                order.date_order_local = local_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT)
            else:
                order.date_order_local = ''
    @api.depends('session_id')
    def _compute_is_last_session(self):
        last_session = self.env['pos.session'].search([], order='id desc', limit=1)
        for order in self:
            order.is_last_session = (order.session_id == last_session)
            
    @api.model
    def search_order_length(self, config_data):
        if config_data['sh_load_order_by']:

            if config_data['sh_load_order_by'] == 'session_wise':

                if config_data['sh_session_wise_option'] == 'current_session':
                    # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), (
                    #     'assigned_config', '=', config_data['id']), ('session_id', '=', config_data['current_session_id'][0].id), ('state', '!=', 'cancel')])
                    order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), (
                        'assigned_config', '=', config_data['id']), ('session_id', '=', config_data['current_session_id'][0].id)])
                    
                if config_data['sh_session_wise_option'] == 'last_no_session':
                    all_session = self.env['pos.session'].search_read([])
                    for index, obj in enumerate(all_session):
                        if (index+1) != len(all_session):
                            if all_session[index]['stop_at'] and all_session[index + 1]:
                                if all_session[index]['stop_at'] < all_session[index + 1]['stop_at']:
                                    temp = all_session[index]
                                    all_session[index] = all_session[index + 1]
                                    all_session[index + 1] = temp
                    session = []
                    for x in range(0, config_data['sh_last_no_session']):
                        if x < len(all_session):
                            session.append(all_session[x]['id'])
                    if session:
                        # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), (
                        #     'assigned_config', '=', config_data['id']), ('session_id', 'in', session), ('state', '!=', 'cancel')])
                        order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), (
                            'assigned_config', '=', config_data['id']), ('session_id', 'in', session)])
                        
            if config_data['sh_load_order_by'] == 'all':
                # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), (
                #     'assigned_config', '=', config_data['id']), ('state', '!=', 'cancel')])
                order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), (
                    'assigned_config', '=', config_data['id'])])
            if config_data['sh_load_order_by'] == 'day_wise':

                if config_data['sh_day_wise_option'] == 'current_day':
                    today_date = datetime.today().strftime('%Y-%m-%d')
                    # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                    #     'date_order', '>=', (today_date + " 00:00:00")), ('date_order', '<=', (today_date + " 24:00:00")), ('state', '!=', 'cancel')])
                    order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), ('assigned_config', '=', config_data['id']), (
                        'date_order', '>=', (today_date + " 00:00:00")), ('date_order', '<=', (today_date + " 24:00:00"))])

                if config_data['sh_day_wise_option'] == 'last_no_day':
                    if config_data['sh_last_no_days']:
                        today_date = datetime.today().strftime('%Y-%m-%d')
                        last_date = datetime.today() - \
                            timedelta(days=config_data['sh_last_no_days'])
                        last_date = last_date.strftime('%Y-%m-%d')
                        # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                        #     'date_order', '<=', (today_date + " 24:00:00")), ('date_order', '>', (last_date + " 24:00:00")), ('state', '!=', 'cancel')])
                        order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), ('assigned_config', '=', config_data['id']), (
                            'date_order', '<=', (today_date + " 24:00:00")), ('date_order', '>', (last_date + " 24:00:00"))])
        
        order_line = []
        if order_data and len(order_data) > 0:
            order_ids = []
            for each_order in order_data:
                each_order['payment_data'] = []
                if each_order and each_order.get('payment_ids') and len(each_order.get('payment_ids')) > 0:
                    for each_payment in each_order.get('payment_ids'):
                        payment_obj = self.env['pos.payment'].search_read(
                            [('id', '=', each_payment)], ['amount', 'payment_method_id'])
                        if payment_obj and payment_obj[0]:
                            each_order['payment_data'].append(payment_obj[0])
                order_ids.append(each_order.get('id'))
            order_line = self.env['pos.order.line'].search_read(
                [('order_id', 'in', order_ids)])

        return {'order': order_data, 'order_line': order_line}

    @api.model
    def search_order(self, config_data, page_number):
        showFrom = int(
            config_data['sh_how_many_order_per_page']) * (int(page_number) - 1)
        showTo = showFrom + int(config_data['sh_how_many_order_per_page'])
        order_data = []
        if config_data['sh_load_order_by']:

            if config_data['sh_load_order_by'] == 'session_wise':

                if config_data['sh_session_wise_option'] == 'current_session':
                    # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                    #     'session_id', '=', config_data['current_session_id'][0]), ('state', '!=', 'cancel')], limit=showTo)
                    order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), ('assigned_config', '=', config_data['id']), (
                        'session_id', '=', config_data['current_session_id'][0])], limit=showTo)
                    
                if config_data['sh_session_wise_option'] == 'last_no_session':
                    all_session = self.env['pos.session'].search_read([])
                    for index, obj in enumerate(all_session):
                        if (index+1) != len(all_session):
                            if all_session[index]['stop_at'] and all_session[index + 1]:
                                if all_session[index]['stop_at'] < all_session[index + 1]['stop_at']:
                                    temp = all_session[index]
                                    all_session[index] = all_session[index + 1]
                                    all_session[index + 1] = temp
                    session = []
                    for x in range(0, config_data['sh_last_no_session']):
                        if x < len(all_session):
                            session.append(all_session[x]['id'])
                    if session:
                        # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), (
                        #     'assigned_config', '=', config_data['id']), ('session_id', 'in', session), ('state', '!=', 'cancel')], limit=showTo)
                        order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), (
                            'assigned_config', '=', config_data['id']), ('session_id', 'in', session)], limit=showTo)
                        
            if config_data['sh_load_order_by'] == 'all':
                # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), (
                #     'assigned_config', '=', config_data['id']), ('state', '!=', 'cancel')], limit=showTo)
                order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), (
                    'assigned_config', '=', config_data['id'])], limit=showTo)
                
            if config_data['sh_load_order_by'] == 'day_wise':

                if config_data['sh_day_wise_option'] == 'current_day':
                    today_date = datetime.today().strftime('%Y-%m-%d')
                    # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                    #     'date_order', '>=', (today_date + " 00:00:00")), ('date_order', '<=', (today_date + " 24:00:00")), ('state', '!=', 'cancel')], limit=showTo)
                    order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), ('assigned_config', '=', config_data['id']), (
                        'date_order', '>=', (today_date + " 00:00:00")), ('date_order', '<=', (today_date + " 24:00:00"))], limit=showTo)
                    
                if config_data['sh_day_wise_option'] == 'last_no_day':
                    if config_data['sh_last_no_days']:
                        today_date = datetime.today().strftime('%Y-%m-%d')
                        last_date = datetime.today() - \
                            timedelta(days=config_data['sh_last_no_days'])
                        last_date = last_date.strftime('%Y-%m-%d')
                        # order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                        #     'date_order', '<=', (today_date + " 24:00:00")), ('date_order', '>', (last_date + " 24:00:00")), ('state', '!=', 'cancel')], limit=showTo)
                        order_data = self.env['pos.order'].search_read(['|', ('user_id', '!=', None), ('assigned_config', '=', config_data['id']), (
                            'date_order', '<=', (today_date + " 24:00:00")), ('date_order', '>', (last_date + " 24:00:00"))], limit=showTo)
                        
        order_data = order_data[showFrom:showTo]
        order_line = []
        if order_data and len(order_data) > 0:
            order_ids = []
            for each_order in order_data:
                each_order['payment_data'] = []
                if each_order and each_order.get('payment_ids') and len(each_order.get('payment_ids')) > 0:
                    for each_payment in each_order.get('payment_ids'):
                        payment_obj = self.env['pos.payment'].search_read(
                            [('id', '=', each_payment)], ['amount', 'payment_method_id'])
                        if payment_obj and payment_obj[0]:
                            each_order['payment_data'].append(payment_obj[0])
                order_ids.append(each_order.get('id'))
            order_line = self.env['pos.order.line'].search_read(
                [('order_id', 'in', order_ids)])
        return {'order': order_data, 'order_line': order_line}

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res['sh_uid'] = ui_order.get('sh_uid', False)
        res['sh_order_line_id'] = ui_order.get('sh_order_line_id', False)
        res['sh_order_date'] = ui_order.get('sh_order_date', False)
        return res


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    sh_line_id = fields.Char(string='Number')


class PosConfig(models.Model):
    _inherit = "pos.config"

    sh_enable_order_reprint = fields.Boolean(string="Allow To Reprint Order")
    sh_enable_re_order = fields.Boolean(string="Allow To ReOrder")
    sh_enable_order_list = fields.Boolean(string="Enable Order List")
    sh_enable_order_delivery_list = fields.Boolean(string="Enable Order List")
    sh_load_order_by = fields.Selection(
        [('all', 'All'), ('session_wise', 'Session Wise'), ('day_wise', 'Day Wise')], string="Load Order By", default='all', required="1")
    sh_session_wise_option = fields.Selection(
        [('current_session', 'Current Session'), ('last_no_session', 'Last No Of Session')], default='current_session', string="Session Of")
    sh_day_wise_option = fields.Selection(
        [('current_day', 'Current Day'), ('last_no_day', 'Last No Of Days')], default='current_day', string="Day Of")
    sh_last_no_days = fields.Integer(string="Last No Of Days")
    sh_last_no_session = fields.Integer(string="Last No Of Session")
    sh_how_many_order_per_page = fields.Integer(
        string="How Many Orders You Want to display Per Page ? ", default=30)

    @api.constrains('sh_last_no_session', 'sh_last_no_days')
    def _check_validity_constrain(self):
        """ verifies if record.to_hrs is earlier than record.from_hrs. """
        for record in self:
            if record and record.sh_last_no_days < 0:
                raise ValidationError(
                    _('Last Number Of Days must be positive.'))
            if record and record.sh_last_no_session < 0:
                raise ValidationError(
                    _('Last Number Of Sessions must be positive.'))

    @api.constrains('sh_how_many_order_per_page')
    def _onchange_sh_how_many_order_per_page(self):
        if self.sh_how_many_order_per_page:
            if self.sh_how_many_order_per_page < 0:
                raise ValidationError(_('Order Per Page must be positive'
                                        ))
        if self.sh_how_many_order_per_page == 0:
            raise ValidationError(_('Order Per Page must be more than 0'
                                    ))

# class DeliveryOrder(models.Model):
#     _name = 'delivery.order'
#     _description = 'Delivery Order'
#     _inherit = ['mail.thread']
#     _rec_name = 'name_id'

#     name_id = fields.Many2one('hr.employee', string='Name', required=True)
#     is_company = fields.Boolean(string='Is Company', default=False, help='Indicate if the condition is met')
#     address_home_id = fields.Many2one('res.partner', string='Address', compute='_compute_address_home_id', store=True)
#     address = fields.Char(string='Address', compute='_compute_address', store=True)
#     mobile_number = fields.Char(related='name_id.mobile_phone', string='Mobile Number')
#     birthday = fields.Date(related='name_id.birthday', string='Birthday', store=True)
#     age = fields.Integer(string='Age', compute='_compute_age', store=True)
#     gender = fields.Selection(related='name_id.gender', string='Gender', store=True)
#     delivery_person_id = fields.Many2one('res.partner', string='Delivery Person')
#     active = fields.Boolean(string='Active', default=True)

#     @api.depends('name_id')
#     def _compute_address_home_id(self):
#         for record in self:
#             record.address_home_id = record.name_id.address_home_id.id if record.name_id and record.name_id.address_home_id else False

#     @api.depends('address_home_id')
#     def _compute_address(self):
#         for record in self:
#             if record.address_home_id:
#                 address = record.address_home_id
#                 address_parts = []
#                 if address.street:
#                     address_parts.append(address.street)
#                 if address.street2:
#                     address_parts.append(address.street2)
#                 if address.city:
#                     address_parts.append(address.city)
#                 if address.state_id and address.state_id.name:
#                     address_parts.append(address.state_id.name)
#                 if address.zip:
#                     address_parts.append(address.zip)
#                 if address.country_id and address.country_id.name:
#                     address_parts.append(address.country_id.name)
#                 record.address = ', '.join(address_parts)
#             else:
#                 record.address = False

#     @api.depends('birthday')
#     def _compute_age(self):
#         today = date.today()
#         for record in self:
#             if record.birthday:
#                 birthdate = record.birthday
#                 age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
#                 record.age = age
#             else:
#                 record.age = 0

#     def write(self, vals):
#         if 'active' in vals and not vals['active']:
#             for record in self:
#                 if record.is_company:
#                     raise UserError(f"Cannot archive the delivery person named {record.name_id.name}.")
#         res = super(DeliveryOrder, self).write(vals)
#         return res


#     def unlink(self):
#         for record in self:
#             if record.is_company:
#                 raise UserError(f"Cannot delete the delivery person named {record.name_id.name}.")

#         model_id = self.env.ref('point_of_sale.model_pos_order').id
#         actions = self.env['ir.actions.server'].search([
#             ('model_id', '=', model_id),
#             ('state', '=', 'code'),
#             ('code', 'ilike', 'action_assign_delivery_person')
#         ])
        
#         for action in actions:
#             if any(f'action_assign_delivery_person({record.id})' in action.code for record in self):
#                 action.unlink()

#         return super(DeliveryOrder, self).unlink()


