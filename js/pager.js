import { CONFIG } from "./config.js";

class Pager {
    constructor() {
        // DOM Elements
        this.pageButtons = document.querySelectorAll("a");
        this.pages = document.querySelectorAll(".content");

        // Bind event listeners
        window.addEventListener("hashchange", () => this.changeWindow());
        document.addEventListener("DOMContentLoaded", () => this.changeWindow());

        // Initialize
        this.changeWindow();
    }

    getWindowHash() {
        return window.location.hash.substring(1) || "home";
    }

    setActiveButton(activeButton) {
        for (const button of this.pageButtons) {
            button.classList.toggle("here", button.href.endsWith(activeButton));
        }
    }

    setActiveTab(activeTab) {
        for (const page of this.pages) {
            page.classList.toggle("hidden", page.id !== activeTab);
        }
    }

    setWindowTitle(name) {
        document.title = `${CONFIG.BASE_TITLE} ${CONFIG.SEPARATOR} ${name.substring(0, 1).toUpperCase() + name.substring(1)}`;
    }

    changeWindow() {
        const hash = this.getWindowHash();
        const contentIdentifier = `${hash}Content`;

        this.setActiveButton(hash);
        this.setActiveTab(contentIdentifier);
        this.setWindowTitle(hash);
    }
}

export { Pager };