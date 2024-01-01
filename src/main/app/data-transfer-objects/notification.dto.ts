export default interface NotificationDTO {
  id: string;
  recipient_id: string | null;
  sender_id: string | null;
  title: string;
  description: string;
  link: string | null;
  is_system_generated: boolean;
  type: 'NORMAL' | 'SUCCESS' | 'ERROR' | 'WARNING';
  status: 'SEEN' | 'UNSEEN' | 'VISITED';
  created_at: Date;
}
