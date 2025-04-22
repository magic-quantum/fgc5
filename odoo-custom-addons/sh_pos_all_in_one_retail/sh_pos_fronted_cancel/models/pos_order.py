# -*- coding: utf-8 -*-
# Copyright (C) Softhealer Technologies.

from odoo import models, api
import logging
import requests
_logger = logging.getLogger(__name__)
class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def sh_fronted_cancel_draft(self, order_id):
        if order_id:
            return_data = []
            for each_order_id in order_id:
                order_obj = 0
                if isinstance(each_order_id, str):
                    order_obj = self.search([('sh_uid', '=', each_order_id)])    
                else:
                    order_obj = self.search([('id', '=', each_order_id)])
                cancel_delete = False
                cancel_draft = False

                if order_obj.company_id.pos_cancel_delivery:
                    if order_obj.picking_ids:
                        for picking in order_obj.picking_ids:
                            if picking.sudo().mapped('move_ids_without_package'):
                                picking.sudo().mapped('move_ids_without_package').sudo().write(
                                    {'state': 'draft'})
                                picking.sudo().mapped('move_ids_without_package').mapped(
                                    'move_line_ids').sudo().write({'state': 'draft'})
                                picking._sh_unreseve_qty()

                            picking.sudo().write(
                                {'state': 'draft', 'show_mark_as_todo': True})

                    elif not order_obj.picking_ids and order_obj.session_id:
                        pickings = self.env['stock.picking'].sudo().search(
                            [('pos_session_id', '=', order_obj.session_id.id)], limit=1)
                        if pickings:
                            for picking in pickings:
                                if picking.sudo().mapped('move_ids_without_package'):
                                    picking.sudo().mapped('move_ids_without_package').sudo().write(
                                        {'state': 'draft'})
                                    picking.sudo().mapped('move_ids_without_package').mapped(
                                        'move_line_ids').sudo().write({'state': 'draft'})
                                    picking._sh_unreseve_qty()
                                picking.sudo().write({'state': 'draft'})

                                for move_line in picking.move_ids_without_package:
                                    related_pos_line = order_obj.lines.filtered(
                                        lambda x: x.product_id == move_line.product_id)
                                    new_qty = move_line.product_uom_qty - related_pos_line.qty
                                    if new_qty == 0.0:
                                        move_line.mapped(
                                            'move_line_ids').sudo().unlink()
                                        move_line.sudo().unlink()
                                    else:
                                        move_line.mapped('move_line_ids').sudo().write(
                                            {'product_uom_qty': new_qty, 'qty_done': new_qty})
                                        move_line.sudo().write(
                                            {'product_uom_qty': new_qty, 'quantity_done': new_qty})

                                if picking.move_ids_without_package:
                                    picking.action_confirm()
                                    picking.action_assign()
                                    picking.button_validate()
                    cancel_draft = True
                if order_obj.company_id.pos_cancel_invoice:
                    order_obj.mapped('account_move').sudo().write(
                        {'state': 'draft'})
                    cancel_draft = True
                order_obj.sudo().write({'state': 'draft'})
                if order_obj.mapped('payment_ids'):
                    payment_ids = order_obj.mapped('payment_ids')
                    payment_ids.sudo().unlink()
                cancel_draft = True
                return_data.append({'sh_uid': order_id, 'order_id': order_obj.id,
                                    'cancel_delete': cancel_delete, 'cancel_draft': cancel_draft})
            return return_data

    @api.model
    def sh_fronted_cancel(self, order_id):
        return_data = []
        if order_id:
            return_data = []
            for each_order_id in order_id:
                order_obj = 0
                if isinstance(each_order_id, str):
                    order_obj = self.search([('sh_uid', '=', each_order_id)])    
                else:
                    order_obj = self.search([('id', '=', each_order_id)])
                cancel_delete = False
                cancel_draft = False
                cancel_order = False
                if order_obj.company_id.pos_cancel_delivery:
                    if order_obj.picking_ids:
                        for picking in order_obj.picking_ids:
                            if picking.sudo().mapped('move_ids_without_package'):
                                picking.sudo().mapped('move_ids_without_package').sudo().write(
                                    {'state': 'cancel'})
                                picking.sudo().mapped('move_ids_without_package').mapped(
                                    'move_line_ids').sudo().write({'state': 'cancel'})
                                picking._sh_unreseve_qty()
                            picking.sudo().write(
                                {'state': 'cancel', 'show_mark_as_todo': True})
                    
                    elif not order_obj.picking_ids and order_obj.session_id:
                        pickings = self.env['stock.picking'].sudo().search(
                            [('pos_session_id', '=', order_obj.session_id.id)], limit=1)
                        if pickings:
                            for picking in pickings:
                                if picking.sudo().mapped('move_ids_without_package'):
                                    picking.sudo().mapped('move_ids_without_package').sudo().write(
                                        {'state': 'cancel'})
                                    picking.sudo().mapped('move_ids_without_package').mapped(
                                        'move_line_ids').sudo().write({'state': 'cancel'})
                                    picking._sh_unreseve_qty()
                                picking.sudo().write({'state': 'cancel'})

                            for move_line in picking.move_ids_without_package:
                                related_pos_line = self.lines.filtered(
                                    lambda x: x.product_id == move_line.product_id)
                                new_qty = move_line.product_uom_qty - related_pos_line.qty
                                if new_qty == 0.0:
                                    move_line.mapped(
                                        'move_line_ids').sudo().unlink()
                                    move_line.sudo().unlink()
                                else:
                                    move_line.mapped('move_line_ids').sudo().write(
                                        {'product_uom_qty': new_qty, 'qty_done': new_qty})
                                    move_line.sudo().write(
                                        {'product_uom_qty': new_qty, 'quantity_done': new_qty})

                            if picking.move_ids_without_package:
                                picking.action_confirm()
                                picking.action_assign()
                                picking.button_validate()

                    cancel_order = True

                if order_obj.company_id.pos_cancel_invoice:
                    if order_obj.mapped('account_move'):
                        if order_obj.mapped('account_move'):
                            move = order_obj.mapped('account_move')
                            move_line_ids = move.sudo().mapped('line_ids')
                            
                            reconcile_ids = []
                            if move_line_ids:
                                reconcile_ids = move_line_ids.sudo().mapped('id')

                            reconcile_lines = self.env['account.partial.reconcile'].sudo().search(
                                ['|', ('credit_move_id', 'in', reconcile_ids), ('debit_move_id', 'in', reconcile_ids)])
                            if reconcile_lines:
                                reconcile_lines.sudo().unlink()
                            move.mapped('line_ids.analytic_line_ids').sudo().unlink()
                            move_line_ids.sudo().write({'parent_state': 'draft'})
                            move.sudo().write({'state': 'draft'})
                        if order_obj.company_id.pos_operation_type == 'cancel_draft':
                            order_obj.mapped('account_move').sudo().write(
                                {'state': 'draft'})
                        elif order_obj.company_id.pos_operation_type == 'cancel_delete':
                            order_obj.mapped('account_move').sudo().write(
                                {'state': 'draft', 'name': '/'})
                            order_obj.mapped('account_move').sudo().with_context(
                                {'force_delete': True}).unlink()
                        elif order_obj.company_id.pos_operation_type == 'cancel':
                            order_obj.mapped('account_move').sudo().write(
                                {'state': 'cancel'})

                    cancel_order = True

                if order_obj.mapped('payment_ids'):
                    payment_ids = order_obj.mapped('payment_ids')
                    payment_ids.sudo().unlink()
                
                if order_obj.company_id.pos_operation_type == 'cancel_draft':
                    order_obj.sudo().write({'state': 'draft'})
                    cancel_draft = True
                elif order_obj.company_id.pos_operation_type == 'cancel_delete':
                    order_obj.sudo().write({'state': 'cancel'})
                    order_obj.sudo().unlink()
                    cancel_delete = True
                elif order_obj.company_id.pos_operation_type == 'cancel':
                    order_obj.sudo().write({'state': 'cancel'})
                    cancel_delete = True

                return_data.append({'sh_uid': order_id, 'order_id': order_obj.id,
                                    'cancel_delete': cancel_delete, 'cancel_draft': cancel_draft, 'cancel_order': cancel_order})
                
        return return_data

    @api.model
    def sh_fronted_cancel_delete(self, order_id):
        if order_id:
            return_data = []
            for each_order_id in order_id:

                order_obj = 0
                if isinstance(each_order_id, str):
                    order_obj = self.search([('sh_uid', '=', each_order_id)])    
                else:
                    order_obj = self.search([('id', '=', each_order_id)])
                cancel_delete = False
                cancel_draft = False

                if order_obj.company_id.pos_cancel_delivery:
                    if order_obj.picking_ids:
                        for picking in order_obj.picking_ids:
                            if picking.sudo().mapped('move_ids_without_package'):
                                picking.sudo().mapped('move_ids_without_package').sudo().write(
                                    {'state': 'draft'})
                                picking.sudo().mapped('move_ids_without_package').mapped(
                                    'move_line_ids').sudo().write({'state': 'draft'})
                                picking._sh_unreseve_qty()
                                picking.sudo().mapped('move_ids_without_package').mapped(
                                    'move_line_ids').sudo().unlink()
                                picking.sudo().mapped('move_ids_without_package').sudo().unlink()
                            picking.sudo().write(
                                {'state': 'draft', 'show_mark_as_todo': True})
                            picking.sudo().unlink()

                    elif not order_obj.picking_ids and order_obj.session_id:
                        pickings = self.env['stock.picking'].sudo().search(
                            [('pos_session_id', '=', order_obj.session_id.id)], limit=1)
                        if pickings:
                            for picking in pickings:
                                if picking.sudo().mapped('move_ids_without_package'):
                                    picking.sudo().mapped('move_ids_without_package').sudo().write(
                                        {'state': 'draft'})
                                    picking.sudo().mapped('move_ids_without_package').mapped(
                                        'move_line_ids').sudo().write({'state': 'draft'})
                                    picking._sh_unreseve_qty()
                                picking.sudo().write({'state': 'draft'})

                                for move_line in picking.move_ids_without_package:
                                    related_pos_line = order_obj.lines.filtered(
                                        lambda x: x.product_id == move_line.product_id)
                                    new_qty = move_line.product_uom_qty - related_pos_line.qty
                                    if new_qty == 0.0:
                                        move_line.mapped(
                                            'move_line_ids').sudo().unlink()
                                        move_line.sudo().unlink()
                                    else:

                                        move_line.mapped('move_line_ids').sudo().write(
                                            {'product_uom_qty': new_qty, 'qty_done': new_qty})
                                        move_line.sudo().write(
                                            {'product_uom_qty': new_qty, 'quantity_done': new_qty})

                                if picking.move_ids_without_package:
                                    picking.action_confirm()
                                    picking.action_assign()
                                    picking.button_validate()
                    cancel_delete = True

                if order_obj.company_id.pos_cancel_invoice:
                    if order_obj.mapped('account_move'):
                        move = order_obj.mapped('account_move')
                        move_line_ids = move.sudo().mapped('line_ids')

                        reconcile_ids = []
                        if move_line_ids:
                            reconcile_ids = move_line_ids.sudo().mapped('id')

                        reconcile_lines = self.env['account.partial.reconcile'].sudo().search(
                            ['|', ('credit_move_id', 'in', reconcile_ids), ('debit_move_id', 'in', reconcile_ids)])
                        if reconcile_lines:
                            reconcile_lines.sudo().unlink()
                        move.mapped(
                            'line_ids.analytic_line_ids').sudo().unlink()
                        move_line_ids.sudo().write({'parent_state': 'draft'})
                        move.sudo().write({'state': 'draft'})
                        order_obj.mapped('account_move').sudo().write(
                            {'state': 'draft', 'name': '/'})
                        order_obj.mapped('account_move').sudo().with_context(
                            {'force_delete': True}).unlink()
                    cancel_delete = True

                if order_obj.mapped('payment_ids'):
                    payment_ids = order_obj.mapped('payment_ids')
                    payment_ids.sudo().unlink()

                order_obj.sudo().write({'state': 'cancel'})
                order_obj.sudo().unlink()
                cancel_delete = True
                return_data.append({'sh_uid': order_id, 'order_id': order_obj.id,
                                    'cancel_delete': cancel_delete, 'cancel_draft': cancel_draft})
            return return_data
    
    
    
    @api.model
    def sh_fronted_mark_paid(self, order_id, currentSessionId):

        order_ID = [order_id]
        if order_ID:
            return_data = []
            for each_order_ID in order_ID:
                order_obj = 0
                
                if isinstance(each_order_ID, str):
                    order_obj = self.search([('sh_uid', '=', each_order_ID)])    
                else:
                    order_obj = self.search([('id', '=', each_order_ID)])
                
                cancel_delete = False
                cancel_draft = False
                paid = False
               
                pos_session = self.env['pos.session'].browse(currentSessionId)

                if pos_session:
                    pos_config = pos_session.config_id
                    available_payment_methods = pos_config.payment_method_ids.mapped('id')

                    payment_method = pos_config.payment_method_ids.filtered(lambda pm: pm.split_transactions is False)[:1]

                    if payment_method:

                        # Create a new payment record
                        bilal = self.env['pos.payment'].create({
                            'pos_order_id': order_obj.id,
                            'amount': order_obj.amount_total,  
                            'payment_method_id': payment_method.id,
                        })


                    else:
                        return {'error': 'Payment method not found in POS config. Available methods: %s' % available_payment_methods}
                
                if order_obj.company_id.pos_cancel_delivery:
                    if order_obj.picking_ids:
                        for picking in order_obj.picking_ids:
                            if picking.sudo().mapped('move_ids_without_package'):
                                picking.sudo().mapped('move_ids_without_package').sudo().write({'state': 'paid'})
                                picking.sudo().mapped('move_ids_without_package').mapped('move_line_ids').sudo().write({'state': 'paid'})
                                picking._sh_unreseve_qty()

                            picking.sudo().write({'state': 'paid', 'show_mark_as_todo': True})

                    elif not order_obj.picking_ids and order_obj.session_id:
                        pickings = self.env['stock.picking'].sudo().search([('pos_session_id', '=', order_obj.session_id.id)], limit=1)
                        if pickings:
                            for picking in pickings:
                                if picking.sudo().mapped('move_ids_without_package'):
                                    picking.sudo().mapped('move_ids_without_package').sudo().write({'state': 'paid'})
                                    picking.sudo().mapped('move_ids_without_package').mapped('move_line_ids').sudo().write({'state': 'paid'})
                                    picking._sh_unreseve_qty()
                                picking.sudo().write({'state': 'paid'})
                                _logger.info(f'Order qqwsadaaafound: {bilal}')

                                for move_line in picking.move_ids_without_package:
                                    related_pos_line = order_obj.lines.filtered(lambda x: x.product_id == move_line.product_id)
                                    new_qty = move_line.product_uom_qty - related_pos_line.qty
                                    if new_qty == 0.0:
                                        move_line.mapped('move_line_ids').sudo().unlink()
                                        move_line.sudo().unlink()
                                    else:
                                        move_line.mapped('move_line_ids').sudo().write({'product_uom_qty': new_qty, 'qty_done': new_qty})
                                        move_line.sudo().write({'product_uom_qty': new_qty, 'quantity_done': new_qty})

                                if picking.move_ids_without_package:
                                    picking.action_confirm()
                                    picking.action_assign()
                                    picking.button_validate()

                    order_obj.sudo().write({'x_delivery_status': 'delivered'})
                    paid = True

                if order_obj.company_id.pos_cancel_invoice:
                    order_obj.mapped('account_move').sudo().write({'state': 'paid'})
                    order_obj.sudo().write({'x_delivery_status': 'delivered'})
                    paid = True

                order_obj.sudo().write({'state': 'paid'})

                order_obj.sudo().write({'x_delivery_status': 'delivered'})
                paid = True
                _logger.info(f'Order qqwsadaaafound: {bilal}')

                return_data.append({
                    'sh_uid': order_id, 
                    'order_id': order_obj.id,
                    'cancel_delete': cancel_delete, 
                    'cancel_draft': cancel_draft, 
                    'paid': paid, 
                    'x_delivery_status': order_obj.x_delivery_status,
                    'payment_method_id': payment_method.mapped('id')

                })
            return return_data

    # @api.model
    # def sh_fronted_mark_cancel(self, order_id):
    #     if order_id:
    #         return_data = []
    #         for each_order_id in order_id:
    #             order_obj = 0
    #             if isinstance(each_order_id, str):
    #                 order_obj = self.search([('sh_uid', '=', each_order_id)])    
    #             else:
    #                 order_obj = self.search([('id', '=', each_order_id)])
    #             cancel_delete = False
    #             cancel_draft = False
    #             cancel_order = False

    #             if order_obj.company_id.pos_cancel_delivery:
    #                 if order_obj.picking_ids:
    #                     for picking in order_obj.picking_ids:
    #                         if picking.sudo().mapped('move_ids_without_package'):
    #                             picking.sudo().mapped('move_ids_without_package').sudo().write(
    #                                 {'state': 'cancel'})
    #                             picking.sudo().mapped('move_ids_without_package').mapped(
    #                                 'move_line_ids').sudo().write({'state': 'cancel'})
    #                             picking._sh_unreseve_qty()

    #                         picking.sudo().write(
    #                             {'state': 'cancel', 'show_mark_as_todo': True})

    #                 elif not order_obj.picking_ids and order_obj.session_id:
    #                     pickings = self.env['stock.picking'].sudo().search(
    #                         [('pos_session_id', '=', order_obj.session_id.id)], limit=1)
    #                     if pickings:
    #                         for picking in pickings:
    #                             if picking.sudo().mapped('move_ids_without_package'):
    #                                 picking.sudo().mapped('move_ids_without_package').sudo().write(
    #                                     {'state': 'cancel'})
    #                                 picking.sudo().mapped('move_ids_without_package').mapped(
    #                                     'move_line_ids').sudo().write({'state': 'cancel'})
    #                                 picking._sh_unreseve_qty()
    #                             picking.sudo().write({'state': 'cancel'})

    #                             for move_line in picking.move_ids_without_package:
    #                                 related_pos_line = order_obj.lines.filtered(
    #                                     lambda x: x.product_id == move_line.product_id)
    #                                 new_qty = move_line.product_uom_qty - related_pos_line.qty
    #                                 if new_qty == 0.0:
    #                                     move_line.mapped(
    #                                         'move_line_ids').sudo().unlink()
    #                                     move_line.sudo().unlink()
    #                                 else:
    #                                     move_line.mapped('move_line_ids').sudo().write(
    #                                         {'product_uom_qty': new_qty, 'qty_done': new_qty})
    #                                     move_line.sudo().write(
    #                                         {'product_uom_qty': new_qty, 'quantity_done': new_qty})

    #                             if picking.move_ids_without_package:
    #                                 picking.action_confirm()
    #                                 picking.action_assign()
    #                                 picking.button_validate()
                   
    #                 cancel_order = True
    #             if order_obj.company_id.pos_cancel_invoice:
    #                 order_obj.mapped('account_move').sudo().write(
    #                     {'state': 'cancel'})
                   
    #                 cancel_order = True
    #             order_obj.sudo().write({'state': 'cancel'})
    #             if order_obj.mapped('payment_ids'):
    #                 payment_ids = order_obj.mapped('payment_ids')
    #                 payment_ids.sudo().unlink()
               
    #             cancel_order = True
    #             return_data.append({'sh_uid': order_id, 'order_id': order_obj.id,
    #                                 'cancel_delete': cancel_delete, 'cancel_draft': cancel_draft, 'cancel_order': cancel_order})
    #         return return_data

    @api.model
    def sh_fronted_mark_cancel(self, order_id):
        if order_id:
            return_data = []
            for each_order_id in order_id:
                order_obj = 0
                if isinstance(each_order_id, str):
                    order_obj = self.search([('sh_uid', '=', each_order_id)])    
                else:
                    order_obj = self.search([('id', '=', each_order_id)])
                
                cancel_delete = False
                cancel_draft = False
                cancel_order = False

                # Cancel stock pickings if applicable
                if order_obj.company_id.pos_cancel_delivery:
                    if order_obj.picking_ids:
                        for picking in order_obj.picking_ids:
                            if picking.sudo().mapped('move_ids_without_package'):
                                picking.sudo().mapped('move_ids_without_package').sudo().write(
                                    {'state': 'cancel'})
                                picking.sudo().mapped('move_ids_without_package').mapped(
                                    'move_line_ids').sudo().write({'state': 'cancel'})
                                picking._sh_unreseve_qty()
                            picking.sudo().write({'state': 'cancel', 'show_mark_as_todo': True})
                    cancel_order = True

                # Cancel invoices if applicable
                if order_obj.company_id.pos_cancel_invoice:
                    for invoice in order_obj.mapped('account_move'):
                        invoice.sudo().write({'state': 'cancel'})
                        invoice.line_ids.sudo().unlink()  # Remove invoice lines if needed
                    cancel_order = True

                # Remove payments
                if order_obj.mapped('payment_ids'):
                    payment_ids = order_obj.mapped('payment_ids')
                    payment_ids.sudo().unlink()

                # Reset order financial values
                order_obj.sudo().write({
                    'tip_amount': 0.0,
                    'amount_total': 0.0,
                    'amount_tax': 0.0,
                    'amount_paid': 0.0,
                    'amount_return': 0.0,
                    'state': 'cancel',
                })

                # Update order lines to ensure consistency
                for line in order_obj.lines:
                    line.sudo().write({
                        'price_subtotal': 0.0,
                        'price_subtotal_incl': 0.0,
                        'tax_ids': [(6, 0, [])],  # Remove taxes from the line
                    })

                # Recompute totals to ensure accuracy
                order_obj.sudo().write({
                    'amount_total': sum(line.price_subtotal for line in order_obj.lines),
                    'amount_tax': sum(line.price_subtotal_incl - line.price_subtotal for line in order_obj.lines),
                })

                cancel_order = True
                return_data.append({
                    'sh_uid': order_id, 
                    'order_id': order_obj.id,
                    'cancel_delete': cancel_delete, 
                    'cancel_draft': cancel_draft, 
                    'cancel_order': cancel_order
                })

            return return_data