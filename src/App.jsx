import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
    Sun, Cloud, CloudRain, CloudSnow, Zap, Wind, Eye, Leaf, Bone,
    Shirt, Star, Map, BrainCircuit, Bell, Bike, Image as WallpaperIcon, Palette,
    Smile, Meh, Heart, Frown, Rocket, Clock, Play, Pause, RefreshCw, Sparkles, X
} from 'lucide-react';

// --- THEME ENGINE --- //
// This section manages the visual themes of the application.
const themes = {
    default: {
        name: 'Default',
        getStyles: (condition) => ({
            background: {
                'Clear': 'linear-gradient(to bottom right, #38bdf8, #1d4ed8)',
                'Clouds': 'linear-gradient(to bottom right, #64748b, #334155)',
                'Rain': 'linear-gradient(to bottom right, #52525b, #18181b)',
                'Snow': 'linear-gradient(to bottom right, #a5b4fc, #4f46e5)',
                'Thunderstorm': 'linear-gradient(to bottom right, #1f2937, #000000)',
                'Drizzle': 'linear-gradient(to bottom right, #a1a1aa, #3f3f46)',
                'Mist': 'linear-gradient(to bottom right, #e2e8f0, #94a3b8)',
                'Haze': 'linear-gradient(to bottom right, #e2e8f0, #94a3b8)',
            }[condition || 'Clear'],
            accent: '#facc15', // yellow-400
            text: '#ffffff',
            subtext: 'rgba(255, 255, 255, 0.8)',
            panelBg: 'rgba(0, 0, 0, 0.2)',
            buttonBg: 'rgba(255, 255, 255, 0.1)',
            buttonHoverBg: 'rgba(255, 255, 255, 0.2)',
            activeButtonBg: 'rgba(255, 255, 255, 0.25)',
        })
    },
    sunset: {
        name: 'Sunset',
        getStyles: () => ({
            background: 'linear-gradient(to bottom right, #f97316, #9f1239)',
            accent: '#fde047',
            text: '#ffffff',
            subtext: 'rgba(255, 255, 255, 0.85)',
            panelBg: 'rgba(0, 0, 0, 0.25)',
            buttonBg: 'rgba(255, 255, 255, 0.1)',
            buttonHoverBg: 'rgba(255, 255, 255, 0.2)',
            activeButtonBg: 'rgba(255, 255, 255, 0.3)',
        })
    },
    forest: {
        name: 'Forest',
        getStyles: () => ({
            background: 'linear-gradient(to bottom right, #16a34a, #14532d)',
            accent: '#bef264',
            text: '#ffffff',
            subtext: 'rgba(255, 255, 255, 0.9)',
            panelBg: 'rgba(0, 0, 0, 0.3)',
            buttonBg: 'rgba(255, 255, 255, 0.1)',
            buttonHoverBg: 'rgba(255, 255, 255, 0.2)',
            activeButtonBg: 'rgba(255, 255, 255, 0.3)',
        })
    },
    custom: {
        name: 'Custom',
        getStyles: (condition, customColors) => ({
            background: customColors.bg,
            accent: customColors.accent,
            text: '#ffffff',
            subtext: 'rgba(255, 255, 255, 0.8)',
            panelBg: 'rgba(0, 0, 0, 0.2)',
            buttonBg: 'rgba(255, 255, 255, 0.1)',
            buttonHoverBg: 'rgba(255, 255, 255, 0.2)',
            activeButtonBg: 'rgba(255, 255, 255, 0.25)',
        })
    }
};

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [themeKey, setThemeKey] = useState('default');
    const [customColors, setCustomColors] = useState({
        bg: 'linear-gradient(to bottom right, #4f46e5, #db2777)',
        accent: '#a5b4fc',
    });

    const value = useMemo(() => ({
        themeKey,
        setThemeKey,
        customColors,
        setCustomColors,
        getThemeStyles: (condition) => themes[themeKey].getStyles(condition, customColors)
    }), [themeKey, customColors]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

const useTheme = () => useContext(ThemeContext);


// --- GEMINI API INTEGRATION (UPDATED) --- //
const callGeminiAPI = async (prompt) => {
    // =======================================================================
    // === 1. INSERT YOUR GEMINI API KEY HERE ================================
    // =======================================================================
    const apiKey = "AIzaSyD8IF3Z1VL62riGQB-Vc3w2R9FTc4v0w7c"; // <-- PASTE YOUR GEMINI API KEY HERE

    if (!apiKey) {
        return "To use AI features, please add your Google Gemini API key to the `callGeminiAPI` function in the App.jsx file.";
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${errorBody}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected API response structure:", result);
            return "Sorry, I couldn't get a creative suggestion right now.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, something went wrong while talking to the AI.";
    }
};


// --- LIVE WEATHER API & DATA (NEW) --- //
const getRealWeatherData = async (city) => {
    // =======================================================================
    // === 2. INSERT YOUR OPENWEATHERMAP API KEY HERE ========================
    // =======================================================================
    const openWeatherApiKey = "cc48b3d122a3f55b3a5bfcfc021e0ac6"; // <-- PASTE YOUR OPENWEATHERMAP API KEY HERE

    if (!openWeatherApiKey) {
        throw new Error("Please add your OpenWeatherMap API key to the `getRealWeatherData` function in the App.jsx file.");
    }
    
    // Step 1: Fetch current weather to get basic data and coordinates
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${openWeatherApiKey}`);
    if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
             throw new Error(`City not found. Please check the spelling.`);
        } else {
            throw new Error(`Could not fetch weather data. API Error: ${weatherResponse.status}`);
        }
    }
    const weatherData = await weatherResponse.json();
    const { lat, lon } = weatherData.coord;

    // Step 2: Fetch air pollution data using the coordinates
    let aqi = 'N/A';
    try {
        const airPollutionResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`);
        if (airPollutionResponse.ok) {
            const airPollutionData = await airPollutionResponse.json();
            // Convert OWM AQI (1-5) to a ~0-100 scale for visual consistency with original app design
            aqi = airPollutionData.list[0].main.aqi * 20; 
        }
    } catch (e) {
        console.error("Could not fetch air quality data:", e);
    }
    
    // Step 3: UV Index is not available in the free OWM tier, so we'll use a placeholder.
    const uvIndex = 'N/A';

    // Step 4: Combine data into the format the app expects
    return {
        temp: weatherData.main.temp,
        condition: weatherData.weather[0].main, // e.g., 'Clear', 'Clouds', 'Rain'
        wind: weatherData.wind.speed * 3.6, // Convert m/s to km/h
        humidity: weatherData.main.humidity,
        uv: uvIndex,
        aq: aqi,
        cloudCover: weatherData.clouds.all,
        name: weatherData.name
    };
};

