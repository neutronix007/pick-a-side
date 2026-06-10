// Netlify serverless function — proxies football-data.org to fix CORS
// Deployed at: /api/matches

const API_KEY = process.env.FOOTBALL_API_KEY || '5980b9fb8547400d8b269e92a0b8782f';
const BASE    = 'https://api.football-data.org/v4';

exports.handler = async function (event) {
  const params = event.queryStringParameters || {};

  // Which endpoint to hit — default to WC matches
  const endpoint = params.endpoint || 'competition-matches';

  let url;
  if (endpoint === 'team-matches') {
    // All matches for a specific team
    const teamId      = params.teamId || '774'; // 774 = South Africa, 769 = Mexico
    const competitions = params.competitions || 'WC';
    url = `${BASE}/teams/${teamId}/matches?competitions=${competitions}`;
  } else if (endpoint === 'competition-matches') {
    // All matches in a competition (e.g. full WC schedule)
    const competition = params.competition || 'WC';
    const matchday    = params.matchday   || '';
    url = `${BASE}/competitions/${competition}/matches${matchday ? `?matchday=${matchday}` : ''}`;
  } else if (endpoint === 'live') {
    // Only live matches right now
    url = `${BASE}/matches?competitions=WC&status=IN_PLAY`;
  } else if (endpoint === 'standings') {
    const competition = params.competition || 'WC';
    url = `${BASE}/competitions/${competition}/standings`;
  }

  try {
    const res  = await fetch(url, { headers: { 'X-Auth-Token': API_KEY } });
    const data = await res.json();

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
