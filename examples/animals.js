const Interface = require("../interface");

const iAnimal = new Interface({ name: "string", sound: "string" });
const iDog = iAnimal.extend({ bark: "function" });
const iRodent = iAnimal.extend({ squeak: "function" });

const genericAnimal = iAnimal.generate("Some Animal", "a sound");
const corgi = iDog.generate("Corgi", "woof", function() { console.log("the " + this.name + " says: " + this.sound) });
const mouse = iRodent.generate("Mouse", "squeak", function() { console.log("the " + this.name + " says: " + this.sound) });

[genericAnimal, corgi, mouse].forEach(e => {
    if (iAnimal.conforms(e)) {
        console.log(e.name + " is an animal, and it says '" + e.sound + "'");

        if (iDog.conforms(e)) {
            console.log(e.name + " is a dog");
            e.bark();
        } else {
            console.log(e.name + " is not a dog");
        }

        if (iRodent.conforms(e)) {
            console.log(e.name + " is a rodent");
            e.squeak();
        } else {
            console.log(e.name + " is not a rodent");
        }
    } else {
        console.log("this thing isn't an animal");
    }
});
