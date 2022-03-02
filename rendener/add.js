const { ipcRenderer } = require('electron')
const { $ } = require('./helper.js')
const path = require('path')
let musicFilePath = [];

$('select-music').addEventListener('click', () => {
  ipcRenderer.send('open-music-file')
})


$('add-music').addEventListener('click', () => {
  ipcRenderer.send('add-tracks', musicFilePath)
})

const renderListHtml = (pathes) => {
  const music = $('musicList')
  const musicItmsHTML = pathes.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`;
    return html;
  }, '')
  music.innerHTML = `<ul class="list-group">${musicItmsHTML}</ul>`
}

ipcRenderer.on('selected-file', (event, path) => {
  if(Array.isArray(path)) {
    renderListHtml(path)
    musicFilePath = path;
  }
})