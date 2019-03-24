!function(){"use strict";var f=Math.min,W=Math.max,X=Math.round,j=Math.abs;function m(t,i,n,e){for(var o=0;o<i.length;o++)!1===e?t.removeEventListener(i[o],n):t.addEventListener(i[o],n)}var n={padding:10,minimapHeightRel:.14,minimapBandSize:12,colors:{background:"#fff",minimap:"#f8f8ff",minimapFrame:"#c8dde8",minimapDrag:"rgba(200, 190, 190, 0.2)",label:"#aaa"}},e={run:!1,duration:250,ts:0,from:0,to:0,pos:0,onComplete:null};function t(t,i){if(this.data=null,this.names={},this.options=n,this.container=document.getElementById(t),!this.container)throw new Error("chart container not found!");this.canvas=this.container.appendChild(document.createElement("canvas")),this.ctx=this.canvas.getContext("2d"),this.ctx.font=window.getComputedStyle(this.container,null).font,this.font=this.ctx.font,this.vw=0,this.vh=0,this.select=-1,this.controls={h:0,vh:0,width:0},this.minimap={left:0,right:0,rlLeft:.75,rlRight:1,vh:0},this._transitions={minimap:Object.create(e),graph:Object.create(e),pointer:Object.create(e)},this.setData(i);m(window,["resize","load"],function(){this.vw=this.canvas.width=this.container.clientWidth,this.vh=this.canvas.height=this.container.clientHeight,this.minimap.left=X(this.vw*this.minimap.rlLeft),this.minimap.right=X(this.vw*this.minimap.rlRight),this.minimap.vh=X(this.vh*this.options.minimapHeightRel),this.controls.vh=X(.15*this.vh)*(1+Math.floor((this.controls.width+this.controls.h)/this.vw)),this.select=-1,this.draw()}.bind(this)),m(this.canvas,["mousemove","toucmove"],this.move.bind(this)),m(this.canvas,["mousedown","touchstart"],this.mousetouch.bind(this))}(function(){var o=0,r=0,a={mode:0,start:0,left:0,right:0,runBnd:null,doneBnd:null};function s(t){var i=t.minimap,n=X(.1*i.vh);return{y:t.vh-i.vh+n-t.controls.vh,x:i.left,w:i.right-i.left,h:i.vh-2*n}}function h(t,i){var n=t.options.padding,e=t.controls,o=t.names,r=n,s=t.vh-e.vh+n;for(var a in t.data.names)r+o[a].width>t.vw-n&&(r=n,s=s+e.h+n),i({x:r,y:s,w:o[a].width,h:e.h},a),r=r+o[a].width+n,0}function l(t,i,n){return n.x<=t&&t<=n.x+n.w&&n.y<=i&&i<=n.y+n.h}function Y(t,i){for(var n=0;n<t.columns.length;n++)if(t.columns[n][0]===i)return t.columns[n];return null}function _(t,n,e){return t.replace(/(\d*\.?\d+)px/,function(t,i){return(e?"bold ":"")+Number(Number(i)+n)+"px"})}function z(t,i){return String.prototype.substr.apply(new Date(t),[[0,3],[4,11],[4,6],[11,4]][i])}function E(t,i,n,e,o,r,s){var a=["arcTo","lineTo"];return s=s||[0,0,0,0],t.moveTo(i+r,n),t[a[s[0]]](i+e,n,i+e,n+o,r),t[a[s[1]]](i+e,n+o,i,n+o,r),t[a[s[2]]](i,n+o,i,n,r),t[a[s[3]]](i,n,i+e,n,r),t}function c(t,i,n,e,o,r,s){var a=t.ctx,h=a.measureText("M").width;r&&(n=n-h-8);var l=t.data,c=t.names,f=t.vw,m=f/(t.dataLength-1),u=0,d=t.vw,v=0,p=t.dataLength;e&&(u=t.minimap.left,d=t.minimap.right,v=X(u/m),p=X(d/m));var g=1/(d/f-u/f),w=n/s,y=i+n,x=0;for(var b in a.lineWidth=o,a.lineJoin="round",a.font=t.font,c)if(c[b].visible){x++,a.beginPath(),a.strokeStyle=l.colors[b];for(var T=Y(l,b),S=v;S<=p;S++)a.lineTo((S*m-u)*g,y-T[S+1]*w);a.stroke()}if(r&&0===x){var B="No data to display",P=a.measureText(B).width;return a.fillStyle=t.options.colors.label,a.font=_(a.font,4,!1),void a.fillText(B,f/2-P/2,n/2)}if(r){a.lineWidth=.2,a.beginPath(),a.strokeStyle="grey";var M=s/8;a.fillStyle=t.options.colors.label;for(i=0;i<8;i++)a.moveTo(0,y-i*M*w),a.lineTo(f,y-i*M*w),a.fillText(X(i*M).toString(),5,y-i*M*w-h);a.stroke();var k=8*h,R=W(j(p-v)/f*k,1),L=Y(l,"x");for(S=v;S<p;S++){var C=z(L[S+1],2),D=a.measureText(C).width;S%X(R)==0&&(a.fillStyle=t.options.colors.label,a.fillText(C,X((S*m-u)*g-D/2),y+h+6))}if(-1!==t.select){S=X((u*g+t.select)/(g*m));a.beginPath(),a.strokeStyle="grey",a.lineWidth=.5;var I=S*m*g-u*g;for(var b in a.moveTo(I,1.8*h),a.lineTo(I,n-1.8*h),a.stroke(),a.lineWidth=o,c)if(c[b].visible){T=Y(l,b);a.beginPath(),a.strokeStyle=l.colors[b],a.fillStyle="#fff";i=y-T[S+1]*w;a.arc(I,i,4,0,2*Math.PI,!1),a.fill(),a.stroke()}!function(t,i,n,e,o,r,s,a,h,l){var c=Y(n,"x")[o],f=z(c,0)+", "+z(c,2),m=t.measureText(f).width,u={},d=0;for(var v in n.names)e[v].visible&&(u[v]={},u[v].name=n.names[v],u[v].value=Y(n,v)[o],u[v].width=W(t.measureText(u[v].name).width,t.measureText(u[v].value).width),u[v].color=n.colors[v],d+=u[v].width+10);(i-=(d=W(m,d)+10)/2)<0&&(i=0),l<i+d&&(i=l-d),t.fillStyle=s,t.strokeStyle=a,t.beginPath(),E(t,i,1,d,3*r+10,6).fill(),t.stroke(),t.fillStyle=h,t.beginPath(),t.fillText(f,i+d/2-m/2,r+2.5);var p=0,g=i,w=t.font,y=_(t.font,2,!0);for(v in u)t.fillStyle=u[v].color,p=u[v].width,t.font=y,t.fillText(u[v].value,g+10,2*r+2.5),t.font=w,t.fillText(u[v].name,g+10,3*r+2.5),g=g+p+10;t.fill()}(a,I,l,t.names,S+1,1.4*h,t.options.colors.background,t.options.colors.minimap,t.options.colors.label,f)}}}function t(){var t=this.ctx;t.fillStyle=this.options.colors.background,t.fillRect(0,0,this.vw,this.vh),t.font=this.font,function(t){var i=t.ctx,n=t.options.minimapBandSize,e=t.options.colors,o=s(t);i.beginPath(),i.fillStyle=e.minimap,i.fillRect(0,o.y,o.x+n,o.h),i.fillRect(o.x+o.w-n,o.y,t.vw-o.x-o.w+n,o.h),i.fillStyle=e.minimapFrame,E(i,o.x,o.y,n,o.h,6,[1,1,0,0]),E(i,o.x+o.w-n,o.y,n,o.h,6,[0,0,1,1]),i.fill(),i.fillRect(o.x+n,o.y,o.w-2*n,2),i.fillRect(o.x+n,o.y+o.h-2,o.w-2*n,2),c(t,o.y,o.h,!1,1,!1,t.getMaxY(1,t.dataLength)),0!==a.mode&&(i.beginPath(),i.fillStyle=e.minimapDrag,i.arc(o.x+[0,n/2,o.w-n/2,o.w/2][a.mode],o.y+o.h/2,t._transitions.minimap.pos,0,2*Math.PI,!1),i.fill())}(this),function(n){var e=n.ctx;e.font=_(n.font,4);var o=n.data;h(n,function(t,i){e.beginPath(),e.fillStyle=n.options.colors.minimap,E(e,t.x,t.y,t.w,t.h,t.h/2).fill(),e.textBaseline="middle",n.names[i].visible?(e.beginPath(),e.fillStyle=o.colors[i],e.arc(t.x+t.h/2,t.y+t.h/2,t.h/3,0,2*Math.PI,!1),e.fill(),e.beginPath(),e.fillStyle="#fff",e.fillText("✓",t.x+t.h/2.7,t.y+t.h/2)):(e.beginPath(),e.strokeStyle=o.colors[i],e.arc(t.x+t.h/2,t.y+t.h/2,t.h/3,0,2*Math.PI,!1),e.stroke()),e.fillStyle=o.colors[i],e.beginPath(),e.fillText(o.names[i],t.x+t.h,t.y+t.h/2),e.textBaseline="bottom"})}(this),c(this,0,X(this.vh-this.minimap.vh-this.controls.vh),!0,2,!0,this._transitions.graph.pos);var i=this._transitions.pointer.pos;0<i&&(t.beginPath(),t.fillStyle="rgba(200, 190, 190, 0.2)",t.arc(o,r,i,0,2*Math.PI,!1),12<i&&t.arc(o,r,i-12,0,2*Math.PI,!0),t.fill()),function(t){var i=!1;for(var n in t){var e=t[n];i=i||e.run,e.run&&(e.pos=e.from+(e.to-e.from)/e.duration*(performance.now()-e.ts),(e.to>e.from&&e.pos>=e.to||e.to<e.from&&e.pos<=e.to||e.to===e.from)&&(e.run=!1,e.pos=e.to,e.onComplete&&e.onComplete()))}return i}(this._transitions)&&this.draw()}this.draw=function(){requestAnimationFrame(t.bind(this))},this.move=function(t){var i=t.target.getBoundingClientRect();"touchstart"===t.type&&(t=t.targetTouches[0]);var n=t.clientX-i.left;t.clientY-i.top<this.vh-this.minimap.vh-this.controls.vh&&(this.select=n,this.draw())},this.mousetouch=function(t){if(!a.runBnd&&!a.doneBnd){var i=t.target.getBoundingClientRect(),n=t;if("touchstart"===t.type&&(t=t.targetTouches[0]),o=t.clientX-i.left,r=t.clientY-i.top,a.mode=function(t,i,n){var e=s(t),o=t.options.minimapBandSize;return n<e.y?7:l(i,n,e)?i<e.x+o?1:i>e.x+e.w-o?2:3:0}(this,o,r),0<a.mode)t.target.style.cursor="w-resize",a.start=t.clientX,a.left=this.minimap.left,a.right=this.minimap.right,a.runBnd=function(t){this.select=-1,"touchmove"===t.type&&(t=t.targetTouches[0]);var i=t.clientX-a.start,n=this.minimap,e=this.options.minimapBandSize;4&a.mode&&(i=-i),1&a.mode&&(n.left=a.left+i,n.left=W(n.left,1),n.left=f(n.left,n.right-2*e-1)),2&a.mode&&(n.right=a.right+i,n.right=f(n.right,this.vw-1),n.right=W(n.right,n.left+2*e+1)),n.rlLeft=n.left/this.vw,n.rlRight=n.right/this.vw;var o=this.vw/(this.dataLength-1),r=X(n.left/o),s=X(n.right/o);this.initTransition("graph","current",this.getMaxY(r,s))}.bind(this),a.doneBnd=function(t){"touchmove"!==t.type&&(t.target.style.cursor="default"),m(document,["mousemove","touchmove"],a.runBnd,!1),m(document,["mouseup","touchend"],a.doneBnd,!1),a.runBnd=null,a.doneBnd=null,this.initTransition("minimap","current",0,function(){a.mode=0})}.bind(this),m(document,["mousemove","touchmove"],a.runBnd),m(document,["mouseup","touchend"],a.doneBnd),this.initTransition("minimap","current",X(this.minimap.vh/2));else{var e=this;h(this,function(t,i){l(o,r,t)&&(n.preventDefault(),e.setVisibility(i),e.initTransition("pointer","current",50,function(){e._transitions.pointer.pos=0}.bind(e)))})}}},this.setData=function(t){this.data=t;try{this.dataLength=t.columns[0].length-1}catch(t){throw new TypeError("incorrect <inputData> format")}var i=this.ctx;for(var n in i.font=_(this.font,4,!0),this.controls.h=3.5*i.measureText("M").width,this.controls.width=0,this.names={},t.names){var e=i.measureText(t.names[n]).width+this.controls.h+this.options.padding;this.controls.width+=e,this.names[n]={visible:!0,width:e}}this.initTransition("graph","current",this.getMaxY())},this.setVisibility=function(t,i){this.names[t].visible=void 0===i?!this.names[t].visible:i,this.initTransition("graph","current",this.getMaxY())},this.getMaxY=function(t,i){var n=0;for(var e in t=t||0,i=i||this.dataLength,this.names)if(this.names[e].visible)for(var o=Y(this.data,e),r=t+1;r<i+1;r++)n=W(n,o[r]);return n},this.initTransition=function(t,i,n,e){var o=this._transitions,r=o[t];r.from="current"===i?r.pos:i,r.pos=r.from,r.to=n,r.ts=performance.now(),r.onComplete=e;var s=!1;for(var a in o)s=s||o[a].run;s||this.draw(),r.run=!0}}).call(t.prototype),"undefined"!=typeof window&&(window.VanillaChart=t)}();