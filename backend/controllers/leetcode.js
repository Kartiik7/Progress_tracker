const axios = require('axios');

exports.getLeetCodeStats = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ message: 'LeetCode username is required' });
  }

  try {
    // Using a publicly available, unofficial LeetCode API
    const response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`);
    res.json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
       return res.status(404).json({ message: 'LeetCode user not found' });
    }
    res.status(500).json({ message: err.message || 'Error fetching LeetCode stats' });
  }
};
