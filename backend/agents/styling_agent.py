"""
Styling Agent
Uses Google ADK to create styling plans for product compositions.
Updated for new schema with dimensions field and image_url/alt_image_urls.
"""

from typing import Optional
from google.adk.agents import Agent


def get_placement_suggestion(class_desc: str, item_name: str) -> str:
    """Suggest placement for a product based on its category."""
    class_lower = class_desc.lower() if class_desc else ""
    name_lower = item_name.lower() if item_name else ""
    
    if "rug" in class_lower or "rug" in name_lower:
        return "on the floor as the base layer of the room"
    elif "lamp" in class_lower or "lighting" in class_lower:
        return "on a side table or floor, providing ambient lighting"
    elif "sofa" in class_lower or "couch" in name_lower:
        return "as the central seating piece"
    elif "chair" in class_lower:
        return "as accent seating"
    elif "table" in class_lower:
        return "as a functional surface piece"
    elif "plant" in class_lower or "plant" in name_lower:
        return "as a natural accent, on a shelf or floor"
    elif "storage" in class_lower or "basket" in name_lower or "container" in class_lower:
        return "as a stylish storage solution"
    elif "bench" in class_lower or "bench" in name_lower:
        return "at the foot of the bed or against a wall"
    elif "cushion" in class_lower or "pillow" in name_lower:
        return "on the sofa or chair for added comfort"
    elif "throw" in class_lower or "blanket" in name_lower:
        return "draped over seating for texture and warmth"
    elif "vase" in class_lower or "vase" in name_lower:
        return "on a table or shelf as a decorative accent"
    elif "candle" in class_lower:
        return "grouped on a tray or coffee table"
    elif "mirror" in class_lower:
        return "on a wall to add depth and reflect light"
    elif "towel" in class_lower:
        return "folded neatly in a bathroom setting"
    else:
        return "positioned naturally within the room setting"


