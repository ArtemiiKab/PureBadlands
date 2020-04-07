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
  artifact: [],
  spell: [],
  trap: [],
  trigger: []
};

removePack = { player: [], bullet: [], enemy: [], artifact: [], spell: [] };
require("./bulletBook");
require("./enemyBook");
require("./spellBook");
require("./entity");
require("./torch");
require("./coffin");
require("./artifact");
require("./enemy");
require("./trap");
require("./trigger");
require("./map");

require("./player");

require("./spell");
//call the dog boss................
Enemy(
  enemyBook.CrocDog,
  2000,
  2000,
  mapList["Pyramid"]
);
//.................................
Player.onConnect = function (socket, map) {


  const player = Player({ id: socket.id, map: mapList[map] });
  socket.on("keyPress", function (data) {
    if (data.inputId === "left") player.pressingLeft = data.state;
    else if (data.inputId === "right") player.pressingRight = data.state;
    else if (data.inputId === "down") player.pressingDown = data.state;
    else if (data.inputId === "up") player.pressingUp = data.state;
    else if (data.inputId === "attack") player.pressingAttack = data.state;
    else if (data.inputId === "mouseAngle") {
      player.mouseAngle = data.state;
      player.mouseX = data.x;
      player.mouseY = data.y;

    }
    else if (data.inputId === "rightClick") {
      player.pressingRightClick = true;
    }
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
    } else if (data.inputId === "2") {
      if (player.specialSkills.indexOf(player.specialSkill) < player.specialSkills.length - 1) {
        player.specialSkill = player.specialSkills[player.specialSkills.indexOf(player.specialSkill) + 1]
      } else[
        player.specialSkill = player.specialSkills[0]
      ]
    }
  });



  socket.emit("init", {
    selfId: socket.id,
    player: Player.getAllInitPack(),
    bullet: Bullet.getAllInitPack(),
    torch: Torch.getAllInitPack(),
    coffin: Coffin.getAllInitPack(),
    enemy: Enemy.getAllInitPack(),
    artifact: Artifact.getAllInitPack(),
    spell: Spell.getAllInitPack(),
    trap: Trap.getAllInitPack(),
    trigger: Trigger.getAllInitPack()
  });
};

Player.onDisconnect = function (socket) {
  if (Player.list[socket.id] !== undefined)
    playerCounter[Player.list[socket.id].map.id] -= 1;

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
        // Player.onConnect(socket, data.currentMap);
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
  socket.on("startGame", function (data) {
    Player.onConnect(socket, data.currentMap);
  })
  socket.on("disconnect", function () {

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
    artifact: Artifact.superUpdate(),
    spell: Spell.superUpdate(),
    trap: Trap.superUpdate(),
    trigger: Trigger.superUpdate(),

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
  initPack.spell = [];
  initPack.trap = [];
  initPack.trigger = [];
  removePack.player = [];
  removePack.bullet = [];
  removePack.enemy = [];
  removePack.artifact = [];
  removePack.spell = [];
}, 1000 / 25);
