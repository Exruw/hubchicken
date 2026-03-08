import { CONFIG } from "./config.js";

class UserData {
    constructor() {
        // Load data from localStorage or initialize an empty object
        this.data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {};

        // Save data following interval defined in config
        setInterval(() => this.save(), CONFIG.DATA_SAVE_INTERVAL);
    }

    save() {
        console.log("Saving user data...");
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.data));
    }

    get(key) {
        return Object.keys(this.data).includes(key) ? this.data[key] : null;
    }

    set(key, value) {
        this.data[key] = value;
    }
}

export { UserData };