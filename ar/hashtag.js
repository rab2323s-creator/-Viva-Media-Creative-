const hashtagDB = {
  "تسويق": ["#تسويق", "#تسويق_رقمي", "#marketing", "#digitalmarketing", "#socialmedia"],
  "تصوير": ["#تصوير", "#photography", "#camera", "#contentcreator", "#visualstory"],
  "سفر": ["#سفر", "#travel", "#travellife", "#explore", "#adventure"]
};

function generateHashtags() {
  const topic = document.getElementById("topicInput").value.trim();
  const size = document.getElementById("accountSize").value;
  const results = document.getElementById("results");

  let tags = [];
  Object.keys(hashtagDB).forEach(key => {
    if (topic.includes(key)) tags = tags.concat(hashtagDB[key]);
  });

  tags = [...new Set(tags)];

  let split = { high: 3, mid: 7, low: 10 };
  if (size === "small") split = { high: 2, mid: 6, low: 12 };
  if (size === "large") split = { high: 6, mid: 6, low: 6 };

  results.innerHTML = `
    <h3>هاشتاغات قوية</h3><p>${tags.slice(0, split.high).join(" ")}</p>
    <h3>هاشتاغات متوسطة</h3><p>${tags.slice(split.high, split.high + split.mid).join(" ")}</p>
    <h3>هاشتاغات متخصصة</h3><p>${tags.slice(split.high + split.mid, split.high + split.mid + split.low).join(" ")}</p>
  `;
}