// --- UI COMPONENTS --- //
const WeatherIcon = ({ condition, size = 48, color }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(condition);
    const iconColor = color || styles.accent;
    const icons = {
        'Clear': <Sun size={size} style={{ color: iconColor }} />,
        'Clouds': <Cloud size={size} style={{ color: '#d1d5db' }} />,
        'Rain': <CloudRain size={size} style={{ color: '#93c5fd' }} />,
        'Drizzle': <CloudRain size={size} style={{ color: '#a3a3a3' }} />,
        'Snow': <CloudSnow size={size} style={{ color: '#e0e7ff' }} />,
        'Thunderstorm': <Zap size={size} style={{ color: iconColor }} />,
        'Mist': <Eye size={size} style={{ color: '#d1d5db' }} />,
        'Haze': <Eye size={size} style={{ color: '#d1d5db' }} />,
    };
    return icons[condition] || icons['Clear'];
};


// --- FEATURE COMPONENTS --- //
// These components render the different feature cards in the dashboard.

const MoodWeather = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const [mood, setMood] = useState('lazy');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const moods = [
        { name: 'Lazy', icon: <Meh />, key: 'lazy' },
        { name: 'Energetic', icon: <Rocket />, key: 'energetic' },
        { name: 'Romantic', icon: <Heart />, key: 'romantic' },
        { name: 'Sad', icon: <Frown />, key: 'sad' },
    ];

    const handleGetAISuggestion = async () => {
        setIsLoading(true);
        setAiSuggestion('');
        const prompt = `The weather is ${weather.condition} at ${weather.temp}°C. I'm feeling ${mood}. Give me one creative and specific activity suggestion.`;
        const suggestion = await callGeminiAPI(prompt);
        setAiSuggestion(suggestion);
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">How are you feeling?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moods.map(m => (
                    <button key={m.key} onClick={() => setMood(m.key)} className="flex items-center justify-center gap-2 p-3 rounded-lg transition" style={{ backgroundColor: mood === m.key ? styles.activeButtonBg : styles.buttonBg, outline: mood === m.key ? `2px solid ${styles.accent}` : 'none' }}>
                        {React.cloneElement(m.icon, { style: { color: styles.accent } })} {m.name}
                    </button>
                ))}
            </div>
            <button onClick={handleGetAISuggestion} disabled={isLoading} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg font-bold transition" style={{ backgroundColor: styles.accent, color: 'black' }}>
                <Sparkles size={20} /> {isLoading ? 'Thinking...' : '✨ Get AI Suggestion'}
            </button>
            {aiSuggestion && (
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: styles.panelBg }}>
                    <p className="font-bold" style={{ color: styles.accent }}>AI Suggestion:</p>
                    <p>{aiSuggestion}</p>
                </div>
            )}
        </div>
    );
};

