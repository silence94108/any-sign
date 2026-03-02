#!/usr/bin/env python3
"""
启动 Web 服务并通过 ngrok 暴露到公网
"""

import asyncio
import subprocess
import sys
from pyngrok import ngrok

def main():
    # 启动 uvicorn 服务
    print("🚀 启动 Web 服务...")
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "web.app:app", "--host", "0.0.0.0", "--port", "8080"],
        cwd="D:/Desktop/chang/any-sign"
    )

    # 等待服务启动
    import time
    time.sleep(3)

    # 创建 ngrok 隧道
    print("🌐 创建 ngrok 隧道...")
    try:
        public_url = ngrok.connect(8080, "http")
        print(f"\n✅ 成功！")
        print(f"📍 本地访问: http://localhost:8080")
        print(f"🌍 公网访问: {public_url}")
        print(f"\n按 Ctrl+C 停止服务\n")

        # 保持运行
        process.wait()
    except Exception as e:
        print(f"❌ 错误: {e}")
        process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    main()
