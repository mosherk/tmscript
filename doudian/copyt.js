// ==UserScript==
// @name         抖音电商罗盘短视频榜标题的复制
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  抖音电商罗盘商品榜单中，短视频榜，在商品标题后边添加一个复制标题的功能
// @author       mosherk
// @match        https://compass.jinritemai.com/shop/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    // 监听DOM变化，处理动态加载的元素
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          addCopyButtons();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初始添加按钮
    document.addEventListener('DOMContentLoaded', addCopyButtons);

    function addCopyButtons() {
      // 获取所有目标元素
      const tagElements = document.querySelectorAll('div.tags-FW_L5H');
      const name_Gh2R04Elements = document.querySelectorAll('div.name-Gh2R04');

      tagElements.forEach((tag,key) => {
        // 避免重复添加按钮
        if (tag.nextElementSibling && tag.nextElementSibling.classList.contains('copy-btn')) return;

        // 创建复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '复制';
        copyBtn.className = 'copy-btn';
        copyBtn.style.cssText = `
          float: right;
          margin-left: 10px;
          padding: 2px 8px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        `;

        // 添加点击事件
        copyBtn.addEventListener('click', () => {
          // 获取要复制的内容（根据实际需求调整）
          // const contentToCopy = tag.textContent.trim();
          const contentToCopy = name_Gh2R04Elements[key].textContent.trim();


          // 使用Clipboard API复制
          navigator.clipboard.writeText(contentToCopy)
            .then(() => {
              copyBtn.textContent = '已复制!';
              setTimeout(() => copyBtn.textContent = '复制', 1500);
            })
            .catch(err => {
              console.error('复制失败:', err);
              copyBtn.textContent = '失败';
            });
        });

        // 在目标元素后插入按钮
        tag.parentNode.insertBefore(copyBtn, tag.nextSibling);
      });
    }
})();