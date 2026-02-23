import{ao as f}from"./index-1fe839ca.js";var T={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};const G=f(T),b="a-f\\d",U=`#?[${b}]{3}[${b}]?`,z=`#?[${b}]{6}([${b}]{2})?`,V=new RegExp(`[^#${b}]`,"gi"),X=new RegExp(`^${U}$|^${z}$`,"i");var D=(r,e={})=>{if(typeof r!="string"||V.test(r)||!X.test(r))throw new TypeError("Expected a valid hex string");r=r.replace(/^#/,"");let t=1;r.length===8&&(t=Number.parseInt(r.slice(6,8),16)/255,r=r.slice(0,6)),r.length===4&&(t=Number.parseInt(r.slice(3,4).repeat(2),16)/255,r=r.slice(0,3)),r.length===3&&(r=r[0]+r[0]+r[1]+r[1]+r[2]+r[2]);const n=Number.parseInt(r,16),a=n>>16,s=n>>8&255,l=n&255,o=typeof e.alpha=="number"?e.alpha:t;if(e.format==="array")return[a,s,l,o];if(e.format==="css"){const i=o===1?"":` / ${Number((o*100).toFixed(2))}%`;return`rgb(${a} ${s} ${l}${i})`}return{red:a,green:s,blue:l,alpha:o}};const L=f(D),J=/^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/;var K=new RegExp(J,"i");const S="-?\\d*(?:\\.\\d+)",p=`(${S}?)`,g=`(${S}?%)`,$=`(${S}?%?)`,Q=`^
  hsla?\\(
    \\s*(-?\\d*(?:\\.\\d+)?(?:deg|rad|turn)?)\\s*,
    \\s*${g}\\s*,
    \\s*${g}\\s*
    (?:,\\s*${$}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var Y=new RegExp(Q);const Z=`^
  hsla?\\(
    \\s*(-?\\d*(?:\\.\\d+)?(?:deg|rad|turn)?)\\s*
    \\s+${g}
    \\s+${g}
    \\s*(?:\\s*\\/\\s*${$}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var ee=new RegExp(Z);const re=`^
  rgba?\\(
    \\s*${p}\\s*,
    \\s*${p}\\s*,
    \\s*${p}\\s*
    (?:,\\s*${$}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var te=new RegExp(re);const ae=`^
  rgba?\\(
    \\s*${g}\\s*,
    \\s*${g}\\s*,
    \\s*${g}\\s*
    (?:,\\s*${$}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var ne=new RegExp(ae);const se=`^
  rgba?\\(
    \\s*${p}
    \\s+${p}
    \\s+${p}
    \\s*(?:\\s*\\/\\s*${$}\\s*)?
  \\)
$
`.replace(/\n|\s/g,"");var le=new RegExp(se);const oe=`^
  rgba?\\(
    \\s*${g}
    \\s+${g}
    \\s+${g}
    \\s*(?:\\s*\\/\\s*${$}\\s*)?
  \\)
$
`.replace(/\n|\s/g,"");var ie=new RegExp(oe);const ue=/^transparent$/;var ge=new RegExp(ue,"i");const N=(r,e,t)=>Math.min(Math.max(e,r),t),ce=r=>{let e=r;return typeof e!="number"&&(e=e.endsWith("%")?parseFloat(e)*255/100:parseFloat(e)),N(Math.round(e),0,255)},q=r=>N(parseFloat(r),0,100);function j(r){let e=r;return typeof e!="number"&&(e=e.endsWith("%")?parseFloat(e)/100:parseFloat(e)),N(e,0,1)}function pe(r){const[e,t,n,a]=L(r,{format:"array"});return k([null,e,t,n,a])}function he([,r,e,t,n=1]){let a=r;return a.endsWith("turn")?a=parseFloat(a)*360/1:a.endsWith("rad")?a=Math.round(parseFloat(a)*180/Math.PI):a=parseFloat(a),{type:"hsl",values:[a,q(e),q(t)],alpha:j(n===null?1:n)}}function k([,r,e,t,n=1]){return{type:"rgb",values:[r,e,t].map(ce),alpha:j(n===null?1:n)}}/**
 * parse-css-color
 * @version v0.1.2
 * @link http://github.com/noeldelgado/parse-css-color/
 * @license MIT
 */const $e=r=>{if(typeof r!="string")return null;const e=K.exec(r);if(e)return pe(e[0]);const t=ee.exec(r)||Y.exec(r);if(t)return he(t);const n=le.exec(r)||ie.exec(r)||te.exec(r)||ne.exec(r);if(n)return k(n);if(ge.exec(r))return k([null,0,0,0,0]);const a=G[r.toLowerCase()];return a?k([null,a[0],a[1],a[2],1]):null};function de(r){var e=r[0]/360,t=r[1]/100,n=r[2]/100,a,s,l,o,i;if(t==0)return i=n*255,[i,i,i];n<.5?s=n*(1+t):s=n+t-n*t,a=2*n-s,o=[0,0,0];for(var u=0;u<3;u++)l=e+1/3*-(u-1),l<0&&l++,l>1&&l--,6*l<1?i=a+(s-a)*6*l:2*l<1?i=s:3*l<2?i=a+(s-a)*(2/3-l)*6:i=a,o[u]=i*255;return o}var be=de;const A=f(be);function me(r,e,t){return Math.min(Math.max(r,e),t)}var fe=me,ye=fe;function x(r){var e=Math.round(ye(r,0,255)),t=e.toString(16);return t.length==1?"0"+t:t}function ve(r){var e=r.length===4?x(r[3]*255):"";return"#"+x(r[0])+x(r[1])+x(r[2])+e}var we=ve;const M=f(we);function xe(r){var e=r[0]/255,t=r[1]/255,n=r[2]/255,a=Math.min(e,t,n),s=Math.max(e,t,n),l=s-a,o,i,u;return s==a?o=0:e==s?o=(t-n)/l:t==s?o=2+(n-e)/l:n==s&&(o=4+(e-t)/l),o=Math.min(o*60,360),o<0&&(o+=360),u=(a+s)/2,s==a?i=0:u<=.5?i=l/(s+a):i=l/(2-s-a),[o,i*100,u*100]}var Re=xe;const ke=f(Re);/**
 * mix-css-color
 * @version v0.2.0
 * @link http://github.com/noeldelgado/mix-css-color/
 * @license MIT
 */function W(r){const e=$e(r);return e===null?null:(e.type==="hsl"&&(e.values=A(e.values)),e)}function _(r,e,t=50){const n=W(r),a=W(e);if(!n||!a)return null;const s=Math.min(Math.max(0,t),100)/100,l=s*2-1,o=n.alpha-a.alpha,i=((l*o===-1?l:(l+o)/(1+l*o))+1)/2,u=1-i,[y,v,w]=n.values.map((Ue,P)=>Math.round(n.values[P]*i+a.values[P]*u)),F=parseFloat((n.alpha*s+a.alpha*(1-s)).toFixed(8));return{hex:M([y,v,w]),hexa:M([y,v,w,F]),rgba:[y,v,w,F],hsla:[...ke([y,v,w]).map(Math.round),F]}}const Ee=/^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/;var Fe=new RegExp(Ee,"i");const C="-?\\d*(?:\\.\\d+)",h=`(${C}?)`,c=`(${C}?%)`,d=`(${C}?%?)`,Me=`^
  hsla?\\(
    \\s*(-?\\d*(?:\\.\\d+)?(?:deg|rad|turn)?)\\s*,
    \\s*${c}\\s*,
    \\s*${c}\\s*
    (?:,\\s*${d}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var Se=new RegExp(Me);const Ne=`^
  hsla?\\(
    \\s*(-?\\d*(?:\\.\\d+)?(?:deg|rad|turn)?)\\s*
    \\s+${c}
    \\s+${c}
    \\s*(?:\\s*\\/\\s*${d}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var Ce=new RegExp(Ne);const He=`^
  rgba?\\(
    \\s*${h}\\s*,
    \\s*${h}\\s*,
    \\s*${h}\\s*
    (?:,\\s*${d}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var Pe=new RegExp(He);const qe=`^
  rgba?\\(
    \\s*${c}\\s*,
    \\s*${c}\\s*,
    \\s*${c}\\s*
    (?:,\\s*${d}\\s*)?
  \\)
  $
`.replace(/\n|\s/g,"");var We=new RegExp(qe);const _e=`^
  rgba?\\(
    \\s*${h}
    \\s+${h}
    \\s+${h}
    \\s*(?:\\s*\\/\\s*${d}\\s*)?
  \\)
$
`.replace(/\n|\s/g,"");var Ie=new RegExp(_e);const Be=`^
  rgba?\\(
    \\s*${c}
    \\s+${c}
    \\s+${c}
    \\s*(?:\\s*\\/\\s*${d}\\s*)?
  \\)
$
`.replace(/\n|\s/g,"");var Ge=new RegExp(Be);const Le=/^transparent$/;var je=new RegExp(Le,"i");const H=(r,e,t)=>Math.min(Math.max(e,r),t),Ae=r=>{let e=r;return typeof e!="number"&&(e=e.endsWith("%")?parseFloat(e)*255/100:parseFloat(e)),H(Math.round(e),0,255)},I=r=>H(parseFloat(r),0,100);function O(r){let e=r;return typeof e!="number"&&(e=e.endsWith("%")?parseFloat(e)/100:parseFloat(e)),H(e,0,1)}function Oe(r){const[e,t,n,a]=L(r,{format:"array"});return E([null,e,t,n,a])}function Te([,r,e,t,n=1]){let a=r;return a.endsWith("turn")?a=parseFloat(a)*360/1:a.endsWith("rad")?a=Math.round(parseFloat(a)*180/Math.PI):a=parseFloat(a),{type:"hsl",values:[a,I(e),I(t)],alpha:O(n===null?1:n)}}function E([,r,e,t,n=1]){return{type:"rgb",values:[r,e,t].map(Ae),alpha:O(n===null?1:n)}}/**
 * parse-css-color
 * @version v0.2.0
 * @link http://github.com/noeldelgado/parse-css-color/
 * @license MIT
 */const B=r=>{if(typeof r!="string")return null;const e=Fe.exec(r);if(e)return Oe(e[0]);const t=Ce.exec(r)||Se.exec(r);if(t)return Te(t);const n=Ie.exec(r)||Ge.exec(r)||Pe.exec(r)||We.exec(r);if(n)return E(n);if(je.exec(r))return E([null,0,0,0,0]);const a=G[r.toLowerCase()];return a?E([null,a[0],a[1],a[2],1]):null};/**
 * values.js - Get the tints and shades of a color
 * @version v2.1.1
 * @link http://noeldelgado.github.io/values.js/
 * @license MIT
 */const R=(r,e)=>r===null||isNaN(r)||typeof r=="string"?e:r;class m{constructor(e="#000",t="base",n=0){[this.rgb,this.alpha,this.type,this.weight]=[[0,0,0],1,t,n];const a=e===null?"#000":e;if(typeof a!="string")throw new TypeError(`Input should be a string: ${a}`);const s=B(a);if(!s)throw new Error(`Unable to parse color from string: ${a}`);return this[`_setFrom${s.type.toUpperCase()}`]([...s.values,s.alpha])}get hex(){return this.hexString().replace(/^#/,"")}setColor(e){const t=B(e);return t?this[`_setFrom${t.type.toUpperCase()}`]([...t.values,t.alpha]):null}tint(e,t=R(e,50)){return new m(`rgb(${_("#fff",this.rgbString(),t).rgba})`,"tint",t)}shade(e,t=R(e,50)){return new m(`rgb(${_("#000",this.rgbString(),t).rgba})`,"shade",t)}tints(e,t=R(e,10)){return Array.from({length:100/t},(n,a)=>this.tint((a+1)*t))}shades(e,t=R(e,10)){return Array.from({length:100/t},(n,a)=>this.shade((a+1)*t))}all(e=10){return[...this.tints(e).reverse(),Object.assign(this),...this.shades(e)]}hexString(){return M(this.alpha>=1?this.rgb:[...this.rgb,this.alpha])}rgbString(){const e=(this.alpha>=1?this.rgb:[...this.rgb,this.alpha]).join(", ");return`${this.alpha>=1?"rgb":"rgba"}(${e})`}getBrightness(){return Math.round(this.rgb.reduce((e,t)=>e+t)/(255*3)*100)}_setFromRGB([e,t,n,a]){return[this.rgb,this.alpha]=[[e,t,n],a],this}_setFromHSL([e,t,n,a]){return[this.rgb,this.alpha]=[A([e,t,n]).map(Math.round),a],this}}m.VERSION="v2.1.1";const Ve=m;export{Ve as V};