const TravelCompanion = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const [cities, setCities] = useState([{ name: 'Paris', weather: null }, { name: 'Rome', weather: null }]);
    const [newCity, setNewCity] = useState('');
    const [itinerary, setItinerary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        cities.forEach((city, index) => {
            if (!city.weather) {
                getRealWeatherData(city.name).then(data => {
                    setCities(prev => {
                        const newCities = [...prev];
                        newCities[index].weather = data;
                        return newCities;
                    });
                }).catch(e => console.error(`Failed to load weather for ${city.name}`, e));
            }
        });
    }, [cities]);

    const addCity = (e) => {
        e.preventDefault();
        if (newCity && !cities.find(c => c.name.toLowerCase() === newCity.toLowerCase())) {
            setCities([...cities, { name: newCity, weather: null }]);
            setNewCity('');
        }
    };
    
    const removeCity = (cityName) => {
        setCities(cities.filter(city => city.name !== cityName));
    };

    const handleGetItinerary = async (city) => {
        setIsLoading(city.name);
        setItinerary(null);
        const prompt = `The weather in ${city.name} is currently ${city.weather.condition} at ${city.weather.temp}°C. Generate a fun, one-day travel itinerary with 3-4 suggestions suitable for these conditions. Format it with markdown headings.`;
        const result = await callGeminiAPI(prompt);
        setItinerary({ city: city.name, plan: result });
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Travel Companion</h3>
            <form onSubmit={addCity} className="flex gap-2">
                <input type="text" value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Add a destination..." className="flex-grow p-2 rounded-md focus:outline-none focus:ring-2" style={{ backgroundColor: styles.buttonBg, color: styles.text, ringColor: styles.accent }} />
                <button type="submit" className="text-black px-4 py-2 rounded-md font-bold" style={{ backgroundColor: styles.accent }}>Add</button>
            </form>
            <div className="space-y-2">
                {cities.map(city => (
                    <div key={city.name} className="p-3 rounded-lg group" style={{ backgroundColor: styles.panelBg }}>
                        {city.weather ? (
                            <div className="flex justify-between items-center">
                                <div className="flex-grow">
                                    <span className="font-bold">{city.weather.name}</span>
                                    <span className="text-sm ml-2" style={{ color: styles.subtext }}>{Math.round(city.weather.temp)}°C, {city.weather.condition}</span>
                                </div>
                                <button onClick={() => handleGetItinerary(city)} disabled={isLoading === city.name} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ backgroundColor: styles.accent, color: 'black' }}>
                                    <Sparkles size={14} /> {isLoading === city.name ? 'Planning...' : '✨ Plan Day'}
                                </button>
                                <button onClick={() => removeCity(city.name)} className="ml-2 text-gray-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : `Loading ${city.name}...`}
                    </div>
                ))}
            </div>
            {itinerary && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-lg rounded-xl p-6 space-y-4" style={{ backgroundColor: styles.panelBg, border: `1px solid ${styles.accent}` }}>
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-bold">Itinerary for {itinerary.city}</h4>
                            <button onClick={() => setItinerary(null)}><X /></button>
                        </div>
                        <div className="prose prose-sm prose-invert max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: itinerary.plan.replace(/\n/g, '<br />').replace(/(\*\*|###|##|#)/g, '') }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ClothesAssistant = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const recommendations = useMemo(() => {
        const { temp, condition, wind } = weather;
        const items = [];
        if (temp < 10) items.push({ item: 'Heavy Jacket', icon: <Shirt /> });
        else if (temp < 18) items.push({ item: 'Light Jacket', icon: <Shirt /> });
        else items.push({ item: 'T-Shirt', icon: <Shirt /> });
        if (condition === 'Rain' || condition === 'Thunderstorm' || condition === 'Drizzle') items.push({ item: 'Umbrella', icon: <CloudRain /> });
        if (condition === 'Snow') items.push({ item: 'Boots & Gloves', icon: <CloudSnow /> });
        if (wind > 30) items.push({ item: 'Windbreaker', icon: <Wind /> });
        return items;
    }, [weather]);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">What to Wear Today</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                {recommendations.map(({ item, icon }) => (
                    <div key={item} className="p-4 rounded-lg flex flex-col items-center justify-center gap-2" style={{ backgroundColor: styles.buttonBg }}>
                        {React.cloneElement(icon, { style: { color: styles.accent } })}
                        <p className="font-medium">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PetFriendly = ({ weather }) => {
    const advice = useMemo(() => {
        const { temp, aq, condition } = weather;
        if (temp > 32) return { text: "Dangerously hot for paws on pavement. Keep walks short and on grass.", safe: false };
        if (temp < -5) return { text: "Too cold for most pets. Limit outdoor time significantly.", safe: false };
        if (aq > 80) return { text: "Poor air quality. Best to keep pets indoors today.", safe: false };
        if (condition === 'Thunderstorm') return { text: "Thunder can scare pets. Keep them safe and comfortable inside.", safe: false };
        return { text: "Great day for a walk or a trip to the park!", safe: true };
    }, [weather]);

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Is it safe for pets outside?</h3>
            <div className="p-4 rounded-lg" style={{ backgroundColor: advice.safe ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)' }}>
                <p className="text-lg font-bold">{advice.safe ? "Yes, it's a good day!" : "Caution advised"}</p>
                <p>{advice.text}</p>
            </div>
        </div>
    );
};

