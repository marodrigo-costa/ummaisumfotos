export const rpName = 'Um Mais Um Fotos'

// Em produção, deve ser o domínio exato (ex: ummaisumfotos.com.br)
// Em desenvolvimento, 'localhost'
export const getRpID = (request: Request) => {
  const url = new URL(request.url)
  return url.hostname
}

export const getExpectedOrigin = (request: Request) => {
  const url = new URL(request.url)
  return url.origin // ex: http://localhost:3000 ou https://ummaisumfotos.com.br
}
