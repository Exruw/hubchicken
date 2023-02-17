const videoArray = [];
const extensions = {"mp4": true, "mov": true, "webm": true, "3gpp": true};
(await (await fetch(`https://api.github.com/repos/Exruw/hubvideos/git/trees/${(await (await fetch("https://api.github.com/repos/Exruw/hubvideos/commits")).json())[0]?.commit?.tree?.sha}`)).json()).tree.forEach(v => {
    if (v?.type !== "tree" && v?.path && extensions[v.path.split(".").pop()])
        videoArray.push(`https://videos.hubchicken.tk/${v.path}`);
});
export function getArray()
{
    return videoArray
}
export function getRandomVideo()
{
    return videoArray[0|(Math.random() * videoArray.length)]
}
