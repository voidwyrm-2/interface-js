const Interface = require("../interface");

const iMessager = new Interface({ msg: "function" });
const iMessage = new Interface({ msg: "string" });

let tests = [{}, { msg: "a message" }, { msg: 20 }, { other: "a different field" }, { msg: () => console.log("another message") }, { msg: "the last message" }];

for (let t of tests) {
    if (iMessager.conforms(t)) {
        t.msg();
        console.log("object is a messager!");
    } else if (iMessage.conforms(t)) {
        console.log(t.msg);
        console.log("object is a message!");
    } else {
        console.log("object is neither a messager nor a message");
    }
    console.log("");
}