const StargazingHelper = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const conditions = useMemo(() => {
        const { cloudCover, humidity, condition } = weather;
        let score = 0;
        if (cloudCover < 20) score += 40; else if (cloudCover < 50) score += 20;
        if (humidity < 60) score += 30;
        if (condition === 'Clear') score += 30;
        let quality = 'Poor';
        if (score > 80) quality = 'Excellent'; else if (score > 60) quality = 'Good'; else if (score > 40) quality = 'Fair';
        return { quality, reason: `Cloud cover is ${cloudCover}% and humidity is ${humidity}%.` };
    }, [weather]);

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Stargazing Conditions</h3>
            <div className="p-4 rounded-lg" style={{ backgroundColor: styles.panelBg }}>
                <p className="text-2xl font-bold" style={{ color: styles.accent }}>{conditions.quality}</p>
                <p>{conditions.reason}</p>
                {conditions.quality === 'Excellent' && <p className="mt-2">It's a perfect night to see the stars!</p>}
            </div>
        </div>
    );
};

const GardenerGuide = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const advice = useMemo(() => {
        const { condition, temp } = weather;
        if (condition === 'Rain') return "Nature is watering for you! No need to water today.";
        if (temp > 35) return "It's very hot. Water early in the morning or late in the evening to reduce evaporation.";
        if (temp < 5) return "Frost possible. Protect sensitive plants overnight.";
        return "A pleasant day for gardening. Check soil moisture before watering.";
    }, [weather]);

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Gardener's Guide</h3>
            <div className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)' }}>
                <Leaf size={40} style={{ color: styles.accent }} />
                <p className="text-left">{advice}</p>
            </div>
        </div>
    );
};

