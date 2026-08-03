import { useRef, useState } from 'react';
import type { PhotoHint } from '../../types';
import { hintFromPixels } from '../../engine/photoHint';

interface Props { onHint: (h: PhotoHint) => void; onSkip: () => void; }

export function PhotoColorPicker({ onHint, onSkip }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 이전 objectURL을 해제해 메모리 누수를 막는다. (jsdom 등 revokeObjectURL 미지원 환경 방어)
  function revoke(url: string | null) {
    if (url && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 올릴 수 있어요.');
      revoke(src);
      setSrc(null);
      setReady(false);
      return;
    }
    setError(null);
    setReady(false);
    revoke(src);
    setSrc(URL.createObjectURL(file));
  }

  // 사진은 브라우저 안에서만 처리되고 서버로 전송되지 않아요.
  function drawToCanvas(img: HTMLImageElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    setReady(true);
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const sx = Math.max(0, Math.min(x - 2, canvas.width - 5));
    const sy = Math.max(0, Math.min(y - 2, canvas.height - 5));
    const { data } = ctx.getImageData(sx, sy, 5, 5);
    const px: number[][] = [];
    for (let i = 0; i < data.length; i += 4) px.push([data[i], data[i + 1], data[i + 2]]);
    onHint(hintFromPixels(px));
  }

  return (
    <div className="photo-step">
      <p>얼굴/손 사진에서 피부 지점을 눌러 웜·쿨 참고 힌트를 받을 수 있어요. (선택)</p>
      <label className="upload-label">
        사진 업로드
        <input type="file" accept="image/*" onChange={onFile} />
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      {src && (
        <>
          <img
            src={src}
            alt="업로드한 사진"
            style={{ display: 'none' }}
            onLoad={(e) => drawToCanvas(e.currentTarget)}
          />
          {ready && <p className="photo-hint">사진에서 피부 지점을 눌러 주세요.</p>}
          <canvas ref={canvasRef} onClick={onCanvasClick} className="photo-canvas" />
        </>
      )}
      <button type="button" onClick={onSkip}>이 단계 건너뛰기</button>
    </div>
  );
}
