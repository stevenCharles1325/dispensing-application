type IResponseCode =
  | 'AUTH_OK'
  | 'AUTH_ERR'
  | 'AUTH_WAIT'
  | 'VALIDATION_OK'
  | 'VALIDATION_ERR'
  | 'VALIDATION_WAIT'
  | 'PEER_SYNC_OK'
  | 'PEER_SYNC_ERR'
  | 'PEER_SYNC_WAIT'
  | 'PEER_REQ_OK'
  | 'PEER_REQ_WAIT'
  | 'PEER_REQ_ERR'
  | 'PEER_REQ_INVALID'
  | 'PEER_REQ_UNAUTH'
  | 'REQ_OK'
  | 'REQ_WAIT'
  | 'REQ_ERR'
  | 'REQ_INVALID' // If local action does not exist
  | 'REQ_UNAUTH' // If local user is not authorized to perform the action
  | 'SYS_ERR';

export default IResponseCode;
