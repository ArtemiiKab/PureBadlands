Entity = function() {
  const self = {
    x: null,
    y: null,
    spdX: 0,
    spdY: 0,
    id: ""
  };

  self.update = function() {
    self.updatePosition();
  };

  self.updatePosition = function() {
    if (self.x !== null) {
      self.x += self.spdX;
      self.y += self.spdY;
    }
  };
  self.testCollision = function(entity2) {
    const rect1 = {
      x: self.x - self.width / 2,
      y: self.y - self.height / 2,
      width: self.width,
      height: self.height
    };
    const rect2 = {
      x: entity2.x - entity2.width / 2,
      y: entity2.y - entity2.height / 2,
      width: entity2.width,
      height: entity2.height
    };
    return self.testCollisionRectRect(rect1, rect2);
  };

  self.getDistance = function(pt) {
    return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
  };

  self.testCollisionRectRect = function(rect1, rect2) {
    return (
      rect1.x <= rect2.x + rect2.width &&
      rect2.x <= rect1.x + rect1.width &&
      rect1.y <= rect2.y + rect2.height &&
      rect2.y <= rect1.y + rect1.height
    );
  };
  return self;
};
