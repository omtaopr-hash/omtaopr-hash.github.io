// Этот API-клиент нужен для запросов к сторонним сервисам (Яндекс)
const fetch = require('node-fetch');

// Это API Яндекса для получения статуса аккаунта (там содержится текущий трек)
const YM_API_STATUS_URL = 'https://api.music.yandex.net/account/status';

// Главная функция, которую вызывает Netlify
exports.handler = async (event, context) => {
    // Токен берется из СКРЫТОЙ ПЕРЕМЕННОЙ ОКРУЖЕНИЯ NETLIFY
    const YM_TOKEN = process.env.YANDEX_MUSIC_TOKEN;

    if (!YM_TOKEN) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Token is missing in Netlify settings' }),
        };
    }

    try {
        const response = await fetch(YM_API_STATUS_URL, {
            headers: {
                // Используем твой токен для авторизации
                'Authorization': `OAuth ${YM_TOKEN}`, 
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // Если Яндекс вернул ошибку, например, 401 (токен неверный), 
            // то возвращаем ошибку, чтобы на сайте не было плашки.
            console.error(`Yandex API Error: ${response.status} ${response.statusText}`);
            return {
                statusCode: 200, // Возвращаем 200, но с пустыми данными, чтобы не ломать сайт
                body: JSON.stringify({ isPlaying: false, trackName: null, artistName: null }),
            };
        }

        const data = await response.json();
        
        // Проверяем, играет ли трек
        if (data.result && data.result.player && data.result.player.track) {
            const track = data.result.player.track;
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    isPlaying: true,
                    trackName: track.title,
                    artistName: track.artists.map(a => a.name).join(', '),
                    link: `https://music.yandex.ru/track/${track.id}`,
                }),
            };
        } else {
            // Музыка не играет
            return {
                statusCode: 200,
                body: JSON.stringify({ isPlaying: false }),
            };
        }

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
