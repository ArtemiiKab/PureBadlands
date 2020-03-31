Coffin = function (colX, rowY, map) {
  const self = Entity();
  let habitans = ["skeletonRogue", "Mummy"];
  self.id = Math.random();
  self.x = colX * TILE_SIZE + TILE_SIZE;
  self.y = rowY * TILE_SIZE + TILE_SIZE;
  self.map = map;
  self.height = TILE_SIZE * 2 - 2;
  self.width = TILE_SIZE * 2 - 2;
  self.isAwaken = false;
  self.isTriggered = false;
  self.coffinframeCount = 0;

  self.update = function () {
    if (self.coffinframeCount < 126 && self.isTriggered) {
      self.coffinframeCount += 4;
    } else if (self.coffinframeCount >= 126) {
      self.coffinframeCount = 0;


      if (!self.isAwaken && enemyCounter <= 5) {
        Enemy(
          enemyBook[habitans[Math.floor(Math.random() * habitans.length)]],
          self.x + TILE_SIZE / 2,
          self.y - TILE_SIZE / 2,
          self.map
        );
        //self.isAwaken = true;
      }
    }
    for (let i in Player.list) {
      let player = Player.list[i];
      if (self.map.id === player.map.id) {

        if (
          self.testCollision({
            x: player.x + TILE_SIZE / 2,
            y: player.y + player.height / 2,
            width: 1,
            height: 1
          }) &&
          !self.isTriggered
        ) {
          self.isTriggered = true;
        }
      }
    }
  };
  self.getUpdatePack = function () {
    return {
      id: self.id,
      isTriggered: self.isTriggered,
      isAwaken: self.isAwaken,
      coffinframeCount: self.coffinframeCount
    };
  };

  self.getInitPack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      map: self.map.id
    };
  };

  coffinList[self.id] = self;
  initPack.coffin.push(self.getInitPack());
  return self;
};
coffinList = {};

Coffin.superUpdate = function () {
  const pack = [];
  for (let i in coffinList) {
    let coffin = coffinList[i];
    coffin.update();
    pack.push(coffin.getUpdatePack());
  }
  return pack;
};

Coffin.getAllInitPack = function () {
  const coffins = [];
  for (let i in coffinList) {
    coffins.push(coffinList[i].getInitPack());
  }
  return coffins;
};
