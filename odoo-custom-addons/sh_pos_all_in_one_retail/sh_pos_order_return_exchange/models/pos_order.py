# Part of Softhealer Technologies.

from odoo import models, fields, api
from datetime import datetime, timedelta
from odoo.exceptions import UserError
import json
import logging
import requests
_logger = logging.getLogger(__name__)
class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    sh_return_qty = fields.Float(string="Return Qty.")
    sh_exchange_qty = fields.Float(string="Exchange Qty.")


class PosOrder(models.Model):
    _inherit = 'pos.order'

    company_order_id = fields.Char(string="company order Id")
    is_return_order = fields.Boolean(string="Is Return Order?", readonly=True)
    is_exchange_order = fields.Boolean(
        string="Is Exchange Order?", readonly=True)
    old_pos_reference = fields.Char(string="Return Order", readonly=True)
    return_status = fields.Selection([
        ('nothing_return', 'Nothing Returned'),
        ('partialy_return', 'Partialy Returned'),
        ('fully_return', 'Fully Returned')
    ], string="Return Status ", default='nothing_return',
        readonly=True, copy=False, help="Return status of Order")
    total_return_order = fields.Integer(
        compute='_compute_return_order_total_', string="Total Return Order ",)
    total_exchange_order = fields.Integer(
        compute='_compute_exchange_order_total_', string="Total Exchange Order ",)
    x_delivery_person_name = fields.Char("Delivery Person Name")
    x_customer_address = fields.Char(string='Customer Street',
        related='partner_id.street',
        store=True,  
        readonly=True  
    )

    x_customer_mobile = fields.Char(
        string='Customer Mobile',
        related='partner_id.mobile',
        store=True,  
        readonly=True  
    )

    filter_value = fields.Char(string='Filter Value')

    x_delivery_person_id = fields.Many2one(
        'delivery.order',
        string='Delivery Person',
        help='Delivery person number'
    )

    x_delivery_status = fields.Selection(
        selection=[
            ('notsend', 'Not Sent'),
            ('onway', 'On Way'),
            ('delivered', 'Delivered')
        ],
        string='Delivery Status',
        help='Status of the delivery', 
        default='notsend'
    )

    @api.model
    def create(self, vals):
        pos_session = self.env['pos.session'].browse(vals.get('session_id'))
        if pos_session:
            session_sequence_code = pos_session.config_id.sequence_id.next_by_id()
        else:
            session_sequence_code = self.env['ir.sequence'].next_by_code('pos.order') or '/'
        vals['name'] = session_sequence_code
        return super(PosOrder, self).create(vals)


    @api.model
    def getorder(self, order_id):
        # Ensure order_id is an integer
        if isinstance(order_id, list) or isinstance(order_id, tuple):
            order_id = int(''.join(map(str, order_id)))
        else:
            order_id = int(order_id)

        order = self.env['pos.order'].search([('id', '=', order_id)], limit=1)
        if not order:
            raise UserError('Order not found.')
        
        _logger.info(f'Order ID: {order_id}')
        
        return {
            'id': order.id,
            'name': order.name,
            'company_order_id': order.company_order_id,
                'partner': order.partner_id.name if order.partner_id else '',
                'partner_address': order.x_customer_address,
                'partner_mobile': order.x_customer_mobile,
                'date_order': order.date_order,
                'sh_order_date': order.sh_order_date,
                'total_amount': order.amount_total,
                'order_reference': order.pos_reference,
                'delivery_status': order.x_delivery_status,
                'delivery_person_name': order.x_delivery_person_name,
                'state': order.state,
                'currency': order.currency_id.name if order.currency_id else '',
                'cashier': order.cashier,        
                'lines': [{
                    'product': line.product_id.name,
                    'quantity': line.qty,
                    'price_unit': line.price_unit,
                    'customer_note': line.customer_note,
                } for line in order.lines],
                'session': order.session_id.name if order.session_id else '',
                'create_date': order.create_date,
                }

    @api.model
    def action_after_assign_company_delivery(self, orderId, currentSessionId):
        print(f'Params received - OrderId: {orderId}, SessionId: {currentSessionId}')
        try:
            if not orderId or not currentSessionId:
                return {'error': 'Missing required parameters: orderId or currentSessionId'}
            
            return_data = []
            order = self.env['pos.order'].browse(orderId)
            if not order:
                return {'error': f"POS Order with ID '{orderId}' does not exist."}

            pos_session = self.env['pos.session'].browse(currentSessionId)
            pos_config = pos_session.config_id
            order.sudo().write({'x_delivery_status': 'delivered'})
            self._invoice_order(orderId)
            return_data.append({
                'success': True,
            })
            return return_data

        except Exception as e:
            return {'error': str(e)}



    # @api.model
    # def action_assign_company_delivery(self, orderId, currentSessionId):
    #     print(f'Params received - OrderId: {orderId}, SessionId: {currentSessionId}')
    #     try:
    #         if not orderId or not currentSessionId:
    #             return {'error': 'Missing required parameters: orderId or currentSessionId'}
    #         return_data = []
    #         order = self.env['pos.order'].search([('id', '=', orderId)], limit=1)
    #         if not order:
    #             return {'error': f"POS Order with ID '{orderId}' does not exist."}

    #         if order.x_delivery_status == "delivered":
    #             return {'error': f"Cannot assign POS Order {order.name} because it has already been delivered."}
            
    #         payment_method = None
    #         pos_session = self.env['pos.session'].browse(currentSessionId)
    #         pos_config = pos_session.config_id

    #         available_payment_methods = pos_config.payment_method_ids.mapped('id')            
    #         payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is True)[:1]

    #         print("Filtered Payment Method:", payment_method)
    #         _logger.info("Available Payment Methods in pos_config: %s", pos_config.payment_method_ids)

    #         if payment_method:
    #             payment_method = payment_method[0]
    #             _logger.info("Selected Payment Method: %s", payment_method)
    #             print("Selected Payment Method:", payment_method)

    #             order.sudo().write({'x_delivery_status': 'delivered'})
    #             self._invoice_order(orderId)
    #         else:
    #             _logger.error("No valid payment method found for this configuration.")
    #             return {'error': 'No valid payment method found for this configuration.'}
            
    #         return_data.append({
    #         'success': True,
    #         'is_company': True, 
    #         'order_id': orderId,
    #         'delivery_status': order.x_delivery_status,
    #         'delivery_person': 'company',
    #         'account_move_id': order.account_move.id if order.account_move else None,
    #         'state': 'invoiced',
    #         'payment_method_id': payment_method.mapped('id')
    #         })

    #         _logger.info(f'Processed Company Delivery Order: {return_data}')
    #         return return_data

    #     except Exception as e:
    #         return {'error': str(e)}  

   
    @api.model
    def action_assign_company_delivery(self, orderId, currentSessionId, company_order_id, totar):
        print(f'Params received - OrderId: {orderId}, SessionId: {currentSessionId}')
        try:
            if not orderId or not currentSessionId:
                return {'error': 'Missing required parameters: orderId or currentSessionId'}
            
            return_data = []
            order = self.env['pos.order'].browse(orderId)
            if not order:
                return {'error': f"POS Order with ID '{orderId}' does not exist."}

            if order.x_delivery_status == "delivered":
                return {'error': f"Cannot assign POS Order {order.name} because it has already been delivered."}

            pos_session = self.env['pos.session'].browse(currentSessionId)
            pos_config = pos_session.config_id

            # company_partner = order.company_id.partner_id
            company_partner = totar[0]
            if not company_partner:
                return {'error': "Please provide a partner for the sale."}

            # order.sudo().write({'partner_id': company_partner.id})
            order.sudo().write({'partner_id': company_partner})
            order.sudo().write({'company_order_id': company_order_id})

            delivery_order = self.env['delivery.order'].search([('name_id', '=', company_partner)], limit=1)
            # delivery_order = self.env['delivery.order'].search([('name_id', '=', company_partner.id)], limit=1)

            # if not delivery_order:
            #     delivery_order = self.env['delivery.order'].create({
            #         'name_id': company_partner.id,
            #         # 'company_id': order.company_partner.id,
            #         # 'status': 'assigned',  # تحديد حالة الطلب، عدّلها حسب الحاجة
            #     })
            # else:
            #     # delivery_order.sudo().write({'status': 'assigned'})
            #     return

            available_payment_methods = pos_config.payment_method_ids.mapped('id')            
            payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is True)[:1]

            print("Filtered Payment Method:", payment_method)
            _logger.info("Available Payment Methods in pos_config: %s", pos_config.payment_method_ids)

            if payment_method:
                payment_method = payment_method[0]
                _logger.info("Selected Payment Method: %s", payment_method)
                print("Selected Payment Method:", payment_method)

                order.sudo().write({'x_delivery_status': 'notsend'})
                # order.sudo().write({'x_delivery_status': 'delivered'})
                # self._invoice_order(orderId)
            else:
                _logger.error("No valid payment method found for this configuration.")
                return {'error': 'No valid payment method found for this configuration.'}
            
            return_data.append({
                'success': True,
                'is_company': True, 
                'order_id': orderId,
                'delivery_status': order.x_delivery_status,
                'delivery_person': 'company',
                'account_move_id': order.account_move.id if order.account_move else None,
                # 'state': 'invoiced',
                'state': 'draft',
                'company_order_id': order.company_order_id,
                'payment_method_id': payment_method.mapped('id'),
                'delivery_order_id': delivery_order.id
            })

            _logger.info(f'Processed Company Delivery Order: {return_data}')
            return return_data

        except Exception as e:
            return {'error': str(e)}

   
   
   
    @api.model
    def action_assign_delivery_person(self, nameId, orderId, currentSessionId):
        print(f'Params received - NameId: {nameId}, OrderId: {orderId}, SessionId: {currentSessionId}')

        try:
            if not nameId or not orderId or not currentSessionId:
                return {'error': 'Missing required parameters: nameId, orderId, or currentSessionId'}

            return_data = []

            person = self.env['delivery.order'].search([('name_id', '=', nameId)], limit=1)


            if not person:
                return {'error': f"The delivery person with name '{nameId}' does not exist."}

            order = self.env['pos.order'].search([('id', '=', orderId)], limit=1)
            if not order:
                return {'error': f"POS Order with ID '{orderId}' does not exist."}

            if order.x_delivery_status == "delivered":
                return {'error': f"Cannot assign POS Order {order.name} because it has already been delivered."}

            payment_method = None
            pos_session = self.env['pos.session'].browse(currentSessionId)
            pos_config = pos_session.config_id

            available_payment_methods = pos_config.payment_method_ids.mapped('id')            
            if person.is_company:
                payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is True)[:1]
                print("Filtered Payment Method:", payment_method)
                _logger.info("Available Payment Methods in pos_config: %s", pos_config.payment_method_ids)
                print("Available Payment Methods in pos_config:", pos_config.payment_method_ids)


                if payment_method:
                    payment_method = payment_method[0]
                    _logger.info("Selected Payment Method: %s", payment_method)
                    print("Selected Payment Method:", payment_method)

                    order.sudo().write({'x_delivery_status': 'delivered'})
                    self._invoice_order(orderId)

                    # self.env['pos.payment'].create({
                    #     'pos_order_id': order.id,
                    #     'amount': order.amount_total,
                    #     'payment_method_id': payment_method.id, 
                    # })
                else:
                    _logger.error("No valid payment method found for this configuration.")
                    return {'error': 'No valid payment method found for this configuration.'}
                
            else:
                payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is False)[:1]
                # order.x_delivery_status = 'onway'
                order.sudo().write({'x_delivery_status': 'onway'})
            if not payment_method:
                return {'error': 'Payment method not found in POS config. Available methods: %s' % available_payment_methods}

            # Create the payment
            order.x_delivery_person_name = person.name_id.name
            _logger.info(f'Order IDbbbbbb: {orderId}')
            _logger.info(f'Order foundbbbbbbbbbbbbbbb: {order}')
            return_data.append({
                'success': True,
                'is_company': person.is_company, 
                'order_id':orderId, 
                'delivery_status': order.x_delivery_status,
                'delivery_person': order.x_delivery_person_name,
                'account_move_id': order.account_move.id if order.account_move else None,
                'state': 'invoiced' if person.is_company else 'draft',
                'payment_method_id': payment_method.mapped('id')
                })
            _logger.info(f'Order foundbbbbbbbbbbbbbbb: {return_data}')

            return return_data

        except Exception as e:
            return {'error': str(e)}

    @api.model
    def action_assign_delivery_person(self, nameId, orderId, currentSessionId):
        print(f'Params received - NameId: {nameId}, OrderId: {orderId}, SessionId: {currentSessionId}')

        try:
            if not nameId or not orderId or not currentSessionId:
                return {'error': 'Missing required parameters: nameId, orderId, or currentSessionId'}

            return_data = []

            person = self.env['delivery.order'].search([('name_id', '=', nameId)], limit=1)


            if not person:
                return {'error': f"The delivery person with name '{nameId}' does not exist."}

            order = self.env['pos.order'].search([('id', '=', orderId)], limit=1)
            if not order:
                return {'error': f"POS Order with ID '{orderId}' does not exist."}

            if order.x_delivery_status == "delivered":
                return {'error': f"Cannot assign POS Order {order.name} because it has already been delivered."}

            payment_method = None
            pos_session = self.env['pos.session'].browse(currentSessionId)
            pos_config = pos_session.config_id

            available_payment_methods = pos_config.payment_method_ids.mapped('id')            
            if person.is_company:
                payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is True)[:1]
                print("Filtered Payment Method:", payment_method)
                _logger.info("Available Payment Methods in pos_config: %s", pos_config.payment_method_ids)
                print("Available Payment Methods in pos_config:", pos_config.payment_method_ids)


                if payment_method:
                    payment_method = payment_method[0]
                    _logger.info("Selected Payment Method: %s", payment_method)
                    print("Selected Payment Method:", payment_method)

                    order.sudo().write({'x_delivery_status': 'delivered'})
                    self._invoice_order(orderId)

                    # self.env['pos.payment'].create({
                    #     'pos_order_id': order.id,
                    #     'amount': order.amount_total,
                    #     'payment_method_id': payment_method.id, 
                    # })
                else:
                    _logger.error("No valid payment method found for this configuration.")
                    return {'error': 'No valid payment method found for this configuration.'}
                
            else:
                payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is False)[:1]
                # order.x_delivery_status = 'onway'
                order.sudo().write({'x_delivery_status': 'onway'})
            if not payment_method:
                return {'error': 'Payment method not found in POS config. Available methods: %s' % available_payment_methods}

            # Create the payment
            order.x_delivery_person_name = person.name_id.name
            _logger.info(f'Order IDbbbbbb: {orderId}')
            _logger.info(f'Order foundbbbbbbbbbbbbbbb: {order}')
            return_data.append({
                'success': True,
                'is_company': person.is_company, 
                'order_id':orderId, 
                'delivery_status': order.x_delivery_status,
                'delivery_person': order.x_delivery_person_name,
                'account_move_id': order.account_move.id if order.account_move else None,
                'state': 'invoiced' if person.is_company else 'draft',
                'payment_method_id': payment_method.mapped('id')
                })
            _logger.info(f'Order foundbbbbbbbbbbbbbbb: {return_data}')

            return return_data

        except Exception as e:
            return {'error': str(e)}

    def _invoice_order(self, order_id):
        order = self.env['pos.order'].search([('id', '=', order_id)], limit=1)

        if order.state not in ['draft', 'paid']:
            raise UserError('Order cannot be invoiced in its current state.')

        if order.account_move and order.account_move.state == 'posted':
            _logger.info(f"Invoice {order.account_move.name} is already posted.")
        else:
            if not order.account_move:
                order.action_pos_order_invoice()
                _logger.info(f"Created invoice {order.account_move.name} for the order.")

            if order.account_move.state == 'draft':
                # order.account_move.sudo().action_post()
                _logger.info(f"Posted invoice {order.account_move.name}.")

        order.write({
            'state': 'invoiced',
            'is_invoiced': True, 
        })

        return True

    






    
    @api.model
    def search_return_exchange_order(self, config_data, page_number):
        showFrom = int(
            config_data['sh_how_many_order_per_page']) * (int(page_number) - 1)
        showTo = showFrom + int(config_data['sh_how_many_order_per_page'])

        if config_data['sh_load_order_by']:

            if config_data['sh_load_order_by'] == 'session_wise':

                if config_data['sh_session_wise_option'] == 'current_session':
                    order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                        'session_id', '=', config_data['current_session_id'][0]), ('state', '!=', 'cancel'), '|', ('is_return_order', '=', True), ('is_exchange_order', '=', True)], limit=showTo)

                if config_data['sh_session_wise_option'] == 'last_no_session':
                    all_session = self.env['pos.session'].search_read([])
                    for index, obj in enumerate(all_session):
                        if (index+1) != len(all_session):
                            if (all_session[index]['stop_at'] and all_session[index + 1]):
                                if all_session[index]['stop_at'] < all_session[index + 1]['stop_at']:
                                    temp = all_session[index]
                                    all_session[index] = all_session[index + 1]
                                    all_session[index + 1] = temp
                    session = []
                    for x in range(0, config_data['sh_last_no_session']):
                        if x < len(all_session):
                            session.append(all_session[x]['id'])
                    if session:
                        order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                            'session_id', 'in', session), ('state', '!=', 'cancel'), '|', ('is_return_order', '=', True), ('is_exchange_order', '=', True)], limit=showTo)

            if config_data['sh_load_order_by'] == 'all':
                order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), (
                    'state', '!=', 'cancel'), '|', ('is_return_order', '=', True), ('is_exchange_order', '=', True)], limit=showTo)

            if config_data['sh_load_order_by'] == 'day_wise':

                if config_data['sh_day_wise_option'] == 'current_day':
                    today_date = datetime.today().strftime('%Y-%m-%d')
                    order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), ('date_order', '>=', (
                        today_date + " 00:00:00")), ('date_order', '<=', (today_date + " 24:00:00")), ('state', '!=', 'cancel'), '|', ('is_return_order', '=', True), ('is_exchange_order', '=', True)], limit=showTo)

                if config_data['sh_day_wise_option'] == 'last_no_day':
                    if config_data['sh_last_no_days']:
                        today_date = datetime.today().strftime('%Y-%m-%d')
                        last_date = datetime.today() - \
                            timedelta(days=config_data['sh_last_no_days'])
                        last_date = last_date.strftime('%Y-%m-%d')
                        order_data = self.env['pos.order'].search_read(['|', ('user_id', '=', self.env.user.id), ('assigned_config', '=', config_data['id']), ('date_order', '<=', (
                            today_date + " 24:00:00")), ('date_order', '>', (last_date + " 24:00:00")), ('state', '!=', 'cancel'), '|', ('is_return_order', '=', True), ('is_exchange_order', '=', True)], limit=showTo)
        order_data = order_data[showFrom:showTo]
        order_line = []
        if order_data and len(order_data) > 0:
            order_ids = []
            for each_order in order_data:
                order_ids.append(each_order.get('id'))
            order_line = self.env['pos.order.line'].search_read(
                [('order_id', 'in', order_ids)])
        return {'order': order_data, 'order_line': order_line}

    @api.model
    def search_return_order_length(self, config_data):
        if config_data['sh_load_order_by']:

            if config_data['sh_load_order_by'] == 'session_wise':

                if config_data['sh_session_wise_option'] == 'current_session':
                    order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), (
                        'session_id', '=', config_data['current_session_id'][0]), ('state', '!=', 'cancel')])

                if config_data['sh_session_wise_option'] == 'last_no_session':
                    all_session = self.env['pos.session'].search_read([])
                    for index, obj in enumerate(all_session):
                        if (index+1) != len(all_session):
                            if (all_session[index]['stop_at'] and all_session[index + 1]):
                                if all_session[index]['stop_at'] < all_session[index + 1]['stop_at']:
                                    temp = all_session[index]
                                    all_session[index] = all_session[index + 1]
                                    all_session[index + 1] = temp
                    session = []
                    for x in range(0, config_data['sh_last_no_session']):
                        if x < len(all_session):
                            session.append(all_session[x]['id'])
                    if session:
                        order_data = self.env['pos.order'].search_read(
                            [('user_id', '=', self.env.user.id), ('session_id', 'in', session), ('state', '!=', 'cancel')])

            if config_data['sh_load_order_by'] == 'all':
                order_data = self.env['pos.order'].search_read(
                    [('user_id', '=', self.env.user.id), ('state', '!=', 'cancel')])

            if config_data['sh_load_order_by'] == 'day_wise':

                if config_data['sh_day_wise_option'] == 'current_day':
                    today_date = datetime.today().strftime('%Y-%m-%d')
                    order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), ('date_order', '>=', (
                        today_date + " 00:00:00")), ('date_order', '<=', (today_date + " 24:00:00")), ('state', '!=', 'cancel')])

                if config_data['sh_day_wise_option'] == 'last_no_day':
                    if config_data['sh_last_no_days']:
                        today_date = datetime.today().strftime('%Y-%m-%d')
                        last_date = datetime.today() - \
                            timedelta(days=config_data['sh_last_no_days'])
                        last_date = last_date.strftime('%Y-%m-%d')
                        order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), ('date_order', '<=', (
                            today_date + " 24:00:00")), ('date_order', '>', (last_date + " 24:00:00")), ('state', '!=', 'cancel')])
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
    def search_return_order(self, config_data, page_number):

        showFrom = int(
            config_data['sh_how_many_order_per_page']) * (int(page_number) - 1)
        showTo = showFrom + int(config_data['sh_how_many_order_per_page'])

        if config_data['sh_load_order_by']:

            if config_data['sh_load_order_by'] == 'session_wise':

                if config_data['sh_session_wise_option'] == 'current_session':
                    order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), ('session_id', '=', config_data['current_session_id'][0]), (
                        'state', '!=', 'cancel'), ('is_return_order', '=', False), ('is_exchange_order', '=', False)], limit=showTo)

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
                        order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), ('session_id', 'in', session), (
                            'state', '!=', 'cancel'), ('is_return_order', '=', False), ('is_exchange_order', '=', False)], limit=showTo)

            if config_data['sh_load_order_by'] == 'all':
                order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), (
                    'state', '!=', 'cancel'), ('is_return_order', '=', False), ('is_exchange_order', '=', False)], limit=showTo)

            if config_data['sh_load_order_by'] == 'day_wise':

                if config_data['sh_day_wise_option'] == 'current_day':
                    today_date = datetime.today().strftime('%Y-%m-%d')
                    order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), ('date_order', '>=', (today_date + " 00:00:00")), (
                        'date_order', '<=', (today_date + " 24:00:00")), ('state', '!=', 'cancel'), ('is_return_order', '=', False), ('is_exchange_order', '=', False)], limit=showTo)

                if config_data['sh_day_wise_option'] == 'last_no_day':
                    if config_data['sh_last_no_days']:
                        today_date = datetime.today().strftime('%Y-%m-%d')
                        last_date = datetime.today() - \
                            timedelta(days=config_data['sh_last_no_days'])
                        last_date = last_date.strftime('%Y-%m-%d')
                        order_data = self.env['pos.order'].search_read([('user_id', '=', self.env.user.id), ('date_order', '<=', (today_date + " 24:00:00")), (
                            'date_order', '>', (last_date + " 24:00:00")), ('state', '!=', 'cancel'), ('is_return_order', '=', False), ('is_exchange_order', '=', False)], limit=showTo)
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

    def _compute_return_order_total_(self):
        for each in self:
            return_order = self.search_read(
                [('old_pos_reference', '=', each.pos_reference), ('is_return_order', '=', True)])
            each.total_return_order = len(return_order)

    def _compute_exchange_order_total_(self):

        for each in self:
            exchange_order = self.search_read(
                [('old_pos_reference', '=', each.pos_reference), ('is_exchange_order', '=', True)])
            each.total_exchange_order = len(exchange_order)

    @api.model
    def _order_fields(self, ui_order):

        res = super(PosOrder, self)._order_fields(ui_order)
        res['is_return_order'] = ui_order.get(
            'is_return_order') if ui_order.get('is_return_order') else False
        res['is_exchange_order'] = ui_order.get(
            'is_exchange_order') if ui_order.get('is_exchange_order') else False
        res['old_pos_reference'] = ui_order.get(
            'old_pos_reference') if ui_order.get('old_pos_reference') else False

        for return_line in ui_order.get('lines'):
            if return_line[2].get('refunded_orderline_id'):
                refund_parent_order = self.browse(self.env['pos.order.line'].browse(
                    return_line[2]['refunded_orderline_id']).order_id.id)
                res['is_return_order'] = True
                res['old_pos_reference'] = refund_parent_order.pos_reference

        if ui_order.get('is_return_order'):
            flag = True
            parent_order = self.search(
                [('pos_reference', '=', ui_order['old_pos_reference'])], limit=1)
            updated_lines = ui_order['lines']

            for uptd in updated_lines:
                if uptd[2].get('line_id'):
                    line = self.env['pos.order.line'].search([('order_id', '=', parent_order.id),
                                                              ('id', '=', uptd[2]['line_id'])], limit=1)
                    if not line:
                        line = self.env['pos.order.line'].search(
                            [('order_id', '=', parent_order.id), ('sh_line_id', '=', uptd[2]['old_line_id'])], limit=1)
                    if line:
                        line.sh_return_qty += -(uptd[2]['qty'])
            if parent_order.lines:
                for line in parent_order.lines:
                    if flag:
                        if line.qty > line.sh_return_qty:
                            flag = False

            if flag:
                parent_order.return_status = 'fully_return'
            else:
                parent_order.return_status = 'partialy_return'

        if ui_order.get('is_exchange_order'):
            flag = True
            parent_order = self.search(
                [('pos_reference', '=', ui_order['old_pos_reference'])], limit=1)
            updated_lines = ui_order['lines']
            for uptd in updated_lines:
                if uptd[2].get('line_id'):
                    line = self.env['pos.order.line'].search([('order_id', '=', parent_order.id),
                                                              ('id', '=', uptd[2]['line_id'])], limit=1)
                    if not line:
                        line = self.env['pos.order.line'].search(
                            [('order_id', '=', parent_order.id), ('sh_line_id', '=', uptd[2]['old_line_id'])], limit=1)
                    if line:
                        line.sh_return_qty += -(uptd[2]['qty'])
            if parent_order.lines:
                for line in parent_order.lines.filtered(lambda line: line.product_id.is_rounding_product == False ):
                    if flag:
                        if line.qty > line.sh_return_qty:
                            flag = False
            if flag:
                parent_order.return_status = 'fully_return'
            else:
                parent_order.return_status = 'partialy_return'

        return res

    @api.model
    def _process_order(self, order, draft, existing_order):
        order_id = super(PosOrder, self)._process_order(
            order, draft, existing_order)
        pos_order = self.search([('id', '=', order_id)])
        old_pos_order = self.search(
            [('pos_reference', '=', pos_order.old_pos_reference)])
        if old_pos_order:
            if pos_order.is_return_order:
                if old_pos_order.old_pos_reference:
                    old_pos_order.write(
                        {'old_pos_reference': old_pos_order.old_pos_reference + ' , ' + pos_order.pos_reference})
                else:
                    old_pos_order.write(
                        {'old_pos_reference': pos_order.pos_reference})
            if pos_order.is_exchange_order:
                if old_pos_order.old_pos_reference:
                    old_pos_order.write(
                        {'old_pos_reference': old_pos_order.old_pos_reference + ' , ' + pos_order.pos_reference})
                else:
                    old_pos_order.write(
                        {'old_pos_reference': pos_order.pos_reference})
        return order_id

    def action_view_return(self):
        return {
            'name': 'Return Order',
            'type': 'ir.actions.act_window',
            'view_type': 'form',
            'view_mode': 'tree,form',
            'domain': [('old_pos_reference', '=', self.pos_reference), ('is_return_order', '=', True)],
            'res_model': 'pos.order',
            'target': 'current',
        }

    def action_view_exchange(self):
        return {
            'name': 'Exchange Order',
            'type': 'ir.actions.act_window',
            'view_type': 'form',
            'view_mode': 'tree,form',
            'domain': [('old_pos_reference', '=', self.pos_reference), ('is_exchange_order', '=', True)],
            'res_model': 'pos.order',
            'target': 'current',
        }
