"use client";
import {useSyncExternalStore} from "react";
import Link from "next/link";
const subscribe=(callback:()=>void)=>{window.addEventListener("storage",callback);return()=>window.removeEventListener("storage",callback)};
function snapshot(){try{return sessionStorage.getItem("royal-orders")??"[]"}catch{return "[]"}}
export default function OrderHistory(){const raw=useSyncExternalStore(subscribe,snapshot,()=>"[]");let tokens:string[]=[];try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))tokens=parsed.filter((x:unknown)=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x)).slice(0,20)}catch{}return <div className="booking-card"><p className="muted">Private tracking links saved in this browser tab session only. No customer account is required.</p>{tokens.length?tokens.map((t,i)=><p key={t}><Link className="text-link" href={"/track/"+t}>Demo order {i+1} · Open tracking →</Link></p>):<p>No saved orders in this session.</p>}<Link href="/app" className="btn gold">Browse menu</Link></div>}
