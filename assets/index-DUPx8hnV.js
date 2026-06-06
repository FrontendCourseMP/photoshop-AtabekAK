var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var n=class{canvas;ctx;originalImageData=null;constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`)}render(e){this.originalImageData=e,this.canvas.width=e.width,this.canvas.height=e.height,this.ctx.putImageData(e,0,0),this.fitToScreen()}fitToScreen(){let e=this.canvas.parentElement;if(!e||!this.originalImageData)return;let t=e.clientWidth-40,n=e.clientHeight-40,r=this.originalImageData.width,i=this.originalImageData.height,a=Math.min(1,t/r,n/i);this.canvas.style.width=`${r*a}px`,this.canvas.style.height=`${i*a}px`}getImageData(){return this.originalImageData}getCanvas(){return this.canvas}clear(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.originalImageData=null}},r=`modulepreload`,i=function(e,t){return new URL(e,t).href},a={},o=function(e,t,n){let o=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),s=document.querySelector(`meta[property=csp-nonce]`),c=s?.nonce||s?.getAttribute(`nonce`);function l(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}o=l(t.map(t=>{if(t=i(t,n),t in a)return;a[t]=!0;let o=t.endsWith(`.css`),s=o?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let r=e[n];if(r.href===t&&(!o||r.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${s}`))return;let l=document.createElement(`link`);if(l.rel=o?`stylesheet`:r,o||(l.as=`script`),l.crossOrigin=``,l.href=t,c&&l.setAttribute(`nonce`,c),document.head.appendChild(l),o)return new Promise((e,n)=>{l.addEventListener(`load`,e),l.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function s(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return o.then(t=>{for(let e of t||[])e.status===`rejected`&&s(e.reason);return e().catch(s)})};function s(e){return(e.name.split(`.`).pop()?.toLowerCase()??``)===`gb7`?l(e):c(e)}async function c(e){return new Promise((t,n)=>{let r=URL.createObjectURL(e),i=new Image;i.onload=()=>{let n=document.createElement(`canvas`);n.width=i.naturalWidth,n.height=i.naturalHeight;let a=n.getContext(`2d`);a.drawImage(i,0,0);let o=a.getImageData(0,0,n.width,n.height);URL.revokeObjectURL(r);let s=e.name.split(`.`).pop()?.toLowerCase()??``,c=s===`jpg`||s===`jpeg`?`JPG`:`PNG`;t({imageData:o,meta:{width:i.naturalWidth,height:i.naturalHeight,colorDepth:24,format:c,fileName:e.name}})},i.onerror=()=>{URL.revokeObjectURL(r),n(Error(`Не удалось загрузить изображение`))},i.src=r})}async function l(e){let{decodeGB7:t,gb7ToImageData:n}=await o(async()=>{let{decodeGB7:e,gb7ToImageData:t}=await Promise.resolve().then(()=>d);return{decodeGB7:e,gb7ToImageData:t}},void 0,import.meta.url),r=t(await e.arrayBuffer());return{imageData:n(r),meta:{width:r.width,height:r.height,colorDepth:r.hasMask?8:7,format:`GB7`,fileName:e.name}}}var u=class{elWidth;elHeight;elDepth;elFormat;constructor(){this.elWidth=document.getElementById(`status-width`),this.elHeight=document.getElementById(`status-height`),this.elDepth=document.getElementById(`status-depth`),this.elFormat=document.getElementById(`status-format`)}update(e){this.elWidth.textContent=`${e.width}px`,this.elHeight.textContent=`${e.height}px`,this.elDepth.textContent=`${e.colorDepth} bpp`,this.elFormat.textContent=e.format}reset(){this.elWidth.textContent=`—`,this.elHeight.textContent=`—`,this.elDepth.textContent=`—`,this.elFormat.textContent=`—`}},d=t({decodeGB7:()=>p,encodeGB7:()=>m,gb7ToImageData:()=>h}),f=[71,66,55,29];function p(e){let t=new Uint8Array(e);for(let e=0;e<4;e++)if(t[e]!==f[e])throw Error(`Неверная сигнатура файла GB7`);let n=t[4];if(n!==1)throw Error(`Неподдерживаемая версия GB7: ${n}`);let r=(t[5]&1)==1,i=t[6]<<8|t[7],a=t[8]<<8|t[9],o=i*a,s=t.length-12;if(s<o)throw Error(`Недостаточно данных: ожидалось ${o}, получено ${s}`);return{width:i,height:a,hasMask:r,pixels:t.slice(12,12+o)}}function m(e){let{width:t,height:n,data:r}=e,i=12+t*n,a=new ArrayBuffer(i),o=new Uint8Array(a);o[0]=71,o[1]=66,o[2]=55,o[3]=29,o[4]=1,o[5]=0,o[6]=t>>8&255,o[7]=t&255,o[8]=n>>8&255,o[9]=n&255,o[10]=0,o[11]=0;for(let e=0;e<t*n;e++){let t=r[e*4+0],n=r[e*4+1],i=r[e*4+2],a=Math.round(.299*t+.587*n+.114*i);o[12+e]=Math.round(a/255*127)&127}return a}function h(e){let{width:t,height:n,hasMask:r,pixels:i}=e,a=new ImageData(t,n),o=a.data;for(let e=0;e<t*n;e++){let t=i[e],n=t&127,a=Math.round(n/127*255),s=255;r&&(s=t>>7&1?255:0),o[e*4+0]=a,o[e*4+1]=a,o[e*4+2]=a,o[e*4+3]=s}return a}var g=class{renderer;currentFileName=`image`;constructor(e){this.renderer=e}setFileName(e){this.currentFileName=e.replace(/\.[^/.]+$/,``)}bindSaveButtons(){document.getElementById(`btn-save-png`).addEventListener(`click`,()=>this.savePNG()),document.getElementById(`btn-save-jpg`).addEventListener(`click`,()=>this.saveJPG()),document.getElementById(`btn-save-gb7`).addEventListener(`click`,()=>this.saveGB7())}savePNG(){let e=this.renderer.getCanvas();this.renderer.getImageData()&&e.toBlob(e=>{e&&this.download(e,`${this.currentFileName}.png`)},`image/png`)}saveJPG(){let e=this.renderer.getCanvas();this.renderer.getImageData()&&e.toBlob(e=>{e&&this.download(e,`${this.currentFileName}.jpg`)},`image/jpeg`,.92)}saveGB7(){let e=this.renderer.getImageData();if(!e)return;let t=m(e),n=new Blob([t],{type:`application/octet-stream`});this.download(n,`${this.currentFileName}.gb7`)}download(e,t){let n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=t,r.click(),URL.revokeObjectURL(n)}},_=class{renderer;enabled={R:!0,G:!0,B:!0,A:!0};panel;originalImageData=null;channelDefs=[];constructor(e){this.renderer=e,this.panel=this.createPanel(),document.getElementById(`app`).appendChild(this.panel)}createPanel(){let e=document.createElement(`div`);return e.id=`channels-panel`,e.style.cssText=`
      position: fixed;
      right: 0;
      top: 40px;
      bottom: 24px;
      width: 170px;
      background: #252526;
      border-left: 1px solid #3e3e3e;
      display: flex;
      flex-direction: column;
      z-index: 5;
      overflow: hidden;
    `,e.innerHTML=`
      <div style="
        padding: 8px 10px;
        font-size: 11px;
        font-weight: 700;
        color: #9cdcfe;
        border-bottom: 1px solid #3e3e3e;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        flex-shrink: 0;
      ">Каналы</div>
      <div id="channel-list" style="
        flex: 1;
        overflow-y: auto;
        padding: 8px 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      "></div>
    `,e}setImage(e){this.originalImageData=e,this.enabled={R:!0,G:!0,B:!0,A:!0},this.channelDefs=this.detectChannels(e),this.buildUI()}detectChannels(e){let t=e.data,n=!1,r=!0;for(let e=0;e<t.length&&(t[e+3]<255&&(n=!0),(t[e]!==t[e+1]||t[e+1]!==t[e+2])&&(r=!1),!(n&&!r));e+=4);return r&&!n?[{key:`R`,label:`Gray`,color:`#aaaaaa`}]:r&&n?[{key:`R`,label:`Gray`,color:`#aaaaaa`},{key:`A`,label:`Alpha`,color:`#666666`}]:n?[{key:`R`,label:`Red`,color:`#f48771`},{key:`G`,label:`Green`,color:`#4ec9b0`},{key:`B`,label:`Blue`,color:`#569cd6`},{key:`A`,label:`Alpha`,color:`#666666`}]:[{key:`R`,label:`Red`,color:`#f48771`},{key:`G`,label:`Green`,color:`#4ec9b0`},{key:`B`,label:`Blue`,color:`#569cd6`}]}buildUI(){let e=document.getElementById(`channel-list`);e.innerHTML=``,e.appendChild(this.createChannelRow(null,`Все каналы`,`#ffffff`)),this.channelDefs.forEach(t=>{e.appendChild(this.createChannelRow(t.key,t.label,t.color))})}createChannelRow(e,t,n){let r=e!==null,i=e??`composite`,a=document.createElement(`div`);a.style.cssText=`
      display: flex;
      flex-direction: column;
      gap: 3px;
      cursor: ${r?`pointer`:`default`};
    `,a.dataset.channel=i;let o=document.createElement(`div`);o.style.cssText=`
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 0 2px;
      user-select: none;
    `;let s=document.createElement(`span`);s.style.cssText=`
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: ${n};
      flex-shrink: 0;
      display: inline-block;
    `;let c=document.createElement(`span`);c.style.cssText=`
      font-size: 12px;
      color: #d4d4d4;
      flex: 1;
    `,c.textContent=t;let l=document.createElement(`span`);l.style.cssText=`
      font-size: 13px;
      opacity: 1;
      transition: opacity 0.15s;
      pointer-events: none;
    `,l.textContent=`👁`,l.id=`eye-${i}`,o.appendChild(s),o.appendChild(c),r&&o.appendChild(l);let u=document.createElement(`canvas`);return u.width=140,u.height=90,u.style.cssText=`
      width: 100%;
      height: auto;
      border-radius: 3px;
      border: 2px solid ${r?`#0e639c`:`#3e3e3e`};
      display: block;
      pointer-events: none;
      transition: opacity 0.15s, border-color 0.15s;
    `,u.id=`thumb-${i}`,this.drawThumbnail(u,e),a.appendChild(o),a.appendChild(u),r&&a.addEventListener(`click`,()=>{this.toggleChannel(e)}),a}toggleChannel(e){this.enabled[e]=!this.enabled[e];let t=this.enabled[e],n=e,r=document.getElementById(`thumb-${n}`),i=document.getElementById(`eye-${n}`);r&&(r.style.opacity=t?`1`:`0.3`,r.style.borderColor=t?`#0e639c`:`#555`),i&&(i.style.opacity=t?`1`:`0.25`),this.applyChannels()}applyChannels(){if(!this.originalImageData)return;let e=this.originalImageData,t=this.renderer.getCanvas().getContext(`2d`),n=t.createImageData(e.width,e.height),r=e.width*e.height;for(let t=0;t<r;t++){let r=t*4;n.data[r]=this.enabled.R?e.data[r]:0,n.data[r+1]=this.enabled.G?e.data[r+1]:0,n.data[r+2]=this.enabled.B?e.data[r+2]:0,n.data[r+3]=this.enabled.A?e.data[r+3]:255}t.putImageData(n,0,0)}drawThumbnail(e,t){if(!this.originalImageData)return;let n=this.originalImageData,r=document.createElement(`canvas`);r.width=n.width,r.height=n.height;let i=r.getContext(`2d`),a=i.createImageData(n.width,n.height),o=n.width*n.height;for(let e=0;e<o;e++){let r=e*4;if(t===null)a.data[r]=n.data[r],a.data[r+1]=n.data[r+1],a.data[r+2]=n.data[r+2],a.data[r+3]=n.data[r+3];else if(t===`A`){let e=n.data[r+3];a.data[r]=e,a.data[r+1]=e,a.data[r+2]=e,a.data[r+3]=255}else{let e=t===`R`?0:t===`G`?1:2,i=n.data[r+e];a.data[r]=i,a.data[r+1]=i,a.data[r+2]=i,a.data[r+3]=255}}i.putImageData(a,0,0),e.getContext(`2d`).drawImage(r,0,0,e.width,e.height)}};function v(e){let t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function y(e,t,n){let r=v(e),i=v(t),a=v(n);return[r*.4124564+i*.3575761+a*.1804375,r*.2126729+i*.7151522+a*.072175,r*.0193339+i*.119192+a*.9503041]}function b(e,t,n){function r(e){return e>.008856?Math.cbrt(e):7.787*e+16/116}let i=r(e/.95047),a=r(t/1),o=r(n/1.08883);return[116*a-16,500*(i-a),200*(a-o)]}function x(e,t,n){let[r,i,a]=y(e,t,n);return b(r,i,a)}var S=class{renderer;canvas;active=!1;panel;constructor(e){this.renderer=e,this.canvas=e.getCanvas(),this.panel=this.createPanel(),document.getElementById(`canvas-area`).appendChild(this.panel),this.canvas.addEventListener(`click`,e=>this.onClick(e))}createPanel(){let e=document.createElement(`div`);return e.id=`eyedropper-panel`,e.style.cssText=`
      display: none;
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: #1e1e1e;
      border: 1px solid #3e3e3e;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 12px;
      color: #d4d4d4;
      min-width: 180px;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `,e.innerHTML=`
      <div style="font-weight:600; margin-bottom:8px; color:#9cdcfe;">🎨 Пипетка</div>
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <div id="color-preview" style="
          width:32px; height:32px;
          border-radius:4px;
          border:1px solid #555;
          background:#000;
          flex-shrink:0;
        "></div>
        <div>
          <div id="ep-coords" style="color:#888; font-size:11px;">X: — Y: —</div>
          <div id="ep-hex" style="font-weight:600; font-size:13px;">#000000</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
        <div><span style="color:#f48771;">R:</span> <span id="ep-r">—</span></div>
        <div><span style="color:#4ec9b0;">G:</span> <span id="ep-g">—</span></div>
        <div><span style="color:#569cd6;">B:</span> <span id="ep-b">—</span></div>
        <div><span style="color:#888;">A:</span> <span id="ep-a">—</span></div>
        <div style="grid-column:1/-1; margin-top:4px; border-top:1px solid #3e3e3e; padding-top:4px;">
          <span style="color:#c586c0;">L:</span> <span id="ep-l">—</span>
          <span style="color:#c586c0; margin-left:8px;">a:</span> <span id="ep-la">—</span>
          <span style="color:#c586c0; margin-left:8px;">b:</span> <span id="ep-lb">—</span>
        </div>
      </div>
    `,e}activate(){this.active=!0,this.canvas.style.cursor=`crosshair`}deactivate(){this.active=!1,this.canvas.style.cursor=`default`,this.panel.style.display=`none`}isActive(){return this.active}onClick(e){if(!this.active)return;let t=this.renderer.getImageData();if(!t)return;let n=this.canvas.getBoundingClientRect(),r=this.canvas.width/n.width,i=this.canvas.height/n.height,a=Math.floor((e.clientX-n.left)*r),o=Math.floor((e.clientY-n.top)*i);if(a<0||o<0||a>=t.width||o>=t.height)return;let s=(o*t.width+a)*4,c=t.data[s],l=t.data[s+1],u=t.data[s+2],d=t.data[s+3],[f,p,m]=x(c,l,u),h=`#${c.toString(16).padStart(2,`0`)}${l.toString(16).padStart(2,`0`)}${u.toString(16).padStart(2,`0`)}`;document.getElementById(`color-preview`).style.background=`rgb(${c},${l},${u})`,document.getElementById(`ep-coords`).textContent=`X: ${a}  Y: ${o}`,document.getElementById(`ep-hex`).textContent=h.toUpperCase(),document.getElementById(`ep-r`).textContent=String(c),document.getElementById(`ep-g`).textContent=String(l),document.getElementById(`ep-b`).textContent=String(u),document.getElementById(`ep-a`).textContent=String(d),document.getElementById(`ep-l`).textContent=f.toFixed(1),document.getElementById(`ep-la`).textContent=p.toFixed(1),document.getElementById(`ep-lb`).textContent=m.toFixed(1),this.panel.style.display=`block`}};function C(e,t){let n=e.data,r=Array(256).fill(0);for(let e=0;e<n.length;e+=4){let i=n[e],a=n[e+1],o=n[e+2],s=n[e+3],c;c=t===`master`?Math.round(.299*i+.587*a+.114*o):t===`R`?i:t===`G`?a:t===`B`?o:s,r[c]++}return{counts:r,max:Math.max(...r)}}function w(e,t,n,r){let i=e.getContext(`2d`),a=e.width,o=e.height;i.clearRect(0,0,a,o),i.fillStyle=`#1a1a1a`,i.fillRect(0,0,a,o);let{counts:s,max:c}=t,l=Math.log(c+1),u=a/256;i.fillStyle={master:`#aaaaaa`,R:`#f48771`,G:`#4ec9b0`,B:`#569cd6`,A:`#888888`}[n];for(let e=0;e<256;e++){let t=s[e],n;n=r?t>0?Math.log(t+1)/l:0:t/c;let a=n*o,d=e*u;i.fillRect(d,o-a,u+.5,a)}i.strokeStyle=`#2e2e2e`,i.lineWidth=1;for(let e=1;e<4;e++){let t=a/4*e;i.beginPath(),i.moveTo(t,0),i.lineTo(t,o),i.stroke()}}function T(){return{inBlack:0,inWhite:255,gamma:1}}function E(){return{master:T(),R:T(),G:T(),B:T(),A:T()}}function D(e){let t=new Uint8Array(256),{inBlack:n,inWhite:r,gamma:i}=e,a=r-n||1;for(let e=0;e<256;e++){let r=(e-n)/a;r=Math.max(0,Math.min(1,r)),i!==1&&(r**=1/i),t[e]=Math.round(r*255)}return t}function O(e,t){let n=new ImageData(new Uint8ClampedArray(e.data),e.width,e.height),r=D(t.R),i=D(t.G),a=D(t.B),o=D(t.A),s=D(t.master),c=t.master.inBlack===0&&t.master.inWhite===255&&t.master.gamma===1,l=n.data;for(let e=0;e<l.length;e+=4){let t=c?l[e]:s[l[e]],n=c?l[e+1]:s[l[e+1]],u=c?l[e+2]:s[l[e+2]],d=c?l[e+3]:s[l[e+3]];l[e]=r[t],l[e+1]=i[n],l[e+2]=a[u],l[e+3]=o[d]}return n}var k=class{renderer;dialog;histCanvas;originalImageData=null;levels=E();currentChannel=`master`;previewEnabled=!0;rafId=null;sliderBlack;sliderGamma;sliderWhite;numBlack;numGamma;numWhite;logCheckbox;channelSelect;constructor(e){this.renderer=e,this.buildDialog()}open(){let e=this.renderer.getImageData();if(!e){alert(`Сначала загрузите изображение`);return}this.originalImageData=e,this.levels=E(),this.currentChannel=`master`,this.previewEnabled=!0,this.syncUI(),this.redrawHistogram(),this.dialog.showModal()}buildDialog(){this.dialog=document.createElement(`dialog`),this.dialog.id=`levels-dialog`,this.dialog.style.cssText=`
      background: #2d2d2d;
      border: 1px solid #3e3e3e;
      border-radius: 8px;
      color: #d4d4d4;
      padding: 0;
      min-width: 460px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    `,this.dialog.innerHTML=`
      <style>
        #levels-dialog::backdrop { background: rgba(0,0,0,0.5); }
        #levels-dialog input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        #levels-dialog input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 18px;
          background: #d4d4d4;
          border-radius: 3px;
          cursor: pointer;
          border: 1px solid #888;
        }
        #levels-dialog input[type=number] {
          background: #1e1e1e;
          border: 1px solid #555;
          border-radius: 3px;
          color: #d4d4d4;
          padding: 2px 4px;
          width: 52px;
          font-size: 12px;
          text-align: center;
        }
        #levels-dialog select {
          background: #3c3c3c;
          border: 1px solid #555;
          border-radius: 4px;
          color: #d4d4d4;
          padding: 3px 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .lev-btn {
          padding: 5px 16px;
          border-radius: 4px;
          border: 1px solid #555;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .lev-btn-primary {
          background: #0e639c;
          border-color: #1177bb;
          color: #fff;
        }
        .lev-btn-primary:hover { background: #1177bb; }
        .lev-btn-secondary {
          background: #3c3c3c;
          color: #d4d4d4;
        }
        .lev-btn-secondary:hover { background: #505050; }
      </style>

      <!-- Заголовок -->
      <div style="
        padding: 12px 16px;
        border-bottom: 1px solid #3e3e3e;
        font-weight: 700;
        font-size: 14px;
        color: #9cdcfe;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <span>📊 Уровни (Levels)</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="font-size:12px; font-weight:400; color:#d4d4d4; display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="checkbox" id="lev-preview" checked style="cursor:pointer;" />
            Предпросмотр
          </label>
        </div>
      </div>

      <!-- Тело -->
      <div style="padding: 14px 16px; display:flex; flex-direction:column; gap:12px;">

        <!-- Выбор канала + лог -->
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; color:#888;">Канал:</span>
            <select id="lev-channel">
              <option value="master">Master (RGB)</option>
              <option value="R">Red</option>
              <option value="G">Green</option>
              <option value="B">Blue</option>
              <option value="A">Alpha</option>
            </select>
          </div>
          <label style="font-size:12px; color:#888; display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="checkbox" id="lev-log" style="cursor:pointer;" />
            Логарифмическая
          </label>
        </div>

        <!-- Гистограмма -->
        <div style="position:relative; border-radius:4px; overflow:hidden; border:1px solid #3e3e3e;">
          <canvas id="hist-canvas" width="428" height="120" style="display:block; width:100%;"></canvas>
        </div>

        <!-- Слайдеры Input Levels -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.06em;">
            Входные уровни
          </div>

          <!-- Чёрная точка -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; color:#888; width:64px;">Чёрная:</span>
            <input type="range" id="sl-black" min="0" max="254" value="0"
              style="flex:1; background: linear-gradient(to right, #000, #fff);" />
            <input type="number" id="num-black" min="0" max="254" value="0" />
          </div>

          <!-- Гамма -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; color:#888; width:64px;">Гамма:</span>
            <input type="range" id="sl-gamma" min="1" max="99" value="10"
              style="flex:1; background: #3c3c3c;" />
            <input type="number" id="num-gamma" min="0.1" max="9.9" step="0.1" value="1.0" />
          </div>

          <!-- Белая точка -->
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; color:#888; width:64px;">Белая:</span>
            <input type="range" id="sl-white" min="1" max="255" value="255"
              style="flex:1; background: linear-gradient(to right, #000, #fff);" />
            <input type="number" id="num-white" min="1" max="255" value="255" />
          </div>
        </div>

        <!-- Кнопки -->
        <div style="display:flex; justify-content:flex-end; gap:8px; padding-top:4px; border-top:1px solid #3e3e3e;">
          <button class="lev-btn lev-btn-secondary" id="lev-reset">Сброс</button>
          <button class="lev-btn lev-btn-secondary" id="lev-cancel">Отмена</button>
          <button class="lev-btn lev-btn-primary"   id="lev-apply">Применить</button>
        </div>

      </div>
    `,document.body.appendChild(this.dialog),this.bindElements(),this.bindEvents()}bindElements(){this.histCanvas=this.dialog.querySelector(`#hist-canvas`),this.sliderBlack=this.dialog.querySelector(`#sl-black`),this.sliderGamma=this.dialog.querySelector(`#sl-gamma`),this.sliderWhite=this.dialog.querySelector(`#sl-white`),this.numBlack=this.dialog.querySelector(`#num-black`),this.numGamma=this.dialog.querySelector(`#num-gamma`),this.numWhite=this.dialog.querySelector(`#num-white`),this.logCheckbox=this.dialog.querySelector(`#lev-log`),this.channelSelect=this.dialog.querySelector(`#lev-channel`)}bindEvents(){this.channelSelect.addEventListener(`change`,()=>{this.currentChannel=this.channelSelect.value,this.syncUI(),this.redrawHistogram()}),this.logCheckbox.addEventListener(`change`,()=>this.redrawHistogram());let e=this.dialog.querySelector(`#lev-preview`);e.addEventListener(`change`,()=>{this.previewEnabled=e.checked,this.previewEnabled?this.schedulePreview():this.renderer.getCanvas().getContext(`2d`).putImageData(this.originalImageData,0,0)});let t=()=>{let e=parseInt(this.sliderBlack.value),t=parseInt(this.sliderWhite.value),n=parseInt(this.sliderGamma.value)/10;if(e>=t){this.sliderBlack.value=String(t-1);return}this.levels[this.currentChannel]={inBlack:e,inWhite:t,gamma:n},this.syncNumbers(),this.schedulePreview()};this.sliderBlack.addEventListener(`input`,t),this.sliderGamma.addEventListener(`input`,t),this.sliderWhite.addEventListener(`input`,t);let n=()=>{let e=parseInt(this.numBlack.value)||0,t=parseInt(this.numWhite.value)||255,n=parseFloat(this.numGamma.value)||1;e=Math.max(0,Math.min(254,e)),t=Math.max(1,Math.min(255,t)),n=Math.max(.1,Math.min(9.9,n)),e>=t&&(e=t-1),this.levels[this.currentChannel]={inBlack:e,inWhite:t,gamma:n},this.syncSliders(),this.schedulePreview()};this.numBlack.addEventListener(`change`,n),this.numWhite.addEventListener(`change`,n),this.numGamma.addEventListener(`change`,n),this.dialog.querySelector(`#lev-reset`).addEventListener(`click`,()=>{this.levels[this.currentChannel]=T(),this.syncUI(),this.schedulePreview()}),this.dialog.querySelector(`#lev-cancel`).addEventListener(`click`,()=>{this.renderer.getCanvas().getContext(`2d`).putImageData(this.originalImageData,0,0),this.dialog.close()}),this.dialog.querySelector(`#lev-apply`).addEventListener(`click`,()=>{if(!this.originalImageData)return;let e=O(this.originalImageData,this.levels);this.renderer.render(e),this.dialog.close()})}syncUI(){let e=this.levels[this.currentChannel];this.sliderBlack.value=String(e.inBlack),this.sliderWhite.value=String(e.inWhite),this.sliderGamma.value=String(Math.round(e.gamma*10)),this.numBlack.value=String(e.inBlack),this.numWhite.value=String(e.inWhite),this.numGamma.value=e.gamma.toFixed(1),this.channelSelect.value=this.currentChannel}syncNumbers(){let e=this.levels[this.currentChannel];this.numBlack.value=String(e.inBlack),this.numWhite.value=String(e.inWhite),this.numGamma.value=e.gamma.toFixed(1)}syncSliders(){let e=this.levels[this.currentChannel];this.sliderBlack.value=String(e.inBlack),this.sliderWhite.value=String(e.inWhite),this.sliderGamma.value=String(Math.round(e.gamma*10))}redrawHistogram(){if(!this.originalImageData)return;let e=this.currentChannel===`master`?`master`:this.currentChannel,t=C(this.originalImageData,e);w(this.histCanvas,t,e,this.logCheckbox.checked)}schedulePreview(){!this.previewEnabled||!this.originalImageData||this.rafId===null&&(this.rafId=requestAnimationFrame(()=>{if(this.rafId=null,!this.originalImageData)return;let e=O(this.originalImageData,this.levels);this.renderer.getCanvas().getContext(`2d`).putImageData(e,0,0)}))}},A=document.getElementById(`main-canvas`),j=document.getElementById(`placeholder`),M=document.getElementById(`canvas-area`),N=document.getElementById(`file-input`),P=document.getElementById(`btn-open`),F=document.getElementById(`btn-eyedropper`),I=document.getElementById(`btn-levels`),L=new n(A),R=new u,z=new g(L),B=new _(L),V=new S(L),H=new k(L);z.bindSaveButtons();function U(){j.style.display=`none`,A.style.display=`block`,M.style.marginRight=`170px`}async function W(e){try{let{imageData:t,meta:n}=await s(e);L.render(t),R.update(n),z.setFileName(e.name),B.setImage(t),U()}catch(e){alert(`Ошибка загрузки: ${e.message}`)}}P.addEventListener(`click`,()=>N.click()),N.addEventListener(`change`,()=>{let e=N.files?.[0];e&&W(e)}),I.addEventListener(`click`,()=>H.open()),F.addEventListener(`click`,()=>{V.isActive()?(V.deactivate(),F.classList.remove(`active`)):(V.activate(),F.classList.add(`active`))}),M.addEventListener(`dragover`,e=>{e.preventDefault(),M.classList.add(`drag-over`)}),M.addEventListener(`dragleave`,()=>{M.classList.remove(`drag-over`)}),M.addEventListener(`drop`,e=>{e.preventDefault(),M.classList.remove(`drag-over`);let t=e.dataTransfer?.files[0];t&&W(t)}),window.addEventListener(`resize`,()=>L.fitToScreen());