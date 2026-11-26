"use client";
import {useState,useEffect,useRef} from "react";
export function Elapsed({createdAt}:{createdAt:number}){const [minutes,setMinutes]=useState<number|null>(null);useEffect(()=>{const tick=()=>setMinutes(Math.max(0,Math.floor((Date.now()-createdAt)/60000)));const first=setTimeout(tick,0),timer=setInterval(tick,15000);return()=>{clearTimeout(first);clearInterval(timer)}},[createdAt]);return <span className="muted small">{minutes===null?"":minutes+" min elapsed"}</span>}
export default function KitchenAlerts({orderIds}:{orderIds:string[]}){const [enabled,setEnabled]=useState(false),[error,setError]=useState(""),ctx=useRef<AudioContext|null>(null),seen=useRef(new Set(orderIds));
 async function toggle(){if(enabled){setEnabled(false);return}try{ctx.current??=new AudioContext();await ctx.current.resume();setEnabled(true);setError("")}catch{setError("Audio unavailable on this device.")}}
 useEffect(()=>{const incoming=orderIds.some(id=>!seen.current.has(id));seen.current=new Set(orderIds);if(!incoming||!enabled||!ctx.current)return;try{const c=ctx.current,osc=c.createOscillator(),gain=c.createGain();osc.frequency.value=660;gain.gain.setValueAtTime(.12,c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+.35);osc.connect(gain);gain.connect(c.destination);osc.start();osc.stop(c.currentTime+.36)}catch{}},[orderIds,enabled]);
 useEffect(()=>()=>{void ctx.current?.close()},[]);
 return <div className="actions"><button className="btn outline" aria-pressed={enabled} onClick={toggle}>{enabled?"Mute new order alerts":"Enable new order sound"}</button><span className="muted small">{error||"Sound plays only after you enable it."}</span></div>
}
