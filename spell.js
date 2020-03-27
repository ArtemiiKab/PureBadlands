Spell = function (x, y, name, power, map) {
    const self = {
        id: Math.random(),
        x: x,
        y: y,
        name: name,
        power: power,//{stat to apply to, effect of the stat change, duration, apply count}
        map: map,
        width: 48,
        height: 48
    }
    self.spellFrameCount = 0;
    self.toRemove = false;
    self.target = null;
    self.revertTargetStat;
    self.applies = self.power.applies

    self.applyMagicEffect = function (actor) {
        if (self.power.operator === "*") {
            self.revertTargetStat = actor[self.power.stat]
            actor[self.power.stat] = actor[self.power.stat] * self.power.effect
        }


    }

    self.revertEffect = function (actor) {
        actor[self.power.stat] = self.revertTargetStat
    }

    self.update = function () {
        self.spellFrameCount += 4;
        if (self.spellFrameCount < self.power.duration) {

            for (let i in Player.list) {
                let p = Player.list[i];
                if (p.map.id === self.map.id && !p.isDead) {

                    if (p.testCollision(self) && self.applies > 0) {

                        self.x = p.x - p.width / 2;
                        self.y = p.y - p.height / 4;
                        self.applyMagicEffect(p);
                        self.applies -= 1;
                        self.target = p;
                    }
                }
            }

            for (let i in enemyList) {
                let e = enemyList[i];
                if (e.map.id === self.map.id) {
                    if (e.testCollision(self) && self.applies > 0) {
                        self.x = e.x - e.width / 2;
                        self.y = e.y - e.height / 4;
                        self.applyMagicEffect(e);
                        self.applies -= 1;
                        self.target = e
                    }
                }
            }
        } else {

            self.toRemove = true;
            if (self.target !== null) {
                self.revertEffect(self.target)
            }

        }
        if (self.toRemove) {
            delete spellList[self.id];
            removePack.spell.push(self.id);
        }
    }

    self.getUpdatePack = function () {

        return {
            id: self.id,

            x: self.x,
            y: self.y
        };
    };

    self.getInitPack = function () {
        return {
            id: self.id,
            x: self.x,
            y: self.y,
            name: self.name,
            map: self.map.id
        };
    };

    spellList[self.id] = self;
    initPack.spell.push(self.getInitPack());
    return self
}
spellList = {}


Spell.superUpdate = function () {
    const pack = [];
    for (let i in spellList) {
        let spell = spellList[i];
        spell.update();
        pack.push(spell.getUpdatePack());
    }
    return pack;
};

Spell.getAllInitPack = function () {
    const spells = [];
    for (let i in spellList) {
        spells.push(spellList[i].getInitPack());
    }
    return spells;
};