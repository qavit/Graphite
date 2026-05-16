import React, { useState, useMemo } from 'react';
import { renderToSVG } from '@graphite/render-svg';
import { generateInclinedPlane } from '@graphite/templates';

const App = () => {
  const [angle, setAngle] = useState(30);
  const [mode, setMode] = useState<'teacher' | 'student' | 'minimal'>('teacher');
  const [scenario, setScenario] = useState<'simple' | 'friction' | 'advanced'>('friction');

  const spec = useMemo(() => {
    return generateInclinedPlane({
      angle,
      showLabels: true,
      labelLocale: 'zh-TW',
      analysisScenario: scenario
    }, mode);
  }, [angle, mode, scenario]);

  const svgContent = useMemo(() => renderToSVG(spec), [spec]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar / Controls */}
      <div style={{ width: '300px', background: 'white', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h1>Graphite</h1>
        <hr />
        
        <h3>斜面參數 (Inclined Plane)</h3>
        <label>角度: {angle}°</label>
        <input 
          type="range" min="0" max="90" value={angle} 
          onChange={(e) => setAngle(Number(e.target.value))} 
          style={{ width: '100%' }}
        />

        <h3>顯示模式</h3>
        <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={{ width: '100%' }}>
          <option value="teacher">教師版 (含解答)</option>
          <option value="student">學生版 (挖空)</option>
          <option value="minimal">簡潔版 (僅圖形)</option>
        </select>

        <h3>分析層次 (Scenario)</h3>
        <select value={scenario} onChange={(e) => setScenario(e.target.value as any)} style={{ width: '100%' }}>
          <option value="simple">基礎受力圖 (不計摩擦力)</option>
          <option value="friction">考慮摩擦力</option>
          <option value="advanced">完整力學分析</option>
        </select>

        <div style={{ marginTop: '40px' }}>
          <button onClick={() => {
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `graphite-${mode}.svg`;
            a.click();
          }} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
            匯出 SVG
          </button>
        </div>
      </div>

      {/* Main Canvas / Preview */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e0e0e0' }}>
        <div 
          style={{ background: 'white', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
};

export default App;
