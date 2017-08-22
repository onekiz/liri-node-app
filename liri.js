var request = require("request");
var twitter = require("twitter");
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");
var fs = require("fs");
var Keys = require("./keys.js");
var input = [process.argv[2], ""];
//var user = {};



for (var i = 3; i<process.argv.length; i++){
    if (i !== process.argv.length-1){
      input [1] += process.argv[i] + " ";
    }
    else{
      input [1] += process.argv[i];
    }
}


//Taking data by using promt
////////////////////////////
// inquirer.prompt([
//
//   // Here we create a basic text prompt.
//   {
//     type: "input",
//     message: "What is your favorite song?",
//     name: "song"
//   },
//
//   {
//     type: "input",
//     message: "What is your favorite movie?",
//     name: "movie"
//   },
//   // Here we ask the user to confirm.
//   {
//     type: "confirm",
//     message: "Do you want to display your tweets",
//     name: "confirmTweet",
//     default: true
//   }
//
// ]).then(function(userInfo) {
//     console.log(userInfo);
//     for (var key in userInfo){
//       user[key] = userInfo[key];
//     }
//     if (userInfo.confirmTweet){
//       twitterCall();
//       OmbdapiCall(userInfo.movie);
//       spotifyCall(userInfo.song);
//     }
//   });



var client = new twitter({
  consumer_key: Keys.twitterKeys.consumer_key,
  consumer_secret: Keys.twitterKeys.consumer_secret,
  access_token_key: Keys.twitterKeys.access_token_key,
  access_token_secret: Keys.twitterKeys.access_token_secret
});

function twitterCall(){
    client.get('statuses/user_timeline', function(error, tweets, response) {
      if (!error) {


          for (var i = 0; i<tweets.length; i++){
          console.log(tweets[i].text);
          logInfo(i, tweets[i].text);
          }
      }
      else {
        console.log(error);
      }
    });
}



function OmbdapiCall(inputMovie){
// Then run a request to the OMDB API with the movie specified
    request("http://www.omdbapi.com/?t="+inputMovie+"&y=&plot=short&apikey=40e9cece", function(error, response, body) {

      // If the request is successful (i.e. if the response status code is 200)
      if (!error && response.statusCode === 200) {
          var movie = {
                Title: JSON.parse(body).Title,
                Year: JSON.parse(body).Year,
                Country: JSON.parse(body).Country,
                Actors: JSON.parse(body).Actors,
                Language: JSON.parse(body).Language,
                Plot: JSON.parse(body).Plot,
                imdbRating: JSON.parse(body).imbdRating,
                Rating: JSON.parse(body).Ratings[1].Source + " Value: " + JSON.parse(body).Ratings[1].Value
          }

            for (var keys in movie){
              console.log(keys + ": " + movie[keys]);
              logInfo(keys, movie[keys]);
            }
      }
    });
}


var spotify = new Spotify({
  id: Keys.spotifyKeys.id,
  secret: Keys.spotifyKeys.secret
});


 function spotifyCall(inputSong){
    spotify.search({ type: 'track', query: inputSong, limit: 1 }, function(err, data) {
      if (!err) {
        var movie = {
          AlbumArtist: data.tracks.items[0].album.artists[0].name,
          Artists: data.tracks.items[0].artists[0].name,
          Href: data.tracks.href,
          TrackName: data.tracks.items[0].name,
          Popularity: data.tracks.items[0].popularity,
          Type: data.tracks.items[0].type,
          TrackNumber: data.tracks.items[0].track_number
        };
        console.log(data);
        for (var keys in movie){
          console.log(keys + ": " + movie[keys]);
          logInfo(keys, movie[keys]);
        }
      }
      else {
        return console.log('Error occurred: ' + err);
      }

    });
}

function defaultCall(){
    fs.readFile("random.txt", "utf8", function(err, data){
      if(err){
        console.log(err);
      }
      else{
        spotifyCall(data);
      }

    });

}

function logInfo(keys, value) {

    fs.appendFile("log.txt", keys + ": " +value + "\n", "utf8", function(err){
      if (err){
        console.log(err);
      }
    });
}

//
//
switch (input[0]){

  case "my-tweets":
    twitterCall();
  break;

  case "spotify-this-song":
    spotifyCall(input[1]);
  break;

  case "movie-this":
    OmbdapiCall(input[1]);
  break;

  case "do-what-it-says":
    defaultCall();
  break;

  default:
  console.log("No valid entry");
}
