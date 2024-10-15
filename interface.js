class Interface {
    #template;
    #validTypes;
    #hash;

    #validateTemplate(template) {
        for (let k of Object.keys(template)) {
            //this.#addCount(template);
            if (typeof template[k] === "string") {
                if (!this.#validTypes.includes(template[k])) throw new Error(`Invalid field '${k}', interface template string fields must be a valid JavaScript type.`);
            } else if (typeof template[k] === "object") {
                this.#validateTemplate(template[k]);
            } else {
                throw new Error(`Invalid field '${k}'(typeof '${typeof template[k]}'), interface template fields can only be strings or objects.`);
            }
        }
    }

    /**
    @param {object} obj
    @returns {boolean}
    */
    #getCount(obj) {
        if (obj[this.#hash + "_count"] === undefined) this.#setCount(obj, 0);
        return obj[this.#hash + "_count"];
    }

    /**
    @param {object} obj
    @param {number} value
    @returns {boolean}
    */
    #setCount(obj, value) {
        obj[this.#hash + "_count"] = value;
    }

    /**
    @param {object} obj
    @param {number} amount
    @returns {boolean}
    */
    #addCount(obj, amount = 1) {
        this.#setCount(obj, this.#getCount(obj) + amount);
    }

    /**
    @param {object} obj
    @param {object} template
    @returns {{n: string, t: string}[]}
    */
    #subconforms(obj, template) {
        /**
        @type {{n: string, t: string}[]}
        */
        let missingFields = [];

        const objtype = o => typeof o.push === "function" && typeof o.pop === "function" ? "array" : "object";

        for (let k of Object.keys(obj)) {
            let tempk = template[k];
            if (typeof tempk === "string") {
                if (typeof obj[k] !== tempk) missingFields.push({ n: k, t: tempk });
            } else if (typeof tempk === "object") {
                this.#subconforms(obj[k], template[k]).forEach(i => missingFields.push(i));
            }
        }

        for (let k of Object.keys(template)) {
            if (!Object.keys(obj).includes(k) && !k.startsWith(this.#hash + "_")) {
                let ok = true;
                missingFields.forEach(mk => { if (mk.t === k) ok = false; });
                if (ok) missingFields.push({ n: k, t: template[k] });
            };
        }

        return missingFields;
    }

    /**
    @param {object} subobject
    @param {object} override
    */
    #extendSubobject(subobject, override) {
        for (let o of Object.keys(override)) {
            if (typeof override[o] === "object" && typeof subobject[o] === "object") {
                this.#extendSubobject(subobject[o], override[o]);
            } else {
                subobject[o] = override[o];
            }
        }
    }

    /**
    @param {object} template
    */
    constructor(template) {
        this.#validTypes = ["string", "number", "bigint", "symbol", "object", "boolean", "function", "undefined"];
        this.#hash = "";
        for (let i = 0; i < 5; i++) this.#hash += `${Math.random() * 10}`.replace(".", "").slice(0, Math.random() > 0.5 ? 2 : 1);
        this.#template = structuredClone(template);
        this.#validateTemplate(this.#template);
    }

    /**
    Creates a new Interface object; use templateOverride to override fields or add new ones
    @param {object} templateOverride
    @returns {Interface}
    */
    extend(templateOverride = {}) {
        const extension = new Interface(this.#template);
        this.#extendSubobject(extension.#template, templateOverride);
        return extension;
    }

    /**
    Creates an object that conforms to the interface
    @param {...any} values
    */
    generate(...values) {
        const conformer = new Object(null);

        if (values.length !== Object.keys(this.#template).length)
            throw new Error(`interface has ${Object.keys(this.#template).length} ${Object.keys(this.#template).length === 1 ? "field" : "fields"}, but ${values.length} ${values.length === 1 ? "value was" : "values were"} given`);

        let tkeys = Object.keys(this.#template);
        for (let i in tkeys) {
            conformer[tkeys[i]] = values[i];
        }

        return conformer;
    }

    /**
    @param {object} obj
    @returns {{n: string, t: string}[]}
    */
    conformsList(obj) {
        return this.#subconforms(obj, this.#template);
    }

    /**
    @param {object} obj
    @returns {boolean}
    */
    conforms(obj) {
        return this.conformsList(obj).length === 0;
    }

    /**
    @param {object} obj
    */
    throwConforms(obj) {
        let missingFields = this.conformsList(obj);
        if (missingFields.length !== 0) {
            let mfs = [];
            missingFields.forEach(mf => mfs.push(`'${mf.n}' as type '${mf.t}'`));
            let msg = `object does not conform to interface, missing ${missingFields.length === 1 ? "field" : "fields"} ${mfs.join(", ")}`;
            throw new Error(msg);
        }
    }
}

try { module.exports = Interface; } catch (_) { }