def create_styling_plan(
    products: list[dict],
    mood: str = "cozy",
    style: str = "modern",
    color_theme: str = "neutral",
    room_type: str = "living room",
    custom_prompt: Optional[str] = None,
) -> dict:
    """
    Create a detailed styling plan for generating a scene with the selected products.
    
    Uses new schema fields:
    - ITEM_NAME: Product name
    - COLOR, SECONDARYCOLOUR: Product colors
    - CLASS_DESCRIPTION: Product category
    - dimensions: Product dimensions string (e.g., "235cm (L) x 160cm (W)")
    - image_url: Primary product image
    - alt_image_urls: Alternate product images
    
    Args:
        products: List of product dictionaries
        mood: Desired mood
        style: Design style
        color_theme: Color palette
        room_type: Type of room for the scene
        custom_prompt: Optional user-provided custom prompt for additional styling details
        
    Returns:
        dict with styling plan including scene description and composition prompt
    """
    # Build detailed product descriptions using new schema
    product_descriptions = []
    product_details = []
    
    for i, product in enumerate(products, 1):
        name = product.get("ITEM_NAME", "Unknown product")
        color = product.get("COLOR", "")
        secondary_color = product.get("SECONDARYCOLOUR", "")
        dimensions = product.get("dimensions", "")
        class_desc = product.get("CLASS_DESCRIPTION", "")
        image_url = product.get("image_url", "")
        alt_image_urls = product.get("alt_image_urls", [])
        
        # Build color description
        color_desc = color
        if secondary_color and secondary_color != color:
            color_desc = f"{color}/{secondary_color}"
        
        # Get placement suggestion
        placement = get_placement_suggestion(class_desc, name)
        
        # Build product detail entry
        product_detail = {
            "index": i,
            "name": name,
            "category": class_desc,
            "color": color_desc,
            "dimensions": dimensions,
            "placement": placement,
            "image_url": image_url,
            "alt_image_count": len(alt_image_urls),
        }
        product_details.append(product_detail)
        
        # Build text description for prompt
        product_descriptions.append(
            f"PRODUCT {i}: {name}\n"
            f"  - Category: {class_desc}\n"
            f"  - Colors: {color_desc}\n"
            f"  - Dimensions: {dimensions if dimensions else 'Standard size'}\n"
            f"  - Placement: {placement}\n"
            f"  - MUST use exact appearance from reference image #{i}"
        )
    
    products_text = "\n\n".join(product_descriptions)
    
    # Build the scene composition prompt with emphasis on using EXACT products
    scene_prompt = f"""Create a photorealistic interior design photograph of a {mood} {style} {room_type}.

=== PRODUCTS TO FEATURE (USE EXACT APPEARANCE FROM REFERENCE IMAGES) ===
{products_text}

=== STYLING DIRECTION ===
- Mood: {mood} atmosphere with appropriate lighting
- Design Style: {style} interior design aesthetic  
- Color Theme: {color_theme} color palette that complements the products
- Room Type: Well-designed {room_type} setting
- Product Count: {len(products)} products MUST all be visible

=== COMPOSITION GUIDELINES ===
1. Layer the products naturally - larger items as anchors, smaller items as accents
2. Create visual balance using the rule of thirds
3. Ensure proper scale relationships between products based on their dimensions
4. Use natural sight lines to draw attention to each product
5. Leave appropriate negative space for a clean, uncluttered look

=== TECHNICAL REQUIREMENTS ===
- Professional interior photography quality (4K resolution feel)
- Soft, natural lighting (daylight from windows or warm ambient)
- Camera angle: slightly elevated, capturing the full scene
- Sharp focus on all products
- Rich colors and textures
- No visible watermarks, logos, or text
- Photorealistic style suitable for e-commerce

    # Append custom prompt if provided
    if custom_prompt and custom_prompt.strip():
        scene_prompt += f"\n\nAdditional requirements:\n{custom_prompt.strip()}"

=== CRITICAL: PRODUCT FIDELITY ===
Each product MUST appear EXACTLY as shown in its reference image:
- Same colors, patterns, and textures
- Same proportions and design details
- Proper scale based on specified dimensions
- All products clearly visible and identifiable"""

    # Build detailed scene description
    product_names = [p.get("ITEM_NAME", "") for p in products]
    scene_description = (
        f"A {mood}, {style} {room_type} with {color_theme} tones featuring {len(products)} products: "
        + ", ".join(product_names)
    )
    
    # Build detailed scene description for reference
    scene_description = f"A {mood}, {style} {room_type} with {color_theme} tones featuring {len(products)} products: " + ", ".join([p.get("ITEM_NAME", "") for p in products])

    return {
        "scene_prompt": scene_prompt,
        "scene_description": scene_description,
        "styling_parameters": {
            "mood": mood,
            "style": style,
            "color_theme": color_theme,
            "room_type": room_type,
        },
        "product_count": len(products),
        "products_included": product_names,
        "product_details": product_details,
    }


def refine_styling_plan(
    previous_plan: dict,
    feedback: str,
) -> dict:
    """
    Refine a styling plan based on user feedback.
    
    Args:
        previous_plan: The previous styling plan dict
        feedback: User's feedback for refinement
        
    Returns:
        dict with updated styling plan incorporating feedback
    """
    # Get the original prompt and append feedback modifications
    original_prompt = previous_plan.get("scene_prompt", "")
    
    refined_prompt = f"""{original_prompt}

Additional requirements based on feedback:
{feedback}

Please incorporate these changes while maintaining the original product placement and style direction."""

    # Update the scene description
    original_description = previous_plan.get("scene_description", "")
    refined_description = f"{original_description} (Refined: {feedback})"

    return {
        "scene_prompt": refined_prompt,
        "scene_description": refined_description,
        "styling_parameters": previous_plan.get("styling_parameters", {}),
        "product_count": previous_plan.get("product_count", 0),
        "products_included": previous_plan.get("products_included", []),
        "feedback_applied": feedback,
        "is_refinement": True,
    }


