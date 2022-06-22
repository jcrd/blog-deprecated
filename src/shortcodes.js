const gravatar = require("gravatar");

const icons = require("./icons");

module.exports.gravatar = (email, size) => {
  const url = gravatar.url(email, { size: size });
  return `<img src="https:${url}"/>`;
};

module.exports.icon = (name) => icons[name];

module.exports.notice = (content, label, color) =>
  `<div class="flex flex-col">
    <div class="bg-${color}-200 rounded-t font-bold">
      &nbsp;${label}
    </div>
    <div class="border border-t-0 rounded-b pl-1">
      <span class="prose">${content}</span>
    </div>
  </div>`;
