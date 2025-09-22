const axios = require('axios');

// Get LeetCode stats for a given username
exports.getStats = async (req, res) => {
  const { username } = req.params;
  const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.message) {
      return res.status(404).json({ message: data.message });
    }

    // Use either totalSubmissions or matchedUserStats as fallback sources
    const byDiff = (arr, difficulty, field = 'count') =>
      Array.isArray(arr) ? arr.find(s => s.difficulty === difficulty)?.[field] : undefined;

    const totalSubmissionsArr =
      data.totalSubmissions || data.matchedUserStats?.totalSubmissionNum || [];

    const allSubmissions = totalSubmissionsArr.find(s => s.difficulty === 'All');
    const acceptanceRate =
      allSubmissions && Number(allSubmissions.submissions) > 0
        ? ((Number(data.totalSolved) / Number(allSubmissions.submissions)) * 100).toFixed(2)
        : 0;

    // Compute totals with fallbacks
    const totals = {
      totalQuestions:
        data.totalQuestions ??
        data.totalQuestion ??
        byDiff(totalSubmissionsArr, 'All', 'count'), // last-ditch, not perfect but better than undefined
      totalEasy: data.totalEasy ?? byDiff(totalSubmissionsArr, 'Easy', 'count'),
      totalMedium: data.totalMedium ?? byDiff(totalSubmissionsArr, 'Medium', 'count'),
      totalHard: data.totalHard ?? byDiff(totalSubmissionsArr, 'Hard', 'count'),
    };

    // Construct stats and provide alias keys to match various frontends
    const stats = {
      totalSolved: Number(data.totalSolved),
      totalQuestions: Number(totals.totalQuestions),
      // Aliases for compatibility
      totalQuestion: Number(totals.totalQuestions),
      totalQuestionsCount: Number(totals.totalQuestions),

      easySolved: Number(data.easySolved),
      mediumSolved: Number(data.mediumSolved),
      hardSolved: Number(data.hardSolved),

      totalEasy: Number(totals.totalEasy),
      totalMedium: Number(totals.totalMedium),
      totalHard: Number(totals.totalHard),
      // Aliases for compatibility
      easyTotal: Number(totals.totalEasy),
      mediumTotal: Number(totals.totalMedium),
      hardTotal: Number(totals.totalHard),

      acceptanceRate: parseFloat(acceptanceRate),
      ranking: data.ranking,
      contributionPoint: data.contributionPoint,
      submissionCalendar: data.submissionCalendar,
    };

    res.json(stats);

  } catch (err) {
    console.error(`Error fetching LeetCode stats for ${username}:`, err.message);
    if (err.response) {
      if (err.response.status === 404) {
        return res.status(404).json({ message: `Could not find a profile for "${username}".` });
      }
      return res.status(500).json({ message: `The LeetCode API returned an error (Status: ${err.response.status}).` });
    }
    return res.status(502).json({ message: 'The external LeetCode API seems to be down.' });
  }
};

