Bullet = function(parent, type, angle, lifeSpan) {
  const self = Entity();
  self.purpose = "bullet";
  self.id = Math.random();
  self.spdX = Math.cos((angle / 180) * Math.PI) * 10;
  self.spdY = Math.sin((angle / 180) * Math.PI) * 10;
  self.parent = parent;
  self.explosionframeCount = 0;
  self.isExplosion = false;
  self.timer = 0;
  self.type = type;

  self.toRemove = false;
  const super_update = self.update;
  self.update = function() {
    if (self.timer++ > lifeSpan || currentMap.isPositionWall(self)) {
      self.toRemove = true;
    }

    super_update();

    for (let i in Player.list) {
      const p = Player.list[i];
      if (!p.isDead) {
        if (self.getDistance(p) < 32 && self.parent !== p.id) {
          p.hp -= 1;

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
    for (let i in enemyList) {
      const e = enemyList[i];
      if (self.getDistance(e) < 32 && self.parent !== e.id) {
        e.hp -= 1;
        if (e.hp <= 0) {
          e.toRemove = true;
        }
        self.toRemove = true;
      }
    }
  };

  self.getInitPack = function() {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      type: self.type
    };
  };

  self.getUpdatePack = function() {
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

Bullet.update = function() {
  const pack = [];
  for (let i in Bullet.list) {
    const bullet = Bullet.list[i];
    bullet.update();
    if (bullet.toRemove) {
      bullet.explosionframeCount += 15;
      bullet.isExplosion = true;
      bullet.updatePosition = function() {}; //stop moving;
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

Bullet.getAllInitPack = function() {
  const bullets = [];
  for (let i in Bullet.list) {
    bullets.push(Bullet.list[i].getInitPack());
  }
  return bullets;
};