const ProductivityTimer = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && time > 0) {
            interval = setInterval(() => setTime(t => t - 1), 1000);
        } else if (!isActive && time !== 0) {
            clearInterval(interval);
        } else if (time === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, time]);

    const suggestion = useMemo(() => {
        if (weather.condition === 'Rain' || weather.condition === 'Snow' || weather.condition === 'Drizzle') return "Low-light and rain are great for deep focus indoors.";
        return "A clear day can be energizing. Tackle your tasks with vigor!";
    }, [weather]);

    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Weather Productivity</h3>
            <p className="p-3 rounded-lg" style={{ backgroundColor: styles.panelBg }}>{suggestion}</p>
            <div className="p-6 rounded-full aspect-square w-48 mx-auto flex flex-col justify-center items-center" style={{ backgroundColor: styles.panelBg }}>
                <p className="text-5xl font-mono font-bold">{formatTime(time)}</p>
                <p className="text-sm">Pomodoro Timer</p>
            </div>
            <div className="flex justify-center gap-4">
                <button onClick={() => setIsActive(!isActive)} className="p-3 rounded-full" style={{ backgroundColor: styles.buttonBg }}>{isActive ? <Pause /> : <Play />}</button>
                <button onClick={() => { setTime(25 * 60); setIsActive(false); }} className="p-3 rounded-full" style={{ backgroundColor: styles.buttonBg }}><RefreshCw /></button>
            </div>
        </div>
    );
};

const MicroAlerts = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const alert = useMemo(() => {
        if (weather.condition === 'Thunderstorm') return "Micro-Alert: Heavy rain and lightning possible in the next 30 mins.";
        if (weather.wind > 40) return "Micro-Alert: Strong wind gusts expected shortly.";
        return "All clear for now. No immediate micro-alerts.";
    }, [weather]);

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Micro-Alerts</h3>
            <div className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: 'rgba(250, 204, 21, 0.3)' }}>
                <Bell size={40} style={{ color: styles.accent }} />
                <p className="text-left font-bold">{alert}</p>
            </div>
        </div>
    );
};

const FitnessCoach = ({ weather }) => {
    const { getThemeStyles } = useTheme();
    const styles = getThemeStyles(weather.condition);
    const suggestion = useMemo(() => {
        const { temp, aq, humidity, wind } = weather;
        if (aq > 80) return "Poor air quality. Best to exercise indoors today.";
        if (temp > 30 && humidity > 70) return "High heat and humidity. Stay hydrated and consider a lighter workout.";
        if (temp < 0) return "Very cold. Ensure you warm up properly and dress in layers.";
        if (wind > 30) return "It's windy! Good for resistance training on a run, but be careful on a bike.";
        return "Ideal conditions for an outdoor run, walk, or cycling session.";
    }, [weather]);

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Fitness Weather Coach</h3>
            <div className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: 'rgba(96, 165, 250, 0.2)' }}>
                <Bike size={40} style={{ color: styles.accent }} />
                <p className="text-left">{suggestion}</p>
            </div>
        </div>
    );
};

