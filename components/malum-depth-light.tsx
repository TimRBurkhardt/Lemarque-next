"use client";

import { useEffect, useRef } from "react";
import { campaignAsset, hasHybridLight, hasCleanLeftRim } from "@/lib/malum-campaign";

const vertex = `attribute vec2 position;
varying vec2 uv;
void main(){uv=vec2(position.x*.5+.5,.5-position.y*.5);gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;
varying vec2 uv;
uniform sampler2D depthMap;
uniform sampler2D subject;
uniform sampler2D normalMap;
uniform vec2 texel;
uniform vec2 light;
uniform float strength;
float maskAt(vec2 p){return texture2D(depthMap,p).b;}
void main(){
 float matte=maskAt(uv);
 float a=smoothstep(.65,.98,matte)*texture2D(subject,uv).a;
 if(a<.01){gl_FragColor=vec4(0.);return;}
 vec2 stepUV=texel*5.;
 float l=maskAt(uv-vec2(stepUV.x,0.)),r=maskAt(uv+vec2(stepUV.x,0.));
 float t=maskAt(uv-vec2(0.,stepUV.y)),b=maskAt(uv+vec2(0.,stepUV.y));
 float edge=(1.-matte)*3.*a;
 vec2 outward=vec2(l-r,t-b);
 vec2 delta=(light-uv)*vec2(1.6,1.);
 vec3 L=normalize(vec3(delta,.22));
 float facing=max(0.,dot(outward/max(length(outward),.025),delta/max(length(delta),.06)));
 // Offline normals are smoothed inside the subject, with confidence near boundaries.
 vec3 normalSample=texture2D(normalMap,uv).rgb;
 vec2 normalXY=normalSample.rg*2.-1.;
 vec3 N=normalize(vec3(normalXY,sqrt(max(.001,1.-dot(normalXY,normalXY)))));
 float surface=max(0.,dot(N,L)-N.z*L.z)*normalSample.b;
 float falloff=exp(-dot(delta,delta)*9.);
 float highlight=(edge*(.02+.85*facing)+surface*.8*a)*falloff*strength;
 gl_FragColor=vec4(.78,.88,1.,min(.68,highlight));
}`;

// Turn views use their exact full-resolution alpha contour, avoiding borrowed depth edges.
const silhouetteFragment = `precision highp float;
varying vec2 uv;
uniform sampler2D subject;
uniform vec2 texel;
uniform vec2 light;
uniform float strength;
float alphaAt(vec2 p){return texture2D(subject,p).a;}
void main(){
 float a=alphaAt(uv);
 if(a<.02){gl_FragColor=vec4(0.);return;}
 vec2 d=texel*2.;
 float l=alphaAt(uv-vec2(d.x,0.)),r=alphaAt(uv+vec2(d.x,0.));
 float t=alphaAt(uv-vec2(0.,d.y)),b=alphaAt(uv+vec2(0.,d.y));
 vec2 outward=vec2(l-r,t-b);
 vec2 delta=(light-uv)*vec2(1.6,1.);
 float facing=max(0.,dot(outward/max(length(outward),.001),delta/max(length(delta),.001)));
 float edge=max(0.,a-min(min(l,r),min(t,b)));
 float falloff=exp(-dot(delta,delta)*7.);
 float highlight=edge*facing*falloff*strength;
 gl_FragColor=vec4(.78,.88,1.,min(.28,highlight));
}`;

// Hybrid looks share the approved D tuning; Bomber keeps its original shader.
const hybridFragment = fragment
  .replace("uniform sampler2D subject;", "uniform sampler2D subject;\nuniform sampler2D rimNormal;")
  .replace("float facing=", "vec2 depthDirection=texture2D(rimNormal,uv).rg*2.-1.;\n outward=mix(outward/max(length(outward),.025),depthDirection,.3);\n float facing=")
  .replace("surface*.8*a", "surface*.24*a")
  .replace("min(.68,highlight)", "min(.32,highlight)");

