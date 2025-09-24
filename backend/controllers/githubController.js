const axios = require('axios');

// This function fetches stats for a given GitHub username.
exports.getGithubStats = async (req, res) => {
    const { username } = req.params;

    // --- New Validation Step ---
    // A simple regex to check for valid GitHub username characters.
    // GitHub usernames can only contain alphanumeric characters and single hyphens.
    const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    if (!githubUsernameRegex.test(username)) {
        return res.status(400).json({ message: `Invalid GitHub username format. Usernames cannot contain spaces or special characters.` });
    }

    // We use a GitHub Personal Access Token for more reliable API access.
    // This should be stored securely in your .env file.
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization: `token ${token}` } : {};

    try {
        // Make two parallel API calls: one for the user profile, one for repositories.
        const [userResponse, reposResponse] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}`, { headers }),
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers })
        ]);

        const userData = userResponse.data;
        const reposData = reposResponse.data;

        // --- Process the data ---

        // Calculate the top languages from all repositories.
        const languageCounts = reposData.reduce((acc, repo) => {
            if (repo.language) {
                acc[repo.language] = (acc[repo.language] || 0) + 1;
            }
            return acc;
        }, {});

        const topLanguages = Object.entries(languageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Get the top 5
            .map(([name, count]) => ({ name, count }));

        // Get the top repositories sorted by stars.
        const topRepos = reposData
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5) // Get the top 5
            .map(repo => ({
                name: repo.name,
                url: repo.html_url,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
            }));

       // Send the final, formatted data object to the frontend.
        res.json({
        profile: {
            username: userData.login,
            name: userData.name,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            followers: userData.followers,
            following: userData.following,
            public_repos: userData.public_repos,
            url: userData.html_url,
        },
        topLanguages,
        topRepos,
        });


    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: `GitHub user "${username}" not found.` });
        }
        console.error('Error fetching GitHub stats:', error.message);
        res.status(500).json({ message: 'Failed to fetch GitHub stats.' });
    }
};

