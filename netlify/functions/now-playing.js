const fetch = require('node-fetch');

// Это API Яндекса для получения статуса аккаунта (там содержится текущий трек)
const YM_API_STATUS_URL = 'https://api.music.yandex.net/account/status'; 

exports.handler = async (event, context) => {
  // Токен БЕРЕТСЯ ИЗ СКРЫТОЙ ПЕРЕМЕННОЙ ОКРУЖЕНИЯ NETLIFY
  const YM_TOKEN = process.env.YANDEX_MUSIC_TOKEN; 

  if (!YM_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Token is missing in Netlify settings" }),
    };
  }

  try {
    const response = await fetch(YM_API_STATUS_URL, {
      headers: {
        'Authorization': `OAuth ${YM_TOKEN}`, // Используем твой токен
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: `Yandex API error: ${errorText}` }),
        };
    }

    const data = await response.json();
    
    // Парсим ответ Яндекса
    const track = data.result && data.result.player && data.result.player.track;

    if (track) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                trackName: track.title,
                artistName: track.artists.map(a => a.name).join(', '),
            }),
        };
    } else {
        // Нет играющего трека
        return {
            statusCode: 200,
            body: JSON.stringify({ trackName: "Музыка не играет...", artistName: "Яндекс Музыка" }),
        };
    }

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error during fetch' }),
    };
  }
};
feat: add yandex music function.
