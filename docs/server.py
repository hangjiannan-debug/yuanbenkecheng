#!/usr/bin/env python3
"""
园本课程建设平台 · 开发服务器
- 提供静态文件服务（demo/ 目录）
- /api/chat 代理到 DeepSeek API
"""
import http.server
import json
import os
import urllib.request
import urllib.error
import ssl

# 当前脚本所在目录（demo/）
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# 读取 .env 文件（在 demo/ 目录下）
def load_env(path=None):
    if path is None:
        path = os.path.join(SCRIPT_DIR, '.env')
    env = {}
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, val = line.partition('=')
                    env[key.strip()] = val.strip()
    return env

ENV = load_env()
API_KEY = ENV.get('DEEPSEEK_API_KEY', '')
BASE_URL = ENV.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
MODEL = ENV.get('DEEPSEEK_MODEL', 'deepseek-chat')

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            self.handle_chat()
        else:
            self.send_error(404)

    def handle_chat(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))

            messages = body.get('messages', [])
            temperature = body.get('temperature', 0.7)
            max_tokens = body.get('max_tokens', 4096)

            req_data = json.dumps({
                'model': MODEL,
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            }).encode('utf-8')

            url = BASE_URL.rstrip('/') + '/chat/completions'
            req = urllib.request.Request(url, data=req_data)
            req.add_header('Content-Type', 'application/json')
            req.add_header('Authorization', 'Bearer ' + API_KEY)

            ctx = ssl.create_default_context()
            resp = urllib.request.urlopen(req, context=ctx, timeout=120)
            result = json.loads(resp.read().decode('utf-8'))

            content = ''
            if 'choices' in result and len(result['choices']) > 0:
                content = result['choices'][0]['message'].get('content', '')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'content': content, 'success': True}).encode('utf-8'))

        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8') if e.fp else ''
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': 'API Error ' + str(e.code) + ': ' + err_body[:200]
            }).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # 切换到 demo/ 目录，确保静态文件服务正确
    os.chdir(SCRIPT_DIR)

    PORT = int(os.environ.get('PORT', 8080))
    server = http.server.HTTPServer(('0.0.0.0', PORT), APIHandler)
    print('========================================')
    print('  园本课程建设平台 · Demo 服务器')
    print('  静态文件目录: ' + SCRIPT_DIR)
    print('========================================')
    print('  访问地址: http://localhost:' + str(PORT) + '/app.html')
    print('  API 代理: ' + BASE_URL + '/chat/completions')
    print('  模型: ' + MODEL)
    print('========================================')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
        server.server_close()
