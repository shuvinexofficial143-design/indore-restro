"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { DishCard } from "@/components/site";
import { demoMenu,type Dish } from "@/lib/demo-menu";
export default function MenuExplorer({dishes=demoMenu}:{dishes?:readonly Dish[]}){
 const categories=["All",...new Set(dishes.map(d=>d.category))];
 const [category,setCategory]=useState("All"),[query,setQuery]=useState(""),[veg,setVeg]=useState(false);
 const visible=dishes.filter(d=>(category==="All"||d.category===category)&&(!veg||d.veg)&&(d.name+" "+d.description).toLowerCase().includes(query.trim().toLowerCase()));
 return <><div className="menu-controls"><label className="search"><Search size={20}/><input placeholder="Search dishes…" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search dishes"/></label><label className="veg-filter"><input type="checkbox" checked={veg} onChange={e=>setVeg(e.target.checked)}/> Vegetarian only</label></div><div className="chips" aria-label="Menu categories">{categories.map(c=><button type="button" key={c} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><p role="status" className="muted small">{visible.length} sample dishes</p>{visible.length?<div className="dish-grid">{visible.map(d=><DishCard key={d.id} dish={d}/>)}</div>:<div className="empty"><h2>No dishes found</h2><p>Try a different search or category.</p><button className="btn outline" onClick={()=>{setCategory("All");setQuery("");setVeg(false)}}>Reset filters</button></div>}</>
}
