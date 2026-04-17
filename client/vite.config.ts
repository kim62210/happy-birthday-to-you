import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { connect } from 'net'

const COLYSEUS_BACKEND = { host: '127.0.0.1', port: 2567 }

function colyseusProxy(): Plugin {
  return {
    name: 'colyseus-ws-proxy',
    configureServer(server) {
      server.httpServer?.on('upgrade', (req, socket, head) => {
        const url = req.url || ''
        const segments = url.split('?')[0].split('/').filter(Boolean)
        if (segments.length < 2) return

        const proxy = connect(COLYSEUS_BACKEND.port, COLYSEUS_BACKEND.host, () => {
          const headers = Object.entries(req.headers)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('\r\n')
          proxy.write(`GET ${url} HTTP/${req.httpVersion}\r\n${headers}\r\n\r\n`)
          if (head.length > 0) proxy.write(head)
          socket.pipe(proxy).pipe(socket)
        })

        proxy.on('error', () => socket.destroy())
        socket.on('error', () => proxy.destroy())
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), colyseusProxy()],
  server: {
    port: 3001,
    proxy: {
      '/matchmake': {
        target: `http://${COLYSEUS_BACKEND.host}:${COLYSEUS_BACKEND.port}`,
        changeOrigin: true,
        ws: true,
      },
      '/colyseus': {
        target: `http://${COLYSEUS_BACKEND.host}:${COLYSEUS_BACKEND.port}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
