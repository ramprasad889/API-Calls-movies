const express = require("express");

const app = express();

app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// const convertDbObjectToResponseObject=(dbObject)=>{
//     return {
//         movieName:dbObject.movie_name
//     };
// }

//API 1 Getting All movies List

app.get("/movies/", async (request, response) => {
  const getMovieListQuery = `
    SELECT * FROM movie`;
  const dbResponse = await database.all(getMovieListQuery);

  response.send(
    dbResponse.map((dbObject) => {
      return {
        movieName: dbObject.movie_name,
      };
    })
  );
});

//API 2 Add Movie Details

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
//console.log(directorId,movieName);  
  const addMovieQuery = `
    INSERT INTO 
        movie (director_id,movie_name,lead_actor)
    values 
        (${directorId},'${movieName}','${leadActor}');`;

  await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3 Get Particular Movie Details
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //console.log((parseInt(movieId))); 
  //console.log(movieId);
  const Query = `
        SELECT 
            * 
        FROM 
            movie
        WHERE 
            movie_id =${movieId};`;
        
  const dbObject = await database.get(Query);
   //console.log(dbObject);
   //console.log(dbObject.movie_id);
  if (dbObject === undefined) {
    response.send("Movie Not Found");
  } else {
    response.send({
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    });
  }
});

//API 4 Updating Particular Movie Details
app.put('/movies/:movieId/',async(request,response)=>{
    const {movieId}=request.params;
    const {directorId,movieName,leadActor}=request.body;
    //console.log(movieId,directorId,movieName,leadActor);
    const Query=`
    UPDATE 
        movie
    SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    WHERE movie_id =${movieId}; `;

    const dbObject=await database.run(Query);
    //console.log('Movie Details Updated')
    response.send('Movie Details Updated')
});

//API 5 Remove movie Details
app.delete('/movies/:movieId/',async(request,response)=>{
    const {movieId}=request.params;
    const Query= `DELETE FROM movie where movie_id = ${movieId}`;
    await database.run(Query);
    //console.log("Movie Removed");
    response.send("Movie Removed")
});

//API 6 get All DirectorID's From director Table
app.get("/directors/", async (request, response) => {
  const getDirectorsListQuery = `
    SELECT * FROM director`;
  const dbResponse = await database.all(getDirectorsListQuery);

  response.send(
    dbResponse.map((dbObject) => {
      return {
        directorId: dbObject.director_id,
        directorName:dbObject.director_name,
      };
    })
  );
});

//API 7 list of all movie names directed by a specific director

app.get('/directors/:directorId/movies/',async(request,response)=>{
    const {directorId}=request.params;
    const Query=`
        select 
            movie_name
        FROM 
            movie
        WHERE 
            director_id=${directorId};`;
    const dbObject=await database.all(Query);
    response.send(
    dbObject.map((Obj) => {
      return {movieName:Obj.movie_name};
    })
  );
});

module.exports=app;