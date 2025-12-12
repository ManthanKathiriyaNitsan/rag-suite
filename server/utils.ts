import os from "os";

/**
 * Gets the local network IP address (non-localhost)
 * Returns the first IPv4 address found on network interfaces
 */
export function getNetworkIP(): string {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (!networkInterface) continue;
    
    for (const iface of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  // Fallback to localhost if no network IP found
  return "127.0.0.1";
}

