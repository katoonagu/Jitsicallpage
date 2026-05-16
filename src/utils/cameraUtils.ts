// Утилиты для работы с камерами

export interface CameraDevice {
  deviceId: string;
  label: string;
  type: 'front' | 'back' | 'unknown';
}

/**
 * Получает список всех видеоустройств с определением типа камеры
 */
export async function getAllCameras(): Promise<CameraDevice[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    console.log('📹 [cameraUtils] Найдено видеоустройств:', videoDevices.length);
    console.log('📹 [cameraUtils] Полный список камер:', videoDevices.map(d => ({
      deviceId: d.deviceId,
      label: d.label,
      groupId: d.groupId,
    })));
    
    return videoDevices.map((device, index) => {
      const label = device.label.toLowerCase();
      
      // Определяем тип камеры по label
      let type: 'front' | 'back' | 'unknown' = 'unknown';
      
      if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
        type = 'back';
      } else if (label.includes('front') || label.includes('user') || label.includes('facing')) {
        type = 'front';
      } else if (videoDevices.length === 2) {
        // Если 2 камеры и не удалось определить по label:
        // Обычно первая = фронтальная, вторая = задняя
        type = index === 0 ? 'front' : 'back';
        console.log(`⚠️ [cameraUtils] Не удалось определить тип по label, используем индекс: камера #${index} → ${type}`);
      } else if (videoDevices.length === 1) {
        // Если одна камера - скорее всего фронтальная (десктоп или телефон)
        type = 'front';
      }
      
      console.log(`📹 [cameraUtils] Камера #${index}: "${device.label}" → тип: ${type}, deviceId: ${device.deviceId}`);
      
      return {
        deviceId: device.deviceId,
        label: device.label,
        type,
      };
    });
  } catch (error) {
    console.error('❌ [cameraUtils] Ошибка получения списка камер:', error);
    return [];
  }
}

/**
 * Находит фронтальную камеру
 */
export async function getFrontCamera(): Promise<CameraDevice | null> {
  const cameras = await getAllCameras();
  const frontCamera = cameras.find(c => c.type === 'front');
  
  if (frontCamera) {
    console.log('✅ [cameraUtils] Найдена фронтальная камера:', frontCamera.label);
  } else {
    console.warn('⚠️ [cameraUtils] Фронтальная камера не найдена');
  }
  
  return frontCamera || null;
}

/**
 * Находит заднюю камеру
 */
export async function getBackCamera(): Promise<CameraDevice | null> {
  const cameras = await getAllCameras();
  const backCamera = cameras.find(c => c.type === 'back');
  
  if (backCamera) {
    console.log('✅ [cameraUtils] Найдена задняя камера:', backCamera.label);
  } else {
    console.warn('⚠️ [cameraUtils] Задняя камера не найдена');
  }
  
  return backCamera || null;
}

/**
 * Запрашивает разрешение на камеру (нужно для enumerateDevices)
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ [cameraUtils] Разрешение на камеру получено');
    return true;
  } catch (error) {
    console.error('❌ [cameraUtils] Ошибка запроса разрешения на камеру:', error);
    return false;
  }
}