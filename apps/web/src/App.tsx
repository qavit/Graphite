import React, { useState, useMemo } from 'react';
import { renderToSVG } from '@graphite/render-svg';
import { 
  generateInclinedPlane, 
  generateChargedParticleMotion,
  type InclinedPlaneParams,
  type ChargedParticleParams 
} from '@graphite/templates';

const App = () => {
  const [template, setTemplate] = useState<'inclined' | 'magnetic'>('inclined');
  const [mode, setMode] = useState<'teacher' | 'student' | 'minimal'>('teacher');
  
  // Inclined Plane Params
  const [angle, setAngle] = useState(30);
  const [scenario, setScenario] = useState<'simple' | 'friction' | 'advanced'>('friction');

  // Magnetic Params
  const [fieldType, setFieldType] = useState<'magnetic' | 'electric'>('magnetic');
  const [fieldDir, setFieldDir] = useState<'into-page' | 'out-of-page' | 'upward' | 'downward'>('into-page');

  const spec = useMemo(() => {
    if (template === 'inclined') {
      const params: InclinedPlaneParams = {
        angle,
        showLabels: true,
        labelLocale: 'zh-TW',
        analysisScenario: scenario
      };
      return generateInclinedPlane(params, mode);
    } else {
      const params: ChargedParticleParams = {
        fieldType,
        fieldDirection: fieldDir,
        chargeSign: 'positive',
        showTrajectory: true,
        showForceVector: true,
        showVelocityVector: true,
        analysisScenario: 'simple',
        labelLocale: 'zh-TW',
      };
      return generateChargedParticleMotion(params, mode);
    }
  }, [template, mode, angle, scenario, fieldType, fieldDir]);

  const svgContent = useMemo(() => renderToSVG(spec), [spec]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '320px', background: 'white', padding: '20px', borderRight: '1px solid #e0e0e0', boxShadow: '2px 0 5px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 20px 0' }}>Graphite</h1>
        
        <h3>模板選擇</h3>
        <select value={template} onChange={(e) => setTemplate(e.target.value as any)} style={{ width: '100%', marginBottom: '20px' }}>
          <option value="inclined">斜面受力分析</option>
          <option value="magnetic">帶電粒子運動</option>
        </select>

        <h3>顯示模式</h3>
        <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={{ width: '100%', marginBottom: '20px' }}>
          <option value="teacher">教師版 (含解答)</option>
          <option value="student">學生版 (填空)</option>
          <option value="minimal">簡潔版 (僅圖形)</option>
        </select>

        {template === 'inclined' && (
          <>
            <h3>斜面參數</h3>
            <label>角度: {angle}°</label>
            <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: '100%' }} />
            
            <h3>分析層次</h3>
            <select value={scenario} onChange={(e) => setScenario(e.target.value as any)} style={{ width: '100%' }}>
              <option value="simple">基礎受力圖</option>
              <option value="friction">考慮摩擦力</option>
              <option value="advanced">完整力學分析</option>
            </select>
          </>
        )}

        {template === 'magnetic' && (
          <>
            <h3>場域類型</h3>
            <select value={fieldType} onChange={(e) => {
              setFieldType(e.target.value as any);
              setFieldDir(e.target.value === 'magnetic' ? 'into-page' : 'upward');
            }} style={{ width: '100%' }}>
              <option value="magnetic">磁場 (Magnetic)</option>
              <option value="electric">電場 (Electric)</option>
            </select>

            <h3>場域方向</h3>
            <select value={fieldDir} onChange={(e) => setFieldDir(e.target.value as any)} style={{ width: '100%' }}>
              {fieldType === 'magnetic' ? (
                <>
                  <option value="into-page">垂直射入紙面 (⊗)</option>
                  <option value="out-of-page">垂直射出紙面 (⊙)</option>
                </>
              ) : (
                <>
                  <option value="upward">向上</option>
                  <option value="downward">向下</option>
                </>
              )}
            </select>
          </>
        )}

        <div style={{ marginTop: '40px' }}>
          <button onClick={() => {
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `graphite-${template}-${mode}.svg`;
            a.click();
          }} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            匯出 SVG
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div 
          style={{ background: 'white', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '8px' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
};

export default App;
