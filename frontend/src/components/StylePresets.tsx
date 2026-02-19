/**
 * Styling presets panel with mood, style, color theme, and room options
 */

import { Palette, Home, Sun, Paintbrush, Zap, Cpu } from 'lucide-react';
import { useMoods, useStyles, useColorThemes, useRooms } from '../hooks';
import { Sparkles } from 'lucide-react';

interface StylePresetsProps {
  mood: string;
  style: string;
  colorTheme: string;
  roomType: string;
  modelQuality: 'fast';
  customPrompt: string;
  onMoodChange: (mood: string) => void;
  onStyleChange: (style: string) => void;
  onColorThemeChange: (theme: string) => void;
  onRoomTypeChange: (room: string) => void;
  onModelQualityChange: (quality: 'fast' | 'high') => void;
  onCustomPromptChange: (prompt: string) => void;
}

export const StylePresets = ({
  mood,
  style,
  colorTheme,
  roomType,
  modelQuality,
  customPrompt,
  onMoodChange,
  onStyleChange,
  onColorThemeChange,
  onRoomTypeChange,
  onModelQualityChange,
  onCustomPromptChange,
}: StylePresetsProps) => {
  const { data: moodsData } = useMoods();
  const { data: stylesData } = useStyles();
  const { data: colorThemesData } = useColorThemes();
  const { data: roomsData } = useRooms();

  const moods = moodsData?.moods || [];
  const styles = stylesData?.styles || [];
  const colorThemes = colorThemesData?.color_themes || [];
  const rooms = roomsData?.rooms || [];

  return (
    <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Palette size={20} className="text-purple-600" />
        Styling Options
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mood */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Sun size={16} />
            Mood
          </label>
          <select
            value={mood}
            onChange={(e) => onMoodChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {moods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Style */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Paintbrush size={16} />
            Design Style
          </label>
          <select
            value={style}
            onChange={(e) => onStyleChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {styles.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Theme */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Palette size={16} />
            Color Theme
          </label>
          <select
            value={colorTheme}
            onChange={(e) => onColorThemeChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {colorThemes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>

        {/* Room Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Home size={16} />
            Room
          </label>
          <select
            value={roomType}
            onChange={(e) => onRoomTypeChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {rooms.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Model Quality Toggle */}
        {/* <div className="md:col-span-2 lg:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Cpu size={16} />
            Image Quality
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onModelQualityChange('fast')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm ${
                modelQuality === 'fast'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Zap size={16} />
              Fast
            </button>
            <button
              onClick={() => onModelQualityChange('high')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors shadow-sm ${
                modelQuality === 'high'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Sparkles size={16} />
              High Quality
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {modelQuality === 'fast' 
              ? 'Faster generation with good quality'
              : 'Best quality, takes longer to generate'
            }
          </p>
        </div> */}
      </div>

      {/* Custom Prompt Section */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Sparkles size={16} className="text-purple-600" />
          Custom Prompt (Optional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Describe additional details you'd like in the styled image... e.g., 'Add warm lighting', 'Include natural sunlight', 'Make it feel cozy and inviting'"
          rows={4}
          className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Provide specific details about lighting, atmosphere, arrangement, or any other preferences to enhance your styled image
        </p>
        {customPrompt && (
          <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
            <Sparkles size={14} />
            <span>{customPrompt.length} characters</span>
          </div>
        )}
      </div>
    </div>
  );
};
