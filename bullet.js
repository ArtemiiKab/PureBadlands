Bullet = function (param) {
  const self = Entity(param);
  self.purpose = "bullet";
  self.id = Math.random() * 200;
  self.angle = param.angle;
  self.speed = param.bulletType.speed
  self.spdX = Math.cos((param.angle / 180) * Math.PI) * self.speed;
  self.spdY = Math.sin((param.angle / 180) * Math.PI) * self.speed;
  self.parent = param.parent;
  self.explosionframeCount = 0;
  self.width = param.bulletType.width;
  self.height = param.bulletType.height;
  self.isExplosion = false;
  self.timer = 0;
  self.map = param.map;
  self.type = param.bulletType.name;
  self.lifeSpan = param.bulletType.lifeSpan;
  self.damage = param.bulletType.damage;
  self.damageType = param.bulletType.damageType
  self.toRemove = false;
  const super_update = self.update;
  self.update = function () {
    if (self.timer++ > self.lifeSpan || self.map.isPositionWall(self)) {
      self.toRemove = true;
    }

    super_update();

    for (let i in Player.list) {
      const p = Player.list[i];

      if (self.map.id === p.map.id) {
        if (!p.isDead) {
          if (self.testCollision(p) && self.parent !== p.id) {
            p.hp -= self.damage;

            if (p.hp <= 0) {
              const shooter = Player.list[self.parent];
              if (shooter) {
                shooter.score += 1;
              }
              p.isDead = true;
            }
            self.toRemove = true;
          }
        }
      }
    }
    for (let i in enemyList) {
      const e = enemyList[i];
      if (self.map.id === e.map.id) {
        if (self.testCollision(e) && self.parent !== e.id) {
          if (e.immune !== self.damageType)
            e.hp -= self.damage;
          if (e.hp <= 0) {
            e.toRemove = true;
          }
          self.toRemove = true;
        }
      }
    }
  };

  self.getInitPack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      type: self.type,
      map: self.map.id,
      width: self.width,
      height: self.height,
    };
  };

  self.getUpdatePack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      type: self.type,
      isExplosion: self.isExplosion,
      explosionframeCount: self.explosionframeCount
    };
  };
  Bullet.list[self.id] = self;
  initPack.bullet.push(self.getInitPack());
  return self;
};
Bullet.list = {};

Bullet.update = function () {
  const pack = [];
  for (let i in Bullet.list) {
    const bullet = Bullet.list[i];
    bullet.update();
    if (bullet.toRemove) {
      bullet.explosionframeCount += 15;
      bullet.isExplosion = true;
      bullet.updatePosition = function () { }; //stop moving;
    }
    if (bullet.explosionframeCount >= 125) {
      delete Bullet.list[i];
      removePack.bullet.push(bullet.id);
    } else {
      pack.push(bullet.getUpdatePack());
    }
  }
  return pack;
};

Bullet.getAllInitPack = function () {
  const bullets = [];
  for (let i in Bullet.list) {
    bullets.push(Bullet.list[i].getInitPack());
  }
  return bullets;
};
