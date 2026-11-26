export const photos = {
  hero: "https://images.unsplash.com/photo-1710091691771-96b2e6d17dac",
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
  chicken: "https://images.unsplash.com/photo-1762922425226-8cfe6987e7b0",
  dessert: "https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77",
  interior: "https://images.unsplash.com/photo-1777270695079-2ee60686f60e",
};
export const demoMenu = [
  { id: "paneer", name: "Paneer Butter Masala", category: "Mains", price: 289, veg: true, description: "Silky tomato and cashew gravy, fresh paneer, finished with cream.", image: photos.paneer },
  { id: "chicken", name: "Chicken Tikka Masala", category: "Mains", price: 349, veg: false, description: "Tandoor-style chicken, fragrant spices and a rich tomato sauce.", image: photos.chicken },
  { id: "jamun", name: "Gulab Jamun", category: "Desserts", price: 119, veg: true, description: "Warm milk dumplings soaked in aromatic cardamom syrup.", image: photos.dessert },
  { id: "tikka", name: "Achari Paneer Tikka", category: "Starters", price: 249, veg: true, description: "Marinated paneer, charred peppers and mint chutney." },
  { id: "dal", name: "Slow-cooked Dal Makhani", category: "Mains", price: 249, veg: true, description: "Black lentils simmered with butter and warming spices." },
  { id: "biryani", name: "Royal Vegetable Biryani", category: "Rice & Breads", price: 269, veg: true, description: "Fragrant basmati, seasonal vegetables and saffron." },
  { id: "naan", name: "Butter Naan", category: "Rice & Breads", price: 69, veg: true, description: "Tandoor-baked bread brushed with butter." },
  { id: "lassi", name: "Kesar Lassi", category: "Drinks", price: 139, veg: true, description: "Chilled yogurt with saffron and a hint of cardamom." },
  { id: "kebab", name: "Chicken Seekh Kebab", category: "Starters", price: 299, veg: false, description: "Minced chicken, herbs and roasted spices." },
  { id: "phirni", name: "Rose Phirni", category: "Desserts", price: 149, veg: true, description: "Creamy rice pudding with a delicate rose finish." },
] as const;
export type Dish = {id:string;name:string;category:string;price:number;veg:boolean;description:string;image?:string;available?:boolean};
