import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"The Royal Table — Shuvi 360",short_name:"Royal Table",description:"Fictional restaurant ordering showcase",start_url:"/app",scope:"/",display:"standalone",background_color:"#171512",theme_color:"#171512",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]}}
