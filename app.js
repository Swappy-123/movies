const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const app = express()
const dbPath = path.join(__dirname, 'moviesData.db')
app.use(express.json())
let database = null
const initializeDbAndServer = async () => {
  try {
    database = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3001, () => {
      console.log('Server Is running on http://localhost:3001')
    })
  } catch (error) {
    console.log(`Data base Error is ${error}`)
    process.exit(1)
  }
}
initializeDbAndServer()

//API 1 - GET

const movieObject = objectItem => {
  return {
    movieName: objectItem.movie_name,
  }
}

app.get('/movies/', async (request, response) => {
  const allMoviesQuery = `select movie_name from movie;`
  const allMoviesQueryResponse = await database.all(allMoviesQuery)
  response.send(allMoviesQueryResponse.map(each => movieObject(each)))
})

//API 2 - POST

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const createQuery = `
  insert into movie(director_id, movie_name, lead_actor)
  values(${directorId}, '${movieName}', '${leadActor}');
  `
  await database.run(createQuery)
  response.send('Movie Successfully Added')
})

//API 3 - GET

const objectMethod = item => {
  return {
    movieId: item.movie_id,
    directorId: item.director_id,
    movieName: item.movie_name,
    leadActor: item.lead_actor,
  }
}

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const idQuery = `
  select * from
  movie where movie_id = ${movieId};
  `
  const idQueryResponse = await database.get(idQuery)
  response.send(objectMethod(idQueryResponse))
})

//API 4 - PUT

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putQuery = `
  update movie set director_id = ${directorId}, 
  movie_name = '${movieName}',
  lead_actor = '${leadActor}' where movie_id = ${movieId}
  ;
  `
  const putQueryResponse = await database.run(putQuery)
  response.send('Movie Details Updated')
})

//API 5 - DELETE

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  delete from movie where movie_id = ${movieId};
  `
  const deleteQueryResponse = await database.run(deleteQuery)
  response.send('Movie Removed')
})

//API 6 - GET DIRECTOR TABLE

const directorObject = object => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  }
}

app.get('/directors/', async (request, response) => {
  const allDirector = `
  select * from director; 
  `
  const allDirectorResponse = await database.all(allDirector)
  response.send(allDirectorResponse.map(every => directorObject(every)))
})

//API 7 - GET

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorQuery = `
  select movie_name as movieName from movie where director_id = ${directorId};
  `
  const directorQueryResponse = await database.all(directorQuery)
  response.send(directorQueryResponse)
})

module.exports = app
