export default interface NotificationDTO {
  id: string;
  recipient_id: number | null;
  sender_id: number | null;
  title: string;
  description: string;
  link: string | null;
  is_system_generated: boolean;
  type: 'NORMAL' | 'SUCCESS' | 'ERROR' | 'WARNING';
  status: 'SEEN' | 'UNSEEN' | 'VISITED';
  created_at: Date;
}
