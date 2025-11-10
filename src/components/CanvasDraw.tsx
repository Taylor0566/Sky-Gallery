"use client";
import { useEffect, useRef, useState } from "react";

export default function CanvasDraw() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#ff4757");
  const [size, setSize] = useState(6);
  const [title, setTitle] = useState("");
  const [tool, setTool] = useState<"brush" | "eraser" | "line" | "rect" | "circle" | "ellipse" | "filledRect" | "filledCircle" | "spray" | "text" | "eyedropper">("brush");
  const [last, setLast] = useState<{ x: number; y: number } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const startImageRef = useRef<ImageData | null>(null);
  const dashOffsetRef = useRef(0);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [opacity, setOpacity] = useState(1);
  const [dash, setDash] = useState(false);
  const [fillColor, setFillColor] = useState("#ff4757");
  const [textContent, setTextContent] = useState("");
  function dashPattern(sz: number): number[] {
    const dashLen = Math.max(16, Math.round(sz * 3));
    const gapLen = Math.max(10, Math.round(sz * 2));
    return [dashLen, gapLen];
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(255,255,255,0.0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(img);
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const canvas = canvasRef.current!;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function start(e: React.MouseEvent<HTMLCanvasElement>) {
    setDrawing(true);
    const { x, y } = getPos(e);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    if (dash) { ctx.setLineDash(dashPattern(size)); ctx.lineDashOffset = dashOffsetRef.current; } else { ctx.setLineDash([]); ctx.lineDashOffset = 0; }
    if (tool === "eyedropper") {
      const sample = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      const toHex = (n: number) => n.toString(16).padStart(2, "0");
      const hex = `#${toHex(sample[0])}${toHex(sample[1])}${toHex(sample[2])}`;
      setColor(hex);
      setDrawing(false);
      return;
    }
    if (tool === "text") {
      const fontSize = Math.max(12, size * 4);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(textContent || "文本", x, y);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStackRef.current.push(img);
      redoStackRef.current = [];
      setDrawing(false);
      return;
    }
    if (tool === "brush" || tool === "eraser") {
      setLast({ x, y });
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    } else {
      setShapeStart({ x, y });
      ctx.globalCompositeOperation = "source-over";
      startImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  function end() {
    setDrawing(false);
    setLast(null);
    setShapeStart(null);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(img);
    redoStackRef.current = [];
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e);
    if (tool === "brush" || tool === "eraser") {
      if (!last) {
        setLast({ x, y });
        return;
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.globalAlpha = opacity;
      if (dash) { ctx.setLineDash(dashPattern(size)); ctx.lineDashOffset = dashOffsetRef.current; } else { ctx.setLineDash([]); ctx.lineDashOffset = 0; }
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (dash) { const dx = x - last.x; const dy = y - last.y; dashOffsetRef.current += Math.sqrt(dx * dx + dy * dy); }
      setLast({ x, y });
    } else if (tool === "spray") {
      const count = 20;
      const radius = Math.max(4, size * 2);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        ctx.fillRect(px, py, 1, 1);
      }
    } else if (shapeStart) {
      if (startImageRef.current) {
        ctx.putImageData(startImageRef.current, 0, 0);
      }
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = opacity;
      if (dash) { ctx.setLineDash(dashPattern(size)); ctx.lineDashOffset = 0; } else { ctx.setLineDash([]); ctx.lineDashOffset = 0; }
      ctx.beginPath();
      if (tool === "line") {
        ctx.moveTo(shapeStart.x, shapeStart.y);
        ctx.lineTo(x, y);
      } else if (tool === "rect") {
        const w = x - shapeStart.x;
        const h = y - shapeStart.y;
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
      } else if (tool === "circle") {
        const dx = x - shapeStart.x;
        const dy = y - shapeStart.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(shapeStart.x, shapeStart.y, r, 0, Math.PI * 2);
      } else if (tool === "ellipse") {
        const rx = Math.abs(x - shapeStart.x);
        const ry = Math.abs(y - shapeStart.y);
        ctx.ellipse(shapeStart.x, shapeStart.y, rx, ry, 0, 0, Math.PI * 2);
      } else if (tool === "filledRect") {
        const w = x - shapeStart.x;
        const h = y - shapeStart.y;
        ctx.rect(shapeStart.x, shapeStart.y, w, h);
        ctx.fill();
        return;
      } else if (tool === "filledCircle") {
        const dx = x - shapeStart.x;
        const dy = y - shapeStart.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        ctx.arc(shapeStart.x, shapeStart.y, r, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.stroke();
    }
  }

  async function save() {
    if (!title || title.trim().length === 0) {
      setTempTitle("");
      setShowTitleModal(true);
      return;
    }
    await performSave(title);
  }

  async function performSave(finalTitle: string) {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");
    const res = await fetch("/api/artworks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl, title: finalTitle, authorName: authorName.trim() || undefined }),
    });
    const ct = res.headers.get("content-type") || "";
    let data: any = null;
    try {
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text || "服务器未返回JSON" };
      }
    } catch (err) {
      data = { error: "解析服务器响应失败" };
    }
    if (!res.ok) {
      alert(data?.error ?? "保存失败");
      return;
    }
    alert("作品已保存并加入展示！");
    setTitle("");
    setShowTitleModal(false);
  }

  function randomTitle(): string {
    const A = ["晨光", "星河", "微雨", "茶香", "青岚", "落霞", "云岫", "松风", "流萤", "海潮", "明月", "山岚", "花影", "霓虹", "月色", "风声"];
    const B = ["之上", "之下", "之间", "之歌", "之梦", "漫步", "回响", "序曲", "剪影", "遐想", "初见", "私语", "涟漪", "彼端", "微光", "印象"];
    const C = ["旅途", "天空", "夏夜", "街角", "故乡", "晨曦", "流年", "旧时", "远方", "花园", "海岸", "林间", "黎明", "黄昏", "庭院", "云端"];
    const parts = [A[Math.floor(Math.random()*A.length)], B[Math.floor(Math.random()*B.length)], C[Math.floor(Math.random()*C.length)]];
    const s = parts.join("");
    return s.slice(0, 16);
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-white">标题</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="rounded px-2 py-1" />
        <label className="text-white">作者</label>
        <input value={authorName} onChange={e => setAuthorName(e.target.value)} className="rounded px-2 py-1" placeholder="可选" />
        <label className="text-white">颜色</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <label className="text-white">不透明度</label>
        <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
        <label className="text-white">填充色</label>
        <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} />
        <label className="text-white">笔刷</label>
        <input type="range" min={2} max={24} value={size} onChange={e => setSize(Number(e.target.value))} />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTool("brush")} className={`px-3 py-1 rounded ${tool === "brush" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>画笔</button>
          <button onClick={() => setTool("eraser")} className={`px-3 py-1 rounded ${tool === "eraser" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>橡皮</button>
          <button onClick={() => setTool("line")} className={`px-3 py-1 rounded ${tool === "line" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>直线</button>
          <button onClick={() => setTool("rect")} className={`px-3 py-1 rounded ${tool === "rect" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>矩形</button>
          <button onClick={() => setTool("circle")} className={`px-3 py-1 rounded ${tool === "circle" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>圆形</button>
          <button onClick={() => setTool("ellipse")} className={`px-3 py-1 rounded ${tool === "ellipse" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>椭圆</button>
          <button onClick={() => setTool("filledRect")} className={`px-3 py-1 rounded ${tool === "filledRect" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>填充矩形</button>
          <button onClick={() => setTool("filledCircle")} className={`px-3 py-1 rounded ${tool === "filledCircle" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>填充圆形</button>
          <button onClick={() => setTool("spray")} className={`px-3 py-1 rounded ${tool === "spray" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>喷枪</button>
          <button onClick={() => setTool("eyedropper")} className={`px-3 py-1 rounded ${tool === "eyedropper" ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>取色</button>
          <button onClick={() => { dashOffsetRef.current = 0; setDash(d => !d); }} className={`px-3 py-1 rounded ${dash ? "bg-white/40 text-zinc-800" : "bg-white/20 text-white hover:bg-white/30"}`}>虚线</button>
          <button onClick={() => {
            const c = canvasRef.current!; const ctx = c.getContext("2d")!;
            if (undoStackRef.current.length) { redoStackRef.current.push(ctx.getImageData(0,0,c.width,c.height)); const prev = undoStackRef.current.pop()!; ctx.putImageData(prev,0,0); }
          }} className="px-3 py-1 rounded bg-white/20 text-white hover:bg-white/30">撤销</button>
          <button onClick={() => {
            const c = canvasRef.current!; const ctx = c.getContext("2d")!;
            if (redoStackRef.current.length) { undoStackRef.current.push(ctx.getImageData(0,0,c.width,c.height)); const next = redoStackRef.current.pop()!; ctx.putImageData(next,0,0); }
          }} className="px-3 py-1 rounded bg-white/20 text-white hover:bg-white/30">重做</button>
          <button onClick={() => { const c = canvasRef.current!; const ctx = c.getContext("2d")!; ctx.clearRect(0, 0, c.width, c.height); dashOffsetRef.current = 0; }} className="px-3 py-1 rounded bg-white/20 text-white hover:bg-white/30">清空</button>
          <button onClick={() => { const c = canvasRef.current!; const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'painting.png'; a.click(); }} className="px-3 py-1 rounded bg-white/20 text-white hover:bg-white/30">下载PNG</button>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-white">文本</label>
          <input value={textContent} onChange={e => setTextContent(e.target.value)} className="rounded px-2 py-1" placeholder="用于文本工具" />
        </div>
        <button onClick={save} className="ml-auto bg-white/20 text-white px-3 py-1 rounded hover:bg-white/30">保存作品</button>
      </div>
      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        className="border border-white/30 rounded bg-white"
        onMouseDown={start}
        onMouseUp={end}
        onMouseLeave={end}
        onMouseMove={draw}
      />
      <p className="text-white/80">在画布上绘制点即可形成图案，点击“保存作品”上传到天空画廊。</p>

      {showTitleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={() => setShowTitleModal(false)}>
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-zinc-800 text-lg font-semibold mb-2">请输入标题</div>
            <div className="text-zinc-500 text-sm mb-3">未填标题时可选择随机标题（最长16字）或自己命名</div>
            <input value={tempTitle} onChange={e => setTempTitle(e.target.value.slice(0,16))} className="w-full rounded border px-2 py-1 mb-3" placeholder="可输入不超过16字" />
            <div className="flex gap-2">
              <button onClick={() => setTempTitle(randomTitle())} className="px-3 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700">随机标题</button>
              <button onClick={() => { const t = (tempTitle || "").trim(); if (!t) { alert("请先输入或选择标题"); return; } performSave(t); }} className="px-3 py-1 rounded bg-zinc-500 text-white hover:bg-zinc-600">确认保存</button>
              <button onClick={() => setShowTitleModal(false)} className="ml-auto px-3 py-1 rounded bg-zinc-300 text-zinc-800 hover:bg-zinc-400">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
