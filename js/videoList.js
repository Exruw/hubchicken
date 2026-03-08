const videoArray = [];
let files = await fetch(`https://hubvideos.pages.dev/video-array.json`)
files = await files.json()

for (const [file, url] of Object.entries(files)) videoArray.push(url)

export function getArray()
{
    return videoArray
}

export function getRandomVideo()
{
    return videoArray[0|(Math.random() * videoArray.length)]
}