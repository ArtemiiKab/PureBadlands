Player = function (param) {
  const self = Entity(param);
  self.purpose = "player";
  let races = ["Elf", "Human"];
  let helmets = [
    "WolfHead",
    "AnubisHead",
    "SkullHelmet",
    "FrostHood",
    "MummyHead",
    "GreenHood"
  ];
  let armor = ["WolfArmor", "RustyArmor", "PharaonArmor", "None", "OsirisEye"];
  self.race = races[Math.floor(Math.random() * 2)];
  self.x = 700;
  self.y = 350;

  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
  self.score = 0;
  self.width = 90;
  self.height = 90;
  self.attackCounter = 0
  self.artifacts = [];
  self.isDead = false;
  //lower better
  self.attackRecharge = 15;

  self.deadTimer = 0;
  //closes
  self.armor = {
    body: armor[Math.floor(Math.random() * armor.length)],
    boots: "None",
    helmet: helmets[Math.floor(Math.random() * helmets.length)],
    weapon: "None"
  };

  //stats
  self.maxSpd = 10;
  self.hp = 10;
  self.hpMax = 10;
  self.firstSkill = "fireball";
  self.firstSkills = ["fireball", "frostball"];
  //animation
  self.spriteAnimeCounter = 0;
  const super_update = self.update;
  self.update = function () {
    self.attackCounter++
    self.updateSpd();
    super_update();
    if (self.pressingAttack && self.attackCounter > self.attackRecharge && !self.isDead) {
      self.shootBullet(self.mouseAngle);
      self.attackCounter = 0;
    }
    if (self.isDead) {
      self.deadTimer++;
      self.maxSpd = 0;
      if (self.artifacts.length !== 0) {
        for (let i = 0; i < self.artifacts.length; i++) {
          self.dropArtifacts(self.artifacts[i]);
        }
      }
      if (self.deadTimer >= 50) {
        self.isDead = false;

        self.deadTimer = 0;
        self.x = 500;
        self.y = 500;
        self.hp = self.hpMax;
        self.maxSpd = 10;
      }
    }
  };

  self.dropArtifacts = function (name) {
    new Artifact(
      name,
      Math.floor(self.x / TILE_SIZE),
      Math.floor(self.y / TILE_SIZE), self.map
    );
    self.artifacts.splice(self.artifacts.indexOf(name), 1);

  };

  self.shootBullet = function (angle) {
    Bullet({ parent: self.id, angle: angle, x: self.x, y: self.y, bulletType: self.firstSkill, lifespan: 100, map: self.map });
  };
  self.updateSpd = function () {
    self.bumperRight = { x: self.x + self.width / 2, y: self.y };
    self.bumperLeft = { x: self.x - self.width / 2, y: self.y };
    self.bumperUp = { x: self.x, y: self.y - self.height / 2 };
    self.bumperDown = { x: self.x, y: self.y + self.height / 2 };

    if (self.pressingRight && !self.map.isPositionWall(self.bumperRight)) {
      self.spdX = self.maxSpd;
      self.spriteAnimeCounter += 0.2;
    } else if (
      self.pressingLeft &&
      !self.map.isPositionWall(self.bumperLeft)
    ) {
      self.spdX = -self.maxSpd;
      self.spriteAnimeCounter += 0.2;
    } else self.spdX = 0;

    if (self.pressingDown && !self.map.isPositionWall(self.bumperDown)) {
      self.spdY = self.maxSpd;
      self.spriteAnimeCounter += 0.2;
    } else if (self.pressingUp && !self.map.isPositionWall(self.bumperUp)) {
      self.spdY = -self.maxSpd;
      self.spriteAnimeCounter += 0.2;
    } else self.spdY = 0;
  };

  self.getInitPack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      number: self.number,
      hp: self.hp,
      hpMax: self.hpMax,
      score: self.score,
      armor: self.armor,
      race: self.race,
      map: self.map.id
    };
  };

  self.getUpdatePack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      hp: self.hp,
      score: self.score,
      mouseAngle: self.mouseAngle,
      spriteAnimeCounter: self.spriteAnimeCounter,
      isDead: self.isDead,
      firstSkill: self.firstSkill,
      artifacts: self.artifacts,
      armor: self.armor
    };
  };
  Player.list[self.id] = self;
  playerCounter[self.map.id]++
  initPack.player.push(self.getInitPack());
  return self;
};
playerCounter = {}
playerCounter.Pyramid = 0;
playerCounter.mainCamp = 0;
Player.list = {};
Player.getAllInitPack = function () {
  const players = [];
  for (let i in Player.list) {
    players.push(Player.list[i].getInitPack());
  }
  return players;
};
Player.update = function () {
  const pack = [];
  for (let i in Player.list) {
    const player = Player.list[i];
    player.update();
    pack.push(player.getUpdatePack());
  }

  return pack;
};
