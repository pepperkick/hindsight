export enum ServerStatus {
  // Server is in unknown state
  UNKNOWN = 'UNKNOWN',

  // Request for server creation received
  INIT = 'INIT',

  // Allocating resources with tre provider
  ALLOCATING = 'ALLOCATING',

  // Wait for first heartbeat
  WAITING = 'WAITING',

  // Server is running but not in use (no players playing)
  IDLE = 'IDLE',

  // Server is running and being used (some players are in it)
  RUNNING = 'RUNNING',

  // Server is going to close state
  CLOSING = 'CLOSING',

  // Allocated resources are removed from the provider
  DEALLOCATING = 'DEALLOCATING',

  // All resources are removed
  CLOSED = 'CLOSED',

  // Server failed to open or close
  FAILED = 'FAILED',
}
