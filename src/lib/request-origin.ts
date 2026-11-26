// Compare the browser origin with the actual Host, not Next's internal bind address.
export function sameOrigin(req:Request){
 const origin=req.headers.get("origin"),host=req.headers.get("host");
 if(!origin||!host)return false;
 try{const u=new URL(origin);if(!["https:","http:"].includes(u.protocol)||u.username||u.password)return false;
 const expected=process.env.APP_URL?new URL(process.env.APP_URL):null;
 if(expected&&expected.hostname!=="localhost")return u.origin===expected.origin&&u.host===host;
 return u.host===host&&(u.protocol==="https:"||["localhost","127.0.0.1","[::1]"].includes(u.hostname));
 }catch{return false}
}
