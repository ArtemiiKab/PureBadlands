Trap = function (x, y, isTriggered, map) {
    const self = {
        x: x * TILE_SIZE,
        y: y * TILE_SIZE,
        map: map,
        id: Math.random()
    }
    self.width = TILE_SIZE;
    self.height = TILE_SIZE;
    self.frameCount = 0;
    self.isTriggered = isTriggered;
    self.damage = 1;
    if (self.isTriggered) {
        self.frameCount = 125;
    }
    self.revertTrap = function () {
        self.frameCount -= 4;
    }

    self.update = function () {
        if (self.isTriggered) {
            self.frameCount += 4
            if (self.frameCount >= 126) {
                self.frameCount = 125
            }
        } else {
            if (self.frameCount > 4)
                self.revertTrap()
        }
        for (let i in Player.list) {
            let p = Player.list[i];
            if (p.map.id === self.map.id && self.frameCount > 110 && p.testCollision({ x: self.x + p.width / 3, y: self.y + 4, width: self.width - TILE_SIZE / 2, height: self.height - p.height })) {
                p.hp -= self.damage;
            }
        }

        for (let i in enemyList) {
            let e = enemyList[i];
            if (e.map.id === self.map.id && self.frameCount > 110 && e.testCollision({ x: self.x + e.width / 3, y: self.y + 4, width: self.width - TILE_SIZE / 2, height: self.height - e.height })) {
                e.hp -= self.damage;
            }
        }

    }

    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            map: self.map.id,
            frameCount: self.frameCount,
        };
    };

    self.getUpdatePack = function () {
        return {
            id: self.id,
            frameCount: self.frameCount,
        };
    };

    trapList[self.id] = self;
    initPack.trap.push(self.getInitPack());
    return self;
}

trapList = {}


Trap.superUpdate = function () {
    const pack = [];
    for (let i in trapList) {
        let trap = trapList[i];
        trap.update();
        pack.push(trap.getUpdatePack());
    }
    return pack;
};

Trap.getAllInitPack = function () {
    const traps = [];
    for (let i in trapList) {
        traps.push(trapList[i].getInitPack());
    }
    return traps;
};