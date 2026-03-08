import { getArray } from "https://hubchicken.pages.dev/video-array.js";
import { CONFIG } from "./config.js";

class VideoModal {
    constructor(modalElement, searchContent, videoTitle, video, closeButton) {
        // DOM Elements
        this.modalElement = modalElement;
        this.searchContent = searchContent;
        this.videoTitle = videoTitle;
        this.video = video;
        this.closeButton = closeButton;

        // Bind events
        this.videoTitle.addEventListener("click", () => this.copyVideoLink());
        closeButton.addEventListener("click", () => this.closeModal());
    }

    copyVideoLink() {
        navigator.clipboard.writeText(this.video.src);
    }

    openModal(title, url) {
        this.videoTitle.textContent =  title;
        this.video.src = url;

        this.searchContent.scrollTo(0, 0);

        this.searchContent.style.overflowY = "hidden";
        this.modalElement.style.display = "flex";
    }

    closeModal() {
        this.video.src = "";
        this.searchContent.style.overflowY = "scroll";
        this.modalElement.style.display = "none";
    }
}

class VideoListManager {
    constructor() {
        // DOM Elements
        this.searchContent = document.getElementById("searchContent");
        this.videoList = document.getElementById("videoList");
        this.videoModal = document.getElementById("videoModal");
        this.videoModalTitle = document.getElementById("videoModalTitle");
        this.videoModalDisplay = document.getElementById("videoModalDisplay");
        this.closeButton = document.getElementById("close");
        this.loadingModal = document.getElementById("loadModal");
        this.searchFailModal = document.getElementById("searchFailModal");
        this.searchBar = document.getElementById("searchBar");

        // Video Loading
        this.loadedVideos = 0;
        this.videoArray = getArray();

        // Modal
        this.modalManager = new VideoModal(
            this.videoModal,
            this.searchContent,
            this.videoModalTitle,
            this.videoModalDisplay,
            this.closeButton
        );

        // Search Timeout (prevents lag)
        this.timeout = null;

        this.queryEntered = false;

        // Initialize
        this.init();
    }

    init() {
        // Initialize base
        this.searchBar.placeholder = `Search for a video of ${this.videoArray.length} videos...`;
        this.loadVideos();

        // Bind events
        this.searchBar.addEventListener("input", () => this.search());
        this.searchContent.addEventListener("scroll", () => this.handleScroll());
    }

    loadVideos() {
        if (this.queryEntered) return false;

        let counter = 0;

        for (let i = 0; i < CONFIG.VIDEOS_PER_SCROLL; i++) {
            const newIndex = this.loadedVideos + 1;
            if (newIndex > this.videoArray.length) break;

            const video = this.videoArray[newIndex];
            this.createVideoElement(video);
            this.loadedVideos++;
            counter++;
        }

        return counter > 0;
    }

    filterBy(query) {
        let counter = 0;
        this.queryEntered = true;

        for (const video of this.videoArray) {
            if (this.stripURL(video).toLowerCase().includes(query)) {
                this.createVideoElement(video);
                counter++;
            }
        }

        return counter > 0;     
    }

    handleScroll() {
        const isAtBottom = Math.round(
            this.searchContent.offsetHeight + this.searchContent.scrollTop) 
            >= this.searchContent.scrollHeight;

        if (isAtBottom) {
            this.loadVideos();
        }
    }

    stripURL(url) {
        const noUrlOrSeparators = url.replace(CONFIG.BASE_URL, "").replace(/[_-]/g, " ");
        const parts = noUrlOrSeparators.split(".");
        parts.pop(); // Remove file extension
        return parts.join(" ");
    }

    createVideoElement(url) {
        var a = document.createElement("a");
        a.textContent = this.stripURL(url);
        a.addEventListener("click", () => this.modalManager.openModal(a.textContent, url));
        this.videoList.append(a);
    }

    clearVideos() {
        this.loadedVideos = 0;
        this.videoList.innerHTML = "";
    }

    search() {
        if (this.timeout) clearInterval(this.timeout);
        const query = this.searchBar.value;

        this.clearVideos();
        this.showLoadingModal();

        this.timeout = setTimeout(() => {
            this.queryEntered = false;

            const hasResults = query === "" 
                ? this.loadVideos()
                : this.filterBy(query);
            
            this.hideLoadingModal(hasResults);
        }, CONFIG.SEARCH_DELAY);
    }

    showLoadingModal() {
        this.searchContent.scrollTo(0, 0);
        this.searchContent.style.overflow = "hidden";
        this.searchFailModal.style.display = "none";
        this.loadingModal.style.display = "flex";
    }

    hideLoadingModal(hasResults) {
        this.searchFailModal.style.display = "none";
        this.loadingModal.style.display = "none";

        if (!hasResults) {
            this.searchFailModal.style.display = "flex";
        } else {
            this.searchContent.style.overflow = "scroll";
        }
    }
}

export { VideoListManager };