import { getArray } from "https://hubchicken.pages.dev/video-array.js";
import { CONFIG } from "./config.js";

class Scroller {    
    constructor(userData) {
        // DOM Elements
        this.videoScroller = document.getElementById("videoScroller");
        this.videosWatched = document.getElementById("videosWatched");

        // Scroll Function
        this.observer = new IntersectionObserver((elements) => this.observe(elements));
        this.userData = userData;

        // Video Functions
        this.videoList = getArray();
        this.watchedVideos = [];
        this.videoListener = null;

        // Initialize
        this.init();
    }

    init() {
        this.loadVideos();
        this.videosWatched.textContent = this.userData.get("watchedVideos") || 0;
        this.videoScroller.addEventListener("scroll", () => this.handleScroll());
    }

    createVideo(url) {
        const video = document.createElement("video");
        video.controls = "false";
        video.src = url;
        this.observer.observe(video);
        this.videoScroller.append(video);
    }

    addToWatched(video) {
        if (!this.watchedVideos.includes(video.src)) {
            const watchedVideos = parseInt(this.userData.get("watchedVideos") || 0);
            this.watchedVideos.push(video.src);
            this.userData.set("watchedVideos", watchedVideos + 1);
            this.videosWatched.textContent = watchedVideos;
        }
    }

    loadVideos() {
        for (let i = 0; i < CONFIG.VIDEOS_TO_LOAD; i++) {
            const newVideo = this.getNextVideo();
            this.createVideo(newVideo);
        }
    }

    handleScroll() {
        
        const isAtBottom = Math.round(
            this.videoScroller.offsetHeight + this.videoScroller.scrollTop) 
            >= this.videoScroller.scrollHeight - 5; // -5 prevents calculation errors

        if (isAtBottom) {
            this.loadVideos();
        }
    }

    observe(elements) {
        if (!elements) return;
        let oneActive = false;

        elements.forEach(element => {
            const video = element.target;

            if (element.isIntersecting && !oneActive) {
                // Scroll to video locked
                video.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                // Start watching video
                this.safePlay(video);
                oneActive = true;
                
                // Listener for when video ends
                if (this.videoListener) this.videoListener.disconnect();

                this.videoListener = video.addEventListener("ended", () => {
                    this.addToWatched(video);
                    video.pause();
                    video.currentTime = 0;
                    video.play();
                });
            } else {
                video.pause();
            }
        });
    }

    async safePlay(video) {
        try {
            await video.play();
        } catch(e) {}
    }

    getNextVideo() {
        const index = Math.floor(Math.random() * this.videoList.length);
        const selectedUrl = this.videoList[index];
        this.videoList.slice(index, index + 1); // Remove to prevent repeat

        // Reset video list if it is empty
        if (this.videoList.length === 0) {
            this.videoList = getArray();
        }

        return selectedUrl;
    }
}

export { Scroller };