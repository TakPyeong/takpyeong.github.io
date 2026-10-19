/* Home content defaults only. Hero design/interaction are not managed here. */
(function(){
  "use strict";
  var defaults={
  "portfolioLabel": "PORTFOLIO",
  "year": "2026",
  "cornerLabel": "IMAGE / SPACE / TIME",
  "visualWord": "VISUAL",
  "motionWord": "MOTION",
  "practiceLabel": "PRACTICE / 创作方向",
  "practices": [
    "AI Film",
    "3D Animation",
    "Visual",
    "Real-time"
  ],
  "nameZh": "于卓平",
  "nameEn": "Yu Zhuoping",
  "roleZh": "视觉创作 / AI 影像 / 三维动画",
  "roleEn": "Visual Creation · AI Film · 3D Animation",
  "introZh": "以影像、三维动画与实时引擎为媒介，关注视觉叙事、角色表现与数字体验。",
  "introEn": "Working across AI film, 3D animation and real-time media, with a focus on visual storytelling, character performance and digital experiences.",
  "fields": [
    "AI 影像",
    "三维动画",
    "视觉设计",
    "游戏 / 实时引擎"
  ]
};
  function read(value){
    var input=value&&typeof value==="object"&&!Array.isArray(value)?value:{},out=Object.assign({},input);
    Object.keys(defaults).forEach(function(key){
      out[key]=Array.isArray(defaults[key])?(Array.isArray(input[key])?input[key].filter(function(item){return typeof item==="string"}):defaults[key].slice()):(typeof input[key]==="string"?input[key]:defaults[key]);
    });return out;
  }
  window.PORTFOLIO_HOME={read:read};
})();
