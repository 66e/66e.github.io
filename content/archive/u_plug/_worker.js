export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 检查是否是静态资源请求
    if (isStaticAsset(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname.startsWith('/')) {
      // 修改目标 hostname
      url.hostname = env.PROXY_URL;

      // 创建新请求前的关键步骤：清理和修改请求头
      const headers = new Headers(request.headers);

      // 1. 移除代理特征头
      headers.delete('X-Forwarded-For');
      headers.delete('X-Forwarded-Proto');
      headers.delete('X-Forwarded-Host');
      headers.delete('X-Real-IP');
      headers.delete('CF-Connecting-IP');
      headers.delete('CF-IPCountry');

      // 2. 修改 User-Agent（伪装为真实浏览器）
      headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // 3. 处理 Referer（重要！）
      const referer = headers.get('referer');
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          // 如果 referer 是来自你的代理域名，改成目标域名
          if (refererUrl.hostname === request.headers.get('host')) {
            refererUrl.hostname = env.PROXY_URL;
            headers.set('referer', refererUrl.toString());
          }
        } catch (e) {
          // 如果 referer 格式不对，就删除它
          headers.delete('referer');
        }
      }

      // 4. 添加必要的浏览器头
      headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
      headers.set('Accept-Language', 'en-US,en;q=0.9');
      headers.set('Accept-Encoding', 'gzip, deflate, br');
      headers.set('Sec-Fetch-Dest', 'document');
      headers.set('Sec-Fetch-Mode', 'navigate');
      headers.set('Sec-Fetch-Site', 'none');
      headers.set('Upgrade-Insecure-Requests', '1');

      // 5. 处理 Origin 和 Host
      headers.set('Host', env.PROXY_URL);
      headers.delete('Origin');

      // 6. 移除或修改 Cookie（可选，但有时很关键）
      // 如果是跨域请求，某些网站可能拒绝 Cookie
      const cookie = headers.get('cookie');
      if (cookie && shouldCleanCookie(url.pathname)) {
        // 保留某些必要的 cookie，删除其他的
        const cleanedCookie = cleanCookie(cookie);
        if (cleanedCookie) {
          headers.set('cookie', cleanedCookie);
        } else {
          headers.delete('cookie');
        }
      }

      // 7. 添加安全相关的响应头（防御 Cloudflare 检测）
      const new_request = new Request(url, {
        method: request.method,
        headers: headers,
        body: request.body,
        cf: {
          cacheTtl: 3600,
          // 不使用 Cloudflare 的安全特性会让你看起来更像真实用户
          mirage: false,
          minify: {
            javascript: false,
            css: false,
            html: false,
          }
        }
      });

      const response = await fetch(new_request);

      // 处理响应
      return handleResponse(response, request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

/**
 * 判断是否为静态资源
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

/**
 * 判断是否应该清理 Cookie
 */
function shouldCleanCookie(pathname) {
  // 某些路径可能不需要 cookie
  const noCookiePaths = ['/api/', '/download/'];
  return noCookiePaths.some(path => pathname.startsWith(path));
}

/**
 * 清理 Cookie（移除某些被识别为代理的标记）
 */
function cleanCookie(cookieString) {
  if (!cookieString) return '';
  
  const cookies = cookieString.split(';').map(c => c.trim());
  const cleaned = cookies.filter(cookie => {
    // 删除可能暴露代理身份的 cookie
    const isSuspicious = [
      'proxy=',
      'cloudflare=',
      'cf_',
      '__cf',
      'x-forwarded',
    ].some(keyword => cookie.toLowerCase().includes(keyword));
    
    return !isSuspicious;
  });

  return cleaned.join('; ');
}

/**
 * 处理响应，重写必要的内容
 */
async function handleResponse(response, originalRequest, env) {
  const contentType = response.headers.get('content-type') || '';

  // 如果是 HTML 内容，需要重写链接
  if (contentType.includes('text/html')) {
    let html = await response.text();
    html = rewriteResponseHTML(html, env);

    // 创建新的响应
    const newResponse = new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });

    // 添加安全头到响应
    addSecurityHeaders(newResponse.headers);
    return newResponse;
  }

  // 非 HTML 内容，直接添加安全头后返回
  addSecurityHeaders(response.headers);
  return response;
}

/**
 * 重写响应中的 HTML（处理跳转、表单等）
 */
function rewriteResponseHTML(html, env) {
  // 重写绝对 URL
  const targetUrl = env.PROXY_URL;
  const currentHost = env.WORKER_URL; // 你的 Worker 域名

  // 替换 JavaScript 中的跳转
  html = html.replace(new RegExp(`https?://${targetUrl}`, 'g'), `https://${currentHost}`);
  
  // 替换 href 中的 URL（但保留相对路径）
  html = html.replace(/href=["']https?:\/\/[^"']+["']/g, (match) => {
    if (match.includes(targetUrl)) {
      return match.replace(targetUrl, currentHost);
    }
    return match;
  });

  return html;
}

/**
 * 添加安全头，避免被识别为钓鱼网站
 */
function addSecurityHeaders(headers) {
  // 标准安全头
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // 移除可能暴露代理的头
  headers.delete('Server');
  headers.delete('X-Powered-By');
  headers.delete('X-AspNet-Version');
  
  // 添加合理的缓存策略
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=3600');
  }

  // 隐藏 Cloudflare 标记（重要！）
  headers.delete('CF-RAY');
  headers.delete('CF-Cache-Status');
  
  return headers;
}
