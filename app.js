const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Database connected successfully!");
    app.listen(3000, () => {
      console.log("Server listen at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// API 1: Get all movies
app.get("/movies/", async (request, response) => {
  const movieQueries = `SELECT movie_name FROM movie`;
  const movies = await db.all(movieQueries);
  response.send(
    movies.map((element) => {
      return { movieName: element.movie_name };
    })
  );
});

app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  console.log(moviesDetails);

  const { directorId, movieName, leadActor } = moviesDetails;

  const moviesQuires = `

      insert into movie (director_id,movie_name,lead_actor)

      values

      (

         ${directorId},

         '${movieName}',

         '${leadActor}'

      )

      `;

  const dbResponse = await db.run(moviesQuires);

  response.send("Movie Successfully Added");
});

const newMovieResult = (e) => {
  return {
    movieId: e.movie_id,
    directorId: e.director_id,
    movieName: e.movie_name,
    leadActor: e.lead_actor,
  };
};

// API 3: Get a movie by ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQueries = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ?;
  `;
  const movieResult = await db.get(getMovieQueries, [movieId]);

  response.send(newMovieResult(movieResult));

  console.log(movieId);
  console.log(movieResult);
});

// Api 5: Update a movie by ID
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = request.body;
  const { directorId, movieName, leadActor } = getMovieDetails;
  const getMoviesQuires = `
      UPDATE movie 
      SET 
      director_id = ?,
      movie_name = ?,
      lead_actor = ?
      WHERE movie_id = ?
    `;
  const getMoviesQueriesResult = await db.run(getMoviesQuires, [
    directorId,
    movieName,
    leadActor,
    movieId,
  ]);
  console.log(getMoviesQueriesResult);
  response.send("Movie Details Updated");
});

// API 5: Delete a movie by ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getDeleteQueries = `
  delete from movie 
  where 
  movie_id = ${movieId}
  `;
  const getDeleteQueriesResult = await db.run(getDeleteQueries);
  response.send("Movie Removed");
});

// API 6: Get all directors

app.get("/directors/", async (request, response) => {
  const getDirectorsQueries = `
        select * from director 
        
        `;
  const getDirectorsResult = await db.all(getDirectorsQueries);
  response.send(
    getDirectorsResult.map((e) => {
      return { directorId: e.director_id, directorName: e.director_name };
    })
  );
});

// API 7: Get movies by director ID
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQueries = ` 
         select movie_name from movie 
         where 
         director_id = ?
       
       `;
  const getMoviesResult = await db.all(getMovieQueries, [directorId]);
  response.send(
    getMoviesResult.map((e) => {
      return { movieName: e.movie_name };
    })
  );
});
module.exports = app;
