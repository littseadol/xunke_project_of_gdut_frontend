import request from '@/utils/request'


/**
 * 语音转写API（整合到analysis控制器）
 * @param {Object} data - 包含音频文件和其他参数的对象
 * @param {File|Blob} data.audio_file - 音频文件
 * @param {string} [data.task='transcribe'] - 任务类型
 * @param {string} [data.language='zh'] - 语言代码
 * @param {string} [data.output='txt'] - 输出格式
 * @param {boolean} [data.encode=true] - 是否编码
 * @param {string} [data.initialPrompt] - 初始提示词
 */
// api/ai_analysis.js
// api/ai_analysis.js
export async function transcribeVideo(data) {
  const formData = new FormData();
  
  // 1. 直接添加文件对象
  formData.append('audio_file', data.audio_file);
  
  // 2. 添加其他参数
  formData.append('task', data.task || 'transcribe');
  formData.append('language', data.language || 'zh');
  formData.append('output', data.output || 'txt');
  formData.append('encode', data.encode ?? true);
  
  if (data.initialPrompt) {
    formData.append('initial_prompt', data.initialPrompt);
  }

  // 3. 调试日志
  console.log('FormData内容:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
  }

  try {
    const response = await request({
      url: '/lab/analysis/transcribe',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 600000 // 1分钟超时
    });

    console.log('API响应:', response);
    return response;
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
}

/**
 * 将 File/Blob 转换为 Base64 字符串（去掉前缀）
 */
function fileToBinaryString(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result.split(',')[1]; // 去掉 "data:*;base64," 前缀
      resolve(base64Data);
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}