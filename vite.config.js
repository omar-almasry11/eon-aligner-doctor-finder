import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'netlify-functions-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url !== '/.netlify/functions/doctors') return next()

            const BASE_ID = 'appR8sQwaCx42Z6GP'
            const TABLE_NAME = 'Eon Doctors Database'

            try {
              const allRecords = []
              let offset = null

              do {
                const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`)
                if (offset) url.searchParams.set('offset', offset)

                const response = await fetch(url.toString(), {
                  headers: {
                    'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                })

                if (!response.ok) throw new Error(`Airtable error: ${response.status}`)

                const data = await response.json()
                allRecords.push(...data.records)
                offset = data.offset
              } while (offset)

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(allRecords))
            } catch (error) {
              console.error('Error fetching doctors:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch doctors' }))
            }
          })
        },
      },
    ],
  }
})
