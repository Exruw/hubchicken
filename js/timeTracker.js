class TimeTracker {
    constructor(userData) {
        this.userData = userData;
        this.lastTime = Date.now();
        this.totalTime = parseInt(this.userData.get("totalTime") || 0);
        this.timeDisplay = document.getElementById("timeDisplay");

        // Update time every second
        setInterval(() => this.updateTime(), 1000);
    }

    getFormattedTime() {
        const seconds = Math.floor(this.totalTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const years = Math.floor(days / 365);

        // Get remainders
        const remainingDays = days % 365;
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        // Format with leading zeros
        const pad = (num) => String(num).padStart(2, '0');

        return `${pad(years)}:${pad(remainingDays)}:${pad(remainingHours)}:${pad(remainingMinutes)}:${pad(remainingSeconds)}`;
    }

    updateTime() {
        // Calculate elapsed time since last update
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.lastTime;
        this.totalTime += elapsedTime;

        // Update display and save data
        this.timeDisplay.textContent = this.getFormattedTime();
        this.userData.set("totalTime", this.totalTime);

        // Update lastTime for the next interval
        this.lastTime = currentTime;
    }

    /*
function convertSeconds(seconds) {
  const date = new Date(seconds * 1000);
  const years = Math.floor(seconds / (365 * 24 * 60 * 60));
  const days = date.getUTCDate() - 1;
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const remainingSeconds = date.getUTCSeconds();

  return `${years} years, ${days} days, ${hours} hours, ${minutes} minutes and ${remainingSeconds} seconds`;
}
    */
}

export { TimeTracker };