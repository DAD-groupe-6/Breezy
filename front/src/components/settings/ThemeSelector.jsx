'use client'

import { useMemo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from '@/hooks/useTranslation'

export default function ThemeSelector() {
    const { theme, setTheme, availableThemes } = useTheme()
    const { t } = useTranslation()

    const themeLabels = useMemo(() => ({
        light: t('pages.settings.themeLight'),
        dark: t('pages.settings.themeDark'),
        discord: t('pages.settings.themeDiscord'),
        gaming: t('pages.settings.themeGaming'),
        neon: t('pages.settings.themeNeon'),
        ocean: t('pages.settings.themeOcean'),
        minty: t('pages.settings.themeMinty'),
        sunset: t('pages.settings.themeSunset'),
        forest: t('pages.settings.themeForest'),
        berry: t('pages.settings.themeBerry'),
        lavender: t('pages.settings.themeLavender'),
    }), [t])

    const lightThemes = ['light', 'minty', 'sunset', 'forest', 'berry', 'lavender']
    const darkThemes = ['dark', 'discord', 'gaming', 'neon', 'ocean']

    const groupedThemes = useMemo(() => {
        const availableLightThemes = lightThemes.filter((themeName) => availableThemes.includes(themeName))
        const availableDarkThemes = darkThemes.filter((themeName) => availableThemes.includes(themeName))

        return [
            { label: t('pages.settings.themeGroupLight'), themes: availableLightThemes },
            { label: t('pages.settings.themeGroupDark'), themes: availableDarkThemes },
        ].filter((group) => group.themes.length > 0)
    }, [availableThemes, t])

    return (
        <div className="w-full">
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
                style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                }}
            >
                {groupedThemes.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                        {group.themes.map((themeOption) => (
                            <option key={themeOption} value={themeOption}>
                                {themeLabels[themeOption] || themeOption}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    )
}
