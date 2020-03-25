Enemy = function (name, x, y, bulletType) {
  const self = Entity();
  self.purpose = "enemy";
  self.id = Math.random();
  self.name = name;
  self.x = x;
  self.y = y;
  self.bulletType = bulletType;
  self.speed = 6;
  self.attackRecharge = 30;

  self.width = 90;
  self.height = 90;
  self.aimAngle = 0;
  self.toRemove = false;
  self.animeFrameCount = 0;
  self.isAttacking = false;
  self.attackCount = 0;

  self.hpMax = 10;
  self.hp = 10;
  self.observation = 8;

  self.getInitPack = function () {
    return {
      id: self.id,
      name: self.name,
      x: self.x,
      y: self.y,
      width: self.width,
      height: self.height,
      hpMax: self.hpMax,
      aimAngle: self.aimAngle
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
      isAttacking: self.isAttacking
    };
  };

  self.updateAim = function () {


    //choosing the nearest player...........................
    let arr = [];
    let arr2 = [];
    for (let i in Player.list) {
      if (!Player.list[i].isDead) {
        arr.push([self.getDistance(Player.list[i]), Player.list[i].id]);
      } else { return self.aimAngle }
    }
    arr.map(it => arr2.push(it[0]));
    let closestDist = Math.min(...arr2);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][0] === closestDist) {
        self.targetPlayer = Player.list[arr[i][1]];
      }
    }
    //....................................................
    let diffX = self.targetPlayer.x - self.x;
    let diffY = self.targetPlayer.y - self.y;
    self.aimAngle = (Math.atan2(diffY, diffX) / Math.PI) * 180;
  };

  self.performAttack = function () {
    if (self.attackCount > self.attackRecharge) {
      let b = Bullet(self.id, self.bulletType, self.aimAngle, 100);
      b.x = self.x;
      b.y = self.y;
      self.attackCount = 0;
      self.isAttacking = true;
    }

    if (self.isAttacking && self.attackCount > self.attackRecharge / 2) {
      self.isAttacking = false;
    }
  };
  self.updatePosition = function () {
    self.attackCount++;
    for (let i in Player.list) {
      if (Player.list[i].isDead) { return }
    }
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
      !currentMap.isPositionWall(self.bumperRight)
    ) {
      self.x += self.speed;
    } else if (
      diffX < -(self.speed / 2 + 0.1) &&
      !currentMap.isPositionWall(self.bumperLeft)
    ) {
      self.x -= self.speed;
    }
    if (
      diffY > self.speed / 2 + 0.1 &&
      !currentMap.isPositionWall(self.bumperDown)
    ) {
      self.y += self.speed;
    } else if (
      diffY < -(self.speed / 2 + 0.1) &&
      !currentMap.isPositionWall(self.bumperUp)
    ) {
      self.y -= self.speed;
    }
  };

  self.update = function () {
    if (playerCounter === 0) {
      return
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
