"""
Image Generation Agent
Uses Google ADK with Gemini to generate styled images featuring multiple products.
"""

import base64
import os
from typing import Optional, Literal
from google.adk.agents import Agent
from google import genai
from google.genai import types


def get_genai_client():
    """Initialize the Google Gen AI client for Vertex AI."""
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    
    return genai.Client(
        vertexai=True,
        project=project_id,
        location=location,
    )


def generate_styled_image(
    scene_prompt: str,
    product_images: list[bytes],
    model_quality: Literal["fast", "high"] = "fast",
    aspect_ratio: str = "16:9",
) -> dict:
    """
    Generate a styled image featuring all provided products using Gemini.
    
    Args:
        scene_prompt: Detailed prompt describing the scene composition
        product_images: List of product image bytes to include in the scene
        model_quality: "fast" for gemini-2.0-flash-preview-image-generation or "high" for gemini-2.0-flash-exp
        aspect_ratio: Image aspect ratio (16:9, 4:3, 1:1, 9:16)
        
    Returns:
        dict with generated image as base64 and metadata
    """
    client = get_genai_client()
    
    # Select model based on quality preference
    # Using available Gemini models with image generation capability
    if model_quality == "high":
        model_name = "gemini-2.0-flash-exp"
    else:
        model_name = "gemini-2.0-flash-preview-image-generation"
    
    # Build the content parts: product images + prompt
    content_parts = []
    
    # Add product images as input
    for i, img_bytes in enumerate(product_images):
        content_parts.append(
            types.Part.from_bytes(
                data=img_bytes,
                mime_type="image/jpeg",
            )
        )
    
    # Add the scene prompt
    content_parts.append(scene_prompt)
    
    try:
        # Generate the image
        response = client.models.generate_content(
            model=model_name,
            contents=content_parts,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        
        # Extract the generated image
        image_base64 = None
        response_text = None
        
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_base64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                elif hasattr(part, 'text') and part.text:
                    response_text = part.text
        
        if image_base64:
            return {
                "success": True,
                "image_base64": image_base64,
                "model_used": model_name,
                "prompt_used": scene_prompt,
                "product_count": len(product_images),
                "response_text": response_text,
            }
        else:
            return {
                "success": False,
                "error": "No image generated in response",
                "response_text": response_text,
                "model_used": model_name,
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "model_used": model_name,
        }


def generate_image_text_only(
    scene_prompt: str,
    product_descriptions: list[str],
    model_quality: Literal["fast", "high"] = "fast",
) -> dict:
    """
    Generate a styled image using only text descriptions (fallback when images unavailable).
    
    Args:
        scene_prompt: Detailed prompt describing the scene
        product_descriptions: List of product description strings
        model_quality: "fast" or "high" quality model
        
    Returns:
        dict with generated image as base64 and metadata
    """
    client = get_genai_client()
    
    if model_quality == "high":
        model_name = "gemini-2.0-flash-exp"
    else:
        model_name = "gemini-2.0-flash-preview-image-generation"
    
    # Enhance prompt with product descriptions
    products_text = "\n".join([f"- {desc}" for desc in product_descriptions])
    full_prompt = f"""{scene_prompt}

Products to feature in the image:
{products_text}

Generate a photorealistic interior design image featuring all these products."""

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[full_prompt],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        
        image_base64 = None
        response_text = None
        
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_base64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                elif hasattr(part, 'text') and part.text:
                    response_text = part.text
        
        if image_base64:
            return {
                "success": True,
                "image_base64": image_base64,
                "model_used": model_name,
                "prompt_used": full_prompt,
                "generation_mode": "text_only",
                "response_text": response_text,
            }
        else:
            return {
                "success": False,
                "error": "No image generated in response",
                "response_text": response_text,
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# Create the Image Generation Agent
image_agent = Agent(
    name="image_agent",
    model="gemini-2.0-flash",
    description="Agent that generates photorealistic styled images featuring multiple home products using Gemini's image generation capabilities.",
    instruction="""You are an AI image generation specialist for e-commerce product styling.

Your job is to generate high-quality, photorealistic images of home products in styled settings.

Use the tools to:
- generate_styled_image: Generate an image using product reference images + scene prompt
- generate_image_text_only: Generate an image using only text descriptions (fallback)

When generating images:
1. Ensure all products are visible and properly scaled
2. Create realistic interior photography quality
3. Use appropriate lighting for the mood
4. Compose products in a natural, styled arrangement
5. Aim for e-commerce lifestyle photography quality

The generated images should look like professional interior design photographs suitable for product marketing.
""",
    tools=[
        generate_styled_image,
        generate_image_text_only,
    ],
)