/** Estimated depth normals + an aligned silhouette; renders only on pointer changes. */
export function MalumDepthLight({ id, active, className, subjectSrc }: { id: string; active: boolean; className: string; subjectSrc?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active) return;
    const media = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!media.matches) return;
    const hybrid = hasHybridLight(id);
    const cleanLeft = hasCleanLeftRim(id);
    // Anchor the coat and bomber left rim to alpha, not the blurred depth matte.
    // The approved coat tuning and all other looks remain unchanged.
    const selectedFragment = id === "bomber-passage"
      ? fragment
          .replace("surface*.8*a", "surface*mix(.24,.8,smoothstep(.29,.32,uv.x))*a")
          .replace("falloff*strength;", "falloff*strength*mix(.4074074,1.,smoothstep(.29,.32,uv.x));")
      : (hybrid ? hybridFragment : fragment);
    const leftBoundary = id === "bomber-passage" ? ".303" : ".34";
    const leftCorrectedFragment = cleanLeft ? selectedFragment
      // The blurred matte previously moved the highlight several pixels inward.
      // Use the actual alpha edge for the left silhouette (1.5 source pixels).
      .replace("float a=smoothstep(.65,.98,matte)*texture2D(subject,uv).a;",
        "float subjectAlpha=texture2D(subject,uv).a;\n float a=uv.x<.34 ? subjectAlpha : smoothstep(.65,.98,matte)*subjectAlpha;")
      .replace("float facing=",
        "if (uv.x<.34) {\n float leftAlpha=texture2D(subject,uv-vec2(texel.x*1.5,0.)).a;\n edge=max(0.,a-leftAlpha)*.9;\n outward=vec2(l-r,t-b);\n }\n float facing=")
      // Keep the broad Marigold form light away from this narrow contour strip.
      .replace("float falloff=",
        "if (uv.x<.34) surface*=smoothstep(.96,1.,texture2D(subject,uv-vec2(texel.x*12.,0.)).a);\n float falloff=")
      .replaceAll("uv.x<.34", `uv.x<${leftBoundary}`)
      : selectedFragment;
    // Bomber right: narrow alpha-based rim, with restrained matte form shading.
    // The blend starts to the right of the previously approved left half.
    const rightCorrectedFragment = id === "bomber-passage" ? leftCorrectedFragment
      .replace("float a=uv.x<.303 ? subjectAlpha : smoothstep(.65,.98,matte)*subjectAlpha;",
        "float a=subjectAlpha;")
      .replace("float facing=",
        "if (uv.x>=.303) {\n float rightAlpha=texture2D(subject,uv+vec2(texel.x*1.5,0.)).a;\n edge=max(0.,a-rightAlpha)*.9;\n outward=vec2(l-r,t-b);\n }\n float facing=")
      .replace("float falloff=",
        "if (uv.x>=.303) surface*=smoothstep(.96,1.,texture2D(subject,uv+vec2(texel.x*12.,0.)).a);\n surface*=mix(1.,.2,smoothstep(.303,.33,uv.x));\n float falloff=")
      .replace("min(.68,highlight)",
        "min(.68,highlight*mix(1.,.4,smoothstep(.303,.33,uv.x)))")
      : leftCorrectedFragment;
    // Suppress the isolated crown highlight on the coat; leave the torso untouched.
    const lightFragment = id === "otodus-shelter" ? rightCorrectedFragment.replace("float falloff=",
      "float crown=1.-smoothstep(.07,.15,uv.y);\n float headLeft=1.-smoothstep(.325,.34,uv.x);\n surface*=1.-crown*headLeft;\n edge*=1.-.8*crown*headLeft;\n float falloff=") : rightCorrectedFragment;
    const target = canvas.closest("section");
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl || !target) return;
    let disposed = false, ready = false, frame = 0;
    let current = 0, desired = 0;
    let x = 0.5, y = 0.5, targetX = x, targetY = y;
    let lastTime = 0;
    const shaders: WebGLShader[] = [];
    const textures: WebGLTexture[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
      return shader;
    };
    const program = gl.createProgram()!;
    const buffer = gl.createBuffer();
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, subjectSrc ? silhouetteFragment : lightFragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Depth light link failed");
    } catch (error) {
      console.warn("MALUM depth light unavailable", error);
      shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); gl.deleteBuffer(buffer);
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const lightUniform = gl.getUniformLocation(program, "light");
    const strengthUniform = gl.getUniformLocation(program, "strength");
    const draw = (time: number) => {
      frame = 0;
      if (disposed || !ready) return;
      const dt = lastTime ? Math.min(time-lastTime,50) : 16;
      lastTime=time;
      const ease=1-Math.exp(-dt/65);
      current += (desired-current)*ease;
      x += (targetX-x)*ease; y += (targetY-y)*ease;
      gl.uniform2f(lightUniform,x,y); gl.uniform1f(strengthUniform,current);
      gl.drawArrays(gl.TRIANGLES,0,6);
      if (Math.abs(current-desired)>.002 || Math.hypot(targetX-x,targetY-y)>.0002) frame=requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame && ready) frame=requestAnimationFrame(draw); };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === "touch") return;
      const rect=canvas.getBoundingClientRect();
      targetX=(event.clientX-rect.left)/rect.width; targetY=(event.clientY-rect.top)/rect.height;
      if (current<.01) { x=targetX; y=targetY; }
      desired=subjectSrc ? .7 : hybrid ? .55 : 1.35; schedule();
    };
    const leave = () => { desired=0; schedule(); };
    const preference = () => { if (!media.matches) leave(); };
    target.addEventListener("pointermove",move);
    target.addEventListener("pointerleave",leave);
    media.addEventListener("change",preference);
    const load = async (src: string, unit: number, name: string) => {
      const image = new window.Image(); image.src=src; await image.decode();
      if (disposed) return;
      const texture=gl.createTexture()!; textures.push(texture);
      gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      gl.uniform1i(gl.getUniformLocation(program,name),unit);
      if(unit===0){
        canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.uniform2f(gl.getUniformLocation(program,"texel"),1/canvas.width,1/canvas.height);
      }
    };
    void Promise.all(subjectSrc ? [load(subjectSrc,0,"subject")] : [
      load(id === "latex" ? "/collections/malum/hero/interactive/latex-hair-clean-packed.png" : cleanLeft ? `/collections/malum/hero/interactive/${id}-left-clean-packed.png` : hybrid ? `/collections/malum/hero/interactive/${id}-hybrid-packed.png?v=4` : `/collections/malum/hero/interactive/${id}-depth-packed.png?v=3`,0,"depthMap"),
      load(campaignAsset(id,"subject"),1,"subject"),
      load(cleanLeft ? `/collections/malum/hero/interactive/${id}-left-clean-normal.png` : `/collections/malum/hero/interactive/${id}-${hybrid ? "hybrid-normal" : "normals"}.png${hybrid ? "?v=4" : ""}`,2,"normalMap"),
      ...(hybrid ? [load(`/collections/malum/hero/interactive/${id}-hybrid-depth-normal.png?v=4`,3,"rimNormal")] : []),
    ]).then(()=>{if(!disposed){ready=true;canvas.dataset.ready="true";schedule();}})
      .catch(error=>{if(!disposed) console.warn("MALUM depth texture unavailable",error);});
    return () => {
      disposed=true; cancelAnimationFrame(frame);
      target.removeEventListener("pointermove",move); target.removeEventListener("pointerleave",leave);
      media.removeEventListener("change",preference);
      gl.clear(gl.COLOR_BUFFER_BIT);
      textures.forEach(t=>gl.deleteTexture(t)); shaders.forEach(s=>gl.deleteShader(s));
      gl.deleteBuffer(buffer); gl.deleteProgram(program); delete canvas.dataset.ready;
    };
  }, [id, active, subjectSrc]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
