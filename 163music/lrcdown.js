// ==UserScript==
// @name         下载网易云lrc文件
// @namespace    https://github.com/0And1Story
// @version      1.2.2
// @description  直接下载网易云音乐的歌词（lrc文件格式）
// @author       mosherk
// @match        https://music.163.com/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    function downloadLyric() {
        const song_id = window.location.href.match(/song\?id=(\d+)/)?.[1];
        const song_tit = document.querySelector(".tit em").innerText.replace(/ /g, '\u00A0');
        const song_artist = document.querySelector(".des.s-fc4 a").innerText.replace(/\s+/g, '');
        if (!song_id) return alert('未找到歌曲ID');

        fetch(`https://music.163.com/api/song/media?id=${song_id}`, {
            headers: {
                'Referer': 'https://music.163.com/'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (!data?.lyric) return alert('未找到歌词内容');

            // 关键修复：创建临时iframe隔离下载环境
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const blob = new Blob([data.lyric], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            iframe.contentDocument.write(`
                <!DOCTYPE html>
                <a href="${url}" download="${song_tit}-${song_artist}.lrc" id="tempDownload"></a>
                <script>
                    document.getElementById('tempDownload').click();
                    setTimeout(() => window.close(), 1000);
                <\/script>
            `);

            // 延迟清理资源
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url);
            }, 2000);
        })
        .catch(() => alert('歌词获取失败'));
    }

    // 保持原有按钮注入方式
    setTimeout(function() {
        const box = document.querySelector('#user-operation > p.s-fc3');
        if (!box || box.querySelector('.js-download-lyric')) return;

        box.innerHTML = `<a class="f-tdu s-fc7 js-download-lyric" style="cursor:pointer;">下载歌词</a>&nbsp;&nbsp;&nbsp;&nbsp;` + box.innerHTML;
        box.querySelector('.js-download-lyric').onclick = downloadLyric;
    }, 500);
})();