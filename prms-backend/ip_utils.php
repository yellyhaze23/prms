<?php
/**
 * IP Address Detection Utilities
 * Handles various server configurations and proxy setups
 */

class IPUtils {
    
    /**
     * Get the real client IP address
     * Handles various proxy configurations and server setups
     */
    public static function getRealClientIP() {
        // List of headers to check in order of preference
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'HTTP_X_REAL_IP',            // Nginx proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                foreach ($ips as $ip) {
                    $ip = trim($ip);
                    
                    // Skip empty or invalid IPs
                    if (empty($ip) || $ip === 'unknown') {
                        continue;
                    }
                    
                    // For localhost/development, try to get external IP
                    if ($ip === '::1' || $ip === '127.0.0.1' || $ip === 'localhost') {
                        continue;
                    }
                    
                    // Validate IP address
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        // Fallback to REMOTE_ADDR
        $fallback_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // Handle localhost cases
        if ($fallback_ip === '::1' || $fallback_ip === '127.0.0.1') {
            // Try to get external IP from various sources
            $external_ip = self::getExternalIP();
            if ($external_ip && $external_ip !== 'unknown') {
                return $external_ip;
            }
            
            // For development, return a more descriptive identifier
            return 'localhost-dev';
        }
        
        return $fallback_ip;
    }
    
    /**
     * Get external IP address for localhost development
     */
    private static function getExternalIP() {
        // Try multiple services to get external IP
        $services = [
            'https://api.ipify.org',
            'https://ipv4.icanhazip.com',
            'https://api.ip.sb/ip',
            'https://checkip.amazonaws.com'
        ];
        
        foreach ($services as $service) {
            $ip = self::fetchExternalIP($service);
            if ($ip && filter_var($ip, FILTER_VALIDATE_IP) !== false) {
                return $ip;
            }
        }
        
        return null;
    }
    
    /**
     * Fetch external IP from a service
     */
    private static function fetchExternalIP($url) {
        $context = stream_context_create([
            'http' => [
                'timeout' => 5,
                'method' => 'GET',
                'header' => 'User-Agent: PRMS/1.0'
            ]
        ]);
        
        $result = @file_get_contents($url, false, $context);
        return $result ? trim($result) : null;
    }
    
    /**
     * Get IP address with additional context
     */
    public static function getIPWithContext() {
        $ip = self::getRealClientIP();
        $context = [];
        
        // Add server information for debugging
        if ($ip === 'localhost-dev' || $ip === '::1' || $ip === '127.0.0.1') {
            $context['server'] = $_SERVER['SERVER_NAME'] ?? 'unknown';
            $context['port'] = $_SERVER['SERVER_PORT'] ?? 'unknown';
            $context['protocol'] = $_SERVER['SERVER_PROTOCOL'] ?? 'unknown';
        }
        
        // Add proxy information if available
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $context['forwarded_for'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
        }
        
        if (!empty($_SERVER['HTTP_X_FORWARDED'])) {
            $context['forwarded'] = $_SERVER['HTTP_X_FORWARDED'];
        }
        
        return [
            'ip' => $ip,
            'context' => $context
        ];
    }
    
    /**
     * Check if IP is from localhost/development
     */
    public static function isLocalhost($ip) {
        return in_array($ip, ['::1', '127.0.0.1', 'localhost', 'localhost-dev']);
    }
    
    /**
     * Get IP geolocation info (basic)
     */
    public static function getIPInfo($ip) {
        if (self::isLocalhost($ip)) {
            return [
                'country' => 'Development',
                'region' => 'Local',
                'city' => 'Localhost',
                'isp' => 'Local Development'
            ];
        }
        
        // For production, you could integrate with IP geolocation services
        return [
            'country' => 'Unknown',
            'region' => 'Unknown',
            'city' => 'Unknown',
            'isp' => 'Unknown'
        ];
    }
}
?>