const ThemeSelector = ({ weather }) => {
    const { themeKey, setThemeKey, customColors, setCustomColors } = useTheme();

    const handleCustomColorChange = (e) => {
        const { name, value } = e.target;
        let newBg1 = document.getElementById('bg1').value;
        let newBg2 = document.getElementById('bg2').value;
        let newAccent = document.getElementById('accent').value;
        if (name === 'bg1') newBg1 = value;
        if (name === 'bg2') newBg2 = value;
        if (name === 'accent') newAccent = value;
        setCustomColors({ bg: `linear-gradient(to bottom right, ${newBg1}, ${newBg2})`, accent: newAccent });
        if (themeKey !== 'custom') setThemeKey('custom');
    };

    const [bg1, bg2] = useMemo(() => {
        if (customColors.bg.includes('linear-gradient')) {
            const parts = customColors.bg.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
            return [parts?.[0] || '#4f46e5', parts?.[1] || '#db2777'];
        }
        return ['#4f46e5', '#db2777'];
    }, [customColors.bg]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Select a Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(themes).filter(k => k !== 'custom').map(key => (
                    <button key={key} onClick={() => setThemeKey(key)} className="p-4 rounded-lg text-center transition" style={{ outline: themeKey === key ? `2px solid white` : 'none', background: themes[key].getStyles(weather.condition).background }}>
                        <span className="font-bold mix-blend-difference text-white">{themes[key].name}</span>
                    </button>
                ))}
            </div>
            <div>
                <h4 className="text-lg font-semibold text-center mb-3">Or Create Your Own</h4>
                <div className="p-4 rounded-lg space-y-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <div className="flex items-center justify-between"><label htmlFor="bg1">Background Start</label><input type="color" id="bg1" name="bg1" value={bg1} onChange={handleCustomColorChange} className="p-1 h-8 w-14 block bg-white/20 cursor-pointer rounded-lg" /></div>
                    <div className="flex items-center justify-between"><label htmlFor="bg2">Background End</label><input type="color" id="bg2" name="bg2" value={bg2} onChange={handleCustomColorChange} className="p-1 h-8 w-14 block bg-white/20 cursor-pointer rounded-lg" /></div>
                    <div className="flex items-center justify-between"><label htmlFor="accent">Accent Color</label><input type="color" id="accent" name="accent" value={customColors.accent} onChange={handleCustomColorChange} className="p-1 h-8 w-14 block bg-white/20 cursor-pointer rounded-lg" /></div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT --- //
export default function App() {
    return (
        <ThemeProvider>
            <WeatherDashboard />
        </ThemeProvider>
    );
}

function WeatherDashboard() {
    const [location, setLocation] = useState('london');
    const [inputLocation, setInputLocation] = useState('london');
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFeature, setActiveFeature] = useState('mood');
    const { getThemeStyles } = useTheme();

    // Debounce effect to prevent API calls on every keystroke
    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputLocation) {
                setLocation(inputLocation);
            }
        }, 1000); // 1-second delay

        return () => {
            clearTimeout(handler);
        };
    }, [inputLocation]);

    useEffect(() => {
        const fetchWeather = async () => {
            if (!location) return;
            setLoading(true);
            setError(null);
            try {
                // UPDATED to use live data
                const data = await getRealWeatherData(location);
                setWeather(data);
                setError(null); // Clear previous errors on success
            } catch (err) {
                setError(err.message);
                setWeather(null); // Clear weather data on error
            } finally {
                setLoading(false);
            }
        };
        
        fetchWeather();

    }, [location]);

    const styles = getThemeStyles(weather?.condition);

    const backgroundStyle = {
        background: styles.background,
        color: styles.text,
    };

    const features = useMemo(() => [
        { key: 'mood', name: 'Mood Helper', icon: <Smile size={20} />, component: MoodWeather },
        { key: 'clothes', name: 'Clothes Assistant', icon: <Shirt size={20} />, component: ClothesAssistant },
        { key: 'pet', name: 'Pet Guide', icon: <Bone size={20} />, component: PetFriendly },
        { key: 'travel', name: 'Travel Companion', icon: <Map size={20} />, component: TravelCompanion },
        { key: 'stargazing', name: 'Stargazing', icon: <Star size={20} />, component: StargazingHelper },
        { key: 'gardener', name: 'Gardener Guide', icon: <Leaf size={20} />, component: GardenerGuide },
        { key: 'productivity', name: 'Productivity', icon: <BrainCircuit size={20} />, component: ProductivityTimer },
        { key: 'alerts', name: 'Micro-Alerts', icon: <Bell size={20} />, component: MicroAlerts },
        { key: 'fitness', name: 'Fitness Coach', icon: <Bike size={20} />, component: FitnessCoach },
        { key: 'themes', name: 'Themes', icon: <Palette size={20} />, component: ThemeSelector },
        { key: 'wallpaper', name: 'Wallpaper', icon: <WallpaperIcon size={20} />, component: null },
    ], []);

    const ActiveComponent = features.find(f => f.key === activeFeature)?.component;

    return (
        <div style={backgroundStyle} className="min-h-screen w-screen font-sans transition-all duration-1000 p-4 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <header className="text-center my-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Weather Dashboard</h1>
                    <div className="mt-4 max-w-sm mx-auto">
                        <input
                            type="text"
                            value={inputLocation}
                            onChange={(e) => setInputLocation(e.target.value)}
                            placeholder="Enter a city..."
                            className="w-full px-4 py-2 rounded-full text-center placeholder-white/60 focus:outline-none focus:ring-2"
                            style={{ backgroundColor: styles.buttonBg, color: styles.text, ringColor: styles.accent }}
                        />
                    </div>
                </header>
                
                <div className="backdrop-blur-3xl rounded-2xl shadow-2xl p-4 md:p-6" style={{ backgroundColor: styles.panelBg }}>
                    {loading ? (
                        <div className="text-center py-20">Loading weather data...</div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400 font-bold">{error}</div>
                    ) : weather && (
                        <div className="grid md:grid-cols-3 gap-6">
                            <aside className="md:col-span-1 space-y-4">
                                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: styles.buttonBg }}>
                                    <h2 className="text-2xl font-bold">{weather.name}</h2>
                                    <div className="flex justify-center my-3"><WeatherIcon condition={weather.condition} size={64} /></div>
                                    <p className="text-5xl font-extrabold">{Math.round(weather.temp)}°C</p>
                                    <p className="text-lg mt-1" style={{ color: styles.subtext }}>{weather.condition}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm mt-4" style={{ color: styles.subtext }}>
                                        <p>Wind: {Math.round(weather.wind)} km/h</p>
                                        <p>Humidity: {weather.humidity}%</p>
                                        <p>UV Index: {weather.uv}</p>
                                        <p>AQI: {weather.aq}</p>
                                    </div>
                                </div>
                                <nav className="space-y-2">
                                    {features.map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setActiveFeature(f.key)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition"
                                            style={{ backgroundColor: activeFeature === f.key ? styles.activeButtonBg : 'transparent' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = activeFeature === f.key ? styles.activeButtonBg : styles.buttonHoverBg}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = activeFeature === f.key ? styles.activeButtonBg : 'transparent'}
                                        >
                                            <div style={{ color: styles.accent }}>{f.icon}</div>
                                            <span>{f.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            <main className="md:col-span-2 p-4 md:p-6 rounded-xl" style={{ backgroundColor: styles.buttonBg }}>
                                {activeFeature === 'wallpaper' ? (
                                    <div className="text-center h-full flex flex-col justify-center items-center">
                                        <WallpaperIcon size={60} style={{ color: styles.accent }} className="mb-4" />
                                        <h3 className="text-xl font-semibold">Aesthetic Wallpaper</h3>
                                        <p className="mt-2" style={{ color: styles.subtext }}>The background of this app dynamically changes based on the current weather and your selected theme!</p>
                                    </div>
                                ) : ActiveComponent ? (
                                    <ActiveComponent weather={weather} />
                                ) : <div className="text-center h-full flex flex-col justify-center items-center"><p>This feature is in development.</p></div>}
                            </main>
                        </div>
                    )}
                </div>
                 <footer className="text-center mt-6 text-sm" style={{ color: styles.subtext }}>
                    <p>Powered by OpenWeatherMap and Google Gemini.</p>
                </footer>
            </div>
        </div>
    );
}
