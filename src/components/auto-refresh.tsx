"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
export default function AutoRefresh(){const router=useRouter();useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState==="visible")router.refresh()},5000);return()=>clearInterval(timer)},[router]);return <p className="muted small">Updates every 5 seconds while visible.</p>}
