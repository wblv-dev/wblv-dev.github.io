// Fetch GitHub stats at build time
module.exports = async function () {
  const USERNAME = "wblv-dev";
  const headers = { "User-Agent": "wblv-dev-site" };

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
      .filter(r => !r.fork && !r.private)
      .slice(0, 4)
      .map(r => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        pushed: r.pushed_at,
      }));

    const createdYear = new Date(user.created_at).getFullYear();
    const yearsActive = new Date().getFullYear() - createdYear;

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
    };
  }
};
