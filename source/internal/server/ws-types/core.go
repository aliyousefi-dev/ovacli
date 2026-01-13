package wstypes

// Action/Event Based

type WsRequest struct {
	Action  string      `json:"action"`
	Payload interface{} `json:"payload"` // Use interface{} to allow any object
}

// WsResponse is the standard "envelope" for all WebSocket messages
type WsResponse struct {
	Event   string      `json:"event"`   // e.g., "heartbeat", "log_update", "error"
	Status  string      `json:"status"`  // "success" or "error"
	Data    interface{} `json:"data"`    // The actual payload
	Message string      `json:"message"` // Optional human-readable info
}

// NewWsSuccess creates a success event payload
func NewWsSuccess(event string, data interface{}, message string) WsResponse {
	return WsResponse{
		Event:   event,
		Status:  "success",
		Data:    data,
		Message: message,
	}
}

// NewWsError creates an error event payload
func NewWsError(event string, message string) WsResponse {
	return WsResponse{
		Event:   event,
		Status:  "error",
		Message: message,
		Data:    nil,
	}
}
