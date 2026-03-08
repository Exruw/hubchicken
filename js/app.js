import { Pager } from "./pager.js";
import { UserData } from "./userData.js";
import { VideoListManager } from "./videoList.js";
import { Scroller } from "./videoScroller.js";
import { TimeTracker } from "./timeTracker.js";

class App {
    constructor() {
        this.userData = new UserData();
        this.pager = new Pager();
        this.videoListManager = new VideoListManager();
        this.videoScroller = new Scroller(this.userData);
        this.timeTracker = new TimeTracker(this.userData);
    }
}

new App();