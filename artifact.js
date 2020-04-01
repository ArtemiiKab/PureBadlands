Artifact = function (name, colX, rowY, map) {
  const self = Entity();
  self.name = name;
  self.x = colX * TILE_SIZE + TILE_SIZE;
  self.y = rowY * TILE_SIZE + TILE_SIZE;
  self.map = map
  self.id = Math.random();
  self.width = TILE_SIZE / 1.2;
  self.height = TILE_SIZE / 1.2;
  self.toRemove = false;
  self.owner = "";
  self.magicAbility = "bloodball";

  self.update = function () {
    for (let i in Player.list) {
      if (self.map.id === Player.list[i].map.id && self.testCollision(Player.list[i]) && !Player.list[i].isDead) {
        self.owner = Player.list[i].id;

        Player.list[i].artifacts.push(self.name);
        // if artifact has magicAbility and player doesn't have that, add it
        if (
          self.magicAbility &&
          Player.list[i].firstSkills.find(e => e === self.magicAbility) ===
          undefined
        )
          Player.list[i].firstSkills.push(self.magicAbility);
        self.toRemove = true;
      }
    }
    if (self.toRemove) {
      delete artifactList[self.id];
      removePack.artifact.push(self.id);
    }
  };
  self.getInitPack = function () {
    return {
      name: self.name,
      id: self.id,
      x: self.x,
      y: self.y,
      map: self.map.id,
    };
  };
  self.getUpdatePack = function () {
    return {
      owner: self.owner,
      id: self.id,
      name: self.name
    };
  };
  artifactList[self.id] = self;
  initPack.artifact.push(self.getInitPack());
  return self;
};
artifactList = {};

Artifact.getAllInitPack = function () {
  const artifacts = [];
  for (let i in artifactList) {
    artifacts.push(artifactList[i].getInitPack());
  }
  return artifacts;
};

Artifact.superUpdate = function () {
  const pack = [];
  for (let i in artifactList) {
    const artifact = artifactList[i];
    artifact.update();
    pack.push(artifact.getUpdatePack());
  }

  return pack;
};
