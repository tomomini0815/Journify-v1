"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, CloudDrizzle, CloudSun } from "lucide-react"
import { LocationPermissionModal } from "@/components/LocationPermissionModal"

interface DailyForecast {
    date: string
    weatherCode: number
    maxTemp: number
    minTemp: number
}

interface WeatherData {
    temperature: number
    weatherCode: number
    minTemp?: number
    maxTemp?: number
    daily: DailyForecast[]
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [isHovering, setIsHovering] = useState(false)
    const [showPermissionModal, setShowPermissionModal] = useState(false)

    useEffect(() => {
        checkLocationPermission()
    }, [])

    const checkLocationPermission = async () => {
        if (!navigator.geolocation) return

        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' })
                if (result.state === 'granted') {
                    fetchWeather()
                } else if (result.state === 'prompt') {
                    setShowPermissionModal(true)
                }
            } else {
                setShowPermissionModal(true)
            }
        } catch (error) {
            console.error("Error checking permissions:", error)
            setShowPermissionModal(true)
        }
    }

    const fetchWeather = () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
                )
                const data = await res.json()

                if (data.current_weather) {
                    const dailyForecasts: DailyForecast[] = data.daily.time.map((time: string, index: number) => ({
                        date: time,
                        maxTemp: data.daily.temperature_2m_max[index],
                        minTemp: data.daily.temperature_2m_min[index],
                        weatherCode: data.daily.weather_code[index]
                    }))

                    setWeather({
                        temperature: data.current_weather.temperature,
                        weatherCode: data.current_weather.weathercode,
                        minTemp: data.daily?.temperature_2m_min?.[0],
                        maxTemp: data.daily?.temperature_2m_max?.[0],
                        daily: dailyForecasts
                    })
                }
            } catch (error) {
                console.error("Failed to fetch weather", error)
            }
        }, (error) => {
            console.log("Geolocation permission denied or error", error)
        })
    }

    const handleAllowLocation = () => {
        setShowPermissionModal(false)
        fetchWeather()
    }

    const handleDenyLocation = () => {
        setShowPermissionModal(false)
    }

    const getWeatherIcon = (code: number, className = "w-5 h-5") => {
        if (code === 0) return <Sun className={`${className} text-orange-400`} />
        if (code >= 1 && code <= 3) return <CloudSun className={`${className} text-yellow-400`} />
        if (code >= 45 && code <= 48) return <CloudFog className={`${className} text-gray-400`} />
        if (code >= 51 && code <= 57) return <CloudDrizzle className={`${className} text-blue-300`} />
        if (code >= 61 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />
        if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-white`} />
        if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-500`} />
        if (code >= 85 && code <= 86) return <CloudSnow className={`${className} text-white`} />
        if (code >= 95) return <CloudLightning className={`${className} text-yellow-400`} />
        return <Cloud className={`${className} text-gray-400`} />
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
    }

    if (!weather) return (
        <>
            <LocationPermissionModal
                isOpen={showPermissionModal}
                onClose={handleDenyLocation}
                onAllow={handleAllowLocation}
            />
        </>
    )

    return (
        <>
            <div
                className="relative z-50"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {getWeatherIcon(weather.weatherCode)}
                        <span className="text-sm font-medium text-white/90">{weather.temperature}°C</span>
                    </div>
                    {(weather.minTemp !== undefined && weather.maxTemp !== undefined) && (
                        <div className="flex items-center gap-2 text-xs border-l border-white/10 pl-3">
                            <span className="text-red-300">H: {weather.maxTemp}°</span>
                            <span className="text-blue-300">L: {weather.minTemp}°</span>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {isHovering && weather.daily && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 p-4 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[280px]"
                        >
                            <h3 className="text-sm font-bold text-white/80 mb-3 border-b border-white/10 pb-2">週間予報</h3>
                            <div className="space-y-2">
                                {weather.daily.slice(0, 7).map((day, i) => (
                                    <div key={day.date} className="flex items-center justify-between text-sm">
                                        <span className={`w-12 text-white/60 ${i === 0 ? 'font-bold text-emerald-400' : ''}`}>
                                            {i === 0 ? '今日' : formatDate(day.date)}
                                        </span>
                                        <div className="flex items-center justify-center w-8">
                                            {getWeatherIcon(day.weatherCode, "w-4 h-4")}
                                        </div>
                                        <div className="flex items-center gap-3 w-24 justify-end">
                                            <span className="text-red-300">{Math.round(day.maxTemp)}°</span>
                                            <span className="text-white/20">/</span>
                                            <span className="text-blue-300">{Math.round(day.minTemp)}°</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <LocationPermissionModal
                isOpen={showPermissionModal}
                onClose={handleDenyLocation}
                onAllow={handleAllowLocation}
            />
        </>
    )
}
