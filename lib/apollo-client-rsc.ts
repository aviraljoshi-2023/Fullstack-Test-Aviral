import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"

const getBaseUrl = () => {
  // If deployed to Vercel, use the VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Otherwise, use the local development URL
  const port = process.env.PORT || 3000
  return `http://localhost:${port}`
}

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // The URI needs to be absolute for server-side fetching
      uri: `${getBaseUrl()}/api/graphql`,
    }),
  })
})
