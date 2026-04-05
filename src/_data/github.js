// Fetch GitHub stats at build time
module.exports = async function () {
  const USERNAME = "wblv-dev";
  const headers = { "User-Agent": "wblv-dev-site" };

  // Internal docs page per repo. When set, the homepage card links
  // here instead of GitHub. Leave as null to fall back to GitHub.
  const docsPaths = {
    "domain-security-toolkit": "/domain-security-toolkit/",
    "ats-cvc": "/ATS-CVC/",
    "wblv-private-cloud-lab": "/wblv-private-cloud-lab/",
  };

  try {
    // User info
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    const user = await userRes.json();

    // All public repos (sorted by pushed)
    const reposRes = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`,
      { headers }
    );
    const repos = await reposRes.json();

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];

    const recent = repos
      .filter(r => !r.fork && !r.private && r.name !== "wblv-dev.github.io")
      .slice(0, 6)
      .map(r => ({
        name: r.name,
        url: r.html_url,
        docs: docsPaths[r.name] || null,
        stars: r.stargazers_count,
        pushed: r.pushed_at,
      }));

    const createdYear = new Date(user.created_at).getFullYear();
    const yearsActive = new Date().getFullYear() - createdYear;

    // Public events (last 90 days, up to 100 events) — used to
    // build a rolling 13-week contribution grid.
    const eventsRes = await fetch(
      `https://api.github.com/users/${USERNAME}/events/public?per_page=100`,
      { headers }
    );
    const events = await eventsRes.json();

    // GitHub's public events feed strips commit-count fields out of
    // PushEvent payloads, so count each push as one unit of activity.
    const pushesByDay = {};
    if (Array.isArray(events)) {
      for (const ev of events) {
        if (ev.type === "PushEvent") {
          const day = ev.created_at.slice(0, 10);
          pushesByDay[day] = (pushesByDay[day] || 0) + 1;
        }
      }
    }

    // Build a 13-week × 7-day grid ending on the current week.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - 12 * 7);

    const contributions = [];
    for (let w = 0; w < 13; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + w * 7 + d);
        const key = date.toISOString().slice(0, 10);
        week.push({
          date: key,
          count: pushesByDay[key] || 0,
          future: date > today,
        });
      }
      contributions.push(week);
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const rangeLabel = `${months[startOfWeek.getMonth()]} – ${months[today.getMonth()]} ${today.getFullYear()}`;

    // Summary stats derived from the same events data.
    const totalPushes = Object.values(pushesByDay).reduce((a, b) => a + b, 0);
    const activeDays = Object.values(pushesByDay).filter(c => c > 0).length;
    const sortedDays = Object.keys(pushesByDay).sort();
    const lastActivityDay = sortedDays[sortedDays.length - 1] || null;
    // Most recently pushed repo (excluding the site itself).
    const currentRepo = repos
      .filter(r => !r.fork && !r.private && r.name !== "wblv-dev.github.io")
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0] || null;

    // Format last-activity as a short relative string ("2 days ago").
    let lastActivityLabel = "—";
    if (lastActivityDay) {
      const diffDays = Math.floor(
        (today - new Date(lastActivityDay)) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 0) lastActivityLabel = "Today";
      else if (diffDays === 1) lastActivityLabel = "Yesterday";
      else lastActivityLabel = `${diffDays} days ago`;
    }

    return {
      username: USERNAME,
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars,
      totalForks,
      languages,
      recent,
      yearsActive,
      createdYear,
      contributions,
      rangeLabel,
      totalPushes,
      activeDays,
      lastActivityLabel,
      currentRepo: currentRepo ? currentRepo.name : null,
    };
  } catch (err) {
    console.warn("GitHub data fetch failed:", err.message);
    return {
      username: USERNAME,
      publicRepos: 0,
      followers: 0,
      totalStars: 0,
      totalForks: 0,
      languages: [],
      recent: [],
      yearsActive: 0,
      createdYear: new Date().getFullYear(),
      contributions: [],
      rangeLabel: "",
      totalPushes: 0,
      activeDays: 0,
      lastActivityLabel: "—",
      currentRepo: null,
    };
  }
};
