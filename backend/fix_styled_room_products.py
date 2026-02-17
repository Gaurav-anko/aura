"""
Fix styled_room_images.json to use valid product IDs from current products.json
"""

import json
import random
from pathlib import Path

# Load current products
products_path = Path(__file__).parent.parent / "data" / "products.json"
with open(products_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

# Create lookup by category for better matching
products_by_category = {}
for product in products:
    category = product.get('CLASS_DESCRIPTION', 'UNKNOWN')
    if category not in products_by_category:
        products_by_category[category] = []
    products_by_category[category].append(product['variation_id'])

print(f"Loaded {len(products)} products")
print(f"Categories found: {list(products_by_category.keys())[:10]}")

# Load styled rooms
styled_rooms_path = Path(__file__).parent.parent / "data" / "styled_room_images.json"
with open(styled_rooms_path, 'r', encoding='utf-8') as f:
    styled_data = json.load(f)

# Update product IDs for each room
updated_count = 0
all_variation_ids = [p['variation_id'] for p in products]

for room in styled_data['styled_rooms']:
    num_products = len(room['products_included'])
    room_category = room.get('category', '')
    
    # Try to find products from similar category
    category_key = None
    for cat_key in products_by_category.keys():
        if room_category.lower() in cat_key.lower() or cat_key.lower() in room_category.lower():
            category_key = cat_key
            break
    
    # Get product IDs
    if category_key and len(products_by_category[category_key]) >= num_products:
        # Use products from matching category
        new_ids = random.sample(products_by_category[category_key], num_products)
    else:
        # Use random products
        new_ids = random.sample(all_variation_ids, min(num_products, len(all_variation_ids)))
    
    old_ids = room['products_included']
    room['products_included'] = new_ids
    
    if old_ids != new_ids:
        updated_count += 1
        print(f"Updated room {room['id']}: {len(old_ids)} products -> {len(new_ids)} products")

# Save updated file
with open(styled_rooms_path, 'w', encoding='utf-8') as f:
    json.dump(styled_data, f, indent=2, ensure_ascii=False)

print(f"\nUpdated {updated_count} rooms with valid product IDs")
print(f"Saved to: {styled_rooms_path}")
