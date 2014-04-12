#!/bin/env node

// game
/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),         // Utility resources (logging, object inspection, etc)
  io = require("socket.io"),        // Socket.IO
  Player = require("./Player").Player;  // Player class


/**************************************************
** GAME VARIABLES
**************************************************/
var socket,   // Socket controller
  players;  // Array of connected players


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
  // Create an empty array to store players
  players = [];

  // Set up Socket.IO to listen on port 8000
  socket = io.listen(8000);

  // Configure Socket.IO
  socket.configure(function() {
    // Only use WebSockets
    socket.set("transports", ["websocket"]);

    // Restrict log output
    socket.set("log level", 2);
  });

  // Start listening for events
  setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
  // Socket.IO
  socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
  util.log("New player has connected: "+client.id);

  // Listen for client disconnected
  client.on("disconnect", onClientDisconnect);

  // Listen for new player message
  client.on("new player", onNewPlayer);

  // Listen for move player message
  client.on("move player", onMovePlayer);
};

// Socket client has disconnected
function onClientDisconnect() {
  util.log("Player has disconnected: "+this.id);

  var removePlayer = playerById(this.id);

  // Player not found
  if (!removePlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1);

  // Broadcast removed player to connected socket clients
  this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
  // Create a new player
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;

  // Broadcast new player to connected socket clients
  this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

  // Send existing players to the new player
  var i, existingPlayer;
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
  };
    
  // Add new player to the players array
  players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
  // Find player in array
  var movePlayer = playerById(this.id);

  // Player not found
  if (!movePlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  // Update player position
  movePlayer.setX(data.x);
  movePlayer.setY(data.y);

  // Broadcast updated position to connected socket clients
  this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
  var i;
  for (i = 0; i < players.length; i++) {
    if (players[i].id == id)
      return players[i];
  };
  
  return false;
};


/**************************************************
** RUN THE GAME
**************************************************/
init();































 // end game


var express = require('express'),
  http = require('http');

var airports = require('./data/airports.json');
var flights = require('./data/flights.json');
var reservations = [];

for (var i = 0; i < flights.length; i++) {
  flights[i].originFullName = airports[flights[i].origin].name;
  flights[i].destinationFullName = airports[flights[i].destination].name;
}

function getMatchingFlights (data) {
  return flights.filter(function  (item) {
    return (item.origin === data.origin) &&
      (item.destination === data.destination);
  });
}

var app = express()
  .use(express.bodyParser())
  .use(express.static('public'));

app.get('/airports', function  (req, res) {
  res.json(airports);
});

app.get('/airports/:airport', function (req, res) {
  if (typeof airports[req.params.airport] === 'undefined') {
    res.json(404, {status: 'not found - invalid airport code'});
  } else {
    res.json(airports[req.params.airport]);
  }
});

app.get('/flights', function (req, res) {
  res.json(flights);
});

app.get('/flights/:origin', function (req, res) {
  var with_origin = flights.filter(function  (item) {
    return item.origin === req.params.origin;
  });

  res.json(with_origin);
});

app.get('/flights/:origin/:destination', function (req, res) {
  var matches = getMatchingFlights(req.params);

  res.json(matches);
});

app.get('/reservations', function  (req, res) {
  res.json(reservations);
});

app.post('/reservations', function  (req, res) {
  var matches = getMatchingFlights(req.body);

  if (matches.length) {
    reservations.push(matches[0]);
    res.json(matches[0]);
  } else {
    res.status(404).end();
  }
});

app.get('/*', function  (req, res) {
  res.json(404, {status: 'not found'});
});

var fs      = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = "127.0.0.1";
        self.port      = 8080;
    };



    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        http.createServer(app).listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();


