/* Shared About defaults and normalization; live content belongs in content.js. */
(function () {
  "use strict";
  var defaults = {
  "eyebrow": "A PERSON BEHIND THE PICTURES / 关于我",
  "headline": "Still figuring things out.*",
  "paragraphs": [
    "我是于卓平，目前在同济大学学习设计。",
    "我的经历有点杂。本科读的是数字媒体技术，毕业后做过一段时间商业 3D 角色动画，现在又在尝试 AI 影像、游戏和实时引擎。",
    "我还没有特别想把自己限定在某一种媒介里。相比工具本身，我好像一直更容易被角色、画面和故事吸引。想到一个东西的时候，我会试着找一种适合它的方式把它做出来——可能是动画、插画，也可能是一个可以互动的小作品。",
    "目前还在继续学习，也还在寻找自己最喜欢的创作方式。"
  ],
  "place": "SHANGHAI",
  "interests": [
    "GAMES",
    "ILLUSTRATION",
    "COFFEE"
  ],
  "coffeeNote": "probably too much.",
  "languages": [
    "中文 · Native",
    "English · CET-6",
    "日本語 · JLPT N2"
  ],
  "outsideOfWork": [
    "画画",
    "游戏",
    "猫",
    "咖啡",
    "观察一些奇怪的人和事"
  ],
  "catsNote": "Cats, obviously."
};
  function read(value) {
    var input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    var result = Object.assign({}, input);
    Object.keys(defaults).forEach(function (key) {
      if (Array.isArray(defaults[key])) result[key] = Array.isArray(input[key]) ? input[key].filter(function (x) {return typeof x === "string";}) : defaults[key].slice();
      else result[key] = typeof input[key] === "string" ? input[key] : defaults[key];
    });
    return result;
  }
  window.PORTFOLIO_ABOUT = {read:read};
})();
