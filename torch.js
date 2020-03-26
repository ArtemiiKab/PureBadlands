Torch = function (colX, rowY, map) {
  const self = this;
  self.x = colX * TILE_SIZE + TILE_SIZE;
  self.y = rowY * TILE_SIZE + TILE_SIZE;
  self.map = map
  self.id = Math.random();
  self.torchFrameCount = Math.floor(Math.random() * 75);
  self.getInitPack = function () {
    return {
      id: self.id,
      x: self.x,
      y: self.y,
      torchFrameCount: self.torchFrameCount,
      map: self.map.id
    };
  };
  torchList[self.id] = self;
  initPack.torch.push(self.getInitPack());
};
torchList = {};

Torch.getAllInitPack = function () {
  const torches = [];
  for (let i in torchList) {
    torches.push(torchList[i].getInitPack());
  }
  return torches;
};
