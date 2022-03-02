const { ipcRenderer } = require('electron');
const { $, coverDuration} = require('./helper.js');
let musicAudio = new Audio();
let allTracks;
let currentTrack;

$('addMusic').addEventListener('click', () => {
  ipcRenderer.send('add-music-window');
});

const renderListHTML = tracks => {
  const trackList = $('trackList');
  const trackListHTML = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex just-content-between aligin-items-center">
      <div class="col-10">
        <i class="fas fa-music mr-6 text-secondary"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-2">
        <i class="fas fa-play mr-6" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt" data-id="${track.id}"></i>
      </div>
    </li>`;
    return html;
  }, '');
  const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>';
  trackList.innerHTML = tracks.length
    ? `<ul class="list-group">${trackListHTML}</ul>`
    : emptyTrackHTML;
};

const renderPlayerHTML = (name, duration) => {
  const player = $('player-status');
  const html = `<div class="col font-weight-bold">
    正在播放：${name}
  </div>
  <div class="col">
    <span id="current-seeker">00:00</span> / ${coverDuration(duration)}
  </div>`

  player.innerHTML = html;
}


const updaedProgressHTML = (currentTime, duration) => {
  const progress = Math.floor(currentTime / duration * 100);
  const bar = $('player-progress');
  bar.innerHTML = progress + '%';
  bar.style.width = progress + '%';
  const seeker = $('current-seeker');
  seeker.innerHTML =  coverDuration(currentTime);
}

ipcRenderer.on('getTracks', (event, tracks) => {
  allTracks = tracks;
  renderListHTML(tracks);
});


musicAudio.addEventListener('loadedmetadata', () => {
  // 开始渲染播放器状态
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
  // 更新播放时间
  updaedProgressHTML(musicAudio.currentTime, musicAudio.duration)
})

$('trackList').addEventListener('click', event => {
  event.preventDefault();

  const { dataset, classList} = event.target;
  const id = dataset && dataset.id;
  if (id && classList.contains('fa-play')) {
    // 开始播放音乐
    if(currentTrack && currentTrack.id === id) {
      // 继续播放音乐
      musicAudio.play();
    } else {
      // 播放新的音乐, 注意还原之前的图标
      currentTrack = allTracks.find(track => track.id === id);
      musicAudio.src = currentTrack.path;
      musicAudio.play();
      const resetIconEle = document.querySelector('.fa-pause');
      if (resetIconEle) {
        resetIconEle.classList.replace('fa-pause', 'fa-play');
      }
    }
    classList.replace('fa-play', 'fa-pause');
  } else if (id && classList.contains('fa-pause')) {
    // 暂停播放
    musicAudio.pause();
    classList.replace('fa-pause', 'fa-play');
  } else if (id && classList.contains('fa-trash-alt')) {
    // 删除音乐
    ipcRenderer.send('delete-track', id);
  }
});
