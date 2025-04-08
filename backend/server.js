const app = require('./src/app')
const { ApolloServer } = require('apollo-server')
const typeDefs = require('./src/graphql/typeDefs')
const resolvers = require('./src/graphql/resolvers')
const connectDB = require('./src/config/db')
const port = process.env.PORT || 5000

connectDB()

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
})

server.listen().then(({ url }) => {
    console.log(`🚀 Serveur GraphQL prêt sur ${url}`)
})