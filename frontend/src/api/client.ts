import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message ?? 'Unknown error'
    return Promise.reject(Object.assign(err, { message }))
  },
)