def get_mood_options() -> dict:
    """
    Get available mood options for styling.
    
    Returns:
        dict with mood options and descriptions
    """
    return {
        "moods": [
            {"value": "cozy", "label": "Cozy", "description": "Warm, inviting, comfortable atmosphere"},
            {"value": "elegant", "label": "Elegant", "description": "Sophisticated, refined, luxurious feel"},
            {"value": "minimalist", "label": "Minimalist", "description": "Clean, simple, uncluttered space"},
            {"value": "vibrant", "label": "Vibrant", "description": "Energetic, colorful, lively ambiance"},
            {"value": "relaxing", "label": "Relaxing", "description": "Calm, peaceful, serene environment"},
        ]
    }


def get_style_options() -> dict:
    """
    Get available design style options.
    
    Returns:
        dict with style options and descriptions
    """
    return {
        "styles": [
            {"value": "modern", "label": "Modern", "description": "Clean lines, contemporary furniture"},
            {"value": "scandinavian", "label": "Scandinavian", "description": "Light, airy, functional Nordic design"},
            {"value": "bohemian", "label": "Bohemian", "description": "Eclectic, artistic, free-spirited"},
            {"value": "industrial", "label": "Industrial", "description": "Raw materials, urban, warehouse-inspired"},
            {"value": "classic", "label": "Classic", "description": "Traditional, timeless, elegant"},
            {"value": "mid-century", "label": "Mid-Century Modern", "description": "Retro 50s-60s inspired design"},
        ]
    }


def get_color_theme_options() -> dict:
    """
    Get available color theme options.
    
    Returns:
        dict with color theme options and descriptions
    """
    return {
        "color_themes": [
            {"value": "neutral", "label": "Neutral", "description": "Whites, beiges, grays"},
            {"value": "warm", "label": "Warm", "description": "Oranges, reds, golden tones"},
            {"value": "cool", "label": "Cool", "description": "Blues, greens, silver tones"},
            {"value": "bold", "label": "Bold", "description": "Strong contrasting colors"},
            {"value": "monochrome", "label": "Monochrome", "description": "Single color with varying shades"},
            {"value": "earthy", "label": "Earthy", "description": "Natural browns, greens, terracotta"},
        ]
    }


def get_room_options() -> dict:
    """
    Get available room type options.
    
    Returns:
        dict with room type options
    """
    return {
        "rooms": [
            {"value": "living room", "label": "Living Room"},
            {"value": "bedroom", "label": "Bedroom"},
            {"value": "dining room", "label": "Dining Room"},
            {"value": "home office", "label": "Home Office"},
            {"value": "entryway", "label": "Entryway"},
            {"value": "reading nook", "label": "Reading Nook"},
        ]
    }


# Create the Styling Agent
styling_agent = Agent(
    name="styling_agent",
    model="gemini-2.0-flash",
    description="Agent that creates detailed styling plans for interior design scenes featuring selected products.",
    instruction="""You are an expert interior designer and stylist for e-commerce product photography.

Your job is to create detailed styling plans that will be used to generate photorealistic images of products in home settings.

Use the tools to:
- create_styling_plan: Generate a comprehensive styling plan for selected products
- refine_styling_plan: Update a plan based on user feedback
- get_mood_options, get_style_options, get_color_theme_options, get_room_options: Show available options

When creating styling plans:
1. Consider how products complement each other
2. Think about realistic placement and scale
3. Optimize for photorealistic e-commerce imagery
4. Ensure all products are prominently featured
5. Create cohesive, aspirational scenes

Your prompts should be detailed enough to generate high-quality lifestyle images suitable for e-commerce product pages.
""",
    tools=[
        create_styling_plan,
        refine_styling_plan,
        get_mood_options,
        get_style_options,
        get_color_theme_options,
        get_room_options,
    ],
)
