// ==UserScript==
// @name         保存知识星球文章为文本型PDF
// @namespace    http://tampermonkey.net/
// @version      1.0
// @license      MIT
// @description  将知识星球文章保存为可搜索/可选择文本型PDF，并且去除右边的二维码，但仍然要调用浏览器的打印功能
// @author       mosherk
// @match        https://articles.zsxq.com/*.html
// @grant        none
// @icon         https://articles.zsxq.com/favicon.ico
// ==/UserScript==

(function () {
  'use strict';

  // 添加打印按钮样式
  const btnStyle = document.createElement('style');
  btnStyle.textContent = `
    #zsxq-pdf-btn {
      position: fixed;
      bottom: 100px;
      right: 10px;
      padding: 12px 18px;
      background: linear-gradient(135deg,rgb(128, 167, 244),rgb(112, 105, 250));
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 9999;
      transition: all 0.3s ease;
    }
    #zsxq-pdf-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    }
    `;
  document.head.appendChild(btnStyle);

  // 创建下载按钮
  const pdfBtn = document.createElement('button');
  pdfBtn.id = 'zsxq-pdf-btn';
  pdfBtn.textContent = '📥 导出PDF';
  document.body.appendChild(pdfBtn);

  // 添加打印专用样式
  const printStyle = document.createElement('style');
  printStyle.textContent = `
        @media print {
            body > *:not(#pdf-export-container) {
                display: none !important;
            }
            #pdf-export-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
            }
            /* 优化分页 */
            h1, h2, h3, table, pre {
                page-break-inside: avoid !important;
            }
        }
    `;
  document.head.appendChild(printStyle);

  // Print.js实现（精简版）
  // https://github.com/lemoncool/print-demo/blob/main/src/utils/print2.js
  const Print = (function (window, document) {
    return function (dom, options) {
      this.options = Object.assign({
        noPrint: '.no-print',
        onStart: function () { },
        onEnd: function () { }
      }, options);

      this.dom = (typeof dom === "string") ?
        document.querySelector(dom) : dom;

      this.init();
    };
  })(window, document);

  Print.prototype = {
    init: function () {
      const content = this.getStyle() + this.getHtml();
      this.writeIframe(content);
    },
    getStyle: function () {
      let str = "";
      const styles = document.querySelectorAll('style,link');
      styles.forEach(style => {
        str += style.outerHTML;
      });
      str += `<style>${this.options.noPrint}{display:none;}</style>`;
      return str;
    },
    getHtml: function () {
      // 克隆表单状态（原功能保留）
      ['input', 'textarea', 'select'].forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el.type === "checkbox" || el.type === "radio") {
            el.checked ?
              el.setAttribute('checked', 'checked') :
              el.removeAttribute('checked');
          } else if (el.type === "text") {
            el.setAttribute('value', el.value);
          }
        });
      });
      return this.dom.outerHTML;
    },
    writeIframe: function (content) {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:absolute;width:0;height:0;top:-10px;left:-10px;';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument;
      doc.open();
      doc.write(content);
      doc.close();

      this.toPrint(iframe.contentWindow, () => {
        document.body.removeChild(iframe);
      });
    },
    toPrint: function (w, cb) {
      const _this = this;
      w.onload = function () {
        setTimeout(() => {
          w.focus();
          typeof _this.options.onStart === 'function' && _this.options.onStart();
          if (!w.document.execCommand('print', false, null)) {
            w.print();
          }
          typeof _this.options.onEnd === 'function' && _this.options.onEnd();
          w.close();
          cb && cb();
        }, 100);
      };
    }
  };

  // 导出PDF功能
  pdfBtn.addEventListener('click', () => {
    const allEl = document.querySelector('.post.js_watermark.quill-editor')

    if (!allEl) {
      alert('未找到需要打印的内容！');
      return;
    }

    // 创建临时容器
    const container = document.createElement('div');
    container.id = 'pdf-export-container';

    // 克隆标题和内容
    const allClone = allEl.cloneNode(true);

    container.appendChild(allClone);
    document.body.appendChild(container);

    // 调用Print.js
    new Print(`#${container.id}`, {
      noPrint: '.qrcode-container',
      onEnd: () => {
        document.body.removeChild(container);
      }
    });
  });
})();
