//const mongojs = require("mongojs");
const db = null// mongojs("localhost:27017/myGame", ["account", "progress"]);

const express = require("express");
const app = express();
const serv = require("http").Server(app);
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(process.env.PORT || 2000);

const SOCKET_LIST = {};
TILE_SIZE = 96;
const WIDTH = 1705;
const HEIGHT = 768;
initPack = {
  player: [],
  bullet: [],
  torch: [],
  coffin: [],
  enemy: [],
  artifact: []
};

removePack = { player: [], bullet: [], enemy: [], artifact: [] };
require("./entity");
require("./torch");
require("./coffin");
require("./artifact");
require("./map");
require("./player");
require("./enemy");
Player.onConnect = function (socket) {
  const player = Player(socket.id);
  socket.on("keyPress", function (data) {
    if (data.inputId === "left") player.pressingLeft = data.state;
    else if (data.inputId === "right") player.pressingRight = data.state;
    else if (data.inputId === "down") player.pressingDown = data.state;
    else if (data.inputId === "up") player.pressingUp = data.state;
    else if (data.inputId === "attack") player.pressingAttack = data.state;
    else if (data.inputId === "mouseAngle") player.mouseAngle = data.state;
  });
  socket.on("changeSkill", function (data) {
    if (data.inputId === "1") {
      if (
        player.firstSkills.indexOf(player.firstSkill) <
        player.firstSkills.length - 1
      ) {
        player.firstSkill =
          player.firstSkills[player.firstSkills.indexOf(player.firstSkill) + 1];
      } else {
        player.firstSkill = player.firstSkills[0];
      }
    }
  });

  socket.emit("init", {
    selfId: socket.id,
    player: Player.getAllInitPack(),
    bullet: Bullet.getAllInitPack(),
    torch: Torch.getAllInitPack(),
    coffin: Coffin.getAllInitPack(),
    enemy: Enemy.getAllInitPack(),
    artifact: Artifact.getAllInitPack()
  });
};

Player.onDisconnect = function (socket) {
  delete Player.list[socket.id];
  removePack.player.push(socket.id);
};

require("./bullet");

const DEBUG = true;

const USERS = {
  //username:password
};

const isValidPassword = function (data, cb) {
  return cb(true)
  db.account.find(
    { username: data.username, password: data.password },
    function (err, res) {
      if (res[0]) {
        cb(true);
      } else {
        cb(false);
      }
    }
  );
};

const isUsernameTaken = function (data, cb) {
  return cb(false)
  db.account.find({ username: data.username }, function (err, res) {
    if (res[0]) {
      cb(true);
    } else {
      cb(false);
    }
  });
};

const addUser = function (data, cb) {
  return cb()
  db.account.insert(
    { username: data.username, password: data.password },
    function (err) {
      cb();
    }
  );
};

const io = require("socket.io")(serv, {});
io.sockets.on("connection", function (socket) {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on("signIn", function (data) {
    isValidPassword(data, function (res) {
      if (res) {
        Player.onConnect(socket);
        socket.emit("signInResponse", { success: true });
      } else {
        socket.emit("signInResponse", { success: false });
      }
    });
  });

  socket.on("signUp", function (data) {
    isUsernameTaken(data, function (res) {
      if (res) {
        socket.emit("signUpResponse", { success: false });
      } else {
        addUser(data, function () {
          socket.emit("signUpResponse", { success: true });
        });
      }
    });
  });

  socket.on("disconnect", function () {
    playerCounter -= 1;
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });

  socket.on("sendMsgToServer", function (data) {
    const playerName = ("" + socket.id).slice(2, 7);
    for (let i in SOCKET_LIST) {
      SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
    }
  });

  socket.on("evalServer", function (data) {
    if (!DEBUG) return;
    const res = eval(data);
    socket.emit("evalAnswer", res);
  });
});

setInterval(function () {
  const pack = {
    player: Player.update(),
    bullet: Bullet.update(),
    coffin: Coffin.superUpdate(),
    enemy: Enemy.superUpdate(),
    artifact: Artifact.superUpdate()
    //artifact: Artifact.update()
  };

  for (let i in SOCKET_LIST) {
    const socket = SOCKET_LIST[i];
    socket.emit("init", initPack);
    socket.emit("update", pack);
    socket.emit("remove", removePack);
  }
  initPack.player = [];
  initPack.bullet = [];
  initPack.enemy = [];
  initPack.torch = [];
  initPack.coffin = [];
  initPack.artifact = [];
  removePack.player = [];
  removePack.bullet = [];
  removePack.enemy = [];
  removePack.artifact = [];
}, 1000 / 25);
