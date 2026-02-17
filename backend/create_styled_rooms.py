"""
Generate styled_room_images.json directly from products
"""
import json
from pathlib import Path
from collections import defaultdict

# Map categories to room types  
CATEGORY_TO_ROOM = {
    # Bathroom
    "Bathroom Storage": "Bathroom",
    "Bathroom Cabinets and Shelves": "Bathroom",
    "Bath Mats": "Bathroom",
    "Bath Towels": "Bathroom",
    "Bath Sheets": "Bathroom",
    "Bathroom Trolleys": "Bathroom",
    "Bathroom Accessories": "Bathroom",
    "Bathroom Mirrors": "Bathroom",
    
    # Bedroom
    "Mattress Protectors": "Bedroom",
    "Quilt Cover Sets": "Bedroom",
    "Sheet Sets": "Bedroom",
    "Pillows": "Bedroom",
    "Bed Mattresses": "Bedroom",
    "Bedside Tables": "Bedroom",
    "Coverlets & Comforters": "Bedroom",
    "Bedside Table Lamps": "Bedroom",
    "Bedroom Furniture": "Bedroom",
    "Blankets & Throws": "Bedroom",
    "Bed Frames & Bedheads": "Bedroom",
    "Quilts": "Bedroom",
    "Bedroom Storage": "Bedroom",
    
    # Kitchen
    "Food Storage Containers": "Kitchen",
    "Kitchen Gadgets": "Kitchen",
    "Pantry Storage": "Kitchen",
    "Toasters": "Kitchen",
    "Air Fryers": "Kitchen",
    
    # Living Room
    "Rugs": "Living Room",
    "Coffee Tables": "Living Room",
    "Entertainment Units": "Living Room",
    "Floor Lamps": "Living Room",
    "Living Room Furniture": "Living Room",
    
    # Dining Room
    "Glassware": "Dining Room",
    "Placemats & Coasters": "Dining Room",
    "Dining Chairs": "Dining Room",
    "Dining Tables": "Dining Room",
    
    # Outdoor
    "Pots & Planters": "Outdoor",
    "Outdoor Dining": "Outdoor",
    
    # Decor
    "Artificial Plants & Flowers": "Decor",
    "Home Decor Accessories": "Decor",
    "Vases": "Decor",
    "Clocks": "Decor",
    
    # Kids Room
    "Kids Storage": "Kids Room",
}

# Curated room image URLs
ROOM_IMAGES = {
    "Bathroom": {
        "Clear": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "White": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Grey": "https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Blue": "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Green": "https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Brown": "https://images.pexels.com/photos/1358912/pexels-photo-1358912.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Black": "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Bedroom": {
        "White": "https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Green": "https://images.pexels.com/photos/6969837/pexels-photo-6969837.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Blue": "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Grey": "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Beige": "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Brown": "https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Pink": "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Multi": "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Black": "https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Red": "https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Purple": "https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Yellow": "https://images.pexels.com/photos/1034584/pexels-photo-1034584.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Kitchen": {
        "Clear": "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "White": "https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Black": "https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Silver": "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Brown": "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Grey": "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Green": "https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Blue": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Living Room": {
        "Beige": "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Grey": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "White": "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Multi": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Brown": "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Blue": "https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Black": "https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Gold": "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Dining Room": {
        "Clear": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Black": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Brown": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "White": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Green": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Blue": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Beige": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Outdoor": {
        "Multi": "https://images.pexels.com/photos/1334605/pexels-photo-1334605.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "White": "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Black": "https://images.pexels.com/photos/1334605/pexels-photo-1334605.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Grey": "https://images.pexels.com/photos/1334605/pexels-photo-1334605.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Decor": {
        "Multi": "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "White": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600",
        "Green": "https://images.pexels.com/photos/1648771/pexels-photo-1 648771.jpeg?auto=compress&cs=tinysrgb&w=1600"
    },
    "Kids Room": {
        "N/A": "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1600"
    }
}

DEFAULT_ROOM_IMAGES = {
    "Bathroom": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Bedroom": "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Kitchen": "https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Living Room": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Dining Room": "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Outdoor": "https://images.pexels.com/photos/1334605/pexels-photo-1334605.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Decor": "https://images.pexels.com/photos/1648771/pexels-photo-1648771.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "Kids Room": "https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=1600"
}

def get_image_url(room_type, color):
    """Get appropriate image URL for room and color"""
    if room_type in ROOM_IMAGES:
        if color in ROOM_IMAGES[room_type]:
            return ROOM_IMAGES[room_type][color]
        # Default to White if available
        if "White" in ROOM_IMAGES[room_type]:
            return ROOM_IMAGES[room_type]["White"]
    return DEFAULT_ROOM_IMAGES.get(room_type, DEFAULT_ROOM_IMAGES["Living Room"])

# Load products
data_dir = Path(__file__).parent.parent / "data"
with open(data_dir / "products.json", "r") as f:
    products = json.load(f)

# Group by category-color-roomtype
combinations = defaultdict(int)
for product in products:
    category = product.get("CLASS_DESCRIPTION")
    color = product.get("COLOR")
    
    if category and color and category in CATEGORY_TO_ROOM:
        room_type = CATEGORY_TO_ROOM[category]
        key = f"{room_type}|{category}|{color}"
        combinations[key] += 1

# Create styled rooms  
styled_rooms = []
for combo_key, count in combinations.items():
    room_type, category, color = combo_key.split("|")
    
    styled_rooms.append({
        "room_type": room_type,
        "category": category,
        "color": color,
        "styled_image_url": get_image_url(room_type, color),
        "products_count": count
    })

# Sort by room type, then by product count
styled_rooms.sort(key=lambda x: (x["room_type"], -x["products_count"]))

output = {
    "total_styled_images": len(styled_rooms),
    "styled_rooms": styled_rooms
}

# Save to file
with open(data_dir / "styled_room_images.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"✅ Created styled_room_images.json with {len(styled_rooms)} entries")
print(f"📁 Saved to: {data_dir / 'styled_room_images.json'}")
print(f"\nRoom distribution:")
room_counts = {}
for room in styled_rooms:
    rt = room["room_type"]
    room_counts[rt] = room_counts.get(rt, 0) + 1

for room_type, count in sorted(room_counts.items()):
    print(f"  {room_type}: {count} combinations")
