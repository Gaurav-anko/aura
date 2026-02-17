"""
Styling Agent
Uses Google ADK to create styling plans for product compositions.
"""

from typing import Optional
from google.adk.agents import Agent


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
    
    Args:
        products: List of product dictionaries with ITEM_NAME, DETAILED_DESCRIPTION, COLOR
        mood: Desired mood (cozy, elegant, minimalist, vibrant, relaxing)
        style: Design style (modern, scandinavian, bohemian, industrial, classic)
        color_theme: Color palette (neutral, warm, cool, bold, monochrome)
        room_type: Type of room for the scene (living room, bedroom, dining room, office)
        custom_prompt: Optional user-provided custom prompt for additional styling details
        
    Returns:
        dict with styling plan including scene description and composition prompt
    """
    # Extract product details for the prompt
    product_descriptions = []
    for i, product in enumerate(products, 1):
        name = product.get("ITEM_NAME", "Unknown product")
        desc = product.get("DETAILED_DESCRIPTION", "")
        color = product.get("COLOR", "")
        product_descriptions.append(f"{i}. {name} ({color}): {desc}")
    
    products_text = "\n".join(product_descriptions)
    
    # Build the scene composition prompt
    scene_prompt = f"""Create a photorealistic interior design photograph of a {mood} {style} {room_type} featuring ALL of the following products naturally arranged together:

{products_text}

Style guidelines:
- Mood: {mood} atmosphere with appropriate lighting
- Design style: {style} interior design aesthetic
- Color theme: {color_theme} color palette
- Room: Well-designed {room_type} setting

Technical requirements:
- Professional interior photography quality
- Natural, realistic lighting (soft daylight or warm ambient)
- Products should be clearly visible and properly scaled
- High-end lifestyle photography suitable for e-commerce
- 4K quality, sharp focus, proper composition
- Products arranged in a cohesive, styled scene"""

    # Append custom prompt if provided
    if custom_prompt and custom_prompt.strip():
        scene_prompt += f"\n\nAdditional requirements:\n{custom_prompt.strip()}"

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
        "products_included": [p.get("ITEM_NAME") for p in products],
    }


def refine_styling_plan(
    previous_plan: dict,
    feedback: str,
) -> dict:
    """
    Refine a styling plan based on user feedback.
    
    Args:
        previous_plan: The previous styling plan dict
        feedback: User's feedback for refinement (e.g., "make it brighter", "add more plants")
        
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
