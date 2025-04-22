from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import date, datetime
import logging

_logger = logging.getLogger(__name__)

class DeliveryOrder(models.Model):
    _name = 'delivery.order'
    _description = 'Delivery Order'
    _inherit = ['mail.thread']
    _rec_name = 'name_id'

    name_id = fields.Many2one('hr.employee', string='Name', required=True)
    is_company = fields.Boolean(string='Is Company', default=False, help='Indicate if the condition is met')
    address_home_id = fields.Many2one('res.partner', string='Address', compute='_compute_address_home_id', store=True)
    address = fields.Char(string='Address', compute='_compute_address', store=True)
    mobile_number = fields.Char(related='name_id.mobile_phone', string='Mobile Number')
    birthday = fields.Date(related='name_id.birthday', string='Birthday', store=True)
    age = fields.Integer(string='Age', store=True)
    gender = fields.Selection(related='name_id.gender', string='Gender', store=True)
    delivery_person_id = fields.Many2one('res.partner', string='Delivery Person')
    active = fields.Boolean(string='Active', default=True)

    _sql_constraints = [
        ('unique_company_name', 'UNIQUE(name_id)', 'A delivery person with the same name already exists.')
    ]

    def get_delivery_orders(self):
        _logger.info("Fetching delivery orders")
        orders = self.search([])
        if not orders:
            _logger.warning("No delivery orders found")
        result = []
        for order in orders:
            _logger.info(f"Order ID: {order.id}, Name ID: {order.name_id.id}, Employee Name: {order.name_id.name}")
            result.append({
                'name_id': order.name_id.name if order.name_id else 'Unknown',
            })
        return result

    def get_delivery_persons(self):
        _logger.info("Fetching delivery persons")
        delivery_persons = self.search([('name_id', '!=', False)])

        if not delivery_persons:
            _logger.warning("No delivery persons found")

        result = []
        for delivery_order in delivery_persons:
            if delivery_order.name_id.id:
                _logger.info(f"Delivery Person Name: {delivery_order.name_id.id}")
                result.append({
                    'name_id': delivery_order.name_id.id, 
                })
            else:
                _logger.warning(f"Skipping delivery orer ID due to missing name_id or delivery_person_id")
        
        _logger.info(f"Delivery Persons: {result}")
        return result

    def get_company_delivery_orders(self):
        _logger.info("Fetching company delivery orders")
        company_orders = self.search([('is_company', '=', True)])

        if not company_orders:
            _logger.warning("No company delivery orders found")

        result = []
        for order in company_orders:
            _logger.info(f"Order ID: {order.id}, Name ID: {order.name_id.id}, Employee Name: {order.name_id.name}")
            result.append({
                'name_id': order.name_id.name if order.name_id else 'Unknown',
            })
        
        return result
    
    def get_individual_delivery_orders(self):
        _logger.info("Fetching individual delivery orders")
        individual_orders = self.search([('is_company', '=', False)])

        if not individual_orders:
            _logger.warning("No individual delivery orders found")

        result = []
        for order in individual_orders:
            _logger.info(f"Order ID: {order.id}, Name ID: {order.name_id.id}, Employee Name: {order.name_id.name}")
            result.append({
                'name_id': order.name_id.name if order.name_id else 'Unknown',
            })
        
        return result



    @api.depends('name_id')
    def _compute_address_home_id(self):
        for record in self:
            record.address_home_id = record.name_id.address_home_id.id if record.name_id and record.name_id.address_home_id else False

    @api.depends('address_home_id')
    def _compute_address(self):
        for record in self:
            if record.address_home_id:
                address = record.address_home_id
                address_parts = []
                if address.street:
                    address_parts.append(address.street)
                if address.street2:
                    address_parts.append(address.street2)
                if address.city:
                    address_parts.append(address.city)
                if address.state_id and address.state_id.name:
                    address_parts.append(address.state_id.name)
                if address.zip:
                    address_parts.append(address.zip)
                if address.country_id and address.country_id.name:
                    address_parts.append(address.country_id.name)
                record.address = ', '.join(address_parts)
            else:
                record.address = False


    def write(self, vals):
        if 'active' in vals and not vals['active']:
            for record in self:
                if record.is_company:
                    raise UserError(f"Cannot archive the delivery person named {record.name_id.name}.")
        res = super(DeliveryOrder, self).write(vals)
        return res

    def unlink(self):
        for record in self:
            if record.is_company:
                raise UserError(f"Cannot delete the delivery person named {record.name_id.name}.")

        model_id = self.env.ref('point_of_sale.model_pos_order').id
        actions = self.env['ir.actions.server'].search([
            ('model_id', '=', model_id),
            ('state', '=', 'code'),
            ('code', 'ilike', 'action_assign_delivery_person')
        ])
        
        for action in actions:
            if any(f'action_assign_delivery_person({record.id})' in action.code for record in self):
                action.unlink()

        return super(DeliveryOrder, self).unlink()


