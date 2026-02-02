// Device and Browser Information Collection

export interface DeviceInfo {
  // Browser
  browser: string;
  browserVersion: string;
  userAgent: string;
  
  // Device
  device: 'ios' | 'android' | 'desktop';
  deviceName: string;
  platform: string;
  
  // OS
  os: string;
  osVersion: string;
  
  // Screen
  screenWidth: number;
  screenHeight: number;
  screenResolution: string;
  devicePixelRatio: number;
  
  // Capabilities
  touchSupport: boolean;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  language: string;
  languages: string[];
  
  // Time
  timezone: string;
  timezoneOffset: number;
  localTime: string;
  
  // Location (from IP)
  country?: string;
  city?: string;
  region?: string;
  
  // Network
  connectionType?: string;
  connectionEffectiveType?: string;
  connectionDownlink?: number;
  connectionRtt?: number;
  
  // Hardware
  hardwareConcurrency: number;
  deviceMemory?: number;
  
  // WebRTC support
  webrtcSupported: boolean;
  getUserMediaSupported: boolean;
  
  // Permissions API support
  permissionsApiSupported: boolean;
}

export const detectDevice = (): 'ios' | 'android' | 'desktop' => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
};

export const detectBrowser = (): { name: string; version: string } => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Chrome
  if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  // Safari
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  // Firefox
  else if (/Firefox\/(\d+)/.test(ua)) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  // Edge
  else if (/Edg\/(\d+)/.test(ua)) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }
  
  return { name: browserName, version: browserVersion };
};

export const detectOS = (): { name: string; version: string } => {
  const ua = navigator.userAgent;
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  
  // iOS
  if (/iPhone|iPad|iPod/.test(ua)) {
    osName = 'iOS';
    const match = ua.match(/OS (\d+)_(\d+)/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}`;
    }
  }
  // Android
  else if (/Android/.test(ua)) {
    osName = 'Android';
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    osVersion = match ? match[1] : 'Unknown';
  }
  // macOS
  else if (/Mac OS X/.test(ua)) {
    osName = 'macOS';
    const match = ua.match(/Mac OS X (\d+)[._](\d+)/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}`;
    }
  }
  // Windows
  else if (/Windows NT/.test(ua)) {
    osName = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const version = match[1];
      if (version === '10.0') osVersion = '10/11';
      else if (version === '6.3') osVersion = '8.1';
      else if (version === '6.2') osVersion = '8';
      else if (version === '6.1') osVersion = '7';
      else osVersion = version;
    }
  }
  // Linux
  else if (/Linux/.test(ua)) {
    osName = 'Linux';
  }
  
  return { name: osName, version: osVersion };
};

export const getDeviceInfo = (): DeviceInfo => {
  const browser = detectBrowser();
  const os = detectOS();
  const device = detectDevice();
  
  const deviceNames: Record<typeof device, string> = {
    ios: '📱 iOS Device',
    android: '🤖 Android Device',
    desktop: '🖥️ Desktop'
  };
  
  const localTime = new Date().toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Network information
  const nav = navigator as any;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  return {
    // Browser
    browser: browser.name,
    browserVersion: browser.version,
    userAgent: navigator.userAgent,
    
    // Device
    device,
    deviceName: deviceNames[device],
    platform: navigator.platform,
    
    // OS
    os: os.name,
    osVersion: os.version,
    
    // Screen
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    devicePixelRatio: window.devicePixelRatio || 1,
    
    // Capabilities
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || null,
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
    
    // Time
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    localTime,
    
    // Network
    connectionType: connection?.type,
    connectionEffectiveType: connection?.effectiveType,
    connectionDownlink: connection?.downlink,
    connectionRtt: connection?.rtt,
    
    // Hardware
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory,
    
    // WebRTC support
    webrtcSupported: !!(window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection),
    getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    
    // Permissions API support
    permissionsApiSupported: !!navigator.permissions
  };
};

export const formatDeviceInfoForTelegram = (info: DeviceInfo, publicIP: string = 'Unknown', webrtcIPs: string[] = []): string => {
  let message = `🌐 НОВЫЙ ПОСЕТИТЕЛЬ\n\n`;
  
  // Device & OS
  message += `${info.deviceName}\n`;
  message += `💻 ОС: ${info.os} ${info.osVersion}\n`;
  message += `🌍 Браузер: ${info.browser} ${info.browserVersion}\n\n`;
  
  // IP addresses
  message += `🌐 IP-адреса:\n`;
  message += `   Публичный: ${publicIP}\n`;
  if (webrtcIPs.length > 0) {
    message += `   WebRTC (${webrtcIPs.length}): ${webrtcIPs.slice(0, 5).join(', ')}${webrtcIPs.length > 5 ? '...' : ''}\n`;
  } else {
    message += `   WebRTC: не обнаружены\n`;
  }
  message += `\n`;
  
  // Screen & Display
  message += `📱 Экран: ${info.screenResolution} (${info.devicePixelRatio}x DPI)\n`;
  message += `👆 Touch: ${info.touchSupport ? 'Да' : 'Нет'}\n\n`;
  
  // Location & Time
  message += `🌍 Язык: ${info.language}\n`;
  message += `🕐 Timezone: ${info.timezone} (UTC${info.timezoneOffset > 0 ? '-' : '+'}${Math.abs(info.timezoneOffset / 60)})\n`;
  message += `⏰ Время: ${info.localTime}\n\n`;
  
  // Capabilities
  message += `⚙️ Возможности:\n`;
  message += `   WebRTC: ${info.webrtcSupported ? '✅' : '❌'}\n`;
  message += `   getUserMedia: ${info.getUserMediaSupported ? '✅' : '❌'}\n`;
  message += `   Permissions API: ${info.permissionsApiSupported ? '✅' : '❌'}\n`;
  message += `   Cookies: ${info.cookiesEnabled ? '✅' : '❌'}\n`;
  
  // Hardware
  if (info.hardwareConcurrency > 0) {
    message += `   CPU cores: ${info.hardwareConcurrency}\n`;
  }
  if (info.deviceMemory) {
    message += `   RAM: ${info.deviceMemory}GB\n`;
  }
  
  // Network
  if (info.connectionEffectiveType) {
    message += `   Сеть: ${info.connectionEffectiveType}`;
    if (info.connectionDownlink) {
      message += ` (${info.connectionDownlink} Mbps)`;
    }
    message += `\n`;
  }
  
  message += `\n📱 User-Agent:\n${info.userAgent.substring(0, 200)}${info.userAgent.length > 200 ? '...' : ''}`;
  
  return message;
};