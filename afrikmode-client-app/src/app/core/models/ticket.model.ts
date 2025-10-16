import { User } from './user.model';

export interface Ticket {
    id: string;
    ticket_number: string;
    user_id: string;
    user?: User;
    subject: string;
    description: string;
    category: 'order_issue' | 'payment_problem' | 'account_help' | 'technical_issue' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigned_agent_id?: string;
    assigned_agent?: User;
    messages: TicketMessage[];
    attachments: TicketAttachment[];
    created_at: string;
    updated_at: string;
    resolved_at?: string;
  }
  
  export interface TicketMessage {
    id: string;
    ticket_id: string;
    user_id: string;
    user?: User;
    message: string;
    is_internal: boolean;
    attachments: TicketAttachment[];
    created_at: string;
  }
  
  export interface TicketAttachment {
    id: string;
    filename: string;
    url: string;
    size: number;
    mime_type: string;
    created_at: string;
  }