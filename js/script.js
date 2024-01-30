let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesAndSeconds(seconds) {
  if (typeof seconds !== "number" || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60); // Ensure whole seconds

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }

  // Show all the songs
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                            <img class = "invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div>Mustu Bhai</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class = "invert" src="img/play.svg" alt="">
                            </div> </li>`;
  }

  // attack an event listener to each song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  try {
    let response = await fetch("http://127.0.0.1:5500/songs/");
    let html = await response.text();
    let div = document.createElement("div");
    div.innerHTML = html;

    let cardContainer = document.querySelector(".cardContainer");
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);

    for (let i = 0; i < array.length; i++) {
      const e = array[i];
      if (e.href.includes("/songs")) {
        let folder = e.href.split("/").slice(-1)[0];

        // Get the metadata of the folder
        let metadataResponse = await fetch(
          `http://127.0.0.1:5500/songs/${folder}/info.json`
        );

        if (metadataResponse.ok) {
          let metadata = await metadataResponse.json();

          // Create and append the card
          cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" data-src="/icons/play-stroke-sharp.svg"              xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#000000" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round"></path>
                        </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${metadata.title}</h2>
                        <p>${metadata.description}</p>
                    </div>`;
        } else {
          console.error(
            `Failed to fetch metadata for folder ${folder}. Status: ${metadataResponse.status}`
          );
        }
      }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((card) => {
      card.addEventListener("click", async (event) => {
        let folder = event.currentTarget.dataset.folder;
        songs = await getSongs(`/songs/${folder}`);
        playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Error in displayAlbums:", error);
  }
}

async function main() {
  // get the list of all songs
  await getSongs("/songs/cs");
  playMusic(songs[0], true);

  // Display allthe albums on the page
  displayAlbums();

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `${secondsToMinutesAndSeconds(
      currentSong.currentTime
    )} : ${secondsToMinutesAndSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    ``;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous and next buttons

  previous.addEventListener("click", () => {
    // console.log("Previous button clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    currentSong.pause();
    // console.log("Next button clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      volumeValue = parseInt(e.target.value);
      currentSong.volume = volumeValue / 100;
      if (volumeValue === 0) {
        document.querySelector(".volume>img").src = "img/mute.svg";
      } else {
        document.querySelector(".volume>img").src = "img/volume.svg";
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
