Trigger = function (x, y, map) {
    const self = Entity();
    self.x = x * TILE_SIZE;
    self.y = y * TILE_SIZE;
    self.map = map;
    self.id = Math.random();
    self.width = TILE_SIZE;
    self.height = TILE_SIZE;
    self.isTriggered = false;
    self.isPushed = false;
    self.frameCount = 2;

    self.traps = [];
    self.findTraps = function () {

        for (let i in trapList) {
            let t = trapList[i];

            if (t.map.id === self.map.id) {
                console.log(t.id)
                self.traps.push(t)
            }
        }
    }
    self.findTraps()
    self.update = function () {

        if (self.isPushed) {
            if (self.frameCount < 74) {
                self.frameCount += 1;
            } else {

                self.isTriggered = true;
                self.isPushed = false;
                self.frameCount = 0;
                for (let i in self.traps) {
                    let t = self.traps[i];
                    if (t.isTriggered) {
                        t.isTriggered = false
                    } else {
                        t.isTriggered = true
                    }
                }
            }

        }

        for (let i in Player.list) {
            let p = Player.list[i];
            if (p.map.id === self.map.id && p.testCollision({ x: self.x + TILE_SIZE / 2, y: self.y + TILE_SIZE / 2, width: self.width, height: self.height })) {
                self.isPushed = true;
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



    self.frameCount = 0;
    triggerList[self.id] = self;
    initPack.trigger.push(self.getInitPack());
    return self;
}

triggerList = {};


Trigger.superUpdate = function () {
    const pack = [];
    for (let i in triggerList) {
        let trigger = triggerList[i];
        trigger.update();
        pack.push(trigger.getUpdatePack());
    }
    return pack;
};

Trigger.getAllInitPack = function () {
    const triggers = [];
    for (let i in triggerList) {
        triggers.push(triggerList[i].getInitPack());
    }
    return triggers;
};