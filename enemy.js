Enemy = function (enemyPack, x, y, map) {
  const self = Entity();
  self.purpose = "enemy";
  self.id = Math.random();
  self.name = enemyPack.name;
  self.width = enemyPack.width;
  self.height = enemyPack.width;
  self.bulletType = enemyPack.bulletType;
  self.speed = enemyPack.speed;
  self.hpMax = enemyPack.hpMax;
  self.hp = self.hpMax;
  self.x = x;
  self.y = y;
  self.map = map;

  self.attackRecharge = 30;
  self.aimAngle = 0;
  self.toRemove = false;
  self.animeFrameCount = 0;
  self.isAttacking = false;
  self.attackCount = 0;
  self.targetPlayer = { x: 0, y: 0 }
  if (enemyPack.attention !== undefined) {
    for (let i in artifactList) {
      if (artifactList[i].name === enemyPack.attention) {
        self.targetArtifact = artifactList[i]
        self.targetPlayer = { x: self.targetArtifact.x, y: self.targetArtifact.y }
      }
    }

  }

  self.observation = enemyPack.observation;
  self.transformed = "no";

  self.getInitPack = function () {
    return {
      id: self.id,
      name: self.name,
      x: self.x,
      y: self.y,
      width: self.width,
      height: self.height,
      hpMax: self.hpMax,
      aimAngle: self.aimAngle,
      map: self.map.id
    };
  };
  self.getUpdatePack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      hp: self.hp,
      toRemove: self.toRemove,
      animeFrameCount: self.animeFrameCount,
      aimAngle: self.aimAngle,
      isAttacking: self.isAttacking,
      transformed: self.transformed
    };
  };

  self.updateAim = function () {
    if (self.observation !== 0) {
      //choosing the nearest player...........................
      let arr = [];
      let arr2 = [];
      for (let i in Player.list) {
        if (self.map.id === Player.list[i].map.id && !Player.list[i].isDead) {
          arr.push([self.getDistance(Player.list[i]), Player.list[i].id]);
        }
      }
      arr.map(it => arr2.push(it[0]));
      let closestDist = Math.min(...arr2);
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] === closestDist) {
          self.targetPlayer = Player.list[arr[i][1]];
        }
      }
    } else {
      for (let i in Player.list) {
        if (self.targetArtifact.owner === Player.list[i].id) {
          self.targetPlayer = Player.list[i];
          self.observation = 8;
        }
      }
    }

    //....................................................
    let diffX = self.targetPlayer.x - self.x;
    let diffY = self.targetPlayer.y - self.y;
    self.aimAngle = (Math.atan2(diffY, diffX) / Math.PI) * 180;
  };

  self.performAttack = function () {
    if (self.attackCount > self.attackRecharge && self.transformed === "no") {
      if (self.bulletType !== "LightningBolt") {
        Bullet({ parent: self.id, angle: self.aimAngle, x: self.x, y: self.y, bulletType: self.bulletType, lifespan: 100, map: self.map });
      } else {
        Spell(self.targetPlayer.x, self.targetPlayer.y, self.bulletType, spellBook[self.bulletType], self.map);
      }

      self.attackCount = 0;
      self.isAttacking = true;
    }

    if (self.isAttacking && self.attackCount > self.attackRecharge / 2) {
      self.isAttacking = false;
    }
  };

  self.updatePosition = function () {
    self.attackCount++;

    //if the enemy doesn't see player  he doesn't move
    if (self.getDistance(self.targetPlayer) > TILE_SIZE * self.observation) {
      return;
    }

    self.animeFrameCount += 0.2;
    self.performAttack();
    //if enemy attacks his speed is 0
    if (self.isAttacking) {
      return;
    }
    self.bumperRight = { x: self.x + self.width / 2, y: self.y };
    self.bumperLeft = { x: self.x - self.width / 2, y: self.y };
    self.bumperUp = { x: self.x, y: self.y - self.height / 2 };
    self.bumperDown = { x: self.x, y: self.y + self.height / 2 };

    let diffX = self.targetPlayer.x - self.x;
    let diffY = self.targetPlayer.y - self.y;

    if (
      diffX > self.speed / 2 + 0.1 &&
      !self.map.isPositionWall(self.bumperRight)
    ) {
      self.x += self.speed;
    } else if (
      diffX < -(self.speed / 2 + 0.1) &&
      !self.map.isPositionWall(self.bumperLeft)
    ) {
      self.x -= self.speed;
    }
    if (
      diffY > self.speed / 2 + 0.1 &&
      !self.map.isPositionWall(self.bumperDown)
    ) {
      self.y += self.speed;
    } else if (
      diffY < -(self.speed / 2 + 0.1) &&
      !self.map.isPositionWall(self.bumperUp)
    ) {
      self.y -= self.speed;
    }
  };

  self.update = function () {
    if (playerCounter[self.map.id] === 0) {
      return
    }
    if (self.hp <= 0) {
      self.toRemove = true;
    } else if (self.hp < self.hpMax) {
      self.observation = 10
    }
    self.updateAim();
    self.updatePosition();
    if (self.toRemove) {
      enemyCounter -= 1
      delete enemyList[self.id];
      removePack.enemy.push(self.id);
    }
  };

  enemyList[self.id] = self;
  enemyCounter++
  initPack.enemy.push(self.getInitPack());
  return self;
};
enemyCounter = 0
enemyList = {};
Enemy.getAllInitPack = function () {
  const enemies = [];
  for (let i in enemyList) {
    enemies.push(enemyList[i].getInitPack());
  }
  return enemies;
};
Enemy.superUpdate = function () {
  const pack = [];
  for (let i in enemyList) {
    const enemy = enemyList[i];
    enemy.update();
    pack.push(enemy.getUpdatePack());
  }

  return pack;
};
